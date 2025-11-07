import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { store } from "../../store";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Button,
  Space,
  Tabs,
  Empty,
  Tooltip,
  message,
  Skeleton,
  Alert,
  Dropdown,
} from "antd";
import {
  DownloadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  UserOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title as ChartTitle,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Radar } from "react-chartjs-2";
import "./styles/data-analysis.css";
import request from "../../utils/request";
import { 
  getStudentsList, 
  getComparisonData,
  exportGradingInfo,
  exportStatisticAnalysis,
  exportEssayResults,
  exportSimpleScores
} from "../../api/grading";

// 注册 Chart.js 组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  ChartTitle,
  ChartTooltip,
  Legend,
  Filler
);

const DataAnalysis = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 数据状态
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [realData, setRealData] = useState(null);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  
  // 学生列表状态（分页）
  const [studentsData, setStudentsData] = useState(null);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [levelFilter, setLevelFilter] = useState(null);
  const [scoreRange, setScoreRange] = useState({ min: null, max: null });
  
  // 历史对比数据状态（预留用于未来功能）
  const [_comparisonData, setComparisonData] = useState(null);
  
  // 交互状态
  const [activeTab, setActiveTab] = useState("overview");
  const [radarChartKey, setRadarChartKey] = useState(0);

  // 处理Tab切换，清除焦点以避免可访问性警告
  const handleTabChange = useCallback((key) => {
    // 让当前焦点元素失去焦点
    if (document.activeElement) {
      document.activeElement.blur();
    }
    setActiveTab(key);
  }, []);

  // 从URL获取grading_id，加载所有数据
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get("grading_id");
    if (id) {
      loadRealData(id);
      loadComparisonData(id);
    }
  }, [location.search]);

  // 当切换到学生明细tab时，加载学生列表数据
  useEffect(() => {
    if (activeTab === 'detail') {
      const searchParams = new URLSearchParams(location.search);
      const id = searchParams.get("grading_id");
      if (id) {
        loadStudentsData(id, currentPage, pageSize, levelFilter, scoreRange.min, scoreRange.max);
      }
    }
  }, [activeTab, currentPage, pageSize, levelFilter, scoreRange, location.search]);

  // 当切换到题型分析tab时，更新雷达图key以触发重新渲染和动画
  useEffect(() => {
    if (activeTab === 'subject') {
      setRadarChartKey(prev => prev + 1);
    }
  }, [activeTab]);

  // 加载真实数据
  const loadRealData = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await request.get("/grading/analysis", {
        grading_id: id,
      });
      if (response && response.data) {
        setRealData(response.data);
        setLastUpdateTime(new Date());
        message.success("数据加载成功");
      }
    } catch (err) {
      console.error("获取数据分析失败:", err);
      setError("数据加载失败，请稍后重试");
      message.error("数据加载失败");
    } finally {
      setLoading(false);
    }
  };

  // 加载学生列表数据（分页）
  const loadStudentsData = async (id, page = 1, size = 10, filter = null, scoreMin = null, scoreMax = null) => {
    setStudentsLoading(true);
    try {
      const params = {
        grading_id: id,
        page: page,
        page_size: size,
        sort_by: "total_score",
        sort_order: "desc",
      };
      
      // 可选参数：只在有值时才添加
      if (filter) {
        params.level_filter = filter;
      }
      if (scoreMin !== null && scoreMin !== undefined) {
        params.score_min = scoreMin;
      }
      if (scoreMax !== null && scoreMax !== undefined) {
        params.score_max = scoreMax;
      }
      
      const response = await getStudentsList(params);
      if (response && response.data) {
        setStudentsData(response.data);
      }
    } catch (err) {
      console.error("获取学生列表失败:", err);
      message.error("学生列表加载失败");
    } finally {
      setStudentsLoading(false);
    }
  };

  // 加载历史对比数据
  const loadComparisonData = async (id) => {
    try {
      const response = await getComparisonData({
        grading_id: id,
        compare_type: "previous",
        limit: 5,
      });
      if (response && response.data) {
        setComparisonData(response.data);
      }
    } catch (err) {
      console.error("获取历史对比数据失败:", err);
      // 不影响主要功能，静默失败
    }
  };

  // 手动刷新数据
  const handleRefresh = () => {
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get("grading_id");
    if (id) {
      loadRealData(id);
      loadStudentsData(id, currentPage, pageSize, levelFilter, scoreRange.min, scoreRange.max);
      loadComparisonData(id);
    }
  };

  // 处理真实数据
  const processedData = useMemo(() => {
    if (!realData) return null;

    const studentResults = realData.student_results || [];
    
    return {
      overview: {
        avgScore: realData.average_score || 0,
        highestScore: Math.max(...(studentResults.map(s => s.total_score) || [0])),
        lowestScore: Math.min(...(studentResults.map(s => s.total_score) || [0])),
        medianScore: realData.middle_score || 0,
        totalStudents: studentResults.length,
        excellentRate: (realData.great_rate || 0) * 100,
        passRate: (realData.pass_rate || 0) * 100,
        failRate: (realData.fail_rate || 0) * 100,
      },
      scoreDistribution: [
        { range: "0-90", count: Math.round((realData.rate1 || 0) * studentResults.length) },
        { range: "90-110", count: Math.round((realData.rate2 || 0) * studentResults.length) },
        { range: "110-130", count: Math.round((realData.rate3 || 0) * studentResults.length) },
        { range: "130-140", count: Math.round((realData.rate4 || 0) * studentResults.length) },
        { range: "140-150", count: Math.round((realData.rate5 || 0) * studentResults.length) },
      ],
      subjectScores: {
        objective: (realData.objective_score_rate || 0) * 100,
        fillIn: (realData.fillin_score_rate || 0) * 100,
        essay: (realData.essay_score_rate || 0) * 100,
      },
      studentScores: studentResults
        .sort((a, b) => b.total_score - a.total_score)
        .map((student, index) => {
          const score = student.total_score;
          let level = "不及格";
          if (score >= 140) level = "特优";
          else if (score >= 130) level = "优秀";
          else if (score >= 110) level = "良好";
          else if (score >= 90) level = "及格";
          
          return {
            key: String(index + 1),
            rank: index + 1,
            name: student.student_name,
            totalScore: student.total_score,
            objective: student.objective_score || 0,
            fillIn: student.fillin_score || 0,
            essay: student.essay_score || 0,
            level: level,
          };
        }),
    };
  }, [realData]);

  // 统计各等级人数
  const levelStats = useMemo(() => {
    if (!processedData) return {};
    
    const stats = {
      特优: 0,
      优秀: 0,
      良好: 0,
      及格: 0,
      不及格: 0,
    };
    
    processedData.studentScores.forEach(s => {
      stats[s.level]++;
    });
    
    return stats;
  }, [processedData]);

  // 图表数据
  const scoreDistributionData = useMemo(() => {
    if (!processedData) return null;
    
    return {
      labels: processedData.scoreDistribution.map(item => item.range),
      datasets: [{
        label: "学生数量",
        data: processedData.scoreDistribution.map(item => item.count),
        backgroundColor: "rgba(24, 144, 255, 0.8)",
        borderColor: "rgba(24, 144, 255, 1)",
        borderWidth: 2,
        borderRadius: 8,
      }],
    };
  }, [processedData]);

  const radarData = useMemo(() => {
    if (!processedData) return null;
    
    return {
      labels: ["客观题", "填空题", "作文题"],
      datasets: [{
        label: "得分率 (%)",
        data: [
          processedData.subjectScores.objective,
          processedData.subjectScores.fillIn,
          processedData.subjectScores.essay,
        ],
        backgroundColor: "rgba(24, 144, 255, 0.6)",
        borderColor: "rgba(24, 144, 255, 1)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(24, 144, 255, 1)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgba(24, 144, 255, 1)",
        pointHoverRadius: 6,
      }],
    };
  }, [processedData]);

  // 表格列配置（匹配后端下划线命名）
  const columns = useMemo(() => [
    {
      title: "排名",
      dataIndex: "rank",
      key: "rank",
      width: 80,
      align: "center",
      fixed: "left",
    },
    {
      title: "学生姓名",
      dataIndex: "student_name",
      key: "student_name",
      width: 120,
      fixed: "left",
    },
    {
      title: "总分",
      dataIndex: "total_score",
      key: "total_score",
      width: 100,
      align: "center",
      sorter: (a, b) => a.total_score - b.total_score,
      render: (score) => (
        <span style={{ fontSize: 16, fontWeight: 600, color: "#1890ff" }}>
          {score}
        </span>
      ),
    },
    {
      title: "客观题",
      dataIndex: "objective_score",
      key: "objective_score",
      width: 100,
      align: "center",
      sorter: (a, b) => a.objective_score - b.objective_score,
    },
    {
      title: "填空题",
      dataIndex: "fillin_score",
      key: "fillin_score",
      width: 100,
      align: "center",
      sorter: (a, b) => a.fillin_score - b.fillin_score,
    },
    {
      title: "作文题",
      dataIndex: "essay_score",
      key: "essay_score",
      width: 100,
      align: "center",
      sorter: (a, b) => a.essay_score - b.essay_score,
    },
    {
      title: "等级",
      dataIndex: "level",
      key: "level",
      width: 100,
      align: "center",
      render: (level) => {
        const colorMap = {
          特优: "purple",
          优秀: "green",
          良好: "blue",
          及格: "gold",
          不及格: "red",
        };
        return <Tag color={colorMap[level]}>{level}</Tag>;
      },
    },
  ], []);

  // 快捷筛选不及格学生
  const handleQuickFilterFail = useCallback(() => {
    setLevelFilter("不及格");
    setScoreRange({ min: null, max: 90 });
    setCurrentPage(1);
    handleTabChange("detail");
    message.info(`正在筛选不及格学生（<90分）...`);
  }, [handleTabChange]);

  // 快捷筛选待提升学生（及格：60-90分）
  const handleQuickFilterPass = useCallback(() => {
    setLevelFilter("及格");
    setScoreRange({ min: 60, max: 90 });
    setCurrentPage(1);
    handleTabChange("detail");
    message.info(`正在筛选待提升学生（60-90分）...`);
  }, [handleTabChange]);

  // 导出Excel文件
  const handleExport = useCallback(async (exportType) => {
    const searchParams = new URLSearchParams(location.search);
    const gradingId = searchParams.get("grading_id");
    
    if (!gradingId) {
      message.error("缺少批改会话ID，无法导出");
      return;
    }

    try {
      message.loading({ content: "正在导出...", key: "export" });

      // 原有的GET导出接口 - 使用axios下载以携带token
      let downloadUrl = "";
      let fileName = "";

      switch (exportType) {
        case "grading":
          downloadUrl = exportGradingInfo(gradingId);
          fileName = "批改信息.xlsx";
          break;
        case "analysis":
          downloadUrl = exportStatisticAnalysis(gradingId);
          fileName = "统计分析结果.xlsx";
          break;
        case "essay":
          downloadUrl = exportEssayResults(gradingId);
          fileName = "作文结果.xlsx";
          break;
        case "simple":
          downloadUrl = exportSimpleScores(gradingId);
          fileName = "学生分数.xlsx";
          break;
        default:
          message.error("未知的导出类型");
          return;
      }

      // 使用axios下载文件（会自动携带token和班级ID）
      const state = store.getState();
      const token = state.user.token;
      const currentClassId = state.class.selectedClassId || localStorage.getItem('currentClassId');
      
      const headers = {
        'Authorization': `Bearer ${token}`,
      };
      
      if (currentClassId && currentClassId !== 'undefined') {
        headers['X-Current-Class'] = currentClassId;
      }
      
      const response = await axios({
        url: downloadUrl,
        method: 'GET',
        responseType: 'blob',
        headers
      });

      // 创建blob URL并触发下载
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success({ content: "导出成功", key: "export" });
    } catch (error) {
      console.error("导出失败:", error);
      message.error({ content: "导出失败，请稍后重试", key: "export" });
    }
  }, [location.search]);

  // Tabs 配置项 - 使用 useMemo 确保只在数据存在时创建
  const tabItems = useMemo(() => {
    if (!processedData) return [];
    
    return [
      {
        key: "overview",
        label: "班级表现",
        children: (
          <>
            <Row gutter={[24, 24]}>
              {/* 左侧：核心指标大卡片 */}
              <Col xs={24} lg={10}>
                <Card className="core-metrics-card">
                  <div className="metric-primary">
                    <div className="metric-label">班级平均分</div>
                    <div className="metric-value">
                      {processedData.overview.avgScore.toFixed(1)}
                      <span className="metric-unit">分</span>
                    </div>
                  </div>
                  
                  <div className="metrics-secondary">
                    <div className="metric-item">
                      <div className="metric-label">及格率</div>
                      <div className="metric-value-small success">
                        {processedData.overview.passRate.toFixed(1)}%
                      </div>
                    </div>
                    <div className="metric-item">
                      <div className="metric-label">优秀率</div>
                      <div className="metric-value-small success">
                        {processedData.overview.excellentRate.toFixed(1)}%
                      </div>
                    </div>
                    <div className="metric-item">
                      <div className="metric-label">参考人数</div>
                      <div className="metric-value-small">
                        {processedData.overview.totalStudents}人
                      </div>
                    </div>
      </div>

                {/* 快速操作 */}
                <div className="quick-actions">
                  {levelStats.不及格 > 0 && (
                    <Button 
                      danger
                      block
                      size="large"
                      onClick={handleQuickFilterFail}
                      style={{ marginBottom: 8 }}
                    >
                       {levelStats.不及格}名学生不及格，点击查看
                    </Button>
                  )}
                  {levelStats.及格 > processedData.overview.totalStudents * 0.3 && (
                    <Button 
                      type="default"
                      block
                      onClick={handleQuickFilterPass}
                    >
                       {levelStats.及格}名学生待提升（60-90分）
                    </Button>
                  )}
                </div>
          </Card>
        </Col>

              {/* 右侧：详细统计小卡片 */}
              <Col xs={24} lg={14}>
                <div className="stat-cards-grid">
                  {/* 第一行：分数统计 */}
                  <Row gutter={[16, 16]} className="stat-row-top">
                  <Col span={8}>
                    <Card className="stat-card-small">
            <Statistic
              title="最高分"
                        value={processedData.overview.highestScore}
                        precision={1}
              suffix="分"
            />
          </Card>
        </Col>
                  <Col span={8}>
                    <Card className="stat-card-small">
            <Statistic
              title="最低分"
                        value={processedData.overview.lowestScore}
                        precision={1}
              suffix="分"
                        valueStyle={processedData.overview.lowestScore < 60 ? { color: "#ff4d4f" } : {}}
            />
          </Card>
        </Col>
                  <Col span={8}>
                    <Card className="stat-card-small">
            <Statistic
              title="中位数"
                        value={processedData.overview.medianScore}
                        precision={1}
              suffix="分"
            />
          </Card>
        </Col>
      </Row>

                  {/* 第二行：等级统计 */}
                  <Row gutter={[16, 16]} className="stat-row-bottom">
                  <Col span={8}>
                    <Card className="stat-card-small">
            <Statistic
                        title="不及格"
                        value={levelStats.不及格}
                        suffix="人"
                        valueStyle={levelStats.不及格 > 0 ? { color: "#ff4d4f" } : {}}
            />
          </Card>
        </Col>
                  <Col span={8}>
                    <Card className="stat-card-small">
            <Statistic
                        title="待提升"
                        value={levelStats.及格}
                        suffix="人"
                        valueStyle={levelStats.及格 > processedData.overview.totalStudents * 0.3 ? { color: "#faad14" } : {}}
            />
          </Card>
        </Col>
                  <Col span={8}>
                    <Card className="stat-card-small">
            <Statistic
                        title="优秀"
                        value={levelStats.优秀 + levelStats.特优}
                        suffix="人"
            />
          </Card>
        </Col>
      </Row>
                </div>
              </Col>
            </Row>

            {/* 分数分布 & 排行榜 */}
            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
              <Col xs={24} lg={14}>
                <Card title="分数分布" className="chart-card">
                  <Bar
                    key={`bar-chart-${activeTab}`}
                    data={scoreDistributionData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          callbacks: {
                            label: (context) => `${context.parsed.y} 人`,
                          },
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: { stepSize: 2 },
                        },
                      },
                    }}
                    height={280}
                  />
                </Card>
              </Col>
              <Col xs={24} lg={10}>
                <Card 
                  title="成绩排行榜" 
                  className="ranking-card"
                >
                  {processedData.studentScores.slice(0, 5).map((student, index) => (
                    <div key={index} className="ranking-item">
                      <div className="ranking-left">
                        <span className="ranking-number">{student.rank}</span>
                        <span className="student-name">{student.name}</span>
                      </div>
                      <span className="ranking-score">{student.totalScore} 分</span>
                    </div>
                  ))}
                </Card>
              </Col>
            </Row>
          </>
        ),
      },
      {
        key: "subject",
        label: "薄弱环节",
        children: (
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
            <Card 
              title="题型得分雷达图" 
              className="chart-card"
            >
              <Radar
                key={`radar-chart-${radarChartKey}`}
                data={{
                  labels: radarData.labels,
                  datasets: [{
                    ...radarData.datasets[0],
                    backgroundColor: "rgba(24, 144, 255, 0.1)", // 初始透明度
                    borderColor: "rgba(24, 144, 255, 0.3)", // 初始边线颜色
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  animation: {
                    duration: 1500,
                    easing: 'easeOutBack', // 弹性缓动效果
                    animateScale: true,     // 从中心向外扩散
                    animateRotate: false,
                    onProgress: function(animation) {
                      const progress = animation.currentStep / animation.numSteps;
                      // 透明度从10%逐渐到60%
                      const opacity = 0.1 + (0.5 * progress);
                      // 边线透明度从30%逐渐到100%
                      const borderOpacity = 0.3 + (0.7 * progress);
                      
                      if (this.data.datasets[0]) {
                        this.data.datasets[0].backgroundColor = `rgba(24, 144, 255, ${opacity})`;
                        this.data.datasets[0].borderColor = `rgba(24, 144, 255, ${borderOpacity})`;
                      }
                    },
                    onComplete: function() {
                      // 确保最终状态正确
                      if (this.data.datasets[0]) {
                        this.data.datasets[0].backgroundColor = "rgba(24, 144, 255, 0.6)";
                        this.data.datasets[0].borderColor = "rgba(24, 144, 255, 1)";
                      }
                    }
                  },
                  scales: {
                    r: {
                      beginAtZero: true,
                      max: 100,
                      ticks: { 
                        stepSize: 20,
                        backdropColor: 'transparent',
                      },
                      grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                      },
                      angleLines: {
                        color: 'rgba(0, 0, 0, 0.1)',
                      },
                    },
                  },
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      enabled: true,
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    },
                  },
                }}
                height={350}
              />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="题型得分详情" className="subject-detail-card">
              <div className="subject-item">
                <div className="subject-header">
                  <span className="subject-name">客观题</span>
                  <span className="subject-rate success">
                    {processedData.subjectScores.objective.toFixed(1)}%
                  </span>
                </div>
                <div className="subject-bar">
                  <div 
                    className={`subject-bar-fill success ${activeTab === 'subject' ? 'animate' : ''}`}
                    style={{ 
                      '--target-width': `${processedData.subjectScores.objective}%`
                    }}
                  />
                </div>
              </div>

              <div className="subject-item">
                <div className="subject-header">
                  <span className="subject-name">填空题</span>
                  <span className="subject-rate warning">
                    {processedData.subjectScores.fillIn.toFixed(1)}%
                  </span>
                </div>
                <div className="subject-bar">
                  <div 
                    className={`subject-bar-fill warning ${activeTab === 'subject' ? 'animate' : ''}`}
                    style={{ 
                      '--target-width': `${processedData.subjectScores.fillIn}%`
                    }}
                  />
                </div>
              </div>

              <div className="subject-item">
                <div className="subject-header">
                  <span className="subject-name">作文题</span>
                  <span className="subject-rate">
                    {processedData.subjectScores.essay.toFixed(1)}%
                  </span>
                </div>
                <div className="subject-bar">
                  <div 
                    className={`subject-bar-fill ${activeTab === 'subject' ? 'animate' : ''}`}
                    style={{ 
                      '--target-width': `${processedData.subjectScores.essay}%`
                    }}
                  />
                </div>
              </div>

              {/* 智能诊断（基于真实数据） */}
              <div className="diagnosis-section">
                <h4>智能诊断</h4>
                {processedData.subjectScores.fillIn < 70 && (
                  <Alert
                    message="填空题得分率偏低"
                    description={`填空题平均得分率为${processedData.subjectScores.fillIn.toFixed(1)}%，建议加强基础知识点练习。`}
                    type="warning"
                    showIcon
                    style={{ marginTop: 16 }}
                  />
                )}
                {processedData.subjectScores.objective >= 75 && (
                  <Alert
                    message="客观题表现优秀"
                    description={`客观题平均得分率为${processedData.subjectScores.objective.toFixed(1)}%，学生基础扎实。`}
                    type="success"
                    showIcon
                    style={{ marginTop: 16 }}
                  />
                )}
              </div>
            </Card>
          </Col>
        </Row>
      ),
    },
      {
        key: "detail",
        label: "学生成绩",
      children: (
        <Card 
          title="学生成绩明细"
          className="table-card"
          style={{ marginTop: 0 }}
          loading={studentsLoading}
          extra={
            <Space>
              {levelFilter && (
                <Button 
                  onClick={() => {
                    setLevelFilter(null);
                    setScoreRange({ min: null, max: null });
                    setCurrentPage(1);
                  }}
                >
                  清除筛选
                </Button>
              )}
              <Dropdown
                trigger={["click"]}
                menu={{
                  items: [
                    {
                      key: "grading",
                      label: "批改信息",
                      icon: <DownloadOutlined />,
                      onClick: () => handleExport("grading"),
                    },
                    {
                      key: "essay",
                      label: "作文结果",
                      icon: <DownloadOutlined />,
                      onClick: () => handleExport("essay"),
                    },
                    {
                      key: "simple",
                      label: "学生分数",
                      icon: <DownloadOutlined />,
                      onClick: () => handleExport("simple"),
                    },
                    {
                      key: "analysis",
                      label: "统计分析结果",
                      icon: <DownloadOutlined />,
                      onClick: () => handleExport("analysis"),
                    },
                  ],
                }}
              >
                <Button icon={<DownloadOutlined />}>
                  导出为Excel
                </Button>
              </Dropdown>
            </Space>
          }
        >
          {studentsData ? (
      <Table
        columns={columns}
              dataSource={studentsData.students}
              rowKey={(record, index) => `student-${index}-${record.student_no || record.student_id || ''}`}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: studentsData.total,
                showSizeChanger: false,
                showTotal: (total) => `共 ${total} 条记录`,
                onChange: (page) => setCurrentPage(page),
              }}
              scroll={{ x: 800 }}
            />
          ) : (
            <Empty description="请先加载数据" />
          )}
        </Card>
      ),
    },
  ];
  }, [processedData, activeTab, scoreDistributionData, radarData, levelStats, handleQuickFilterFail, handleQuickFilterPass, handleExport, columns, radarChartKey, studentsData, studentsLoading, levelFilter, currentPage, pageSize]);

  // 如果加载中，显示骨架屏
  if (loading && !processedData) {
    return (
      <div className="data-analysis-container">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  // 如果加载失败，显示错误提示
  if (error && !processedData) {
    return (
      <div className="data-analysis-container">
        <Alert
          message="数据加载失败"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" type="primary" onClick={handleRefresh}>
              重新加载
            </Button>
          }
        />
      </div>
    );
  }

  // 如果无数据，显示空状态
  if (!processedData) {
    return (
      <div className="data-analysis-container">
        <Empty
          description="暂无数据"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  return (
    <div className="data-analysis-container">
      {/* 顶部操作栏 */}
      <div className="top-actions">
        <div className="page-info">
          <h2 className="page-title">数据分析</h2>
          {lastUpdateTime && (
            <span className="update-time">
              最后更新：{lastUpdateTime.toLocaleString()}
            </span>
          )}
        </div>
        <Space>
          <Button type="primary" onClick={() => navigate(-1)}>返回首页</Button>
        </Space>
      </div>

      {/* Tab切换 */}
      <Tabs 
        activeKey={activeTab} 
        onChange={handleTabChange} 
        className="main-tabs"
        items={tabItems}
      />
    </div>
  );
};

export default DataAnalysis;
