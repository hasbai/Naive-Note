import { createApp } from 'vue'
import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import App from './App.vue'
import naive from 'naive-ui'
import router from './router'
import { createClient } from 'webdav'
// 创建一个新的 store 实例
const store = createStore({
  plugins: [
    createPersistedState({
      paths: ['webdavConfig', 'folders'],
    }),
  ],
  state() {
    return {
      webdavConfig: {},
      folders: [],
      showWebdavConfig: false,
      showFolderSelector: false,
    }
  },
  getters: {
    client(state) {
      const webdavConfig = state.webdavConfig
      return createClient(webdavConfig.url, {
        username: webdavConfig.username,
        password: webdavConfig.password,
      })
    },
  },
  mutations: {
    setWebdavConfig(state, config) {
      state.webdavConfig = config
    },
    displayWebdavConfig(state) {
      state.showWebdavConfig = true
    },
    closeWebdavConfig(state) {
      state.showWebdavConfig = false
    },
    displayFolderSelector(state) {
      state.showFolderSelector = true
    },
    closeFolderSelector(state) {
      state.showFolderSelector = false
    },
    addFolders(state, folders) {
      state.folders.push.apply(state.folders, folders)
    },
    deleteFolders(state, nodeKeys) {
      nodeKeys.forEach((key) => {
        const index = state.folders.findIndex((node) => {
          return node.key === key
        })
        if (index >= 0) {
          state.folders.splice(index, 1)
        }
      })
    },
    setFolders(state, folders) {
      state.folders = folders
    },
  },
})

const app = createApp(App)
app.use(router)
app.use(naive)
app.use(store)
app.mount('#app')
