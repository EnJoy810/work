import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card, Modal, Form, Input, Space, Typography, Avatar, Empty, Pagination } from "antd";
import { LikeOutlined, DeleteOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";
import "./Forum.css";
import { useSelector } from "react-redux";
import {
  getPostsPage,
  getPostCount,
  createPost,
  likePost,
  deletePost,
  getCommentList,
  createComment,
  deleteComment,
  likeComment,
} from "../../api/communication";

const { Text } = Typography;

const PAGE_SIZE = 10;

const Forum = () => {
  const userInfo = useSelector((s) => s.user.userInfo);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [postOpen, setPostOpen] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [currentPostId, setCurrentPostId] = useState(null);
  const [comments, setComments] = useState({});
  const [expandedPosts, setExpandedPosts] = useState(new Set());
  const [replyTarget, setReplyTarget] = useState(null); 
  const [form] = Form.useForm();
  const [commentForm] = Form.useForm();

  // 超级管理员账号为 root（唯一）或角色为 ADMIN
  const isAdmin = useMemo(() => userInfo?.username === "root" || ["ADMIN", "ROOT", "SUPER_ADMIN"].includes(userInfo?.role), [userInfo]);
  const myUserId = userInfo?.userId;

  const formatTs = useCallback((d) => {
    const dt = d instanceof Date ? d : new Date(d);
    const pad = (n) => String(n).padStart(2, "0");
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`;
  }, []);

  const loadPage = useCallback(async (page) => {
    if (loading) return;
    setLoading(true);
    try {
      // 计算需要跳过的条数
      const skipCount = (page - 1) * PAGE_SIZE;
      
      // 获取从最新开始的所有数据直到当前页
      const res = await getPostsPage({ 
        pageSize: skipCount + PAGE_SIZE, 
        lastCreatedAt: formatTs(new Date()) 
      });
      const allData = res?.data || [];
      
      // 只取当前页的数据
      const pageData = allData.slice(skipCount, skipCount + PAGE_SIZE);
      setItems(pageData);
      
      // 获取总数
      const cnt = await getPostCount();
      setTotal(cnt?.data || 0);
    } finally {
      setLoading(false);
    }
  }, [formatTs, loading]);

  useEffect(() => {
    loadPage(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleCreate = async () => {
    const values = await form.validateFields();
    await createPost({ title: values.title, content: values.content, owner_id: myUserId });
    setPostOpen(false);
    form.resetFields();
    setCurrentPage(1);
    await loadPage(1);
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "确认删除该帖子？",
      onOk: async () => {
        await deletePost(id);
        // 删除后重新加载当前页
        await loadPage(currentPage);
      },
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleLike = async (postId) => {
    await likePost(postId);
    // 后端未提供点赞计数返回，暂不显示数值，若需刷新可调用 load(true)
  };

  const loadComments = async (postId) => {
    try {
      const res = await getCommentList({ post_id: postId });
      const list = res?.data || [];
      setComments((prev) => ({ ...prev, [postId]: list }));
    } catch (error) {
      console.error("获取评论失败:", error);
    }
  };

  const toggleComments = async (postId) => {
    const newExpanded = new Set(expandedPosts);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
      if (!comments[postId]) {
        await loadComments(postId);
      }
    }
    setExpandedPosts(newExpanded);
  };

  const handleCommentOpen = (postId, replyTo = null) => {
    setCurrentPostId(postId);
    setReplyTarget(replyTo); // { commentId, userId, userName } or null
    setCommentOpen(true);
  };

  const handleCommentCreate = async () => {
    const values = await commentForm.validateFields();
    
    const params = {
      content: values.content,
      owner_id: myUserId,
      post_id: currentPostId,
    };
    
    // 如果是回复评论（子级评论）
    if (replyTarget) {
      params.parent_comment_id = replyTarget.commentId;
      params.answer_id = replyTarget.userId;
      params.answer_name = replyTarget.userName;
    }
    
    await createComment(params);
    setCommentOpen(false);
    commentForm.resetFields();
    setReplyTarget(null);
    await loadComments(currentPostId);
  };

  const handleCommentDelete = async (commentId, postId) => {
    Modal.confirm({
      title: "确认删除该评论？",
      onOk: async () => {
        await deleteComment(commentId);
        await loadComments(postId);
      },
    });
  };

  const handleCommentLike = async (commentId) => {
    await likeComment(commentId);
  };


  return (
    <div className="forum-page">
      <Card className="forum-card">
        <div className="forum-header">
          <h2>论坛</h2>
          <span>共 {total} 条帖子</span>
        </div>

        <div className="forum-actions">
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setPostOpen(true)}>
            发帖
          </Button>
        </div>

        {items.length === 0 && !loading ? (
          <Empty description="暂无帖子，快来发布第一条吧！" />
        ) : (
          <>
            {items.map((item) => (
              <div key={item.id} className="forum-post-item">
                <div className="forum-post-title">{item.title}</div>
                <div className="forum-post-meta">
                  <Avatar size={20} icon={<UserOutlined />} />
                  <span>{item.owner_name || "匿名用户"}</span>
                  <span>·</span>
                  <span>{new Date(item.created_at).toLocaleString()}</span>
                </div>
                <div className="forum-post-content">{item.content}</div>
                <div className="forum-post-actions">
                  <div className="forum-action-btn" onClick={() => handleLike(item.id)}>
                    <LikeOutlined />
                    <span>点赞 ({item.like_count || 0})</span>
                  </div>
                  <div className="forum-action-btn" onClick={() => handleCommentOpen(item.id)}>
                    <span>评论</span>
                  </div>
                  <div className="forum-action-btn" onClick={() => toggleComments(item.id)}>
                    <span>{expandedPosts.has(item.id) ? "收起" : "查看"}评论 ({comments[item.id]?.length || 0})</span>
                  </div>
                  {(isAdmin || item.owner_id === myUserId) && (
                    <div className="forum-action-btn danger" onClick={() => handleDelete(item.id)}>
                      <DeleteOutlined />
                      <span>删除</span>
                    </div>
                  )}
                </div>
                {expandedPosts.has(item.id) && comments[item.id] && (
                  <div className="forum-comments-section">
                    {comments[item.id].length === 0 ? (
                      <div className="forum-no-comments">暂无评论</div>
                    ) : (
                      comments[item.id].map((comment) => (
                        <div key={comment.id} className="forum-comment-item">
                          <div className="forum-comment-meta">
                            <Avatar size={16} icon={<UserOutlined />} />
                            <span>{comment.owner_name || "匿名用户"}</span>
                            <span>·</span>
                            <span>{new Date(comment.created_at).toLocaleString()}</span>
                          </div>
                          <div className="forum-comment-content">{comment.content}</div>
                          <div className="forum-comment-actions">
                            <div className="forum-action-btn" onClick={() => handleCommentLike(comment.id)}>
                              <LikeOutlined />
                              <span>点赞 ({comment.like_count || 0})</span>
                            </div>
                            <div 
                              className="forum-action-btn" 
                              onClick={() => handleCommentOpen(item.id, {
                                commentId: comment.id,
                                userId: comment.owner_id,
                                userName: comment.owner_name || "匿名用户"
                              })}
                            >
                              <span>回复</span>
                            </div>
                            {(isAdmin || comment.owner_id === myUserId) && (
                              <div className="forum-action-btn danger" onClick={() => handleCommentDelete(comment.id, item.id)}>
                                <DeleteOutlined />
                                <span>删除</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}

            <div className="forum-pagination">
              <Pagination
                current={currentPage}
                total={total}
                pageSize={PAGE_SIZE}
                onChange={handlePageChange}
                showSizeChanger={false}
                showTotal={(total) => `共 ${total} 条`}
              />
            </div>
          </>
        )}
      </Card>

      <Modal
        title="发布帖子"
        open={postOpen}
        onCancel={() => setPostOpen(false)}
        onOk={handleCreate}
        okText="发布"
        cancelText="取消"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true, message: "请输入标题" }]}>
            <Input maxLength={100} showCount />
          </Form.Item>
          <Form.Item name="content" label="内容" rules={[{ required: true, message: "请输入内容" }]}>
            <Input.TextArea rows={6} maxLength={2000} showCount />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={replyTarget ? `回复 @${replyTarget.userName}` : "发表评论"}
        open={commentOpen}
        onCancel={() => {
          setCommentOpen(false);
          commentForm.resetFields();
          setReplyTarget(null);
        }}
        onOk={handleCommentCreate}
        okText="发表"
        cancelText="取消"
        destroyOnClose
      >
        <Form form={commentForm} layout="vertical">
          <Form.Item name="content" label="评论内容" rules={[{ required: true, message: "请输入评论内容" }]}>
            <Input.TextArea 
              rows={4} 
              maxLength={500} 
              showCount 
              placeholder={replyTarget ? `回复 @${replyTarget.userName}` : "说点什么..."} 
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Forum;
