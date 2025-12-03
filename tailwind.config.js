/** @type {import('tailwindcss').Config} */
export default {
  // 扫描所有需要 Tailwind 的文件
  content: [
    "./index.html",
    "./src/pages/landing/**/*.{js,jsx}",
    "./src/pages/communication/**/*.{js,jsx}",
    "./src/layout/LandingLayout.jsx",
  ],
  
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#1677ff', // Antd Blue
          'primary-hover': '#4096ff',
          blue: '#1677ff',
          gray: '#f0f2f5', // Antd layout background
          text: '#000000e0', // Antd main text
          'text-secondary': '#00000073', // Antd secondary text
        }
      },
      animation: {
        blob: "blob 7s infinite",
        "fade-in-up": "fadeInUp 0.6s ease-out",
      },
      animationDelay: {
        '2000': '2s',
        '4000': '4s',
        '6000': '6s',
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
