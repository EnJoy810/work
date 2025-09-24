import React from "react";

/**
 * 选择题渲染组件
 * 负责渲染选择题的网格布局
 */
const ObjectiveQuestionsRenderer = ({ objectiveItem = {} }) => {
  const {
    questions = [],
    questionContent,
    questionNumber,
    totalCount,
  } = objectiveItem;
  console.log("objectiveItem ----", objectiveItem);
  const totalScore = questions.reduce((acc, cur) => acc + (cur.score || 0), 0);
  return (
    <div style={{ marginBottom: "30px" }}>
      {/* 选择题标题 */}
      <div
        style={{
          marginBottom: "10px",
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
                          width: "15px",
                          height: "15px",
                          lineHeight: "15px",
                          border: "1px solid #000",
                          textAlign: "center",
                          fontSize: "12px",
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
