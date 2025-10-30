# 接口自动化测试指南

## 📦 安装依赖

```bash
# 进入项目目录
cd qingjing-grader-frontend

# 安装 Playwright
npm install @playwright/test --save-dev

# 安装浏览器
npx playwright install
```

## ⚙️ 配置

在运行测试前，请修改 `tests/api-test.spec.js` 中的测试账号：

```javascript
const TEST_USER = {
  username: 't4',      // 改为你的测试账号
  password: '123456'   // 改为你的测试密码
};
```

## 🚀 运行测试

### 1. 启动开发服务器

```bash
npm run dev
```

### 2. 运行测试（新开一个终端）

#### 方式一：命令行模式（推荐）
```bash
npm run test
```

#### 方式二：UI 模式（可视化）
```bash
npm run test:ui
```

#### 方式三：查看测试报告
```bash
npm run test:report
```

## 📊 测试内容

自动化测试会依次测试以下接口：

### 1️⃣ 登录测试
- ✅ POST /auth/login
- ⚠️ GET /teacher-class/class_list（可能失败，后端问题）

### 2️⃣ 首页接口
- ✅ GET /grading/grading/list

### 3️⃣ 创建考试页面
- ✅ GET /grading/answer-sheet-template/list
- ✅ GET /grading/exam/list

### 4️⃣ 题目批改页面
- ✅ GET /exam-question/exam-question-list
- ✅ GET /exam-question/student-list
- ✅ GET /exam-question
- ✅ GET /exam-question/grading

### 5️⃣ 数据分析页面
- ✅ GET /grading/result

### 6️⃣ 评分细则
- ✅ GET /grading/exam/guideline

## 📝 测试输出示例

```
✅ [POST] /api/auth/login - 200
✅ [GET] /api/grading/grading/list - 200
✅ [GET] /api/grading/answer-sheet-template/list - 200
✅ [GET] /api/grading/exam/list - 200
❌ [GET] /api/teacher-class/class_list - 500

================================================================================
📊 接口调用统计报告
================================================================================

总请求数: 15
成功请求: 14 ✅
失败请求: 1 ❌
唯一接口数: 12

已调用的接口列表:
--------------------------------------------------------------------------------
1. ✅ [POST] /api/auth/login (调用1次)
2. ✅ [GET] /api/grading/grading/list (调用2次)
3. ✅ [GET] /api/grading/answer-sheet-template/list (调用1次)
...
```

## 🎯 常用命令

```bash
# 运行所有测试
npm run test

# 运行特定测试
npx playwright test --grep "登录测试"

# 生成 HTML 报告
npm run test:report

# 调试模式
npx playwright test --debug

# 查看追踪文件
npx playwright show-trace trace.zip
```

## 📹 查看测试录像

测试失败时会自动录制视频，保存在 `test-results` 目录下。

## 🔧 故障排除

### 问题1：浏览器未安装
```bash
npx playwright install
```

### 问题2：端口占用
确保开发服务器运行在 `http://localhost:5173`

### 问题3：登录失败
检查 `TEST_USER` 配置是否正确

### 问题4：超时
增加 `playwright.config.js` 中的 `timeout` 值

## 💡 提示

- 测试会自动等待页面加载和接口响应
- 可以修改 `headless: false` 为 `true` 来隐藏浏览器窗口
- 失败的测试会自动截图和录像
- 完整统计报告会列出所有调用的接口

## 📚 更多资源

- [Playwright 官方文档](https://playwright.dev)
- [测试最佳实践](https://playwright.dev/docs/best-practices)

