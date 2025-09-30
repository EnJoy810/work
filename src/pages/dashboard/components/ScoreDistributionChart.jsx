import React from 'react';
import { Card } from 'antd';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

/**
 * 分数分布图表组件
 * 展示学生得分分布情况的柱状图
 */
const ScoreDistributionChart = ({ dataSource = [], statistics = null }) => {
  // 注册Chart.js所需的组件
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ChartTitle,
    Tooltip,
    Legend
  );

  /**
   * 计算分数段分布
   * 根据数据源和统计信息计算各个分数段的学生数量
   */
  const calculateScoreDistribution = () => {
    if (!dataSource || dataSource.length === 0) {
      // 如果没有数据，返回默认的模拟数据
      return [
        { name: '70-80分', value: 12 },
        { name: '80-90分', value: 18 },
        { name: '90-100分', value: 5 },
      ];
    }

    const { lowestScore, highestScore } = statistics || {
      lowestScore: 0,
      highestScore: 100
    };
    
    // 提取所有学生得分并转换为数字
    const scores = dataSource.map((item) => parseFloat(item.total_score) || 0);

    // 以最低分与最高分为区间范围，10分为一个分数段
    const rangeStart = Math.floor(lowestScore / 10) * 10;
    const rangeEnd = Math.ceil(highestScore / 10) * 10;

    // 计算分数段数量
    const segmentCount = Math.ceil((rangeEnd - rangeStart) / 10);

    // 初始化分数段分布数组
    const distribution = [];

    for (let i = 0; i < segmentCount; i++) {
      const segmentStart = rangeStart + i * 10;
      const segmentEnd = segmentStart + 10;

      // 计算该分数段内的学生数量
      // 对于最后一个分数段，要包含上限值（如100分）
      const count = i === segmentCount - 1 
        ? scores.filter((score) => score >= segmentStart && score <= segmentEnd).length
        : scores.filter((score) => score >= segmentStart && score < segmentEnd).length;

      // 添加到分布数组
      distribution.push({
        name: `${segmentStart}-${segmentEnd}分`,
        value: count,
      });
    }
    return distribution;
  };

  // 计算分数段分布
  const scoreDistribution = calculateScoreDistribution();

  // 转换为Chart.js所需的数据格式
  const chartData = {
    labels: scoreDistribution.map((item) => item.name),
    datasets: [
      {
        label: "学生数量",
        data: scoreDistribution.map((item) => item.value),
        backgroundColor: "#2761f3",
        borderColor: "#2761f3",
        borderWidth: 1,
      },
    ],
  };

  // 计算y轴最大值，设置一个合适的上限（比最大值大10%或至少大1）
  const maxYValue = scoreDistribution.length > 0 
    ? Math.max(...scoreDistribution.map(item => item.value)) 
    : 0;
  const yMax = Math.ceil(maxYValue * 1.1); // 向上取整，比最大值大10%
  
  // Chart.js配置选项
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.parsed.y}人`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: yMax > maxYValue ? yMax : maxYValue + 1, // 确保上限比最大值大
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <Card title="学生得分分布" style={{ marginBottom: 16 }}>
      <div style={{ width: "100%", height: "300px" }}>
        <Bar data={chartData} options={chartOptions} />
      </div>
    </Card>
  );
};

export default ScoreDistributionChart;