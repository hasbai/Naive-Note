<template>
  <div position="relative">
    <WebdavConfig></WebdavConfig>
    <FolderSelector></FolderSelector>
    <n-layout position="absolute">
      <n-layout-header style="height: 64px; padding: 24px" bordered
        >header</n-layout-header
      >
      <n-layout has-sider position="absolute" style="top: 64px; bottom: 64px">
        <n-layout-sider bordered content-style="padding: 16px 24px;">
          <n-button
            style="width: 100%"
            @click="this.$store.commit('displayFolderSelector')"
          >
            <template #icon>
              <n-icon>
                <folder-icon />
              </n-icon>
            </template>
            打开文件夹
          </n-button>
          <FileTree :input-data="folders"></FileTree>
        </n-layout-sider>
        <n-layout content-style="padding: 24px;">
          <n-space vertical>
            <div>editor</div>
          </n-space>
        </n-layout>
      </n-layout>
      <n-layout-footer
        bordered
        position="absolute"
        style="height: 64px; padding: 24px"
      >
        footer
      </n-layout-footer>
    </n-layout>
  </div>
</template>

<script>
// @ is an alias to /src
import { FolderOpenFilled as FolderIcon } from '@vicons/antd'
import { toRaw } from 'vue'
import FileTree from '@/components/FileTree.vue'
import WebdavConfig from '@/components/WebdavConfig.vue'
import FolderSelector from '@/components/FolderSelector.vue'
export default {
  name: 'Home',

  components: { FileTree, WebdavConfig, FolderSelector, FolderIcon },

  data() {
    return {}
  },

  methods: {},

  computed: {
    folders() {
      return this.$store.state.folders
    },
    showWebdavConfig() {
      return this.$store.state.showWebdavConfig
    },
    showFolderSelector() {
      return this.$store.state.showFolderSelector
    },
  },
  watch: {},

  created() {
    const that = this

    // 设置 webdav
    async function configWebdav() {
      if (Object.keys(that.$store.state.webdavConfig).length > 0) {
        // that.webdavConfig 默认为 Object
        return 'Webdav 已设置'
      } else {
        that.$store.commit('displayWebdavConfig')
        while (that.showWebdavConfig) {
          await new Promise((r) => setTimeout(r, 100))
        }
        return 'Webdav 已设置'
      }
    }

    // 设置打开的文件夹
    async function configOpenedFolders() {
      if (that.folders.length > 0) {
        // that.folders 默认为 Array
        return '文件夹已打开'
      } else {
        that.$store.commit('displayFolderSelector')
        while (that.showFolderSelector) {
          await new Promise((r) => setTimeout(r, 100))
        }
        return '文件夹已打开'
      }
    }

    // 用户配置
    async function setUp() {
      await configWebdav()
      await configOpenedFolders()
    }
    setUp()
  },
}
</script>

<style></style>
