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
});
