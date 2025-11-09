import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { store } from "../../store";
import { Button, Space, Tabs, Empty, message, Skeleton, Alert } from "antd";
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
import "./styles/data-analysis.css";
import { 
  getAnalysisData,
  getStudentsList, 
  getComparisonData,
  exportGradingInfo,
  exportStatisticAnalysis,
  exportEssayResults,
  exportSimpleScores
} from "../../api/grading";
import { useAnalysisData } from "../../hooks/useAnalysisData";
import { OverviewTab, SubjectTab, DetailTab } from "./components/DataAnalysis";

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

  // 加载真实数据（使用 useCallback 优化，修复依赖问题）
  const loadRealData = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAnalysisData(id);
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
  }, []); // 空依赖，因为只使用了 setState 和 API 调用

  // 加载学生列表数据（分页）（使用 useCallback 优化，修复依赖问题）
  const loadStudentsData = useCallback(async (id, page = 1, size = 10, filter = null, scoreMin = null, scoreMax = null) => {
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
  }, []); // 空依赖，因为只使用了 setState 和 API 调用

  // 加载历史对比数据（使用 useCallback 优化，修复依赖问题）
  const loadComparisonData = useCallback(async (id) => {
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
  }, []); // 空依赖，因为只使用了 setState 和 API 调用

  // 从URL获取grading_id，加载所有数据
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get("grading_id");
    if (id) {
      loadRealData(id);
      loadComparisonData(id);
    }
  }, [location.search, loadRealData, loadComparisonData]);

  // 当切换到学生明细tab时，加载学生列表数据
  useEffect(() => {
    if (activeTab === 'detail') {
      const searchParams = new URLSearchParams(location.search);
      const id = searchParams.get("grading_id");
      if (id) {
        loadStudentsData(id, currentPage, pageSize, levelFilter, scoreRange.min, scoreRange.max);
      }
    }
  }, [activeTab, currentPage, pageSize, levelFilter, scoreRange.min, scoreRange.max, location.search, loadStudentsData]);

  // 当切换到题型分析tab时，更新雷达图key以触发重新渲染和动画
  useEffect(() => {
    if (activeTab === 'subject') {
      setRadarChartKey(prev => prev + 1);
    }
  }, [activeTab]);

  // 使用自定义 Hook 处理数据
  const { processedData, levelStats, scoreDistributionData, radarData } = useAnalysisData(realData);

  // 手动刷新数据
  const handleRefresh = useCallback(() => {
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get("grading_id");
    if (id) {
      loadRealData(id);
      loadStudentsData(id, currentPage, pageSize, levelFilter, scoreRange.min, scoreRange.max);
      loadComparisonData(id);
    }
  }, [location.search, currentPage, pageSize, levelFilter, scoreRange.min, scoreRange.max, loadRealData, loadStudentsData, loadComparisonData]);

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

  // 清除筛选
  const handleClearFilter = useCallback(() => {
    setLevelFilter(null);
    setScoreRange({ min: null, max: null });
    setCurrentPage(1);
  }, []);

  // 处理分页变化
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

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
          <OverviewTab
            processedData={processedData}
            levelStats={levelStats}
            scoreDistributionData={scoreDistributionData}
            activeTab={activeTab}
            onQuickFilterFail={handleQuickFilterFail}
            onQuickFilterPass={handleQuickFilterPass}
          />
        ),
      },
      {
        key: "subject",
        label: "薄弱环节",
        children: (
          <SubjectTab
            processedData={processedData}
            radarData={radarData}
            radarChartKey={radarChartKey}
            activeTab={activeTab}
          />
        ),
      },
      {
        key: "detail",
        label: "学生成绩",
        children: (
          <DetailTab
            studentsData={studentsData}
            studentsLoading={studentsLoading}
            currentPage={currentPage}
            pageSize={pageSize}
            levelFilter={levelFilter}
            onPageChange={handlePageChange}
            onClearFilter={handleClearFilter}
            onExport={handleExport}
          />
        ),
      },
    ];
  }, [
    processedData,
    levelStats,
    scoreDistributionData,
    radarData,
    activeTab,
    radarChartKey,
    studentsData,
    studentsLoading,
    currentPage,
    pageSize,
    levelFilter,
    handleQuickFilterFail,
    handleQuickFilterPass,
    handlePageChange,
    handleClearFilter,
    handleExport,
  ]);

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
