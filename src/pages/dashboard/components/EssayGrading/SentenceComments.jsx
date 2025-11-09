import React, { memo } from "react";
import { Button, Tag, Badge, Divider } from "antd";

/**
 * 按句评语组件
 * 使用 React.memo 优化，避免不必要的重新渲染
 */
const SentenceComments = memo(({
  comments,
  highlightedIndex,
  editingIndex,
  editingContent,
  getColorValue,
  onStartEdit,
  onContentChange,
  onSave,
  onCancel,
}) => {
  return (
    <div className="sentence-comments-section">
      <h4>按句评语</h4>
      <div className="sentence-comments">
        {comments.map((comment, commentIndex) => {
          const isEditing = editingIndex === commentIndex;
          
          return (
            <div
              key={commentIndex}
              className={`comment-item comment-${comment.color}`}
              style={{
                borderLeft: `4px solid ${getColorValue(comment.color)}`,
              }}
            >
              <div className="comment-header">
                <Tag color={comment.color}>带评语</Tag>
                <div className="comment-icons">
                  <Badge dot>
                    <span>AI</span>
                  </Badge>
                </div>
              </div>
              <div className="original-sentence">
                {comment.originalSentence}
              </div>
              
              {isEditing ? (
                <div className="comment-edit-mode">
                  <textarea
                    value={editingContent}
                    onChange={onContentChange}
                    className="comment-edit-textarea"
                    rows={4}
                    autoFocus
                  />
                  <div className="comment-edit-actions">
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
                      onClick={() => onSave(commentIndex)}
                      className="edit-save-btn"
                    >
                      保存
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className={`comment-content comment-editable ${!comment.comment ? "comment-placeholder" : ""}`}
                  onClick={() => onStartEdit(commentIndex, comment.comment)}
                  title="点击编辑评语"
                >
                  {comment.comment || "请输入评语内容..."}
                </div>
              )}
              
              {comment.sentenceIndex === highlightedIndex && !isEditing && (
                <div className="improvement-suggestion">
                  <h5>建议修改：</h5>
                  <p>段落一下面有冗余的感叹号，节省一点提问空间</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数，优化性能
  return (
    prevProps.highlightedIndex === nextProps.highlightedIndex &&
    prevProps.editingIndex === nextProps.editingIndex &&
    prevProps.editingContent === nextProps.editingContent &&
    prevProps.comments.length === nextProps.comments.length &&
    prevProps.comments.every((comment, index) => {
      const nextComment = nextProps.comments[index];
      return (
        comment.color === nextComment.color &&
        comment.comment === nextComment.comment &&
        comment.originalSentence === nextComment.originalSentence &&
        comment.sentenceIndex === nextComment.sentenceIndex
      );
    })
  );
});

SentenceComments.displayName = "SentenceComments";

export default SentenceComments;

