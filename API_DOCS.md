# 清境智能考试系统接口文档规范

## 1. 接口基础架构

### 1.1 API请求封装
项目使用统一的API请求封装，位于 <mcfile name="request.js" path="/Users/liujian/Desktop/app/exam/src/utils/request.js"></mcfile>，基于Axios实现，提供以下核心功能：

- **请求拦截器**：自动添加Authorization头信息（Bearer Token）
- **响应拦截器**：统一错误处理、状态码处理
- **请求方法**：封装了get、post、put、delete和upload方法
- **超时处理**：默认30秒超时时间
- **内容类型**：默认application/json

### 1.2 代理配置
在 <mcfile name="vite.config.js" path="/Users/liujian/Desktop/app/exam/vite.config.js"></mcfile> 中配置了API代理，开发环境下自动转发：
```javascript
proxy: {
  '/api': {
    target: "http://47.115.91.61:8080/api",
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '')
  }
}
```

## 2. 认证机制

### 2.1 Token认证
系统采用Bearer Token认证机制，具体流程如下：

1. 登录成功后，后端返回token
2. 将token存储在Redux中并持久化到localStorage
3. 请求拦截器自动在请求头中添加Authorization: `Bearer {token}`
4. 401错误时自动清除用户信息并跳转到登录页

### 2.2 认证代码示例
```javascript
// 请求拦截器自动添加token
export const request = axios.create(/* 配置 */);

request.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.user.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

## 3. 响应数据格式规范

### 3.1 成功响应格式
所有API成功响应应遵循以下格式：
```json
{
  "code": "200",
  "message": "success",
  "data": { /* 具体业务数据 */ }
}
```

### 3.2 错误响应格式
错误响应应包含错误码和错误信息：
```json
{
  "code": "错误码",
  "message": "错误描述信息"
}
```

### 3.3 响应处理规范
在响应拦截器中统一处理响应数据：
```javascript
request.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.code !== "200") {
      // 处理错误情况
      console.error("请求错误:", res.message);
      if (res.message) {
        message.error(res.message);
      }
      return Promise.reject(new Error(res.message));
    }
    return res;
  },
  (error) => { /* 处理网络/状态码错误 */ }
);
```

## 4. API调用规范

### 4.1 基本调用方式
所有API调用应使用统一封装的request模块：

```javascript
import request from "../../utils/request";

// GET请求示例
const response = await request.get("/api/path", {
  param1: value1,
  param2: value2
});

// POST请求示例
const response = await request.post("/api/path", {
  field1: value1,
  field2: value2
});
```

### 4.2 异步处理模式
统一使用async/await进行异步处理，配合try/catch进行错误捕获：

```javascript
const fetchData = async () => {
  try {
    setLoading(true);
    const response = await request.get("/api/path");
    // 处理成功响应
    setData(response.data);
  } catch (error) {
    console.error("获取数据失败:", error);
    // 显示错误提示
    showError("获取数据失败");
  } finally {
    setLoading(false);
  }
};
```

### 4.3 Loading状态管理
所有API调用必须包含loading状态管理，避免用户重复操作：

```javascript
// 定义loading状态
const [loading, setLoading] = useState(false);

// API调用前后设置loading状态
setLoading(true);
// API调用
setLoading(false);
```

## 5. 常见接口示例

### 5.1 认证相关接口

#### 5.1.1 用户登录
- **URL**: `/auth/login`
- **Method**: `POST`
- **请求参数**:
  ```json
  {
    "username": "用户名",
    "password": "加密后的密码"
  }
  ```
- **返回数据**:
  ```json
  {
    "code": "200",
    "message": "success",
    "data": {
      "userInfo": { /* 用户信息 */ },
      "token": "认证令牌"
    }
  }
  ```
- **调用示例**:
  ```javascript
  // 密码加密
  const encryptedValues = { ...values };
  encryptedValues.password = encryptPassword(values.password);
  
  // 调用登录接口
  const response = await request.post("/auth/login", encryptedValues);
  ```

### 5.2 考试管理相关接口

#### 5.2.1 获取考试列表
- **URL**: `/grading/grading/list`
- **Method**: `GET`
- **返回数据**:
  ```json
  {
    "code": "200",
    "message": "success",
    "data": [ /* 考试列表数据 */ ]
  }
  ```
- **调用示例**:
  ```javascript
  const response = await request.get("/grading/grading/list");
  setRecentExams(response.data || []);
  ```

#### 5.2.2 获取考试分析结果
- **URL**: `/grading/result`
- **Method**: `GET`
- **请求参数**: `{ grading_id: "考试ID" }`
- **返回数据**:
  ```json
  {
    "code": "200",
    "message": "success",
    "data": [ /* 分析结果数据 */ ]
  }
  ```
- **调用示例**:
  ```javascript
  const response = await request.get("/grading/result", {
    grading_id: id
  });
  ```

## 6. 文件上传接口规范

### 6.1 上传方法
使用专用的upload方法进行文件上传，支持进度回调：

```javascript
// 文件上传方法
upload(url, file, onUploadProgress) {
  const formData = new FormData();
  formData.append("file", file);

  return request({
    url,
    method: "post",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress,
  });
}
```

### 6.2 上传组件集成
与Ant Design的Upload组件集成示例：

```javascript
<Dragger
  accept=".pdf,.jpg,.jpeg,.png"
  fileList={fileList}
  beforeUpload={handleBeforeUpload}
  onChange={handleFileChange}
  showUploadList={false}
>
  <p className="ant-upload-drag-icon">
    <UploadOutlined />
  </p>
  <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
  <p className="ant-upload-hint">支持PDF、JPG、PNG格式文件</p>
</Dragger>
```

## 7. 错误处理规范

### 7.1 HTTP状态码处理
统一处理常见的HTTP状态码错误：

```javascript
switch (error.response.status) {
  case 401:
    // 未授权，清除用户信息并跳转到登录页
    console.error("未授权，请重新登录");
    store.dispatch(clearUserInfo());
    window.location.href = "/login";
    break;
  case 403:
    console.error("拒绝访问");
    break;
  case 404:
    console.error("请求地址不存在");
    break;
  case 500:
    console.error("服务器错误");
    break;
  default:
    console.error("请求失败");
}
```

### 7.2 业务错误处理
处理后端返回的业务错误：

```javascript
// 在响应拦截器中
if (res.code !== "200") {
  // 处理错误情况
  console.error("请求错误:", res.message);
  // 使用antd的message组件显示错误提示
  if (res.message) {
    message.error(res.message);
  }
  return Promise.reject(new Error(res.message));
}
```

## 8. 最佳实践

### 8.1 请求参数验证
在发起API请求前，对必要参数进行验证：

```javascript
// 参数验证示例
const handleUploadAnswerSheet = () => {
  // 检查文件是否上传
  if (!answerSheetFile) {
    showError("请上传答题卡文件");
    return;
  }

  // 检查是否有必要ID
  if (!gradingId) {
    showError("缺少评分ID，请从正确的页面进入");
    return;
  }
  
  // 执行上传操作
};
```

### 8.2 日志记录
所有API调用应包含完整的日志记录，便于调试：

```javascript
try {
  const response = await request.get("/api/path");
  console.log("API调用成功:", response);
} catch (error) {
  console.error("API调用失败:", error);
}
```

### 8.3 消息提示
使用统一的消息提示工具向用户反馈操作结果：

```javascript
import { useMessageService } from "../../components/common/message";

const { showSuccess, showError, showInfo } = useMessageService();

// 成功提示
showSuccess("操作成功");

// 错误提示
showError("操作失败");

// 信息提示
showInfo("处理中，请稍候");
```

## 9. 接口安全规范

### 9.1 敏感数据加密
敏感数据（如密码）在发送前必须进行加密处理：

```javascript
// 密码加密处理
const encryptedValues = { ...values };
try {
  // 调用公共的密码加密函数
  encryptedValues.password = encryptPassword(values.password);
} catch (cryptoError) {
  console.warn("密码加密失败，使用原始密码:", cryptoError);
  // 加密失败时使用原始密码
  encryptedValues.password = values.password;
}
```

### 9.2 错误信息保护
生产环境中避免向用户暴露详细的错误信息，防止信息泄露：

```javascript
// 开发环境显示详细错误，生产环境显示通用错误
if (process.env.NODE_ENV === 'development') {
  showError(`操作失败: ${error.message}`);
} else {
  showError('操作失败，请联系管理员');
}
```

## 10. 接口文档维护

### 10.1 文档更新
- 新增接口时，需同步更新此文档
- 修改接口时，需记录变更内容和版本
- 废弃接口时，需标记为废弃并说明替代方案

### 10.2 版本控制
接口变更应遵循版本控制原则，建议在URL中包含版本号：
```
/api/v1/resource
/api/v2/resource
```

---
**文档版本**: v1.0.0
**更新时间**: " + new Date().toLocaleString() + "
**维护人**: 技术开发团队