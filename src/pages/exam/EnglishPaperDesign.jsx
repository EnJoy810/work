import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Divider, Space, Form, Input, Select, Row, Col, Table } from 'antd';
import { PlusOutlined, SaveOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useMessageService } from '../../components/common/message';

const { Title, Paragraph } = Typography;
const { Option } = Select;

/**
 * 英语试卷设计页面组件
 */
const EnglishPaperDesign = () => {
  const { showSuccess, showInfo } = useMessageService();
  const [form] = Form.useForm();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // 题目类型选项
  const questionTypeOptions = [
    { value: 'single', label: '单选题' },
    { value: 'multiple', label: '多选题' },
    { value: 'blank', label: '填空题' },
    { value: 'cloze', label: '完形填空' },
    { value: 'reading', label: '阅读理解' },
    { value: 'writing', label: '写作题' },
    { value: 'translation', label: '翻译题' },
  ];

  // 题型配置
  const questionColumns = [
    {
      title: '题号',
      dataIndex: 'number',
      key: 'number',
      width: 80,
    },
    {
      title: '题目类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => {
        const option = questionTypeOptions.find(opt => opt.value === type);
        return option ? option.label : type;
      },
    },
    {
      title: '题目内容',
      dataIndex: 'content',
      key: 'content',
    },
    {
      title: '分值',
      dataIndex: 'score',
      key: 'score',
      width: 80,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, rec) => (
          <Space size="middle">
            <Button type="link" icon={<EditOutlined />} onClick={() => handleEditQuestion()}>
              编辑
            </Button>
            <Button type="link" danger onClick={() => handleDeleteQuestion(rec.key)}>
              删除
            </Button>
          </Space>
        ),
    },
  ];

  // 加载试卷数据
  useEffect(() => {
    loadPaperData();
  }, []);

  // 模拟加载试卷数据
  const loadPaperData = () => {
    setLoading(true);
    showInfo('正在加载英语试卷数据...');
    // 模拟API请求延迟
    setTimeout(() => {
      // 模拟数据
      setQuestions([
        {
          key: '1',
          number: '1',
          type: 'single',
          content: 'Choose the correct answer: She ___ to school every day.',
          score: 2,
        },
        {
          key: '2',
          number: '2',
          type: 'blank',
          content: 'Complete the sentence: I ___ (go) to Beijing last year.',
          score: 2,
        },
        {
          key: '3',
          number: '3',
          type: 'translation',
          content: 'Translate the sentence into English: 我们应该保护环境。',
          score: 5,
        },
      ]);
      showSuccess('英语试卷数据加载成功');
      setLoading(false);
    }, 800);
  };

  // 保存试卷设计
  const savePaperDesign = () => {
    setLoading(true);
    showInfo('正在保存英语试卷设计...');
    // 模拟API请求延迟
    setTimeout(() => {
      showSuccess('英语试卷设计保存成功');
      setLoading(false);
    }, 800);
  };

  // 添加新题目
  const addNewQuestion = () => {
    const newQuestion = {
      key: String(Date.now()),
      number: String(questions.length + 1),
      type: 'single',
      content: '请输入题目内容',
      score: 2,
    };
    setQuestions([...questions, newQuestion]);
    showSuccess('成功添加新题目');
  };

  // 编辑题目
  const handleEditQuestion = () => {
    showInfo('编辑题目功能待实现');
  };

  // 删除题目
  const handleDeleteQuestion = (key) => {
    const newQuestions = questions.filter(q => q.key !== key);
    // 更新题号
    const updatedQuestions = newQuestions.map((q, index) => ({
      ...q,
      number: String(index + 1),
    }));
    setQuestions(updatedQuestions);
    showSuccess('题目已删除');
  };

  // 预览试卷
  const previewPaper = () => {
    showInfo('预览英语试卷功能待实现');
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card title="英语试卷设计" bordered={false}>
        <div style={{ marginBottom: '24px' }}>
          <Title level={4}>试卷信息</Title>
          <Form form={form} layout="vertical" style={{ maxWidth: 800 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="title" label="试卷标题" rules={[{ required: true }]}>
                  <Input placeholder="请输入试卷标题" defaultValue="高中英语期中考试试卷" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="subject" label="科目" initialValue="english">
                  <Select disabled>
                    <Option value="english">英语</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="totalScore" label="总分" rules={[{ required: true }]}>
                  <Input type="number" placeholder="请输入总分" defaultValue={150} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="examTime" label="考试时间(分钟)" rules={[{ required: true }]}>
                  <Input type="number" placeholder="请输入考试时间" defaultValue={120} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="description" label="试卷说明">
              <Input.TextArea rows={3} placeholder="请输入试卷说明" />
            </Form.Item>
          </Form>
        </div>

        <Divider />

        {/* 操作按钮区域 */}
        <Space style={{ marginBottom: '24px' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={addNewQuestion}>
            添加题目
          </Button>
          <Button icon={<SaveOutlined />} onClick={savePaperDesign} loading={loading}>
            保存试卷
          </Button>
          <Button onClick={previewPaper}>
            预览试卷
          </Button>
        </Space>

        {/* 题目列表 */}
        <div style={{ marginBottom: '24px' }}>
          <Title level={4}>题目列表</Title>
          <Table 
            columns={questionColumns} 
            dataSource={questions} 
            pagination={false} 
            loading={loading}
            rowKey="key"
          />
        </div>

        {/* 注意事项 */}
        <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f0f0f0', borderRadius: '6px' }}>
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            <strong>注意事项：</strong>
            1. 请合理设置题目分值，确保总分与设置一致；
            2. 英语科目建议包含单选题、完形填空、阅读理解、写作等题型；
            3. 保存后可以预览试卷效果。
          </Paragraph>
        </div>
      </Card>
    </div>
  );
};

export default EnglishPaperDesign;