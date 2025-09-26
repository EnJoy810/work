import React, { useEffect } from "react";
import { Modal, Input, Button, Form, InputNumber, Select } from "antd";
import { useMessageService } from "../../../components/common/message";
import { generateSectionId } from "../../../utils/tools";

/**
 * 作文题添加/编辑弹窗组件
 *
 * @param {Object} props
 * @param {boolean} props.visible - 控制弹窗显示/隐藏
 * @param {Function} props.onCancel - 关闭弹窗回调函数
 * @param {Function} props.onSuccess - 添加/编辑成功后的回调函数
 * @param {Object} props.initialData - 编辑模式下的初始数据
 */
const WordQuestionModal = ({ visible, onCancel, onSuccess, initialData }) => {
  const { showSuccess, showInfo } = useMessageService();
  const [form] = Form.useForm();
  
  // 判断当前是添加模式还是编辑模式
  const isEditMode = initialData != null;

  // 重置表单
  const resetForm = () => {
    form.resetFields();
  };

  // 当弹窗显示时，根据是否有初始数据设置表单值
  useEffect(() => {
    if (visible) {
      if (isEditMode) {
        // 编辑模式下，回填数据
        form.setFieldsValue({
          questionNumber: initialData.questionNumber || "一",
          score: initialData.score || 30,
          minWordCount: initialData.minWordCount || 800,
          totalWordCount: initialData.totalWordCount || 1000
        });
      } else {
        // 添加模式下，设置默认值
        form.setFieldsValue({
          questionNumber: "一",
          score: 30,
          minWordCount: 800,
          totalWordCount: 1000
        });
      }
    }
  }, [visible, isEditMode, initialData]);

  // 处理表单提交
  const handleSubmit = () => {
    form.validateFields().then((values) => {
      // 准备提交数据
      const questionData = {
        type: 'word', // 添加题目类型
        questionNumber: values.questionNumber,
        score: values.score,
        minWordCount: values.minWordCount,
        totalWordCount: values.totalWordCount
      };

      // 生成唯一ID（仅添加模式）
      if (!isEditMode) {
        questionData.sectionId = generateSectionId();
      } else {
        // 编辑模式下保留原有ID
        questionData.sectionId = initialData.sectionId;
      }

      // 显示成功消息
      showSuccess(isEditMode ? "已成功编辑作文题" : "已成功添加作文题");

      // 调用成功回调
      if (onSuccess) {
        onSuccess(questionData);
      }

      // 重置表单
      resetForm();

      // 关闭弹窗
      if (onCancel) {
        onCancel();
      }
    }).catch(() => {
      showInfo("请填写完整信息");
    });
  };

  return (
    <Modal
      title={isEditMode ? "编辑作文题" : "添加作文题"}
      open={visible}
      onOk={handleSubmit}
      onCancel={() => {
        resetForm();
        if (onCancel) onCancel();
      }}
      okText="确定"
      cancelText="取消"
      width={600}
    >
      <Form
        form={form}
        layout="horizontal"
        style={{ marginTop: 16 }}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
      >
        {/* 大题题号 */}
        <Form.Item
          name="questionNumber"
          label="大题题号"
          rules={[{ required: true, message: "请输入大题题号" }]}
        >
          <Select placeholder="请选择大题题号">
            {["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二", "十三", "十四", "十五", "十六"].map((num) => (
              <Select.Option key={num} value={num}>{num}</Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* 分数、字数最少、总字数各自一行 */}
        <Form.Item
          name="score"
          label="分数"
          rules={[{ required: true, message: "请输入分数" }]}
        >
          <InputNumber
            min={0}
            max={100}
            style={{ width: "100%" }}
            placeholder="请输入分数"
          />
        </Form.Item>

        <Form.Item
          name="minWordCount"
          label="字数最少"
          rules={[{ required: true, message: "请输入最少字数" }]}
        >
          <InputNumber
            min={0}
            max={2000}
            style={{ width: "100%" }}
            placeholder="请输入最少字数"
          />
        </Form.Item>

        <Form.Item
          name="totalWordCount"
          label="总字数"
          rules={[{ required: true, message: "请输入总字数" }]}
        >
          <InputNumber
            min={0}
            max={3000}
            defaultValue={1000}
            style={{ width: "100%" }}
            placeholder="请输入总字数"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default WordQuestionModal;