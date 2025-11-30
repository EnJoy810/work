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
 * RTP 像素偏移 → 整页像素坐标
 * @param {Object} rtp - 相对题目的像素偏移 {x, y}
 * @param {Object} bbox - 题目在整页的位置 {x, y, width, height}
 * @returns {Object} 整页像素坐标 {x, y}
 */
export const rtpToPagePixel = (rtp, bbox) => {
  return {
    x: bbox.x + rtp.x,
    y: bbox.y + rtp.y
  };
};

/**
 * 整页像素坐标 → RTP 像素偏移
 * @param {Object} pagePixelPos - 整页像素位置 {x, y}
 * @param {Object} bbox - 题目在整页的位置 {x, y, width, height}
 * @returns {Object} 相对题目的像素偏移 {x, y}
 */
export const pagePixelToRtp = (pagePixelPos, bbox) => {
  return {
    x: pagePixelPos.x - bbox.x,
    y: pagePixelPos.y - bbox.y
  };
};

/**
 * 整页像素坐标 → 显示坐标
 * @param {Object} pagePixelPos - 整页像素位置 {x, y}
 * @param {Object} imageDimensions - 显示尺寸 {width, height}
 * @param {number} imageWidth - 原始图片宽度
 * @param {number} imageHeight - 原始图片高度
 * @returns {Object} 显示坐标 {x, y}
 */
export const pagePixelToDisplay = (pagePixelPos, imageDimensions, imageWidth, imageHeight) => {
  return {
    x: pagePixelPos.x * (imageDimensions.width / imageWidth),
    y: pagePixelPos.y * (imageDimensions.height / imageHeight)
  };
};

/**
 * 显示坐标 → 整页像素坐标
 * @param {Object} displayPos - 显示位置 {x, y}
 * @param {Object} imageDimensions - 显示尺寸 {width, height}
 * @param {number} imageWidth - 原始图片宽度
 * @param {number} imageHeight - 原始图片高度
 * @returns {Object} 整页像素坐标 {x, y}
 */
export const displayToPagePixel = (displayPos, imageDimensions, imageWidth, imageHeight) => {
  // 先转归一化坐标
  const normalizedPos = {
    x: displayPos.x / imageDimensions.width,
    y: displayPos.y / imageDimensions.height
  };
  
  // 再转整页像素坐标
  return {
    x: normalizedPos.x * imageWidth,
    y: normalizedPos.y * imageHeight
  };
};

/**
 * 计算缩放比例
 * @param {Object} imageDimensions - 显示尺寸 {width, height}
 * @param {number} imageWidth - 原始图片宽度
 * @param {number} imageHeight - 原始图片高度
 * @returns {Object} 缩放比例 {scaleX, scaleY}
 */
export const getScaleFactors = (imageDimensions, imageWidth, imageHeight) => {
  return {
    scaleX: imageDimensions.width / imageWidth,
    scaleY: imageDimensions.height / imageHeight
  };
};
