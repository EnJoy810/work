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
  Spin,
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
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import request from "../../utils/request";
import "./styles/home.css";
import ExamCard from "./components/ExamCard";

const { Title, Text } = Typography;

const Home = () => {
  const navigate = useNavigate();
  const [recentExams, setRecentExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userInfo } = useSelector((state) => state.user);

  // 获取考试列表数据
  useEffect(() => {
    const fetchExamList = async () => {
      try {
        setLoading(true);
        const response = await request.get("/grading/grading/list");
        setRecentExams(response.data || []);
      } catch (error) {
        console.error("获取考试列表失败:", error);
        // 在实际应用中可以添加错误提示
      } finally {
        setLoading(false);
      }
    };

    fetchExamList();
  }, []);

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
            欢迎回来，{userInfo?.username || '老师'}
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
        <Spin spinning={loading}>
          <List
            dataSource={recentExams}
            renderItem={(exam) => (
              <List.Item
                style={{ border: "none" }}
                className="recent-exam-item"
              >
                <ExamCard exam={exam} navigate={navigate} />
              </List.Item>
            )}
            locale={{ emptyText: loading ? "" : "暂无考试数据" }}
          />
        </Spin>
      </div>
    </div>
  );
};

export default Home;
