<template>
  <div class="tab-container">
    <n-tabs
      :value="viewingKey"
      type="card"
      closable
      @close="close"
      @update:value="onUpdate"
      tab-style="min-width: 80px"
    >
      <n-tab-pane
        v-for="file in tabs"
        :key="file.key"
        :tab="unsavedFiles.includes(file.key) ? '● ' + file.label : file.label"
        :name="file.key"
        style="padding: 0"
      >
      </n-tab-pane>
    </n-tabs>
    <keep-alive>
      <component
        v-if="viewingKey"
        :is="componentName"
        :key="viewingKey"
        :path="viewingKey"
        ref="tab"
      ></component>
    </keep-alive>
  </div>
</template>

<script>
import { shallowRef } from 'vue'
import { useMessage } from 'naive-ui'
import Editor from '@/components/Editor.vue'
import PDFViewer from '@/components/PDFViewer.vue'
import Welcome from '@/views/Welcome.vue'
export default {
  name: 'Tab',
  components: {},
  data() {
    return {
      cachedEditors: [], // 所有已渲染的编辑器
      componentName: '',
    }
  },
  computed: {
    unsavedFiles() {
      return this.$store.state.unsavedFiles
    },
    tabs() {
      // Array<File> File: {name: file.label, key: file.key}
      return this.$store.state.tabs
    },
    viewingKey() {
      return this.$store.state.viewingKey
    },
  },
  watch: {
    viewingKey() {
      if (this.viewingKey) {
        this.changeComponent(this.viewingKey)
      }
    },
  },
  methods: {
    changeComponent(key) {
      // 当 viewingKey 改变时动态改变组件
      const node = this.tabs.find((node) => key === node.key)
      if (node.mime === 'text/markdown') {
        this.componentName = shallowRef(Editor)
      } else if (node.mime === 'application/pdf') {
        this.componentName = shallowRef(PDFViewer)
      } else if (node.mime.startsWith('text')) {
        this.message.warning('文本文件不是 markdown 格式')
        this.componentName = shallowRef(Editor)
      } else {
        // 切换至默认页面
        this.message.error('文件格式不支持')
        this.componentName = shallowRef(Welcome)
      }
    },
    onUpdate(key) {
      // 选中项改变时的回调函数
      this.$store.commit('setViewingKey', key)
    },
    close(key) {
      this.$store.commit('closeTab', key)
    },
    add(node) {
      const isOpened = this.tabs.findIndex((file) => node.key === file.key) >= 0
      const isCached = this.cachedEditors.includes(node.key)
      // 打开标签页
      if (!isOpened) {
        this.$store.commit('addTab', node)
      }
      // 缓存编辑器
      if (!isCached) {
        this.cachedEditors.push(node.key)
      }
      // 切换至（如没有则创建）编辑器
      this.$store.commit('setViewingKey', node.key)
      // 如果 markdown 编辑器已缓存且标签页已打开，再次点击则更新内容
      if (isOpened && isCached && node.mime === 'text/markdown') {
        this.$nextTick(() => {
          this.$refs.tab.onUpdate()
        })
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
