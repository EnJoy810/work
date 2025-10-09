import React, { useState, useEffect } from "react";
import { Table, Button, Typography, Row, Col, Card, Statistic } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import ScoreDistributionChart from './components/ScoreDistributionChart';
import "./styles/data-analysis.css";
import request from "../../utils/request";

const { Title } = Typography;

/**
 * 数据分析页面
 * 展示考试的批改结果列表，支持分页功能
 */
const DataAnalysis = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [gradingId, setGradingId] = useState("");
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);

  // 从URL参数中获取examId并加载数据
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get("grading_id");
    if (id) {
      setGradingId(id);
    }
  }, [location.search]);

  // 当gradingId变化时加载数据
  useEffect(() => {
    if (gradingId) {
      loadExamData(gradingId);
    }
  }, [gradingId]);

  // 从接口加载考试数据
  const loadExamData = async (id) => {
    setLoading(true);
    try {
      // 调用接口获取数据
      const response = await request.get("/grading/result", {
        grading_id: id,
      });
      console.log("获取数据分析列表成功:", response);
      // 处理接口返回的数据
      if (response && response.data) {
        setDataSource(response.data || []);
      }
    } catch (error) {
      console.error("获取数据分析列表失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 表格列配置
  const columns = [
    {
      title: "学生姓名",
      dataIndex: "student_name",
      key: "studentName",
      width: 100,
      align: "center",
    },
    {
      title: "总分",
      dataIndex: "max_total_score",
      key: "maxTotalScore",
      width: 80,
      align: "center",
      render: (text) => <span style={{ color: "#1890ff" }}>{text}</span>,
    },
    {
      title: "学生得分",
      dataIndex: "total_score",
      key: "totalScore",
      width: 80,
      align: "center",
      render: (text) => <span style={{ color: "#1890ff" }}>{text}</span>,
    },
    {
      title: "客观题得分",
      dataIndex: "objective_score",
      key: "objectiveScore",
      width: 100,
      align: "center",
      render: (text) => <span style={{ color: "#1890ff" }}>{text}</span>,
    },
    {
      title: "填空题得分",
      dataIndex: "fillin_score",
      key: "fillinScore",
      width: 100,
      align: "center",
      render: (text) => <span style={{ color: "#1890ff" }}>{text}</span>,
    },
    {
      title: "作文得分",
      dataIndex: "essay_score",
      key: "essayScore",
      width: 100,
      align: "center",
      render: (text) => <span style={{ color: "#1890ff" }}>{text}</span>,
    },
    // {
    //   title: "批改时间",
    //   dataIndex: "correctionTime",
    //   key: "correctionTime",
    //   width: 160,
    // },
  ];

  // 计算统计数据
  const calculateStatistics = () => {
    if (!dataSource || dataSource.length === 0) {
      return {
        avgScore: 0,
        highestScore: 0,
        lowestScore: 0,
        medianScore: 0,
        excellentRate: 0,
        passRate: 0,
        lowScoreRate: 0,
      };
    }

    // 提取所有学生得分并转换为数字
    const scores = dataSource.map((item) => parseFloat(item.total_score) || 0);

    // 计算学生得分总和
    const totalScoreSum = scores.reduce((sum, score) => sum + score, 0);

    // 计算平均分
    const avgScore = totalScoreSum / scores.length;

    // 找出最高分
    const highestScore = Math.max(...scores);

    // 找出最低分
    const lowestScore = Math.min(...scores);

    // 计算中位数
    const sortedScores = [...scores].sort((a, b) => a - b);
    let medianScore = 0;
    if (sortedScores.length % 2 === 0) {
      // 偶数个数据，取中间两个数的平均值
      const midIndex = sortedScores.length / 2;
      medianScore = (sortedScores[midIndex - 1] + sortedScores[midIndex]) / 2;
    } else {
      // 奇数个数据，取中间值
      const midIndex = Math.floor(sortedScores.length / 2);
      medianScore = sortedScores[midIndex];
    }

    // 获取总分值（假设所有学生的总分相同）
    const maxScore = parseFloat(dataSource[0]?.max_total_score) || 100;

    // 计算优秀率（得分 >= 总分的80%）
    const excellentCount = scores.filter(
      (score) => score >= maxScore * 0.8
    ).length;
    const excellentRate = (excellentCount / scores.length) * 100;

    // 计算及格率（得分 >= 总分的60%）
    const passCount = scores.filter((score) => score >= maxScore * 0.6).length;
    const passRate = (passCount / scores.length) * 100;

    // 计算低分率（得分 < 总分的40%）
    const lowScoreCount = scores.filter(
      (score) => score < maxScore * 0.4
    ).length;
    const lowScoreRate = (lowScoreCount / scores.length) * 100;

    return {
      avgScore,
      highestScore,
      lowestScore,
      medianScore,
      excellentRate,
      passRate,
      lowScoreRate,
    };
  };

  const statistics = calculateStatistics();

  return (
    <div className="data-analysis-container">
      <div className="data-analysis-header">
        <Title level={4} style={{ margin: 0 }}>
          数据分析
        </Title>
        <Button onClick={() => navigate(-1)}>返回首页</Button>
      </div>

      {/* 统计卡片 - 第一行 */}
      <Row gutter={16} className="statistics-row" style={{ marginBottom: 16 }}>
        <Col xs={12} sm={12} md={6}>
          <Card>
            <Statistic
              title="平均分"
              value={statistics.avgScore.toFixed(2)}
              suffix="分"
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card>
            <Statistic
              title="最高分"
              value={statistics.highestScore}
              suffix="分"
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card>
            <Statistic
              title="最低分"
              value={statistics.lowestScore}
              suffix="分"
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card>
            <Statistic
              title="中位数"
              value={statistics.medianScore.toFixed(2)}
              suffix="分"
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      {/* 统计卡片 - 第二行（比率统计） */}
      <Row gutter={16} className="statistics-row" style={{ marginBottom: 16 }}>
        <Col xs={12} sm={12} md={8}>
          <Card>
            <Statistic
              title="优秀率（≥80%）"
              value={statistics.excellentRate.toFixed(2)}
              suffix="%"
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={8}>
          <Card>
            <Statistic
              title="及格率（≥60%）"
              value={statistics.passRate.toFixed(2)}
              suffix="%"
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={8}>
          <Card>
            <Statistic
              title="低分率（<40%）"
              value={statistics.lowScoreRate.toFixed(2)}
              suffix="%"
              valueStyle={{ color: "#f5222d" }}
            />
          </Card>
        </Col>
      </Row>

      {/* 分数段分布图 */}
      <ScoreDistributionChart 
        dataSource={dataSource} 
        statistics={statistics} 
      />

      {/* 表格 */}
      <Table
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        pagination={false}
        scroll={{ x: 1200 }}
        rowKey="seat_number"
        className="data-analysis-table"
      />

      {/* 分页 */}
      {/* <div className="pagination-container">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={total}
          onChange={handlePageChange}
          showSizeChanger
          showTotal={(total) => `共 ${total} 条记录`}
          pageSizeOptions={["10", "20", "50", "100"]}
        />
      </div> */}
    </div>
  );
};

export default DataAnalysis;
