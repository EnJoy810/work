import React from "react";

/**
 * 短填空渲染组件
 * 负责渲染短填空题的下划线布局
 */
const ShortFillRenderer = React.forwardRef(({ questions }, ref) => {
  const { blanksPerLine, questions: subQuestions } = questions;
  console.log("blanksPerLine 短填空渲染", questions);

  // 获取subQuestions数组中的所有blanks数组，形成一个新的数组
  const allBlanks = [];
  subQuestions.forEach((subItem) => {
    if (subItem.blanks && Array.isArray(subItem.blanks)) {
      if (subItem.isAddSubQuestionClicked) {
        // 小题
        subItem.subQuestions.forEach((subBlank, index) => {
          subBlank.blanks.forEach((blank, blankIndex) => {
            // console.log("blankIndex", blankIndex);
            if (index === 0 && blankIndex === 0) {
              blank.questionNumber = subItem.questionNumber; // 第一项获取上级的题号显示
            }
            blank.innerQuestionNumber = blankIndex === 0 ? index + 1 : 0;
            // console.log("小题：", blank, blankIndex, index);
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
  // console.log("allBlanks", allBlanks);

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
                        display: "flex",
                        alignItems: "flex-end",
                        height: "40px",
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
                        height: "40px",
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

export default ShortFillRenderer;
