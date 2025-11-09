import React, { memo, forwardRef } from "react";
import { Button, Radio, Divider, Image } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";

/**
 * 作文内容组件
 * 包含作文标题、学生信息、句子渲染和图片预览
 * 使用 React.memo 优化，避免不必要的重新渲染
 */
const EssayContent = memo(forwardRef(({
  essayData,
  currentStudent,
  viewMode,
  sentenceElements,
  studentImages,
  selectedSentence,
  showAddComment,
  animationKey,
  onViewModeChange,
  onDeleteGrading,
  onNavigate,
  onOpenAddComment,
  onDeleteComment,
}, ref) => {
  return (
    <div className="center-panel" ref={ref}>
      <div className="essay-grading-header">
        <div style={{ display: "flex", alignItems: "baseline", gap: "16px" }}>
          <h3 style={{ margin: 0 }}>作文批改</h3>
          <Radio.Group 
            value={viewMode} 
            onChange={onViewModeChange} 
            buttonStyle="solid" 
            size="small"
          >
            <Radio.Button value="text">识别结果</Radio.Button>
            <Radio.Button value="image">学生图片</Radio.Button>
          </Radio.Group>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Button 
            type="default" 
            danger 
            icon={<DeleteOutlined />}
            onClick={onDeleteGrading}
          >
            删除批改
          </Button>
          <Button type="default" onClick={() => onNavigate("/")}>
            返回首页
          </Button>
        </div>
      </div>
      <div className="essay-card">
        <h3 className="essay-title">{essayData.title}</h3>
        <div className="student-info-header">
          <div>姓名：{currentStudent?.name}</div>
          <div>字数：{essayData.wordCount}字</div>
        </div>
        <Divider />
        
        {/* 根据 viewMode 显示不同内容 */}
        {viewMode === "text" ? (
          <div className="essay-content">
            {sentenceElements}
          </div>
        ) : (
          <div className="student-images-container">
            {studentImages.length > 0 ? (
              <Image.PreviewGroup>
                <div className="images-grid">
                  {studentImages.map((imageUrl, index) => (
                    <div key={index} className="image-wrapper">
                      <Image
                        src={imageUrl}
                        alt={`学生作答图片 ${index + 1}`}
                        style={{ 
                          width: "100%",
                          borderRadius: "8px",
                          border: "1px solid #e8e8e8"
                        }}
                        placeholder={
                          <div style={{ 
                            background: "#f5f5f5", 
                            height: "400px", 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center" 
                          }}>
                            加载中...
                          </div>
                        }
                      />
                      <div className="image-label">图片 {index + 1}</div>
                    </div>
                  ))}
                </div>
              </Image.PreviewGroup>
            ) : (
              <div className="no-images-placeholder">
                <p>暂无学生图片</p>
              </div>
            )}
          </div>
        )}
        
        {/* 底部导航栏 - 只在文字模式下显示 */}
        {viewMode === "text" && selectedSentence && !showAddComment && (
          <div key={animationKey} className="sentence-selection-toolbar">
            <div className="toolbar-actions">
              <button className="action-btn" onClick={onOpenAddComment}>
                <span>添加评语</span>
              </button>
              <button className="action-btn" onClick={onDeleteComment}>
                <span>删除评语</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}), (prevProps, nextProps) => {
  // 自定义比较函数，优化性能
  return (
    prevProps.viewMode === nextProps.viewMode &&
    prevProps.showAddComment === nextProps.showAddComment &&
    prevProps.animationKey === nextProps.animationKey &&
    prevProps.essayData.title === nextProps.essayData.title &&
    prevProps.essayData.wordCount === nextProps.essayData.wordCount &&
    prevProps.currentStudent?.name === nextProps.currentStudent?.name &&
    prevProps.selectedSentence === nextProps.selectedSentence &&
    prevProps.studentImages.length === nextProps.studentImages.length
  );
});

EssayContent.displayName = "EssayContent";

export default EssayContent;

