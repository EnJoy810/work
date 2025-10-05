import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 配置API代理
      "/api": {
        target: "http://192.168.18.137:8080/api", // 后端服务器地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
    },
  },
  build: {
    // 优化构建输出
    rollupOptions: {
      output: {
        // 手动分割大型依赖包
        manualChunks: {
          // 将 antd 及其相关依赖单独打包
          antd: ['antd'],
          // 将 chart.js 和 react-chartjs-2 单独打包
          chart: ['chart.js', 'react-chartjs-2'],
          // 将 pdf 相关库单独打包
          pdf: ['html2pdf.js', 'jspdf', 'html2canvas'],
          // 将 redux 相关库单独打包
          redux: ['@reduxjs/toolkit', 'react-redux', 'redux', 'redux-persist'],
          // 将 react 和 react-dom 单独打包
          react: ['react', 'react-dom'],
          // 将 react-router 相关库单独打包
          router: ['react-router-dom'],
        },
      },
    },
    // 调整chunk大小警告阈值为1000kb
    chunkSizeWarningLimit: 1000,
    // 启用gzip压缩
    assetsInlineLimit: 4096,
  },
});
