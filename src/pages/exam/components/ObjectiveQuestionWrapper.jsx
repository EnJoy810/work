import { useState } from 'react';

import { Button, Dropdown, Space } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

/**
 * 选择题包装组件
 * 为选择题添加鼠标悬停效果，显示编辑和删除按钮
 */
const ObjectiveQuestionWrapper = ({ children, objectiveItem, onEdit, onDelete }) => {
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
      onEdit(objectiveItem);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(objectiveItem);
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        marginBottom: '30px',
        border: isHovered ? '2px solid #1890ff' : '2px solid transparent',
        borderRadius: '4px',
        padding: '10px',
        transition: 'border-color 0.3s ease',
        cursor: isHovered ? 'pointer' : 'default',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 操作按钮菜单 - 使用antd组件 */}
      {isHovered && (
        <div
          style={{
            position: 'absolute',
            top: '5px',
            right: '5px',
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
                backgroundColor: '#fff',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                border: '1px solid #d9d9d9',
                padding: '4px 8px',
                color: '#1890ff',
                minWidth: '60px',
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
                backgroundColor: '#fff',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                border: '1px solid #d9d9d9',
                padding: '4px 8px',
                minWidth: '60px',
                marginTop: '2px',
              }}
            >
              删除
            </Button>
          </Space>
        </div>
      )}
      
      {/* 包裹的选择题内容 */}
      {children}
    </div>
  );
};

export default ObjectiveQuestionWrapper;