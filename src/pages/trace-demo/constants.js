export const ANNOTATION_SCALE_MIN = 0.7;
export const ANNOTATION_SCALE_MAX = 1.6;
export const ANNOTATION_SCALE_DEFAULT = 1;
export const ANNOTATION_SCALE_STEP = 0.05;
export const ANNOTATION_SCALE_FAST_STEP = 0.1;

export const ANNOTATION_WIDTH_DEFAULT = 160;
export const ANNOTATION_HEIGHT_DEFAULT = 60;
export const ANNOTATION_WIDTH_MIN = 80;
export const ANNOTATION_WIDTH_MAX = 360;
export const ANNOTATION_HEIGHT_MIN = 40;
export const ANNOTATION_HEIGHT_MAX = 200;

// 批注框测量和更新的时间常量
export const ANNOTATION_PADDING_VERTICAL = 12; // 上下 padding (6px * 2)
export const ANNOTATION_INIT_MEASURE_DELAY = 50; // 初始化测量延迟 (ms)
export const ANNOTATION_CONTENT_MEASURE_DELAY = 10; // 内容变化测量延迟 (ms)
export const ANNOTATION_RESIZE_SAVE_DELAY = 50; // 调整尺寸保存延迟 (ms)

export const clampAnnotationScale = (value) => {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return ANNOTATION_SCALE_DEFAULT;
  }
  const clamped = Math.min(Math.max(numeric, ANNOTATION_SCALE_MIN), ANNOTATION_SCALE_MAX);
  return Number(clamped.toFixed(2));
};

export const clampAnnotationSize = ({ width, height }) => {
  const nextWidth = Number.isFinite(width) ? width : ANNOTATION_WIDTH_DEFAULT;
  const nextHeight = Number.isFinite(height) ? height : ANNOTATION_HEIGHT_DEFAULT;

  return {
    width: Math.min(Math.max(nextWidth, ANNOTATION_WIDTH_MIN), ANNOTATION_WIDTH_MAX),
    height: Math.min(Math.max(nextHeight, ANNOTATION_HEIGHT_MIN), ANNOTATION_HEIGHT_MAX)
  };
};
