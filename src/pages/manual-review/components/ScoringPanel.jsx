import { GripVertical, Pencil } from "lucide-react";
import { message as antdMessage } from "antd";
import { useEffect, useMemo, useState } from "react";
import "../styles/scoring-panel.css";

const getInitialPosition = () => {
  if (typeof window === "undefined") {
    return { x: 24, y: 24 };
  }
  return { x: window.innerWidth - 360, y: window.innerHeight - 420 };
};

const ScoringPanel = ({ maxScore, currentScore, onSubmit, studentName, questionTitle }) => {
  const [manualScore, setManualScore] = useState("0");
  // eslint-disable-next-line no-unused-vars
  const [inputHistory, setInputHistory] = useState([]);
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [position, setPosition] = useState(getInitialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const safeMaxScore = Number.isFinite(maxScore) && maxScore > 0 ? maxScore : null;

  useEffect(() => {
    if (typeof currentScore === "number" && !Number.isNaN(currentScore)) {
      setManualScore(String(currentScore));
      setInputHistory([String(currentScore)]);
    } else {
      setManualScore("0");
      setInputHistory([]);
    }
  }, [currentScore, studentName, questionTitle]);

  const handleMouseDown = (event) => {
    // 如果点击的是可交互元素（按钮、输入框等），不触发拖拽
    const target = event.target;
    const isInteractiveElement =
      target.tagName === "BUTTON" ||
      target.tagName === "INPUT" ||
      target.closest("button") !== null ||
      target.closest("input") !== null;
    
    if (isInteractiveElement) {
      return;
    }

    setIsDragging(true);
    setDragOffset({
      x: event.clientX - position.x,
      y: event.clientY - position.y,
    });
  };

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (!isDragging) return;
      setPosition({
        x: event.clientX - dragOffset.x,
        y: event.clientY - dragOffset.y,
      });
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset.x, dragOffset.y]);

  const handleNumberClick = (num) => {
    if (safeMaxScore === null) {
      antdMessage.warning("无法获取题目满分信息");
      return;
    }

    if (num === ".5") {
      const currentValue = Number.parseFloat(manualScore);
      const integerPart = Number.isNaN(currentValue) ? 0 : Math.floor(currentValue);
      const newValue = integerPart + 0.5;

      if (newValue > safeMaxScore) {
        antdMessage.warning(`分数不能超过满分${safeMaxScore}分`);
        return;
      }

      if (manualScore.includes(".5") && Number.parseFloat(manualScore) === newValue) {
        return;
      }

      const formatted = String(newValue);
      setManualScore(formatted);
      setInputHistory([formatted]);
    } else {
      const numValue = Number.parseFloat(num);

      if (numValue > safeMaxScore) {
        antdMessage.warning(`分数不能超过满分${safeMaxScore}分`);
        return;
      }

      if (Number.parseFloat(manualScore) === numValue) {
        return;
      }

      setManualScore(num);
      setInputHistory([num]);
    }
  };

  const handleBackspace = () => {
    if (manualScore === "0") {
      return;
    }

    if (manualScore.includes(".5")) {
      const integerPart = Math.floor(Number.parseFloat(manualScore));
      const formatted = String(integerPart);
      setManualScore(formatted);
      setInputHistory([formatted]);
    } else {
      setManualScore("0");
      setInputHistory([]);
    }
  };

  const handleFullScore = () => {
    if (safeMaxScore === null) {
      antdMessage.warning("无法获取题目满分信息");
      return;
    }
    const formatted = String(safeMaxScore);
    setManualScore(formatted);
    setInputHistory([formatted]);
  };

  const handleZeroScore = () => {
    setManualScore("0");
    setInputHistory(["0"]);
  };

  const handleSubmit = async () => {
    if (safeMaxScore === null) {
      antdMessage.warning("无法获取题目满分信息");
      return;
    }

    const scoreValue = Number.parseFloat(manualScore);

    if (manualScore === "" || Number.isNaN(scoreValue)) {
      antdMessage.warning("请输入有效的分数");
      return;
    }

    if (scoreValue < 0 || scoreValue > safeMaxScore) {
      antdMessage.warning(`分数必须在 0-${safeMaxScore} 分之间`);
      return;
    }

    if (Number.isFinite(currentScore) && scoreValue === currentScore) {
      antdMessage.info("分数未发生变化");
      return;
    }

    try {
      setIsSubmittingScore(true);
      const maybePromise = onSubmit(scoreValue);
      if (maybePromise && typeof maybePromise.then === "function") {
        await maybePromise;
      }
    } finally {
      setIsSubmittingScore(false);
    }
  };

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "Enter") {
        handleSubmit();
      } else if (/^[0-9]$/.test(event.key)) {
        handleNumberClick(event.key);
      } else if (event.key === "Backspace") {
        handleBackspace();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [manualScore, safeMaxScore, currentScore]);

  const keypadNumbers = useMemo(() => ["0", "1", "2", "3", "4", "5", "6", "7", "8"], []);

  const numericScore = Number.parseFloat(manualScore);
  const invalidNumber = manualScore === "" || Number.isNaN(numericScore);
  const exceedsLimit = safeMaxScore !== null && numericScore > safeMaxScore;
  const sameAsCurrent = Number.isFinite(currentScore) && numericScore === currentScore;
  const isSubmitDisabled = isSubmittingScore || invalidNumber || exceedsLimit || sameAsCurrent;
  const displayScore = manualScore || "0";
  const displayMaxScore = safeMaxScore !== null ? `${safeMaxScore} 分` : "未知满分";

  return (
    <div
      className="manual-score-floating"
      style={{ left: `${position.x}px`, top: `${position.y}px`, cursor: isDragging ? "move" : "default" }}
      onMouseDown={handleMouseDown}
    >
      <div className="manual-score-drag">
        <div className="manual-score-title">
          <Pencil size={16} color="#475467" />
          <span>手动改分</span>
        </div>
        <div className="manual-score-drag-meta">
          <GripVertical size={18} color="#c0c7d4" />
        </div>
      </div>

      <div className="manual-score-body">
        <div className="manual-score-section">
          <div className="score-keyboard">
            <div className="score-display-row">
              <div className="score-input-display">{displayScore}</div>
              <button
                type="button"
                className="score-btn score-btn-backspace"
                onClick={handleBackspace}
                disabled={isSubmittingScore || manualScore === "0"}
                title="退格"
              >
                ⌫
              </button>
            </div>

            <div className="score-quick-buttons">
              <button
                type="button"
                className="score-btn score-btn-quick"
                onClick={handleFullScore}
                disabled={isSubmittingScore}
              >
                满分
              </button>
              <button
                type="button"
                className="score-btn score-btn-quick"
                onClick={handleZeroScore}
                disabled={isSubmittingScore}
              >
                零分
              </button>
              <button
                type="button"
                className="score-btn score-btn-quick"
                onClick={() => handleNumberClick(".5")}
                disabled={isSubmittingScore}
              >
                .5
              </button>
            </div>

            <div className="score-number-grid">
              {keypadNumbers.map((num) => (
                <button
                  key={num}
                  type="button"
                  className="score-btn score-btn-number"
                  onClick={() => handleNumberClick(num)}
                  disabled={isSubmittingScore}
                >
                  {num}
                </button>
              ))}
            </div>

            <div className="score-bottom-row">
              <button
                type="button"
                className="score-btn score-btn-number"
                onClick={() => handleNumberClick("9")}
                disabled={isSubmittingScore}
              >
                9
              </button>
              <button
                type="button"
                className="score-btn score-btn-submit"
                onClick={handleSubmit}
                disabled={isSubmitDisabled}
              >
                {isSubmittingScore ? "提交中..." : "提交"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoringPanel;
