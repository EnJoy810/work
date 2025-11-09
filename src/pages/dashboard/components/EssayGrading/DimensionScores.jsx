import React, { memo } from "react";
import { Divider } from "antd";

/**
 * 维度评分组件
 * 使用 React.memo 优化，避免不必要的重新渲染
 */
const DimensionScores = memo(({ dimensions }) => {
  return (
    <div className="evaluation-section">
      <h4>多维度评分</h4>
      {dimensions.length > 0 ? (
        <div className="dimensions-list">
          {dimensions.map((dimension, index) => {
            // 计算得分百分比
            const percentage = dimension.maxScore > 0 
              ? dimension.studentScore / dimension.maxScore 
              : 0;
            
            // 根据百分比确定等级
            let gradeLabel = '';
            let gradeColor = '';
            if (percentage < 0.5) {
              gradeLabel = '差';
              gradeColor = '#f5222d'; // 红色
            } else if (percentage < 0.8) {
              gradeLabel = '良';
              gradeColor = '#faad14'; // 黄色
            } else {
              gradeLabel = '优';
              gradeColor = '#1890ff'; // 蓝色
            }
            
            return (
              <div key={index} className="dimension-item">
                <div className="dimension-header">
                  <span className="dimension-name">{dimension.dimensionName}</span>
                  <span className="dimension-grade" style={{ color: gradeColor, fontWeight: 'bold' }}>
                    {gradeLabel}
                  </span>
                </div>
                {dimension.comment && (
                  <div className="dimension-comment">{dimension.comment}</div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="evaluation-content">暂无维度评分</div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数，优化性能
  return (
    prevProps.dimensions.length === nextProps.dimensions.length &&
    prevProps.dimensions.every((dim, index) => {
      const nextDim = nextProps.dimensions[index];
      return (
        dim.dimensionName === nextDim.dimensionName &&
        dim.studentScore === nextDim.studentScore &&
        dim.maxScore === nextDim.maxScore &&
        dim.comment === nextDim.comment
      );
    })
  );
});

DimensionScores.displayName = "DimensionScores";

export default DimensionScores;

