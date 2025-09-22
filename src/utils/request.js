import axios from 'axios'

// 创建axios实例
const request = axios.create({
  baseURL: '/api', // 默认API基础路径
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 可以在这里添加token等认证信息
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    // 根据后端接口规范处理响应数据
    const res = response.data
    if (res.code !== 200 && res.code !== 0) {
      // 处理错误情况
      console.error('请求错误:', res.message || '未知错误')
      return Promise.reject(new Error(res.message || '未知错误'))
    }
    return res
  },
  error => {
    // 处理网络错误
    console.error('网络错误:', error.message)
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 未授权，跳转到登录页
          console.error('未授权，请重新登录')
          break
        case 403:
          console.error('拒绝访问')
          break
        case 404:
          console.error('请求地址不存在')
          break
        case 500:
          console.error('服务器错误')
          break
        default:
          console.error('请求失败')
      }
    }
    return Promise.reject(error)
  }
)

// 封装常用的请求方法
export default {
  // GET请求
  get(url, params = {}, config = {}) {
    return request({
      url,
      method: 'get',
      params,
      ...config
    })
  },

  // POST请求
  post(url, data = {}, config = {}) {
    return request({
      url,
      method: 'post',
      data,
      ...config
    })
  },

  // PUT请求
  put(url, data = {}, config = {}) {
    return request({
      url,
      method: 'put',
      data,
      ...config
    })
  },

  // DELETE请求
  delete(url, params = {}, config = {}) {
    return request({
      url,
      method: 'delete',
      params,
      ...config
    })
  },

  // 上传文件
  upload(url, file, onUploadProgress) {
    const formData = new FormData()
    formData.append('file', file)
    
    return request({
      url,
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress
    })
  }
}