import request from "../utils/request";

/**
 * 考试管理相关API
 */

/**
 * 获取考试列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码（可选）
 * @param {number} params.limit - 每页数量（可选）
 * @returns {Promise} 返回Promise对象，包含考试列表
 */
export const getExamList = (params = {}) => {
  return request.get("/grading/exam/list", params);
};

/**
 * 获取批改任务列表（用于首页）
 * @returns {Promise} 返回Promise对象，包含批改任务列表
 */
export const getGradingList = () => {
  return request.get("/grading/grading/list");
};

/**
 * 创建考试
 * @param {FormData} formData - 考试数据（包含文件）
 * @returns {Promise} 返回Promise对象，包含新建考试的ID
 */
export const createExam = (formData) => {
  return request.post("/grading/exam/create", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

/**
 * 获取答题卡模板列表
 * @param {Object} params - 查询参数
 * @param {number} params.limit - 返回数量限制
 * @returns {Promise} 返回Promise对象，包含模板列表
 */
export const getAnswerSheetTemplates = (params = { limit: 50 }) => {
  return request.get("/grading/answer-sheet-template/list", params);
};

/**
 * 获取考试详情
 * @param {string} examId - 考试ID
 * @returns {Promise} 返回Promise对象，包含考试详细信息
 */
export const getExamDetail = (examId) => {
  return request.get("/grading/exam/detail", { exam_id: examId });
};

/**
 * 更新考试信息
 * @param {Object} data - 考试数据
 * @param {string} data.exam_id - 考试ID
 * @returns {Promise} 返回Promise对象
 */
export const updateExam = (data) => {
  return request.put("/grading/exam/update", data);
};

/**
 * 删除考试
 * @param {string} examId - 考试ID
 * @returns {Promise} 返回Promise对象
 */
export const deleteExam = (examId) => {
  return request.delete("/grading/exam/delete", { exam_id: examId });
};

/**
 * 获取考试评分细则
 * @param {string} examId - 考试ID
 * @returns {Promise} 返回Promise对象，包含评分细则
 */
export const getExamGuideline = (examId) => {
  return request.get("/grading/exam/guideline", { exam_id: examId });
};

/**
 * 更新评分细则（通用方法）
 * @param {Object} data - 请求参数
 * @param {string} data.exam_id - 考试ID
 * @param {string} data.subjective_guideline - 主观题评分细则（JSON字符串）
 * @param {string} data.essay_guideline - 作文评分细则（JSON字符串）
 * @returns {Promise} 返回Promise对象
 */
export const updateGuideline = (data) => {
  return request.put("/grading/exam/guideline", data);
};

export default {
  getExamList,
  getGradingList,
  createExam,
  getAnswerSheetTemplates,
  getExamDetail,
  updateExam,
  deleteExam,
  getExamGuideline,
  updateGuideline,
};

