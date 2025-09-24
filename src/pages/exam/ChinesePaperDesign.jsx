import { useState, useCallback } from "react";
import { Button, Typography, Form, Input, Checkbox, Empty, Space, message } from "antd";
import {
  DownloadOutlined,
  EditOutlined,
  PlusOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useMessageService } from "../../components/common/message";
import ObjectiveQuestionModal from "./components/ObjectiveQuestionModal";
import BlankQuestionModal from "./components/BlankQuestionModal";
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
    hasSealingLine: false,
    hasNote: true
  });
  
  // 使用useCallback缓存getQuestionPositions函数，避免不必要的重新渲染
  const getQuestionPositions = useCallback((positions) => {
    if (positions && typeof positions === 'object') {
      setQuestions(prevQuestions => {
        // 创建新的题目数组
        const updatedQuestions = prevQuestions.map(question => {
          // 使用sectionId作为唯一标识查找对应的位置信息，避免题号重复的问题
          const positionInfo = question.sectionId ? positions[question.sectionId] : null;
          
          // 如果找到位置信息，并且与现有位置信息不同，则更新
          if (positionInfo && JSON.stringify(positionInfo) !== JSON.stringify(question.positionInfo)) {
            return {
              ...question,
              positionInfo: { ...positionInfo } // 添加位置信息属性
            };
          }
          
          return question;
        });
        
        // 检查是否有任何题目被更新
        const hasChanges = JSON.stringify(updatedQuestions) !== JSON.stringify(prevQuestions);
        
        // 只有在有变化时才返回新数组，避免不必要的渲染
        if (hasChanges) {
          console.log('已将位置信息添加到题目对象中');
          return updatedQuestions;
        }
        
        // 没有变化时返回原数组
        return prevQuestions;
      });
    }
  }, []);

  // 预览并下载试卷
  const previewAndDownload = () => {
    showInfo("正在保存并准备预览试卷...");
    
    // 模拟API请求延迟
    setTimeout(() => {
      showSuccess("试卷已保存并准备预览");
      
      // 获取完整的题目列表，包含题目信息和位置信息
      if (questions.length > 0) {
        // 计算包含位置信息的题目数量
        const questionsWithPositionCount = questions.filter(q => q.positionInfo).length;
        
        showSuccess(`成功获取${questions.length}道题目的完整信息，其中${questionsWithPositionCount}道题目包含位置数据`);
        
        // 打印完整的题目列表数据
        console.log("完整题目列表数据（包含位置信息）：", questions);
        
        // 单独提取位置信息以便查看
        const questionsWithPosition = questions.filter(question => question.positionInfo);
        if (questionsWithPosition.length > 0) {
          console.log("包含位置信息的题目：", questionsWithPosition);
        }
        
        // 准备用于下载或预览的数据结构
        const examData = {
          basicInfo: formValues,
          totalQuestions: questions.length,
          questionsWithPositionCount: questionsWithPositionCount,
          questions: questions
        };
        
        console.log("试卷完整数据：", examData);
        
        // 可以根据需要处理数据，例如导出到文件或用于预览
        message.success(`已准备${questions.length}道题目的完整数据用于预览和下载`);
        
        // 这里可以添加实际的下载逻辑，例如将数据转换为JSON或其他格式并提供下载
      } else {
        showInfo("当前试卷中没有题目，请先添加题目");
      }
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
            getQuestionPositions={getQuestionPositions}
            onQuestionsUpdate={(updatedQuestions) => {
              console.log("接收到更新的题目数据：", updatedQuestions);
              setQuestions(updatedQuestions);
            }}
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
