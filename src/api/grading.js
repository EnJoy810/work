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
  return request.get("/grading/result/v2", params);
};

/**
 * 获取学生作文结果（包含评语）
 * @param {Object} params - 请求参数
 * @param {string} params.grading_id - 批改会话ID（必填）
 * @param {string} params.student_no - 学号（必填）
 * @returns {Promise} 返回Promise对象，包含作文结果和评语
 */
export const getEssayResult = (params) => {
  // 文档要求: 使用 paper_id 作为学生标识
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
  const data = {
    essay_result_id,
    sentence_feedbacks: Array.isArray(sentence_feedbacks)
      ? JSON.stringify(sentence_feedbacks)
      : sentence_feedbacks,
  };
  // 文档定义为 JSON body，这里采用 body（保持下划线命名）
  return request.put("/essay-result/alter-sentence-feedbacks", data);
};

/**
 * 修改作文分数（PUT请求）
 * @param {Object} data - 请求参数（JSON body，使用下划线命名）
 * @param {number} data.essay_result_id - 作文结果ID（必填）
 * @param {string} data.grading_id - 批改会话ID（必填）
 * @param {string} data.student_no - 学号（必填）
 * @param {number} data.old_score - 旧分数（必填）
 * @param {number} data.new_score - 新分数（必填）
 * @returns {Promise} 返回Promise对象
 */
export const alterScore = (data) => {
  // 直接传递下划线格式的参数给后端
  return request.put("/essay-result/alter-score", data);
};

/**
 * 更新评分细则（PUT请求）
 * @param {Object} data - 请求参数（JSON body）
 * @param {string} data.exam_id - 考试ID（必填）
 * @param {string} data.subjective_guideline - 主观题评分细则（JSON字符串）
 * @param {string} data.essay_guideline - 作文评分细则（JSON字符串）
 * @returns {Promise} 返回Promise对象
 */
// 聚合更新评分细则：根据传入字段路由至正确 endpoint
export const updateGuideline = (data) => {
  const { exam_id, subjective_guideline, essay_guideline, choice_answers } = data || {};
  if (subjective_guideline) {
    return request.put("/paper-detail/alter/subjective-guidelines", {
      exam_id,
      guidelines: typeof subjective_guideline === "string" ? JSON.parse(subjective_guideline) : subjective_guideline,
    });
  }
  if (essay_guideline) {
    return request.put("/paper-detail/alter/essay-guidelines", {
      exam_id,
      essay_guideline: typeof essay_guideline === "string" ? JSON.parse(essay_guideline) : essay_guideline,
    });
  }
  if (choice_answers) {
    return request.put("/paper-detail/alter/choice-answers", {
      exam_id,
      choice_answers,
    });
  }
  return Promise.reject(new Error("No guideline payload found"));
};

/**
 * 更新主观题评分细则（PUT请求）
 * @param {Object} data - 请求参数（JSON body）
 * @param {string} data.exam_id - 考试ID（必填）
 * @param {Array} data.guidelines - 主观题评分细则数组
 * @returns {Promise} 返回Promise对象
 */
export const updateSubjectiveGuideline = (data) => {
  const { exam_id, guidelines } = data;
  return request.put("/paper-detail/alter/subjective-guidelines", {
    exam_id,
    guidelines,
  });
};

/**
 * 更新作文评分细则（PUT请求）
 * @param {Object} data - 请求参数（JSON body）
 * @param {string} data.exam_id - 考试ID（必填）
 * @param {Object} data.essay_guideline - 作文评分细则对象
 * @returns {Promise} 返回Promise对象
 */
export const updateEssayGuideline = (data) => {
  const { exam_id, essay_guideline } = data;
  return request.put("/paper-detail/alter/essay-guidelines", {
    exam_id,
    essay_guideline,
  });
};

/**
 * 获取学生列表（用于数据分析）
 * @param {Object} params - 请求参数
 * @param {string} params.grading_id - 批改会话ID（必填）
 * @param {number} params.score_min - 最低分数（可选）
 * @param {number} params.score_max - 最高分数（可选）
 * @returns {Promise} 返回Promise对象，包含学生列表
 */
export const getStudentsList = (params) => {
  return request.get("/grading/analysis/students", params);
};

/**
 * 获取批改数据分析
 * @param {string} gradingId - 批改会话ID（必填）
 * @returns {Promise} 返回Promise对象，包含数据分析结果
 */
export const getAnalysisData = (gradingId) => {
  return request.get("/grading/analysis", { grading_id: gradingId });
};

/**
 * 获取历史对比数据
 * @param {Object} params - 请求参数
 * @param {string} params.grading_id - 批改会话ID（必填）
 * @param {string} params.compare_type - 对比类型（可选，如 "previous"）
 * @param {number} params.limit - 返回数量限制（可选）
 * @returns {Promise} 返回Promise对象，包含对比数据
 */
export const getComparisonData = (params) => {
  return request.get("/grading/analysis/comparison", params);
};

/**
 * 导出批改信息（返回下载URL）
 * @param {string} gradingId - 批改会话ID（必填）
 * @param {string} studentNo - 学号（可选，如果all=false则必填）
 * @param {boolean} all - 是否导出全部学生信息（必填，默认true）
 * @returns {string} 返回下载URL
 */
export const exportGradingInfo = (gradingId, studentNo = '', all = true) => {
  let url = `/api/exam-question/grading/export?grading_id=${gradingId}&all=${all}`;
  if (studentNo) {
    // 文档字段为 paper_id
    url += `&paper_id=${studentNo}`;
  }
  return url;
};

/**
 * 导出统计分析结果（返回下载URL）
 * @param {string} gradingId - 批改会话ID
 * @returns {string} 返回下载URL
 */
export const exportStatisticAnalysis = (gradingId) => {
  return `/api/exam-question/grading/export/statistic-analysis?grading_id=${gradingId}`;
};

/**
 * 导出作文结果（返回下载URL）
 * @param {string} gradingId - 批改会话ID
 * @returns {string} 返回下载URL
 */
export const exportEssayResults = (gradingId) => {
  return `/api/exam-question/grading/export/essay?grading_id=${gradingId}`;
};

/**
 * 导出简要学生分数结果（返回下载URL）
 * @param {string} gradingId - 批改会话ID
 * @returns {string} 返回下载URL
 */
export const exportSimpleScores = (gradingId) => {
  return `/api/exam-question/grading/export-easy?grading_id=${gradingId}`;
};

/**
 * 获取批改结果（V2，含学生状态）
 * @param {string} gradingId - 批改会话ID
 * @returns {Promise} 返回Promise对象，包含学生批改结果与状态
 */
export const getGradingResultsV2 = (gradingId) => {
  return request.get("/grading/result/v2", { grading_id: gradingId });
};

/**
 * 根据gradingId删除指定批改
 * @param {Object} params - 请求参数
 * @param {string} params.grading_id - 批改会话ID（必填，示例：550e8400-e29b-41d4-a716-446655440001）
 * @returns {Promise} 返回Promise对象
 */
export const deleteGrading = (params) => {
  // 直接传平铺参数对象
  return request.delete("/grading", params);
};

/**
 * 通过paper_id删除学生信息
 * @param {Object} params - 请求参数
 * @param {string} params.paper_id - 学生信息paper_id（必填）
 * @returns {Promise} 返回Promise对象
 */
export const deleteAllInfoByPaperId = (params) => {
  // 直接传平铺参数对象
  return request.delete("/grading/remove-all-info-by-paper-id", params);
};

/**
 * 修改学生信息（通过paper_id修改匹配关系）
 * @param {Object} data - 请求参数
 * @param {string} data.paperId - 答题卡paper_id（必填）
 * @param {string} data.studentNo - 新的学号（必填）
 * @param {string} data.studentName - 新的姓名（必填）
 * @returns {Promise} 返回Promise对象
 */
export const alterStudentInfoByPaperId = (data) => {
  if (!data) {
    return Promise.reject(new Error("缺少请求参数"));
  }
  const { paperId, studentNo, studentName } = data;
  return request.put("/grading/alter/student-info-by-paper-id", {
    paper_id: paperId,
    student_no: studentNo,
    student_name: studentName,
  });
};

/**
 * 通过exam_id删除考试
 * @param {Object} params - 请求参数
 * @param {string} params.exam_id - 考试id（必填）
 * @returns {Promise} 返回Promise对象
 */
export const deleteExam = (params) => {
  return request.delete("/grading/exam", { params });
};

/**
 * 根据模板ID删除指定的答题卡模板
 * @param {Object} params - 请求参数
 * @param {number} params.id - 答题卡模板ID（必填）
 * @returns {Promise} 返回Promise对象
 */
export const deleteAnswerSheetTemplate = (params) => {
  return request.delete(`/grading/answer-sheet-template/${params.id}`);
};

/**
 * 根据已有考试ID创建批改会话
 * @param {string} examId - 考试ID
 * @param {string} classId - 班级ID
 * @returns {Promise} 返回Promise对象
 */
export const createGradingFromExam = (examId, classId) => {
  return request.post(`/grading/create-grading?exam_id=${examId}&class_id=${classId}`, {});
};
export const createHumanGrading = (data) => {
  return request.post("/grading/human-grading", data);
};

export default {
  getGradingResults,
  getEssayResult,
  alterSentenceFeedbacks,
  alterScore,
  deleteGrading,
  deleteAllInfoByPaperId,
  deleteExam,
  deleteAnswerSheetTemplate,
  updateGuideline,
  updateSubjectiveGuideline,
  updateEssayGuideline,
  getAnalysisData,
  getStudentsList,
  getComparisonData,
  exportGradingInfo,
  exportStatisticAnalysis,
  exportEssayResults,
  exportSimpleScores,
  getGradingResultsV2,
  alterStudentInfoByPaperId,
  createGradingFromExam,
  createHumanGrading,
};

