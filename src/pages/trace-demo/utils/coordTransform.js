/**
 * 坐标转换工具函数
 * 
 * 坐标系统说明：
 * - bbox: 相对答题卡左上角 (0,0) 的比例坐标，范围 [0,1]
 * - rtp: 相对题目bbox左上角的比例坐标，范围 [0,1]
 * - 像素坐标: 屏幕上的绝对像素位置
 */

/**
 * 限制值在指定范围内
 * @param {number} value - 要限制的值
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {number} 限制后的值
 */
export const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

/**
 * RTP坐标 → 整页比例坐标
 * @param {Object} rtp - 相对题目的位置 {x, y}
 * @param {Object} bbox - 题目在整页的位置 {x, y, width, height}
 * @returns {Object} 整页比例坐标 {x, y}
 */
export const rtpToPage = (rtp, bbox) => {
  return {
    x: bbox.x + rtp.x * bbox.width,
    y: bbox.y + rtp.y * bbox.height
  };
};

/**
 * 整页比例坐标 → RTP坐标
 * @param {Object} pagePos - 整页比例位置 {x, y}
 * @param {Object} bbox - 题目在整页的位置 {x, y, width, height}
 * @returns {Object} 相对题目的位置 {x, y}
 */
export const pageToRtp = (pagePos, bbox) => {
  if (bbox.width === 0 || bbox.height === 0) {
    return { x: 0.5, y: 0.5 }; // 兜底：返回中心点
  }
  
  return {
    x: clamp((pagePos.x - bbox.x) / bbox.width, 0, 1),
    y: clamp((pagePos.y - bbox.y) / bbox.height, 0, 1)
  };
};

/**
 * 整页比例坐标 → 像素坐标
 * @param {Object} pagePos - 整页比例位置 {x, y}
 * @param {Object} containerRect - 容器的像素矩形 {width, height}
 * @returns {Object} 像素坐标 {x, y}
 */
export const pageToPixel = (pagePos, containerRect) => {
  return {
    x: pagePos.x * containerRect.width,
    y: pagePos.y * containerRect.height
  };
};

/**
 * 像素坐标 → 整页比例坐标
 * @param {Object} pixelPos - 像素位置 {x, y}
 * @param {Object} containerRect - 容器的像素矩形 {width, height}
 * @returns {Object} 整页比例坐标 {x, y}
 */
export const pixelToPage = (pixelPos, containerRect) => {
  if (containerRect.width === 0 || containerRect.height === 0) {
    return { x: 0, y: 0 };
  }
  
  return {
    x: clamp(pixelPos.x / containerRect.width, 0, 1),
    y: clamp(pixelPos.y / containerRect.height, 0, 1)
  };
};

/**
 * RTP坐标 → 像素坐标（完整转换）
 * @param {Object} rtp - 相对题目的位置 {x, y}
 * @param {Object} bbox - 题目在整页的位置 {x, y, width, height}
 * @param {Object} containerRect - 容器的像素矩形 {left, top, width, height}
 * @returns {Object} 像素坐标 {x, y}
 */
export const rtpToPixel = (rtp, bbox, containerRect) => {
  const pagePos = rtpToPage(rtp, bbox);
  return pageToPixel(pagePos, containerRect);
};

/**
 * 像素坐标 → RTP坐标（完整转换）
 * @param {Object} pixelPos - 像素位置 {x, y}
 * @param {Object} bbox - 题目在整页的位置 {x, y, width, height}
 * @param {Object} containerRect - 容器的像素矩形 {left, top, width, height}
 * @returns {Object} 相对题目的位置 {x, y}
 */
export const pixelToRtp = (pixelPos, bbox, containerRect) => {
  const pagePos = pixelToPage(pixelPos, containerRect);
  return pageToRtp(pagePos, bbox);
};

/**
 * 计算批注文本框的像素位置
 * @param {Object} annotation - 批注对象 {currentPosition: {x, y}}
 * @param {Object} bbox - 题目在整页的位置
 * @param {Object} containerRect - 容器的像素矩形
 * @returns {Object} 像素坐标 {x, y}
 */
export const getAnnotationPixelPosition = (annotation, bbox, containerRect) => {
  return rtpToPixel(annotation.currentPosition, bbox, containerRect);
};
