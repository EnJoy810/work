import React, { useState } from "react";
import { List, Input, Button, Tag, Space, Empty } from "antd";
import { EditOutlined, UndoOutlined, SaveOutlined } from "@ant-design/icons";

const { TextArea } = Input;

/**
 * 批注面板组件 - 右侧批注列表和编辑区
 * @param {Object} props
 * @param {Array} props.annotations - 批注列表
 * @param {string} props.selectedAnnotationId - 当前选中的批注ID
 * @param {Function} props.onSelectAnnotation - 选择批注回调
 * @param {Function} props.onEditAnnotation - 编辑批注回调
 * @param {Function} props.onResetPosition - 重置位置回调
 * @param {Function} props.onSave - 保存回调
 * @param {boolean} props.hasUnsavedChanges - 是否有未保存的修改
 */
const AnnotationPanel = ({
  annotations,
  selectedAnnotationId,
  onSelectAnnotation,
  onEditAnnotation,
  onResetPosition,
  onSave,
  hasUnsavedChanges
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");

  // 开始编辑
  const handleStartEdit = (annotation) => {
    setEditingId(annotation.id);
    setEditContent(annotation.content);
  };

  // 保存编辑
  const handleSaveEdit = (annotationId) => {
    onEditAnnotation(annotationId, editContent);
    setEditingId(null);
    setEditContent("");
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  // 获取来源标签
  const getSourceTag = (source) => {
    if (source === "teacher") {
      return <Tag color="blue">教师</Tag>;
    } else if (source === "algorithm") {
      return <Tag color="green">AI</Tag>;
    }
    return <Tag>未知</Tag>;
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
        <Tag color={hasUnsavedChanges ? "orange" : "default"}>
          {annotations.length} 条
        </Tag>
      </div>

      <div className="panel-content" style={{ flex: 1, overflow: 'auto', padding: '0 16px' }}>
        <List
          dataSource={annotations}
          renderItem={(annotation) => {
            const isSelected = selectedAnnotationId === annotation.id;
            const isEditing = editingId === annotation.id;

            return (
              <List.Item
                key={annotation.id}
                className={`annotation-list-item ${isSelected ? 'active' : ''}`}
                onClick={() => !isEditing && onSelectAnnotation(annotation.id)}
              >
                <div style={{ width: '100%' }}>
                  {/* 批注头部 */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Space>
                      {getSourceTag(annotation.source)}
                      {annotation.questionNo && (
                        <Tag color="default">题目 {annotation.questionNo}</Tag>
                      )}
                    </Space>
                    {annotation.ai_score !== undefined && annotation.ai_score !== null && (
                      <span style={{ fontWeight: 'bold', color: '#52c41a' }}>
                        {annotation.ai_score}分
                      </span>
                    )}
                  </div>

                  {/* 批注内容 */}
                  {isEditing ? (
                    <div onClick={(e) => e.stopPropagation()}>
                      <TextArea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={3}
                        style={{ marginBottom: 8 }}
                      />
                      <Space>
                        <Button
                          type="primary"
                          size="small"
                          onClick={() => handleSaveEdit(annotation.id)}
                        >
                          确定
                        </Button>
                        <Button size="small" onClick={handleCancelEdit}>
                          取消
                        </Button>
                      </Space>
                    </div>
                  ) : (
                    <div style={{ fontSize: 14, color: '#262626', marginBottom: 8 }}>
                      {annotation.content}
                    </div>
                  )}

                  {/* 操作按钮 */}
                  {!isEditing && isSelected && (
                    <Space size="small">
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
                      {annotation.originalRtp && (
                        <Button
                          size="small"
                          icon={<UndoOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            onResetPosition(annotation.id);
                          }}
                        >
                          重置位置
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

      {/* 底部保存按钮 */}
      <div className="panel-footer">
        <Button
          type="primary"
          icon={<SaveOutlined />}
          block
          disabled={!hasUnsavedChanges}
          onClick={onSave}
        >
          保存修改
        </Button>
      </div>
    </div>
  );
};

export default AnnotationPanel;
