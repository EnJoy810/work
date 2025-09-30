import React, { useState } from "react";
import { Card, Button } from "antd";
import {
  UploadOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import ScoreRulesModal from "./ScoreRulesModal";

/**
 * 考试卡片组件
 * @param {Object} props
 * @param {Object} props.exam - 考试数据
 * @param {Function} props.navigate - 路由导航函数
 */
const ExamCard = ({ exam, navigate }) => {
  // 控制评分细则弹窗的显示状态
  const [scoreRulesModalVisible, setScoreRulesModalVisible] = useState(false);

  // 打开评分细则弹窗
  const showScoreRulesModal = () => {
    setScoreRulesModalVisible(true);
  };

  // 关闭评分细则弹窗
  const handleScoreRulesModalClose = () => {
    setScoreRulesModalVisible(false);
  };
  // 根据状态获取对应的图标样式
  const getStatusIcon = (status, statusText) => {
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
      case "pending":
        return (
          <span
            className="dark-status-badge"
            style={{
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            <ClockCircleOutlined style={{ ...iconStyles, color: "#1890ff" }} />
            <span style={textStyles}>{statusText}</span>
          </span>
        );
      case "completed":
        return (
          <span
            className="gray-status-badge"
            style={{
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            <FileTextOutlined style={{ ...iconStyles, color: "#52c41a" }} />
            <span style={textStyles}>{statusText}</span>
          </span>
        );
      case "upcoming":
        return (
          <span
            className="gray-status-badge"
            style={{
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            <BarChartOutlined style={{ ...iconStyles, color: "#8c8c8c" }} />
            <span style={textStyles}>{statusText}</span>
          </span>
        );
      case "processing":
        return (
          <span
            className="gray-status-badge"
            style={{
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            <UploadOutlined style={{ ...iconStyles, color: "#faad14" }} />
            <span style={textStyles}>{statusText}</span>
          </span>
        );
      default:
        return (
          <span
            className="dark-status-badge"
            style={{
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            <BarChartOutlined style={{ ...iconStyles, color: "#8c8c8c" }} />
            <span style={textStyles}>{statusText}</span>
          </span>
        );
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
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                marginRight: "12px",
              }}
            >
              {exam.name}
            </span>
            {getStatusIcon(exam.status, exam.statusText)}
          </div>
          <div
            style={{
              marginTop: "4px",
              fontSize: "15px",
              color: "#666",
            }}
          >
            学科: {exam.subject} 年级: {exam.grade} 总分:
            {exam.totalScore}分 创建时间: {exam.createTime}
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {/* 根据状态显示不同按钮 */}
          {/* 待开始、待审核、待上线状态显示上传答题卡 */}
          {(exam.status === "upcoming" ||
            exam.status === "pending" ||
            exam.status === "processing") && (
            <Button
              type="primary"
              onClick={() => {
                navigate("/upload-answer-sheet");
              }}
              icon={<UploadOutlined />}
            >
              上传答题卡
            </Button>
          )}

          {/* 已完成状态显示查看评分细则、查看评分过程和数据分析 */}
          {exam.status === "completed" && (
            <>
              <Button
                type="default"
                icon={<FileTextOutlined />}
                onClick={showScoreRulesModal}
              >
                查看评分细则
              </Button>

              <Button
                type="default"
                icon={<ClockCircleOutlined />}
                onClick={() => {
                  navigate(`/score-process?examId=${exam.id}`);
                }}
              >
                查看评分过程
              </Button>

              <Button
                type="default"
                icon={<BarChartOutlined />}
                onClick={() => {
                  navigate(`/data-analysis?examId=${exam.id}`);
                }}
              >
                数据分析
              </Button>
            </>
          )}

          {/* 处理中状态也显示数据分析 */}
          {exam.status === "processing" && (
            <Button
              type="default"
              icon={<BarChartOutlined />}
              onClick={() => {
                navigate(`/data-analysis?examId=${exam.id}`);
              }}
            >
              数据分析
            </Button>
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
