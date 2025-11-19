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

export const createPost = ({ title, content, owner_id }) => {
  const payload = {
    id: 0,
    title,
    content,
    owner_id,
    owner_name: getOwnerName(),
    creator_type: getCreatorType(),
    like_count: 0,
  };
  // remove zero-value numeric fields per backend requirement
  if (payload.id === 0) delete payload.id;
  if (payload.like_count === 0) delete payload.like_count;
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

export const createComment = ({ content, owner_id, post_id, parent_comment_id }) => {
  return request.post("/post/comment", {
    content,
    owner_id,
    post_id,
    parent_comment_id: parent_comment_id ?? null,
  });
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

// Update Logs
export const getUpdateLogsPage = ({ pageSize, lastCreatedAt }) => {
  return request.get("/update-log/page", {
    page_size: pageSize,
    last_created_at: lastCreatedAt,
  });
};

export const getUpdateLogCount = () => {
  return request.get("/update-log/count");
};

export const createUpdateLog = ({ title, content, owner_id }) => {
  return request.post("/update-log", { title, content, owner_id });
};

export const deleteUpdateLog = (id) => {
  return request.delete(
    "/update-log",
    { id },
    {
      headers: {
        ...getUserHeaders(),
      },
    }
  );
};

export default {
  getPostsPage,
  getPostCount,
  createPost,
  deletePost,
  likePost,
  getCommentList,
  createComment,
  deleteComment,
  likeComment,
  getUpdateLogsPage,
  getUpdateLogCount,
  createUpdateLog,
  deleteUpdateLog,
};
