import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Slider,
  Badge,
  Avatar,
  Tag,
  Divider,
  Radio,
  InputNumber,
  message as antdMessage,
} from "antd";
import {
  LeftOutlined,
  RightOutlined,
  CheckCircleOutlined,
  EditOutlined,
  UserSwitchOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";
import request from "../../utils/request";
import "./styles/QuestionAnalysis.css";

/**
 * 作文批改页面
 * 布局为左中右三部分，左右固定宽度，中间自适应
 */
const QuestionAnalysis = () => {
  const [searchParams] = useSearchParams();
  const gradingId = searchParams.get("grading_id"); // 未来将用于从API获取数据
  const examId = searchParams.get("exam_id"); // 未来将用于从API获取数据
  // console.log("gradingId", gradingId);
  // 题目数据，所有学生共用
  const [questions, setQuestions] = useState([]);
  // 学生数据
  const [students, setStudents] = useState([]);

  // 从API同时获取题目数据和学生数据
  useEffect(() => {
    const fetchExamData = async () => {
      try {
        // 获取题目数据
        const questionsRes = await request.get(
          `/exam-question/exam-question-list`,
          { exam_id: examId }
        );
        if (questionsRes.data && questionsRes.data.length > 0) {
          setQuestions(questionsRes.data);
          // 设置默认选中第一个题目
          setCurrentQuestionId(questionsRes.data[0].question_id);
        }

        // 获取学生数据
        const studentsRes = await request.get(`/exam-question/student-list`, {
          grading_id: gradingId,
        });
        // console.log("studentsRes", studentsRes);
        if (studentsRes.data && studentsRes.data.length > 0) {
          setStudents(studentsRes.data);
          setCurrentStudentIndex(0);
        }
      } catch (error) {
        console.error("获取考试数据失败:", error);
      }
    };

    fetchExamData();
  }, [gradingId, examId]);

  // 当前选中的学生
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0);
  const currentStudent = students[currentStudentIndex];

  // 当前选中的题目ID
  const [currentQuestionId, setCurrentQuestionId] = useState(null);

  // 题目详情数据
  const [questionDetail, setQuestionDetail] = useState({});

  // 学生答案数据
  const [studentAnswer, setStudentAnswer] = useState({});

  // 手动改分相关状态
  const [manualScore, setManualScore] = useState(""); // 手动修改的分数（字符串形式，支持小数点输入）
  const [isSubmittingScore, setIsSubmittingScore] = useState(false); // 是否正在提交分数
  // eslint-disable-next-line no-unused-vars
  const [inputHistory, setInputHistory] = useState([]); // 输入历史记录，用于智能退格
  const justUpdatedScoreRef = useRef(false); // 标记是否刚刚更新过分数，避免重复获取

  // 当题目ID变化时，获取题目详情数据
  useEffect(() => {
    const fetchQuestionDetail = async () => {
      if (currentQuestionId && examId) {
        try {
          const detailRes = await request.get(`/exam-question`, {
            exam_id: examId,
            question_id: currentQuestionId,
          });
          if (detailRes.data) {
            setQuestionDetail(detailRes.data);
          }
        } catch (error) {
          console.error("获取题目详情失败:", error);
          // 保持现有数据不变
        }
      }
    };

    fetchQuestionDetail();
  }, [currentQuestionId, examId]);

  // 当学生或题目变化时，获取学生答案信息
  useEffect(() => {
    console.log("currentStudent", currentStudent);
    
    // 如果刚刚更新过分数，跳过本次获取（避免覆盖刚改的分数）
    if (justUpdatedScoreRef.current) {
      justUpdatedScoreRef.current = false;
      return;
    }
    
    const fetchStudentAnswer = async () => {
      if (currentStudent && gradingId) {
        try {
          // 根据API文档，使用 student_no 参数（优先使用实际字段 student_name）
          const studentNo = currentStudent.student_no;
          if (!studentNo) {
            console.error("学生学号不存在");
            return;
          }

          // 使用GET方法，参数作为查询参数
          const answerRes = await request.get(`/exam-question/grading`, {
            grading_id: gradingId,
            student_no: studentNo,
            question_id: currentQuestionId,
          });
          console.log("answerRes.data", answerRes.data);
          if (answerRes.data) {
            setStudentAnswer(answerRes.data);
            // 重置手动改分的分数为当前分数（转换为字符串）
            setManualScore(String(answerRes.data.score || 0));
            setInputHistory([]); // 清空输入历史
          }
        } catch (error) {
          console.error("获取学生答案信息失败:", error);
          setStudentAnswer({});
          setManualScore("0");
          setInputHistory([]); // 清空输入历史
        }
      }
    };

    fetchStudentAnswer();
  }, [currentStudent, gradingId, currentQuestionId]);

  // 提交手动改分
  const handleSubmitManualScore = async () => {
    // 检查是否为选择题，选择题不允许手动改分
    const currentQuestion = questions.find((q) => q.question_id === currentQuestionId);
    if (currentQuestion && currentQuestion.question_type === "choice") {
      antdMessage.warning("选择题不支持手动改分");
      return;
    }

    // 获取题目满分
    const maxScore = questionDetail?.score;
    if (!maxScore || maxScore <= 0) {
      antdMessage.warning("无法获取题目满分信息");
      return;
    }

    // 将字符串分数转换为数字
    const scoreValue = parseFloat(manualScore);

    // 检查分数是否有效
    if (manualScore === "" || isNaN(scoreValue)) {
      antdMessage.warning("请输入有效的分数");
      return;
    }

    // 检查分数是否在有效范围内
    if (scoreValue < 0 || scoreValue > maxScore) {
      antdMessage.warning(`分数必须在0到${maxScore}分之间`);
      return;
    }

    // 检查分数是否与当前分数相同
    if (scoreValue === studentAnswer?.score) {
      antdMessage.info("分数未发生变化");
      return;
    }

    setIsSubmittingScore(true);
    try {
      // 准备请求参数，确保分数是数字类型
      const requestData = {
        grading_id: gradingId,
        student_no: currentStudent.student_no, 
        question_id: currentQuestionId,
        question_type: currentQuestion.question_type, // 题目类型
        old_score: Number(studentAnswer?.score || 0), // 确保是数字类型
        new_score: Number(scoreValue), // 确保是数字类型
      };
      
      // 调用新的API接口提交手动改分（PUT方法）
      const response = await request.put(`/exam-question/grading/score-update`, requestData);

      if (response.code === "200" || response.code === 200) {
        antdMessage.success("改分成功");
        
        // 立即更新学生答案数据，避免闪回
        setStudentAnswer({
          ...studentAnswer,
          score: scoreValue,
        });

        // 设置标志位，防止useEffect重复获取覆盖刚改的分数
        justUpdatedScoreRef.current = true;

        // 刷新学生列表以更新总分（不会影响当前答案显示）
        request.get(`/exam-question/student-list`, {
          grading_id: gradingId,
        }).then((studentsRes) => {
          if (studentsRes.data && studentsRes.data.length > 0) {
            setStudents(studentsRes.data);
          }
        }).catch((error) => {
          console.error("刷新学生列表失败:", error);
        });
      } else {
        antdMessage.error(response.message || "改分失败");
      }
    } catch (error) {
      console.error("提交改分失败:", error);
      const errorMsg = error.response?.data?.message || error.message || "提交改分失败，请稍后重试";
      antdMessage.error(errorMsg);
    } finally {
      setIsSubmittingScore(false);
    }
  };

  // 数字键盘按钮点击处理
  const handleNumberClick = (num) => {
    const maxScore = questionDetail?.score;
    
    // 如果没有满分信息，不允许操作
    if (!maxScore || maxScore <= 0) {
      antdMessage.warning("无法获取题目满分信息");
      return;
    }
    
    if (num === ".5") {
      // 点击 .5 按钮：在当前整数基础上加 0.5
      const currentValue = parseFloat(manualScore);
      const integerPart = Math.floor(currentValue); // 获取整数部分
      const newValue = integerPart + 0.5;
      
      // 检查是否超过满分
      if (newValue > maxScore) {
        antdMessage.warning(`分数不能超过满分${maxScore}分`);
        return;
      }
      
      // 如果当前已经是 x.5 格式，保持不变
      if (manualScore.includes(".5") && parseFloat(manualScore) === newValue) {
        return;
      }
      
      setManualScore(String(newValue));
      setInputHistory([String(newValue)]); // 记录为单个块
    } else {
      // 点击数字按钮 0-9：直接替换为该数字
      const numValue = parseFloat(num);
      
      // 检查是否超过满分
      if (numValue > maxScore) {
        antdMessage.warning(`分数不能超过满分${maxScore}分`);
        return;
      }
      
      // 如果和当前值相同，不做任何操作
      if (parseFloat(manualScore) === numValue) {
        return;
      }
      
      setManualScore(num);
      setInputHistory([num]); // 记录为单个块
    }
  };

  // 退格按钮处理
  const handleBackspace = () => {
    // 如果当前是 "0"，不做任何操作
    if (manualScore === "0") {
      return;
    }
    
    // 如果当前是 x.5 格式，去掉 .5，变成整数
    if (manualScore.includes(".5")) {
      const integerPart = Math.floor(parseFloat(manualScore));
      setManualScore(String(integerPart));
      setInputHistory([String(integerPart)]);
    } else {
      // 如果当前是整数，退格到 0
      setManualScore("0");
      setInputHistory([]);
    }
  };

  // 满分按钮处理
  const handleFullScore = () => {
    const fullScore = questionDetail?.score;
    if (!fullScore || fullScore <= 0) {
      antdMessage.warning("无法获取题目满分信息");
      return;
    }
    setManualScore(String(fullScore));
    setInputHistory([String(fullScore)]); // 记录满分值，以便退格删除
  };

  // 零分按钮处理
  const handleZeroScore = () => {
    setManualScore("0");
    setInputHistory(["0"]); // 记录零分值，以便退格删除
  };

  // 展开折叠状态
  const [choiceExpanded, setChoiceExpanded] = useState(false);
  const [nonChoiceExpanded, setNonChoiceExpanded] = useState(true);

  const essayContentRef = useRef(null);
  const questionsContainerRef = useRef(null);
  const [questionsPerRow, setQuestionsPerRow] = useState(8); // 默认值为8

  // 计算一行能显示的题目数量
  useEffect(() => {
    const calculateQuestionsPerRow = () => {
      if (questionsContainerRef.current) {
        const containerWidth = questionsContainerRef.current.clientWidth;
        const questionWidth = 48; // 每个题目按钮的宽度(40px) + 左右边距(4px*2)
        const availableWidth = containerWidth - 120; // 减去其他元素占用的宽度
        const count = Math.max(1, Math.floor(availableWidth / questionWidth));
        // console.log("count", count, containerWidth);
        setQuestionsPerRow(count);
      }
    };

    // 初始化计算
    calculateQuestionsPerRow();

    // 监听窗口大小变化
    window.addEventListener("resize", calculateQuestionsPerRow);

    // 清理函数
    return () => {
      window.removeEventListener("resize", calculateQuestionsPerRow);
    };
  }, []);

  // 切换学生
  const handlePrevStudent = () => {
    if (currentStudentIndex > 0) {
      setCurrentStudentIndex(currentStudentIndex - 1);
    }
  };

  const handleNextStudent = () => {
    if (currentStudentIndex < students.length - 1) {
      setCurrentStudentIndex(currentStudentIndex + 1);
    }
  };

  return (
    <div className="question-grading-container">
      <div className="question-grading-content">
        {/* 左侧：学生信息 */}
        <div className="left-panel">
          <div className="student-navigation">
            <h3>
              <UserSwitchOutlined style={{ marginRight: "4px" }} /> 学生导航
            </h3>
            <div className="navigation-controls">
              <Button
                icon={<LeftOutlined />}
                onClick={handlePrevStudent}
                disabled={currentStudentIndex === 0}
              />
              <span>
                {currentStudentIndex + 1}/{students.length}
              </span>
              <Button
                icon={<RightOutlined />}
                onClick={handleNextStudent}
                disabled={currentStudentIndex === students.length - 1}
              />
            </div>
          </div>
          <div className="student-list">
            {students.map((student, index) => (
              <div
                key={student.id}
                className={`student-item ${
                  index === currentStudentIndex ? "active" : ""
                }`}
                onClick={() => setCurrentStudentIndex(index)}
              >
                <div className="student-info">
                  <div className="student-name">{student.student_name}</div>
                </div>
                <div className="student-score-section">
                  <div className="student-score">{student.score}分</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 中间：题目数据展示 */}
        <div className="center-panel" ref={essayContentRef}>
          <div className="question-grading-header">
            <div
              className="question-grading-title"
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
              }}
            >
              {/* <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>
                {currentStudent?.name} - 第{questionDetail?.id || 1}题
              </h2> */}

              {/* 题目序号切换按钮 - 区分选择题和非选择题 */}
              {questions && questions.length > 0 && (
                <div
                  style={{
                    marginLeft: "16px",
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                  }}
                >
                  {/* 选择题组 */}
                  <div
                    ref={questionsContainerRef}
                    style={{
                      marginBottom: "12px",
                      display: "flex",
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        marginBottom: "8px",
                        cursor: "pointer",
                        width: 80,
                      }}
                      onClick={() => setChoiceExpanded(!choiceExpanded)}
                    >
                      <span style={{ marginRight: "8px", fontWeight: "bold" }}>
                        选择题
                      </span>
                      <span>{choiceExpanded ? "▼" : "▶"}</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        flex: 1,
                        marginLeft: "20px",
                      }}
                    >
                      <div style={{ display: "flex" }}>
                        {/* 第一行题目，总是显示 */}
                        {questions
                          .filter((q) => q.question_type === "choice")
                          .slice(0, questionsPerRow)
                          .map((question) => {
                            return (
                              <span
                                key={question.question_id}
                                onClick={() =>
                                  setCurrentQuestionId(question.question_id)
                                }
                                style={{
                                  width: "40px",
                                  height: "30px",
                                  margin: "0 4px",
                                  borderRadius: "4px",
                                  border: "1px solid #d9d9d9",
                                  backgroundColor:
                                    question.question_id === currentQuestionId
                                      ? "oklch(.7 .2 254)"
                                      : "#fff",
                                  color:
                                    question.question_id === currentQuestionId
                                      ? "#fff"
                                      : "#000",
                                  cursor: "pointer",
                                  fontSize: "14px",
                                  fontWeight: "bold",
                                  lineHeight: "30px",
                                  textAlign: "center",
                                }}
                              >
                                {question.question_id}
                              </span>
                            );
                          })}
                      </div>
                      {choiceExpanded && (
                        <>
                          {/* 第二行及之后的题目，每行显示questionsPerRow个 */}
                          {
                            // 将剩余题目分组，每组questionsPerRow个
                            Array.from({
                              length: Math.ceil(
                                questions
                                  .filter((q) => q.question_type === "choice")
                                  .slice(questionsPerRow).length /
                                  questionsPerRow
                              ),
                            }).map((_, rowIndex) => {
                              const start = rowIndex * questionsPerRow;
                              const end = start + questionsPerRow;
                              const rowQuestions = questions
                                .filter((q) => q.question_type === "choice")
                                .slice(questionsPerRow)
                                .slice(start, end);

                              return (
                                <div
                                  key={`choice-row-${rowIndex}`}
                                  style={{
                                    display: "flex",
                                    marginTop: "8px",
                                  }}
                                >
                                  {rowQuestions.map((question) => {
                                    return (
                                      <span
                                        key={question.question_id}
                                        onClick={() =>
                                          setCurrentQuestionId(
                                            question.question_id
                                          )
                                        }
                                        style={{
                                          width: "40px",
                                          height: "30px",
                                          margin: "0 4px",
                                          borderRadius: "4px",
                                          border: "1px solid #d9d9d9",
                                          backgroundColor:
                                            question.question_id ===
                                            currentQuestionId
                                              ? "oklch(.7 .2 254)"
                                              : "#fff",
                                          color:
                                            question.question_id ===
                                            currentQuestionId
                                              ? "#fff"
                                              : "#000",
                                          cursor: "pointer",
                                          fontSize: "14px",
                                          fontWeight: "bold",
                                          lineHeight: "30px",
                                          textAlign: "center",
                                        }}
                                      >
                                        {question.question_id}
                                      </span>
                                    );
                                  })}
                                </div>
                              );
                            })
                          }
                        </>
                      )}
                    </div>
                  </div>
                  {/* 选择题组 */}
                  <div
                    ref={questionsContainerRef}
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        marginBottom: "8px",
                        cursor: "pointer",
                        justifyContent: "flex-end",
                        width: 80,
                      }}
                      onClick={() => setNonChoiceExpanded(!nonChoiceExpanded)}
                    >
                      <span style={{ marginRight: "8px", fontWeight: "bold" }}>
                        非选择题
                      </span>
                      <span>{nonChoiceExpanded ? "▼" : "▶"}</span>
                    </div>
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        flexWrap: "wrap",
                        marginLeft: "20px",
                      }}
                    >
                      {/* 第一个题目，总是显示 */}
                      {questions
                        .filter((q) => q.question_type !== "choice")
                        .slice(0, questionsPerRow)
                        .map((question) => {
                          return (
                            <span
                              key={question.question_id}
                              onClick={() =>
                                setCurrentQuestionId(question.question_id)
                              }
                              style={{
                                width: "40px",
                                height: "30px",
                                margin: "0 4px",
                                borderRadius: "4px",
                                border: "1px solid #d9d9d9",
                                backgroundColor:
                                  question.question_id === currentQuestionId
                                    ? "oklch(.7 .2 254)"
                                    : "#fff",
                                color:
                                  question.question_id === currentQuestionId
                                    ? "#fff"
                                    : "#000",
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: "bold",
                                lineHeight: "30px",
                                textAlign: "center",
                              }}
                            >
                              {question.question_id}
                            </span>
                          );
                        })}

                      {/* 其他题目，根据展开状态决定是否显示 */}
                      {nonChoiceExpanded && (
                        <>
                          {/* 第二行及之后的非选择题，每行显示questionsPerRow个 */}
                          {
                            // 将剩余非选择题分组，每组questionsPerRow个
                            Array.from({
                              length: Math.ceil(
                                questions
                                  .filter((q) => q.question_type !== "choice")
                                  .slice(questionsPerRow).length /
                                  questionsPerRow
                              ),
                            }).map((_, rowIndex) => {
                              const start = rowIndex * questionsPerRow;
                              const end = start + questionsPerRow;
                              const rowQuestions = questions
                                .filter((q) => q.question_type !== "choice")
                                .slice(questionsPerRow)
                                .slice(start, end);
                              return (
                                <div
                                  key={`non-choice-row-${rowIndex}`}
                                  style={{
                                    display: "flex",
                                    marginTop: "8px",
                                  }}
                                >
                                  {rowQuestions.map((question) => {
                                    return (
                                      <span
                                        key={question.id}
                                        onClick={() =>
                                          setCurrentQuestionId(
                                            question.question_id
                                          )
                                        }
                                        style={{
                                          width: "40px",
                                          height: "30px",
                                          margin: "0 4px",
                                          borderRadius: "4px",
                                          border: "1px solid #d9d9d9",
                                          backgroundColor:
                                            question.question_id ===
                                            currentQuestionId
                                              ? "oklch(.7 .2 254)"
                                              : "#fff",
                                          color:
                                            question.question_id ===
                                            currentQuestionId
                                              ? "#fff"
                                              : "#000",
                                          cursor: "pointer",
                                          fontSize: "14px",
                                          fontWeight: "bold",
                                          lineHeight: "30px",
                                          textAlign: "center",
                                        }}
                                      >
                                        {question.question_id}
                                      </span>
                                    );
                                  })}
                                </div>
                              );
                            })
                          }
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <Button type="default" onClick={() => (window.location.href = "/")}>
              返回首页
            </Button>
          </div>
          <div className="question-card">
            <div className="question-content">
              <div
                className="answer-image-container"
                style={{
                  border: "1px solid #e8e8e8",
                  borderRadius: "8px",
                  padding: "20px",
                  backgroundColor: "white",
                }}
              >
                <div
                  style={{
                    textAlign: "center",
                    fontSize: "16px",
                    fontWeight: "bold",
                    marginBottom: "16px",
                    color: "oklch(.145 0 0)",
                  }}
                >
                  第{questionDetail.question_id}题
                </div>
                {/* <div
                  style={{
                    textAlign: "center",
                    marginBottom: "20px",
                    fontSize: "14px",
                    color: "#666",
                  }}
                >
                  姓名：{currentStudent?.name} 学号：{currentStudent?.id}
                </div> */}
                <div
                  style={{
                    backgroundColor: "oklch(.97 .014 254.604)",
                    borderRadius: "8px",
                    padding: "16px",
                    marginBottom: "16px",
                    width: "100%",
                    border: "1px solid oklch(.882 .059 254.128)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "bold",
                      color: "#1890ff",
                      marginBottom: "12px",
                    }}
                  >
                    学生答案：
                  </div>
                  <div
                    style={{
                      backgroundColor: "white",
                      border: "1px solid #d9d9d9",
                      borderRadius: "4px",
                      padding: "16px",
                      fontSize: "14px",
                      lineHeight: "1.8",
                      textAlign: "center",
                    }}
                  >
                    {studentAnswer.answer_photo_url ? (
                      <img
                        src={studentAnswer.answer_photo_url}
                        alt="学生答案"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "400px",
                          objectFit: "contain",
                        }}
                      />
                    ) : (
                      <div style={{ color: "#999" }}>暂无学生答案</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="score-section">
              <h3>得分</h3>
              <div className="score-display">
                <span className="score-number">
                  {studentAnswer?.score || 0}
                </span>
                <span className="score-max">/ {questionDetail?.score}</span>
              </div>
            </div>
            <div className="scoring-criteria-section">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <h4 style={{ margin: 0 }}>作答分析</h4>
              </div>

              <div
                style={{
                  backgroundColor: "#f0f7ff",
                  padding: "16px",
                  borderRadius: "6px",
                  border: "1px solid #e0e7ff",
                }}
              >
                <div style={{ marginBottom: "12px" }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      lineHeight: "1.5",
                    }}
                  >
                    {studentAnswer.score_reason || "暂无作答分析"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：题目信息 */}
        <div className="right-panel">
          {questionDetail ? (
            <>
              {/* 题干 */}
              <div className="question-stem-section">
                <h4 style={{ marginBottom: "12px" }}>题干</h4>
                <div
                  style={{
                    backgroundColor: "#f9f9f9",
                    padding: "16px",
                    borderRadius: "6px",
                    border: "1px solid #e8e8e8",
                  }}
                >
                  <p style={{ margin: 0, lineHeight: "1.6" }}>
                    {questionDetail.question || "暂无题干信息"}
                  </p>
                </div>
              </div>

              {/* <Divider style={{ margin: "16px 0" }} /> */}

              {/* 参考答案 */}
              <div className="reference-answer-section">
                <h4 style={{ marginBottom: "12px" }}>参考答案</h4>
                <div
                  className="reference-answer-container"
                  style={{
                    backgroundColor: "oklch(.982 .018 155.826)",
                    padding: "16px",
                    borderRadius: "6px",
                    border: "1px solid oklch(.925 .084 155.995)",
                  }}
                >
                  <p style={{ margin: 0, lineHeight: "1.6", color: "#333" }}>
                    {questionDetail.answer || "暂无参考答案信息"}
                  </p>
                </div>
              </div>

              {/* <Divider style={{ margin: "16px 0" }} /> */}

              {/* 评分标准 */}
              <div className="scoring-criteria-section">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  <h4 style={{ margin: 0 }}>评分要点</h4>
                </div>

                <div
                  style={{
                    backgroundColor: "#f0f7ff",
                    padding: "16px",
                    borderRadius: "6px",
                    border: "1px solid #e0e7ff",
                  }}
                >
                  <div style={{ marginBottom: "12px" }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "14px",
                        lineHeight: "1.5",
                      }}
                    >
                      {questionDetail.score_standard || "暂无评分要点信息"}
                    </p>
                  </div>
                </div>
              </div>

              {/* 手动改分区域 - 只在非选择题时显示 */}
              {(() => {
                const currentQuestion = questions.find(
                  (q) => q.question_id === currentQuestionId
                );
                
                // 只在非选择题时显示
                return currentQuestion?.question_type !== "choice" ? (
                  <div className="manual-score-section">
                    <h4 style={{ margin: "0 0 12px 0" }}>
                      <EditOutlined style={{ marginRight: "8px" }} />
                      手动改分
                    </h4>
                    <div className="score-keyboard">
                      {/* 顶部显示区域 */}
                      <div className="score-display-row">
                        <div className="score-input-display">
                          {manualScore || "0"}
                        </div>
                        <button
                          className="score-btn score-btn-backspace"
                          onClick={handleBackspace}
                          disabled={isSubmittingScore || manualScore === "0"}
                          title="退格"
                        >
                          ⌫
                        </button>
                      </div>

                      {/* 快捷按钮行 */}
                      <div className="score-quick-buttons">
                        <button
                          className="score-btn score-btn-quick"
                          onClick={handleFullScore}
                          disabled={isSubmittingScore}
                        >
                          满分
                        </button>
                        <button
                          className="score-btn score-btn-quick"
                          onClick={handleZeroScore}
                          disabled={isSubmittingScore}
                        >
                          零分
                        </button>
                        <button
                          className="score-btn score-btn-quick"
                          onClick={() => handleNumberClick(".5")}
                          disabled={isSubmittingScore}
                        >
                          .5
                        </button>
                      </div>

                      {/* 数字键盘 */}
                      <div className="score-number-grid">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                          <button
                            key={num}
                            className="score-btn score-btn-number"
                            onClick={() => handleNumberClick(String(num))}
                            disabled={isSubmittingScore}
                          >
                            {num}
                          </button>
                        ))}
                      </div>

                      {/* 底部：9和提交按钮 */}
                      <div className="score-bottom-row">
                        <button
                          className="score-btn score-btn-number"
                          onClick={() => handleNumberClick("9")}
                          disabled={isSubmittingScore}
                        >
                          9
                        </button>
                        <button
                          className="score-btn score-btn-submit"
                          onClick={handleSubmitManualScore}
                          disabled={
                            isSubmittingScore ||
                            manualScore === "" ||
                            parseFloat(manualScore) === studentAnswer?.score
                          }
                        >
                          {isSubmittingScore ? "提交中..." : "提交"}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}
            </>
          ) : (
            <div
              style={{ padding: "20px", textAlign: "center", color: "#999" }}
            >
              暂无题目信息
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionAnalysis;
