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
}
