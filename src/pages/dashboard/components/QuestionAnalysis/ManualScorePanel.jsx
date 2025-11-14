import React from "react";
import { EditOutlined } from "@ant-design/icons";

export default function ManualScorePanel({
  value = "0",
  submitting = false,
  questionMaxScore,
  currentScore,
  onBackspace,
  onFull,
  onZero,
  onClickNumber,
  onSubmit,
}) {
  const disabledSubmit =
    submitting ||
    value === "" ||
    (Number.isFinite(parseFloat(value)) && parseFloat(value) === (currentScore ?? 0));

  return (
    <div className="manual-score-section">
      <h4 style={{ margin: "0 0 12px 0" }}>
        <EditOutlined style={{ marginRight: 8 }} /> 手动改分
      </h4>
      <div className="score-keyboard">
        {/* 顶部显示区域 */}
        <div className="score-display-row">
          <div className="score-input-display">{value || "0"}</div>
          <button
            className="score-btn score-btn-backspace"
            onClick={onBackspace}
            disabled={submitting || value === "0"}
            title="退格"
          >
            ⌫
          </button>
        </div>

        {/* 快捷按钮行 */}
        <div className="score-quick-buttons">
          <button className="score-btn score-btn-quick" onClick={onFull} disabled={submitting}>
            满分{questionMaxScore ? `(${questionMaxScore})` : ""}
          </button>
          <button className="score-btn score-btn-quick" onClick={onZero} disabled={submitting}>
            零分
          </button>
          <button className="score-btn score-btn-quick" onClick={() => onClickNumber(".5")} disabled={submitting}>
            .5
          </button>
        </div>

        {/* 数字键盘 */}
        <div className="score-number-grid">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
            <button
              key={num}
              className="score-btn score-btn-number"
              onClick={() => onClickNumber(String(num))}
              disabled={submitting}
            >
              {num}
            </button>
          ))}
        </div>

        {/* 底部：9和提交按钮 */}
        <div className="score-bottom-row">
          <button
            className="score-btn score-btn-number"
            onClick={() => onClickNumber("9")}
            disabled={submitting}
          >
            9
          </button>
          <button className="score-btn score-btn-submit" onClick={onSubmit} disabled={disabledSubmit}>
            {submitting ? "提交中..." : "提交"}
          </button>
        </div>
      </div>
    </div>
  );
}
