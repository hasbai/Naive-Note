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
        :tab="unsavedFiles.includes(file.key) ? '● ' + file.label : file.label"
        :name="file.key"
        style="padding: 0"
      >
      </n-tab-pane>
    </n-tabs>
    <keep-alive>
      <Editor
        v-if="viewingKey"
        :key="viewingKey"
        :path="viewingKey"
        ref="editor"
      ></Editor>
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
      files: [], // Array<File> File: {name: file.label, key: file.key}
      cachedEditors: [], // 所有已渲染的编辑器
      viewingKey: '', // file.key
    }
  },
  computed: {
    unsavedFiles() {
      return this.$store.state.unsavedFiles
    },
  },
  methods: {
    findIndex(key) {
      return this.files.findIndex((file) => key === file.key)
    },
    close(key) {
      const index = this.findIndex(key)
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
      if (this.findIndex(node.key) === -1) {
        this.files.push(node)
      }
      this.viewingKey = node.key // 切换至（如没有则创建）编辑器
      // 如果编辑器已渲染，再次点击则更新内容
      if (this.cachedEditors.includes(node.key)) {
        this.$nextTick(() => {
          this.$refs.editor.getContent()
        })
      } else {
        this.cachedEditors.push(node.key)
      }
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
