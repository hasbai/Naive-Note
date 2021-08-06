import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import { createClient } from 'webdav'

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
      unsavedFiles: [],
      tabs: [], // 打开的标签
      viewingKey: '', // 位于前台的编辑器（node.key）
      showWebdavConfig: false,
      showFolderSelector: false,
      showJsonEditor: false,
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
    folders(state) {
      return JSON.parse(JSON.stringify(state.folders)) // 深拷贝，防止污染配置项
    },
  },
  mutations: {
    displayConfigDialogue(state, name) {
      state[name] = true
    },
    closeConfigDialogue(state, name) {
      state[name] = false
    },
    setWebdavConfig(state, config) {
      state.webdavConfig = config
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
    addTab(state, node) {
      state.tabs.push(node)
    },
    closeTab(state, key) {
      const index = state.tabs.findIndex((node) => key === node.key)
      // 设置 viewingKey
      if (state.tabs.length === 1) {
        state.viewingKey = ''
      } else if (index === state.tabs.length - 1) {
        state.viewingKey = state.tabs[index - 1].key
      } else {
        state.viewingKey = state.tabs[index + 1].key
      }
      // 关闭标签
      if (index >= 0) {
        state.tabs.splice(index, 1)
      }
    },
    setViewingKey(state, key) {
      state.viewingKey = key
    },
    modifyUnsavedFiles(state, payload) {
      const key = payload.key
      const method = payload.method
      const index = state.unsavedFiles.indexOf(key)
      if (method === 'add') {
        if (index === -1) {
          state.unsavedFiles.push(key)
        }
      } else if (method === 'delete') {
        if (index !== -1) {
          state.unsavedFiles.splice(index, 1)
        }
      }
    },
  },
})

export default store
