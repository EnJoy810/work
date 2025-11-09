import React, { memo } from "react";
import { Card } from "antd";
import { Bar } from "react-chartjs-2";

/**
 * 分数分布柱状图组件
 */
const ScoreDistributionChart = memo(({ data, activeTab }) => {
  if (!data) return null;

  return (
    <Card title="分数分布" className="chart-card">
      <Bar
        key={`bar-chart-${activeTab}`}
        data={data}
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
  );
});

ScoreDistributionChart.displayName = "ScoreDistributionChart";

export default ScoreDistributionChart;

