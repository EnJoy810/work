import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  
  // 超时设置
  timeout: 60000,
  expect: {
    timeout: 10000
  },
  
  // 失败重试
  retries: 0,
  
  // 并行执行
  workers: 1,
  
  // 报告配置
  reporter: [
    ['html', { outputFolder: 'test-results/html' }],
    ['list']
  ],
  
  use: {
    // 基础 URL
    baseURL: 'http://localhost:5173',
    
    // 截图
    screenshot: 'only-on-failure',
    
    // 视频
    video: 'retain-on-failure',
    
    // 追踪
    trace: 'on-first-retry',
    
    // 浏览器设置
    headless: false, // 显示浏览器窗口，方便观察
    viewport: { width: 1920, height: 1080 },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // 开发服务器配置（自动启动）
  webServer: {
    command: 'npm run dev',
    port: 5173,
    timeout: 120000,
    reuseExistingServer: true, // 如果已经在运行就复用
  },
});

