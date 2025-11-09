import React, { memo } from "react";
import { Card, Row, Col, Alert } from "antd";
import SubjectRadarChart from "./SubjectRadarChart";

/**
 * 薄弱环节 Tab 组件
 */
const SubjectTab = memo(({ 
  processedData, 
  radarData, 
  radarChartKey,
  activeTab,
}) => {
  if (!processedData) return null;

  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} lg={12}>
        <SubjectRadarChart data={radarData} radarChartKey={radarChartKey} />
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
  );
});

SubjectTab.displayName = "SubjectTab";

export default SubjectTab;

