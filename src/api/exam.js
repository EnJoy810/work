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
  // 期望: query 传 subject/paper_title/answer_sheet_template_id，表单包含 origin_paper 和 standard_answer
  // 允许调用者把这三个参数附在 formData.meta 中或通过第二个可选入参传入
  const meta = formData?.meta || {};
  const { subject, paper_title, answer_sheet_template_id } = meta;
  // 清理以避免被当作 multipart 字段发送
  if (formData && formData.meta) {
    delete formData.meta;
  }
  return request.post("/grading/exam/create", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    params: {
      subject,
      paper_title,
      answer_sheet_template_id,
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
  // 对齐文档使用 /grading/exam/paper-detail
  return request.get("/grading/exam/paper-detail", { exam_id: examId });
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
// 删除考试接口已在 grading.js 中提供并已对齐文档，此处不再重复导出

/**
 * 获取考试评分细则
 * @param {string} examId - 考试ID
 * @returns {Promise} 返回Promise对象，包含评分细则
 */
export const getExamGuideline = (examId) => {
  return request.get("/grading/exam/guideline", { exam_id: examId });
};

/**
 * 获取试卷详情（包含 choice_answers 与题干分值等）
 * @param {string} examId - 考试ID
 * @returns {Promise} 返回Promise对象，包含试卷详情
 */
export const getExamPaperDetail = (examId) => {
  return request.get("/grading/exam/paper-detail", { exam_id: examId });
};

/**
 * 更新评分细则（通用方法）
 * @param {Object} data - 请求参数
 * @param {string} data.exam_id - 考试ID
 * @param {string} data.subjective_guideline - 主观题评分细则（JSON字符串）
 * @param {string} data.essay_guideline - 作文评分细则（JSON字符串）
 * @returns {Promise} 返回Promise对象
 */
// 评分细则更新请改用 paperDetail.js 或 grading.js 中的聚合方法

export default {
  getExamList,
  getGradingList,
  createExam,
  getAnswerSheetTemplates,
  getExamDetail,
  updateExam,
  getExamGuideline,
  getExamPaperDetail,
};

