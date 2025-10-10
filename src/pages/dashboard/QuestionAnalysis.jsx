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
} from "antd";
import {
  LeftOutlined,
  RightOutlined,
  CheckCircleOutlined,
  EditOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";
import "./styles/QuestionAnalysis.css";

/**
 * 作文批改页面
 * 布局为左中右三部分，左右固定宽度，中间自适应
 */
const QuestionAnalysis = () => {
  const [searchParams] = useSearchParams();
  const _gradingId = searchParams.get("grading_id"); // 未来将用于从API获取数据

  // 模拟学生数据
  const [students, _setStudents] = useState([
    {
      id: "S001",
      name: "张明",
      score: 85,
      status: "AI批改",
      statusType: "success",
      questions: [
        {
          id: 1,
          type: "math",
          title: "函数性质分析",
          score: 18,
          totalScore: 20,
          answerImage: "https://via.placeholder.com/600x400?text=函数题答案",
          stem: "已知函数f(x) = x² + 2x + 1，求函数的性质并分析其图像特点。",
          referenceAnswer:
            "配方：f(x) = (x+1)²，开口向上的抛物线，顶点(-1,0)，对称轴x=-1",
        },
        {
          id: 2,
          type: "physics",
          title: "力学计算",
          score: 22,
          totalScore: 25,
          answerImage: "https://via.placeholder.com/600x400?text=力学题答案",
          stem: "一个质量为2kg的物体从高度为10m的斜面顶端由静止滑下，斜面的倾角为30度，动摩擦因数为0.2。求物体滑到斜面底端时的速度。(g=10m/s²)",
          referenceAnswer:
            "根据能量守恒定律，重力势能转化为动能和克服摩擦力做功：mgh = 1/2 mv² + μmgcosθ·s，其中s=h/sinθ。代入数据计算得v≈11.8m/s。",
        },
        {
          id: 3,
          type: "chemistry",
          title: "化学反应方程式",
          score: 15,
          totalScore: 20,
          answerImage: "https://via.placeholder.com/600x400?text=化学题答案",
          stem: "写出氢气与氧气反应生成水的化学方程式，并配平。",
          referenceAnswer: "2H₂ + O₂ = 2H₂O（条件：点燃）",
        },
      ],
    },
    {
      id: "S002",
      name: "李华",
      score: 92,
      status: "手动批改",
      statusType: "processing",
      questions: [
        {
          id: 1,
          type: "math",
          title: "函数性质分析",
          score: 20,
          totalScore: 20,
          answerImage:
            "https://via.placeholder.com/600x400?text=函数题答案-李华",
          stem: "已知函数f(x) = x² + 2x + 1，求函数的性质并分析其图像特点。",
          referenceAnswer:
            "配方：f(x) = (x+1)²，开口向上的抛物线，顶点(-1,0)，对称轴x=-1",
        },
        {
          id: 2,
          type: "physics",
          title: "力学计算",
          score: 24,
          totalScore: 25,
          answerImage:
            "https://via.placeholder.com/600x400?text=力学题答案-李华",
          stem: "一个质量为2kg的物体从高度为10m的斜面顶端由静止滑下，斜面的倾角为30度，动摩擦因数为0.2。求物体滑到斜面底端时的速度。(g=10m/s²)",
          referenceAnswer:
            "根据能量守恒定律，重力势能转化为动能和克服摩擦力做功：mgh = 1/2 mv² + μmgcosθ·s，其中s=h/sinθ。代入数据计算得v≈11.8m/s。",
        },
        {
          id: 3,
          type: "chemistry",
          title: "化学反应方程式",
          score: 19,
          totalScore: 20,
          answerImage:
            "https://via.placeholder.com/600x400?text=化学题答案-李华",
          stem: "写出氢气与氧气反应生成水的化学方程式，并配平。",
          referenceAnswer: "2H₂ + O₂ = 2H₂O（条件：点燃）",
        },
      ],
    },
    {
      id: "S003",
      name: "王芳",
      score: 78,
      status: "AI待批",
      statusType: "warning",
      questions: [
        {
          id: 1,
          type: "math",
          title: "函数性质分析",
          score: 16,
          totalScore: 20,
          answerImage:
            "https://via.placeholder.com/600x400?text=函数题答案-王芳",
          stem: "已知函数f(x) = x² + 2x + 1，求函数的性质并分析其图像特点。",
          referenceAnswer:
            "配方：f(x) = (x+1)²，开口向上的抛物线，顶点(-1,0)，对称轴x=-1",
        },
        {
          id: 2,
          type: "physics",
          title: "力学计算",
          score: 20,
          totalScore: 25,
          answerImage:
            "https://via.placeholder.com/600x400?text=力学题答案-王芳",
          stem: "一个质量为2kg的物体从高度为10m的斜面顶端由静止滑下，斜面的倾角为30度，动摩擦因数为0.2。求物体滑到斜面底端时的速度。(g=10m/s²)",
          referenceAnswer:
            "根据能量守恒定律，重力势能转化为动能和克服摩擦力做功：mgh = 1/2 mv² + μmgcosθ·s，其中s=h/sinθ。代入数据计算得v≈11.8m/s。",
        },
        {
          id: 3,
          type: "chemistry",
          title: "化学反应方程式",
          score: 17,
          totalScore: 20,
          answerImage:
            "https://via.placeholder.com/600x400?text=化学题答案-王芳",
          stem: "写出氢气与氧气反应生成水的化学方程式，并配平。",
          referenceAnswer: "2H₂ + O₂ = 2H₂O（条件：点燃）",
        },
      ],
    },
  ]);

  // 当前选中的学生
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0);
  const currentStudent = students[currentStudentIndex];

  // 当前选中的题目
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const currentQuestion = currentStudent?.questions?.[currentQuestionIndex];

  // 评分相关
  const [score, setScore] = useState(currentStudent?.score || 0);

  const essayContentRef = useRef(null);

  // 当选中学生变化时，更新评分和当前题目索引
  useEffect(() => {
    if (currentStudent) {
      setScore(currentStudent.score);
      setCurrentQuestionIndex(0);
    }
  }, [currentStudent]);

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
                  <div className="student-name">{student.name}</div>
                  <div className="student-id">学号：{student.id}</div>
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
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>
                {currentStudent?.name} - 第{currentQuestion?.id || 1}题
              </h2>

              {/* 题目序号切换按钮 */}
              {currentStudent?.questions && (
                <div style={{ marginLeft: "16px", display: "flex" }}>
                  {currentStudent.questions.map((question, index) => (
                    <span
                      key={question.id}
                      onClick={() => setCurrentQuestionIndex(index)}
                      style={{
                        width: "30px",
                        height: "30px",
                        margin: "0 4px",
                        borderRadius: "4px",
                        border: "none",
                        backgroundColor:
                          index === currentQuestionIndex ? "#000" : "#fff",
                        color: index === currentQuestionIndex ? "#fff" : "#000",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "bold",
                        lineHeight: "30px",
                        textAlign: "center",
                      }}
                    >
                      {question.id}
                    </span>
                  ))}
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
                  高二数学上学期期中考试 - 第{currentQuestion.id}题
                </div>
                <div
                  style={{
                    textAlign: "center",
                    marginBottom: "20px",
                    fontSize: "14px",
                    color: "#666",
                  }}
                >
                  姓名：{currentStudent?.name} 学号：{currentStudent?.id}
                </div>
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
                    }}
                  >
                    解：根据题意，设函数f(x) = x² + 2x + 1<br />
                    当x = -1时，f(-1) = 1 - 2 + 1 = 0<br />
                    所以函数在x = -1处有零点。
                  </div>
                </div>
              </div>
            </div>
            <div className="score-section">
              <h3>得分</h3>
              <div className="score-display">
                <span className="score-number">{score}</span>
                <span className="score-max">/ 100</span>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：题目信息 */}
        <div className="right-panel">
          {currentQuestion ? (
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
                    {currentQuestion.stem || "暂无题干信息"}
                  </p>
                </div>
              </div>

              <Divider style={{ margin: "16px 0" }} />

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
                    {currentQuestion.referenceAnswer || "暂无参考答案信息"}
                  </p>
                </div>
              </div>

              <Divider style={{ margin: "16px 0" }} />

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
                  <h4 style={{ margin: 0 }}>评分标准</h4>
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
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "8px",
                      }}
                    >
                      <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                        注意事项
                      </span>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "14px",
                        color: "#666",
                        lineHeight: "1.5",
                      }}
                    >
                      修改此题的答案或评分标准后，可对所有学生的此题进行重新批改。
                    </p>
                  </div>
                </div>
              </div>
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
