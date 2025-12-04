/**
 * 更新日志相关 API
 */
import request from '../utils/request';
import { store } from '../store';

// Helper: 获取用户头部信息
const getUserHeaders = () => {
  const state = store.getState();
  const userId = state?.user?.userInfo?.userId;
  return userId ? { "X-User-Id": userId } : {};
};

// Helper: 获取所有者名称
const getOwnerName = () => {
  const state = store.getState();
  const ui = state?.user?.userInfo || {};
  return ui.real_name || ui.realName || ui.name || ui.username || "";
};

// Helper: 获取创建者类型
const getCreatorType = () => {
  const state = store.getState();
  const ui = state?.user?.userInfo || {};
  return ui.role || "";
};

/**
 * 超级管理员更新日志
 * @param {Object} data - 更新日志数据
 * @param {number} data.id - 日志ID
 * @param {string} data.content - 日志内容
 * @param {number} data.ownerId - 所有者ID
 * @param {string} data.ownerName - 所有者名称
 * @param {string} data.creatorType - 创建者类型
 * @param {string} data.videoUrl - 视频URL（可选）
 * @param {string} data.createdAt - 创建时间
 * @returns {Promise}
 */
export const updateLog = (data) => {
  return request.put('/update-log', data);
};

/**
 * 保存更新日志（创建新日志）
 * @param {Object} data - 更新日志数据
 * @param {string} data.title - 日志标题（可选）
 * @param {string} data.content - 日志内容
 * @param {number} data.owner_id - 所有者ID
 * @returns {Promise}
 */
export const createUpdateLog = ({ title, content, owner_id }) => {
  return request.post('/update-log', {
    title,
    content,
    owner_id,
    owner_name: getOwnerName(),
    creator_type: getCreatorType(),
  });
};

/**
 * 更新日志视频 URL
 * @param {Object} data - 视频数据
 * @param {number} data.id - 日志 ID
 * @param {string} data.videoUrl - 视频 URL
 * @returns {Promise}
 */
export const updateVideo = ({ id, videoUrl }) => {
  return request.put('/update-log/video', { id, videoUrl });
};

/**
 * 删除更新日志
 * @param {number} id - 日志ID
 * @returns {Promise}
 */
export const deleteUpdateLog = (id) => {
  return request.delete(
    '/update-log',
    { id },
    {
      headers: {
        ...getUserHeaders(),
      },
    }
  );
};

/**
 * 分页获取更新日志
 * @param {Object} params
 * @param {number} params.pageSize - 分页大小
 * @param {string} params.lastCreatedAt - 上一页最后一个日志的创建时间，如果是第一页就传当前时间
 * @returns {Promise}
 */
export const getUpdateLogsPage = ({ pageSize, lastCreatedAt }) => {
  return request.get('/update-log/page', {
    page_size: pageSize,
    last_created_at: lastCreatedAt,
  });
};

/**
 * 获取更新日志数目
 * @returns {Promise}
 */
export const getUpdateLogCount = () => {
  return request.get('/update-log/count');
};

/**
 * 获取更新日志元数据（版本号、更新时间）
 * @returns {Promise} 返回 { id, version, update_time }
 */
export const getUpdateLogMeta = () => {
  return request.get('/update-log/meta');
};

/**
 * 更新日志元数据（仅管理员）
 * @param {Object} data - 元数据
 * @param {number} data.id - 元数据 ID（必传，用于定位记录）
 * @param {string} data.version - 版本号
 * @returns {Promise}
 */
export const updateUpdateLogMeta = ({ id, version }) => {
  return request.post('/update-log/meta/root', { id, version });
};
