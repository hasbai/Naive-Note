<template>
  <div :id="path" class="tab-content" @keydown.ctrl.s.prevent="save"></div>
</template>

<script>
import Vditor from 'vditor'
import 'vditor/dist/index.css'
import { useMessage } from 'naive-ui'
export default {
  name: 'Editor',
  props: { path: String },
  data() {
    return {
      editor: undefined,
    }
  },
  computed: {
    client() {
      return this.$store.getters.client
    },
  },
  methods: {
    async getContent() {
      const content = await this.client.getFileContents(this.path, {
        format: 'text',
      })
      this.editor.setValue(content)
    },
    async save() {
      const content = this.editor.getValue()
      const result = await this.client.putFileContents(this.path, content, {
        contentLength: false,
      })
      if (result === true) {
        this.message.success('保存成功')
      } else {
        this.message.error('保存失败')
      }
    },
  },
  watch: {},
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
      after: this.getContent,
    })
  },
  created() {
    this.message = useMessage()
  },
}
</script>

<style scoped>
.tab-content {
  overflow-y: auto;
  flex: 1;
}
</style>
