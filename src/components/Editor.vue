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
      imageUploadConfig: JSON.parse(localStorage.getItem('vuex'))
        .imageUploadConfig,
      imageUploadConfigDefault: {
        url: '/proxy/imgurl.org/api/upload',
        max: 5 * 1024 * 1024,
        headers: {},
        fieldName: 'file',
        urlFieldPath: ['url'],
        accept: 'image/*',
        multiple: false,
        success: (editor, response) => {
          let urlFieldPath
          try {
            urlFieldPath = this.imageUploadConfig.urlFieldPath
          } catch {
            urlFieldPath = this.imageUploadConfigDefault.urlFieldPath
          }
          let url = JSON.parse(response)
          for (let i = 0; i < urlFieldPath.length; i++) {
            url = url[urlFieldPath[i]]
          }
          this.editor.insertValue(`![](${url})`)
          return true
        },
        error: (response) => {
          console.log(response)
          this.message.error(JSON.parse(response))
        },
      },
      message: useMessage(),
      dialog: useDialog(),
      loadingBar: useLoadingBar(),
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
          content: '继续操作可能会丢失本地已编辑的内容，你确定？',
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
        this.message.success('保存成功')
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
        'ordered-list',
        'check',
        '|',
        'code',
        'table',
        'link',
        'upload',
        '|',
        {
          name: 'config',
          tip: '设置',
          tipPosition: 'n',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1024 1024"><path d="M924.8 625.7l-65.5-56c3.1-19 4.7-38.4 4.7-57.8s-1.6-38.8-4.7-57.8l65.5-56a32.03 32.03 0 0 0 9.3-35.2l-.9-2.6a443.74 443.74 0 0 0-79.7-137.9l-1.8-2.1a32.12 32.12 0 0 0-35.1-9.5l-81.3 28.9c-30-24.6-63.5-44-99.7-57.6l-15.7-85a32.05 32.05 0 0 0-25.8-25.7l-2.7-.5c-52.1-9.4-106.9-9.4-159 0l-2.7.5a32.05 32.05 0 0 0-25.8 25.7l-15.8 85.4a351.86 351.86 0 0 0-99 57.4l-81.9-29.1a32 32 0 0 0-35.1 9.5l-1.8 2.1a446.02 446.02 0 0 0-79.7 137.9l-.9 2.6c-4.5 12.5-.8 26.5 9.3 35.2l66.3 56.6c-3.1 18.8-4.6 38-4.6 57.1c0 19.2 1.5 38.4 4.6 57.1L99 625.5a32.03 32.03 0 0 0-9.3 35.2l.9 2.6c18.1 50.4 44.9 96.9 79.7 137.9l1.8 2.1a32.12 32.12 0 0 0 35.1 9.5l81.9-29.1c29.8 24.5 63.1 43.9 99 57.4l15.8 85.4a32.05 32.05 0 0 0 25.8 25.7l2.7.5a449.4 449.4 0 0 0 159 0l2.7-.5a32.05 32.05 0 0 0 25.8-25.7l15.7-85a350 350 0 0 0 99.7-57.6l81.3 28.9a32 32 0 0 0 35.1-9.5l1.8-2.1c34.8-41.1 61.6-87.5 79.7-137.9l.9-2.6c4.5-12.3.8-26.3-9.3-35zM788.3 465.9c2.5 15.1 3.8 30.6 3.8 46.1s-1.3 31-3.8 46.1l-6.6 40.1l74.7 63.9a370.03 370.03 0 0 1-42.6 73.6L721 702.8l-31.4 25.8c-23.9 19.6-50.5 35-79.3 45.8l-38.1 14.3l-17.9 97a377.5 377.5 0 0 1-85 0l-17.9-97.2l-37.8-14.5c-28.5-10.8-55-26.2-78.7-45.7l-31.4-25.9l-93.4 33.2c-17-22.9-31.2-47.6-42.6-73.6l75.5-64.5l-6.5-40c-2.4-14.9-3.7-30.3-3.7-45.5c0-15.3 1.2-30.6 3.7-45.5l6.5-40l-75.5-64.5c11.3-26.1 25.6-50.7 42.6-73.6l93.4 33.2l31.4-25.9c23.7-19.5 50.2-34.9 78.7-45.7l37.9-14.3l17.9-97.2c28.1-3.2 56.8-3.2 85 0l17.9 97l38.1 14.3c28.7 10.8 55.4 26.2 79.3 45.8l31.4 25.8l92.8-32.9c17 22.9 31.2 47.6 42.6 73.6L781.8 426l6.5 39.9zM512 326c-97.2 0-176 78.8-176 176s78.8 176 176 176s176-78.8 176-176s-78.8-176-176-176zm79.2 255.2A111.6 111.6 0 0 1 512 614c-29.9 0-58-11.7-79.2-32.8A111.6 111.6 0 0 1 400 502c0-29.9 11.7-58 32.8-79.2C454 401.6 482.1 390 512 390c29.9 0 58 11.6 79.2 32.8A111.6 111.6 0 0 1 624 502c0 29.9-11.7 58-32.8 79.2z" fill="currentColor"></path></svg>',
          toolbar: ['edit-mode', 'content-theme', 'code-theme', 'both'],
        },
        {
          name: 'more',
          tipPosition: 'n',
          toolbar: ['outline', 'export', 'preview', 'info', 'help'],
        },
      ],
      preview: {
        markdown: {
          autoSpace: true,
          fixTermTypo: true,
          paragraphBeginningSpace: true,
        },
      },
      icon: 'ant',
      tab: '\t',
      cache: {
        enable: true,
      },
      counter: {
        enable: true,
      },
      outline: {
        enable: true,
        position: 'right',
      },
      upload: Object.assign(
        this.imageUploadConfigDefault,
        this.imageUploadConfig
      ),
    })
  },
  created() {
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
