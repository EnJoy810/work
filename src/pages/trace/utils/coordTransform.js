/**
 * 坐标转换工具函数
 * 
 * 坐标系统说明：
 * - bbox: 像素坐标，题目框在整张拼接图上的位置，例如 {x: 263, y: 1357, width: 266, height: 45}
 * - rtp: 像素坐标，批注相对题目框左上角的偏移，例如 {x: 60, y: 120}
 * - position: 像素坐标，批注在整张拼接图上的绝对位置 = bbox.x + rtp.x, bbox.y + rtp.y
 * - 显示坐标: 根据图片实际显示尺寸缩放后的屏幕像素位置
 * 
 * 示例：
 * - 图片原始尺寸: 4961 x 3509 像素
 * - 题目框: bbox = {x: 66, y: 1766, width: 2237, height: 459}
 * - 批注偏移: rtp = {x: 60, y: 120}
 * - 批注位置: position = {x: 66+60=126, y: 1766+120=1886}
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
 * @param {Object} rtp - 相对题目的像素偏移 {x, y}
 * @param {Object} bbox - 题目在整页的位置 {x, y, width, height}
 * @param {Object} containerRect - 容器的像素矩形 {width, height}（原始图片尺寸）
 * @returns {Object} 像素坐标 {x, y}
 */
export const rtpToPixel = (rtp, bbox, containerRect) => {
  // rtp 是像素偏移，直接加到 bbox 得到整页像素坐标
  const pagePixelPos = {
    x: bbox.x + rtp.x,
    y: bbox.y + rtp.y
  };
  
  // 转换为归一化坐标（0-1）
  const normalizedPos = {
    x: pagePixelPos.x / containerRect.width,
    y: pagePixelPos.y / containerRect.height
  };
  
  // 归一化坐标会在 AnswerSheetCanvas 中再次缩放到显示尺寸
  return normalizedPos;
};

/**
 * 像素坐标 → RTP坐标（完整转换）
 * @param {Object} pixelPos - 归一化坐标 {x, y} (0-1)
 * @param {Object} bbox - 题目在整页的位置 {x, y, width, height}
 * @param {Object} containerRect - 容器的像素矩形 {width, height}（原始图片尺寸）
 * @returns {Object} 相对题目的像素偏移 {x, y}
 */
export const pixelToRtp = (pixelPos, bbox, containerRect) => {
  // 归一化坐标转整页像素坐标
  const pagePixelPos = {
    x: pixelPos.x * containerRect.width,
    y: pixelPos.y * containerRect.height
  };
  
  // 整页像素坐标转 rtp 像素偏移
  return {
    x: pagePixelPos.x - bbox.x,
    y: pagePixelPos.y - bbox.y
  };
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
