import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5666,
    proxy: {
      // 后台接口走 /admin；工具试用台需调前台工具接口，一并代理到后端 8989
      '/admin': { target: 'http://localhost:8989', changeOrigin: true },
      '/query': { target: 'http://localhost:8989', changeOrigin: true },
      '/pdf': { target: 'http://localhost:8989', changeOrigin: true },
      '/image': { target: 'http://localhost:8989', changeOrigin: true },
      '/doc': { target: 'http://localhost:8989', changeOrigin: true },
      '/tool': { target: 'http://localhost:8989', changeOrigin: true },
    },
  },
})
