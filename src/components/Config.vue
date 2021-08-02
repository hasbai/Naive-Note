<template>
  <n-modal
    :show="true"
    preset="card"
    closable
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
  name: 'Config',
  components: {},
  data() {
    return {
      json: {},
      editor: undefined,
    }
  },

  methods: {
    saveConfig() {
      localStorage.setItem('vuex', JSON.stringify(this.editor.get()))
      this.message.success('设置成功')
    },
  },

  mounted() {
    const container = this.$refs.jsonEditor
    const options = {}
    this.editor = new JSONEditor(container, options)
    this.editor.set(JSON.parse(localStorage.getItem('vuex')))
  },
  created() {
    this.message = useMessage()
  },
}
</script>

<style></style>
