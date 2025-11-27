import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Typography, Upload, Button, Card } from "antd";
import { useMessageService } from "../../components/common/message";
import {
  UploadOutlined,
  FileTextOutlined,
  FileProtectOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { uploadWithInit } from "../../services/ossUpload";
import { gradeStudentPaperOSS } from "../../api/grading";
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
  const [answerSheetFiles, setAnswerSheetFiles] = useState([]);
  const [gradingId, setGradingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { showSuccess, showError, showInfo } = useMessageService();
  const userId = useSelector((state) => state?.user?.userInfo?.userId);

  // 从URL参数中获取grading_id - 使用react-router-dom标准方法
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const gradingIdFromParams = searchParams.get("grading_id");
    if (gradingIdFromParams) {
      setGradingId(gradingIdFromParams);
    }
  }, [location]);

  // 处理上传答题卡
  const handleUploadAnswerSheet = async () => {
    // 检查文件是否上传
    if (!answerSheetFiles || answerSheetFiles.length === 0) {
      showError("请上传答题卡文件");
      return;
    }

    // 检查是否有grading_id
    if (!gradingId) {
      showError("缺少评分ID，请从正确的页面进入");
      return;
    }

    // 设置上传中状态
    setUploading(true);
    try {
      // 批量 STS → init → PUT，收集 object_key 列表
      const keys = [];
      for (const f of answerSheetFiles) {
        const { objectKey } = await uploadWithInit(f, {
          userId,
          contentType: f.type || "application/pdf",
          channel: 'grading',
        });
        keys.push(objectKey);
      }
      // 提交业务接口触发评分（下划线命名：grading_id + answer_sheet_object_keys[]）
      await gradeStudentPaperOSS({
        grading_id: gradingId,
        answer_sheet_object_keys: keys,
      });
      showSuccess("答题卡上传成功，请等候评分完成");
      setAnswerSheetFiles([]);
      navigate("/");
    } catch (error) {
      console.error("答题卡上传失败:", error);
      showError(error?.message || "答题卡上传失败，请重试");
    } finally {
      setUploading(false);
    }
  };

  // 答题卡上传配置
  const answerSheetUploadProps = {
    name: "answerSheet",
    multiple: true,
    accept: ".pdf",
    beforeUpload: (file) => {
      const validTypes = ["application/pdf"];
      const isAllowedType = validTypes.includes(file.type);
      if (!isAllowedType) {
        showError("只支持 PDF 格式的文件!");
        return false;
      }
      setAnswerSheetFiles((prev) => [...prev, file]);
      return false; // 阻止自动上传
    },
    onRemove: (file) => {
      setAnswerSheetFiles((prev) => prev.filter((f) => f.uid ? f.uid !== file.uid : f.name !== file.name));
      showInfo("已移除答案文件");
    },
    fileList: (answerSheetFiles || []).map((f, idx) => ({
      uid: f.uid || `answer-${idx}`,
      name: f.name,
      status: "done",
    })),
  };

  // 隐藏上传按钮，只使用拖拽区域
  // showUploadList: true,

  // 返回首页
  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="upload-sheet-container">
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
          loading={uploading}
          disabled={uploading}
          style={{ width: "200px", height: "48px", fontSize: "16px" }}
          icon={!uploading && <PlusOutlined />}
        >
          {uploading ? "上传中..." : "上传答题卡"}
        </Button>
      </div>
    </div>
  );
};

export default UploadAnswerSheet;
