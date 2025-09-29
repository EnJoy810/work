import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Upload,
  message,
  Button,
  Card,
  Input,
  Select,
  Form,
} from "antd";
import {
  UploadOutlined,
  FileTextOutlined,
  FileSearchOutlined,
  PlusOutlined,
  FileProtectOutlined,
} from "@ant-design/icons";
import "./home.css";

const { Title, Paragraph } = Typography;
const { Dragger } = Upload;

/**
 * 创建考试页面组件
 * 包含试卷题目和答案及解析两个部分
 */
const CreateExam = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // 处理创建新考试
  const handleCreateExam = () => {
    form
      .validateFields()
      .then((values) => {
        // 获取考试信息数据
        const examData = {
          name: values.examName,
          subject: values.examSubject,
          // 这里可以添加其他需要的考试信息
        };

        console.log("创建新考试数据:", examData);
        message.success("考试创建成功");

        // 这里可以添加提交考试数据到后端的逻辑
        // 提交成功后可以跳转到考试详情页或其他页面
        // navigate(`/exam/${examId}`);
      })
      .catch((info) => {
        // message.error('表单验证失败');
        console.log("表单验证失败:", info);
      });
  };

  // 试卷题目上传配置
  const paperUploadProps = {
    name: "paper",
    multiple: false,
    accept: ".pdf",
    beforeUpload: (file) => {
      // 这里可以添加文件校验逻辑
      const validTypes = ["application/pdf"];
      const isAllowedType = validTypes.includes(file.type);
      if (!isAllowedType) {
        message.error("只支持 PDF 格式的文件!");
      }
      return isAllowedType;
    },
    onChange(info) {
      console.log("文件上传信息:", info);
      const { status } = info.file;
      if (status === "done") {
        message.success(`${info.file.name} 文件上传成功`);
      } else if (status === "error") {
        message.error(`${info.file.name} 文件上传失败`);
      }
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
  };

  // 答案及解析上传配置
  const answerUploadProps = {
    ...paperUploadProps,
    name: "answer",
    onChange(info) {
      console.log("文件上传信息:", info);
      const { status } = info.file;
      if (status === "done") {
        message.success(`${info.file.name} 答案文件上传成功`);
      } else if (status === "error") {
        message.error(`${info.file.name} 答案文件上传失败`);
      }
    },
  };

  // 返回首页
  const handleBack = () => {
    navigate("/");
  };

  return (
    <div style={{ padding: "24px", width: "60%", margin: "0 auto" }}>
      <div
        style={{
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Title level={4} style={{ marginBottom: 0 }}>
          创建新考试
        </Title>
        <Button onClick={handleBack}>返回首页</Button>
      </div>

      {/* 试卷题目部分 */}
      <Card
        style={{
          marginBottom: "24px",
          border: "1px solid #0000001a",
          borderRadius: "20px",
        }}
      >
        <Title
          level={5}
          style={{
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <FileTextOutlined style={{ marginRight: "8px", color: "#1890ff" }} />
          试卷题目
        </Title>

        {/* 上传试卷 */}
        <div style={{ marginBottom: "24px" }}>
          <Paragraph style={{ marginBottom: "8px" }}>
            上传试卷图片文件，AI将自动识别题目
          </Paragraph>
          <Dragger {...paperUploadProps}>
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">
              选择<span style={{ fontWeight: "bold" }}>试卷文件</span>
              ，点击或拖拽文件到此区域上传
            </p>
            <p className="ant-upload-hint">支持 PDF 格式文件</p>
          </Dragger>
        </div>

        {/* 从题库选择练习册章节 */}
        {/* <div style={{ marginBottom: '24px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Paragraph style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
              <FileTextOutlined style={{ marginRight: '8px' }} /> 从题库中选择练习册章节
            </Paragraph>
            <Paragraph style={{ marginBottom: '8px', fontSize: '14px', color: '#666' }}>选择现有练习册的特定章节</Paragraph>
            
            <Card 
              style={{ width: '100%', border: '1px solid #d9d9d9' }}
              actions={[
                <Button type="primary" onClick={handleSelectChapter}>
                  选择章节
                </Button>
              ]}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Paragraph style={{ marginBottom: 0 }}>高中数学必修1 - 第一章：集合与函数概念</Paragraph>
                <Paragraph style={{ marginBottom: 0, color: '#52c41a', fontSize: '14px' }}>已选择章节，包含12道题目</Paragraph>
              </div>
            </Card>
          </Space>
        </div> */}

        {/* 从题库中自定义 */}
        {/* <div>
          <Button 
            type="dashed" 
            style={{ width: '100%', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={handleCustomQuestions}
          >
            <Space>
              <PlusOutlined />
              <span>从题库中自定义</span>
            </Space>
          </Button>
          <Paragraph style={{ marginBottom: 0, marginTop: '8px', fontSize: '14px', color: '#666' }}>从题库中手动选择和组合题目</Paragraph>
        </div> */}
      </Card>

      {/* 答案及解析部分 */}
      <Card style={{ border: "1px solid #0000001a", borderRadius: "20px" }}>
        <Title
          level={5}
          style={{
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <FileSearchOutlined style={{ marginRight: "8px", color: "#52c41a" }} />
          答案及解析
        </Title>
        <div style={{ marginBottom: "24px" }}>
          <Paragraph style={{ marginBottom: "8px" }}>
            上传标准答案和详细解析文件
          </Paragraph>
          <Dragger {...answerUploadProps}>
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">
              选择<span style={{ fontWeight: "bold" }}>答案文件</span>
              ，点击或拖拽文件到此区域上传
            </p>
            <p className="ant-upload-hint">支持 PDF 格式文件</p>
          </Dragger>
        </div>

        {/* AI生成答案及解析 */}
        {/* <Card
          style={{
            border: "1px solid #e6f7ff",
            borderRadius: "6px",
            backgroundColor: "#f6ffed",
          }}
          actions={[
            <Button type="primary" onClick={handleAIGenerate}>
              立即生成
            </Button>,
          ]}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <Paragraph
              style={{ marginBottom: 0, fontWeight: "500", color: "#52c41a" }}
            >
              AI生成答案及解析
            </Paragraph>
            <span
              style={{
                marginLeft: "8px",
                padding: "2px 6px",
                backgroundColor: "#52c41a",
                color: "white",
                fontSize: "12px",
                borderRadius: "4px",
              }}
            >
              推荐
            </span>
          </div>
          <Paragraph
            style={{
              marginBottom: 0,
              marginTop: "8px",
              fontSize: "14px",
              color: "#666",
            }}
          >
            基于试卷内容，AI将自动生成标准答案和详细解析
          </Paragraph>
        </Card> */}
      </Card>

      {/* 考试信息部分 */}
      <Card
        style={{
          border: "1px solid #0000001a",
          borderRadius: "20px",
          marginTop: "24px",
        }}
      >
        <Title
          level={5}
          style={{
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <FileProtectOutlined style={{ marginRight: "8px", color: "#fa8c16" }} />
          考试信息
        </Title>

        <Form
          form={form}
          layout="horizontal"
          style={{ width: "100%" }}
          initialValues={{
            examSubject: "chinese",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ width: "48%" }}>
              <Form.Item
                label="考试名称"
                name="examName"
                rules={[{ required: true, message: "请输入考试名称" }]}
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
              >
                <Input placeholder="请输入考试名称" style={{ width: "100%" }} />
              </Form.Item>
            </div>
            <div style={{ width: "48%" }}>
              <Form.Item
                label="考试科目"
                name="examSubject"
                rules={[{ required: true, message: "请选择考试科目" }]}
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
              >
                <Select style={{ width: "100%" }} placeholder="请选择考试科目" defaultValue="chinese">
                  <Select.Option value="chinese">语文</Select.Option>
                  {/* <Select.Option value="math">数学</Select.Option>
                  <Select.Option value="english">英语</Select.Option> */}
                </Select>
              </Form.Item>
            </div>
          </div>
        </Form>
      </Card>

      {/* 创建新考试按钮 */}
      <div
        style={{ marginTop: "24px", display: "flex", justifyContent: "end" }}
      >
        <Button
          type="primary"
          size="large"
          onClick={handleCreateExam}
          style={{ width: "200px", height: "48px", fontSize: "16px" }}
          icon={<PlusOutlined />}
        >
          创建新考试
        </Button>
      </div>
    </div>
  );
};

export default CreateExam;
