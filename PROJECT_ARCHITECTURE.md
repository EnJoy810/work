# 清境智能考试系统 - 项目架构文档

## 1. 项目概述
清境智能考试系统是一个基于React + Vite构建的前端应用，提供考试管理、答题卷设计、学生管理等功能，采用现代化的前端架构设计。

## 2. 目录结构
项目采用模块化的目录组织方式，主要包括以下核心目录：
```text
src/
├── assets/             # 静态文件
├── components/         # 公共组件
├── layout/             # 布局组件
├── pages/              # 页面组件
│   ├── dashboard/      # 仪表盘相关页面
│   ├── exam/           # 考试相关页面
│   ├── student-management/ # 学生管理页面
│   └── system-settings/ # 系统设置页面
├── router/             # 路由配置
├── store/              # Redux状态管理
└── utils/              # 工具函数
```

## 3. 路由架构

### 3.1 路由配置
路由配置位于 `src/router/index.jsx`，采用React Router v6的createBrowserRouter实现。

### 3.2 路由层次结构
- 登录路由：`/login` - 无需布局包裹的独立页面
- 主布局路由：`/` - 使用ProtectedRoute保护，包含主要应用布局
- 仪表盘：`/`
- 创建考试：`/create-exam`
- 上传答题卡：`/upload-answer-sheet`
- 学生管理：`/users`
- 答题卷设计：`/exam-paper-design`
- 独立功能路由：如`/exam-paper-preview` - 需要登录但不使用标准布局

### 3.3 路由保护机制
使用 `src/router/ProtectedRoutes.jsx` 实现路由保护，基于Redux中的登录状态判断。

## 4. API请求机制

### 4.1 请求封装
API请求封装在 `src/utils/request.js` 中，基于Axios实现，提供了以下核心功能：

- 请求拦截器：自动添加Authorization头信息（Bearer Token）
- 响应拦截器：统一错误处理、状态码处理（401未授权、404资源不存在等）
- 常用请求方法：封装了get、post、put、delete和upload方法

### 4.2 代理配置
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

## 5. 状态管理
使用Redux Toolkit + redux-persist实现状态管理，配置位于 `src/store/index.js`。

- 持久化配置：使用localStorage持久化用户信息
- 主要reducer：
  - user：管理用户登录状态和信息
  - preview：管理预览相关状态

## 6. 工具函数规范
工具函数集中在 `src/utils/tools.js` 中，主要包括：

- 密码加密：`encryptPassword(password)` - 使用crypto-js库实现SHA-256加密
- 时间格式化：`formatDate(date, format)` - 支持自定义时间格式
- URL参数获取：`getUrlParams()` - 解析URL查询参数
- 深拷贝：`deepClone(obj)` - 对象深拷贝实现
- 空值判断：`isEmpty(value)` - 全面判断各种类型的空值情况

## 7. 页面组件组织

### 7.1 统一导出机制
所有页面组件通过统一入口文件导出，如 `src/pages/index.js`：
```javascript
export default {
  dashboard,
  exam,
  questionBank,
  studentManagement,
  systemSettings,
  NotFound,
  FeatureUnderDevelopment
};
```

### 7.2 布局组件
布局组件位于 `src/layout/index.jsx`，提供应用的整体结构，包含顶部导航栏和主内容区。

## 8. 构建与部署

### 8.1 构建配置
在 `vite.config.js` 中配置了构建优化：
- 手动分割大型依赖包
- 调整chunk大小警告阈值
- 启用gzip压缩

### 8.2 部署配置
- Nginx配置文件：`exam.conf`
- 支持History路由模式处理

## 9. 参数传递规范

### 9.1 URL参数
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

### 9.2 组件间通信
- 父子组件：通过props传递
- 非父子组件：通过Redux状态共享或回调函数