import request from "../utils/request";

/**
 * 试卷细则相关API
 */

/**
 * 修改主观题评分细则
 * PUT /paper-detail/alter/subjective-guidelines
 * @param {Object} data - 评分细则数据
 * @returns {Promise}
 */
export const alterSubjectiveGuidelines = (data) => {
  return request.put("/paper-detail/alter/subjective-guidelines", data);
};

/**
 * 修改作文评分细则
 * PUT /paper-detail/alter/essay-guidelines
 * @param {Object} data - 作文评分细则数据
 * @returns {Promise}
 */
export const alterEssayGuidelines = (data) => {
  return request.put("/paper-detail/alter/essay-guidelines", data);
};

/**
 * 修改选择题答案（考试评分细则修改和保存）
 * PUT /paper-detail/alter/choice-answers
 * @param {Object} data - 选择题答案与评分细则
 * @returns {Promise}
 */
export const alterChoiceAnswers = (data) => {
  return request.put("/paper-detail/alter/choice-answers", data);
};

export default {
  alterSubjectiveGuidelines,
  alterEssayGuidelines,
  alterChoiceAnswers,
};


