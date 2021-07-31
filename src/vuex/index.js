import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import { createClient } from 'webdav'
import { h } from 'vue'
import { NIcon } from 'naive-ui'
import { FolderOpenFilled } from '@vicons/antd'

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
    folders(state) {
      return state.folders.map((node) => {
        return {
          label: node.label,
          key: node.key,
          isLeaf: false,
          prefix: () => h(NIcon, {}, { default: () => h(FolderOpenFilled) }),
        }
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
