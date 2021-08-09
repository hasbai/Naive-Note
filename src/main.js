import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import store from './vuex'
import naive from 'naive-ui'
import './registerServiceWorker'

const app = createApp(App)
app.use(router)
app.use(store)
app.use(naive)
app.mount('#app')
