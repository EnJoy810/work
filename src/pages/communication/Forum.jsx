import React, { useCallback, useEffect, useState, useRef } from "react";
import "../../styles/tailwind-utilities.css";
import { Modal, Form, Input, Pagination, Button } from "antd";
import { Plus, FileText, Image as ImageIcon, BarChart2, X } from "lucide-react";
import { useSelector } from "react-redux";
import {
  getPostsPage,
  getPostCount,
  createPost,
  likePost,
  unlikePost,
  deletePost,
  getCommentList,
} from "../../api/communication";
import ForumPost from "./components/ForumPost";

const PAGE_SIZE = 10;

const Forum = () => {
  const userInfo = useSelector((s) => s.user.userInfo);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [postOpen, setPostOpen] = useState(false);
  const [comments, setComments] = useState({});
  const [form] = Form.useForm();
  const myUserId = userInfo?.userId;
  
  // 发帖图片和投票状态
  const [postImages, setPostImages] = useState([]);
  const [showPoll, setShowPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState(['', '']);
  const fileInputRef = useRef(null);

  const formatTs = useCallback((d) => {
    const dt = d instanceof Date ? d : new Date(d);
    const pad = (n) => String(n).padStart(2, "0");
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`;
  }, []);

  const loadPage = useCallback(async (page, force = false) => {
    if (loading && !force) return;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formatTs]);

  useEffect(() => {
    loadPage(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // 图片选择处理
  const handleImageSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files).map(file => URL.createObjectURL(file));
      setPostImages(prev => [...prev, ...newImages].slice(0, 9));
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removePostImage = (index) => {
    setPostImages(prev => prev.filter((_, i) => i !== index));
  };

  // 投票选项处理
  const handlePollOptionChange = (index, value) => {
    setPollOptions(prev => {
      const newOptions = [...prev];
      newOptions[index] = value;
      return newOptions;
    });
  };

  const addPollOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions(prev => [...prev, '']);
    }
  };

  const removePollOption = (index) => {
    if (pollOptions.length > 2) {
      setPollOptions(prev => prev.filter((_, i) => i !== index));
    }
  };

  const resetPostForm = () => {
    form.resetFields();
    setPostImages([]);
    setShowPoll(false);
    setPollOptions(['', '']);
  };

  const handleCreate = async () => {
    const values = await form.validateFields();
    
    // 构建投票数据
    let poll = null;
    if (showPoll) {
      const validOptions = pollOptions.filter(opt => opt && opt.trim());
      console.log('Poll options:', pollOptions, 'Valid options:', validOptions);
      if (validOptions.length >= 2) {
        poll = {
          id: `poll-${Date.now()}`,
          title: values.pollTitle || '',
          options: validOptions.map((text, idx) => ({
            id: `opt-${idx}`,
            text: text.trim(),
            votes: 0
          })),
          totalVotes: 0,
          votedOptionId: null
        };
        console.log('Created poll:', poll);
      }
    }
    
    // 乐观更新：先在本地插入新帖子
    const optimisticPost = {
      id: Date.now(),
      title: values.title,
      content: values.content,
      images: postImages.length > 0 ? postImages : undefined,
      poll: poll,
      owner_id: myUserId,
      owner_name: userInfo?.username || '我',
      created_at: new Date().toISOString(),
      like_count: 0,
    };
    
    // 立即更新 UI
    setPostOpen(false);
    resetPostForm();
    
    // 如果不在第一页，先切换到第一页
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
    
    // 乐观更新
    setItems(prev => [optimisticPost, ...prev.slice(0, PAGE_SIZE - 1)]);
    setTotal(prev => prev + 1);
    
    // 后台发送请求
    try {
      const res = await createPost({ 
        title: values.title, 
        content: values.content, 
        owner_id: myUserId,
        images: postImages,
        poll: poll
      });
      
      // 如果后端返回了新帖子的 ID，更新本地数据的 ID
      if (res?.data?.id) {
        setItems(prev => prev.map(p => 
          p.id === optimisticPost.id 
            ? { ...p, id: res.data.id } 
            : p
        ));
      }
      // 不再自动刷新页面，保留乐观更新的数据（包括图片和投票）
    } catch (error) {
      // 如果失败，回滚乐观更新
      console.error('发布失败:', error);
      setItems(prev => prev.filter(p => p.id !== optimisticPost.id));
      setTotal(prev => prev - 1);
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "确认删除该帖子？",
      onOk: async () => {
        await deletePost(id);
        // 删除后重新加载当前页
        await loadPage(currentPage, true); // 强制刷新
      },
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleLike = async (postId, isLiked) => {
    try {
      if (isLiked) {
        // 取消点赞
        await unlikePost(postId, myUserId);
      } else {
        // 点赞
        await likePost(postId);
      }
    } catch (error) {
      console.error(isLiked ? '取消点赞失败:' : '点赞失败:', error);
    }
  };

  const loadComments = async (postId) => {
    if (comments[postId]) return; // 已加载过
    try {
      const res = await getCommentList({ post_id: postId });
      const list = res?.data || [];
      setComments((prev) => ({ ...prev, [postId]: list }));
    } catch (error) {
      console.error("获取评论失败:", error);
    }
  };


  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="text-sm text-gray-500">
              共 <span className="font-semibold text-brand-primary">{total}</span> 条帖子
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setPostOpen(true)}
              className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-hover text-white px-4 py-2 rounded shadow-sm transition-all font-medium text-sm"
            >
              <Plus size={16} />
              发布帖子
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 flex gap-6 items-start">
        {/* Left Column: Post List */}
        <div className="flex-1 min-w-0">
          {items.length === 0 && !loading ? (
            <div className="bg-white rounded-md shadow-sm border border-gray-100 p-12 text-center">
              <div className="text-6xl mb-4 opacity-50">📭</div>
              <p className="text-gray-400 text-lg">暂无帖子，快来发布第一条吧！</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {items.map((item) => (
                  <ForumPost
                    key={item.id}
                    post={item}
                    currentUser={userInfo}
                    onDelete={() => handleDelete(item.id)}
                    onLike={handleLike}
                    onLoadComments={loadComments}
                    comments={comments[item.id]}
                  />
                ))}
              </div>

              {total > PAGE_SIZE && (
                <div className="mt-8 flex justify-center">
                  <Pagination
                    current={currentPage}
                    total={total}
                    pageSize={PAGE_SIZE}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                    showTotal={(total) => `共 ${total} 条`}
                  />
                </div>
              )}
              
              {items.length > 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  <p>已经到底啦 ~</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Column: Sidebar */}
        <aside className="hidden lg:block w-80 shrink-0 space-y-6 sticky top-20">
          {/* User Card */}
          <div className="bg-white rounded-md shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded bg-brand-primary flex items-center justify-center text-white text-2xl font-bold mb-4">
                {userInfo?.username?.[0] || 'U'}
              </div>
              <h3 className="font-bold text-lg text-brand-text mb-1">{userInfo?.username || '未登录用户'}</h3>
              <p className="text-brand-text-secondary text-sm mb-6">{userInfo?.role || '普通用户'}</p>
              
              <div className="grid grid-cols-2 w-full border-t border-gray-100 pt-4 gap-4">
                <div className="flex flex-col">
                  <span className="font-bold text-brand-text text-lg">{total}</span>
                  <span className="text-xs text-brand-text-secondary">总帖子</span>
                </div>
                <div className="flex flex-col border-l border-gray-100">
                  <span className="font-bold text-brand-text text-lg">-</span>
                  <span className="text-xs text-brand-text-secondary">获赞数</span>
                </div>
              </div>
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-white rounded-md shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-50">
              <FileText size={18} className="text-brand-primary" />
              <h3 className="font-bold text-brand-text">社区规范</h3>
            </div>
            <ul className="space-y-3 text-sm text-brand-text-secondary">
              <li className="flex gap-2 items-start">
                <span className="text-brand-primary mt-1">•</span>
                <span>请保持理性和友善，共同维护良好的阅卷交流环境。</span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="text-brand-primary mt-1">•</span>
                <span>禁止发布与考试、阅卷工作无关的广告或垃圾信息。</span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="text-brand-primary mt-1">•</span>
                <span>遇到系统问题，请优先查看“更新日志”或联系管理员。</span>
              </li>
            </ul>
          </div>
          
          <div className="text-xs text-gray-400 text-center">
            © 2025 清境智能在线阅卷系统
          </div>
        </aside>
      </main>

      {/* 发帖弹窗 - 保留 Antd */}
      <Modal
        title="发布帖子"
        open={postOpen}
        onCancel={() => { setPostOpen(false); resetPostForm(); }}
        onOk={handleCreate}
        okText="发布"
        cancelText="取消"
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true, message: "请输入标题" }]}>
            <Input maxLength={100} showCount placeholder="给你的帖子起个标题" />
          </Form.Item>
          <Form.Item name="content" label="内容" rules={[{ required: true, message: "请输入内容" }]}>
            <Input.TextArea rows={6} maxLength={2000} showCount placeholder="分享你的想法..." />
          </Form.Item>

          {/* 图片预览 */}
          {postImages.length > 0 && (
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">已添加图片 ({postImages.length}/9)</div>
              <div className="flex flex-wrap gap-2">
                {postImages.map((src, idx) => (
                  <div key={idx} className="relative w-20 h-20 group">
                    <img src={src} alt="preview" className="w-full h-full object-cover rounded border border-gray-200" />
                    <button 
                      type="button"
                      onClick={() => removePostImage(idx)}
                      className="absolute -top-1.5 -right-1.5 bg-gray-800 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 投票选项 */}
          {showPoll && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">投票选项</span>
                <button type="button" onClick={() => setShowPoll(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              </div>
              <Form.Item name="pollTitle" className="mb-3">
                <Input placeholder="投票标题（可选）" maxLength={50} />
              </Form.Item>
              <div className="space-y-2">
                {pollOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input 
                      value={opt}
                      onChange={(e) => handlePollOptionChange(idx, e.target.value)}
                      placeholder={`选项 ${idx + 1}`}
                      maxLength={30}
                    />
                    {pollOptions.length > 2 && (
                      <button type="button" onClick={() => removePollOption(idx)} className="text-gray-400 hover:text-red-500">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {pollOptions.length < 6 && (
                <Button type="dashed" size="small" onClick={addPollOption} className="mt-2 w-full">
                  + 添加选项
                </Button>
              )}
            </div>
          )}

          {/* 工具栏 */}
          <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="flex items-center gap-1 text-gray-500 hover:text-brand-primary transition-colors text-sm"
            >
              <ImageIcon size={18} />
              <span>图片</span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              multiple
              onChange={handleImageSelect}
            />
            <button 
              type="button"
              onClick={() => setShowPoll(!showPoll)}
              className={`flex items-center gap-1 transition-colors text-sm ${showPoll ? 'text-brand-primary' : 'text-gray-500 hover:text-brand-primary'}`}
            >
              <BarChart2 size={18} />
              <span>投票</span>
            </button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Forum;
