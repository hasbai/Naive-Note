<template>
  <div class="container">
    <div class="pdf-toolbar">
      <n-button size="tiny" @click="previousPage">上一页</n-button>
      <div class="input-page">
        <n-input-number
          v-model:value="selectedPage"
          :show-button="false"
          @keydown.enter="changePage"
          placeholder=""
          size="small"
          style="width: 1.5rem"
        />
        <div style="padding-left: 0.25rem">
          {{ '/  ' + numPages }}
        </div>
      </div>
      <n-button size="tiny" @click="nextPage">下一页</n-button>
    </div>
    <div class="viewer">
      <div ref="top" style="height: 2rem"></div>
      <div ref="beforeTop"></div>
      <pdf :src="src" :page="page"></pdf>
      <div ref="bottom" style="height: 100%"></div>
    </div>
  </div>
</template>

<script>
import pdf from 'vue3-pdf'
import { useLoadingBar, useMessage } from 'naive-ui'
export default {
  name: 'PDFViewer',
  components: {
    pdf,
  },
  props: {
    path: String,
  },
  data() {
    return {
      src: '',
      page: 1,
      selectedPage: 1,
      numPages: 1,
      bottomObserver: new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            this.nextPage()
          }
        },
        {
          threshold: 0.9,
        }
      ),
      topObserver: new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            this.previousPage()
          }
        },
        {
          threshold: 0.9,
        }
      ),
      loadingBar: useLoadingBar(),
      message: useMessage(),
    }
  },
  computed: {
    client() {
      return this.$store.getters.client
    },
  },
  watch: {
    page() {
      this.selectedPage = this.page
    },
  },
  methods: {
    async loadData() {
      // 加载数据
      this.loadingBar.start()
      const arrayBuffer = await this.client.getFileContents(this.path)
      this.loadingBar.finish()
      const data = new Uint8Array(arrayBuffer) // 需要转换为 typedArray
      this.src = pdf.createLoadingTask(data)
      // 获取页数
      const pdfDocument = await this.src.promise
      this.numPages = pdfDocument.numPages
      // 开始观察
      this.$refs.beforeTop.scrollIntoView()

      // await new Promise((r) => setTimeout(r, 100))
      this.topObserver.observe(this.$refs.top)
      this.bottomObserver.observe(this.$refs.bottom)
    },
    nextPage() {
      if (this.page < this.numPages) {
        this.page += 1
        this.$refs.beforeTop.scrollIntoView()
      } else {
        this.message.info('到底了')
      }
    },
    previousPage() {
      if (this.page > 1) {
        this.page -= 1
        this.$refs.beforeTop.scrollIntoView()
      } else {
        this.message.info('到顶了')
      }
    },
    changePage() {
      if (this.selectedPage > 0 && this.selectedPage <= this.numPages) {
        this.page = this.selectedPage
      } else {
        this.message.error('输入页码不合法')
      }
    },
  },
  created() {
    this.loadData()
  },
  mounted() {
    this.$nextTick(() => {
      this.$refs.top.focus()
    })
  },
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}
.viewer {
  overflow-y: auto;
}
.pdf-toolbar {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0;
}
.input-page {
  display: flex;
  padding: 0 1rem;
}
</style>
