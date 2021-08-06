<template>
  <n-modal
    :show="show"
    preset="card"
    size="medium"
    style="width: 50%; max-width: 400px"
    :title="title"
    :bordered="false"
  >
    <n-upload
      v-if="showUpload"
      multiple
      @change="handleChange"
      ref="upload"
      :class="showInput ? 'upload' : ''"
    >
      <n-button>选择文件</n-button>
    </n-upload>
    <n-input
      v-if="showInput"
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
      fileList: [],
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
    showUpload() {
      return this.mode === 'file' && !this.value
    },
    showInput() {
      return this.fileList.length === 0
    },
  },
  watch: {},
  methods: {
    async submit() {
      try {
        if (this.showInput) {
          await this.upload(this.value)
        } else if (this.showUpload) {
          while (this.fileList.length > 0) {
            let item = this.fileList[this.fileList.length - 1]
            item.status = 'uploading'
            let timer = setInterval(() => {
              if (item.status !== 'uploading') {
                clearInterval(timer)
              } else {
                item.percentage += 1
              }
            }, 20)
            await this.upload(item.name, item.file)
            item.status = 'finished'
            this.fileList.pop()
          }
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
    async upload(name, data = '') {
      // 校验文件名非空
      name = name.trim()
      if (name === '') {
        this.message.error('内容不能为空')
        return false
      }
      // 构造路径
      const parentPath =
        this.createFileParent.key === '/' ? '' : this.createFileParent.key // 根目录为 '/'，其它目录末尾无 '/'
      const path = parentPath + '/' + name
      // 发送请求
      this.buttonLoading = true

      if (this.mode === 'file') {
        // 创建文件
        await this.client.putFileContents(path, data, {
          contentLength: false,
        })
      } else {
        // 创建文件夹
        await this.client.createDirectory(path)
      }
    },
    handleChange({ fileList }) {
      this.fileList = fileList
    },
    close() {
      this.$emit('close')
    },
  },
}
</script>

<style scoped>
/*noinspection ALL*/
.upload {
  padding-bottom: 1rem;
}
</style>
