<template>
  <div position="relative">
    <WebdavConfig></WebdavConfig>

    <n-layout position="absolute">
      <n-layout-header style="height: 64px; padding: 24px" bordered
        >header</n-layout-header
      >
      <n-layout has-sider position="absolute" style="top: 64px; bottom: 64px">
        <n-layout-sider bordered content-style="padding: 24px;">
          <!-- <n-button>打开文件夹</n-button> -->
          <FileSelector
            :default-data="defaultData"
            :default-expanded-items="defaultExpandedItems"
          ></FileSelector>
        </n-layout-sider>
        <n-layout content-style="padding: 24px;">
          <n-space vertical>
            <div>1</div>
            <div>2</div>
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
import { createClient } from 'webdav'
import FileSelector from '@/components/FileSelector.vue'
import WebdavConfig from '@/components/WebdavConfig.vue'
export default {
  name: 'Home',

  components: { FileSelector, WebdavConfig },

  data() {
    return {
      defaultData: [{ label: '/', key: '/', isLeaf: false }],
      defaultExpandedItems: ['/'],
    }
  },

  methods: {},

  computed: {},

  created() {
    if (this.$store.state.client) {
      // good!
    } else if (localStorage.getItem('webdavConfig')) {
      const webdavConfig = JSON.parse(localStorage.getItem('webdavConfig'))
      const client = createClient(webdavConfig.webdavURL, {
        username: webdavConfig.username,
        password: webdavConfig.password,
      })
      this.$store.commit('setClient', client)
    } else {
      this.$store.commit('displayWebdavConfig')
    }
  },
}
</script>
