import React from "react";

/**
 * 长填空渲染组件
 * 负责渲染长填空题的多行布局
 */
const LongFillRenderer = React.forwardRef(({ questions }, ref) => {
  const { questions: subQuestions } = questions;
  console.log("subQuestions 长填空渲染", questions);

  // 先处理数据数组，生成结构化的数据
  const processedQuestions = [];

  subQuestions.forEach((subItem) => {
    if (subItem.isAddSubQuestionClicked && subItem.subQuestions) {
      // 处理带有小题的情况
      subItem.subQuestions.forEach((subQuestion, subIndex) => {
        const blank = {
          innerQuestionNumber: subIndex + 1, // 小题名称
          linesPerQuestion: subQuestion.totalLines, // 每题行数
        };
        if (subIndex === 0) {
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
      });
    }
  });
  // console.log("processedQuestions 长填空渲染", processedQuestions);

  // 渲染函数，基于处理好的数据数组进行渲染
  const renderLongFillQuestions = () => {
    return processedQuestions.map((question) => (
      <div key={question.key} className="long-fill-question">
        {/* 第一行包含标题和下划线 */}
        <div
          style={{
            marginBottom: "10px",
            display: "flex",
            alignItems: "center",
          }}
        >
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
            {question.questionNumber ? `${question.questionNumber}、` : ""}
            {question.innerQuestionNumber
              ? `(${question.innerQuestionNumber})`
              : ""}
          </div>
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
          length: Math.max(0, question.linesPerQuestion - 1),
        }).map((_, lineIndex) => (
          <div
            key={`${question.key}-line-${lineIndex + 1}`}
            style={{
              marginBottom: "10px",
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
      {/* 长填空题多行区域 */}
      {renderLongFillQuestions()}
    </div>
  );
});

export default LongFillRenderer;
