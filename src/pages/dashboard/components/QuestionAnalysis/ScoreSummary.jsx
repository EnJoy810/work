import React from "react";

export default function ScoreSummary({ score = 0, maxScore }) {
  return (
    <div className="score-section">
      <h3>得分</h3>
      <div className="score-display">
        <span className="score-number">{score ?? 0}</span>
        <span className="score-max">/ {maxScore}</span>
      </div>
    </div>
  );
}
