<template>
  <n-tabs
    v-model:value="viewingTab"
    type="card"
    closable
    @close="close"
    tab-style="min-width: 80px;"
  >
    <n-tab-pane
      v-for="file in files"
      :key="file.path"
      :tab="file.name"
      :name="file.path"
    >
      {{ file.content }}
      <!-- <div :id="this.contentName"></div> -->
    </n-tab-pane>
  </n-tabs>
</template>

<script>
import { useMessage } from 'naive-ui'
// import Vditor from 'vditor'
// import 'vditor/dist/index.css'
export default {
  name: 'Editor',
  data() {
    return {
      files: [], // Array<File> File: {name: node.label, path: node.key, content: content}
      viewingTab: '', // file.path
    }
  },
  computed: {
    client() {
      return this.$store.getters.client
    },
  },
  methods: {
    close(key) {
      const index = this.files.findIndex((file) => key === file.path)
      if (this.files.length === 1) {
        this.viewingTab = ''
      } else if (index === this.files.length - 1) {
        this.viewingTab = this.files[index - 1].path
      } else {
        this.viewingTab = this.files[index + 1].path
      }
      this.files.splice(index, 1)
    },
    async add(node) {
      const content = await this.client.getFileContents(node.key, {
        format: 'text',
      })
      const file = {
        name: node.label,
        path: node.key,
        content: content,
      }
      this.files.push(file)
      this.viewingTab = file.path
    },
  },
  created() {
    this.message = useMessage()
  },
}
</script>

<style></style>
