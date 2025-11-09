import React, { memo } from "react";
import { Button, Divider } from "antd";
import { CheckCircleOutlined, EditOutlined } from "@ant-design/icons";

/**
 * 分数编辑组件
 * 使用 React.memo 优化，避免不必要的重新渲染
 */
const ScoreEditor = memo(({
  score,
  isEditing,
  editingScore,
  onStartEdit,
  onScoreChange,
  onSave,
  onCancel,
}) => {
  return (
    <div className="score-section">
      <h3>
        <CheckCircleOutlined style={{ marginRight: "4px" }} /> 作文得分
      </h3>
      {isEditing ? (
        <div className="score-edit-mode">
          <div className="score-input-wrapper">
            <input
              type="text"
              value={editingScore}
              onChange={onScoreChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onSave();
                } else if (e.key === 'Escape') {
                  onCancel();
                }
              }}
              className="score-input"
              placeholder="0-60"
              autoFocus
            />
            <span className="score-max">/ 60</span>
          </div>
          <div className="score-edit-actions">
            <Button
              size="small"
              onClick={onCancel}
              className="edit-cancel-btn"
            >
              取消
            </Button>
            <Button
              size="small"
              type="primary"
              onClick={onSave}
              className="edit-save-btn"
            >
              保存
            </Button>
          </div>
        </div>
      ) : (
        <div className="score-display" onClick={onStartEdit} style={{ cursor: "pointer" }}>
          <span className="score-number">{score}</span>
          <span className="score-max">/ 60</span>
          <EditOutlined className="score-edit-icon" style={{ marginLeft: "8px", fontSize: "16px" }} />
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数，优化性能
  return (
    prevProps.score === nextProps.score &&
    prevProps.isEditing === nextProps.isEditing &&
    prevProps.editingScore === nextProps.editingScore
  );
});

ScoreEditor.displayName = "ScoreEditor";

export default ScoreEditor;

