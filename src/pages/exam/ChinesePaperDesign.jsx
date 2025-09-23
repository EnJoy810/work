import React, { useState } from "react";
import { Button, Typography, Form, Input, Checkbox, Empty, Space } from "antd";
import {
  DownloadOutlined,
  EditOutlined,
  PlusOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useMessageService } from "../../components/common/message";
import ObjectiveQuestionModal from "./ObjectiveQuestionModal";
import BlankQuestionModal from "./BlankQuestionModal";
import AnswerSheetRenderer from "./components/AnswerSheetRenderer";

const { Title } = Typography;

/**
 * 语文试卷设计页面组件 - 左右布局
 */
const ChinesePaperDesign = () => {
  const { showSuccess, showInfo } = useMessageService();
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [blankQuestionModalVisible, setBlankQuestionModalVisible] = 
    useState(false);
  const [questions, setQuestions] = useState([]);
  const [formValues, setFormValues] = useState({
    hasSealingLine: true,
    hasNote: true
  });

  // 预览并下载试卷
  const previewAndDownload = () => {
    showInfo("正在保存并准备预览试卷...");
    // 模拟API请求延迟
    setTimeout(() => {
      showSuccess("试卷已保存并准备预览");
      showInfo("预览并下载功能待实现");
    }, 800);
  };

  // 显示选择题弹窗
  const showObjectiveQuestionModal = () => {
    setModalVisible(true);
  };

  // 处理选择题添加成功
  const handleObjectiveQuestionSuccess = (newQuestion) => {
    // 将新题目添加到题目列表
    setQuestions([...questions, { ...newQuestion, type: "objective" }]);
  };

  // 关闭选择题弹窗
  const closeObjectiveQuestionModal = () => {
    setModalVisible(false);
  };

  // 关闭填空题弹窗
  const closeBlankQuestionModal = () => {
    setBlankQuestionModalVisible(false);
  };

  // 处理填空题添加成功
  const handleBlankQuestionSuccess = (newQuestion) => {
    // 将新题目添加到题目列表
    setQuestions([...questions, { ...newQuestion, type: "blank" }]);
  };

  // 处理其他题目类型的添加
  const handleAddOtherQuestion = (type) => {
    // 如果是填空题类型，显示填空题弹窗
    if (type === "blank") {
      setBlankQuestionModalVisible(true);
    }
  };
  // 监听表单值变化
  const handleValuesChange = (changedValues, allValues) => {
    setFormValues(allValues);
  };

  return (
    <div>
      <div style={{ display: "flex", height: "100%", gap: "8px" }}>
        {/* 左边：答题卡渲染页面 - 可横向滚动 */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            overflow: "hidden",
            backgroundColor: "#f7f8fa",
          }}
        >
          <AnswerSheetRenderer
            questions={questions}
            hasSealingLine={formValues.hasSealingLine !== false}
            hasNote={formValues.hasNote !== false}
          />
        </div>

        {/* 右边：操作台 */}
        <div
          style={{
            width: "180px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* 基础信息 */}
          <div style={{ marginBottom: "12px", padding: "4px" }}>
            <Title level={5}>基础信息</Title>
            <Form form={form} layout="vertical" onValuesChange={handleValuesChange} initialValues={formValues}>
              <Form.Item
                name="hasSealingLine"
                valuePropName="checked"
                initialValue={true}
              >
                <Checkbox>显示密封线</Checkbox>
              </Form.Item>
              <Form.Item
                name="hasNote"
                valuePropName="checked"
                initialValue={true}
              >
                <Checkbox>显示注意事项</Checkbox>
              </Form.Item>
            </Form>
          </div>

          {/* 添加题目 */}
          <div style={{ marginBottom: "12px", padding: "4px" }}>
            <Title level={5}>添加题目</Title>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Button
                type="primary"
                ghost
                icon={<PlusOutlined />}
                onClick={showObjectiveQuestionModal}
                block
              >
                选择题
              </Button>
              <Button
                type="primary"
                ghost
                icon={<PlusOutlined />}
                onClick={() => handleAddOtherQuestion("blank")}
                block
              >
                填空题
              </Button>
              {/* <Button
                type="primary"
                ghost
                icon={<PlusOutlined />}
                onClick={() => handleAddOtherQuestion("essay")}
                block
              >
                解答题
              </Button> */}
            </Space>
          </div>
          {/* 分割线 */}
          <div
            style={{ borderTop: "1px dashed #d9d9d9", margin: "8px 0" }}
          ></div>
          {/* 预览并下载 */}
          <div style={{ padding: "6px" }}>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={previewAndDownload}
              block
            >
              预览并下载
            </Button>
          </div>
        </div>
      </div>

      {/* 选择题弹窗 - 使用自包含组件 */}
      {modalVisible ? (
        <ObjectiveQuestionModal
          visible={modalVisible}
          onCancel={closeObjectiveQuestionModal}
          onSuccess={handleObjectiveQuestionSuccess}
        />
      ) : null}

      {/* 填空题弹窗 - 使用自包含组件 */}
      {blankQuestionModalVisible ? (
        <BlankQuestionModal
          visible={blankQuestionModalVisible}
          onCancel={closeBlankQuestionModal}
          onSuccess={handleBlankQuestionSuccess}
        />
      ) : null}
    </div>
  );
};

export default ChinesePaperDesign;
