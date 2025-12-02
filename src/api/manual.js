import request from "../utils/request";

/**
 * 人工阅卷相关接口
 * 对接 /api/exam-question/* 与阅卷流程相关的接口
 */

/**
 * 获取指定批改的学生列表（包含 teacher_alter）
 * @param {string} gradingId 批改会话ID
 */
export const fetchManualStudents = (gradingId) => {
  return request.get("/exam-question/student-list", { grading_id: gradingId });
};

/**
 * 获取指定批改的学生列表 v2（包含分组状态：normal/absent/exceptional）
 * @param {string} gradingId 批改会话ID
 */
export const fetchManualStudentsV2 = (gradingId) => {
  return request.get("/grading/result/v2", { grading_id: gradingId });
};

/**
 * 获取指定考试的小题列表
 * @param {string} examId 考试ID
 */
export const fetchManualQuestions = (examId) => {
  return request.get("/exam-question/exam-question-list", { exam_id: examId });
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

export default {
  fetchManualStudents,
  fetchManualQuestions,
  fetchManualQuestionScoreList,
  fetchManualAnswerDetail,
  submitManualScore,
};
