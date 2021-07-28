<template>
  <n-modal :show="showWebdavConfig">
    <n-card
      style="width: 600px"
      title="连接存储后端"
      :bordered="false"
      size="huge"
    >
      <n-form :model="model">
        <n-form-item path="webdavURL" label="Webdav URL">
          <n-input
            v-model:value="model.webdavURL"
            placeholder="你的webdav的地址"
            @keydown.enter.prevent
          />
        </n-form-item>
        <n-form-item path="username" label="用户名">
          <n-input
            v-model:value="model.username"
            placeholder="用户名......"
            @keydown.enter.prevent
          />
        </n-form-item>
        <n-form-item path="password" label="密码">
          <n-input
            v-model:value="model.password"
            type="password"
            placeholder="......当然！"
          />
        </n-form-item>
        <n-row :gutter="[0, 24]">
          <n-col :span="24">
            <div style="display: flex; justify-content: flex-end">
              <n-button
                @click="validateInfo"
                type="primary"
                :loading="buttonLoading"
              >
                确认
              </n-button>
            </div>
          </n-col>
        </n-row>
      </n-form>
    </n-card>
  </n-modal>
</template>

<script>
import { useMessage } from 'naive-ui'
import { createClient } from 'webdav'
export default {
  name: 'WebdavConfig',
  components: {},
  setup() {
    const message = useMessage()
    return {
      successInfo() {
        message.success('连接成功！', { duration: 3000 })
        return true
      },
      errorInfo() {
        message.error(
          '用户名或密码错误或跨域问题, 请检查 devtools 以获取详细信息',
          { duration: 3000 }
        )
        return false
      },
    }
  },
  data() {
    return {
      buttonLoading: false,
      model: {
        webdavURL: '',
        username: '',
        password: '',
      },
    }
  },
  computed: {
    showWebdavConfig() {
      return this.$store.state.showWebdavConfig
    },
  },
  methods: {
    async validateInfo() {
      this.buttonLoading = true
      const client = createClient(this.model.webdavURL, {
        username: this.model.username,
        password: this.model.password,
      })
      let stat
      try {
        stat = await client.stat('/', {
          details: true,
        })
        console.log(stat)
        this.successInfo()
        this.$store.commit('closeWebdavConfig')
        this.$store.commit('setClient', client)
        localStorage.setItem('webdavConfig', JSON.stringify(this.model))
      } catch (e) {
        console.log(e)
        this.errorInfo()
      } finally {
        this.buttonLoading = false
      }
    },
  },
  created() {},
}
</script>

<style></style>
