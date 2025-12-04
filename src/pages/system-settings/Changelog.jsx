import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Space, Empty, Pagination, Upload, message as antMessage } from "antd";
import { Plus, Trash2, Clock, Bell, Lightbulb, HelpCircle, MessageCircle } from "lucide-react";
import { VideoCameraOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { getUpdateLogsPage, getUpdateLogCount, createUpdateLog, deleteUpdateLog, updateVideo } from "../../api/updateLog";
import { APP_VERSION, BUILD_TIME } from "../../utils/appConfig";
import { uploadVideo, validateVideoDuration } from "../../services/videoUpload";
import "./Changelog.css";

// 微信图标
const WechatIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/>
  </svg>
);

// 自定义视频组件（直接返回 video 元素，避免 p > div 的 DOM 嵌套警告）
const VideoComponent = ({ src, ...props }) => {
  // 处理视频 URL：支持 OSS URL 和相对路径
  const getVideoUrl = (url) => {
    if (!url) return '';
    
    // 如果已经是完整 URL（OSS 或其他），直接返回
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // 如果是相对路径，可能是旧数据或后端返回的路径
    // 尝试通过代理访问（需要配置 vite proxy）
    const serverUrl = window.location.origin;
    const path = url.startsWith('/') ? url : `/${url}`;
    
    return `${serverUrl}${path}`;
  };

  const videoUrl = getVideoUrl(src);

  return (
    <video 
      src={videoUrl} 
      controls 
      preload="metadata"
      controlsList="nodownload"
      className="markdown-video"
      {...props}
    >
      您的浏览器不支持视频播放。
    </video>
  );
};

const Changelog = () => {
  const userInfo = useSelector((s) => s.user.userInfo);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [videoUrl, setVideoUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  // 超级管理员账号为 root（唯一）或角色为 ADMIN
  const isAdmin = userInfo?.username === "root" || ["ADMIN", "ROOT", "SUPER_ADMIN"].includes(userInfo?.role);
  const myUserId = userInfo?.userId;

  const PAGE_SIZE = 10;

  const pad = (n) => String(n).padStart(2, "0");
  const formatTs = (d) => {
    const dt = d instanceof Date ? d : new Date(d);
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`;
  };

  const loadPage = async (page, force = false) => {
    if (loading && !force) return;
    setLoading(true);
    try {
      // 计算需要跳过的条数
      const skipCount = (page - 1) * PAGE_SIZE;
      
      // 获取从最新开始的所有数据直到当前页
      // 加 1 分钟余量，确保能查到刚创建的日志
      const futureTime = new Date(Date.now() + 60 * 1000);
      const res = await getUpdateLogsPage({ 
        pageSize: skipCount + PAGE_SIZE, 
        lastCreatedAt: formatTs(futureTime) 
      });
      const allData = res?.data || [];
      
      // 只取当前页的数据
      const pageData = allData.slice(skipCount, skipCount + PAGE_SIZE);
      setItems(pageData);
      
      // 获取总数
      const cnt = await getUpdateLogCount();
      setTotal(cnt?.data || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleCreate = async () => {
    const values = await form.validateFields();
    
    // 1. 创建更新日志
    const res = await createUpdateLog({ 
      title: values.title, 
      content: values.content, 
      owner_id: myUserId 
    });
    
    // 2. 如果有视频 URL，调用 video 接口更新
    if (videoUrl && res?.data?.id) {
      await updateVideo({ id: res.data.id, videoUrl });
    }
    
    setOpen(false);
    form.resetFields();
    setVideoUrl("");
    setCurrentPage(1);
    await loadPage(1, true);
  };

  const handleVideoUpload = async (file) => {
    // 验证文件类型
    if (file.type !== 'video/mp4') {
      antMessage.error('只支持 MP4 格式的视频！');
      return false;
    }

    // 验证文件大小（100MB）
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      antMessage.error('视频大小不能超过 100MB！');
      return false;
    }

    setUploading(true);
    const hideLoading = antMessage.loading('正在上传视频...', 0);
    
    try {
      // 验证视频时长（可选）
      try {
        await validateVideoDuration(file, 300); // 5分钟
      } catch (durationError) {
        antMessage.warning(durationError.message);
        // 继续上传，只是警告
      }

      // 上传到 OSS
      const url = await uploadVideo(file, myUserId);
      setVideoUrl(url);
      
      // 自动插入视频到内容中
      const currentContent = form.getFieldValue('content') || '';
      const videoTag = `\n\n<video src="${url}" controls width="100%"></video>\n\n`;
      form.setFieldsValue({ content: currentContent + videoTag });
      
      antMessage.success('视频上传成功并已插入到内容中！');
    } catch (error) {
      console.error('视频上传失败:', error);
      antMessage.error(error.message || '视频上传失败，请重试');
    } finally {
      hideLoading();
      setUploading(false);
    }
    return false; // 阻止默认上传行为
  };


  const handleDelete = async (id) => {
    Modal.confirm({
      title: "确认删除该更新日志？",
      onOk: async () => {
        await deleteUpdateLog(id);
        // 删除后重新加载当前页
        await loadPage(currentPage);
      },
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-lg font-semibold text-gray-800">更新日志</h1>
            <div className="text-sm text-gray-500">
              共 <span className="font-semibold text-brand-primary">{total}</span> 条
            </div>
          </div>
          
          {isAdmin && (
            <button 
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-hover text-white px-4 py-2 rounded shadow-sm transition-all font-medium text-sm"
            >
              <Plus size={16} />
              新建日志
            </button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 flex gap-6 items-start">
        {/* Left Column: Log List */}
        <div className="flex-1 min-w-0">
          {items.length === 0 && !loading ? (
            <div className="bg-white rounded-md shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center"><Bell size={32} className="text-gray-300" /></div>
              <p className="text-gray-400 text-lg">暂无更新日志</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="bg-white rounded-md shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <h2 className="text-lg font-bold text-gray-800">{item.title}</h2>
                      {(isAdmin || item.owner_id === myUserId) && (
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          title="删除"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                      <Clock size={14} />
                      <span>{new Date(item.created_at).toLocaleString()}</span>
                    </div>
                    <div className="changelog-item-content markdown-content text-gray-600">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                          video: VideoComponent
                        }}
                      >
                        {item.content}
                      </ReactMarkdown>
                    </div>
                  </div>
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
          {/* Welcome Card */}
          <div className="bg-white rounded-md shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                <Bell size={24} className="text-brand-primary" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">系统公告</h3>
                <p className="text-sm text-gray-500">了解最新功能和改进</p>
              </div>
            </div>
            
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">当前版本</span>
                <span className="text-sm font-semibold text-brand-primary">{APP_VERSION}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">更新时间</span>
                <span className="text-sm text-gray-700">{new Date(BUILD_TIME).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">公告数量</span>
                <span className="text-sm text-gray-700">{total} 条</span>
              </div>
            </div>
          </div>

          {/* Tips Card */}
          <div className="bg-white rounded-md shadow-sm border border-gray-100 p-6">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Lightbulb size={16} className="text-brand-primary" />
              温馨提示
            </h4>
            <ul className="text-sm text-gray-500 space-y-2">
              <li className="flex gap-2 items-start">
                <span className="text-brand-primary mt-1">•</span>
                <span>这里会发布系统新功能介绍和使用技巧。</span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="text-brand-primary mt-1">•</span>
                <span>部分更新包含视频教程，点击即可播放。</span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="text-brand-primary mt-1">•</span>
                <span>如有疑问或建议，欢迎在论坛反馈。</span>
              </li>
            </ul>
          </div>

          {/* Contact Card */}
          <div className="bg-gradient-to-br from-brand-primary/5 to-brand-primary/10 rounded-md border border-brand-primary/20 p-6">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <HelpCircle size={16} className="text-brand-primary" />
              需要帮助？
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              遇到问题可以通过以下方式联系我们：
            </p>
            <div className="text-sm text-gray-600 space-y-2">
              {/* 微信公众号 - 悬停显示二维码 */}
              <div className="relative group inline-flex items-center gap-2 cursor-pointer">
                <WechatIcon />
                <span className="text-gray-600 group-hover:text-brand-primary transition-colors">微信公众号</span>
                {/* 二维码弹出层 */}
                <div className="absolute bottom-full left-0 mb-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="bg-white rounded-lg shadow-xl p-3 border border-gray-100">
                    <img src="/wechat-qrcode.jpg" alt="微信公众号二维码" className="w-24 h-24 object-contain rounded" />
                    <p className="text-xs text-gray-500 text-center mt-2">扫码关注公众号</p>
                  </div>
                  <div className="absolute left-4 -bottom-2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white"></div>
                </div>
              </div>
              <a href="/forum" className="flex items-center gap-2 hover:text-brand-primary transition-colors">
                <MessageCircle size={16} />
                <span>论坛：在线反馈</span>
              </a>
            </div>
          </div>
          
          <div className="text-xs text-gray-400 text-center">
            © 2025 清境智能在线阅卷系统
          </div>
        </aside>
      </main>

      <Modal
        title="新建更新日志"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleCreate}
        okText="保存"
        cancelText="取消"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true, message: "请输入标题" }]}>
            <Input maxLength={100} showCount />
          </Form.Item>
          
          <Form.Item label="视频上传（可选）">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Upload.Dragger
                accept="video/mp4"
                beforeUpload={handleVideoUpload}
                showUploadList={false}
                disabled={uploading}
              >
                <p className="ant-upload-drag-icon">
                  <VideoCameraOutlined />
                </p>
                <p className="ant-upload-text">点击或拖拽上传视频</p>
                <p className="ant-upload-hint">
                  仅支持 MP4 格式，最大 100MB，建议时长不超过 5 分钟
                </p>
              </Upload.Dragger>
              {videoUrl && (
                <video src={videoUrl} controls style={{ width: '100%', maxHeight: '200px', marginTop: 8 }} />
              )}
            </Space>
          </Form.Item>

          <Form.Item name="content" label="内容" rules={[{ required: true, message: "请输入内容" }]}>
            <Input.TextArea 
              rows={8} 
              maxLength={2000} 
              showCount 
              placeholder="支持 Markdown 格式。视频会自动插入到内容中。"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Changelog;
