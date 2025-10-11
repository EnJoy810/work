import { useState } from "react";
import { Button, Space } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

/**
 * 通用题目包装组件
 * 为题目添加鼠标悬停效果，显示编辑和删除按钮
 * 同时支持选择题和非选择题
 */
const QuestionWrapper = ({
  children,
  objectiveItem,
  subjectiveItem,
  onEdit,
  onDelete,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit) {
      // 根据提供的prop类型传递相应的题目数据
      onEdit(objectiveItem || subjectiveItem);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      // 根据提供的prop类型传递相应的题目数据
      onDelete(objectiveItem || subjectiveItem);
    }
  };

  return (
    <div
      className="question-wrapper"
      style={{
        position: "relative",
        border: isHovered ? "2px solid #1890ff" : "2px solid transparent",
        borderRadius: "4px",
        padding: "0 10px",
        transition: "border-color 0.3s ease",
        cursor: isHovered ? "pointer" : "default",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 操作按钮菜单 - 使用antd组件 */}
      {isHovered && (
        <div
          style={{
            position: "absolute",
            top: "5px",
            right: "5px",
            zIndex: 10,
          }}
        >
          <Space direction="vertical" size={0}>
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={handleEdit}
              style={{
                backgroundColor: "#fff",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                border: "1px solid #d9d9d9",
                padding: "4px 8px",
                color: "#1890ff",
                minWidth: "60px",
              }}
            >
              编辑
            </Button>
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              onClick={handleDelete}
              danger
              style={{
                backgroundColor: "#fff",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                border: "1px solid #d9d9d9",
                padding: "4px 8px",
                minWidth: "60px",
                marginTop: "2px",
              }}
            >
              删除
            </Button>
          </Space>
        </div>
      )}

      {/* 包裹的题目内容 */}
      {children}
    </div>
  );
};

export default QuestionWrapper;
