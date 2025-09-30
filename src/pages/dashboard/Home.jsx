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
import { useNavigate } from "react-router-dom";
import "./styles/home.css";
import ExamCard from "./components/ExamCard";

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
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => navigate("/create-exam")}
        >
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
            <List.Item style={{ border: "none" }}  className="recent-exam-item">
              <ExamCard
                exam={exam}
                navigate={navigate}
              />
            </List.Item>
          )}
        />
      </div>
    </div>
  );
};

export default Home;
