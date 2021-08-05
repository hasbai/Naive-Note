<template>
  <n-modal
    :show="show"
    preset="card"
    size="medium"
    style="width: 50%; max-width: 400px"
    closable
    @close="close"
    title="title"
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
      title: this.mode === 'file' ? '创建文件' : '创建文件夹',
      message: useMessage(),
    }
  },
  computed: {
    client() {
      return this.$store.getters.client
    },
  },
  methods: {
    submit() {
      const mode = this.mode === 'file' ? '创建文件' : '创建文件夹'
      this.buttonLoading = true
      try {
        if (this.mode === 'file') {
          this.createFile()
        }
        this.message.success(mode + '成功')
        this.$emit('success')
        this.value = ''
      } catch (e) {
        console.log(e)
        this.message.error(mode + '失败')
      } finally {
        this.buttonLoading = false
      }
    },
    async createFile() {
      // 校验文件名非空
      this.value = this.value.trim()
      if (this.value === '') {
        this.message.error('文件名不能为空')
        return false
      }
      // 构造文件路径
      const parentPath =
        this.createFileParent.key === '/' ? '' : this.createFileParent.key // 根目录为 '/'，其它目录末尾无 '/'
      const filePath = parentPath + '/' + this.value
      // 创建文件

      await this.client.putFileContents(filePath, '', {
        contentLength: false,
      })
      this.$emit('success')
    },
    close() {
      this.$emit('close')
    },
  },
}
</script>

<style scoped></style>
