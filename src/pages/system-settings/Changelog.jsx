import React, { useEffect, useState } from "react";
import { Button, Card, Modal, Form, Input, Space, Typography, Empty, Pagination } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getUpdateLogsPage, getUpdateLogCount, createUpdateLog, deleteUpdateLog } from "../../api/communication";
import { APP_VERSION, BUILD_TIME } from "../../utils/appConfig";
import "./Changelog.css";

const { Title, Text } = Typography;

const Changelog = () => {
  const userInfo = useSelector((s) => s.user.userInfo);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const isAdmin = userInfo?.role === "ADMIN";
  const myUserId = userInfo?.userId;

  const PAGE_SIZE = 10;

  const pad = (n) => String(n).padStart(2, "0");
  const formatTs = (d) => {
    const dt = d instanceof Date ? d : new Date(d);
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`;
  };

  const loadPage = async (page) => {
    if (loading) return;
    setLoading(true);
    try {
      // 计算需要跳过的条数
      const skipCount = (page - 1) * PAGE_SIZE;
      
      // 获取从最新开始的所有数据直到当前页
      const res = await getUpdateLogsPage({ 
        pageSize: skipCount + PAGE_SIZE, 
        lastCreatedAt: formatTs(new Date()) 
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
    await createUpdateLog({ title: values.title, content: values.content, owner_id: myUserId });
    setOpen(false);
    form.resetFields();
    setCurrentPage(1);
    await loadPage(1);
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
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
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
          <Form.Item name="content" label="内容" rules={[{ required: true, message: "请输入内容" }]}>
            <Input.TextArea rows={6} maxLength={2000} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Changelog;
