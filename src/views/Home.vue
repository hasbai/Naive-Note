<template>
  <n-layout position="absolute">
    <!--    配置组件-->
    <WebdavConfig></WebdavConfig>
    <FolderSelector></FolderSelector>
    <JsonEditor></JsonEditor>
    <!-- 页首 -->
    <n-layout-header class="footer container" bordered>
      <span class="item"></span>
      <n-h2 class="item">Naive Note</n-h2>
      <div class="container item">
        <n-button class="button" text @click="displayJsonEditor">
          <n-icon id="setting-icon">
            <setting-outlined />
          </n-icon>
        </n-button>
      </div>
    </n-layout-header>

    <!--主体-->
    <n-layout has-sider position="absolute" style="top: 64px; bottom: 64px">
      <!-- 侧边栏 -->
      <n-layout-sider bordered content-style="padding: 16px 24px;">
        <n-button style="width: 100%" @click="displayFolderSelector">
          <n-icon style="padding-right: 0.5rem">
            <folder-icon />
          </n-icon>
          打开文件夹
        </n-button>
        <FileTree :input-data="folders" @on-select="handleSelect"></FileTree>
      </n-layout-sider>
      <!-- 内容 -->
      <n-layout-content
        content-style="padding: 0; text-align: left; height: 100%"
      >
        <Tab ref="tab"></Tab>
      </n-layout-content>
    </n-layout>

    <!-- 页尾 -->
    <n-layout-footer bordered position="absolute" class="footer">
      &copy; 2017 - {{ new Date().getFullYear() }} Shi
    </n-layout-footer>
  </n-layout>
</template>

<script>
// @ is an alias to /src
import { FolderOpenFilled as FolderIcon, SettingOutlined } from '@vicons/antd'
import { useMessage } from 'naive-ui'
import FileTree from '@/components/FileTree.vue'
import JsonEditor from '@/components/JsonEditor.vue'
import WebdavConfig from '@/components/WebdavConfig.vue'
import FolderSelector from '@/components/FolderSelector.vue'
import Tab from '@/components/Tab.vue'
export default {
  name: 'Home',

  components: {
    FileTree,
    WebdavConfig,
    FolderSelector,
    Tab,
    JsonEditor,
    FolderIcon,
    SettingOutlined,
  },

  data() {
    return {}
  },

  methods: {
    displayJsonEditor() {
      this.$store.commit('displayConfigDialogue', 'showJsonEditor')
    },
    displayFolderSelector() {
      this.$store.commit('displayConfigDialogue', 'showFolderSelector')
    },
    handleSelect(nodes) {
      // 剔除非叶子节点(即文件夹)
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].isLeaf === false) {
          // this.message.warning('选择的' + nodes[i].label + '不是文件')
          nodes.splice(i, 1)
        }
      }
      // 校验数组非空
      if (nodes.length === 0) {
        // this.message.error('未选择文件')
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
      return this.$store.getters.folders
    },
    showWebdavConfig() {
      return this.$store.state.showWebdavConfig
    },
    showFolderSelector() {
      return this.$store.state.showFolderSelector
    },
    showJsonEditor() {
      return this.$store.state.showJsonEditor
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

<style scoped>
.footer {
  height: 64px;
  padding: 24px;
}
.container {
  display: flex;
  justify-content: space-around;
  align-items: center;
}
.item {
  flex: 1;
}
.button {
  margin-left: auto;
}
#setting-icon {
  height: 24px;
  width: 24px;
}
</style>
