import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Typography, Upload, Button, Card } from "antd";
import { useMessageService } from "../../components/common/message";
import {
  UploadOutlined,
  FileTextOutlined,
  FileProtectOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import request from "../../utils/request";
import "./styles/home.css";

const { Title, Paragraph } = Typography;
const { Dragger } = Upload;

/**
 * 上传答题卡页面组件
 * 提供答题卡文件上传功能
 */
const UploadAnswerSheet = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [answerSheetFile, setAnswerSheetFile] = useState(null);
  const [gradingId, setGradingId] = useState(null);
  const { showSuccess, showError, showInfo } = useMessageService();

  // 从URL参数中获取grading_id - 使用react-router-dom标准方法
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const gradingIdFromParams = searchParams.get("grading_id");
    if (gradingIdFromParams) {
      setGradingId(gradingIdFromParams);
    }
  }, [location]);

  // 处理上传答题卡
  const handleUploadAnswerSheet = () => {
    // 检查文件是否上传
    if (!answerSheetFile) {
      showError("请上传答题卡文件");
      return;
    }

    // 检查是否有grading_id
    if (!gradingId) {
      showError("缺少评分ID，请从正确的页面进入");
      return;
    }
     

    // 创建FormData对象
    const formData = new FormData();
    formData.append("student_papers", answerSheetFile);
    formData.append("grading_id", gradingId);
    
    console.log("上传答题卡数据: 已准备FormData");
    console.log("grading_id:", gradingId);  
    
    // 直接使用request.post方法调用/grading/grade接口，确保能传递多个参数
    request.post("/grading/grade", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      }
    })
      .then(() => {
        showSuccess("答题卡上传成功，请等候评分完成");
        // 重置状态
        setAnswerSheetFile(null);
        // 跳转到首页
        navigate("/");
      })
      .catch(error => {
        console.error("答题卡上传失败:", error);
        showError("答题卡上传失败，请重试");
      });

  };

  // 答题卡上传配置
  const answerSheetUploadProps = {
    name: "answerSheet",
    multiple: false,
    accept: ".pdf",
    beforeUpload: (file) => {
      // 阻止自动上传，只保存文件到state
      const validTypes = ["application/pdf"];
      const isAllowedType = validTypes.includes(file.type);
      if (!isAllowedType) {
        showError("只支持 PDF 格式的文件!");
        return false;
      }

      // 保存文件到state
      setAnswerSheetFile(file);
      return false;
    },
    onChange(info) {
      // 当文件被移除时更新状态
      if (info.file.status === "removed") {
        setAnswerSheetFile(null);
        showInfo("已移除答题卡文件");
      }
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
    fileList: answerSheetFile
      ? [
          {
            uid: "answerSheet-1",
            name: answerSheetFile.name,
            status: "done",
          },
        ]
      : [],
    // 隐藏上传按钮，只使用拖拽区域
    showUploadList: true,
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

      <div style={{ width: "100%" }}>
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
            <FileTextOutlined
              style={{ marginRight: "8px", color: "#1890ff" }}
            />
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
      </div>

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
