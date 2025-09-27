import React, { useRef, useEffect } from "react";
import { calculateElementPosition } from "../../../utils/tools";

/**
 * 选择题渲染组件
 * 负责渲染选择题及其选项
 */
const ObjectiveQuestionsRenderer = ({
  objectiveItem,
  pageRef,
  onPositionUpdate,
}) => {
  const {
    questions = [],
    questionContent,
    questionNumber,
    totalCount,
  } = objectiveItem;
  console.log("objectiveItem ----", objectiveItem);
  const totalScore = questions.reduce((acc, cur) => acc + (cur.score || 0), 0);

  // 创建ref用于获取选择题部分的DOM元素
  const questionsContainerRef = useRef(null);

  // 使用useEffect在组件渲染后获取尺寸和位置信息
  // 移除questions依赖，避免位置信息更新导致的无限循环渲染
  // 用于存储上一次的位置信息，避免不必要的更新
  const previousPositionInfoRef = useRef(null);

  useEffect(() => {
    // 当组件挂载或依赖项变化时计算元素位置
    if (questionsContainerRef.current && pageRef && onPositionUpdate) {
      const positionInfo = calculateElementPosition(
        questionsContainerRef.current,
        pageRef
      );

      // 扩展位置信息，添加额外信息
      const extendedPositionInfo = {
        ...positionInfo,
        questionType: "objective",
        timestamp: new Date().getTime(),
      };

      // 只有当位置信息真正变化时才调用回调函数
      const currentPositionKey = JSON.stringify(positionInfo);
      if (currentPositionKey !== previousPositionInfoRef.current) {
        // 调用回调函数传递位置信息，使用sectionId作为唯一标识
        onPositionUpdate(objectiveItem.sectionId, extendedPositionInfo);

        console.log(
          `选择题部分(sectionId: ${objectiveItem.sectionId})尺寸和位置信息已通过回调函数传递:`,
          extendedPositionInfo
        );

        // 更新引用，存储当前位置信息
        previousPositionInfoRef.current = currentPositionKey;
      }
    }
  }, [objectiveItem, pageRef, onPositionUpdate]); // 仅当objectiveItem、pageRef或onPositionUpdate变化时重新计算

  return (
    <div ref={questionsContainerRef}>
      {/* 选择题标题 */}
      <div
        style={{
          fontWeight: "bold",
          fontSize: "16px",
        }}
      >
        {questionNumber}、{questionContent}
        <span
          style={{
            fontSize: "14px",
          }}
        >
          （{totalCount}小题，共{totalScore}分）
        </span>
      </div>

      {/* 选择题网格布局 */}
      <div
        style={{
          overflow: "hidden",
        }}
      >
        {/* 5行4列的网格布局 - 从上到下排列 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gridAutoFlow: "column",
            gridTemplateRows: "repeat(5, auto)",
            gap: "5px",
          }}
        >
          {questions
            .sort(
              (a, b) =>
                parseInt(a.questionNumber || a.id) -
                parseInt(b.questionNumber || b.id)
            )
            .map((question, questionIndex) => {
              // 获取选项数量（最多6个选项：ABCDEF）
              const optionsCount = question.optionsCount || 4;
              const options = ["A", "B", "C", "D", "E", "F"].slice(
                0,
                optionsCount
              );

              return (
                <div
                  key={question.id || questionIndex}
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      fontWeight: "bold",
                      minWidth: "30px",
                      textAlign: "right",
                      fontSize: 12,
                    }}
                  >
                    {question.questionNumber || questionIndex + 1}、
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "3px",
                    }}
                  >
                    {options.map((option) => (
                      <div
                        key={option}
                        style={{
                          width: "20px",
                          height: "13px",
                          lineHeight: "11px",
                          borderRadius: "3px",
                          border: "1px solid #000",
                          textAlign: "center",
                          fontSize: "11px",
                        }}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default ObjectiveQuestionsRenderer;
