// 页面尺寸常量
import {
  PAGE_WIDTH,
  PAGE_HEIGHT,
  PAGE_MARGIN,
  PAGE_CONTENT_HEIGHT,
  PAGE_POINT,
} from "./constants";
import { deepClone } from "../utils/tools";

// 计算题目高度
// 根据题目类型返回计算的高度
export const calculateQuestionHeight = (question) => {
  // console.log("计算题目高度 ", question.questionNumber, question.questions);
  // 题目类型高度常量
  const objectHeight = 137.3; // 选择题高度
  const baseShortFirstHeight = 57.33; // 填空题基础高度（包含标题的一行高度）
  const baseShowFirstHeight = 3.33; // 填空题基础高度，数据分割没有标题的时候
  const blankLineHeight = 30; // 填空题每行高度

  // 根据题目类型返回对应的高度
  if (question.type === "objective") {
    // 根据选择题数量返回不同的高度
    // 如果是小题数量小于5题，返回对应高度；否则返回默认高度
    const questionCount = question.questions ? question.questions.length : 1;
    const heights = [0, 65.32, 83.32, 101.32, 119.31];
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
        ? baseShowFirstHeight + totalLines * blankLineHeight
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
  const { hasNote = true, showStudentId = false, pageType = "first" } = options;
  // 页面高度常量
  const titleHeight = 63.09; // 标题高度
  const subjectHeight = 41; // 考试科目高度
  const classHeight = 72.11; // 班级高度
  const noteHeight = 182.07; // 注意事项高度
  const studentHeight = 297; // 学号高度

  // 累加高度值计算内容高度
  // 对于第一页，包含所有头部信息；对于后续页面，不包含这些信息
  let totalContentHeight = 0; // 每页都有上下边距
  if (pageType === "first") {
    totalContentHeight =
      titleHeight +
      subjectHeight +
      classHeight +
      (hasNote ? noteHeight : 0) +
      (showStudentId ? studentHeight : 0);
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
  // const questionWrapPadding = 23.33; // 题目包裹间距
  const questionWrapPadding = 3.33; // 题目包裹间距
  const lineHeight = 30; // 填空题每行高度
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
  // debugger;

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
    const originQuestions = deepClone(question.questions);
    console.log(
      "originQuestions",
      originQuestions,
      question.questions[0].subQuestions
    );
    // 简答题题 分页 - 只根据行数判断
    let totalLines = 0;
    let subSplitIndex = -1;

    outerLoop: for (let i = 0; i < question.questions.length; i++) {
      const q = question.questions[i];

      if (q.isAddSubQuestionClicked) {
        // 遍历subQuestions，累加每个subQuestion的行数
        let subTotalLines = 0;

        for (let j = 0; j < q.subQuestions.length; j++) {
          const subQ = q.subQuestions[j];
          const subQLines = subQ.totalLines || 1;
          subTotalLines += subQLines;
          totalLines += subQLines;

          console.log("subTotalLines 简答题的总行数", subTotalLines);
          console.log("剩余 可显示的行数", remainingLines);
          console.log(
            "subTotalLines 简答题的总行数--->",
            subTotalLines,
            remainingLines
          );
          // debugger;

          if (totalLines >= remainingLines) {
            splitIndex = i; // 最后一行最后一小题的下标
            subSplitIndex = j; // 找到subQuestion中的分割点
            // 多余的行数
            const perQuestionRemindLines = totalLines - remainingLines;
            // 当前题目多余的行数
            subQ.perQuestionRemindLines = perQuestionRemindLines;
            // 计算当前题目 当前页面剩余需要显示的行数
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
            break outerLoop; // 退出外层循环
          }
        }
      } else {
        // debugger;
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
    console.log("splitIndex 分割的数据下标", splitIndex);

    // 分割数据
    if (splitIndex >= 0) {
      // 分割的数据
      const splitData = question.questions[splitIndex];
      console.log("分割的数据->", splitData, "分割的下标", splitIndex);
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
            originQuestions: originQuestions,
            questions: currentPageData,
          };

          secondPart = {
            ...question,
            originQuestions: originQuestions,
            sliceQuestion: true, // 分割的数据，不需要在页面中显示大标题了
            questions: nextPageData,
          };
        } else {
          // 简答题
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
            originQuestions: originQuestions,
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
            originQuestions: originQuestions,
            sliceQuestion: true, // 分割的数据，不需要在页面中显示大标题了
            questions: [...leftSecondPart, ...rightSecondPart],
          };
        }
      } else if (subSplitIndex >= 0) {
        const subSplitData = splitData.subQuestions[subSplitIndex];
        console.log("有小题的  来分割了 splitData", splitData);
        console.log("有小题的  来分割了 subSplitData", subSplitData);
        if (subSplitData.perQuestionRemindLines === 0) {
          console.log("刚好整小题分割", subSplitData, subSplitIndex);
          // 当前subQ 需要显示的行数为0， 即将当前subQ 当前页面显示
          console.log("question 小题来的 ", question, currentPageData);
          // debugger;
          const leftSubFirstPart = splitData.subQuestions.slice(
            0,
            subSplitIndex + 1
          );
          const rightSubFirstPart = splitData.subQuestions.slice(
            subSplitIndex + 1
          );
          firstPart = {
            ...question,
            originQuestions: originQuestions,
            questions: [
              ...question.questions.slice(0, splitIndex),
              {
                ...splitData,
                subQuestions: leftSubFirstPart,
              },
            ],
          };

          secondPart = {
            ...question,
            originQuestions: originQuestions,
            sliceQuestion: true, // 分割的数据，不需要在页面中显示大标题了
            questions: [
              {
                ...splitData,
                subQuestions: rightSubFirstPart,
              },
              ...question.questions.slice(splitIndex + 1),
            ],
          };
        } else {
          const leftSubFirstPart = splitData.subQuestions.slice(
            0,
            subSplitIndex + 1
          );
          const rightSubFirstPart = splitData.subQuestions.slice(subSplitIndex);
          console.log(
            "leftSubFirstPart 小题左部分",
            leftSubFirstPart,
            "rightSubFirstPart 小题右部分",
            rightSubFirstPart
          );
          // debugger;
          firstPart = {
            ...question,
            originQuestions: originQuestions,
            questions: [
              ...question.questions.slice(0, splitIndex),
              {
                ...splitData,
                subQuestions: leftSubFirstPart,
              },
            ],
          };

          secondPart = {
            ...question,
            originQuestions: originQuestions,
            sliceQuestion: true, // 分割的数据，不需要在页面中显示大标题了
            questions: [
              {
                ...splitData,
                subQuestions: rightSubFirstPart,
              },
              ...question.questions.slice(splitIndex + 1),
            ],
          };
        }
      } else {
        firstPart = {
          ...question,
          originQuestions: originQuestions,
          questions: currentPageData,
        };

        secondPart = {
          ...question,
          originQuestions: originQuestions,
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
    console.log(
      "当前题目高度->",
      element.questionNumber,
      questionHeight,
      element
    );

    availableHeight -= questionHeight;
    // console.log("当前可用高度  2->", availableHeight);

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
        // debugger;
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
  // console.log("remindIndex", remindIndex);

  return { currentPageQuestions, remindIndex };
};

// 计算题目分页
// 接收题目参数，返回分页题目数组和分页总数
export const calculateQuestionsPagination = (questions, options = {}) => {
  // console.log("calculateQuestionsPagination 计算题目分页", questions, options);
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
    showStudentId: options.showStudentId !== false,
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
    console.log("后续页面可用高度", nextPageAvailableHeight);

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
