import { useState, useCallback, useEffect } from "react";
import { Button, Typography, Form, Input, Checkbox, Empty, Space } from "antd";
import { useRef } from "react";
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
import SaveTemplateModal from "./components/SaveTemplateModal";
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
  // 存储位置数据的专用对象，避免在questions中修改引起多次页面渲染
  const [questionPositions, setQuestionPositions] = useState({});
  // 用于引用AnswerSheetRenderer组件
  const answerSheetRef = useRef(null);

  // 保存模板相关状态
  const [saveTemplateModalVisible, setSaveTemplateModalVisible] =
    useState(false);

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
      // 过滤掉timestamp属性，避免其导致的无限循环
      const filteredPositions = { ...positions };
      Object.keys(filteredPositions).forEach((key) => {
        if (filteredPositions[key]?.timestamp !== undefined) {
          delete filteredPositions[key].timestamp;
        }
      });

      // 更新专门的位置数据对象，而不是修改questions数组
      setQuestionPositions((prevPositions) => {
        // 创建新的位置信息对象
        const updatedPositions = { ...prevPositions };

        // 遍历所有传入的位置数据
        Object.keys(filteredPositions).forEach((key) => {
          // 对于选择题完整数据，特殊处理
          if (key.endsWith("_complete")) {
            const completePositionInfo = filteredPositions[key];

            if (completePositionInfo && completePositionInfo.questions) {
              // 检查是否需要更新 - 只有当位置信息真正变化时才更新
              const needUpdate =
                !prevPositions[key] ||
                JSON.stringify(completePositionInfo.positionInfo) !==
                  JSON.stringify(prevPositions[key]?.positionInfo) ||
                completePositionInfo.questions.some(
                  (q, index) =>
                    JSON.stringify(q?.questionPositionInfo) !==
                    JSON.stringify(
                      prevPositions[key]?.questions?.[index]
                        ?.questionPositionInfo
                    )
                );

              if (needUpdate) {
                updatedPositions[key] = completePositionInfo;
                console.log(`更新选择题完整位置信息: ${key}`);
              }
            }
          } else {
            // 对于普通位置信息
            const positionInfo = filteredPositions[key];
            if (
              positionInfo &&
              JSON.stringify(positionInfo) !==
                JSON.stringify(prevPositions[key])
            ) {
              updatedPositions[key] = positionInfo;
              console.log(`更新位置信息: ${key}`, "位置数据", positionInfo);
            }
          }
        });

        return updatedPositions;
      });
    }
  }, []);

  // 预览并下载试卷
  const previewAndDownload = () => {
    // 校验标题是否存在
    // 使用ref方式从AnswerSheetRenderer组件获取title值
    let title = "";
    if (answerSheetRef.current && answerSheetRef.current.getTitle) {
      title = answerSheetRef.current.getTitle().trim();
    }

    if (!title) {
      showInfo("请先输入答题卡标题");
      return;
    }

    // 获取完整的题目列表，包含题目信息和位置信息
    if (questions.length > 0) {
      // 获取ExamInfoSection的位置信息
      let examInfoPosition = null;
      if (
        answerSheetRef.current &&
        answerSheetRef.current.getExamInfoSectionPosition
      ) {
        examInfoPosition = answerSheetRef.current.getExamInfoSectionPosition();
      }

      // 准备用于下载或预览的数据结构
      const examData = {
        basicInfo: formValues,
        totalQuestions: questions.length,
        questions: questions,
        // 添加ExamInfoSection的位置信息
        examInfoPosition: examInfoPosition,
        // 添加单独存储的位置数据
        questionPositions: questionPositions,
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

        // 在预览时处理标题和编辑按钮的样式
        // 1. 处理标题：将input标签替换为div标签
        const titleElement = clonedElement.querySelector(".answer-sheet-title");
        if (titleElement) {
          // 创建新的div元素
          const divElement = document.createElement("div");
          // 复制input的样式
          const titleStyle = titleElement.style;
          divElement.style.height = titleStyle.height;
          divElement.style.lineHeight = titleStyle.lineHeight;
          divElement.style.textAlign = titleStyle.textAlign;
          divElement.style.verticalAlign = titleStyle.verticalAlign;
          divElement.style.margin = titleStyle.margin;
          divElement.style.width = titleStyle.width;
          divElement.style.border = "none";
          divElement.style.borderRadius = titleStyle.borderRadius;
          divElement.style.padding = titleStyle.padding;
          divElement.style.fontSize = titleStyle.fontSize;
          divElement.style.fontWeight = titleStyle.fontWeight;
          divElement.style.backgroundColor = titleStyle.backgroundColor;
          divElement.style.fontFamily = titleStyle.fontFamily;
          divElement.style.transition = titleStyle.transition;
          divElement.style.outline = "none";
          // 设置文本内容为从AnswerSheetRenderer组件获取的title值
          divElement.textContent = title;
          // 替换元素
          titleElement.parentNode.replaceChild(divElement, titleElement);
        }

        // 2. 处理编辑按钮：隐藏编辑按钮
        const editButton = clonedElement.querySelector(
          ".answer-sheet-edit-btn"
        );
        if (editButton) {
          editButton.style.display = "none";
        }

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

  // 显示保存模板弹窗
  const showSaveTemplateModal = () => {
    setSaveTemplateModalVisible(true);
  };

  // 关闭保存模板弹窗
  const closeSaveTemplateModal = () => {
    setSaveTemplateModalVisible(false);
  };

  // 处理保存模板
  const handleSaveTemplate = (templateName) => {
    if (questions.length === 0) {
      showInfo("当前试卷中没有题目，无法保存为模板");
      return;
    }

    // 准备模板数据
    const templateData = {
      name: templateName,
      questions: questions,
      basicInfo: formValues,
    };

    // 模拟保存模板的API请求
    // 在实际应用中，这里应该调用后端API来保存模板
    setTimeout(() => {
      console.log("保存的模板数据：", templateData);
      showInfo(`模板"${templateName}"保存成功`);
      closeSaveTemplateModal();
    }, 500);
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
    if (action === "edit") {
      // 编辑操作：显示作文题弹窗并传递当前值进行回显
      setWordQuestionModalVisible(true);
      // 如果有数据传递过来，更新wordQuestionValues以便在弹窗中回显
      if (data && Object.keys(data).length > 0) {
        setWordQuestionValues(data);
      }
    } else if (action === "delete") {
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
            ref={answerSheetRef}
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
              <Form.Item name="hasNote" valuePropName="checked">
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
                icon={
                  wordQuestionValues.totalWordCount ? (
                    <EditOutlined />
                  ) : (
                    <PlusOutlined />
                  )
                }
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
          <div style={{ padding: "6px" }}>
            <Button
              icon={<DownloadOutlined />}
              onClick={showSaveTemplateModal}
              block
            >
              保存为模板
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
          existingQuestions={questions}
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

      {/* 保存模板弹窗 - 使用自包含组件 */}
      {saveTemplateModalVisible && (
        <SaveTemplateModal
          visible={saveTemplateModalVisible}
          onCancel={closeSaveTemplateModal}
          onSuccess={handleSaveTemplate}
          questions={questions}
        />
      )}
    </>
  );
};

export default ChinesePaperDesign;
