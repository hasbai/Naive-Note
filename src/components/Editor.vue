<template>
  <div :id="path" class="tab-content" @keydown.ctrl.s.prevent="save"></div>
</template>

<script>
import Vditor from 'vditor'
import 'vditor/dist/index.css'
import { useMessage, useDialog, useLoadingBar } from 'naive-ui'
export default {
  name: 'Editor',
  props: { path: String },
  data() {
    return {
      editor: undefined,
      remoteContent: undefined,
      unsaved: false,
    }
  },
  computed: {
    client() {
      return this.$store.getters.client
    },
  },
  methods: {
    onUpdate() {
      if (this.unsaved) {
        this.dialog.warning({
          title: '更改未保存',
          content: '继续操作可能会丢失本地已修改的内容，你确定？',
          positiveText: '继续',
          negativeText: '取消',
          onPositiveClick: () => {
            this.updateContent()
          },
          onNegativeClick: () => {
            // pass
          },
        })
      } else {
        this.updateContent()
      }
    },
    async updateContent() {
      try {
        this.loadingBar.start()
        const content = await this.client.getFileContents(this.path, {
          format: 'text',
        })
        this.loadingBar.finish()
        this.editor.setValue(content)
        this.remoteContent = content
      } catch (e) {
        console.log(e)
        this.loadingBar.error()
        this.message.error('文件加载失败' + e)
      }
    },

    async save() {
      this.loadingBar.start()
      const content = this.editor.getValue()
      const result = await this.client.putFileContents(this.path, content, {
        contentLength: false,
      })
      if (result === true) {
        this.loadingBar.finish()
        this.remoteContent = content
      } else {
        this.loadingBar.error()
        this.message.error('保存失败')
      }
    },
  },
  watch: {
    unsaved() {
      this.$store.commit('modifyUnsavedFiles', {
        key: this.path,
        method: this.unsaved ? 'add' : 'delete',
      })
    },
  },
  mounted() {
    this.editor = new Vditor(this.path, {
      height: '100%',
      placeholder: '写些什么......',
      mode: 'ir',
      toolbarConfig: {
        pin: false,
      },
      toolbar: [
        'headings',
        'bold',
        'italic',
        'strike',
        '|',
        'line',
        'quote',
        'list',
        'code',
        '|',
        'link',
        'upload',
        {
          name: 'more',
          toolbar: ['export', 'outline', 'preview', 'devtools', 'info', 'help'],
        },
      ],
      icon: 'ant',
      cache: {
        enable: true,
      },
      counter: {
        enable: true,
      },
      hint: {
        // emoji: {}
      },
      upload: {
        accept: 'image/*',
        url: 'https://www.fduhole.tk/api/images/',
        headers: { Authorization: localStorage.getItem('token') },
        multiple: false,
        fieldName: 'img',
        linkToImgCallback() {
          // api处理
        },
        success: (editor, response) => {
          let url = JSON.parse(response).url
          this.editor.insertValue(`![](${url})`)
          return true
        },
        error: (response) => {
          console.log(response)
          this.$emit('error', response)
        },
      },
      // after: this.onUpdate,
    })
  },
  created() {
    this.message = useMessage()
    this.dialog = useDialog()
    this.loadingBar = useLoadingBar()
    this.onUpdate()
    setInterval(() => {
      // 加载完后再判断
      if (this.remoteContent !== undefined) {
        this.unsaved = this.remoteContent !== this.editor.getValue()
      }
    }, 250)
  },
}
</script>

<style scoped>
.tab-content {
  overflow-y: auto;
  flex: 1;
}
</style>
