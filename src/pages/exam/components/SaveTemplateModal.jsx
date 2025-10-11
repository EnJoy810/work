import React, { useEffect } from "react";
import { Modal, Input, Form } from "antd";
import { useMessageService } from "../../../components/common/message";

/**
 * 保存模板弹窗组件
 *
 * @param {Object} props
 * @param {boolean} props.visible - 控制弹窗显示/隐藏
 * @param {Function} props.onCancel - 关闭弹窗回调函数
 * @param {Function} props.onSuccess - 保存成功后的回调函数
 * @param {Array} props.questions - 当前试卷中的题目列表
 */
const SaveTemplateModal = ({ visible, onCancel, onSuccess, questions = [] }) => {
  const { showInfo } = useMessageService();
  const [form] = Form.useForm();

  // 重置表单
  const resetForm = () => {
    form.resetFields();
  };

  // 当弹窗显示时，重置表单
  useEffect(() => {
    if (visible) {
      resetForm();
    }
  }, [visible]);

  // 处理表单提交
  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const templateName = values.templateName.trim();
      
      if (!templateName) {
        showInfo('请输入模板名称');
        return;
      }

      if (questions.length === 0) {
        showInfo('当前试卷中没有题目，无法保存为模板');
        return;
      }
      

      // 调用成功回调
      if (onSuccess) {
        onSuccess(templateName);
      }
      
      // 重置表单
      resetForm();
    }).catch(() => {
      showInfo("请填写完整信息");
    });
  };

  return (
    <Modal
      title="保存为模板"
      open={visible}
      onOk={handleSubmit}
      onCancel={() => {
        resetForm();
        if (onCancel) {
          onCancel();
        }
      }}
      okText="保存"
      cancelText="取消"
      width={400}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="templateName"
          label="模板名称"
          rules={[{ required: true, message: '请输入模板名称' }]}
        >
          <Input placeholder="请输入模板名称" />
        </Form.Item>
        
        <div style={{ color: '#666', fontSize: '14px' }}>
          <p>注意事项：</p>
          <p>1. 模板将包含当前试卷中的所有题目</p>
          <p>2. 请确保已添加题目后再保存模板</p>
        </div>
      </Form>
    </Modal>
  );
};

export default SaveTemplateModal;