module.exports = {
  devServer: {
    proxy: {
      '/proxy': {
        target: 'https://note.hath.top',
        secure: true,
        changeOrigin: true,
        pathRewrite: { '^/proxy': '/proxy' },
      },
    },
  },
  pwa: {
    name: 'Naive Note',
    themeColor: '#3175D0',
    msTileColor: '#3175D0',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black-translucent',
    workboxPluginMode: 'GenerateSW',
    workboxOptions: {
      skipWaiting: true,
      clientsClaim: true,
      navigateFallback: '/',
    },
    manifestOptions: {
      short_name: 'Naive Note',
      lang: 'zh-CN',
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
    },
  },
}
