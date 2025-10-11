import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Upload,
  Button,
  Card,
  Input,
  Select,
  Form,
  Radio,
} from "antd";
import { useMessageService } from "../../components/common/message";
import request from "../../utils/request";
import {
  UploadOutlined,
  FileTextOutlined,
  FileSearchOutlined,
  PlusOutlined,
  FileProtectOutlined,
  FileOutlined,
  SendOutlined,
} from "@ant-design/icons";
import "./styles/home.css";

const { Title, Paragraph } = Typography;
const { Dragger } = Upload;

/**
 * 创建考试页面组件
 * 包含试卷题目和答案及解析两个部分
 */
const CreateExam = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [paperFile, setPaperFile] = useState(null);
  const [answerFile, setAnswerFile] = useState(null);
  const { showSuccess, showError, showInfo } = useMessageService();

  // 考试创建类型：新建或选择已有
  const [examType, setExamType] = useState("new"); // 'new' 或 'existing'
  // 从API获取的已有考试数据
  const [existingExams, setExistingExams] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState(null);

  // 从API获取考试列表
  useEffect(() => {
    const fetchExams = async () => {
      setIsLoading(true);
      try {
        const response = await request.get("/grading/exam/list");
        // 假设API返回的数据结构与现有数据结构一致
        setExistingExams(response.data || []);
      } catch (error) {
        console.error("获取考试列表失败:", error);
        showError("获取考试列表失败，请稍后重试");
      } finally {
        setIsLoading(false);
      }
    };

    // 当选择"选择已有考试"时才获取数据
    if (examType === "existing") {
      fetchExams();
    }
  }, [examType, showError]);

  // 处理创建新考试
  const handleCreateExam = () => {
    form
      .validateFields()
      .then((values) => {
        // 检查文件是否上传
        if (!paperFile) {
          showError("请上传试卷题目文件");
          return;
        }

        if (!answerFile) {
          showError("请上传答案及解析文件");
          return;
        }

        // 创建FormData对象
        const formData = new FormData();

        // 添加考试信息
        formData.append("subject", values.examSubject);
        formData.append("paper_title", values.examName);
        formData.append("template", values.examTemplate);

        // 添加文件数据
        formData.append("origin_paper", paperFile);
        formData.append("standard_answer", answerFile);

        console.log("创建新考试数据: 已准备FormData");

        // 提交到后端接口
        request
          .post("/grading/exam/create", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          .then(() => {
            showSuccess("考试创建成功");
            navigate("/"); // 返回首页
          })
          .catch((error) => {
            console.error("考试创建失败:", error);
            showError("考试创建失败，请重试");
          });
      })
      .catch((info) => {
        console.log("表单验证失败:", info);
        // showError("表单验证失败");
      });
  };

  // 试卷题目上传配置
  const paperUploadProps = {
    name: "paper",
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
      setPaperFile(file);
      return false;
    },
    onChange(info) {
      // 当文件被移除时更新状态
      if (info.file.status === "removed") {
        setPaperFile(null);
        showInfo("已移除试卷文件");
      }
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
    fileList: paperFile
      ? [
          {
            uid: "paper-1",
            name: paperFile.name,
            status: "done",
          },
        ]
      : [],
    // 隐藏上传按钮，只使用拖拽区域
    showUploadList: true,
  };

  // 答案及解析上传配置
  const answerUploadProps = {
    ...paperUploadProps,
    name: "answer",
    beforeUpload: (file) => {
      // 阻止自动上传，只保存文件到state
      const validTypes = ["application/pdf"];
      const isAllowedType = validTypes.includes(file.type);
      if (!isAllowedType) {
        showError("只支持 PDF 格式的文件!");
        return false;
      }

      // 保存文件到state
      setAnswerFile(file);
      return false;
    },
    onChange(info) {
      // 当文件被移除时更新状态
      if (info.file.status === "removed") {
        setAnswerFile(null);
        showInfo("已移除答案文件");
      }
    },
    fileList: answerFile
      ? [
          {
            uid: "answer-1",
            name: answerFile.name,
            status: "done",
          },
        ]
      : [],
  };

  // 返回首页
  const handleBack = () => {
    navigate("/");
  };

  // 处理选择已有考试
  const handleSelectExistingExam = () => {
    if (!selectedExamId) {
      showError("请选择已有考试");
      return;
    }

    const selectedExam = existingExams.find(
      (exam) => exam.exam_id === selectedExamId
    );
    if (selectedExam) {
      // 调用接口根据exam_id创建考试信息
      request
        .post("/grading/create-grading?exam_id=" + selectedExamId, {
          // exam_id: selectedExamId,
        })
        .then(() => {
          showSuccess(`已成功创建考试：${selectedExam.title}`);
          // 创建成功后返回首页
          navigate("/");
        })
        .catch((error) => {
          console.error("创建考试失败:", error);
          showError("创建考试失败，请重试");
        });
    }
  };

  return (
    <div className="create-exam-container">
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

      {/* 考试类型选择 */}
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
          <SendOutlined style={{ marginRight: "8px", color: "#1890ff" }} />
          选择创建新考试的方式
        </Title>
        <div style={{ padding: "16px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Radio.Group
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
              buttonStyle="solid"
              style={{ display: "flex", gap: "16px" }}
            >
              <Radio.Button
                value="new"
                style={{
                  padding: "10px 32px",
                  fontSize: "16px",
                  height: "auto",
                }}
              >
                <PlusOutlined style={{ marginRight: "8px" }} />
                创建新考试
              </Radio.Button>
              <Radio.Button
                value="existing"
                style={{
                  padding: "10px 32px",
                  fontSize: "16px",
                  height: "auto",
                }}
              >
                <FileOutlined style={{ marginRight: "8px" }} />
                选择已有考试
              </Radio.Button>
            </Radio.Group>
          </div>
        </div>
      </Card>

      {examType === "new" ? (
        // 创建新考试内容
        <>
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
              <FileTextOutlined
                style={{ marginRight: "8px", color: "#1890ff" }}
              />
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
              <FileSearchOutlined
                style={{ marginRight: "8px", color: "#52c41a" }}
              />
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
              <FileProtectOutlined
                style={{ marginRight: "8px", color: "#fa8c16" }}
              />
              考试信息
            </Title>

            <Form
              form={form}
              layout="horizontal"
              style={{ width: "100%" }}
              initialValues={{
                examSubject: "chinese",
              }}
              labelCol={{ style: { width: '100px' } }}
              wrapperCol={{ style: { marginLeft: '10px' } }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ width: "48%" }}>
                  <Form.Item
                    label="考试名称"
                    name="examName"
                    rules={[{ required: true, message: "请输入考试名称" }]}
                  >
                    <Input
                      placeholder="请输入考试名称"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </div>
                <div style={{ width: "48%" }}>
                  <Form.Item
                    label="考试科目"
                    name="examSubject"
                    rules={[{ required: true, message: "请选择考试科目" }]}
                  >
                    <Select
                      style={{ width: "100%" }}
                      placeholder="请选择考试科目"
                    >
                      <Select.Option value="chinese">语文</Select.Option>
                      {/* <Select.Option value="math">数学</Select.Option>
                  <Select.Option value="english">英语</Select.Option> */}
                    </Select>
                  </Form.Item>
                </div>
              </div>
              <Form.Item
                label="答题卷模版"
                name="examTemplate"
                rules={[{ required: true, message: "请选择答题卷模版" }]}
              >
                <Select
                  style={{ width: "100%" }}
                  placeholder="请选择答题卷模版"
                >
                  <Select.Option value="template1">标准模版</Select.Option>
                  <Select.Option value="template2">A4横向</Select.Option>
                  <Select.Option value="template3">A4纵向</Select.Option>
                </Select>
              </Form.Item>
            </Form>
          </Card>

          {/* 创建新考试按钮 */}
          <div
            style={{
              marginTop: "24px",
              display: "flex",
              justifyContent: "end",
            }}
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
        </>
      ) : (
        // 选择已有考试内容
        <Card style={{ border: "1px solid #0000001a", borderRadius: "20px" }}>
          <Title
            level={5}
            style={{
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <FileOutlined style={{ marginRight: "8px", color: "#1890ff" }} />
            已有考试列表
          </Title>

          {isLoading ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Typography.Text type="secondary">
                正在加载考试列表...
              </Typography.Text>
            </div>
          ) : (
            <>
              <Select
                placeholder="请选择已有考试"
                style={{ width: "100%", marginBottom: "24px" }}
                value={selectedExamId}
                onChange={setSelectedExamId}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={
                  existingExams.length > 0
                    ? existingExams.map((exam) => ({
                        value: exam.exam_id,
                        label: exam.title,
                      }))
                    : []
                }
              />

              {existingExams.length === 0 && !isLoading && (
                <Typography.Text
                  type="secondary"
                  style={{
                    display: "block",
                    textAlign: "center",
                    marginBottom: "24px",
                  }}
                >
                  暂无已有考试
                </Typography.Text>
              )}

              <div style={{ display: "flex", justifyContent: "end" }}>
                <Button
                  type="primary"
                  size="large"
                  onClick={handleSelectExistingExam}
                  disabled={!selectedExamId}
                  style={{ width: "200px", height: "48px", fontSize: "16px" }}
                  icon={<FileOutlined />}
                >
                  选择此考试创建
                </Button>
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
};

export default CreateExam;
