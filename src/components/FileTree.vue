<template>
  <div>
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
import { NIcon } from 'naive-ui'
import { LogoMarkdown } from '@vicons/ionicons5'
import {
  FilePdfOutlined,
  FolderOpenFilled,
  FileOutlined,
  FileTextOutlined,
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
    }
  },
  computed: {
    client() {
      return this.$store.getters.client
    },
  },
  watch: {
    inputData() {
      this.data = this.inputData
    },
  },
  methods: {
    async handleLoad(node) {
      let Items = await this.client.getDirectoryContents(node.key)
      node.children = Items.map((item) => {
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
          prefix: () => h(NIcon, {}, { default: () => h(icon) }), // 渲染图标, 插槽使用函数表达以提高性能
        }
      })
      return node
    },
    recursiveSearch(array, key) {
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
      console.log(keys)
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
  },
  created() {
    this.data = this.inputData
  },
}
</script>

<style></style>
