import React, { useState, useRef, useEffect, useCallback } from "react";
import { EditOutlined } from "@ant-design/icons";
import SealingLine from "./SealingLine";
import { Button, Modal } from "antd";
import ExamInfoModal from "./ExamInfoModal";
import ObjectiveQuestionsRenderer from "./ObjectiveQuestionsRenderer";
import SubjectiveQuestionsRenderer from "./SubjectiveQuestionsRenderer";
import QuestionWrapper from "./QuestionWrapper";
import ObjectiveQuestionModal from "./ObjectiveQuestionModal";
import BlankQuestionModal from "./BlankQuestionModal";
import ExamInfoSection from "./ExamInfoSection";

// 从常量文件导入页面尺寸
import { PAGE_WIDTH, PAGE_HEIGHT, PAGE_MARGIN } from '../../../utils/constants';
/**
 * 答题卷渲染组件
 * 负责在固定大小的页面上绘制题目，并支持多页显示
 */
const AnswerSheetRenderer = ({
  questions: propQuestions = [],
  hasNote = true,
  getQuestionPositions,
  onQuestionsUpdate = () => {}, // 设置为空函数作为默认值
}) => {
  // console.log("hasSealingLine", hasSealingLine, hasNote);
  // 使用从常量文件导入的页面尺寸
  const pageWidth = PAGE_WIDTH;
  const pageHeight = PAGE_HEIGHT;
  const pageMargin = PAGE_MARGIN;
  const topBottomMargin = 80; // 上下页边距，单位：px

  // 标题状态管理
  const [title, setTitle] = useState("");

  // 直接使用props传递的题目列表，不再使用本地状态管理
  // 所有修改操作通过onQuestionsUpdate回调函数通知父组件修改原始数据

  // 考试相关信息状态
  const [examSubject, setExamSubject] = useState("语文");
  const [applicableMajor, setApplicableMajor] = useState("25级高职高考");
  const [examTime, setExamTime] = useState("150");

  // 弹窗可见性状态
  const [isModalVisible, setIsModalVisible] = useState(false);
  // 选择题编辑弹窗可见性状态
  const [isObjectiveModalVisible, setIsObjectiveModalVisible] = useState(false);
  // 当前正在编辑的选择题数据
  const [editingObjectiveItem, setEditingObjectiveItem] = useState(null);
  // 填空题编辑弹窗可见性状态
  const [isBlankModalVisible, setIsBlankModalVisible] = useState(false);
  // 当前正在编辑的填空题数据
  const [editingBlankItem, setEditingBlankItem] = useState(null);

  // 存储每个页面容器的ref
  const pageRefs = useRef([]);

  // 存储题目位置信息的状态
  const [questionPositions, setQuestionPositions] = useState({});

  // 使用useCallback缓存位置更新函数，避免不必要的重新渲染
  const handleQuestionPositionUpdate = useCallback(
    (identifier, positionInfo) => {
      setQuestionPositions((prev) => {
        // 只有当位置信息真正改变时才更新状态
        const currentPosition = prev[identifier];
        if (
          currentPosition &&
          JSON.stringify(currentPosition) === JSON.stringify(positionInfo)
        ) {
          return prev; // 位置信息没有变化，返回原对象
        }
        return {
          ...prev,
          [identifier]: positionInfo,
        };
      });
    },
    []
  );

  // 如果父组件提供了获取位置信息的回调，则调用它
  // 但避免频繁调用导致无限循环
  useEffect(() => {
    if (
      getQuestionPositions &&
      typeof getQuestionPositions === "function" &&
      Object.keys(questionPositions).length > 0
    ) {
      // 使用setTimeout添加一个小延迟，避免频繁调用
      const timeoutId = setTimeout(() => {
        getQuestionPositions(questionPositions);
      }, 100);

      // 清理函数
      return () => clearTimeout(timeoutId);
    }
  }, [questionPositions, getQuestionPositions]);

  // 打开弹窗
  const showModal = () => {
    setIsModalVisible(true);
  };

  // 关闭弹窗
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // 保存修改
  const handleSave = (updatedData) => {
    setExamSubject(updatedData.examSubject);
    setApplicableMajor(updatedData.applicableMajor);
    setExamTime(updatedData.examTime);
    setIsModalVisible(false);
  };

  // 打开选择题编辑弹窗
  const openObjectiveModal = (question = null) => {
    setEditingObjectiveItem(question);
    setIsObjectiveModalVisible(true);
  };

  // 关闭选择题编辑弹窗
  const closeObjectiveModal = () => {
    setIsObjectiveModalVisible(false);
    setEditingObjectiveItem(null);
  };

  // 关闭填空题编辑弹窗
  const closeBlankModal = () => {
    setIsBlankModalVisible(false);
    setEditingBlankItem(null);
  };

  // 处理选择题编辑成功
  const handleObjectiveEditSuccess = (updatedData) => {
    console.log("updatedData 处理选择题编辑成功", updatedData);
    // 获取编辑后的数据
    const {
      questions: updatedQuestions,
      isEdit,
      sectionId, // 大题唯一ID，用于标识题目的唯一性
    } = updatedData;

    // 确保父组件提供了更新函数
    if (!onQuestionsUpdate || typeof onQuestionsUpdate !== "function") {
      console.error("未提供onQuestionsUpdate函数，无法更新题目数据");
      closeObjectiveModal();
      return;
    }

    // 如果是编辑模式，更新现有的题目
    if (isEdit && sectionId) {
      if (updatedQuestions && updatedQuestions.length > 0) {
        const editQuestions = propQuestions.map((q) => {
          if (q.sectionId === sectionId) {
            return { ...updatedData };
          }
          return q;
        });
        // 通过父组件提供的更新函数更新原始数据
        onQuestionsUpdate(editQuestions);
        console.log("选择题编辑成功，已更新题目数据:", editQuestions);
      }
    } else {
      // 如果是添加模式，添加新题目
      if (updatedQuestions && updatedQuestions.length > 0) {
        // 确保每个题目都包含sectionId
        const questionsWithSectionId = updatedQuestions.map((question) => ({
          ...question,
          sectionId: sectionId, // 将大题ID添加到每个题目中
        }));

        // 直接使用从ObjectiveQuestionModal传来的已经带有ID的题目数据
        const newQuestions = [...propQuestions, ...questionsWithSectionId];

        // 通过父组件提供的更新函数更新原始数据
        onQuestionsUpdate(newQuestions);
        console.log("选择题添加成功:", newQuestions);
      }
    }

    closeObjectiveModal();
  };

  // 处理填空题编辑成功
  const handleBlankEditSuccess = (updatedData) => {
    console.log("updatedData 处理填空题编辑成功", updatedData);
    // 获取编辑后的数据
    const {
      isEdit,
      sectionId, // 大题唯一ID，用于标识题目的唯一性
    } = updatedData;

    // 确保父组件提供了更新函数
    if (!onQuestionsUpdate || typeof onQuestionsUpdate !== "function") {
      console.error("未提供onQuestionsUpdate函数，无法更新题目数据");
      closeBlankModal();
      return;
    }

    // 如果是编辑模式，更新现有的题目
    if (isEdit && sectionId) {
      const editQuestions = propQuestions.map((q) => {
        if (q.sectionId === sectionId) {
          return { ...updatedData };
        }
        return q;
      });
      // 通过父组件提供的更新函数更新原始数据
      onQuestionsUpdate(editQuestions);
      console.log("填空题编辑成功，已更新题目数据:", editQuestions);
    } else {
      // 如果是添加模式，添加新题目
      // 直接添加整道大题
      const newQuestions = [...propQuestions, updatedData];

      // 通过父组件提供的更新函数更新原始数据
      onQuestionsUpdate(newQuestions);
      console.log("填空题添加成功:", newQuestions);
    }

    closeBlankModal();
  };

  // 删除选择题
  const deleteObjectiveQuestion = (sectionId) => {
    // 确保父组件提供了更新函数
    if (!onQuestionsUpdate || typeof onQuestionsUpdate !== "function") {
      console.error("未提供onQuestionsUpdate函数，无法更新题目数据");
      return;
    }
    console.log("propQuestions", propQuestions);
    // 过滤掉要删除的题目
    const updatedQuestions = propQuestions.filter(
      (q) => q.sectionId !== sectionId
    );

    // 通过父组件提供的更新函数更新原始数据
    onQuestionsUpdate(updatedQuestions);

    console.log("删除选择题后的题目列表:", updatedQuestions);
  };

  // 删除非选择题的函数已在renderPageContent中局部定义
  // 这里保留注释以确保代码的可读性

  // 计算页面数量
  const calculatePageCount = () => {
    // 这里是简化的计算逻辑，实际应该根据题目数量和每页可容纳的题目数来计算
    // 为了演示多页效果，当题目数量超过5时，显示第二页
    return propQuestions.length > 5 ? 2 : 1;
  };

  // 渲染考试信息
  const renderExamInfo = () => {
    return (
      <div
        style={{
          marginBottom: "20px",
          fontSize: "14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* 右上角编辑按钮 */}
        {/* <Button
          type="primary"
          ghost
          size="small"
          onClick={showModal}
          style={{
            position: "absolute",
            right: "0",
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          编辑
        </Button> */}
        <Button
          type="text"
          size="small"
          icon={<EditOutlined />}
          onClick={showModal}
          style={{
            position: "absolute",
            right: "0",
            top: "50%",
            transform: "translateY(-50%)",
            backgroundColor: "#fff",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            border: "1px solid #d9d9d9",
            padding: "4px 8px",
            color: "#1890ff",
            minWidth: "60px",
          }}
        >
          编辑
        </Button>

        <div style={{ marginRight: "30px" }}>
          考试科目:{" "}
          <span
            style={{
              borderBottom: "1px solid #000",
              paddingBottom: "1px",
              marginLeft: "5px",
            }}
          >
            {examSubject}
          </span>
        </div>
        <div style={{ marginRight: "30px" }}>
          适用专业（班级）:{" "}
          <span
            style={{
              borderBottom: "1px solid #000",
              paddingBottom: "1px",
              marginLeft: "5px",
            }}
          >
            {applicableMajor}
          </span>
        </div>
        <div>考试时间: {examTime}分钟</div>
      </div>
    );
  };

  // 渲染注意事项
  const renderNote = () => {
    if (!hasNote) return null;

    return (
      <div
        style={{
          marginBottom: "20px",
          border: "1px solid #000",
          display: "flex",
        }}
      >
        {/* 左边填涂样例 */}
        <div
          style={{
            alignSelf: "stretch",
            width: "200px",
            borderRight: "1px solid #000",
            padding: "10px",
            backgroundColor: "#f9f9f9",
            display: "flex",
          }}
        >
          {/* 左边：填涂样例 垂直排列 */}
          <div
            style={{
              width: "20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              borderRight: "1px solid #ccc",
              marginRight: "10px",
              paddingRight: "5px",
            }}
          >
            {"填涂样例".split("").map((char, index) => (
              <div
                key={index}
                style={{
                  fontSize: "14px",
                  margin: "3px 0",
                  fontWeight: "bold",
                }}
              >
                {char}
              </div>
            ))}
          </div>

          {/* 右边：正确填涂及示例 */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
            }}
          >
            <p style={{ margin: "0", padding: "0", fontWeight: "bold" }}>
              正确填涂
            </p>
            <div
              style={{
                border: "1px solid #000",
                width: "20px",
                height: "20px",
                backgroundColor: "#000",
                margin: "3px auto",
              }}
            ></div>
            <p style={{ margin: "0", padding: "0", fontWeight: "bold" }}>
              错误填涂
            </p>
            <div
              style={{
                marginTop: "10px",
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              <div
                style={{
                  border: "1px solid #000",
                  width: "20px",
                  height: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                }}
              >
                √
              </div>
              <div
                style={{
                  border: "1px solid #000",
                  width: "20px",
                  height: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                }}
              >
                ×
              </div>
              <div
                style={{
                  border: "1px solid #000",
                  width: "20px",
                  height: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                }}
              >
                ●
              </div>
              <div
                style={{
                  border: "1px solid #000",
                  width: "20px",
                  height: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                }}
              >
                ○
              </div>
            </div>
          </div>
        </div>

        {/* 右边注意事项说明 */}
        <div
          style={{
            flex: 1,
            padding: "10px",
            fontSize: "14px",
            display: "flex",
            height: "100%",
          }}
        >
          {/* 左边注意事项标题，垂直排列 */}
          <div
            style={{
              width: "20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "10px",
              borderRight: "1px solid #ccc",
              paddingRight: "5px",
            }}
          >
            {"注意事项".split("").map((char, index) => (
              <div key={index} style={{ margin: "3px 0", fontWeight: "bold" }}>
                {char}
              </div>
            ))}
          </div>

          {/* 右边注意事项内容 */}
          <div style={{ flex: 1 }}>
            <p style={{ margin: "3px 0" }}>
              1.答题前，考生先将自己的姓名、班级、考场、座位号填写清楚。
            </p>
            <p style={{ margin: "3px 0" }}>
              2.选择题部分必须使用2B铅笔填涂;非选择题部分使用黑色字迹的钢笔、圆珠笔或签字笔书写，字体工整、笔迹清楚。
            </p>
            <p style={{ margin: "3px 0" }}>
              3.请按照题号顺序在各题目的答题区域内作答，超出答题区域书写的答案无效;在草稿纸、试题卷上答题无效。
            </p>
            <p style={{ margin: "3px 0" }}>4.保持纸面清洁，不折叠、不破损。</p>
          </div>
        </div>
      </div>
    );
  };

  // 渲染单页内容
  const renderPageContent = (pageIndex) => {
    // 获取每页显示的题目
    const pageQuestions = propQuestions.slice(
      pageIndex * 5,
      (pageIndex + 1) * 5
    );

    // 按题型分类题目
    const objectiveQuestions = pageQuestions.filter(
      (q) => q.type === "objective"
    );
    const subjectiveQuestions = pageQuestions.filter(
      (q) => q.type !== "objective"
    );

    console.log("objectiveQuestions 选择题", objectiveQuestions);
    console.log("subjectiveQuestions 非选择题", subjectiveQuestions);

    return (
      <div
        key={pageIndex}
        ref={(el) => (pageRefs.current[pageIndex] = el)}
        className="answer-sheet-page"
        style={{
          width: pageWidth,
          height: pageHeight,
          backgroundColor: "white",
          padding: `${topBottomMargin}px ${pageMargin}px`,
          borderRadius: "8px",
          marginBottom: "20px",
          position: "relative",
          boxShadow: "0px 0px 3px 3px #E5E9F2",
        }}
      >
        {/* 四个黑色正方形用于定位 */}
        {/* 左上角 */}
        <div
          style={{
            position: "absolute",
            top: `${pageMargin}px`,
            left: `${pageMargin}px`,
            width: "10px",
            height: "10px",
            backgroundColor: "black",
          }}
        />
        {/* 右上角 */}
        <div
          style={{
            position: "absolute",
            top: `${pageMargin}px`,
            right: `${pageMargin}px`,
            width: "10px",
            height: "10px",
            backgroundColor: "black",
          }}
        />
        {/* 左下角 */}
        <div
          style={{
            position: "absolute",
            bottom: `${pageMargin}px`,
            left: `${pageMargin}px`,
            width: "10px",
            height: "10px",
            backgroundColor: "black",
          }}
        />
        {/* 右下角 */}
        <div
          style={{
            position: "absolute",
            bottom: `${pageMargin}px`,
            right: `${pageMargin}px`,
            width: "10px",
            height: "10px",
            backgroundColor: "black",
          }}
        />
        {/* 第一页特有内容 */}
        {pageIndex === 0 && (
          <>
            {/* 页面标题 */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请输入答题卡标题"
              style={{
                textAlign: "center",
                margin: "0 0 10px 0",
                width: "100%",
                border: "1px dashed #ccc",
                borderRadius: "4px",
                padding: "8px 12px",
                fontSize: "24px",
                fontWeight: "bold",
                backgroundColor: "transparent",
                fontFamily: "inherit",
                transition: "border-color 0.3s ease",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#1890ff";
                e.target.style.boxShadow = "0 0 0 2px rgba(24, 144, 255, 0.2)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#ccc";
                e.target.style.boxShadow = "none";
              }}
            />
            {/* 考试信息 */}
            {renderExamInfo()}

            {/* 考生信息输入区域 */}
            <ExamInfoSection />

            {/* 注意事项 */}
            {hasNote && renderNote()}
          </>
        )}

        {/* 题目列表 - 按题型分类显示 */}
        <div style={{ marginTop: "20px" }}>
          {pageQuestions.length > 0 ? (
            <>
              {/* 选择题部分 */}
              {objectiveQuestions.length > 0 &&
                objectiveQuestions.map((objectiveItem) => {
                  // 编辑选择题
                  const handleEditObjectiveQuestion = (question) => {
                    console.log("编辑选择题:", question);
                    openObjectiveModal(question);
                  };

                  // 删除选择题
                  const handleDeleteObjectiveQuestion = (question) => {
                    console.log("删除选择题:", question);
                    Modal.confirm({
                      title: "确认删除",
                      content: `确定要删除选择题【${question.questionNumber}】吗？`,
                      okText: "确定",
                      cancelText: "取消",
                      onOk() {
                        // 执行删除操作
                        deleteObjectiveQuestion(question.sectionId);
                      },
                    });
                  };

                  return (
                    <QuestionWrapper
                      key={objectiveItem.sectionId}
                      objectiveItem={objectiveItem}
                      onEdit={handleEditObjectiveQuestion}
                      onDelete={handleDeleteObjectiveQuestion}
                    >
                      <ObjectiveQuestionsRenderer
                        objectiveItem={objectiveItem}
                        pageRef={pageRefs.current[pageIndex]}
                        onPositionUpdate={handleQuestionPositionUpdate}
                      />
                    </QuestionWrapper>
                  );
                })}

              {/* 非选择题部分 */}
              {subjectiveQuestions.length > 0 &&
                subjectiveQuestions.map((subjectiveItem) => {
                  // 编辑非选择题，参照选择题编辑模式
                  const handleEditSubjectiveQuestion = (question) => {
                    console.log("编辑非选择题:", question);
                    // 设置当前编辑的填空题数据，然后打开弹窗
                    setEditingBlankItem(question);
                    setIsBlankModalVisible(true);
                  };

                  // 删除非选择题
                  const handleDeleteSubjectiveQuestion = (question) => {
                    console.log("删除非选择题:", question);
                    Modal.confirm({
                      title: "确认删除",
                      content: `确定要删除填空题【${
                        question.questionNumber || "大题"
                      }】吗？`,
                      okText: "确定",
                      cancelText: "取消",
                      onOk() {
                        // 执行删除操作
                        deleteObjectiveQuestion(question.sectionId);
                      },
                    });
                  };

                  return (
                    <QuestionWrapper
                      key={subjectiveItem.sectionId}
                      subjectiveItem={subjectiveItem}
                      onEdit={handleEditSubjectiveQuestion}
                      onDelete={handleDeleteSubjectiveQuestion}
                    >
                      <SubjectiveQuestionsRenderer
                        questions={subjectiveItem}
                        pageIndex={pageIndex}
                        onPositionUpdate={handleQuestionPositionUpdate}
                        pageRef={pageRefs.current[pageIndex]}
                      />
                    </QuestionWrapper>
                  );
                })}
            </>
          ) : (
            <div
              style={{ textAlign: "center", color: "#999", padding: "20px" }}
            >
              {pageIndex === 0 ? "暂无题目" : "此页无题目"}
            </div>
          )}
        </div>

        {/* 页码 */}
        <div
          style={{
            position: "absolute",
            bottom: pageMargin,
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: "12px",
            color: "#666",
          }}
        >
          第 {pageIndex + 1} 页 / 共 {calculatePageCount()} 页
        </div>
      </div>
    );
  };

  // 渲染所有页面
  const renderAllPages = () => {
    const pageCount = calculatePageCount();

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {Array.from({ length: pageCount }).map((_, pageIndex) => {
          // if (pageIndex === 0 && hasSealingLine) {
          //   // 第一页添加密封线内容
          //   return (
          //     <div
          //       key={pageIndex}
          //       style={{ position: "relative", display: "flex" }}
          //     >
          //       {/* 使用密封线组件 - 绝对定位 */}
          //       <SealingLine
          //         pageHeight={pageHeight}
          //         topBottomMargin={topBottomMargin}
          //       />
          //       {/* 右侧正常页面内容 - 调整位置在密封线右侧 */}
          //       <div style={{ marginLeft: "120px" }}>
          //         {renderPageContent(pageIndex)}
          //       </div>
          //     </div>
          //   );
          // }
          // 其他页保持原样
          return renderPageContent(pageIndex);
        })}
      </div>
    );
  };

  return (
    <div
      className="answer-sheet-scroll-container"
      style={{
        marginTop: 20,
        flex: 1,
        overflow: "auto",
      }}
    >
      {renderAllPages()}
      <ExamInfoModal
        visible={isModalVisible}
        onCancel={handleCancel}
        onSave={handleSave}
        initialData={{
          examSubject,
          applicableMajor,
          examTime,
        }}
      />

      {/* 选择题编辑弹窗 */}
      {isObjectiveModalVisible ? (
        <ObjectiveQuestionModal
          visible={isObjectiveModalVisible}
          onCancel={closeObjectiveModal}
          onSuccess={handleObjectiveEditSuccess}
          // 如果有编辑的题目，则传递给弹窗进行回填
          initialData={editingObjectiveItem}
        />
      ) : null}

      {/* 填空题编辑弹窗 */}
      {isBlankModalVisible && (
        <BlankQuestionModal
          visible={isBlankModalVisible}
          initialData={editingBlankItem}
          onSuccess={handleBlankEditSuccess}
          onCancel={closeBlankModal}
        />
      )}
    </div>
  );
};

export default AnswerSheetRenderer;
