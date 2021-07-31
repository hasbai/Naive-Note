<template>
  <div position="relative">
    <n-loading-bar-provider>
      <n-dialog-provider>
        <n-message-provider>
          <n-layout position="absolute">
            <!-- 页首 -->
            <n-layout-header class="footer" bordered
              >Naive Note</n-layout-header
            >

            <!--主体-->
            <router-view></router-view>

            <!-- 页尾 -->
            <n-layout-footer bordered position="absolute" class="footer">
              &copy; 2017 - {{ new Date().getFullYear() }} Shi
            </n-layout-footer>
          </n-layout>
        </n-message-provider>
      </n-dialog-provider>
    </n-loading-bar-provider>
  </div>
</template>

<style>
.footer {
  height: 64px;
  padding: 24px;
}

/*noinspection CssUnusedSymbol*/
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
