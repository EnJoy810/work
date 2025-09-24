import React from "react";

/**
 * 非选择题渲染组件
 * 负责渲染非选择题的单独布局
 */
const SubjectiveQuestionsRenderer = ({ questions, pageIndex }) => {
  return (
    <div>
      {/* 非选择题标题 */}
      <div
        style={{
          marginBottom: "20px",
          fontWeight: "bold",
          fontSize: "16px",
        }}
      >
        非选择题（{questions.length}小题）
      </div>

      {/* 非选择题列表 */}
      {questions.map((question, idx) => (
        <div key={question.id || idx} style={{ marginBottom: "20px" }}>
          <div style={{ marginBottom: "10px", fontWeight: "bold" }}>
            {question.title || `第${pageIndex * 5 + idx + 1}题`}
          </div>
          <div
            style={{
              border: "1px solid #ddd",
              minHeight: "50px",
              padding: "10px",
            }}
          >
            {/* 填空题 */}
            {question.type === "blank" && (
              <div style={{ minHeight: "60px" }}>
                {Array.from({ length: question.lines || 3 }).map(
                  (_, lineIdx) => (
                    <div
                      key={lineIdx}
                      style={{
                        marginBottom: "8px",
                        borderBottom: "1px solid #000",
                      }}
                    ></div>
                  )
                )}
              </div>
            )}
            {/* 其他题型的答题区域 */}
            {!question.type && <div>答题区域</div>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SubjectiveQuestionsRenderer;