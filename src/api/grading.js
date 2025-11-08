import request from "../utils/request";

/**
 * 作文批改相关API
 */

/**
 * 获取批改结果列表（包含学生信息和分数）
 * @param {Object} params - 请求参数
 * @param {string} params.grading_id - 批改会话ID（必填）
 * @returns {Promise} 返回Promise对象，包含学生批改结果列表
 */
export const getGradingResults = (params) => {
  return request.get("/grading/result", params);
};

/**
 * 获取学生作文结果（包含评语）
 * @param {Object} params - 请求参数
 * @param {string} params.grading_id - 批改会话ID（必填）
 * @param {string} params.student_no - 学号（必填）
 * @returns {Promise} 返回Promise对象，包含作文结果和评语
 */
export const getEssayResult = (params) => {
  return request.get("/exam-question/essay-result", params);
};

/**
 * 修改句子评语（PUT请求）
 * @param {Object} params - 请求参数
 * @param {number} params.essay_result_id - 作文结果ID（必填）
 * @param {Array} params.sentence_feedbacks - 评语数组，格式：[{ sentence, quality, comment }]
 * @returns {Promise} 返回Promise对象
 */
export const alterSentenceFeedbacks = (params) => {
  const { essay_result_id, sentence_feedbacks } = params;
  
  // 将评语数组转换为JSON字符串
  const sentenceFeedbacksStr = Array.isArray(sentence_feedbacks) 
    ? JSON.stringify(sentence_feedbacks) 
    : sentence_feedbacks;
  
  const requestConfig = {
    params: {
      essay_result_id,
      sentence_feedbacks: sentenceFeedbacksStr,
    },
  };
  
  return request.put(
    "/essay-result/alter-sentence-feedbacks",
    {},
    requestConfig
  );
};

/**
 * 修改作文分数（PUT请求）
 * @param {Object} data - 请求参数（JSON body，使用下划线命名）
 * @param {number} data.essay_result_id - 作文结果ID（必填）
 * @param {string} data.grading_id - 批改会话ID（必填）
 * @param {string} data.student_no - 学号（必填）
 * @param {number} data.old_score - 旧分数（必填）
 * @param {number} data.new_score - 新分数（必填）
 * @returns {Promise} 返回Promise对象
 */
export const alterScore = (data) => {
  // 直接传递下划线格式的参数给后端
  return request.put("/essay-result/alter-score", data);
};

/**
 * 删除批改会话（DELETE请求）
 * @param {Object} data - 请求参数（JSON body）
 * @param {string} data.grading_id - 批改会话ID（必填，下划线命名）
 * @returns {Promise} 返回Promise对象
 */
export const deleteGrading = (data) => {
  return request.delete("/grading", data);
};

/**
 * 更新评分细则（PUT请求）
 * @param {Object} data - 请求参数（JSON body）
 * @param {string} data.exam_id - 考试ID（必填）
 * @param {string} data.subjective_guideline - 主观题评分细则（JSON字符串）
 * @param {string} data.essay_guideline - 作文评分细则（JSON字符串）
 * @returns {Promise} 返回Promise对象
 */
export const updateGuideline = (data) => {
  return request.put("/grading/exam/guideline", data);
};

/**
 * 更新主观题评分细则（PUT请求）
 * @param {Object} data - 请求参数（JSON body）
 * @param {string} data.exam_id - 考试ID（必填）
 * @param {Array} data.guidelines - 主观题评分细则数组
 * @returns {Promise} 返回Promise对象
 */
export const updateSubjectiveGuideline = (data) => {
  const { exam_id, guidelines } = data;
  return request.put("/grading/exam/guideline", {
    exam_id,
    subjective_guideline: JSON.stringify(guidelines),
  });
};

/**
 * 更新作文评分细则（PUT请求）
 * @param {Object} data - 请求参数（JSON body）
 * @param {string} data.exam_id - 考试ID（必填）
 * @param {Object} data.essay_guideline - 作文评分细则对象
 * @returns {Promise} 返回Promise对象
 */
export const updateEssayGuideline = (data) => {
  const { exam_id, essay_guideline } = data;
  return request.put("/grading/exam/guideline", {
    exam_id,
    essay_guideline: JSON.stringify(essay_guideline),
  });
};

/**
 * 获取学生列表（用于数据分析）
 * @param {Object} params - 请求参数
 * @param {string} params.grading_id - 批改会话ID（必填）
 * @param {number} params.score_min - 最低分数（可选）
 * @param {number} params.score_max - 最高分数（可选）
 * @returns {Promise} 返回Promise对象，包含学生列表
 */
export const getStudentsList = (params) => {
  return request.get("/grading/analysis/students", params);
};

/**
 * 获取批改数据分析
 * @param {string} gradingId - 批改会话ID（必填）
 * @returns {Promise} 返回Promise对象，包含数据分析结果
 */
export const getAnalysisData = (gradingId) => {
  return request.get("/grading/analysis", { grading_id: gradingId });
};

/**
 * 获取历史对比数据
 * @param {Object} params - 请求参数
 * @param {string} params.grading_id - 批改会话ID（必填）
 * @param {string} params.compare_type - 对比类型（可选，如 "previous"）
 * @param {number} params.limit - 返回数量限制（可选）
 * @returns {Promise} 返回Promise对象，包含对比数据
 */
export const getComparisonData = (params) => {
  return request.get("/grading/analysis/comparison", params);
};

/**
 * 导出批改信息（返回下载URL）
 * @param {string} gradingId - 批改会话ID（必填）
 * @param {string} studentNo - 学号（可选，如果all=false则必填）
 * @param {boolean} all - 是否导出全部学生信息（必填，默认true）
 * @returns {string} 返回下载URL
 */
export const exportGradingInfo = (gradingId, studentNo = '', all = true) => {
  let url = `/api/exam-question/grading/export?grading_id=${gradingId}&all=${all}`;
  if (studentNo) {
    url += `&student_no=${studentNo}`;
  }
  return url;
};

/**
 * 导出统计分析结果（返回下载URL）
 * @param {string} gradingId - 批改会话ID
 * @returns {string} 返回下载URL
 */
export const exportStatisticAnalysis = (gradingId) => {
  return `/api/exam-question/grading/export/statistic-analysis?grading_id=${gradingId}`;
};

/**
 * 导出作文结果（返回下载URL）
 * @param {string} gradingId - 批改会话ID
 * @returns {string} 返回下载URL
 */
export const exportEssayResults = (gradingId) => {
  return `/api/exam-question/grading/export/essay?grading_id=${gradingId}`;
};

/**
 * 导出简要学生分数结果（返回下载URL）
 * @param {string} gradingId - 批改会话ID
 * @returns {string} 返回下载URL
 */
export const exportSimpleScores = (gradingId) => {
  return `/api/exam-question/grading/export-easy?grading_id=${gradingId}`;
};

export default {
  getGradingResults,
  getEssayResult,
  alterSentenceFeedbacks,
  alterScore,
  deleteGrading,
  updateGuideline,
  updateSubjectiveGuideline,
  updateEssayGuideline,
  getAnalysisData,
  getStudentsList,
  getComparisonData,
  exportGradingInfo,
  exportStatisticAnalysis,
  exportEssayResults,
  exportSimpleScores,
};

