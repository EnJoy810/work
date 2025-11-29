import React, { useState } from "react";
import { List, Input, Button, Tag, Space, Empty, Modal } from "antd";
import { EditOutlined, UndoOutlined, SaveOutlined } from "@ant-design/icons";
import { ANNOTATION_SCALE_DEFAULT } from "../constants";

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
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingAnnotation, setEditingAnnotation] = useState(null);
  const [editContent, setEditContent] = useState("");

  const handleStartEdit = (annotation) => {
    setEditingAnnotation(annotation);
    setEditContent(annotation.content);
    setEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (editingAnnotation) {
      onEditAnnotation(editingAnnotation.id, editContent);
      setEditModalVisible(false);
      setEditingAnnotation(null);
      setEditContent("");
    }
  };

  const handleCancelEdit = () => {
    setEditModalVisible(false);
    setEditingAnnotation(null);
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

  const handleScaleChange = (annotation, delta) => {
    if (!onScaleChange) return;
    const currentScale = annotation.scale || ANNOTATION_SCALE_DEFAULT;
    const newScale = currentScale + delta;
    onScaleChange(annotation.id, newScale);
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
          拖动批注四个角可调整宽高，或点击"重置"恢复初始状态。
        </div>
        <List
          dataSource={annotations.filter(ann => !ann.isChoiceError)}
          renderItem={(annotation) => {
            const isSelected = selectedAnnotationId === annotation.id;

            return (
              <List.Item
                key={annotation.id}
                className={`annotation-list-item ${isSelected ? "active" : ""}`}
                onClick={() => onSelectAnnotation(annotation.id)}
              >
                <div style={{ width: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <Space>
                      {getSourceTag(annotation.source)}
                      {annotation.questionNo && <Tag color="default">题目 {annotation.questionNo}</Tag>}
                    </Space>
                    {annotation.score !== undefined && annotation.score !== null && (
                      <span style={{ fontWeight: "bold", color: "#52c41a" }}>{annotation.score}分</span>
                    )}
                  </div>

                  <div className="annotation-item-content-wrapper" style={{ marginBottom: 8, width: "100%" }}>
                    <div style={{ 
                      fontSize: 14, 
                      color: "#262626", 
                      width: "100%",
                      wordWrap: "break-word",
                      wordBreak: "break-word",
                      whiteSpace: "pre-wrap",
                      lineHeight: "1.6"
                    }}>
                      {annotation.content}
                    </div>
                  </div>

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
                    {onScaleChange && (
                      <>
                        <Button
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleScaleChange(annotation, -0.1);
                          }}
                        >
                          -
                        </Button>
                        <span style={{ fontSize: 12, color: '#8c8c8c', padding: '0 4px' }}>
                          {Math.round((annotation.scale || ANNOTATION_SCALE_DEFAULT) * 100)}%
                        </span>
                        <Button
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleScaleChange(annotation, 0.1);
                          }}
                        >
                          +
                        </Button>
                      </>
                    )}
                  </Space>
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

      {/* 编辑批注 Modal */}
      <Modal
        title="编辑批注"
        open={editModalVisible}
        onOk={handleSaveEdit}
        onCancel={handleCancelEdit}
        width={600}
        okText="保存"
        cancelText="取消"
        destroyOnClose
      >
        <TextArea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          autoSize={{ minRows: 6, maxRows: 15 }}
          placeholder="请输入批注内容"
          autoFocus
        />
        <div style={{ marginTop: 8, color: '#8c8c8c', fontSize: 12 }}>
          字数：{editContent.length}
        </div>
      </Modal>
    </div>
  );
};

export default AnnotationPanel;
