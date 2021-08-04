<template>
  <div>
    <n-modal
      :show="showFileCreate"
      preset="card"
      style="width: 50%; max-width: 400px"
      title="创建文件"
      :bordered="false"
      size="medium"
      closable
      @close="this.showFileCreate = false"
    >
      <n-input
        v-model:value="createFileName"
        type="text"
        placeholder="叫什么？"
      />
      <div style="display: flex; justify-content: flex-end; margin-top: 12px">
        <n-button
          @click="createFile"
          type="primary"
          size="small"
          :loading="buttonLoading"
        >
          确认
        </n-button>
      </div>
    </n-modal>
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
export default {
  name: 'FileTree',
  components: {},
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
      showFileCreate: false,
      buttonLoading: false,
      createFileName: '',
      createFileDir: null,
    }
  },
  computed: {
    client() {
      return this.$store.getters.client
    },
  },
  methods: {
    renderIcon(iconComponent) {
      // 渲染图标, 插槽使用函数表达以提高性能
      return h(NIcon, {}, { default: () => h(iconComponent) })
    },
    renderSuffix(node) {
      if (node.isLeaf === false) {
        node.suffix = () =>
          h(
            NButton,
            {
              text: true,
              onClick: () => this.prepareCreateFile(node),
            },
            { default: () => this.renderIcon(FileAddOutlined) }
          )
      } else if (node.isLeaf === true) {
        node.suffix = () =>
          h(
            NButton,
            {
              text: true,
              onClick: () => this.prepareDeleteFile(node),
            },
            { default: () => this.renderIcon(DeleteOutlined) }
          )
      }
    },
    async handleLoad(node) {
      let items
      this.loadingBar.start()
      try {
        items = await this.client.getDirectoryContents(node.key)
        this.loadingBar.finish()
      } catch (e) {
        console.log(e)
        this.loadingBar.error()
        this.error('文件加载失败')
      }
      node.children = items.map((item) => {
        let icon
        if (item.type === 'directory') {
          icon = FolderOpenFilled
        } else if (item.mime.includes('markdown')) {
          icon = LogoMarkdown
        } else if (item.mime.includes('pdf')) {
          icon = FilePdfOutlined
        } else if (item.mime.includes('text')) {
          icon = FileTextOutlined
        } else {
          icon = FileOutlined
        }
        const node = {
          label: item.basename,
          key: item.filename,
          isLeaf: item.type !== 'directory',
          prefix: () => this.renderIcon(icon),
        }
        this.renderSuffix(node)
        return node
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
    prepareCreateFile(node) {
      this.showFileCreate = true
      this.createFileDir = node
    },
    async createFile() {
      // 校验文件名非空
      this.createFileName = this.createFileName.trim()
      if (this.createFileName === '') {
        this.message.error('文件名不能为空')
        return false
      }
      // 构造文件路径
      const parentPath =
        this.createFileDir.key === '/' ? '' : this.createFileDir.key // 根目录为 '/'，其它目录末尾无 '/'
      const filePath = parentPath + '/' + this.createFileName
      // 创建文件
      this.buttonLoading = true
      try {
        const result = await this.client.putFileContents(filePath, '', {
          contentLength: false,
        })
        this.message.success('创建文件成功')
        // 关闭对话框
        this.showFileCreate = false
        // 刷新文件夹数据
        await this.handleLoad(this.createFileDir)
        // 重置表单数据
        this.createFileDir = null
        this.createFileName = ''
      } catch (e) {
        console.log(e)
        this.message.error('创建文件失败')
      } finally {
        this.buttonLoading = false
      }
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
    processInputData() {
      this.data = this.inputData
      this.data.forEach((node) => {
        this.renderSuffix(node)
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
