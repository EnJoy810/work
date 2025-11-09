import React, { memo } from "react";
import { Card } from "antd";
import { Radar } from "react-chartjs-2";

/**
 * 题型得分雷达图组件
 */
const SubjectRadarChart = memo(({ data, radarChartKey }) => {
  if (!data) return null;

  return (
    <Card 
      title="题型得分雷达图" 
      className="chart-card"
    >
      <Radar
        key={`radar-chart-${radarChartKey}`}
        data={{
          labels: data.labels,
          datasets: [{
            ...data.datasets[0],
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
  );
});

SubjectRadarChart.displayName = "SubjectRadarChart";

export default SubjectRadarChart;

