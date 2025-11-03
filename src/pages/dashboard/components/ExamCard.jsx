import React, { useState, useEffect } from "react";
import { Card, Button, Modal, message } from "antd";
import {
  UploadOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import ScoreRulesModal from "./ScoreRulesModal";
import { formatDate } from "../../../utils/tools";
import { deleteGrading } from "../../../api/grading";
import "../styles/ExamCard.css";

/**
 * 考试卡片组件
 * @param {Object} props
 * @param {Object} props.exam - 考试数据
 * @param {Function} props.navigate - 路由导航函数
 * @param {Function} props.onDelete - 删除后的回调函数
 */
const ExamCard = ({ exam, navigate, onDelete }) => {
  // 控制评分细则弹窗的显示状态
  const [scoreRulesModalVisible, setScoreRulesModalVisible] = useState(false);
  // 控制评分过程显示的状态
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // 评分过程步骤
  const scoreProcessSteps = [
    "正在解析试卷结构...",
    "识别学生信息和答题卡...",
    "正在进行客观题自动评分...",
    "正在进行主观题智能分析...",
    "生成初步评分结果...",
    "验证评分准确性...",
    // "优化最终评分结果...",
  ];

  // 打开评分细则弹窗
  const showScoreRulesModal = () => {
    setScoreRulesModalVisible(true);
  };

  // 关闭评分细则弹窗
  const handleScoreRulesModalClose = () => {
    setScoreRulesModalVisible(false);
  };

  // 评分过程自动切换效果
  useEffect(() => {
    if (exam.status === "PROCESSING") {
      const timer = setInterval(() => {
        setCurrentStepIndex((prevIndex) =>
          prevIndex === scoreProcessSteps.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000); // 每5秒切换一次

      return () => clearInterval(timer);
    }
  }, [exam.status, scoreProcessSteps.length]);

  // 时间格式化函数：从utils/tools.js导入的公共方法

  // 删除考试
  const handleDeleteExam = () => {
    if (!exam.grading_id) {
      message.error("缺少考试ID");
      return;
    }

    Modal.confirm({
      title: "确认删除",
      content: `确定要删除考试"${exam.paper_title}"吗？删除后将无法恢复，所有批改数据都会被清除。`,
      okText: "确定删除",
      okType: "danger",
      cancelText: "取消",
      onOk: async () => {
        try {
          message.loading({ content: "正在删除考试...", key: "deleteExam" });
          
          await deleteGrading({ grading_id: exam.grading_id });
          
          message.success({ content: "考试已删除", key: "deleteExam", duration: 2 });
          
          // 调用父组件的刷新函数
          if (onDelete) {
            onDelete();
          }
        } catch (error) {
          console.error("删除考试失败:", error);
          message.error({ content: "删除考试失败，请稍后重试", key: "deleteExam" });
        }
      },
    });
  };

  // 根据状态获取对应的图标样式
  const getStatusIcon = (status) => {
    const iconStyles = {
      marginRight: "6px",
      fontSize: "13px",
      verticalAlign: "middle",
    };

    const textStyles = {
      fontSize: "13px",
      verticalAlign: "middle",
    };

    switch (status) {
      case "PENDING":
        return (
          <span
            className="dark-status-badge"
            style={{
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            <ClockCircleOutlined style={{ ...iconStyles, color: "#1890ff" }} />
            <span style={textStyles}>评分细则生成中</span>
          </span>
        );
      case "READY":
        return (
          <span
            className="gray-status-badge"
            style={{
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            <FileTextOutlined style={{ ...iconStyles, color: "#52c41a" }} />
            <span style={textStyles}>已生成评分细则</span>
          </span>
        );
      case "PROCESSING":
        return (
          <>
            <span
              className="gray-status-badge"
              style={{
                display: "inline-flex",
                alignItems: "center",
                marginRight: 30,
              }}
            >
              <BarChartOutlined style={{ ...iconStyles, color: "#8c8c8c" }} />
              <span style={textStyles}>ai评分修改中</span>
            </span>
            <div
              style={{
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "flex-end",
                alignSelf: "center",
              }}
            >
              {/* 评分过程动态展示 - 使用外部样式 */}
              <div className="exam-card-transition-container">
                <div
                  key={currentStepIndex}
                  className="exam-card-transition-item"
                >
                  {scoreProcessSteps[currentStepIndex]}
                </div>
              </div>
            </div>
          </>
        );
      case "COMPLETED":
        return (
          <span
            className="gray-status-badge"
            style={{
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            <UploadOutlined style={{ ...iconStyles, color: "#faad14" }} />
            <span style={textStyles}>已完成</span>
          </span>
        );
      case "FAILED":
        return (
          <span
            className="gray-status-badge"
            style={{
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            <ExclamationCircleOutlined
              style={{ ...iconStyles, color: "#ff4d4f" }}
            />
            <span style={textStyles}>{exam.errorMessage || "处理失败"}</span>
          </span>
        );

      default:
        return null;
    }
  };

  // 渲染考试卡片内容
  const cardContent = (
    <Card
      style={{ width: "100%", borderColor: "rgb(206, 204, 204)" }}
      className="card-hover"
      hoverable
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                marginRight: "12px",
              }}
            >
              {exam.paper_title}
            </span>
            {getStatusIcon(exam.status)}
          </div>
          <div
            style={{
              marginTop: "4px",
              fontSize: "15px",
              color: "#666",
            }}
          >
            <span>
              创建时间: {formatDate(exam.created_time, "YYYY-MM-DD")}
            </span>
            {/* 学科: {exam.subject} 年级: {exam.grade} 总分:
            {exam.totalScore}分 创建时间: {exam.createTime} */}
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {/* 删除按钮 - 所有状态都显示在最左边 */}
          <Button
            type="default"
            danger
            icon={<DeleteOutlined />}
            onClick={handleDeleteExam}
          >
            删除该考试
          </Button>

          {/* 已完成状态显示查看评分细则、查看评分过程和数据分析 */}
          {/* 完成显示数据分析 */}
          {(exam.status === "READY" ||
            exam.status === "PROCESSING" ||
            exam.status === "COMPLETED") && (
            <>
              <Button
                type="default"
                icon={<FileTextOutlined />}
                onClick={showScoreRulesModal}
              >
                查看评分细则
              </Button>
            </>
          )}

          {exam.status === "READY" && (
            <>
              <Button
                type="primary"
                onClick={() => {
                  navigate(
                    `/upload-answer-sheet?grading_id=${exam.grading_id}`
                  );
                }}
                icon={<UploadOutlined />}
              >
                上传答题卡
              </Button>
            </>
          )}

          {/* {exam.status === "COMPLETED" && (
            <Button
              type="default"
              icon={<ClockCircleOutlined />}
              onClick={() => {
                navigate(`/score-process?examId=${exam.id}`);
              }}
            >
              查看评分过程
            </Button>
          )} */}

          {/* 完成显示数据分析 */}
          {exam.status === "COMPLETED" && (
            <>
              <Button
                type="default"
                icon={<BarChartOutlined />}
                onClick={() => {
                  navigate(`/data-analysis?grading_id=${exam.grading_id}`);
                }}
              >
                数据分析
              </Button>

              <Button
                type="default"
                icon={<FileTextOutlined />}
                onClick={() => {
                  navigate(`/essay-grading?grading_id=${exam.grading_id}`);
                }}
              >
                查看作文批改
              </Button>

              <Button
                type="default"
                icon={<BarChartOutlined />}
                onClick={() => {
                  navigate(
                    `/question-analysis?grading_id=${exam.grading_id}&exam_id=${exam.exam_id}`
                  );
                }}
              >
                查看题目分析
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <>
      {cardContent}

      {scoreRulesModalVisible && (
        <ScoreRulesModal
          visible={scoreRulesModalVisible}
          onCancel={handleScoreRulesModalClose}
          exam={exam}
        />
      )}
    </>
  );
};

export default ExamCard;
