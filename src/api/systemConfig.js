import request from "../utils/request";

/**
 * 系统配置相关 API
 */

/**
 * 获取系统配置（版本号、更新时间等）
 * @returns {Promise} 返回 Promise 对象，包含系统配置信息
 */
export const getSystemConfig = () => {
  return request.get("/system/config");
};

/**
 * 更新系统配置（仅管理员）
 * @param {Object} data - 配置数据
 * @param {string} data.version - 版本号
 * @param {string} data.update_time - 更新时间
 * @returns {Promise} 返回 Promise 对象
 */
export const updateSystemConfig = (data) => {
  return request.post("/system/config/update", data);
};

export default {
  getSystemConfig,
  updateSystemConfig,
};
