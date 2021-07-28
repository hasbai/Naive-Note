import { createApp } from 'vue'
import { createStore } from 'vuex'
import App from './App.vue'
import naive from 'naive-ui'
import router from './router'

// 创建一个新的 store 实例
const store = createStore({
  state() {
    return {
      client: null,
      showWebdavConfig: false,
    }
  },
  mutations: {
    setClient(state, client) {
      state.client = client
    },
    displayWebdavConfig(state) {
      state.showWebdavConfig = true
    },
    closeWebdavConfig(state) {
      state.showWebdavConfig = false
    },
  },
})

const app = createApp(App)
app.use(router)
app.use(naive)
app.use(store)
app.mount('#app')
