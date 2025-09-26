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

// 导入页面尺寸常量
import {
  PAGE_WIDTH,
  PAGE_HEIGHT,
  PAGE_MARGIN,
  PAGE_CONTENT_HEIGHT,
} from "./constants";

// 计算元素相对于参考元素的位置信息
export const calculateElementPosition = (element, referenceElement) => {
  if (!element) {
    return null;
  }

  // 获取页面尺寸信息
  const pageWidth = PAGE_WIDTH;
  const pageHeight = PAGE_HEIGHT;
  const pageMargin = PAGE_MARGIN;

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

  // 计算相对位置（相对于参考元素的左上角）
  const relativeLeft = parseFloat(
    (elementRect.left - referenceRect.left).toFixed(2)
  );
  const relativeTop = parseFloat(
    (elementRect.top - referenceRect.top).toFixed(2)
  );
  const relativeRight = parseFloat(
    (referenceRect.right - elementRect.right).toFixed(2)
  );
  const relativeBottom = parseFloat(
    (referenceRect.bottom - elementRect.bottom).toFixed(2)
  );

  const realWidth = pageWidth - 2 * pageMargin;
  const realHeight = pageHeight - 2 * pageMargin;

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
      // 相对于整个文档的绝对位置
      // absolute: {
      //   left: elementRect.left,
      //   top: elementRect.top,
      //   right: elementRect.right,
      //   bottom: elementRect.bottom,
      //   x: elementRect.x,
      //   y: elementRect.y
      // }
    },
    percent: {
      left: leftPercent,
      top: topPercent,
      right: rightPercent,
      bottom: bottomPercent,
    },
  };
};

// 计算题目高度
// 根据题目类型返回计算的高度
export const calculateQuestionHeight = (question) => {
  // 题目类型高度常量
  const objectHeight = 157.3; // 选择题高度
  const baseShortFirstHeight = 87.33; // 填空题基础高度（包含标题的一行高度）
  const blankLineHeight = 40; // 填空题每行高度

  // 根据题目类型返回对应的高度
  if (question.type === "objective") {
    return objectHeight;
  } else if (question.type === "blank") {
    return baseShortFirstHeight + (question.totalLines - 1) * blankLineHeight;
  }

  // 默认返回0
  return 0;
};

// 计算题目分页
// 接收题目参数，返回分页题目数组和分页总数
export const calculateQuestionsPagination = (questions, options = {}) => {
  console.log("calculateQuestionsPagination 计算题目分页", questions, options);
  // 如果没有题目，返回默认值
  if (!questions || questions.length === 0) {
    return {
      paginatedQuestions: [],
      totalPages: 1,
    };
  }

  const { hasNote = true } = options;

  // 页面高度常量（从常量文件导入的对应值）
  const titleHeight = 63.09; // 标题高度
  const subjectHeight = 41; // 考试科目高度
  const classHeight = 72.11; // 班级高度
  const noteHeight = 182.07; // 注意事项高度

  // 累加四个高度值计算内容高度，只有当hasNote为true时才添加noteHeight
  const totalContentHeight =
    titleHeight + subjectHeight + classHeight + (hasNote ? noteHeight : 0);

  // 计算可用内容高度（每页内容高度减去标题、考试科目、班级、注意事项的高度）
  const availableContentHeight = PAGE_CONTENT_HEIGHT - totalContentHeight;
  console.log("availableContentHeight 1", availableContentHeight);

  // 计算第一面的剩余高度
  let firstPageAvailableHeight = availableContentHeight;
  // let currentPage = 2; // 当前计算的页面
  let paginatedQuestions = []; // 最终的题目结果
  let currentPageQuestions = []; // 当前页面的题目
  let remindIndex = 0; // 剩余题目索引
  for (let index = 0; index < questions.length; index++) {
    const element = questions[index];
    // 调用抽离的函数计算题目高度
    const questionHeight = calculateQuestionHeight(element);
    console.log("题目高度计算: ", questionHeight, element);
    firstPageAvailableHeight -= questionHeight;
    console.log("每道题添加后剩余高度 2", firstPageAvailableHeight);

    // 题目计算完，判断是否需要分页 留一定余量
    const remainingHeight = 0;
    if (firstPageAvailableHeight < -remainingHeight) {
      remindIndex = index + 1;
      // 第一面剩余高度不足，需要分页
      // 查看每道题的高度 细分分页题目数据
      console.log(
        "第一面剩余高度不足，需要分页",
        firstPageAvailableHeight,
        element
      );
      if (element.type === "objective") {
        // 当前题是选择题  直接下一页
      } else if (element.type === "blank") {
        const titleHeight = 23.99; // 标题高度
        const questionWrapPadding = 23.33; // 题目包裹间距
        const lineHeight = 40; // 填空题每行高度
        if (element.fillType === "short") {
          // 短填空题 分页
          // 计算剩余可显示行数
          const remainingLines = Math.floor(
            (firstPageAvailableHeight +
              questionHeight +
              remainingHeight -
              titleHeight -
              questionWrapPadding) /
              lineHeight
          );

          // 计算需要分割的位置
          // 每行显示的空数
          const blanksPerLine = element.blanksPerLine || 4;

          // 计算可显示的空数
          const visibleBlanks = remainingLines * blanksPerLine;

          console.log(
            "剩余可显示行数: ",
            remainingLines,
            "总行数: ",
            blanksPerLine
          );

          // 查找分割点（最后一行最后一小题的下标）
          let totalBlanks = 0;
          let splitIndex = -1;

          for (let i = 0; i < element.questions.length; i++) {
            const q = element.questions[i];
            const blankCount = q.isAddSubQuestionClicked
              ? q.subQuestions.reduce(
                  (acc, subQ) => acc + subQ.totalBlanks || 1,
                  0
                )
              : q.blanksPerQuestion || 1;
            console.log("blankCount 有小题", blankCount);
            totalBlanks += blankCount;
            console.log("totalBlanks", totalBlanks);

            if (totalBlanks > visibleBlanks) {
              splitIndex = i - 1; // 最后一行最后一小题的下标
              break;
            }
          }
          console.log("分割点下标: ", splitIndex);

          // 分割数据
          if (splitIndex >= 0) {
            // 当前页只包含到splitIndex的题目
            const currentPageData = element.questions.slice(0, splitIndex + 1);

            // 创建第一部分对象 - 复制element的所有属性，除了questions
            const firstPart = {
              ...element,
              questions: currentPageData,
            };

            // 将第一部分添加到paginatedQuestions[0]
            currentPageQuestions.push(firstPart);
            console.log(
              "currentPageQuestions 分割的第一部分数据",
              currentPageQuestions,
              firstPart
            );

            // 第二部分包含splitIndex+1到最后的数据
            const nextPageData = element.questions.slice(splitIndex + 1);

            // 创建第二部分对象 - 复制element的所有属性，除了questions
            const secondPart = {
              ...element,
              sliceQuestion: true, // 分割的数据，不需要在页面中显示大标题了
              questions: nextPageData,
            };

            // 将第二部分添加到paginatedQuestions[1]
            paginatedQuestions[1] = [secondPart];
            console.log(
              "paginatedQuestions 分割的第二部分数据",
              paginatedQuestions,
              secondPart
            );
          } else {
            // 没有分割点，将数据添加到下一行
            remindIndex = remindIndex - 1;
          }
        } else if (element.fillType === "long") {
          // 长填空题 分页
          
        }
      }

      // currentPage++;
      // firstPageAvailableHeight = availableContentHeight;
    } else {
      currentPageQuestions.push(element);
      console.log("不需要分页", paginatedQuestions, firstPageAvailableHeight);
    }
  }

  const remindQuestions = questions.slice(remindIndex); // 剩余题目
  paginatedQuestions[0] = currentPageQuestions;
  console.log(
    "currentPage 3 处理好数据了   ",
    paginatedQuestions,
    remindQuestions
  );

  return {
    paginatedQuestions,
    totalPages: paginatedQuestions.length,
  };
};
