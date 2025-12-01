// ==================== 批注尺寸常量 ====================
export const ANNOTATION_WIDTH_DEFAULT = 160;
export const ANNOTATION_WIDTH_MIN = 80;
export const ANNOTATION_WIDTH_MAX = 360;
export const ANNOTATION_HEIGHT_MIN = 40;
export const ANNOTATION_HEIGHT_MAX = 200;
export const ANNOTATION_HEIGHT_ESTIMATE = 40; // 批注高度估算值

// ==================== 分数框常量 ====================
export const SCORE_BOX_WIDTH = 60;

// ==================== 图片默认尺寸 ====================
export const DEFAULT_IMAGE_WIDTH = 4961;
export const DEFAULT_IMAGE_HEIGHT = 3509;

// ==================== 批注框测量和更新的时间常量 ====================
export const ANNOTATION_PADDING_VERTICAL = 12; // 上下 padding (6px * 2)
export const ANNOTATION_INIT_MEASURE_DELAY = 50; // 初始化测量延迟 (ms)
export const ANNOTATION_CONTENT_MEASURE_DELAY = 10; // 内容变化测量延迟 (ms)
export const ANNOTATION_RESIZE_SAVE_DELAY = 50; // 调整尺寸保存延迟 (ms)

// ==================== 缩放控制常量 ====================
export const CANVAS_ZOOM_MIN = 0.5;
export const CANVAS_ZOOM_MAX = 2;
export const CANVAS_ZOOM_STEP = 0.1;

// ==================== 工具函数 ====================

/**
 * 根据内容长度计算批注宽度
 * @param {string} content - 批注内容
 * @returns {number} 计算出的宽度
 */
export const calculateAnnotationWidth = (content) => {
  if (!content) return ANNOTATION_WIDTH_DEFAULT;
  const contentLength = content.length;
  
  if (contentLength <= 10) {
    return 80;   // 短文本：如 "5分"
  } else if (contentLength <= 30) {
    return 200;  // 中等文本
  } else if (contentLength <= 60) {
    return 300;  // 较长文本
  } else {
    return 400;  // 长文本
  }
};
