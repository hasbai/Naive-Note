<template>
  <div style="margin-top: 200px">
    <n-result status="success" title="欢迎" description="">
      <template #footer>
        <n-button>Naive Note</n-button>
      </template>
    </n-result>
  </div>
</template>

<script>
export default {
  name: 'Welcome',
  methods: {
    update() {
      // pass
    },
  },
}
</script>

<style scoped></style>
