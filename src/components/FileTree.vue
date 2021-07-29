<template>
  <div>
    <n-tree
      block-line
      selectable
      :data="data"
      @update:selected-keys="handleSelectedKeys"
      @update:expanded-keys="handleExpandedKeys"
      remote
      :on-load="handleLoad"
      style="text-align: left; padding: 12px 0px"
    />
  </div>
</template>

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
  },
  data() {
    return {
      data: [],
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
      console.log('get directory contents ......')
      console.log(Items)
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
          isLeaf: item.type === 'directory' ? false : true,
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
          return this.recursiveSearch(array[i].children, key)
        }
      }
    },
    handleSelectedKeys(keys) {
      // 返回 Array<树结点>
      const nodes = keys.map((key) => {
        return this.recursiveSearch(toRaw(this.data), key) // data是 Proxy 对象,将其转换为原始对象
      })
      console.log('selected folder')
      console.log(nodes)
      this.$emit('on-select', nodes)
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
