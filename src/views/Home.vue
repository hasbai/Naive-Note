<template>
  <div position="relative">
    <WebdavConfig></WebdavConfig>
    <FolderSelector></FolderSelector>
    <n-layout position="absolute">
      <!-- 页首 -->
      <n-layout-header style="height: 64px; padding: 24px" bordered
        >Naive Note</n-layout-header
      >
      <n-layout has-sider position="absolute" style="top: 64px; bottom: 64px">
        <!-- 侧边栏 -->
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
          <FileTree :input-data="folders" @on-select="handleSelect"></FileTree>
        </n-layout-sider>
        <!-- 主体 -->
        <n-layout-content
          content-style="padding: 0; text-align: left; height: 100%"
        >
          <Tab ref="tab"></Tab>
        </n-layout-content>
      </n-layout>
      <!-- 页尾 -->
      <n-layout-footer
        bordered
        position="absolute"
        style="height: 64px; padding: 24px"
      >
        &copy; 2017 - {{ new Date().getFullYear() }} Shi
      </n-layout-footer>
    </n-layout>
  </div>
</template>

<script>
// @ is an alias to /src
import { FolderOpenFilled as FolderIcon } from '@vicons/antd'
import { useMessage } from 'naive-ui'
import FileTree from '@/components/FileTree.vue'
import WebdavConfig from '@/components/WebdavConfig.vue'
import FolderSelector from '@/components/FolderSelector.vue'
import Tab from '@/components/Tab.vue'
export default {
  name: 'Home',

  components: { FileTree, WebdavConfig, FolderSelector, Tab, FolderIcon },

  data() {
    return {}
  },

  methods: {
    handleSelect(nodes) {
      // 剔除非叶子节点(即文件夹)
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].isLeaf === false) {
          this.message.warning('选择的' + nodes[i].label + '不是文件')
          nodes.splice(i, 1)
        }
      }
      // 校验数组非空
      if (nodes.length === 0) {
        this.message.error('未选择文件')
        return false
      }
      // 添加文件
      nodes.forEach((node) => {
        this.$refs.tab.add(node)
      })
    },
  },

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
    this.message = useMessage()
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
