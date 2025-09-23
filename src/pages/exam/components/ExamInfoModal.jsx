import React, { useEffect, useState } from 'react';
import { Modal, Button, Input, InputNumber } from 'antd';

/**
 * 考试信息编辑弹窗组件
 */
const ExamInfoModal = ({ visible, onCancel, onSave, initialData }) => {
  // 本地表单数据状态
  const [formData, setFormData] = useState({
    subject: '',
    major: '',
    time: ''
  });

  // 当初始数据或可见性变化时，更新表单数据
  useEffect(() => {
    if (visible && initialData) {
      setFormData({
        subject: initialData.examSubject || '',
        major: initialData.applicableMajor || '',
        time: initialData.examTime || ''
      });
    }
  }, [visible, initialData]);

  // 处理表单输入变化
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 处理保存
  const handleSave = () => {
    if (onSave) {
      onSave({
        examSubject: formData.subject,
        applicableMajor: formData.major,
        examTime: formData.time
      });
    }
  };

  return (
    <Modal
      title="编辑考试信息"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          保存
        </Button>
      ]}
    >
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>
        <label style={{ width: '160px', textAlign: 'right', marginRight: '16px' }}>考试科目：</label>
        <Input
          value={formData.subject}
          onChange={(e) => handleInputChange('subject', e.target.value)}
          placeholder="请输入考试科目"
          style={{ flex: 1 }}
        />
      </div>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>
        <label style={{ width: '160px', textAlign: 'right', marginRight: '16px' }}>适用专业（班级）：</label>
        <Input
          value={formData.major}
          onChange={(e) => handleInputChange('major', e.target.value)}
          placeholder="请输入适用专业（班级）"
          style={{ flex: 1 }}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <label style={{ width: '160px', textAlign: 'right', marginRight: '16px' }}>考试时间（分钟）：</label>
        <InputNumber
          min={1}
          max={300}
          value={formData.time ? parseInt(formData.time) : undefined}
          onChange={(val) => handleInputChange('time', val !== null ? String(val) : '')}
          style={{ width: '100px' }}
        />
      </div>
    </Modal>
  );
};

export default ExamInfoModal;