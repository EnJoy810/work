import React, { useEffect, useState } from "react";
import { Button, Card, Modal, Form, Input, Space, Typography, Empty, Pagination, Upload, message as antMessage } from "antd";
import { PlusOutlined, DeleteOutlined, VideoCameraOutlined, InboxOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { getUpdateLogsPage, getUpdateLogCount, createUpdateLog, deleteUpdateLog, updateVideo } from "../../api/updateLog";
import { APP_VERSION, BUILD_TIME } from "../../utils/appConfig";
import { uploadVideo, validateVideoDuration } from "../../services/videoUpload";
import "./Changelog.css";

const { Title, Text } = Typography;

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
    <div className="changelog-page">
      <Card className="changelog-card">
        <div className="changelog-header">
          <h2>更新日志</h2>
          <div className="changelog-meta">
            <span>共 {total} 条</span>
            <span>版本 {APP_VERSION}</span>
            <span>构建时间 {new Date(BUILD_TIME).toLocaleString()}</span>
          </div>
        </div>

        {isAdmin && (
          <div className="changelog-actions">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>
              新建日志
            </Button>
          </div>
        )}

        {items.length === 0 && !loading ? (
          <Empty description="暂无更新日志" />
        ) : (
          <>
            {items.map((item) => (
              <div key={item.id} className="changelog-item">
                <div className="changelog-item-title">{item.title}</div>
                <div className="changelog-item-meta">
                  {new Date(item.created_at).toLocaleString()}
                </div>
                <div className="changelog-item-content markdown-content">
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
                {(isAdmin || item.owner_id === myUserId) && (
                  <div className="changelog-item-actions">
                    <Button
                      type="link"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(item.id)}
                    >
                      删除
                    </Button>
                  </div>
                )}
              </div>
            ))}

            <div className="changelog-pagination">
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
