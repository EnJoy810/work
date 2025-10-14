import CryptoJS from "crypto-js";

// 导入页面尺寸常量
import {
  PAGE_WIDTH,
  PAGE_HEIGHT,
  PAGE_MARGIN,
  PAGE_CONTENT_HEIGHT,
  PAGE_POINT,
} from "./constants";

// 导入页面题目计算相关工具函数
import {
  calculateQuestionHeight,
  calculatePageContentHeight,
  splitBlankQuestion,
  processPageQuestions,
  calculateQuestionsPagination,
} from "./pagePaginationUtils";

// 密码加密（使用SHA-256算法）
export const encryptPassword = (password) => {
  try {
    // 使用crypto-js库进行SHA-256加密
    const hash = CryptoJS.SHA256(password);
    // 将加密结果转换为十六进制字符串
    const hashHex = hash.toString(CryptoJS.enc.Hex);
    return hashHex;
  } catch (cryptoError) {
    console.warn("密码加密失败:", cryptoError);
    // 加密失败时返回原始密码
    return password;
  }
};

// 格式化时间
export const formatDate = (date, format = "YYYY-MM-DD HH:mm:ss") => {
  if (!date) return "";

  // 如果是字符串，转换为Date对象
  if (typeof date === "string") {
    date = new Date(date);
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return format
    .replace("YYYY", year)
    .replace("MM", month)
    .replace("DD", day)
    .replace("HH", hours)
    .replace("mm", minutes)
    .replace("ss", seconds);
};

// 获取URL参数
export const getUrlParams = () => {
  const params = {};
  const search = window.location.search.substring(1);
  const pairs = search.split("&");

  pairs.forEach((pair) => {
    const [key, value] = pair.split("=");
    if (key) {
      params[decodeURIComponent(key)] = decodeURIComponent(value || "");
    }
  });

  return params;
};

// 深拷贝
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }

  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item));
  }

  if (typeof obj === "object") {
    const clonedObj = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

// 判断是否为空
export const isEmpty = (value) => {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === "string" && value.trim() === "") {
    return true;
  }

  if (Array.isArray(value) && value.length === 0) {
    return true;
  }

  if (typeof value === "object" && Object.keys(value).length === 0) {
    return true;
  }

  return false;
};

// 防抖函数
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// 节流函数
export const throttle = (func, limit) => {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// 计算文件大小
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// 生成UUID
export const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// 生成唯一ID（基于时间戳和随机数）
export const generateUniqueId = () => {
  return Date.now() + Math.floor(Math.random() * 1000);
};

// 生成大题ID
export const generateSectionId = () => {
  return generateUniqueId();
};

// 生成分段ID（基于现有分段列表）
export const generateSegmentId = (segments) => {
  if (!segments || segments.length === 0) {
    return 1;
  }
  return Math.max(...segments.map((s) => s.id), 0) + 1;
};

// 生成题目ID
export const generateQuestionId = (prefix, number) => {
  if (prefix) {
    return `${prefix}-${number}`;
  }
  return `question-${number}`;
};

// 生成填空ID
export const generateBlankId = (baseId, index) => {
  return `blank-${baseId}-${index}`;
};

// 下载文件
export const downloadFile = (url, filename) => {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || "";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 验证邮箱
export const isValidEmail = (email) => {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
};

// 验证手机号
export const isValidPhone = (phone) => {
  const re = /^1[3-9]\d{9}$/;
  return re.test(phone);
};

// 金额格式化
export const formatMoney = (amount, decimals = 2) => {
  if (amount === null || amount === undefined) return "0.00";

  const num = parseFloat(amount);
  if (isNaN(num)) return "0.00";

  return num.toLocaleString("zh-CN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export {
  calculateQuestionHeight,
  calculatePageContentHeight,
  splitBlankQuestion,
  processPageQuestions,
  calculateQuestionsPagination,
};

// 计算元素相对于参考元素的位置信息
export const calculateElementPosition = (element, referenceElement) => {
  if (!element) {
    return null;
  }
  // console.log("elementRect 位置数据", element, "参考位置", referenceElement);

  // 获取页面尺寸信息
  const pageWidth = PAGE_WIDTH;
  const pageHeight = PAGE_HEIGHT;
  // const pageMargin = PAGE_MARGIN;
  const pagePoint = PAGE_POINT; // 相对于定位点的位置

  // 获取元素的位置和尺寸信息
  const elementRect = element.getBoundingClientRect();

  let referenceRect;

  // 计算相对于参考元素的位置信息
  if (referenceElement && referenceElement.getBoundingClientRect) {
    // 获取参考元素的位置信息
    referenceRect = referenceElement.getBoundingClientRect();
  } else {
    // 如果没有参考元素，使用页面尺寸作为参考
    referenceRect = {
      left: 0,
      top: 0,
      width: pageWidth,
      height: pageHeight,
      right: pageWidth,
      bottom: pageHeight,
    };
  }
  // console.log("referenceRect 左", elementRect.left, referenceRect.left);

  // 计算相对位置（相对于参考元素的左上角）
  const relativeLeft = parseFloat(
    (elementRect.left - referenceRect.left - pagePoint).toFixed(2)
  );
  const relativeTop = parseFloat(
    (elementRect.top - referenceRect.top - pagePoint).toFixed(2)
  );
  const relativeRight = parseFloat(
    (referenceRect.right - elementRect.right - pagePoint).toFixed(2)
  );
  const relativeBottom = parseFloat(
    (referenceRect.bottom - elementRect.bottom - pagePoint).toFixed(2)
  );

  const realWidth = pageWidth - 2 * pagePoint;
  const realHeight = pageHeight - 2 * pagePoint;

  // 计算百分比位置
  const leftPercent = parseFloat((relativeLeft / realWidth).toFixed(4));
  const rightPercent = parseFloat((relativeRight / realWidth).toFixed(4));
  const topPercent = parseFloat((relativeTop / realHeight).toFixed(4));
  const bottomPercent = parseFloat((relativeBottom / realHeight).toFixed(4));
  return {
    real: {
      width: parseFloat(elementRect.width.toFixed(2)),
      height: parseFloat(elementRect.height.toFixed(2)),
      left: relativeLeft,
      top: relativeTop,
      right: relativeRight,
      bottom: relativeBottom,
    },
    percent: {
      left: leftPercent,
      top: topPercent,
      right: rightPercent,
      bottom: bottomPercent,
    },
  };
};
