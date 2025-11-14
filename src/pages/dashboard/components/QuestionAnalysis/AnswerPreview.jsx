import React from "react";

export default function AnswerPreview({ answerUrl }) {
  return (
    <div
      className="answer-image-container"
      style={{ border: "1px solid #e8e8e8", borderRadius: 8, padding: 20, backgroundColor: "white" }}
    >
      <div
        style={{ textAlign: "center", backgroundColor: "white", border: "1px solid #d9d9d9", borderRadius: 4, padding: 16 }}
      >
        {answerUrl ? (
          <img
            src={answerUrl}
            alt="学生答案"
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
            style={{ maxWidth: "100%", maxHeight: 400, objectFit: "contain" }}
          />
        ) : (
          <div style={{ color: "#999" }}>暂无学生答案</div>
        )}
      </div>
    </div>
  );
}
