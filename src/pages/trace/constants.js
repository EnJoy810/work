// ==================== 批注缩放常量 ====================
export const ANNOTATION_SCALE_MIN = 0.7;
export const ANNOTATION_SCALE_MAX = 1.6;
export const ANNOTATION_SCALE_DEFAULT = 1;
export const ANNOTATION_SCALE_STEP = 0.05;
export const ANNOTATION_SCALE_FAST_STEP = 0.1;

// ==================== 批注尺寸常量 ====================
export const ANNOTATION_WIDTH_DEFAULT = 160;
export const ANNOTATION_HEIGHT_DEFAULT = 60;
export const ANNOTATION_WIDTH_MIN = 80;
export const ANNOTATION_WIDTH_MAX = 360;
export const ANNOTATION_HEIGHT_MIN = 40;
export const ANNOTATION_HEIGHT_MAX = 200;
export const ANNOTATION_HEIGHT_ESTIMATE = 40; // 批注高度估算值

// ==================== 分数框常量 ====================
export const SCORE_BOX_WIDTH = 60;
export const SCORE_BOX_HEIGHT = 30;

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
 * 限制批注缩放值在有效范围内
 */
export const clampAnnotationScale = (value) => {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return ANNOTATION_SCALE_DEFAULT;
  }
  const clamped = Math.min(Math.max(numeric, ANNOTATION_SCALE_MIN), ANNOTATION_SCALE_MAX);
  return Number(clamped.toFixed(2));
};

/**
 * 限制批注尺寸在有效范围内
 */
export const clampAnnotationSize = ({ width, height }) => {
  const nextWidth = Number.isFinite(width) ? width : ANNOTATION_WIDTH_DEFAULT;
  const nextHeight = Number.isFinite(height) ? height : ANNOTATION_HEIGHT_DEFAULT;

  return {
    width: Math.min(Math.max(nextWidth, ANNOTATION_WIDTH_MIN), ANNOTATION_WIDTH_MAX),
    height: Math.min(Math.max(nextHeight, ANNOTATION_HEIGHT_MIN), ANNOTATION_HEIGHT_MAX)
  };
};

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

/**
 * 限制位置在图片边界内
 * @param {Object} position - 位置 {x, y}
 * @param {number} width - 批注宽度
 * @param {number} height - 批注高度
 * @param {number} imageWidth - 图片宽度
 * @param {number} imageHeight - 图片高度
 * @returns {Object} 限制后的位置
 */
export const clampPositionInBounds = (position, width, height, imageWidth, imageHeight) => {
  return {
    x: Math.max(width / 2, Math.min(position.x, imageWidth - width / 2)),
    y: Math.max(height / 2, Math.min(position.y, imageHeight - height / 2))
  };
};
