import React from 'react';
import { Card, Button, Typography, Divider, Space } from 'antd';
import { PlusOutlined, SaveOutlined, DeleteOutlined, ImportOutlined, ExportOutlined } from '@ant-design/icons';
import { useMessageService } from '../../components/common/message';

const { Title, Paragraph } = Typography;

/**
 * 答题卷设计页面组件
 */
const ExamPaperDesign = () => {
  const { showSuccess, showError, showInfo } = useMessageService();

  // 模拟加载试卷数据
  const loadExamData = () => {
    showInfo('正在加载试卷数据...');
    // 实际项目中这里会调用API获取数据
    setTimeout(() => {
      showSuccess('试卷数据加载成功');
    }, 1000);
  };

  // 保存试卷设计
  const saveExamPaper = () => {
    showInfo('正在保存试卷设计...');
    // 实际项目中这里会调用API保存数据
    setTimeout(() => {
      showSuccess('试卷设计保存成功');
    }, 1000);
  };

  // 创建新试卷
  const createNewExam = () => {
    showSuccess('创建新试卷');
    // 实际项目中这里会清空当前设计并创建新的试卷
  };

  // 删除试卷
  const deleteExam = () => {
    // 实际项目中这里会有确认弹窗
    showError('试卷已删除');
  };

  // 导入试卷
  const importExam = () => {
    showInfo('导入试卷功能');
  };

  // 导出试卷
  const exportExam = () => {
    showInfo('导出试卷功能');
  };

  // 页面加载时执行
  React.useEffect(() => {
    loadExamData();
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      <Card title="答题卷设计" bordered={false}>
        <div style={{ marginBottom: '24px' }}>
          <Title level={4}>试卷设计功能</Title>
          <Paragraph>
            在此页面可以设计和编辑考试答题卷，包括添加题目、设置分值、调整题目顺序等功能。
          </Paragraph>
        </div>

        <Divider />

        {/* 操作按钮区域 */}
        <Space style={{ marginBottom: '24px' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={createNewExam}>
            创建新试卷
          </Button>
          <Button icon={<SaveOutlined />} onClick={saveExamPaper}>
            保存试卷
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={deleteExam}>
            删除试卷
          </Button>
          <Button icon={<ImportOutlined />} onClick={importExam}>
            导入试卷
          </Button>
          <Button icon={<ExportOutlined />} onClick={exportExam}>
            导出试卷
          </Button>
        </Space>

        {/* 试卷设计主区域 */}
        <div style={{ minHeight: '400px', padding: '20px', backgroundColor: '#fafafa', borderRadius: '6px' }}>
          <div style={{ textAlign: 'center', color: '#999', padding: '100px 0' }}>
            请选择或创建一份试卷进行设计
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ExamPaperDesign;