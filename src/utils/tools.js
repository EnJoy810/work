// 格式化时间
export const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return ''
  
  // 如果是字符串，转换为Date对象
  if (typeof date === 'string') {
    date = new Date(date)
  }
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

// 获取URL参数
export const getUrlParams = () => {
  const params = {}
  const search = window.location.search.substring(1)
  const pairs = search.split('&')
  
  pairs.forEach(pair => {
    const [key, value] = pair.split('=')
    if (key) {
      params[decodeURIComponent(key)] = decodeURIComponent(value || '')
    }
  })
  
  return params
}

// 深拷贝
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime())
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item))
  }
  
  if (typeof obj === 'object') {
    const clonedObj = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

// 判断是否为空
export const isEmpty = (value) => {
  if (value === null || value === undefined) {
    return true
  }
  
  if (typeof value === 'string' && value.trim() === '') {
    return true
  }
  
  if (Array.isArray(value) && value.length === 0) {
    return true
  }
  
  if (typeof value === 'object' && Object.keys(value).length === 0) {
    return true
  }
  
  return false
}

// 防抖函数
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// 节流函数
export const throttle = (func, limit) => {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// 计算文件大小
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 生成UUID
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// 下载文件
export const downloadFile = (url, filename) => {
  const link = document.createElement('a')
  link.href = url
  link.download = filename || ''
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 验证邮箱
export const isValidEmail = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(email)
}

// 验证手机号
export const isValidPhone = (phone) => {
  const re = /^1[3-9]\d{9}$/
  return re.test(phone)
}

// 金额格式化
export const formatMoney = (amount, decimals = 2) => {
  if (amount === null || amount === undefined) return '0.00'
  
  const num = parseFloat(amount)
  if (isNaN(num)) return '0.00'
  
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

// 计算元素相对于参考元素的位置信息
export const calculateElementPosition = (element, referenceElement) => {
  if (!element) {
    return null;
  }

  // 获取元素的位置和尺寸信息
  const rect = element.getBoundingClientRect();
  
  // 计算相对于参考元素的位置信息
  if (referenceElement && referenceElement.getBoundingClientRect) {
    // 获取参考元素的位置信息
    const refRect = referenceElement.getBoundingClientRect();
    
    // 计算相对位置（相对于参考元素的左上角）
    return {
      width: rect.width,
      height: rect.height,
      // 相对于整个文档的绝对位置
      absolute: {
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        x: rect.x,
        y: rect.y
      },
      // 相对于参考元素的位置
      relativeToReference: {
        left: rect.left - refRect.left,
        top: rect.top - refRect.top,
        right: refRect.right - rect.right,
        bottom: refRect.bottom - rect.bottom
      }
    };
  } else {
    // 如果没有参考元素，则只返回绝对位置
    return {
      width: rect.width,
      height: rect.height,
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      x: rect.x,
      y: rect.y
    };
  }
};