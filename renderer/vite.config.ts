import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',  // 使用相对路径，适配 Electron
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React 相关库打包在一起
          'react-vendor': ['react', 'react-dom'],
          // ECharts 单独打包
          'echarts': ['echarts'],
          // DnD Kit 打包在一起
          'dnd-kit': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities']
        }
      }
    },
    // 设置 chunk 大小警告阈值
    chunkSizeWarningLimit: 1000
  }
})
