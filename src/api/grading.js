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

export default {
  getGradingResults,
  getEssayResult,
  alterSentenceFeedbacks,
  deleteGrading,
  updateGuideline,
};
