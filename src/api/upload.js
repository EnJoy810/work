// import request from "../utils/request";

/**
 * 文件上传相关API
 * ⚠️ 已废弃：项目已迁移至 OSS 直传方式（见 oss.js 和 services/ossUpload.js）
 * 保留此文件仅供参考，所有接口已注释
 */

// /**
//  * 上传答题卡并开始批改
//  * @deprecated 已废弃，请使用 OSS 直传 + gradeStudentPaperOSS
//  * @param {FormData} formData - 包含答题卡文件和grading_id的FormData
//  * @param {File} formData.student_papers - 学生答题卡PDF文件
//  * @param {string} formData.grading_id - 批改会话ID
//  * @returns {Promise} 返回Promise对象
//  */
// export const uploadAnswerSheet = (formData) => {
//   return request.post("/grading/grade", formData, {
//     headers: {
//       "Content-Type": "multipart/form-data",
//     },
//   });
// };

// /**
//  * 上传试卷文件
//  * @deprecated 已废弃，请使用 OSS 直传 + createExamWithObjectKeys
//  * @param {FormData} formData - 包含试卷文件的FormData
//  * @returns {Promise} 返回Promise对象，包含文件URL
//  */
// export const uploadExamPaper = (formData) => {
//   return request.post("/grading/upload/paper", formData, {
//     headers: {
//       "Content-Type": "multipart/form-data",
//     },
//   });
// };

// /**
//  * 上传答案文件
//  * @deprecated 已废弃，请使用 OSS 直传 + createExamWithObjectKeys
//  * @param {FormData} formData - 包含答案文件的FormData
//  * @returns {Promise} 返回Promise对象，包含文件URL
//  */
// export const uploadExamAnswer = (formData) => {
//   return request.post("/grading/upload/answer", formData, {
//     headers: {
//       "Content-Type": "multipart/form-data",
//     },
//   });
// };

// /**
//  * 批量上传文件
//  * @deprecated 已废弃，请使用 OSS 直传
//  * @param {FormData} formData - 包含多个文件的FormData
//  * @returns {Promise} 返回Promise对象，包含文件URL列表
//  */
// export const uploadMultipleFiles = (formData) => {
//   return request.post("/grading/upload/multiple", formData, {
//     headers: {
//       "Content-Type": "multipart/form-data",
//     },
//   });
// };

export default {
  // uploadAnswerSheet,
  // uploadExamPaper,
  // uploadExamAnswer,
  // uploadMultipleFiles,
};

