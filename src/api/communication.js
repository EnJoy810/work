import request from "../utils/request";
import { store } from "../store";

// Helper: headers containing X-User-Id for operations requiring user identity
const getUserHeaders = () => {
  const state = store.getState();
  const userId = state?.user?.userInfo?.userId;
  return userId ? { "X-User-Id": userId } : {};
};

const getOwnerName = () => {
  const state = store.getState();
  const ui = state?.user?.userInfo || {};
  return ui.real_name || ui.realName || ui.name || ui.username || "";
};

const getCreatorType = () => {
  const state = store.getState();
  const ui = state?.user?.userInfo || {};
  return ui.role || "";
};

// Posts
export const getPostsPage = ({ pageSize, lastCreatedAt }) => {
  return request.get("/post/page", {
    page_size: pageSize,
    last_created_at: lastCreatedAt,
  });
};

export const getPostCount = () => {
  return request.get("/post/count");
};

/**
 * 创建帖子
 * @param {Object} params
 * @param {string} params.title - 帖子标题
 * @param {string} params.content - 帖子内容
 * @param {number} params.owner_id - 发帖者 ID
 * @param {string} [params.photo_urls] - 图片URL，多个用逗号分隔
 * @param {Array} [params.votes] - 投票配置数组
 */
export const createPost = ({ title, content, owner_id, photo_urls, votes }) => {
  const payload = {
    title,
    content,
    owner_id,
    owner_name: getOwnerName(),
    creator_type: getCreatorType(),
  };
  
  // 可选字段：图片
  if (photo_urls) {
    payload.photo_urls = photo_urls;
  }
  
  // 可选字段：投票
  if (votes && votes.length > 0) {
    payload.votes = votes;
  }
  
  return request.post("/post", payload);
};

export const deletePost = (id) => {
  return request.delete(
    "/post",
    { id },
    {
      headers: {
        ...getUserHeaders(),
      },
    }
  );
};

export const likePost = (post_id) => {
  return request.put(
    "/post/like",
    {},
    {
      headers: { ...getUserHeaders() },
      params: { post_id },
    }
  );
};

// Comments
export const getCommentList = ({ post_id, comment_id }) => {
  const params = {};
  if (post_id != null) params.post_id = post_id;
  if (comment_id != null) params.comment_id = comment_id;
  return request.get("/post/comment/list", params);
};

/**
 * 创建评论
 * @param {Object} params
 * @param {string} params.content - 评论内容
 * @param {number} params.owner_id - 评论者 ID
 * @param {number} params.post_id - 帖子 ID
 * @param {number} [params.parent_comment_id] - 父评论 ID（一级评论不传，子级评论必传）
 * @param {number} [params.answer_id] - 回复的用户 ID（一级评论不传，子级评论必传）
 * @param {string} [params.answer_name] - 回复的用户名（一级评论不传，子级评论必传）
 */
export const createComment = ({ content, owner_id, post_id, parent_comment_id, answer_id, answer_name }) => {
  const payload = {
    content,
    owner_id,
    owner_name: getOwnerName(),
    post_id,
    creator_type: getCreatorType(),
    sub_comment: !!parent_comment_id, // 有 parent_comment_id 就是子级评论
  };
  
  // 子级评论才需要这些字段
  if (parent_comment_id) {
    payload.parent_comment_id = parent_comment_id;
    payload.answer_id = answer_id;
    payload.answer_name = answer_name;
  }
  
  return request.post("/post/comment", payload);
};

export const deleteComment = (id) => {
  return request.delete(
    "/post/comment",
    { id },
    {
      headers: {
        ...getUserHeaders(),
      },
    }
  );
};

export const likeComment = (comment_id) => {
  return request.put(
    "/post/comment/like",
    {},
    {
      headers: { ...getUserHeaders() },
      params: { comment_id },
    }
  );
};

/**
 * 取消帖子点赞
 * @param {number} post_id - 帖子 ID
 * @param {number} user_id - 用户 ID
 */
export const unlikePost = (post_id, user_id) => {
  return request.delete("/post/unlike", {}, {
    data: { post_id, user_id },
  });
};

/**
 * 取消评论点赞
 * @param {number} comment_id - 评论 ID
 * @param {number} user_id - 用户 ID
 */
export const unlikeComment = (comment_id, user_id) => {
  return request.delete("/post/comment/unlike", {}, {
    data: { comment_id, user_id },
  });
};

// 投票相关

/**
 * 投票
 * @param {Object} params
 * @param {number} params.vote_id - 投票 ID
 * @param {number} params.user_id - 用户 ID
 * @param {number} params.option - 选择的选项索引
 */
export const vote = ({ vote_id, user_id, option }) => {
  return request.post("/post/vote", {
    vote_id,
    user_id,
    option,
  });
};

/**
 * 获取投票结果
 * @param {number} post_id - 帖子 ID
 */
export const getVoteResult = (post_id) => {
  return request.get("/post/vote-result", { post_id });
};

// 管理员相关

/**
 * 审核帖子（仅管理员）
 * @param {number} post_id - 帖子 ID
 * @param {number} status - 审核状态
 */
export const reviewPost = (post_id, status) => {
  return request.put("/post/root/review", {
    post_id,
    status,
  });
};

/**
 * 获取待审核帖子列表（仅管理员）
 * @param {Object} params
 * @param {number} params.pageSize - 分页大小
 * @param {string} params.lastCreatedAt - 上一页最后一条的创建时间
 */
export const getReviewPostsPage = ({ pageSize, lastCreatedAt }) => {
  return request.get("/post/root/review/page", {
    page_size: pageSize,
    last_created_at: lastCreatedAt,
  });
};

/**
 * 获取我的帖子列表
 * @param {Object} params
 * @param {number} params.pageSize - 分页大小
 * @param {string} params.lastCreatedAt - 上一页最后一条的创建时间
 */
export const getMyPostsPage = ({ pageSize, lastCreatedAt }) => {
  return request.get("/post/page/myself", {
    page_size: pageSize,
    last_created_at: lastCreatedAt,
  });
};

export default {
  getPostsPage,
  getPostCount,
  createPost,
  deletePost,
  likePost,
  unlikePost,
  getCommentList,
  createComment,
  deleteComment,
  likeComment,
  unlikeComment,
  vote,
  getVoteResult,
  reviewPost,
  getReviewPostsPage,
  getMyPostsPage,
};
