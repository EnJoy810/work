import { useState, useEffect } from "react";
import { Modal, List, Button, Space, Typography, Empty, Spin } from "antd";
import { useMessageService } from "../../../components/common/message";
import request from "../../../utils/request";

const { Text } = Typography;

/**
 * 模板选择弹窗组件
 *
 * @param {Object} props
 * @param {boolean} props.visible - 控制弹窗显示/隐藏
 * @param {Function} props.onCancel - 关闭弹窗回调函数
 * @param {Function} props.onSelect - 选择模板后的回调函数
 */
const TemplateSelectionModal = ({ visible, onCancel, onSelect }) => {
  const { showInfo, showError } = useMessageService();

  // 模板数据
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 从API获取模板列表
  useEffect(() => {
    const fetchTemplates = async () => {
      if (!visible) return; // 弹窗未显示时不获取数据

      setIsLoading(true);
      try {
        const response = await request.get(
          "/grading/answer-sheet-template/list",
          {
            limit: 50, // 限制获取的模板数量
          }
        );
        // 假设API返回的数据结构与组件需求一致
        setTemplates(response.data || []);
      } catch (error) {
        console.error("获取模板列表失败:", error);
        showError("获取模板列表失败，请稍后重试");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, [visible, showError]);

  // 处理选择模板
  const handleSelectTemplate = (template) => {
    if (onSelect) {
      onSelect(template);
    }
    // showInfo(`已选择模板：${template.name}`);
  };

  // 处理删除模板
  const handleDeleteTemplate = (template) => {
    Modal.confirm({
      title: "确认删除",
      content: `确定要删除模板 "${template.name}" 吗？`,
      okText: "确认",
      cancelText: "取消",
      onOk: () => {
        // 调用删除模板的API
        request
          .delete(`/grading/answer-sheet-template/${template.id}`)
          .then(() => {
            // API调用成功后，从模板列表中移除该模板
            setTemplates((prevTemplates) =>
              prevTemplates.filter((t) => t.id !== template.id)
            );
            showInfo(`模板 "${template.name}" 已删除`);
          })
          .catch((error) => {
            showError(`删除模板失败：${error.message || '未知错误'}`);
          });
      },
    });
  };

  return (
    <Modal
      title="选择模板"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <div
        style={{
          marginTop: "20px",
          padding: "12px",
          backgroundColor: "#f5f5f5",
          borderRadius: "4px",
        }}
      >
        <Text type="secondary" style={{ fontSize: "12px" }}>
          提示：选择模板后，当前试卷将应用模板的布局和配置，覆盖已有的题目内容。
        </Text>
      </div>
      {isLoading ? (
        <div style={{ padding: "60px 0", textAlign: "center" }}>
          <Spin tip="加载模板中..." />
        </div>
      ) : templates.length === 0 ? (
        <Empty description="暂无可用模板" style={{ padding: "40px 0" }} />
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={templates}
          renderItem={(template) => (
            <List.Item
              actions={[
                <Button
                  type="primary"
                  key="select"
                  size="small"
                  onClick={() => handleSelectTemplate(template)}
                >
                  选择
                </Button>,
                <Button
                  danger
                  key="delete"
                  size="small"
                  onClick={() => handleDeleteTemplate(template)}
                >
                  删除
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={<Text strong>{template.name}</Text>}
                description={
                  <div>
                    <p style={{ color: "#888", fontSize: "12px" }}>
                      创建时间：
                      {template.createTime}
                    </p>
                  </div>
                }
              />
            </List.Item>
          )}
          style={{
            maxHeight: "50vh",
            overflowY: "auto",
            margin: "16px 0",
          }}
        />
      )}
    </Modal>
  );
};

export default TemplateSelectionModal;
