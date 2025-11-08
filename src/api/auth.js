import request from "../utils/request";

/**
 * 认证相关API
 */

/**
 * 用户登录
 * @param {Object} credentials - 登录凭证
 * @param {string} credentials.username - 用户名
 * @param {string} credentials.password - 密码（已加密）
 * @returns {Promise} 返回Promise对象，包含用户信息和token
 */
export const login = (credentials) => {
  return request.post("/auth/login", credentials);
};

/**
 * 获取班级列表
 * @param {string} teacherId - 教师ID
 * @returns {Promise} 返回Promise对象，包含班级列表
 */
export const getClassList = (teacherId) => {
  return request.get("/teacher-class/class_list", { teacher_id: teacherId });
};

/**
 * 用户登出
 * @returns {Promise} 返回Promise对象
 */
export const logout = () => {
  return request.post("/auth/logout");
};

/**
 * 刷新token
 * @param {string} refreshToken - 刷新token
 * @returns {Promise} 返回Promise对象，包含新的token
 */
export const refreshToken = (refreshToken) => {
  return request.post("/auth/refresh", { refresh_token: refreshToken });
};

/**
 * 获取用户信息
 * @returns {Promise} 返回Promise对象，包含用户详细信息
 */
export const getUserInfo = () => {
  return request.get("/auth/user-info");
};

export default {
  login,
  getClassList,
  logout,
  refreshToken,
  getUserInfo,
};

