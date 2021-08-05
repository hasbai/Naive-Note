<template>
  <div class="tab-container">
    <n-tabs
      v-model:value="localViewingKey"
      type="card"
      closable
      @close="close"
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

    <!--      <Editor-->
    <!--        v-if="viewingKey"-->
    <!--        :key="viewingKey"-->
    <!--        :path="viewingKey"-->
    <!--        ref="editor"-->
    <!--      ></Editor>-->
  </div>
</template>

<script>
import { shallowRef } from 'vue'
import { useMessage } from 'naive-ui'
import Editor from '@/components/Editor.vue'
import PDFViewer from '@/components/PDFViewer.vue'
export default {
  name: 'Tab',
  components: { Editor },
  data() {
    return {
      cachedEditors: [], // 所有已渲染的编辑器
      componentName: '',
      componentProps: {},
      localViewingKey: '',
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
      this.localViewingKey = this.viewingKey
    },
    localViewingKey() {
      this.$store.commit('setViewingKey', this.localViewingKey)
    },
  },
  methods: {
    findIndex(key) {
      // 对象数组不能用 includes 判断
      return this.tabs.findIndex((file) => key === file.key)
    },
    close(key) {
      this.$store.commit('closeTab', key)
    },
    add(node) {
      const isOpened = this.findIndex(node.key) >= 0
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
      if (node.mime === 'text/markdown') {
        this.componentName = shallowRef(Editor)
      } else if (node.mime === 'application/pdf') {
        this.componentName = shallowRef(PDFViewer)
      } else {
        return
      }
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
