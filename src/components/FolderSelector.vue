<template>
  <n-modal
    :show="showFolderSelector"
    style="width: 90%; max-width: 600px"
    preset="card"
    title="选择文件夹"
    size="medium"
    closable
    @close="close"
    :bordered="false"
  >
    <FileTree
      :input-data="[{ label: '/', key: '/', isLeaf: false }]"
      :multiple="true"
      @on-select="handleSelect"
    ></FileTree>
    <n-row :gutter="[0, 24]">
      <n-col :span="24">
        <div style="display: flex; justify-content: flex-end">
          <n-button @click="submitSelected" type="primary"> 确认 </n-button>
        </div>
      </n-col>
    </n-row>
  </n-modal>
</template>

<script>
import { useMessage } from 'naive-ui'
import FileTree from '@/components/FileTree.vue'
export default {
  name: 'FolderSelector',
  components: {
    FileTree,
  },
  data() {
    return {
      selectedNodes: [], // Array<树结点>
    }
  },
  methods: {
    close() {
      this.$store.commit('closeConfigDialogue', 'showFolderSelector')
    },
    handleSelect(nodes) {
      this.selectedNodes = nodes
    },
    submitSelected() {
      // 剔除叶子节点(即非文件夹)
      for (let i = 0; i < this.selectedNodes.length; i++) {
        if (this.selectedNodes[i].isLeaf === true) {
          this.message.warning(
            '选择的' + this.selectedNodes[i].label + '不是文件夹',
            { duration: 5000 }
          )
          this.selectedNodes.splice(i, 1)
        }
      }
      // 校验数组非空
      if (this.selectedNodes.length === 0) {
        this.message.error('未选择文件夹', { duration: 5000 })
        return false
      }
      // 添加文件夹
      this.$store.commit('addFolders', this.selectedNodes)
      this.message.success('打开文件夹成功', { duration: 5000 })
      this.$store.commit('closeConfigDialogue', 'showFolderSelector')
    },
  },
  computed: {
    showFolderSelector() {
      return this.$store.state.showFolderSelector
    },
  },
  created() {
    this.message = useMessage()
  },
}
</script>

<style></style>
