import request from "../utils/request";

/**
 * 人工阅卷相关接口
 * 对接 /api/exam-question/* 与阅卷流程相关的接口
 */

/**
 * 获取指定批改的学生列表
 * @param {string} gradingId 批改会话ID
 */
export const fetchManualStudents = (gradingId) => {
  return request.get("/exam-question/student-list", { grading_id: gradingId });
};

/**
 * 获取指定考试的小题列表
 * @param {string} examId 考试ID
 */
export const fetchManualQuestions = (examId) => {
  return request.get("/exam-question/exam-question-list", { exam_id: examId });
};

/**
 * 获取试卷详情（包含各题分值）
 * @param {string} examId 考试ID
 */
export const fetchExamPaperDetail = (examId) => {
  return request.get("/grading/exam/paper-detail", { exam_id: examId });
};

/**
 * 获取该次批改所有小题的汇总与各学生该题得分列表
 * 可用于构建「questionId -> (studentId -> score)」的缓存映射
 * @param {string} gradingId 批改会话ID
 */
export const fetchManualQuestionScoreList = (gradingId) => {
  return request.get("/exam-question/question-list", { grading_id: gradingId });
};

/**
 * 获取学生的小题批改详情
 * @param {Object} params
 * @param {string} params.grading_id 批改会话ID
 * @param {string} params.paper_id 学生paper_id
 * @param {string} params.question_id 题目ID
 */
export const fetchManualAnswerDetail = (params) => {
  return request.get("/exam-question/grading", params);
};

/**
 * 获取学生作文结果（包含文本与图片）
 * @param {Object} params
 * @param {string} params.grading_id 批改会话ID
 * @param {string} params.paper_id 学生paper_id
 */
export const fetchEssayResult = (params) => {
  return request.get("/exam-question/essay-result", params);
};

/**
 * 更新学生的小题得分
 * @param {Object} data
 * @param {string} data.grading_id 批改会话ID
 * @param {string} data.paper_id 学生paper_id
 * @param {string} data.question_id 题目ID
 * @param {string} data.question_type 题目类型
 * @param {number} data.old_score 原分数
 * @param {number} data.new_score 新分数
 */
export const submitManualScore = (data) => {
  return request.put("/exam-question/grading/score-update", data);
};

/**
 * 修改得分原因（可选）
 * @param {Object} data
 * @param {string} data.grading_id 批改会话ID
 * @param {string} data.question_id 题目ID
 * @param {string} data.reason 得分原因
 */
export const submitManualReason = (data) => {
  return request.put("/exam-question/grading/alter-reason", data);
};

export default {
  fetchManualStudents,
  fetchManualQuestions,
  fetchExamPaperDetail,
  fetchManualQuestionScoreList,
  fetchManualAnswerDetail,
  fetchEssayResult,
  submitManualScore,
  submitManualReason,
};
