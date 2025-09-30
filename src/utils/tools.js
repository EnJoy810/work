// 格式化时间
// 密码加密（使用SHA-256算法）
export const encryptPassword = async (password) => {
  try {
    // 使用SHA-256算法加密密码
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest("SHA-256", data);
    // 将ArrayBuffer转换为十六进制字符串
    const hashArray = Array.from(new Uint8Array(hash));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hashHex;
  } catch (cryptoError) {
    console.warn("密码加密失败:", cryptoError);
    // 加密失败时返回原始密码
    return password;
  }
};

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
  PAGE_POINT,
} from "./constants";

// 计算元素相对于参考元素的位置信息
export const calculateElementPosition = (element, referenceElement) => {
  if (!element) {
    return null;
  }
  console.log("elementRect 位置数据", element, "参考位置", referenceElement);

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
  // console.log("referenceRect ", elementRect, referenceRect);

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
  console.log("计算题目高度 ", question);
  // 题目类型高度常量
  const objectHeight = 157.3; // 选择题高度
  const baseShortFirstHeight = 87.33; // 填空题基础高度（包含标题的一行高度）
  const baseShowFirstHeight = 23.33; // 填空题基础高度，数据分割没有标题的时候
  const blankLineHeight = 40; // 填空题每行高度

  // 根据题目类型返回对应的高度
  if (question.type === "objective") {
    // 根据选择题数量返回不同的高度
    // 如果是小题数量小于5题，返回对应高度；否则返回默认高度
    const questionCount = question.questions ? question.questions.length : 1;
    const heights = [0, 85.32, 103.32, 121.32, 141.32];
    if (questionCount < 5) {
      return heights[questionCount] || objectHeight;
    } else {
      return objectHeight;
    }
  } else if (question.type === "blank") {
    if (question.sliceQuestion) {
      // 分割的数据需要重新计算行数
      let totalLines = 0;
      question.questions.forEach((q) => {
        // 小题
        if (q.isAddSubQuestionClicked) {
          q.subQuestions.forEach((subQ) => {
            totalLines += subQ.totalLines;
          });
        } else {
          // showLinesPerQuestion有值则说明数据分割了
          totalLines += q.showLinesPerQuestion || q.linesPerQuestion;
        }
      });
      // console.log("totalLines 总行数", totalLines);
      return question.sliceQuestion
        ? baseShowFirstHeight
        : baseShortFirstHeight + (totalLines - 1) * blankLineHeight;
    } else {
      return baseShortFirstHeight + (question.totalLines - 1) * blankLineHeight;
    }
  }

  // 默认返回0
  return 0;
};

// 计算页面内容高度
// 根据页面类型计算可用内容高度
export const calculatePageContentHeight = (options = {}) => {
  const { hasNote = true, pageType = "first" } = options;
  // 页面高度常量
  const titleHeight = 63.09; // 标题高度
  const subjectHeight = 41; // 考试科目高度
  const classHeight = 72.11; // 班级高度
  const noteHeight = 182.07; // 注意事项高度

  // 累加高度值计算内容高度
  // 对于第一页，包含所有头部信息；对于后续页面，不包含这些信息
  let totalContentHeight = 0; // 每页都有上下边距
  if (pageType === "first") {
    totalContentHeight =
      titleHeight + subjectHeight + classHeight + (hasNote ? noteHeight : 0);
  }

  // 计算可用内容高度（每页内容高度减去标题、考试科目、班级、注意事项的高度）
  return PAGE_CONTENT_HEIGHT - totalContentHeight;
};

// 分割填空题数据
// 返回分割后的第一页数据和剩余数据
export const splitBlankQuestion = (
  question,
  availableHeight,
  questionHeight,
  remainingHeight = 0
) => {
  const titleHeight = 23.99; // 标题高度
  const questionWrapPadding = 23.33; // 题目包裹间距
  const lineHeight = 40; // 填空题每行高度
  const remainingLines = Math.floor(
    (availableHeight +
      questionHeight +
      remainingHeight -
      titleHeight -
      questionWrapPadding) /
      lineHeight
  );
  console.log("remainingLines 剩余行数:", remainingLines);
  // 剩余行数小于0，直接将数据添加到第二页，不需要分割
  if (remainingLines <= 0) {
    return { firstPart: null, secondPart: null };
  }
  // 查找分割点 - 基于行数判断
  let splitIndex = -1;
  let firstPart = null;
  let secondPart = null;

  if (question.fillType === "short") {
    // 短填空题 计算需要分割的位置
    const blanksPerLine = question.blanksPerLine || 4;
    const visibleBlanks = remainingLines * blanksPerLine;

    // 查找分割点（最后一行最后一小题的下标）
    let totalBlanks = 0;
    for (let i = 0; i < question.questions.length; i++) {
      const q = question.questions[i];
      const blankCount = q.isAddSubQuestionClicked
        ? q.subQuestions.reduce((acc, subQ) => acc + subQ.totalBlanks || 1, 0)
        : q.blanksPerQuestion || 1;
      totalBlanks += blankCount;

      if (totalBlanks > visibleBlanks) {
        splitIndex = i - 1; // 最后一行最后一小题的下标
        break;
      }
    }

    // 分割数据
    if (splitIndex >= 0) {
      const currentPageData = question.questions.slice(0, splitIndex + 1);
      const nextPageData = question.questions.slice(splitIndex + 1);

      firstPart = {
        ...question,
        questions: currentPageData,
      };

      secondPart = {
        ...question,
        sliceQuestion: true, // 分割的数据，不需要在页面中显示大标题了
        questions: nextPageData,
      };
    }
  } else if (question.fillType === "long") {
    // 长填空题 分页 - 只根据行数判断
    let totalLines = 0;
    let subSplitIndex = -1;

    for (let i = 0; i < question.questions.length; i++) {
      const q = question.questions[i];

      if (q.isAddSubQuestionClicked) {
        // 遍历subQuestions，累加每个subQuestion的行数
        let subTotalLines = 0;

        for (let j = 0; j < q.subQuestions.length; j++) {
          const subQ = q.subQuestions[j];
          const subQLines = subQ.totalLines || 1;
          subTotalLines += subQLines;

          console.log("subTotalLines 小填空的总行数", subTotalLines);
          console.log(
            "totalLine s 总行数 ",
            totalLines,
            "剩余 可显示的行数",
            remainingLines,
            subQ,
            j
          );
          if (subTotalLines > remainingLines) {
            splitIndex = i; // 最后一行最后一小题的下标
            subSplitIndex = j; // 找到subQuestion中的分割点
            // 多余的行数
            const perQuestionRemindLines = subTotalLines - remainingLines;
            // 当前题目多余的行数
            subQ.perQuestionRemindLines = perQuestionRemindLines;
            // 计算当前题目剩余需要显示的行数
            subQ.perQuestionSplitLines =
              subQ.totalLines - perQuestionRemindLines;

            console.log("totalLines  多的行数", perQuestionRemindLines, q);
            console.log(
              "splitIndex ",
              splitIndex,
              "subSplitIndex 内",
              subSplitIndex
            );

            console.log(
              "splitIndex 大的",
              splitIndex,
              "subIndex 小的",
              subSplitIndex
            );
            break;
          }
        }
      } else {
        // console.log("q 行", q.linesPerQuestion);
        const lineCount = q.linesPerQuestion || 1;
        totalLines += lineCount;
        if (totalLines > remainingLines) {
          splitIndex = i; // 最后一行最后一小题的下标
          // 多余的行数
          const perQuestionRemindLines = totalLines - remainingLines;
          // 当前题目多余的行数
          q.perQuestionRemindLines = perQuestionRemindLines;
          // 计算当前题目需要显示的行数 important!
          q.perQuestionSplitLines = q.linesPerQuestion - perQuestionRemindLines;

          console.log(
            "当前剩余显示的行数",
            q.linesPerQuestion - perQuestionRemindLines,
            "多余的行数 ",
            perQuestionRemindLines
          );
          break;
        }
      }
    }

    // 分割数据
    if (splitIndex >= 0) {
      // 分割的数据
      const splitData = question.questions[splitIndex];
      console.log("分割的数据-》", splitData, "分割的下标", splitIndex);
      console.log("分割的小题下标", subSplitIndex);
      const currentPageData = question.questions.slice(0, splitIndex);
      const nextPageData = question.questions.slice(splitIndex);
      console.log(
        "未分割处理前 当页的数据",
        question,
        currentPageData,
        "下一页数据",
        nextPageData
      );

      if (
        question.fillType === "long" &&
        splitData.perQuestionRemindLines > 0
      ) {
        if (splitData.perQuestionSplitLines === 0) {
          // 不分割 小题里的
          firstPart = {
            ...question,
            originQuestions: question.questions,
            questions: currentPageData,
          };

          secondPart = {
            ...question,
            originQuestions: question.questions,
            sliceQuestion: true, // 分割的数据，不需要在页面中显示大标题了
            questions: nextPageData,
          };
        } else {
          // 长填空
          const leftFirstPart = question.questions.slice(0, splitIndex);
          const rightFirstPart = [
            {
              ...splitData,
              showLinesPerQuestion: splitData.perQuestionSplitLines, // 分割后显示的行数
            },
          ];
          // 题目有部分在下一个页显示
          firstPart = {
            ...question,
            originQuestions: question.questions,
            questions: [...leftFirstPart, ...rightFirstPart],
          };
          const leftSecondPart = [
            {
              ...splitData,
              showLinesPerQuestion: splitData.perQuestionRemindLines, // 分割后多余显示的行数
            },
          ];
          const rightSecondPart = [...question.questions.slice(splitIndex + 1)];
          secondPart = {
            ...question,
            originQuestions: question.questions,
            sliceQuestion: true, // 分割的数据，不需要在页面中显示大标题了
            questions: [...leftSecondPart, ...rightSecondPart],
          };
        }
      } else if (subSplitIndex >= 0) {
        const subSplitData = splitData.subQuestions[subSplitIndex];
        console.log("有小题的  来分割了 splitData", splitData);
        console.log("有小题的  来分割了 subSplitData", subSplitData);
        if (subSplitData.perQuestionSplitLines === 0) {
          console.log("刚好整小题分割", subSplitData, subSplitIndex);
          // 当前subQ 需要显示的行数为0， 即将当前sub数据直接放到下一页
          // 需要依据subSplitIndex分割subQuestions
          const leftSubFirstPart = splitData.subQuestions.slice(
            0,
            subSplitIndex
          );
          const rightSubFirstPart = splitData.subQuestions.slice(subSplitIndex);
          console.log(
            "leftSubFirstPart 小题左部分",
            leftSubFirstPart,
            "rightSubFirstPart 小题右部分",
            rightSubFirstPart
          );
          console.log("question 小题来的 ", question, currentPageData);
          firstPart = {
            ...question,
            originQuestions: question.questions,
            questions: [{ ...splitData, subQuestions: leftSubFirstPart }], // 只有当前条数据
          };

          secondPart = {
            ...question,
            originQuestions: question.questions,
            sliceQuestion: true, // 分割的数据，不需要在页面中显示大标题了
            questions: [
              { ...splitData, subQuestions: rightSubFirstPart },
              ...question.questions.slice(splitIndex + 1),
            ], // 只有当前条数据,
          };
        } else {
          // todo
          firstPart = {
            ...question,
            originQuestions: question.questions,
            questions: currentPageData,
          };

          secondPart = {
            ...question,
            originQuestions: question.questions,
            sliceQuestion: true, // 分割的数据，不需要在页面中显示大标题了
            questions: nextPageData,
          };
        }
      } else {
        firstPart = {
          ...question,
          originQuestions: question.questions,
          questions: currentPageData,
        };

        secondPart = {
          ...question,
          originQuestions: question.questions,
          sliceQuestion: true, // 分割的数据，不需要在页面中显示大标题了
          questions: nextPageData,
        };
      }
    }
  }

  return { firstPart, secondPart };
};

// 处理单页题目数据
// 接收题目数组和可用高度，返回当前页题目和剩余题目索引
export const processPageQuestions = (
  questions,
  availableHeight,
  remainingHeight = 0
) => {
  let currentPageQuestions = [];
  let remindIndex = 0;

  for (let index = 0; index < questions.length; index++) {
    const element = questions[index];
    // 调用抽离的函数计算题目高度
    const questionHeight = calculateQuestionHeight(element);
    console.log("当前题目高度  1->", element.type, questionHeight, element);

    availableHeight -= questionHeight;
    console.log("当前可用高度  2->", availableHeight);

    // 题目计算完，判断是否需要分页 留一定余量
    if (availableHeight < -remainingHeight) {
      remindIndex = index + 1;

      // 根据题目类型进行不同处理
      if (element.type === "blank") {
        const { firstPart, secondPart } = splitBlankQuestion(
          element,
          availableHeight,
          questionHeight,
          remainingHeight
        );
        console.log(
          "firstPart, secondPart",
          firstPart,
          secondPart,
          index,
          remindIndex
        );

        if (firstPart && secondPart) {
          // 将第一部分添加到当前页
          currentPageQuestions.push(firstPart);
          // 第二部分需要添加到下一页
          return {
            currentPageQuestions,
            remindIndex: index,
            nextPageFirstQuestion: secondPart,
          };
        } else if (!firstPart && !secondPart) {
          // 都不需要分割
          return {
            currentPageQuestions: questions.slice(0, index),
            remindIndex: index,
            nextPageFirstQuestion: null,
          };
        }
      }
      break;
    } else {
      currentPageQuestions.push(element);
    }
  }

  // 如果没有触发过分页（remindIndex保持为0），说明所有题目都在当前页
  if (remindIndex === 0) {
    remindIndex = questions.length; // 设置为数组长度，表示没有剩余题目
  }
  console.log("remindIndex", remindIndex);

  return { currentPageQuestions, remindIndex };
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

  // debugger;
  // 计算第一页可用高度
  const firstPageAvailableHeight = calculatePageContentHeight({
    hasNote: options.hasNote !== false,
    pageType: "first",
  });

  // 处理第一页题目
  const { currentPageQuestions, remindIndex, nextPageFirstQuestion } =
    processPageQuestions(questions, firstPageAvailableHeight);
  console.log(
    "处理第一页题目结果：",
    currentPageQuestions,
    remindIndex,
    nextPageFirstQuestion
  );
  // 初始化分页结果数组
  let paginatedQuestions = [];
  paginatedQuestions[0] = currentPageQuestions;

  // 处理剩余题目
  let remindQuestions = [];

  // 如果有分割出来的下一页第一个题目
  if (nextPageFirstQuestion) {
    // 添加分割后的题目到下一页开头
    remindQuestions.push(nextPageFirstQuestion);
    // 然后添加剩余的题目（注意跳过当前被分割的题目）
    // 由于被分割的题目已经通过nextPageFirstQuestion添加了一部分，所以需要从remindIndex + 1开始获取剩余题目
    if (remindIndex + 1 < questions.length) {
      remindQuestions = [
        ...remindQuestions,
        ...questions.slice(remindIndex + 1),
      ];
    }
  } else {
    // 普通分页，直接获取剩余题目
    remindQuestions = questions.slice(remindIndex);
  }

  // 计算后续页面
  if (remindQuestions.length > 0) {
    // 计算后续页面可用高度（不包含标题等信息）
    const nextPageAvailableHeight = calculatePageContentHeight({
      pageType: "subsequent",
    });

    let currentPage = 1;
    while (remindQuestions.length > 0) {
      const {
        currentPageQuestions: nextPageQuestions,
        remindIndex,
        nextPageFirstQuestion,
      } = processPageQuestions(remindQuestions, nextPageAvailableHeight);

      paginatedQuestions[currentPage] = nextPageQuestions;

      // 处理可能存在的下一页第一个题目
      if (nextPageFirstQuestion) {
        // 添加分割后的题目到剩余题目开头
        // 使用remindIndex + 1跳过原始题目，避免重复
        const remainingQuestions = remindQuestions.slice(remindIndex + 1);
        remindQuestions = [nextPageFirstQuestion, ...remainingQuestions];
      } else {
        // 普通分页，直接获取剩余题目
        remindQuestions = remindQuestions.slice(remindIndex);
      }

      currentPage++;
    }
  }

  console.log("最终分页数据", paginatedQuestions);

  return {
    paginatedQuestions,
    totalPages: paginatedQuestions.length,
  };
};
