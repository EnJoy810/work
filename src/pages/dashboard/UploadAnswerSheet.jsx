import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Typography, Upload, Button, Card, Progress } from "antd";
import { useMessageService } from "../../components/common/message";
import {
  UploadOutlined,
  FileTextOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { multipartUploadWithProgress } from "../../services/ossUpload";
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
  const [uploadProgress, setUploadProgress] = useState(0); // 上传进度 0-100
  const [currentFileIndex, setCurrentFileIndex] = useState(0); // 当前上传的文件索引
  const [cancelling, setCancelling] = useState(false); // 是否正在取消
  const [uploadSpeed, setUploadSpeed] = useState(0); // 上传速度 bytes/s
  const abortControllerRef = useRef(null); // 用于中断上传
  const uploadStartTimeRef = useRef(null); // 上传开始时间
  const uploadedBytesRef = useRef(0); // 已上传字节数
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
    setUploadProgress(0);
    setCurrentFileIndex(0);
    setUploadSpeed(0);
    abortControllerRef.current = new AbortController();
    uploadStartTimeRef.current = Date.now();
    uploadedBytesRef.current = 0;
    
    try {
      // 批量分片上传，收集 object_key 列表
      const keys = [];
      const totalFiles = answerSheetFiles.length;
      
      for (let i = 0; i < totalFiles; i++) {
        // 检查是否已中断
        if (abortControllerRef.current?.signal?.aborted) {
          throw new Error("上传已取消");
        }
        
        const f = answerSheetFiles[i];
        setCurrentFileIndex(i);
        
        const { objectKey } = await multipartUploadWithProgress(f, {
          userId,
          contentType: f.type || "application/pdf",
          channel: 'grading',
          onProgress: (percent) => {
            // 计算总进度：已完成文件 + 当前文件进度
            const totalProgress = Math.round(((i * 100) + percent) / totalFiles);
            setUploadProgress(totalProgress);
            
            // 计算已上传字节数
            const previousFilesSize = answerSheetFiles.slice(0, i).reduce((sum, file) => sum + file.size, 0);
            const currentFileUploaded = (percent / 100) * f.size;
            const totalUploaded = previousFilesSize + currentFileUploaded;
            uploadedBytesRef.current = totalUploaded;
            
            // 计算上传速度和剩余时间
            const elapsed = (Date.now() - uploadStartTimeRef.current) / 1000; // 秒
            if (elapsed > 0.5) { // 至少 0.5 秒后再计算，避免初始值不准
              const speed = totalUploaded / elapsed; // bytes/s
              setUploadSpeed(speed);
            }
          },
          signal: abortControllerRef.current?.signal,
        });
        keys.push(objectKey);
      }
      
      setUploadProgress(100);
      
      // 提交业务接口触发评分
      await gradeStudentPaperOSS({
        grading_id: gradingId,
        answer_sheet_object_keys: keys,
      });
      showSuccess("答题卡上传成功，请等候评分完成");
      setAnswerSheetFiles([]);
      navigate("/");
    } catch (error) {
      if (error?.message === "上传已取消" || error?.name === "AbortError") {
        showInfo("上传已取消");
      } else {
        console.error("答题卡上传失败:", error);
        showError(error?.message || "答题卡上传失败，请重试");
      }
    } finally {
      setUploading(false);
      setCancelling(false);
      abortControllerRef.current = null;
    }
  };

  // 取消上传
  const handleCancelUpload = () => {
    if (abortControllerRef.current && !cancelling) {
      setCancelling(true); // 立即显示"取消中"状态
      abortControllerRef.current.abort();
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

      {/* 上传进度条 */}
      {uploading && (
        <Card 
          style={{ 
            marginBottom: "24px",
            borderRadius: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", padding: "8px 16px" }}>
            {/* 左侧进度环 */}
            <div style={{ marginRight: "32px" }}>
              <Progress
                percent={uploadProgress}
                type="circle"
                size={100}
                strokeWidth={10}
                strokeLinecap="round"
                trailColor="#edf2ff" // 极淡的蓝紫色轨迹
                strokeColor={{
                  '0%': '#4c6ef5',
                  '100%': '#63e6be',
                }}
                format={(percent) => (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
                    <span style={{ fontSize: '24px', fontWeight: 700, color: '#333' }}>
                      {percent}<span style={{ fontSize: '12px', color: '#888' }}>%</span>
                    </span>
                    <span style={{ fontSize: '12px', color: '#999', marginTop: 4 }}>已上传</span>
                  </div>
                )}
              />
            </div>

            {/* 右侧信息区 */}
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: "0 0 10px 0", fontSize: "18px", fontWeight: 600, color: "#1a1a1a" }}>
                正在上传答题卡...
              </h3>
              
              <div style={{ marginBottom: "12px", display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <span style={{ 
                  fontSize: "13px", 
                  color: "#666", 
                  background: "#f5f7fa", 
                  padding: "6px 12px", 
                  borderRadius: "6px",
                  border: "1px solid #eef0f5"
                }}>
                  文件：<span style={{ color: "#4c6ef5", fontWeight: "bold" }}>{currentFileIndex + 1}</span> / {answerSheetFiles.length}
                </span>
                <span style={{ 
                  fontSize: "13px", 
                  color: "#666", 
                  background: "#f5f7fa", 
                  padding: "6px 12px", 
                  borderRadius: "6px",
                  border: "1px solid #eef0f5"
                }}>
                  速度：<span style={{ color: "#4c6ef5", fontWeight: "bold" }}>
                    {uploadSpeed > 0 ? (uploadSpeed / 1024 / 1024).toFixed(2) : '--'} MB/s
                  </span>
                </span>
              </div>

              <Button 
                danger 
                size="middle"
                shape="default"
                onClick={handleCancelUpload}
                loading={cancelling}
                disabled={cancelling}
                style={{ minWidth: "90px" }}
              >
                {cancelling ? "取消中..." : "取消任务"}
              </Button>
            </div>
          </div>
        </Card>
      )}

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
