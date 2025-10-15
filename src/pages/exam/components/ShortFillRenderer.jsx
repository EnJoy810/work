import React, { useEffect, useRef } from "react";
import { calculateElementPosition } from "../../../utils/tools";

/**
 * 短填空渲染组件
 * 负责渲染短填空题的下划线布局
 */
const ShortFillRenderer = React.forwardRef(
  ({ questions, pageRef, onPositionUpdate }, ref) => {
    const { blanksPerLine, questions: subQuestions } = questions;
    console.log("blanksPerLine 短填空渲染", questions);

    // 创建ref集合用于存储每个短填空元素的DOM引用
    const blankItemRefs = useRef({});

    // 处理过的所有blanks数组
    const allBlanks = [];

    // 为每个blank创建唯一ID（如果没有的话）
    subQuestions.forEach((subItem) => {
      if (subItem.blanks && Array.isArray(subItem.blanks)) {
        if (subItem.isAddSubQuestionClicked) {
          // 小题
          subItem.subQuestions.forEach((subBlank, index) => {
            subBlank.blanks.forEach((blank, blankIndex) => {
              if (!blank.id) {
                blank.id = `${subItem.id}-${index}-${blankIndex}`;
              }
              if (index === 0 && blankIndex === 0) {
                blank.questionNumber = subItem.questionNumber; // 第一项获取上级的题号显示
              }
              blank.innerQuestionNumber = blankIndex === 0 ? index + 1 : 0;
              allBlanks.push(blank);
            });
          });
        } else {
          subItem.blanks.forEach((blank, index) => {
            if (!blank.id) {
              blank.id = `${subItem.id}-${index}`;
            }
            if (index === 0) {
              blank.questionNumber = subItem.questionNumber; // 第一项获取上级的题号显示
            }
            allBlanks.push(blank);
          });
        }
      }
    });

    // 为每个短填空计算位置并收集更新信息
    // 使用useEffect在组件挂载和questions变化时计算位置信息
    useEffect(() => {
      // 当有必要的参数且问题数据存在时计算位置
      if (
        onPositionUpdate &&
        pageRef &&
        questions &&
        questions.sectionId &&
        allBlanks.length > 0
      ) {
        // 使用setTimeout确保DOM已经完全渲染
        const timer = setTimeout(() => {
          // 只获取位置信息，不修改subQuestions数据
          const positionsInfo = {};

          // 遍历所有已渲染的填空元素收集位置信息
          allBlanks.forEach((blank) => {
            const blankRef = blankItemRefs.current[blank.id];
            if (blankRef) {
              const positionInfo = calculateElementPosition(blankRef, pageRef);

              positionsInfo[blank.id] = {
                ...positionInfo,
                questionType: "shortFillQuestion",
              };
            }
          });

          // 只传递位置信息，不修改原数据结构
          // 使用完全独立的数据结构，不使用positionsInfo字段避免影响大题的位置数据
          const sectionWithType = `${questions.sectionId}_shortFill`;
          onPositionUpdate(sectionWithType, {
            type: "shortFillPositions",
            shortFillPositionsInfo: positionsInfo,
          });
        }, 200);

        // 清理定时器
        return () => clearTimeout(timer);
      }
    }, [onPositionUpdate, pageRef, questions]); // 当依赖项变化时重新计算位置信息，不包含allBlanks避免无限渲染

    return (
      <div ref={ref}>
        {/* 短填空题下划线区域 */}
        {allBlanks.length > 0 && (
          <div>
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
                  className="short-fill-line"
                  key={lineIndex}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    paddingRight: "10px",
                    boxSizing: "border-box",
                  }}
                >
                  {lineBlanks.map((blank, blankIndex) => (
                    <div
                      className="short-fill-blank"
                      key={blank.id}
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
                        className="font-black"
                        style={{
                          display: "flex",
                          alignItems: "flex-end",
                          height: "30px",
                          marginRight: "5px",
                          visibility:
                            blank.questionNumber || blank.innerQuestionNumber
                              ? "visible"
                              : "hidden",
                          minWidth: "20px",
                        }}
                      >
                        {/* 这里的空格是为了给文字留空间，不能删除 */}
                        {blank.questionNumber
                          ? `${blank.questionNumber}. `
                          : ""}
                        &nbsp;
                        {blank.innerQuestionNumber
                          ? `(${blank.innerQuestionNumber})`
                          : ""}
                      </span>
                      {/* 下划线根据页面宽度均匀分布 */}
                      <div
                        className="short-fill-underline"
                        ref={(el) => (blankItemRefs.current[blank.id] = el)}
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
  }
);

export default ShortFillRenderer;
