<template>
  <n-modal
    :show="showJsonEditor"
    preset="card"
    closable
    @close="this.$store.commit('closeConfigDialogue', 'showJsonEditor')"
    style="width: 90%; max-width: 600px"
    title="编辑设置"
    :bordered="false"
    size="medium"
  >
    <div ref="jsonEditor" style="max-height: 600px"></div>
    <div style="display: flex; justify-content: flex-end; margin: 20px 0 0 0">
      <n-button @click="saveConfig" type="primary"> 确认 </n-button>
    </div>
  </n-modal>
</template>

<script>
import { useMessage } from 'naive-ui'
import JSONEditor from 'jsoneditor'
import 'jsoneditor/dist/jsoneditor.min.css'
export default {
  name: 'JsonEditor',
  components: {},
  data() {
    return {
      json: {},
      editor: undefined,
    }
  },
  computed: {
    showJsonEditor() {
      return this.$store.state.showJsonEditor
    },
  },
  watch: {
    async showJsonEditor() {
      if (this.showJsonEditor === true) {
        while (!this.$refs.jsonEditor) {
          await new Promise((r) => setTimeout(r, 50))
        }
        this.createEditor()
      }
    },
  },
  methods: {
    saveConfig() {
      localStorage.setItem('vuex', JSON.stringify(this.editor.get()))
      this.message.success('设置成功')
    },
    createEditor() {
      const container = this.$refs.jsonEditor
      const options = {}
      this.editor = new JSONEditor(container, options)
      this.editor.set(JSON.parse(localStorage.getItem('vuex')))
    },
  },
  mounted() {},
  created() {
    this.message = useMessage()
  },
}
</script>

<style></style>
