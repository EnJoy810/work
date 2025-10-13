# 清境智能考试系统 - 前端交接文档

## 1. 项目概述
清境智能考试系统是一个基于React + Vite构建的现代化前端应用，提供考试管理、答题卷设计、学生管理、数据统计与分析等功能，采用前后端分离架构。

## 2. 技术栈与依赖

### 核心技术
- **前端框架**: React 18.2.0
- **构建工具**: Vite 7.1.6
- **路由管理**: React Router 6.22.3
- **状态管理**: Redux Toolkit 2.9.0 + Redux Persist 6.0.0
- **UI组件库**: Ant Design 5.27.4
- **HTTP请求**: Axios 1.12.2
- **图表库**: Chart.js 4.5.0 + React Chart.js 2 5.3.0
- **PDF生成**: html2pdf.js 0.12.1 + jsPDF 3.0.3
- **加密工具**: Crypto-js 4.2.0

### 开发工具
- **代码规范**: ESLint 9.35.0
- **TypeScript支持**: @types/react, @types/react-dom

## 3. 目录结构
项目采用模块化的目录组织方式，主要包括以下核心目录：

```text
src/
├── assets/             # 静态资源文件
├── components/         # 公共组件
├── layout/             # 布局组件
├── pages/              # 页面组件
│   ├── dashboard/      # 仪表盘相关页面
│   ├── exam/           # 考试相关页面
│   ├── student-management/ # 学生管理页面
│   └── system-settings/ # 系统设置页面
├── router/             # 路由配置
├── store/              # Redux状态管理
│   ├── index.js        # Store配置
│   └── slices/         # Reducers切片
└── utils/              # 工具函数
    ├── request.js      # API请求封装
    └── tools.js        # 通用工具函数
```

## 4. 路由架构

### 路由配置
路由配置位于 `src/router/index.jsx`，采用React Router v6的createBrowserRouter实现。

### 路由层次结构
- **登录路由**: `/login` - 无需布局包裹的独立页面
- **主布局路由**: `/` - 使用ProtectedRoute保护，包含主要应用布局
  - **仪表盘**: `/` - 首页数据概览
  - **创建考试**: `/create-exam`
  - **上传答题卡**: `/upload-answer-sheet`
  - **学生管理**: `/users`
  - **答题卷设计**: `/exam-paper-design`
    - 语文试卷: `/exam-paper-design/chinese`
    - 数学试卷: `/exam-paper-design/math`
    - 英语试卷: `/exam-paper-design/english`
  - **数据分析**: `/data-analysis`
  - **主观题评分**: `/essay-grading`
  - **题目分析**: `/question-analysis`
- **独立功能路由**: `/exam-paper-preview` - 需要登录但不使用标准布局

### 路由保护机制
使用 `src/router/ProtectedRoutes.jsx` 实现路由保护，基于Redux中的登录状态判断用户是否有权限访问。

## 5. 状态管理
使用Redux Toolkit + redux-persist实现状态管理，配置位于 `src/store/index.js`。

### 主要Reducer
- **user**: 管理用户登录状态、用户信息和Token
- **preview**: 管理预览相关状态

### 持久化配置
使用localStorage持久化用户信息，确保刷新页面后仍能保持登录状态。

### 核心Actions
```javascript
// 设置用户信息
export const { setUserInfo, clearUserInfo, updateUserInfo } = userSlice.actions;
```

## 6. API请求机制

### 请求封装
API请求封装在 `src/utils/request.js` 中，基于Axios实现，提供了以下核心功能：

- **请求拦截器**: 自动添加Authorization头信息（Bearer Token）
- **响应拦截器**: 统一错误处理、状态码处理（401未授权、404资源不存在等）
- **常用请求方法**: 封装了get、post、put、delete和upload方法

### 代理配置
在 `vite.config.js` 中配置了API代理：
```javascript
proxy: {
  '/api': {
    target: "http://47.115.91.61:8080/api",
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '')
  }
}
```

## 7. 页面组件组织

### 统一导出机制
所有页面组件通过统一入口文件导出，如 `src/pages/index.js`，便于路由配置和组件引用。

### 布局组件
布局组件位于 `src/layout/index.jsx`，提供应用的整体结构，包含顶部导航栏和主内容区。

## 8. 核心功能模块

### 8.1 考试管理模块
- **功能**: 创建考试、上传答题卡、查看评分进度
- **核心页面**: CreateExam.jsx, UploadAnswerSheet.jsx, ScoreProcess.jsx
- **主要流程**: 创建考试 -> 上传答题卡 -> AI自动评分 -> 查看评分进度 -> 数据分析

### 8.2 答题卷设计模块
- **功能**: 设计不同科目的考试试卷
- **核心页面**: ExamPaperDesign.jsx, ChinesePaperDesign.jsx, MathPaperDesign.jsx, EnglishPaperDesign.jsx
- **特色功能**: 支持数学公式渲染、英文高亮标记等科目特色功能

### 8.3 学生管理模块
- **功能**: 管理学生信息、查看学生考试记录
- **核心页面**: UserList.jsx

### 8.4 数据分析模块
- **功能**: 考试数据统计、题目难度分析、学生成绩分析
- **核心页面**: DataAnalysis.jsx, QuestionAnalysis.jsx

## 9. 工具函数规范
工具函数集中在 `src/utils/tools.js` 中，主要包括：

- **密码加密**: `encryptPassword(password)` - 使用crypto-js库实现SHA-256加密
- **时间格式化**: `formatDate(date, format)` - 支持自定义时间格式
- **URL参数获取**: `getUrlParams()` - 解析URL查询参数
- **深拷贝**: `deepClone(obj)` - 对象深拷贝实现
- **空值判断**: `isEmpty(value)` - 全面判断各种类型的空值情况

## 10. 参数传递规范

### URL参数
组件中通过URLSearchParams获取URL参数，如 `src/pages/dashboard/UploadAnswerSheet.jsx` 中：
```javascript
useEffect(() => {
  const searchParams = new URLSearchParams(location.search);
  const gradingIdFromParams = searchParams.get("grading_id");
  if (gradingIdFromParams) {
    setGradingId(gradingIdFromParams);
  }
}, [location]);
```

### 组件间通信
- **父子组件**: 通过props传递
- **非父子组件**: 通过Redux状态共享或回调函数

## 11. 构建与部署

### 构建配置
在 `vite.config.js` 中配置了构建优化：
- 手动分割大型依赖包
- 调整chunk大小警告阈值
- 启用gzip压缩

### 构建命令
```bash
npm run build  # 生产环境构建
npm run dev    # 开发环境启动
npm run lint   # 代码规范检查
npm run preview # 预览构建后的应用
```

### 部署配置
- **Nginx配置文件**: `exam.conf`
- **支持History路由模式处理**
- **部署操作**: 
```bash
sftp lj@47.115.91.61  # 连接服务器
put -r dist /home/lj/exam    # 上传构建文件到服务器
```

## 12. 开发流程与规范

### 代码规范
- 使用ESLint进行代码规范检查
- 遵循React Hooks最佳实践
- 组件命名采用大驼峰命名法
- 函数命名采用小驼峰命名法
- 常量采用全大写+下划线命名法

### 提交规范
- 功能开发前确保代码库已更新至最新版本
- 提交前执行 `npm run lint` 检查代码规范
- 提交信息简洁明了，描述本次修改的主要内容

## 13. 常见问题与解决方案

### 13.1 权限问题
- 问题: 页面访问时出现401错误
- 解决方案: 检查用户登录状态和Token是否有效，清除localStorage后重新登录

---