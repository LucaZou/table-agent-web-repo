const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/api': {
        target: 'http://backend:8000',
        changeOrigin: true,
        logLevel: 'debug',
        onProxyReq(proxyReq) {
          console.log(`Proxying request to: ${proxyReq.path}`);
        },
        onError: (err) => {
          console.error('Proxy error:', err);
        }
      },
      '/static': {
        target: 'http://backend:8000',
        changeOrigin: true,
        logLevel: 'debug'
      }
    }
  }
}) 