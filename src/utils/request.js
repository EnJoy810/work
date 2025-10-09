import axios from "axios";
import { store } from "../store";
import { message } from "antd";
import { clearUserInfo } from "../store/slices/userSlice";

// 创建axios实例
const request = axios.create({
  baseURL: "/api", // 默认API基础路径
  timeout: 30000, // 超时时间 30s
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 从Redux store中获取token
    const state = store.getState();
    const token = state.user.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    // 根据后端接口规范处理响应数据
    const res = response.data;
    // console.log("res--->", res);
    if (res.code !== "200") {
      // 处理错误情况
      console.error("请求错误:", res.message);
      // 使用antd的message组件显示错误提示
      if (res.message) {
        message.error(res.message);
      }
      return Promise.reject(new Error(res.message));
    }
    return res;
  },
  (error) => {
    // 处理网络错误
    console.error("网络错误:", error.message);
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 未授权，清除用户信息并跳转到登录页
          console.error("未授权，请重新登录");
          
          // 清除用户登录信息和token
          store.dispatch(clearUserInfo());
          
          // 跳转到登录页
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
    }
    return Promise.reject(error);
  }
);

// 封装常用的请求方法
export default {
  // GET请求
  get(url, params = {}, config = {}) {
    return request({
      url,
      method: "get",
      params,
      ...config,
    });
  },

  // POST请求
  post(url, data = {}, config = {}) {
    return request({
      url,
      method: "post",
      data,
      ...config,
    });
  },

  // PUT请求
  put(url, data = {}, config = {}) {
    return request({
      url,
      method: "put",
      data,
      ...config,
    });
  },

  // DELETE请求
  delete(url, params = {}, config = {}) {
    return request({
      url,
      method: "delete",
      params,
      ...config,
    });
  },

  // 上传文件
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
  },
};
