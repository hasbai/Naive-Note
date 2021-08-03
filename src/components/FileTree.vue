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
import { NIcon, NButton, useMessage } from 'naive-ui'
import { LogoMarkdown } from '@vicons/ionicons5'
import {
  FilePdfOutlined,
  FolderOpenFilled,
  FileOutlined,
  FileTextOutlined,
  FileAddOutlined,
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
    async handleLoad(node) {
      let items
      try {
        items = await this.client.getDirectoryContents(node.key)
      } catch (e) {
        console.log(e)
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
        return {
          label: item.basename,
          key: item.filename,
          isLeaf: item.type !== 'directory',
          prefix: () => this.renderIcon(icon),
        }
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
      return undefined
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
        if (result === false) {
          throw '文件未写入'
        }
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
    processInputData() {
      this.data = this.inputData
      this.data.forEach((node) => {
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
        }
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
