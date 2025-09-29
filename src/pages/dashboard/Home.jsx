import React from "react";
import {
  Card,
  Button,
  Row,
  Col,
  Statistic,
  Typography,
  Avatar,
  Badge,
  Progress,
  List,
} from "antd";
import {
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  UserOutlined,
  ArrowUpOutlined,
  PlusOutlined,
  UploadOutlined,
  RobotOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';
import "./home.css";

const { Title, Text } = Typography;

const Home = () => {
  const navigate = useNavigate();
  // 模拟数据 - 近期考试
  const recentExams = [
    {
      id: 1,
      name: "高二数学上学期期中考试",
      subject: "数学",
      grade: "高二",
      totalScore: 150,
      createTime: "2025-09-08",
      progress: { current: 45, total: 60 },
      status: "pending",
      statusText: "待审核",
    },
    {
      id: 2,
      name: "高一物理第三章测试",
      subject: "物理",
      grade: "高一",
      totalScore: 100,
      createTime: "2025-09-06",
      progress: { current: 100, total: 100 },
      status: "completed",
      statusText: "已完成",
    },
    {
      id: 3,
      name: "高三语文模拟考试",
      subject: "语文",
      grade: "高三",
      totalScore: 150,
      createTime: "2025-09-05",
      progress: { current: 0, total: 80 },
      status: "pending",
      statusText: "待审核",
    },
    {
      id: 4,
      name: "高三英语模拟考试",
      subject: "英语",
      grade: "高三",
      totalScore: 150,
      createTime: "2025-09-10",
      progress: { current: 0, total: 100 },
      status: "upcoming",
      statusText: "待开始",
    },
    {
      id: 5,
      name: "高一语文作文批改",
      subject: "语文",
      grade: "高一",
      totalScore: 100,
      createTime: "2025-09-15",
      progress: { current: 28, total: 35 },
      status: "processing",
      statusText: "待上线",
    },
  ];

  // 获取今天的日期并格式化为中文格式
  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
    const weekday = weekdays[now.getDay()];
    return `今天是${year}年${month}月${day}日星期${weekday}`;
  };

  // 根据状态获取对应的徽章样式
  const getStatusBadge = (status, statusText) => {
    switch (status) {
      case "pending":
        return <Badge status="processing" text={statusText} />;
      case "completed":
        return <Badge status="success" text={statusText} />;
      case "upcoming":
        return <Badge status="default" text={statusText} />;
      case "processing":
        return <Badge status="warning" text={statusText} />;
      default:
        return <Badge status="default" text={statusText} />;
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* 顶部欢迎信息 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0 }}>
            欢迎回来，李老师
          </Title>
          <Text type="secondary">{getCurrentDate()}</Text>
        </div>
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => navigate('/create-exam')}>
          创建新考试
        </Button>
      </div>

      {/* 统计卡片 */}
      {/* <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总考试数"
              value={4}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="待审核"
              value={2}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="已完成"
              value={1}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总学生数"
              value={185}
              prefix={<UserOutlined />}
              suffix={<ArrowUpOutlined style={{ color: '#fa8c16' }} />}
            />
          </Card>
        </Col>
      </Row> */}

      {/* 近期考试列表 */}
      <div className="recent-exams-list">
        <Title level={4}>近期考试</Title>
        <List
          dataSource={recentExams}
          renderItem={(exam) => (
            <List.Item style={{ border: "none" }}>
              <Card
                style={{ width: "100%" }}
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
                      {getStatusBadge(exam.status, exam.statusText)}
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
                    {(exam.status === "upcoming" || exam.status === "pending" || exam.status === "processing") && (
                      <Button
                        type="primary"
                        onClick={() => {
                          navigate('/upload-answer-sheet');
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
                        >
                          查看评分细则
                        </Button>
                        
                        <Button
                          type="default"
                          icon={<ClockCircleOutlined />}
                        >
                          查看评分过程
                        </Button>
                        
                        <Button
                          type="default"
                          icon={<BarChartOutlined />}
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
                      >
                        数据分析
                      </Button>
                    )}
                  </div>
                </div>
                {/* {exam.progress.current > 0 && (
                  <div style={{ marginTop: "8px" }}>
                    <Progress
                      percent={
                        (exam.progress.current / exam.progress.total) * 100
                      }
                      showInfo={false}
                    />
                    <div
                      style={{
                        textAlign: "right",
                        fontSize: "12px",
                        color: "#666",
                        marginTop: "4px",
                      }}
                    >
                      进度: {exam.progress.current}/{exam.progress.total}
                    </div>
                  </div>
                )} */}
              </Card>
            </List.Item>
          )}
        />
      </div>
    </div>
  );
};

export default Home;
