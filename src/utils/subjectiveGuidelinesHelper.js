import { alterSubjectiveGuidelines } from '../api/paperDetail';

/**
 * 保存主观题评分细则的辅助函数
 * @param {string} examId - 考试ID
 * @param {Array} guidelines - 评分细则数组
 * @returns {Promise} API调用结果
 */
export const saveSubjectiveGuidelines = async (examId, guidelines) => {
  // 参数验证
  if (!examId) {
    throw new Error('考试ID不能为空');
  }
  
  if (!Array.isArray(guidelines)) {
    throw new Error('评分细则必须是数组格式');
  }
  
  // 构造请求数据
  const requestData = {
    examId,
    guidelines: guidelines.map(item => ({
      question_id: item.question_id || '',
      score: item.score || 0,
      question_content: item.question_content || '',
      standard_answer: item.standard_answer || '',
      grading_guideline: item.grading_guideline || ''
    }))
  };
  
  // 调用API
  return await alterSubjectiveGuidelines(requestData);
};

/**
 * 创建新的主观题评分细则项
 * @param {Object} params - 参数对象
 * @returns {Object} 评分细则项
 */
export const createGuidelineItem = ({
  question_id = '',
  score = 0,
  question_content = '',
  standard_answer = '',
  grading_guideline = ''
}) => {
  return {
    question_id,
    score,
    question_content,
    standard_answer,
    grading_guideline
  };
};

export default {
  saveSubjectiveGuidelines,
  createGuidelineItem
};