import React, { useRef, useEffect } from "react";
import { Button } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { calculateElementPosition } from "../../../utils/tools";

/**
 * 非选择题渲染组件
 * 负责渲染非选择题的单独布局
 */
const SubjectiveQuestionsRenderer = React.forwardRef(({ questions, pageIndex, onPositionUpdate, pageRef }, ref) => {
  console.log("questions, pageIndex 非选择题", questions, pageIndex);
  const {
    questionNumber,
    content,
    blanksPerLine,
    questions: subQuestions,
  } = questions;

  // 获取subQuestions数组中的所有blanks数组，形成一个新的数组
  const allBlanks = [];
  subQuestions.forEach((subItem) => {
    if (subItem.blanks && Array.isArray(subItem.blanks)) {
      // console.log("subItem.blanks", subItem.blanks);

      if (subItem.isAddSubQuestionClicked) {
        subItem.subQuestions.forEach((subBlank, index) => {
          subBlank.blanks.forEach((blank, blankIndex) => {
            if (index === 0 && blankIndex === 0) {
              blank.questionNumber = subItem.questionNumber; // 第一项获取上级的题号显示
            }
            blank.innerQuestionNumber = blankIndex + 1;
            allBlanks.push(blank);
          });
        });
      } else {
        subItem.blanks.forEach((blank, index) => {
          if (index === 0) {
            blank.questionNumber = subItem.questionNumber; // 第一项获取上级的题号显示
          }
          allBlanks.push(blank);
        });
      }
    }
  });
  console.log("allBlanks", allBlanks);

  // 创建ref用于获取非选择题部分的DOM元素
  const questionsContainerRef = useRef(null);

  // 用于存储上一次的位置信息，避免不必要的更新
  const previousPositionInfoRef = useRef(null);

  // 使用useEffect在组件渲染后获取尺寸和位置信息
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
        questionType: "subjective",
        sectionId: questions.sectionId,
        timestamp: new Date().getTime(),
      };

      // 只有当位置信息真正变化时才调用回调函数
      const currentPositionKey = JSON.stringify(positionInfo);
      if (currentPositionKey !== previousPositionInfoRef.current) {
        // 调用回调函数传递位置信息
        onPositionUpdate(questions.sectionId, extendedPositionInfo);
        
        console.log(
          `非选择题部分(sectionId: ${questions.sectionId})尺寸和位置信息已通过回调函数传递:`,
          extendedPositionInfo
        );
        
        // 更新引用，存储当前位置信息
        previousPositionInfoRef.current = currentPositionKey;
      }
    }
  }, [questions, pageRef, onPositionUpdate]); // 仅当questions、pageRef或onPositionUpdate变化时重新计算

  return (
    <div ref={(el) => {
      // 同时设置两个ref
      if (ref) {
        ref.current = el;
      }
      questionsContainerRef.current = el;
    }}>
      {/* 非选择题标题 */}
      <div
        style={{
          fontWeight: "bold",
          fontSize: "16px",
        }}
      >
        {questionNumber}、{content}
      </div>

      {/* 短填空题下划线区域 */}
      {allBlanks.length > 0 && (
        <div style={{ marginTop: "10px" }}>
          {/* 计算需要渲染的行数 */}
          {Array.from({
            length: Math.ceil(allBlanks.length / blanksPerLine),
          }).map((_, lineIndex) => {
            // 获取当前行需要显示的blanks
            const startIndex = lineIndex * blanksPerLine;
            const endIndex = startIndex + blanksPerLine;
            const lineBlanks = allBlanks.slice(startIndex, endIndex);

            return (
              <div
                key={lineIndex}
                style={{
                  display: "flex",
                  marginBottom: "15px",
                  alignItems: "center",
                  width: "100%",
                  paddingRight: "10px",
                  boxSizing: "border-box",
                }}
              >
                {lineBlanks.map((blank, blankIndex) => (
                  <div
                    key={blankIndex}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      flex: "0 0 " + 98 / blanksPerLine + "%",
                      maxWidth: 98 / blanksPerLine + "%",
                      marginRight:
                        blankIndex < lineBlanks.length - 1 ? "10px" : 0,
                      boxSizing: "border-box",
                    }}
                  >
                    {/* 无论是否有值都渲染span，确保空间占用 */}
                    <span
                      style={{
                        marginRight: "5px",
                        visibility:
                          blank.questionNumber || blank.innerQuestionNumber
                            ? "visible"
                            : "hidden",
                        minWidth: "20px",
                      }}
                    >
                      {blank.questionNumber ? `${blank.questionNumber}、` : ""}

                      {blank.innerQuestionNumber
                        ? `(${blank.innerQuestionNumber})`
                        : ""}
                    </span>
                    {/* 下划线根据页面宽度均匀分布 */}
                    <div
                      style={{
                        borderBottom: "1px solid #000",
                        flexGrow: 1,
                        minWidth: "50px",
                        height: "30px",
                        display: "flex",
                        alignItems: "flex-end",
                      }}
                    />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

export default SubjectiveQuestionsRenderer;
