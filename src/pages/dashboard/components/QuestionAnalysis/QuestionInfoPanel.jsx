import React from "react";

export default function QuestionInfoPanel({ questionDetail }) {
  return (
    <>
      {/* 题干 */}
      <div className="question-stem-section">
        <h4 style={{ marginBottom: 12 }}>题干</h4>
        <div style={{ backgroundColor: "#f9f9f9", padding: 16, borderRadius: 6, border: "1px solid #e8e8e8" }}>
          <p style={{ margin: 0, lineHeight: 1.6 }}>{questionDetail?.question || "暂无题干信息"}</p>
        </div>
      </div>

      {/* 参考答案 */}
      <div className="reference-answer-section">
        <h4 style={{ marginBottom: 12 }}>参考答案</h4>
        <div
          className="reference-answer-container"
          style={{ backgroundColor: "oklch(.982 .018 155.826)", padding: 16, borderRadius: 6, border: "1px solid oklch(.925 .084 155.995)" }}
        >
          <p style={{ margin: 0, lineHeight: 1.6, color: "#333" }}>{questionDetail?.answer || "暂无参考答案信息"}</p>
        </div>
      </div>

      {/* 评分要点 */}
      <div className="scoring-criteria-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h4 style={{ margin: 0 }}>评分要点</h4>
        </div>
        <div style={{ backgroundColor: "#f0f7ff", padding: 16, borderRadius: 6, border: "1px solid #e0e7ff" }}>
          <div style={{ marginBottom: 12 }}>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>{questionDetail?.score_standard || "暂无评分要点信息"}</p>
          </div>
        </div>
      </div>
    </>
  );
}
