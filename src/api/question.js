import request from "../utils/request";

/**
 * 题目相关API
 */

/**
 * 获取考试题目列表
 * @param {string} examId - 考试ID
 * @returns {Promise} 返回Promise对象，包含题目列表
 */
export const getExamQuestionList = (examId) => {
  return request.get("/exam-question/exam-question-list", { exam_id: examId });
};

/**
 * 获取题目详情
 * @param {Object} params - 查询参数
 * @param {string} params.exam_id - 考试ID
 * @param {string} params.question_id - 题目ID
 * @returns {Promise} 返回Promise对象，包含题目详情
 */
export const getQuestionDetail = (params) => {
  return request.get("/exam-question", params);
};

/**
 * 获取学生列表（用于题目分析）
 * @param {string} gradingId - 批改会话ID
 * @returns {Promise} 返回Promise对象，包含学生列表
 */
export const getStudentList = (gradingId) => {
  return request.get("/exam-question/student-list", { grading_id: gradingId });
};

/**
 * 获取学生答题信息
 * @param {Object} params - 查询参数
 * @param {string} params.grading_id - 批改会话ID
 * @param {string} params.student_no - 学号
 * @param {string} params.question_id - 题目ID
 * @returns {Promise} 返回Promise对象，包含学生答题信息和评分
 */
export const getStudentGrading = (params) => {
  return request.get("/exam-question/grading", params);
};

/**
 * 修改学生答题分数
 * @param {Object} data - 请求数据
 * @param {string} data.grading_id - 批改会话ID
 * @param {string} data.student_no - 学号
 * @param {string} data.question_id - 题目ID
 * @param {string} data.question_type - 题目类型
 * @param {number} data.old_score - 旧分数
 * @param {number} data.new_score - 新分数
 * @returns {Promise} 返回Promise对象
 */
export const updateQuestionScore = (data) => {
  return request.put("/exam-question/grading/score-update", data);
};

/**
 * 批量修改分数
 * @param {Object} data - 请求数据
 * @param {string} data.grading_id - 批改会话ID
 * @param {Array} data.score_changes - 分数修改列表
 * @returns {Promise} 返回Promise对象
 */
export const batchUpdateScores = (data) => {
  return request.put("/exam-question/batch-alter-score", data);
};

/**
 * 获取题目统计信息
 * @param {Object} params - 查询参数
 * @param {string} params.grading_id - 批改会话ID
 * @param {string} params.question_id - 题目ID
 * @returns {Promise} 返回Promise对象，包含统计信息
 */
export const getQuestionStatistics = (params) => {
  return request.get("/exam-question/statistics", params);
};

export default {
  getExamQuestionList,
  getQuestionDetail,
  getStudentList,
  getStudentGrading,
  updateQuestionScore,
  batchUpdateScores,
  getQuestionStatistics,
};

