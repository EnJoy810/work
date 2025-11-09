import { useMemo } from "react";

/**
 * 自定义 Hook：处理数据分析相关的数据转换和计算
 * @param {Object} realData - 后端返回的原始数据
 * @returns {Object} 处理后的数据对象
 */
export const useAnalysisData = (realData) => {
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

  // 图表数据：分数分布柱状图
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

  // 图表数据：题型得分雷达图
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

  return {
    processedData,
    levelStats,
    scoreDistributionData,
    radarData,
  };
};

