<template>
  <div :id="path" class="tab-content"></div>
</template>

<script>
import Vditor from 'vditor'
import 'vditor/dist/index.css'
export default {
  name: 'Editor',
  props: { path: String },
  data() {
    return {
      editor: undefined,
      content: '',
    }
  },
  computed: {
    client() {
      return this.$store.getters.client
    },
  },
  methods: {
    async onFileChange() {
      this.content = await this.client.getFileContents(this.path, {
        format: 'text',
      })
    },
  },
  watch: {
    async path() {
      await this.onFileChange()
    },
    content() {
      this.editor.setValue(this.content)
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
      after: () => {},
    })
  },
  created() {
    this.onFileChange()
  },
}
</script>

<style scoped>
.tab-content {
  overflow-y: auto;
  flex: 1;
}
</style>
