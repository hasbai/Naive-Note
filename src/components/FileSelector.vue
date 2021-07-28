<template>
  <div>
    <n-h2>file selector</n-h2>
    <n-tree
      block-line
      :data="data"
      v-model:expanded-keys="expandedItems"
      selectable
      @update:selected-keys="emitSelectedKeys"
      @update:expanded-keys="emitExpandedKeys"
      remote
      :on-load="handleLoad"
      style="text-align: left"
    />
  </div>
</template>

<script>
import { h } from 'vue'
import { NIcon } from 'naive-ui'
import { LogoMarkdown } from '@vicons/ionicons5'
import {
  FilePdfOutlined,
  FolderOpenFilled,
  FileOutlined,
  FileTextOutlined,
} from '@vicons/antd'
export default {
  name: 'FileSelector',
  components: {},
  props: {
    defaultData: Array, // [{ label: '/', key: '/', isLeaf: false }] 详见 naive-ui 文档----树节点
    defaultExpandedItems: Array, // 数组元素为树节点的 key(文件的绝对路径)
  },
  data() {
    return {
      data: [],
      expandedItems: [],
    }
  },
  computed: {
    client() {
      return this.$store.state.client
    },
  },
  methods: {
    async handleLoad(node) {
      let Items = await this.client.getDirectoryContents(node.key)
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
    },
    emitSelectedKeys(keys) {
      this.$emit('on-select', keys)
    },
    emitExpandedKeys(keys) {
      this.$emit('on-expand', keys)
    },
  },
  created() {
    this.data = this.defaultData
    // 自动加载默认展开项
    this.data.forEach(async (node) => {
      if (this.defaultExpandedItems.includes(node.key)) {
        await this.handleLoad(node)
        this.expandedItems.push(node.key)
      }
    })
  },
}
</script>

<style></style>
