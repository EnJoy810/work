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
 * 文档字段: grading_id, paper_id, question_id, question_type, old_score, new_score
 */
export const updateQuestionScore = (data) => {
  return request.put("/exam-question/grading/score-update", data);
};

/**
 * 获取班级学生列表
 * @returns {Promise} 返回Promise对象，包含班级学生列表
 * 注意：class_id通过请求头X-Current-Class自动传递
 */
export const getStudentListByClassId = () => {
  return request.get("/grading/list-by-class-id");
};

export default {
  getExamQuestionList,
  getQuestionDetail,
  getStudentList,
  getStudentGrading,
  updateQuestionScore,
  getStudentListByClassId,
};

