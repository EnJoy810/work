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
import { getGradingList } from "../../api/exam";
import "./styles/home.css";
import ExamCard from "./components/ExamCard";

const { Title, Text } = Typography;

const Home = () => {
  const navigate = useNavigate();
  const [recentExams, setRecentExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userInfo } = useSelector((state) => state.user);
  const { selectedClassId, classList } = useSelector((state) => state.class);
  const [shouldPoll, setShouldPoll] = useState(false);

  // 获取考试列表数据
  const fetchExamList = async () => {
    try {
      setLoading(true);
      const response = await getGradingList();
      const exams = response.data || [];
      setRecentExams(exams);
      // 检查是否有PENDING或PROCESSING状态的考试
      const hasPendingOrProcessingExams = exams.some(exam => exam.status === "PENDING" || exam.status === "PROCESSING");
      setShouldPoll(hasPendingOrProcessingExams);
    } catch (error) {
      console.error("获取考试列表失败:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 确保有班级ID后再发送请求，避免使用旧的班级ID
    // 如果用户有班级列表但没有selectedClassId，等待Redux状态更新
    if (classList && classList.length > 0 && !selectedClassId) {
      console.log("等待班级ID初始化...");
      return;
    }
    
    fetchExamList();
  }, [selectedClassId]);

  // 当shouldPoll为true时，每2分钟获取一次数据
  useEffect(() => {
    let intervalId = null;
    
    if (shouldPoll) {
      intervalId = setInterval(() => {
        fetchExamList();
      }, 120000); // 120000毫秒 = 2分钟
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [shouldPoll]);

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

  // 获取显示名称：优先真名，其次姓，都没有则显示"老师"
  const getDisplayName = () => {
    if (!userInfo) return '老师';
    
    // 优先使用真名
    const realName = userInfo.real_name || userInfo.realName || userInfo.name;
    if (realName && realName.trim()) {
      return `${realName.trim()}老师`;
    }
    
    // 如果没有真名，尝试使用姓
    const surname = userInfo.surname || userInfo.last_name || userInfo.lastName;
    if (surname && surname.trim()) {
      return `${surname.trim()}老师`;
    }
    
    // 如果都没有，显示"老师"
    return '老师';
  };

  return (
    <div className="home-container">
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
            欢迎回来，{getDisplayName()}
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
                <ExamCard exam={exam} navigate={navigate} onDelete={fetchExamList} />
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
