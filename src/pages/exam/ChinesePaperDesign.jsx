import { useState } from "react";
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

  // 预览并下载试卷
  const previewAndDownload = () => {
    showInfo("正在保存并准备预览试卷...");
    // 模拟API请求延迟
    setTimeout(() => {
      showSuccess("试卷已保存并准备预览");
      showInfo("预览并下载功能待实现");
    }, 800);
  };

  // 渲染答题卡预览
  const renderAnswerSheetPreview = () => {
    return (
      <div className="answer-sheet-content">
        <h2 style={{ textAlign: "center" }}>高中语文期中考试试卷</h2>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          总分: 150 分 | 考试时间: 120 分钟
        </div>
      </div>
    );
  };

  // 显示客观题弹窗
  const showObjectiveQuestionModal = () => {
    setModalVisible(true);
  };

  // 处理客观题添加成功
  const handleObjectiveQuestionSuccess = () => {
    // 这里可以添加后续处理逻辑，比如将题目添加到列表中
    // 目前不需要额外处理，弹窗组件内部已经显示了成功消息
  };

  // 关闭客观题弹窗
  const closeObjectiveQuestionModal = () => {
    setModalVisible(false);
  };

  // 关闭填空题弹窗
  const closeBlankQuestionModal = () => {
    setBlankQuestionModalVisible(false);
  };

  // 处理填空题添加成功
  const handleBlankQuestionSuccess = () => {
    // 这里可以添加后续处理逻辑，比如将题目添加到列表中
    // 目前不需要额外处理，弹窗组件内部已经显示了成功消息
  };

  // 处理其他题目类型的添加
  const handleAddOtherQuestion = (type) => {
    // 如果是填空题类型，显示填空题弹窗
    if (type === "blank") {
      setBlankQuestionModalVisible(true);
    }
  };

  return (
    <div style={{ padding: "8px", height: "calc(100vh - 16px)" }}>
      <div style={{ display: "flex", height: "100%", gap: "8px" }}>
        {/* 左边：答题卡渲染页面 - 可横向滚动 */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            className="answer-sheet-scroll-container"
            style={{
              flex: 1,
              overflowX: "auto",
              padding: "4px",
              backgroundColor: "#fafafa",
              border: "1px solid #e8e8e8",
              borderRadius: "4px",
            }}
          >
            <div
              className="answer-sheet-wrapper"
              style={{
                minWidth: "800px",
                backgroundColor: "white",
                padding: "16px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                borderRadius: "4px",
              }}
            >
              {renderAnswerSheetPreview()}
            </div>
          </div>
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
            <Form form={form} layout="vertical">
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
                客观题
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

      {/* 客观题弹窗 - 使用自包含组件 */}
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
