import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Typography,
  Row,
  Col,
  Card,
  Statistic,
} from "antd";
import { useLocation, useNavigate } from "react-router-dom";
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
        grading_id: id
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
      align: 'center',
    },
     {
      title: "总分",
      dataIndex: "max_total_score",
      key: "maxTotalScore",
      width: 80,
      align: 'center',
      render: (text) => <span style={{ color: '#1890ff' }}>{text}</span>,
    },
    {
      title: "学生得分",
      dataIndex: "total_score",
      key: "totalScore",
      width: 80,
      align: 'center',
      render: (text) => <span style={{ color: '#1890ff' }}>{text}</span>,
    },
    {
      title: "客观题得分",
      dataIndex: "objective_score",
      key: "objectiveScore",
      width: 100,
      align: 'center',
      render: (text) => <span style={{ color: '#1890ff' }}>{text}</span>,
    },
    {
      title: "填空题得分",
      dataIndex: "fillin_score",
      key: "fillinScore",
      width: 100,
      align: 'center',
      render: (text) => <span style={{ color: '#1890ff' }}>{text}</span>,
    },
    {
      title: "作文得分",
      dataIndex: "essay_score",
      key: "essayScore",
      width: 100,
      align: 'center',
      render: (text) => <span style={{ color: '#1890ff' }}>{text}</span>,
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
      return { avgScore: 0, highestScore: 0 };
    }
    
    // 计算学生得分总和
    const totalScoreSum = dataSource.reduce((sum, item) => {
      const score = parseFloat(item.total_score) || 0;
      return sum + score;
    }, 0);
    
    // 计算平均分
    const avgScore = totalScoreSum / dataSource.length;
    
    // 找出最高分
    const highestScore = dataSource.reduce((max, item) => {
      const score = parseFloat(item.total_score) || 0;
      return Math.max(max, score);
    }, 0);
    
    return { avgScore, highestScore };
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
      

      {/* 统计卡片 */}
      <Row gutter={16} className="statistics-row">
        <Col span={12}>
          <Card>
            <Statistic
              title="平均分"
              value={statistics.avgScore.toFixed(2)}
              suffix="分"
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <Statistic
              title="最高分"
              value={statistics.highestScore}
              suffix="分"
              valueStyle={{ color: "#cf1322" }}
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
