import React, { useRef, useEffect } from "react";
import { calculateElementPosition } from "../../../utils/tools";

/**
 * 简答题渲染组件
 * 负责渲染简答题题的多行布局
 */
const LongFillRenderer = React.forwardRef(
  ({ questions, pageRef, onPositionUpdate }, ref) => {
    const { questions: subQuestions, sliceQuestion } = questions;
    console.log("subQuestions 简答题渲染", questions);

    // 创建ref集合用于存储每个小题的DOM元素引用
    const questionItemRefs = useRef({});

    // 先处理数据数组，生成结构化的数据
    const processedQuestions = [];
    // console.log("题目数据", subQuestions, questions);
    subQuestions.forEach((subItem) => {
      if (subItem.isAddSubQuestionClicked && subItem.subQuestions) {
        // 处理带有小题的情况
        subItem.subQuestions.forEach((subQuestion, subIndex) => {
          const blank = {
            innerQuestionNumber:
              !questions.sliceQuestion || !subQuestion.perQuestionSplitLines
                ? subQuestion.number
                : "", // 小题序号
            linesPerQuestion:
              questions.sliceQuestion && subQuestion.perQuestionSplitLines
                ? subQuestion.perQuestionSplitLines
                : subQuestion.perQuestionRemindLines
                ? subQuestion.perQuestionRemindLines
                : subQuestion.totalLines, // 有分割的则展示perQuestionSplitLines分割的行，perQuestionRemindLines然后判断是否展示分割后剩余的行，每题行数
            pointsPerLine: subQuestion.pointsPerLine, // 每题分数
            showLinesPerQuestion: subItem.showLinesPerQuestion, // 分割后显示的行数
            id: subQuestion.id || `${subItem.id}-${subIndex}`, // 确保每个小题有唯一ID
          };
          // 第一题展示上级序号
          if (subQuestion.number === 1) {
            blank.questionNumber = subItem.questionNumber; // 第一项获取上级的题号显示
          }
          processedQuestions.push(blank);
        });
      } else if (subItem.linesPerQuestion) {
        // 处理没有小题的情况
        processedQuestions.push({
          key: subItem.id,
          questionNumber: subItem.questionNumber, // 题名称
          linesPerQuestion: subItem.linesPerQuestion, // 每题行数
          pointsPerLine: subItem.pointsPerLine, // 每题分数
          showLinesPerQuestion: subItem.showLinesPerQuestion, // 分割后显示的行数
          id: subItem.id,
        });
      }
    });
    console.log("processedQuestions 简答题渲染", processedQuestions);

    // 为每个小题计算位置并收集更新信息
    useEffect(() => {
      // 当有必要的参数且问题数据存在时计算位置
      // 注意：不应该在这个effect中更新props中的数据，否则会导致无限渲染
      if (onPositionUpdate && pageRef && questions && questions.sectionId) {
        // 使用setTimeout确保DOM已经完全渲染
        const timer = setTimeout(() => {
          // 只获取位置信息，不修改subQuestions数据
          const positionsInfo = {};
          // debugger;

          // 遍历所有题目收集位置信息
          subQuestions.forEach((subItem) => {
            if (subItem.isAddSubQuestionClicked && subItem.subQuestions) {
              // 处理带有小题的情况
              subItem.subQuestions.forEach((subQuestion) => {
                const questionRef = questionItemRefs.current[subQuestion.id];
                if (questionRef) {
                  const positionInfo = calculateElementPosition(
                    questionRef,
                    pageRef
                  );

                  positionsInfo[subQuestion.id] = {
                    ...positionInfo,
                    questionType: "longFillSubQuestion",
                  };
                }
              });
            } else if (subItem.linesPerQuestion) {
              // 处理没有小题的情况
              const questionRef = questionItemRefs.current[subItem.id];
              if (questionRef) {
                const positionInfo = calculateElementPosition(
                  questionRef,
                  pageRef
                );

                positionsInfo[subItem.id] = {
                  ...positionInfo,
                  questionType: "longFillQuestion",
                };
              }
            }
          });

          // 为每个小题生成唯一标识符，避免与SubjectiveQuestionsRenderer的数据冲突
          const sectionWithType = `${questions.sectionId}_longFill`;

          // 只传递位置信息，不修改原数据结构
          onPositionUpdate(sectionWithType, {
            type: "longFillPositions",
            positionsInfo,
            // 传递sectionId用于标识
            sectionId: questions.sectionId,
          });
        }, 100);

        // 清理定时器
        return () => clearTimeout(timer);
      }
    }, [onPositionUpdate, pageRef, questions]); // 添加依赖项，在数据编辑后重新计算位置信息

    // 渲染函数，基于处理好的数据数组进行渲染
    const renderLongFillQuestions = () => {
      // console.log("有来渲染吗", processedQuestions);
      return processedQuestions.map((question) => (
        <div
          key={question.key || question.id}
          ref={(el) => (questionItemRefs.current[question.id] = el)}
          className="long-fill-question"
        >
          {/* 第一行包含标题和下划线 */}
          <div
            className="long-fill-question-title-container"
            style={{
              // marginBottom: "10px",
              display: "flex",
              alignItems: "center",
            }}
          >
            {/* 没分割 或者 分割了但是没有分割的行数 */}
            {(!sliceQuestion ||
              (sliceQuestion && !question.showLinesPerQuestion)) && (
              <div
                className="long-fill-question-title"
                style={{
                  marginRight: "10px",
                  fontWeight: "500",
                  height: "30px",
                  display: "flex",
                  alignItems: "flex-end",
                }}
              >
                {question.questionNumber ? `${question.questionNumber}. ` : ""}
                &nbsp;
                {question.innerQuestionNumber
                  ? `(${question.innerQuestionNumber})`
                  : ""}
                &nbsp;
                {questions.showSubQuestionScore
                  ? `(${question.pointsPerLine}分)`
                  : ""}
              </div>
            )}

            <div
              style={{
                borderBottom: "1px solid #000",
                height: "30px",
                flex: 1,
                boxSizing: "border-box",
                display: "flex",
                alignItems: "flex-end",
              }}
            />
          </div>
          {/* 剩余的行仅显示下划线 */}
          {Array.from({
            length: Math.max(
              0,
              (question.showLinesPerQuestion || question.linesPerQuestion) - 1
            ),
          }).map((_, lineIndex) => (
            <div
              className="long-fill-question-line"
              key={`${question.key}-line-${lineIndex + 1}`}
              style={{
                // marginBottom: "10px",
                borderBottom: "1px solid #000",
                height: "30px",
                width: "100%",
                boxSizing: "border-box",
              }}
            />
          ))}
        </div>
      ));
    };

    return (
      <div ref={ref} className="long-fill-wrap">
        {/* 简答题题多行区域 */}
        {renderLongFillQuestions()}
      </div>
    );
  }
);

export default LongFillRenderer;
