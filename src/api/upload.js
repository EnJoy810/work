import request from "../utils/request";

/**
 * 文件上传相关API
 */

/**
 * 上传答题卡并开始批改
 * @param {FormData} formData - 包含答题卡文件和grading_id的FormData
 * @param {File} formData.student_papers - 学生答题卡PDF文件
 * @param {string} formData.grading_id - 批改会话ID
 * @returns {Promise} 返回Promise对象
 */
export const uploadAnswerSheet = (formData) => {
  return request.post("/grading/grade", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

/**
 * 上传试卷文件
 * @param {FormData} formData - 包含试卷文件的FormData
 * @returns {Promise} 返回Promise对象，包含文件URL
 */
export const uploadExamPaper = (formData) => {
  return request.post("/grading/upload/paper", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

/**
 * 上传答案文件
 * @param {FormData} formData - 包含答案文件的FormData
 * @returns {Promise} 返回Promise对象，包含文件URL
 */
export const uploadExamAnswer = (formData) => {
  return request.post("/grading/upload/answer", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

/**
 * 批量上传文件
 * @param {FormData} formData - 包含多个文件的FormData
 * @returns {Promise} 返回Promise对象，包含文件URL列表
 */
export const uploadMultipleFiles = (formData) => {
  return request.post("/grading/upload/multiple", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export default {
  uploadAnswerSheet,
  uploadExamPaper,
  uploadExamAnswer,
  uploadMultipleFiles,
};

