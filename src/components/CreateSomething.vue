<template>
  <n-modal
    :show="show"
    preset="card"
    size="medium"
    style="width: 50%; max-width: 400px"
    :title="title"
    :bordered="false"
  >
    <n-input
      v-model:value="value"
      type="text"
      placeholder="叫什么？"
      @keydown.enter="submit"
    />
    <div style="display: flex; justify-content: flex-end; margin-top: 12px">
      <n-button
        @click="submit"
        type="primary"
        size="small"
        :loading="buttonLoading"
      >
        确认
      </n-button>
    </div>
  </n-modal>
</template>

<script>
import { useMessage } from 'naive-ui'

export default {
  name: 'CreateSomething',
  props: {
    createFileParent: Object,
    show: Boolean,
    mode: String,
  },
  data() {
    return {
      value: '',
      buttonLoading: false,
      message: useMessage(),
    }
  },
  computed: {
    client() {
      return this.$store.getters.client
    },
    title() {
      return this.mode === 'file' ? '创建文件' : '创建文件夹'
    },
  },
  watch: {
    mode() {},
  },
  methods: {
    async submit() {
      // 校验文件名非空
      this.value = this.value.trim()
      if (this.value === '') {
        this.message.error('内容不能为空')
        return false
      }
      // 构造路径
      const parentPath =
        this.createFileParent.key === '/' ? '' : this.createFileParent.key // 根目录为 '/'，其它目录末尾无 '/'
      const path = parentPath + '/' + this.value
      // 发送请求
      this.buttonLoading = true
      try {
        if (this.mode === 'file') {
          // 创建文件
          await this.client.putFileContents(path, '', {
            contentLength: false,
          })
        } else {
          await this.client.createDirectory(path)
        }
        this.message.success(this.title + '成功')
        this.$emit('success')
        this.value = ''
      } catch (e) {
        console.log(e)
        this.message.error(this.title + '失败')
      } finally {
        this.buttonLoading = false
      }
    },
    close() {
      this.$emit('close')
    },
  },
}
</script>

<style scoped></style>
