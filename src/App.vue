<template>
  <div position="relative">
    <n-loading-bar-provider>
      <n-dialog-provider>
        <n-message-provider>
          <router-view></router-view>
        </n-message-provider>
      </n-dialog-provider>
    </n-loading-bar-provider>
  </div>
</template>

<!--suppress CssUnusedSymbol -->
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
.n-icon svg {
  height: 100%;
  width: 100%;
}
.n-icon {
  display: flex;
  height: 1rem;
  width: 1rem;
}
/*vditor的字数统计，鼠标悬停时会变成气泡，与上方部件冲突，设置position: static属性可避免*/
.vditor-toolbar .vditor-tooltipped {
  position: static;
}
</style>
