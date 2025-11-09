import React, { memo } from "react";

/**
 * 颜色选择弹窗组件
 * 使用 React.memo 优化，避免不必要的重新渲染
 */
const ColorSelectionModal = memo(({
  selectedSentence,
  show,
  onSelectColor,
  onCancel,
}) => {
  if (!show || !selectedSentence) return null;

  return (
    <div className="color-selection-modal">
      <div className="color-modal-content">
        <h3 className="color-modal-title">选择评语颜色</h3>
        <p className="color-modal-sentence">选中的句子：{selectedSentence}</p>
        
        <div className="color-buttons-grid">
          <button
            onClick={() => onSelectColor("orange")}
            className="color-btn color-btn-orange"
          >
            橙色
          </button>
          <button
            onClick={() => onSelectColor("green")}
            className="color-btn color-btn-green"
          >
            绿色
          </button>
          <button
            onClick={() => onSelectColor("blue")}
            className="color-btn color-btn-blue"
          >
            蓝色
          </button>
          <button
            onClick={() => onSelectColor("purple")}
            className="color-btn color-btn-purple"
          >
            紫色
          </button>
        </div>
        
        <button
          onClick={onCancel}
          className="color-cancel-btn"
        >
          取消
        </button>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数，优化性能
  return (
    prevProps.selectedSentence === nextProps.selectedSentence &&
    prevProps.show === nextProps.show
  );
});

ColorSelectionModal.displayName = "ColorSelectionModal";

export default ColorSelectionModal;

