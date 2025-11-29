/**
 * 留痕相关 API
 */
import request from '../utils/request';

/**
 * 获取批改结果和学生列表（V2版本）
 * @param {string} gradingId - 批改任务ID
 * @returns {Promise}
 */
export const getGradingResultV2 = (gradingId) => {
  return request.get('/grading/result/v2', {
    grading_id: gradingId
  });
};

/**
 * 获取学生某道题的详细批改信息（含留痕）
 * @param {Object} params
 * @param {string} params.gradingId - 批改任务ID
 * @param {string} params.paperId - 试卷ID
 * @param {string} params.questionId - 题目ID
 * @returns {Promise}
 */
export const getExamQuestionGrading = ({ gradingId, paperId, questionId }) => {
  return request.get('/exam-question/grading', {
    grading_id: gradingId,
    paper_id: paperId,
    question_id: questionId
  });
};

/**
 * 保存留痕信息
 * @param {Object} data
 * @param {string} data.paperId - 试卷ID
 * @param {string} data.questionId - 题目ID
 * @param {string} data.trace - 留痕信息（JSON字符串）
 * @returns {Promise}
 */
export const uploadTrace = (data) => {
  return request.put('/exam-question/grading/trace', {
    paper_id: data.paperId,
    question_id: data.questionId,
    trace: data.trace
  });
};

/**
 * 获取学生trace列表（批改信息汇总）
 * @param {string} paperId - 试卷ID
 * @returns {Promise<string[]>}
 */
export const getStudentTraceList = (paperId) => {
  return request.get('/exam-question/grading/trace-list/student', {
    paper_id: paperId
  });
};
