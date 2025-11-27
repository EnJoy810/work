import React, { useState } from "react";
import { List, Input, Button, Tag, Space, Empty } from "antd";
import { EditOutlined, UndoOutlined, SaveOutlined } from "@ant-design/icons";
import {
  ANNOTATION_SCALE_MIN,
  ANNOTATION_SCALE_MAX,
  ANNOTATION_SCALE_DEFAULT,
  ANNOTATION_SCALE_STEP,
  clampAnnotationScale
} from "../constants";

const { TextArea } = Input;

/**
 * 批注面板组件 - 右侧批注列表和编辑区
 * @param {Object} props
 * @param {Array} props.annotations - 批注列表
 * @param {string} props.selectedAnnotationId - 当前选中的批注ID
 * @param {Function} props.onSelectAnnotation - 选择批注回调
 * @param {Function} props.onEditAnnotation - 编辑批注回调
 * @param {Function} props.onResetAnnotation - 重置回调
 * @param {Function} props.onSave - 保存回调
 * @param {boolean} props.hasUnsavedChanges - 是否有未保存的修改
 * @param {Function} props.onScaleChange - 缩放调整回调
 */
const AnnotationPanel = ({
  annotations,
  selectedAnnotationId,
  onSelectAnnotation,
  onEditAnnotation,
  onResetAnnotation,
  onSave,
  hasUnsavedChanges,
  onScaleChange
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");

  const handleStartEdit = (annotation) => {
    setEditingId(annotation.id);
    setEditContent(annotation.content);
  };

  const handleSaveEdit = (annotationId) => {
    onEditAnnotation(annotationId, editContent);
    setEditingId(null);
    setEditContent("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const getSourceTag = (source) => {
    if (source === "teacher") {
      return <Tag color="blue">教师</Tag>;
    }
    if (source === "algorithm") {
      return <Tag color="green">AI</Tag>;
    }
    return <Tag>未知</Tag>;
  };

  const getCurrentScale = (annotation) => {
    return typeof annotation.scale === "number" ? annotation.scale : ANNOTATION_SCALE_DEFAULT;
  };

  const handleScaleAdjust = (annotation, delta) => {
    if (!onScaleChange) return;
    const current = getCurrentScale(annotation);
    const next = clampAnnotationScale(current + delta);
    if (Math.abs(next - current) < 0.001) return;
    onScaleChange(annotation.id, next);
  };

  if (!annotations || annotations.length === 0) {
    return (
      <div className="annotation-panel">
        <div className="panel-header">
          <h3>批注列表</h3>
        </div>
        <Empty description="暂无批注" style={{ marginTop: 60 }} />
      </div>
    );
  }

  return (
    <div className="annotation-panel">
      <div className="panel-header">
        <h3>批注列表</h3>
        <Tag color={hasUnsavedChanges ? "orange" : "default"}>{annotations.length} 条</Tag>
      </div>

      <div className="panel-content" style={{ flex: 1, overflow: "auto", padding: "0 16px" }}>
        <div className="annotation-panel__hint">
          可使用 +/- 调整文字大小，拖动批注四个角可调整宽高，或点击“重置”恢复初始状态。
        </div>
        <List
          dataSource={annotations}
          renderItem={(annotation) => {
            const isSelected = selectedAnnotationId === annotation.id;
            const isEditing = editingId === annotation.id;
            const currentScale = getCurrentScale(annotation);
            const formattedScale = `${Math.round(currentScale * 100)}%`;
            const isMinScale = currentScale <= ANNOTATION_SCALE_MIN + 0.001;
            const isMaxScale = currentScale >= ANNOTATION_SCALE_MAX - 0.001;

            return (
              <List.Item
                key={annotation.id}
                className={`annotation-list-item ${isSelected ? "active" : ""}`}
                onClick={() => !isEditing && onSelectAnnotation(annotation.id)}
              >
                <div style={{ width: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <Space>
                      {getSourceTag(annotation.source)}
                      {annotation.questionNo && <Tag color="default">题目 {annotation.questionNo}</Tag>}
                    </Space>
                    {annotation.ai_score !== undefined && annotation.ai_score !== null && (
                      <span style={{ fontWeight: "bold", color: "#52c41a" }}>{annotation.ai_score}分</span>
                    )}
                  </div>

                  {isEditing ? (
                    <div onClick={(e) => e.stopPropagation()}>
                      <TextArea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={3}
                        style={{ marginBottom: 8 }}
                      />
                      <Space>
                        <Button type="primary" size="small" onClick={() => handleSaveEdit(annotation.id)}>
                          确定
                        </Button>
                        <Button size="small" onClick={handleCancelEdit}>
                          取消
                        </Button>
                      </Space>
                    </div>
                  ) : (
                    <div className="annotation-item-content-wrapper" style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 14, color: "#262626" }}>{annotation.content}</div>
                      {!isEditing && isSelected && (
                        <div
                          className="annotation-scale-controls annotation-scale-controls--inline"
                          onClick={(e) => e.stopPropagation()}
                          aria-label="批注缩放调节"
                        >
                          <Button
                            size="small"
                            disabled={isMinScale}
                            onClick={() => handleScaleAdjust(annotation, -ANNOTATION_SCALE_STEP)}
                          >
                            -
                          </Button>
                          <span className="annotation-scale-controls__value">{formattedScale}</span>
                          <Button
                            size="small"
                            disabled={isMaxScale}
                            onClick={() => handleScaleAdjust(annotation, ANNOTATION_SCALE_STEP)}
                          >
                            +
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {!isEditing && isSelected && (
                    <Space size="small" wrap>
                      <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(annotation);
                        }}
                      >
                        编辑
                      </Button>
                      {onResetAnnotation && (
                        <Button
                          size="small"
                          icon={<UndoOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            onResetAnnotation(annotation.id);
                          }}
                        >
                          重置
                        </Button>
                      )}
                    </Space>
                  )}
                </div>
              </List.Item>
            );
          }}
        />
      </div>

      <div className="panel-footer">
        <Button type="primary" icon={<SaveOutlined />} block disabled={!hasUnsavedChanges} onClick={onSave}>
          保存修改
        </Button>
      </div>
    </div>
  );
};

export default AnnotationPanel;
