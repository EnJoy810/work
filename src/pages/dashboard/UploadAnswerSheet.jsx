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
  FileProtectOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import "./home.css";

const { Title, Paragraph } = Typography;
const { Dragger } = Upload;

/**
 * 上传答题卡页面组件
 * 提供答题卡文件上传功能
 */
const UploadAnswerSheet = () => {
  const navigate = useNavigate();

  // 处理上传答题卡
  const handleUploadAnswerSheet = () => {};

  // 答题卡上传配置
  const answerSheetUploadProps = {
    name: "answerSheet",
    multiple: false,
    accept: ".pdf",
    beforeUpload: (file) => {
      // 文件校验逻辑
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
        message.success(`${info.file.name} 答题卡文件上传成功`);
      } else if (status === "error") {
        message.error(`${info.file.name} 答题卡文件上传失败`);
      }
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
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
          上传答题卡
        </Title>
        <Button onClick={handleBack}>返回首页</Button>
      </div>

      {/* 答题卡上传部分 */}
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
          答题卡文件
        </Title>

        <div style={{ marginBottom: "24px" }}>
          <Paragraph style={{ marginBottom: "8px" }}>
            上传答题卡文件，系统将自动进行识别和评分
          </Paragraph>
          <Dragger {...answerSheetUploadProps}>
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">
              选择<span style={{ fontWeight: "bold" }}>答题卡文件</span>
              ，点击或拖拽文件到此区域上传
            </p>
            <p className="ant-upload-hint">支持 PDF 格式文件</p>
          </Dragger>
        </div>
      </Card>

      {/* 上传答题卡按钮 */}
      <div
        style={{ marginTop: "24px", display: "flex", justifyContent: "end" }}
      >
        <Button
          type="primary"
          size="large"
          onClick={handleUploadAnswerSheet}
          style={{ width: "200px", height: "48px", fontSize: "16px" }}
          icon={<PlusOutlined />}
        >
          上传答题卡
        </Button>
      </div>
    </div>
  );
};

export default UploadAnswerSheet;
