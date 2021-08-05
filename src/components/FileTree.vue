<template>
  <div>
    <CreateSomething
      :show="showCreateSomething"
      :mode="createMode"
      :create-file-parent="createFileParent"
      @close="createClose"
      @success="createSuccess"
    ></CreateSomething>
    <n-tree
      block-line
      :data="data"
      selectable
      :multiple="multiple"
      :selected-keys="selectedKeys"
      @update:selected-keys="handleSelectedKeys"
      @update:expanded-keys="handleExpandedKeys"
      remote
      :on-load="handleLoad"
      style="text-align: left; padding: 12px 0"
    />
  </div>
</template>

<!--suppress JSUnusedGlobalSymbols -->
<script>
import { h, toRaw } from 'vue'
import { NIcon, NButton, useMessage, useDialog, useLoadingBar } from 'naive-ui'
import { LogoMarkdown } from '@vicons/ionicons5'
import {
  FilePdfOutlined,
  FolderOpenFilled,
  FileOutlined,
  FileTextOutlined,
  FileAddOutlined,
  DeleteOutlined,
} from '@vicons/antd'
import CreateSomething from '@/components/CreateSomething.vue'
export default {
  name: 'FileTree',
  components: { CreateSomething },
  props: {
    inputData: Array, // Array<TreeNode>
    multiple: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      data: [],
      selectedKeys: [],
      message: useMessage(),
      dialog: useDialog(),
      loadingBar: useLoadingBar(),
      showCreateSomething: false,
      createFileParent: null,
      createMode: 'file',
    }
  },
  computed: {
    client() {
      return this.$store.getters.client
    },
  },
  methods: {
    renderIcon(icon) {
      // 渲染图标, 插槽使用函数表达以提高性能
      return h(NIcon, {}, { default: () => h(icon) })
    },
    renderButton(callback, node, icon) {
      return h(
        NButton,
        {
          text: true,
          onClick: () => callback(node),
        },
        { default: () => this.renderIcon(icon) }
      )
    },
    render(node) {
      if (node.isLeaf === false) {
        node.suffix = () =>
          this.renderButton(this.createFile, node, FileAddOutlined)
        node.prefix = () =>
          this.renderButton(this.createFolder, node, FolderOpenFilled)
      } else if (node.isLeaf === true) {
        node.suffix = () =>
          this.renderButton(this.prepareDeleteFile, node, DeleteOutlined)
        if (!node.mime) {
          return
        }
        let icon
        if (node.mime.includes('markdown')) {
          icon = LogoMarkdown
        } else if (node.mime.includes('pdf')) {
          icon = FilePdfOutlined
        } else if (node.mime.includes('text')) {
          icon = FileTextOutlined
        } else {
          icon = FileOutlined
        }
        node.prefix = () => this.renderIcon(icon)
      }
      return node
    },
    async handleLoad(node) {
      // 加载
      let items
      this.loadingBar.start()
      try {
        items = await this.client.getDirectoryContents(node.key)
        this.loadingBar.finish()
      } catch (e) {
        console.log(e)
        this.loadingBar.error()
        this.message.error('文件加载失败')
      }
      // 生成子节点
      node.children = items.map((item) => {
        let node = {
          label: item.basename,
          key: item.filename,
          isLeaf: item.type !== 'directory',
          mime: item.mime,
        }
        return this.render(node)
      })
      return node
    },
    recursiveSearch(array, key) {
      // 提供 node.key，返回 node
      for (let i = 0; i < array.length; i++) {
        if (array[i].key === key) {
          return array[i]
        }
        if (
          array[i].children instanceof Array &&
          array[i].children.length > 0
        ) {
          const result = this.recursiveSearch(array[i].children, key)
          if (result) {
            return result
          }
        }
      }
    },
    findParent(node, key) {
      if (
        node.isLeaf ||
        !(node.children instanceof Array) ||
        node.children.length === 0
      ) {
        return
      }

      for (let i = 0; i < node.children.length; i++) {
        if (node.children[i].key === key) {
          return node
        }
        const result = this.findParent(node.children[i], key)
        if (result) {
          return result
        }
      }
    },
    findParentInArray(array, key) {
      for (let i = 0; i < array.length; i++) {
        const result = this.findParent(array[i], key)
        if (result) {
          return result
        }
      }
    },
    handleSelectedKeys(keys) {
      this.selectedKeys = keys
      // emit 事件
      const nodes = keys.map((key) => {
        return this.recursiveSearch(toRaw(this.data), key) // data是 Proxy 对象,将其转换为原始对象
      })
      this.$emit('on-select', nodes) // 返回 Array<树结点>
      // 单选模式下不保存已选择的节点
      if (!this.multiple) {
        this.selectedKeys = []
      }
    },
    handleExpandedKeys(keys) {
      // 返回 Array<树节点的 key>
      this.$emit('on-expand', keys)
    },
    createFile(node) {
      this.showCreateSomething = true
      this.createFileParent = node
      this.createMode = 'file'
    },
    prepareDeleteFile(node) {
      this.dialog.warning({
        title: '删除文件',
        content: '确定删除文件？',
        positiveText: '删！',
        negativeText: '算了',
        onPositiveClick: () => {
          this.deleteFile(node)
        },
        onNegativeClick: () => {
          // pass
        },
      })
    },
    async deleteFile(node) {
      this.loadingBar.start()
      try {
        await this.client.deleteFile(node.key)
        this.loadingBar.finish()
        this.message.success('删除成功')
        // 关闭标签
        this.$store.commit('closeTab', node.key)
        // 更新文件树
        const parent = this.findParentInArray(this.data, node.key)
        const index = parent.children.findIndex(
          (_node) => node.key === _node.key
        )
        parent.children.splice(index, 1)
      } catch (e) {
        console.log(e)
        this.loadingBar.error()
        this.message.error('删除失败')
      }
    },
    createFolder(node) {
      console.log(node)
    },
    createClose() {
      this.showCreateSomething = false
    },
    async createSuccess() {
      this.createClose()
      // 刷新文件夹数据
      await this.handleLoad(this.createFileParent)
      // 重置父节点
      // this.createFileParent = null
    },
    processInputData() {
      this.data = this.inputData
      this.data.forEach((node) => {
        this.render(node)
      })
    },
  },
  watch: {
    inputData() {
      this.processInputData()
    },
  },
  created() {
    this.processInputData()
  },
}
</script>

<style></style>
