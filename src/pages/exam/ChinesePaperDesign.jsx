import { useState, useCallback, useEffect } from "react";
import { Button, Typography, Form, Input, Checkbox, Empty, Space } from "antd";
import {
  DownloadOutlined,
  EditOutlined,
  PlusOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useMessageService } from "../../components/common/message";
import ObjectiveQuestionModal from "./components/ObjectiveQuestionModal";
import BlankQuestionModal from "./components/BlankQuestionModal";
import WordQuestionModal from "./components/WordQuestionModal";
import AnswerSheetRenderer from "./components/AnswerSheetRenderer";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setPreviewData } from "../../store/slices/previewSlice";
import { calculateQuestionsPagination } from "../../utils/tools";
const { Title } = Typography;

/**
 * 语文试卷设计页面组件 - 左右布局
 */
const ChinesePaperDesign = () => {
  const { showInfo } = useMessageService();
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [blankQuestionModalVisible, setBlankQuestionModalVisible] =
    useState(false);
  const [wordQuestionModalVisible, setWordQuestionModalVisible] =
    useState(false);
  const [wordQuestionValues, setWordQuestionValues] = useState({});
  const [questions, setQuestions] = useState([]);
  const [formValues, setFormValues] = useState({
    hasSealingLine: false,
    hasNote: true,
  });
  // 存储分页后的数据
  const [paginationData, setPaginationData] = useState([]);
  const [totalPages, setTotalPages] = useState(1); // 分页数据

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 当questions或hasNote改变时，重新计算分页
  useEffect(() => {
    if (questions.length > 0) {
      const { totalPages, paginatedQuestions } = calculateQuestionsPagination(
        questions,
        {
          hasNote: formValues.hasNote !== false,
        }
      );
      setTotalPages(totalPages);
      setPaginationData(paginatedQuestions);
    } else {
      setPaginationData([]);
      setTotalPages(1);
    }
  }, [questions, formValues.hasNote]);

  // 使用useCallback缓存getQuestionPositions函数，避免不必要的重新渲染
  const getQuestionPositions = useCallback((positions) => {
    if (positions && typeof positions === "object") {
      setQuestions((prevQuestions) => {
        // 创建新的题目数组
        const updatedQuestions = prevQuestions.map((question) => {
          // 使用sectionId作为唯一标识查找对应的位置信息，避免题号重复的问题
          const positionInfo = question.sectionId
            ? positions[question.sectionId]
            : null;

          // 如果找到位置信息，并且与现有位置信息不同，则更新
          if (
            positionInfo &&
            JSON.stringify(positionInfo) !==
              JSON.stringify(question.positionInfo)
          ) {
            return {
              ...question,
              positionInfo: { ...positionInfo }, // 添加位置信息属性
            };
          }

          return question;
        });

        // 检查是否有任何题目被更新
        const hasChanges =
          JSON.stringify(updatedQuestions) !== JSON.stringify(prevQuestions);

        // 只有在有变化时才返回新数组，避免不必要的渲染
        if (hasChanges) {
          console.log("已将位置信息添加到题目对象中");
          return updatedQuestions;
        }

        // 没有变化时返回原数组
        return prevQuestions;
      });
    }
  }, []);

  // 预览并下载试卷
  const previewAndDownload = () => {
    // 获取完整的题目列表，包含题目信息和位置信息
    if (questions.length > 0) {
      // 准备用于下载或预览的数据结构
      const examData = {
        basicInfo: formValues,
        totalQuestions: questions.length,
        questions: questions,
      };

      console.log("试卷完整数据：", examData);

      // 获取所有answer-sheet-page元素的内容
      const answerSheetPages = [];
      const pageElements = document.querySelectorAll(".answer-sheet-page");
      console.log("pageElements", pageElements);
      pageElements.forEach((element) => {
        // 克隆元素以避免修改原DOM
        const clonedElement = element.cloneNode(true);
        clonedElement.style.marginBottom = "0";
        clonedElement.style.borderRadius = "0";
        // 获取元素的HTML内容
        answerSheetPages.push(clonedElement.outerHTML);
      });

      // 打印数据存储前的状态
      console.log("即将存储到Redux的数据 - examData:", examData);
      console.log("即将存储到Redux的数据 ", answerSheetPages);

      // 存储数据到Redux
      dispatch(
        setPreviewData({
          examData,
          answerSheetPages,
        })
      );

      console.log("数据已存储到Redux，即将导航到预览页面");

      // 跳转到预览页面
      navigate("/exam-paper-preview");
    } else {
      showInfo("当前试卷中没有题目，请先添加题目");
    }
  };

  // 显示选择题弹窗
  const showObjectiveQuestionModal = () => {
    setModalVisible(true);
  };

  // 处理选择题添加成功
  const handleObjectiveQuestionSuccess = (newQuestion) => {
    const newQuestions = [...questions, { ...newQuestion, type: "objective" }];
    // 将新题目添加到题目列表
    setQuestions(newQuestions);
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
    const newQuestions = [...questions, { ...newQuestion, type: "blank" }];
    // 将新题目添加到题目列表
    setQuestions(newQuestions);
  };

  // 处理其他题目类型的添加
  const handleAddOtherQuestion = (type) => {
    // 如果是填空题类型，显示填空题弹窗
    if (type === "blank") {
      setBlankQuestionModalVisible(true);
    } else if (type === "word") {
      setWordQuestionModalVisible(true);
    }
  };

  // 处理作文题添加成功
  const handleWordQuestionSuccess = (values) => {
    // console.log("作文题添加成功，但不添加到questions数组中", values);
    setWordQuestionValues(values);
  };

  // 关闭作文题弹窗
  const closeWordQuestionModal = () => {
    setWordQuestionModalVisible(false);
  };

  // 处理作文题的编辑和删除操作
  const onWordQuestionAction = (action, data = null) => {
    if (action === 'edit') {
      // 编辑操作：显示作文题弹窗并传递当前值进行回显
      setWordQuestionModalVisible(true);
      // 如果有数据传递过来，更新wordQuestionValues以便在弹窗中回显
      if (data && Object.keys(data).length > 0) {
        setWordQuestionValues(data);
      }
    } else if (action === 'delete') {
      // 删除操作：将wordQuestionValues设置为空对象
      setWordQuestionValues({});
    }
  };
  // 监听表单值变化
  const handleValuesChange = (changedValues, allValues) => {
    setFormValues(allValues);
  };

  return (
    <>
      <div style={{ display: "flex" }}>
        {/* 左边：答题卡渲染页面 - 可横向滚动，居中显示 */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "auto",
            backgroundColor: "#f7f8fa",
            marginRight: "160px", // 为右侧固定操作台留出空间
          }}
        >
          <AnswerSheetRenderer
            questions={questions}
            paginationData={paginationData}
            totalPages={totalPages}
            hasSealingLine={formValues.hasSealingLine !== false}
            hasNote={formValues.hasNote !== false}
            wordQuestionValues={wordQuestionValues}
            getQuestionPositions={getQuestionPositions}
            onQuestionsUpdate={(updatedQuestions) => {
              console.log("接收到更新的题目数据：", updatedQuestions);
              setQuestions(updatedQuestions);
            }}
            onWordQuestionAction={onWordQuestionAction}
          />
        </div>

        {/* 右边：操作台 - 固定定位不随页面滚动 */}
        <div
          style={{
            position: "fixed",
            top: "65px", // 调整top值，避免遮挡导航栏
            right: "0",
            width: "180px",
            height: "calc(100vh - 65px)", // 高度相应调整
            display: "flex",
            flexDirection: "column",
            overflow: "auto",
            padding: "16px",
            backgroundColor: "white",
            boxShadow: "-2px 0 8px rgba(0, 0, 0, 0.1)",
            zIndex: "100",
          }}
        >
          {/* 基础信息 */}
          <div style={{ marginBottom: "12px", padding: "4px" }}>
            <Title level={5}>基础信息</Title>
            <Form
              form={form}
              layout="vertical"
              onValuesChange={handleValuesChange}
              initialValues={formValues}
            >
              {/* <Form.Item
                name="hasSealingLine"
                valuePropName="checked"
                initialValue={true}
              >
                <Checkbox>显示密封线</Checkbox>
              </Form.Item> */}
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
              <Button
                type="primary"
                ghost
                icon={wordQuestionValues.totalWordCount ? <EditOutlined /> : <PlusOutlined />}
                onClick={() => handleAddOtherQuestion("word")}
                block
              >
                {wordQuestionValues.totalWordCount ? "编辑作文题" : "作文题"}
              </Button>
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
              预览
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

      {/* 作文题弹窗 - 使用自包含组件 */}
      {wordQuestionModalVisible ? (
        <WordQuestionModal
          visible={wordQuestionModalVisible}
          onCancel={closeWordQuestionModal}
          onSuccess={handleWordQuestionSuccess}
          initialData={wordQuestionValues}
        />
      ) : null}
    </>
  );
};

export default ChinesePaperDesign;
