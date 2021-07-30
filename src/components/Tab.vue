<template>
  <div class="tab-container">
    <n-tabs
      v-model:value="viewingKey"
      type="card"
      closable
      @close="close"
      tab-style="min-width: 80px"
    >
      <n-tab-pane
        v-for="file in files"
        :key="file.key"
        :tab="file.label"
        :name="file.key"
        style="padding: 0"
      >
      </n-tab-pane>
    </n-tabs>
    <keep-alive>
      <Editor v-if="viewingKey" :key="viewingKey" :path="viewingKey"></Editor>
    </keep-alive>
  </div>
</template>

<script>
import { useMessage } from 'naive-ui'
import Editor from '@/components/Editor.vue'
export default {
  name: 'Tab',
  components: { Editor },
  data() {
    return {
      // Array<File> File: {name: file.label, key: file.key}
      files: [],
      viewingKey: '', // file.key
    }
  },
  computed: {
    currentFile() {
      const index = this.files.findIndex((file) => this.viewingKey === file.key)
      return index === -1 ? {} : this.files[index]
    },
  },
  methods: {
    close(key) {
      const index = this.files.findIndex((file) => key === file.key)
      if (this.files.length === 1) {
        this.viewingKey = ''
      } else if (index === this.files.length - 1) {
        this.viewingKey = this.files[index - 1].key
      } else {
        this.viewingKey = this.files[index + 1].key
      }
      this.files.splice(index, 1)
    },
    add(node) {
      this.files.push(node)
      this.viewingKey = node.key
    },
  },
  created() {
    this.message = useMessage()
  },
}
</script>

<style scoped>
.tab-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
