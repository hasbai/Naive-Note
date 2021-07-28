<template>
  <div>
    <n-h2>file selector</n-h2>
    <n-tree
      block-line
      selectable
      :data="data"
      v-model:selected-keys="selectedItem"
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
  data() {
    return {
      data: [{ label: '/', key: '/', isLeaf: false }],
      selectedItem: [],
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
          prefix: () => h(NIcon, {}, { default: () => h(icon) }),
        }
      })
    },
  },
}
</script>

<style></style>
