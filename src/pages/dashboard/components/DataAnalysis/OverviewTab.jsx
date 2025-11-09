import React, { memo } from "react";
import { Card, Row, Col, Statistic, Button } from "antd";
import ScoreDistributionChart from "./ScoreDistributionChart";

/**
 * 班级表现 Tab 组件
 */
const OverviewTab = memo(({ 
  processedData, 
  levelStats, 
  scoreDistributionData, 
  activeTab,
  onQuickFilterFail,
  onQuickFilterPass,
}) => {
  if (!processedData) return null;

  return (
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
                  onClick={onQuickFilterFail}
                  style={{ marginBottom: 8 }}
                >
                  {levelStats.不及格}名学生不及格，点击查看
                </Button>
              )}
              {levelStats.及格 > processedData.overview.totalStudents * 0.3 && (
                <Button 
                  type="default"
                  block
                  onClick={onQuickFilterPass}
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
          <ScoreDistributionChart data={scoreDistributionData} activeTab={activeTab} />
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
  );
});

OverviewTab.displayName = "OverviewTab";

export default OverviewTab;

