import React, { useState, useEffect } from "react";
import {
  Table,
  Pagination,
  Tag,
  Space,
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Typography,
} from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { EyeOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import "./styles/data-analysis.css";

const { Title } = Typography;

/**
 * 数据分析页面
 * 展示考试的批改结果列表，支持分页功能
 */
const DataAnalysis = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [examId, setExamId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);

  // 从URL参数中获取examId
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get("examId");
    if (id) {
      setExamId(id);
      // 模拟加载数据
      loadExamData(id, currentPage, pageSize);
    }
  }, [location.search, currentPage, pageSize]);

  // 模拟加载考试数据
  const loadExamData = (id, page, size) => {
    setLoading(true);
    // 模拟API请求延迟
    setTimeout(() => {
      // 模拟数据
      const mockData = generateMockData(id, page, size);
      setDataSource(mockData.data);
      setTotal(mockData.total);
      setLoading(false);
    }, 500);
  };

  // 模拟生成数据
  const generateMockData = (examId, page, size) => {
    const total = 50; // 模拟总数据量
    const startIndex = (page - 1) * size;
    const endIndex = Math.min(startIndex + size, total);

    const data = [];
    for (let i = startIndex; i < endIndex; i++) {
      const baseScore = 60 + Math.floor(Math.random() * 40);
      const objectiveScore = Math.floor(baseScore * 0.5);
      const blankScore = Math.floor(baseScore * 0.2);
      const essayScore = Math.floor(baseScore * 0.3);

      data.push({
        key: i + 1,
        studentName: `学生${i + 1}`,
        className: `班级${(i % 5) + 1}`,
        examRoom: `考场${(i % 10) + 1}`,
        seatNumber: i + 1,
        totalScore: baseScore,
        fullScore: 100,
        objectiveTotalScore: 50,
        blankTotalScore: 20,
        essayTotalScore: 30,
        objectiveScore: objectiveScore,
        blankScore: blankScore,
        essayScore: essayScore,
        objectiveDetails: `客观题得分${objectiveScore}/50`,
        blankDetails: `填空题得分${blankScore}/20`,
        subjectiveDetails: `主观题得分${blankScore}/20`,
        essayDetails: `作文得分${essayScore}/30`,
        correctionTime: new Date(
          Date.now() - Math.floor(Math.random() * 86400000 * 3)
        ).toLocaleString(),
      });
    }

    return { data, total };
  };

  // 处理分页变化
  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
    loadExamData(examId, page, pageSize);
  };

  // 查看详情
  const handleViewDetails = (record) => {
    // 可以实现查看详情的逻辑，这里暂不实现
    console.log("查看详情:", record);
  };

  // 表格列配置
  const columns = [
    {
      title: "学生姓名",
      dataIndex: "studentName",
      key: "studentName",
      width: 100,
    },
    {
      title: "班级",
      dataIndex: "className",
      key: "className",
      width: 80,
    },
    {
      title: "考场",
      dataIndex: "examRoom",
      key: "examRoom",
      width: 80,
    },
    {
      title: "座位号",
      dataIndex: "seatNumber",
      key: "seatNumber",
      width: 80,
    },
    {
      title: "总分",
      dataIndex: "totalScore",
      key: "totalScore",
      width: 80,
      render: (score, record) => (
        <div>
          <div>{score}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            / {record.fullScore}
          </div>
        </div>
      ),
    },
    {
      title: "客观题",
      dataIndex: "objectiveScore",
      key: "objectiveScore",
      width: 100,
      render: (score, record) => (
        <div>
          <div>{score}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            / {record.objectiveTotalScore}
          </div>
        </div>
      ),
    },
    {
      title: "填空题",
      dataIndex: "blankScore",
      key: "blankScore",
      width: 100,
      render: (score, record) => (
        <div>
          <div>{score}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            / {record.blankTotalScore}
          </div>
        </div>
      ),
    },
    {
      title: "作文",
      dataIndex: "essayScore",
      key: "essayScore",
      width: 100,
      render: (score, record) => (
        <div>
          <div>{score}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            / {record.essayTotalScore}
          </div>
        </div>
      ),
    },
    {
      title: "成绩详情",
      key: "details",
      width: 120,
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record)}
        >
          查看
        </Button>
      ),
    },
    {
      title: "批改时间",
      dataIndex: "correctionTime",
      key: "correctionTime",
      width: 160,
    },
  ];

  // 统计数据
  const getStatistics = () => {
    if (dataSource.length === 0)
      return { avgScore: 0, passRate: 0, highestScore: 0, lowestScore: 0 };

    const scores = dataSource.map((item) => item.totalScore);
    const avgScore =
      scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const passRate =
      (scores.filter((score) => score >= 60).length / scores.length) * 100;
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);

    return { avgScore, passRate, highestScore, lowestScore };
  };

  const statistics = getStatistics();

  return (
    <div className="data-analysis-container">
      <div className="data-analysis-header">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{ marginRight: "16px" }}
        >
          返回
        </Button>
        <Title level={4} style={{ margin: 0 }}>
          数据分析
        </Title>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} className="statistics-row">
        <Col span={6}>
          <Card>
            <Statistic
              title="平均分"
              value={statistics.avgScore.toFixed(2)}
              suffix="分"
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="最高分"
              value={statistics.highestScore}
              suffix="分"
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="最低分"
              value={statistics.lowestScore}
              suffix="分"
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="通过率"
              value={statistics.passRate.toFixed(2)}
              suffix="%"
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      {/* 表格 */}
      <Table
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        pagination={false}
        scroll={{ x: 1200 }}
        rowKey="key"
        className="data-analysis-table"
      />

      {/* 分页 */}
      <div className="pagination-container">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={total}
          onChange={handlePageChange}
          showSizeChanger
          showTotal={(total) => `共 ${total} 条记录`}
          pageSizeOptions={["10", "20", "50", "100"]}
        />
      </div>
    </div>
  );
};

export default DataAnalysis;
