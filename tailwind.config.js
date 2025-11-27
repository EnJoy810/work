/** @type {import('tailwindcss').Config} */
export default {
  // 只扫描 landing 和 auth 相关目录
  content: [
    "./src/pages/landing/**/*.{js,jsx}",
    "./src/pages/auth/**/*.{js,jsx}",
    "./src/components/landing/**/*.{js,jsx}",
    "./src/layouts/LandingLayout.jsx",
  ],
  
  // 禁用全局样式重置，避免影响 Ant Design
  corePlugins: {
    preflight: false,
  },
  
  // 添加前缀，避免与 Ant Design 类名冲突
  prefix: 'tw-',
  
  theme: {
    extend: {
      animation: {
        blob: "blob 7s infinite",
        "fade-in-up": "fadeInUp 0.6s ease-out",
      },
      keyframes: {
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
        fadeInUp: {
          "0%": {
            opacity: "0",
            transform: "translateY(20px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
    },
  },
  plugins: [],
}
