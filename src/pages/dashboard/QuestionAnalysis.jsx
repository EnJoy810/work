import React, { useState, useRef, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  Card,
  Row,
  Col,
  Button,
  Slider,
  Badge,
  Avatar,
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
  UserOutlined,
  DeleteOutlined,
  ReloadOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  getExamQuestionList, 
  getQuestionDetail, 
  getStudentList,
  getStudentGrading,
  updateQuestionScore
} from "../../api/question";
import { 
  getGradingResultsV2,
  alterStudentInfoByPaperId,
  deleteAllInfoByPaperId,
  createHumanGrading
} from "../../api/grading";
import { getStudentsByClassId } from "../../api/student";
import { Modal, Select, Tabs } from "antd";
import "./styles/QuestionAnalysis.css";

/**
 * 作文批改页面
 * 布局为左中右三部分，左右固定宽度，中间自适应
 */
const QuestionAnalysis = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const gradingId = searchParams.get("grading_id"); // 未来将用于从API获取数据
  const examId = searchParams.get("exam_id"); // 未来将用于从API获取数据
  const { selectedClassId } = useSelector((state) => state.class || {});
  // 题目数据，所有学生共用
  const [questions, setQuestions] = useState([]);
  // 学生数据（合并后的展示数据）
  const [students, setStudents] = useState([]);
  // 班级学生列表（用于修改匹配关系时选择）
  const [classStudents, setClassStudents] = useState([]);
  // 修改匹配关系相关状态
  const [isModifyMatchModalVisible, setIsModifyMatchModalVisible] = useState(false);
  const [currentModifyStudent, setCurrentModifyStudent] = useState(null);
  const [selectedClassStudentId, setSelectedClassStudentId] = useState(null);
  const [isModifying, setIsModifying] = useState(false);
  // 删除相关状态
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [currentDeleteStudent, setCurrentDeleteStudent] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const manuallyMatchedPaperIdsRef = useRef(new Set());

  
  const [isManualEntryModalVisible, setIsManualEntryModalVisible] = useState(false);
  const [currentManualEntryStudent, setCurrentManualEntryStudent] = useState(null);
  const [isManualEntrySubmitting, setIsManualEntrySubmitting] = useState(false);

  const getClassStudentName = (student, fallbackIndex = 0) => {
    const nameCandidate =
      student?.student_name ||
      student?.studentName ||
      student?.name ||
      student?.displayName ||
      student?.real_name ||
      student?.realName ||
      student?.full_name ||
      student?.fullName ||
      student?.nickname ||
      student?.nick_name;
    if (nameCandidate && String(nameCandidate).trim()) {
      return String(nameCandidate).trim();
    }
    const noCandidate =
      student?.student_no ||
      student?.studentNo ||
      student?.student_code ||
      student?.studentCode ||
      student?.exam_no ||
      student?.examNo;
    if (noCandidate && String(noCandidate).trim()) {
      return String(noCandidate).trim();
    }
    return `学生${fallbackIndex + 1}`;
  };

  const getClassStudentNo = (student) => {
    return (
      student?.student_no ||
      student?.studentNo ||
      student?.student_code ||
      student?.studentCode ||
      student?.student_id ||
      student?.studentId ||
      student?.exam_no ||
      student?.examNo ||
      student?.paper_id ||
      student?.paperId ||
      student?.enrollment_no ||
      student?.enrollmentNo ||
      student?.account ||
      ""
    );
  };

  const getClassStudentKey = (student, index) => {
    const keyCandidate =
      student?._rowKey ||
      student?.classStudentId ||
      student?.class_student_id ||
      student?.id ||
      student?.student_id ||
      student?.studentId ||
      student?.binding_id ||
      student?.bindingId ||
      student?.student_no ||
      student?.studentNo ||
      student?.paper_id ||
      student?.paperId ||
      student?.exam_no ||
      student?.examNo;
    if (keyCandidate !== undefined && keyCandidate !== null && keyCandidate !== "") {
      return String(keyCandidate);
    }
    return `idx-${index}`;
  };

  // 当班级或批次发生切换时，重置手动匹配记录
  useEffect(() => {
    manuallyMatchedPaperIdsRef.current.clear();
  }, [selectedClassId, gradingId]);

  // 从API同时获取题目数据和学生数据
  useEffect(() => {
    const fetchExamData = async () => {
      try {
        // 获取题目数据
        const questionsRes = await getExamQuestionList(examId);
        if (questionsRes.data && questionsRes.data.length > 0) {
          setQuestions(questionsRes.data);
          // 设置默认选中第一个题目
          setCurrentQuestionId(questionsRes.data[0].question_id);
        }

        // 获取班级学生列表、答题卡识别结果（v2接口）、答题卡列表
        const [classStudentsRes, v2Res, answerSheetRes] = await Promise.all([
          getStudentsByClassId(selectedClassId).catch(() => ({ data: [] })),
          getGradingResultsV2(gradingId).catch(() => ({ data: [] })),
          getStudentList(gradingId).catch(() => ({ data: [] })),
        ]);

        // 处理班级学生列表
        const classStudentsList = Array.isArray(classStudentsRes?.data) ? classStudentsRes.data : [];
        setClassStudents(classStudentsList);

        // 处理v2接口返回的数据（包含status状态）
        const v2Data = v2Res?.data;
        // v2接口返回结构：{ normal: [], absent: [], exceptional: [] }
        const v2Normal = Array.isArray(v2Data?.normal) ? v2Data.normal : [];
        const v2Abnormal = Array.isArray(v2Data?.abnormal) ? v2Data.abnormal : [];
        const v2Exceptional = Array.isArray(v2Data?.exceptional) ? v2Data.exceptional : [];
        const v2Absent = Array.isArray(v2Data?.absent) ? v2Data.absent : [];
        
        // 合并正常和异常学生（用于处理答题卡数据）
        const v2List = [...v2Normal, ...v2Abnormal, ...v2Exceptional];

        // 构建答题卡识别结果映射（paper_id -> 答题卡信息）
        const answerSheetMap = new Map();
        if (Array.isArray(answerSheetRes?.data)) {
          answerSheetRes.data.forEach((item) => {
            const paperId = item.paper_id || item.student_no || item.id;
            if (paperId) {
              answerSheetMap.set(String(paperId), item);
            }
          });
        }

        // 合并数据：班级学生 + v2返回的学生
        const mergedStudents = [];

        // 1. 处理v2接口返回的学生（正常和异常）
        v2List.forEach((v2Item) => {
          const paperId = v2Item.paperId || v2Item.paper_id || v2Item.studentNo || v2Item.student_no || v2Item.id;
          const status = v2Item.status || "正常";
          const answerSheet = answerSheetMap.get(String(paperId)) || v2Item;

          // 判断是正常还是异常
          const isNormal = status === "正常" || status === "normal" || status === "0";
          const isAbnormal = status === "异常" || status === "abnormal" || status === "1";

          if (isNormal) {
            // 正常学生：尝试匹配班级学生
            const matchedClassStudent = classStudentsList.find(
              (cs) =>
                (cs.student_name === v2Item.studentName || cs.student_name === v2Item.student_name) &&
                (cs.student_no === v2Item.studentNo || cs.student_no === v2Item.student_no)
            );

            mergedStudents.push({
              type: "matched",
              classStudent: matchedClassStudent || null,
              answerSheet: answerSheet,
              v2Data: v2Item,
              paperId: String(paperId),
              status: "正常",
              displayName: matchedClassStudent?.student_name || v2Item.studentName || v2Item.student_name || "未知",
              recognizedName: v2Item.studentName || v2Item.student_name,
              recognizedNo: v2Item.studentNo || v2Item.student_no,
              score: v2Item.totalScore || v2Item.total_score || answerSheet.score,
              nameImageUrl: v2Item.student_name_img_url || answerSheet?.student_name_img_url || "",
            });
          } else if (isAbnormal) {
            // 异常学生
            mergedStudents.push({
              type: "abnormal",
              classStudent: null,
              answerSheet: answerSheet,
              v2Data: v2Item,
              paperId: String(paperId),
              status: "异常",
              displayName: v2Item.studentName || v2Item.student_name || "未知",
              recognizedName: v2Item.studentName || v2Item.student_name,
              recognizedNo: v2Item.studentNo || v2Item.student_no,
              score: v2Item.totalScore || v2Item.total_score || answerSheet.score,
              nameImageUrl: v2Item.student_name_img_url || answerSheet?.student_name_img_url || "",
            });
          }
        });

        // 2. 处理缺考学生（从v2接口的absent数组中获取）
        v2Absent.forEach((absentItem) => {
          // 通过student_no匹配班级学生
          const matchedClassStudent = classStudentsList.find(
            (cs) => 
              String(cs.student_no || cs.studentNo || "") === String(absentItem.student_no || "") ||
              String(cs.student_name || cs.studentName || "") === String(absentItem.student_name || "")
          );

          // 即使匹配不到班级学生，也显示缺考学生（使用v2接口的数据）
          const absentStudent = {
            type: "absent",
            classStudent: matchedClassStudent || null,
            answerSheet: null,
            v2Data: absentItem,
            paperId: null,
            status: "缺考",
            displayName: matchedClassStudent?.student_name || matchedClassStudent?.studentName || absentItem.student_name || "未知",
            recognizedName: null,
            recognizedNo: null,
            score: absentItem.score || 0,
            nameImageUrl: absentItem.student_name_img_url || "",
          };
          
          mergedStudents.push(absentStudent);
        });

        mergedStudents.sort((a, b) => {
          const typeOrder = { matched: 0, abnormal: 1, absent: 2 }; // 异常学生排在缺考学生前面
          const typeDiff = typeOrder[a.type] - typeOrder[b.type];
          if (typeDiff !== 0) return typeDiff;
          return (a.displayName || "").localeCompare(b.displayName || "");
        });

        setStudents(mergedStudents);
        setCurrentStudentIndex((prev) => {
          if (mergedStudents.length === 0) return 0;
          return prev >= mergedStudents.length ? mergedStudents.length - 1 : prev;
        });
      } catch (error) {
        console.error("获取考试数据失败:", error);
        antdMessage.error("获取考试数据失败，请稍后重试");
      }
    };

    fetchExamData();
  }, [gradingId, examId, selectedClassId]);

  // 当前选中的学生索引（基于过滤后的列表）
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0);
  
  // 学生状态筛选 Tab
  const [studentFilterTab, setStudentFilterTab] = useState("all");

  // 根据选中的 tab 过滤学生
  const getFilteredStudents = () => {
    if (studentFilterTab === "matched") {
      return students.filter((s) => s.type === "matched");
    } else if (studentFilterTab === "absent") {
      return students.filter((s) => s.type === "absent");
    } else if (studentFilterTab === "abnormal") {
      return students.filter((s) => s.type === "abnormal");
    }
    return students;
  };

  const filteredStudents = getFilteredStudents();
  const currentStudent = filteredStudents[currentStudentIndex];

  // 当过滤后的学生列表变化时，确保索引有效
  useEffect(() => {
    if (filteredStudents.length === 0) {
      setCurrentStudentIndex(0);
    } else if (currentStudentIndex >= filteredStudents.length) {
      setCurrentStudentIndex(Math.max(0, filteredStudents.length - 1));
    }
  }, [studentFilterTab, filteredStudents.length, currentStudentIndex]);

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
          const detailRes = await getQuestionDetail({
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
    
    // 如果刚刚更新过分数，跳过本次获取（避免覆盖刚改的分数）
    if (justUpdatedScoreRef.current) {
      justUpdatedScoreRef.current = false;
      return;
    }
    
    const fetchStudentAnswer = async () => {
      if (currentStudent && gradingId) {
        // 缺考学生没有答题卡，不需要获取答案
        if (currentStudent.type === "absent" || !currentStudent.paperId) {
          setStudentAnswer({});
          setManualScore("0");
          setInputHistory([]);
          return;
        }

        try {
          // 使用 paper_id 作为学生唯一标识
          const paperId = currentStudent.paperId;
          if (!paperId) {
            console.error("学生唯一标识不存在（paper_id为空）");
            return;
          }

          // 使用GET方法，参数作为查询参数
          const answerRes = await getStudentGrading({
            grading_id: gradingId,
            paper_id: paperId,
            question_id: currentQuestionId,
          });
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
        paper_id: currentStudent.paperId || currentStudent.paper_id || currentStudent.student_no || currentStudent.id,
        question_id: currentQuestionId,
        question_type: currentQuestion.question_type, // 题目类型
        old_score: Number(studentAnswer?.score || 0), // 确保是数字类型
        new_score: Number(scoreValue), // 确保是数字类型
      };
      
      // 调用新的API接口提交手动改分（PUT方法）
      const response = await updateQuestionScore(requestData);

      if (response.code === "200" || response.code === 200) {
        antdMessage.success("改分成功");
        
        // 立即更新学生答案数据，避免闪回
        setStudentAnswer({
          ...studentAnswer,
          score: scoreValue,
        });

        // 设置标志位，防止useEffect重复获取覆盖刚改的分数
        justUpdatedScoreRef.current = true;

        // 刷新学生列表以更新总分（不会影响当前答案显示），并保留现有的状态与 paper_id
        getStudentList(gradingId)
          .then((studentsRes) => {
            if (studentsRes.data && studentsRes.data.length > 0) {
              const prevStatusByKey = new Map(
                (students || []).map((s) => {
                  const k = s.paper_id || s.student_no || s.id;
                  return [String(k), s.status];
                })
              );
              const merged = studentsRes.data.map((stu) => {
                const key = stu.paper_id || stu.student_no || stu.id;
                const status =
                  prevStatusByKey.get(String(key)) ??
                  stu.status ??
                  stu.result_status ??
                  stu.review_status ??
                  stu.state;
                return { ...stu, paper_id: stu.paper_id ?? key, status };
              });
              setStudents(merged);
            }
          })
          .catch((error) => {
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
        // 初始化计算
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
    const filtered = getFilteredStudents();
    if (currentStudentIndex < filtered.length - 1) {
      setCurrentStudentIndex(currentStudentIndex + 1);
    }
  };

  // 刷新学生数据
  const refreshStudentData = async () => {
    try {
      const [classStudentsRes, v2Res, answerSheetRes] = await Promise.all([
        getStudentsByClassId(selectedClassId).catch(() => ({ data: [] })),
        getGradingResultsV2(gradingId).catch(() => ({ data: [] })),
        getStudentList(gradingId).catch(() => ({ data: [] })),
      ]);

      const classStudentsList = Array.isArray(classStudentsRes?.data) ? classStudentsRes.data : [];
      setClassStudents(classStudentsList);

      const v2Data = v2Res?.data;
      // v2接口返回结构：{ normal: [], absent: [], exceptional: [] }
      const v2Normal = Array.isArray(v2Data?.normal) ? v2Data.normal : [];
      const v2Abnormal = Array.isArray(v2Data?.abnormal) ? v2Data.abnormal : [];
      const v2Exceptional = Array.isArray(v2Data?.exceptional) ? v2Data.exceptional : [];
      const v2Absent = Array.isArray(v2Data?.absent) ? v2Data.absent : [];
      // 合并正常和异常学生（用于处理答题卡数据）
      const v2List = [...v2Normal, ...v2Abnormal, ...v2Exceptional];

      const answerSheetMap = new Map();
      if (Array.isArray(answerSheetRes?.data)) {
        answerSheetRes.data.forEach((item) => {
          const paperId = item.paper_id || item.student_no || item.id;
          if (paperId) {
            answerSheetMap.set(String(paperId), item);
          }
        });
      }

      const mergedStudents = [];

      const updatedManualMatched = new Set(manuallyMatchedPaperIdsRef.current);

      const seenPaperIds = new Set();

      v2List.forEach((v2Item) => {
        const paperId =
          v2Item.paperId ||
          v2Item.paper_id ||
          v2Item.studentNo ||
          v2Item.student_no ||
          v2Item.id;
        if (!paperId) {
          return;
        }
        const paperIdStr = String(paperId);
        seenPaperIds.add(paperIdStr);
        const status = v2Item.status || v2Item.result_status || v2Item.review_status || "正常";
        const answerSheet = answerSheetMap.get(String(paperId)) || v2Item;

        const normalizedStatus = String(status).toLowerCase();
        const isNormalFromServer =
          normalizedStatus === "正常" ||
          normalizedStatus === "normal" ||
          normalizedStatus === "0" ||
          normalizedStatus === "matched";
        const isAbnormalFromServer =
          normalizedStatus === "异常" ||
          normalizedStatus === "abnormal" ||
          normalizedStatus === "1" ||
          normalizedStatus === "exceptional";

        const isManualOverride = updatedManualMatched.has(paperIdStr);

        const isNormal = isManualOverride || isNormalFromServer;
        const isAbnormal = !isNormal && isAbnormalFromServer;

        if (isNormalFromServer && updatedManualMatched.has(paperIdStr)) {
          updatedManualMatched.delete(paperIdStr);
        }

        if (isNormal) {
          const matchedClassStudent = classStudentsList.find(
            (cs) =>
              (cs.student_name === v2Item.studentName || cs.student_name === v2Item.student_name) &&
              (cs.student_no === v2Item.studentNo || cs.student_no === v2Item.student_no)
          );

          mergedStudents.push({
            type: "matched",
            classStudent: matchedClassStudent || null,
            answerSheet: answerSheet,
            v2Data: v2Item,
            paperId: String(paperId),
            status: "正常",
            displayName: matchedClassStudent?.student_name || v2Item.studentName || v2Item.student_name || "未知",
            recognizedName: v2Item.studentName || v2Item.student_name,
            recognizedNo: v2Item.studentNo || v2Item.student_no,
            score: v2Item.totalScore || v2Item.total_score || answerSheet.score,
            nameImageUrl: v2Item.student_name_img_url || answerSheet?.student_name_img_url || "",
          });
        } else if (isAbnormal) {
          mergedStudents.push({
            type: "abnormal",
            classStudent: null,
            answerSheet: answerSheet,
            v2Data: v2Item,
            paperId: String(paperId),
            status: "异常",
            displayName: v2Item.studentName || v2Item.student_name || "未知",
            recognizedName: v2Item.studentName || v2Item.student_name,
            recognizedNo: v2Item.studentNo || v2Item.student_no,
            score: v2Item.totalScore || v2Item.total_score || answerSheet.score,
            nameImageUrl: v2Item.student_name_img_url || answerSheet?.student_name_img_url || "",
          });
        }
      });

      updatedManualMatched.forEach((manualId) => {
        if (!seenPaperIds.has(manualId)) {
          updatedManualMatched.delete(manualId);
        }
      });

      manuallyMatchedPaperIdsRef.current = updatedManualMatched;

      // 处理缺考学生（从v2接口的absent数组中获取）
      v2Absent.forEach((absentItem) => {
        // 通过student_no匹配班级学生
        const matchedClassStudent = classStudentsList.find(
          (cs) => 
            String(cs.student_no || cs.studentNo || "") === String(absentItem.student_no || "") ||
            String(cs.student_name || cs.studentName || "") === String(absentItem.student_name || "")
        );

        // 即使匹配不到班级学生，也显示缺考学生（使用v2接口的数据）
        mergedStudents.push({
          type: "absent",
          classStudent: matchedClassStudent || null,
          answerSheet: null,
          v2Data: absentItem,
          paperId: null,
          status: "缺考",
          displayName: matchedClassStudent?.student_name || matchedClassStudent?.studentName || absentItem.student_name || "未知",
          recognizedName: null,
          recognizedNo: null,
          score: absentItem.score || 0,
          nameImageUrl: absentItem.student_name_img_url || "",
        });
      });

      mergedStudents.sort((a, b) => {
        const typeOrder = { matched: 0, abnormal: 1, absent: 2 }; // 异常学生排在缺考学生前面
        const typeDiff = typeOrder[a.type] - typeOrder[b.type];
        if (typeDiff !== 0) return typeDiff;
        return (a.displayName || "").localeCompare(b.displayName || "");
      });

      setStudents(mergedStudents);

      // 处理当前选中学生的变化
      const currentPaperId = currentStudent?.paperId;
      if (currentPaperId) {
        const newIndex = mergedStudents.findIndex((s) => s.paperId === currentPaperId);
        if (newIndex !== -1) {
          setCurrentStudentIndex(newIndex);
        } else if (mergedStudents.length > 0) {
          setCurrentStudentIndex(0);
        }
      } else if (mergedStudents.length > 0 && currentStudentIndex >= mergedStudents.length) {
        setCurrentStudentIndex(0);
      }
    } catch (error) {
      console.error("刷新学生数据失败:", error);
      antdMessage.error("刷新数据失败，请稍后重试");
    }
  };

  // 处理修改匹配关系
  const handleModifyMatch = (student) => {
    setCurrentModifyStudent(student);
    setSelectedClassStudentId(null);
    setIsModifyMatchModalVisible(true);
  };

  const handleModifyMatchConfirm = async () => {
    if (!currentModifyStudent || !selectedClassStudentId) {
      antdMessage.warning("请选择要匹配的班级学生");
      return;
    }

    const selectedClassStudent = classStudentLookup.get(String(selectedClassStudentId));

    if (!selectedClassStudent) {
      antdMessage.error("选择的班级学生不存在");
      return;
    }

    const targetStudentNo = getClassStudentNo(selectedClassStudent);
    if (!targetStudentNo) {
      antdMessage.error("选中的班级学生缺少学号，无法匹配");
      return;
    }

    setIsModifying(true);
    try {
      await alterStudentInfoByPaperId({
        paperId: String(currentModifyStudent.paperId),
        studentNo: String(targetStudentNo).trim(),
        studentName: getClassStudentName(selectedClassStudent),
      });

      manuallyMatchedPaperIdsRef.current.add(String(currentModifyStudent.paperId));

      // 本地更新学生列表，提升界面响应速度
      setStudents((prevStudents) => {
        const updated = prevStudents.map((stu) => {
          if (String(stu.paperId) === String(currentModifyStudent.paperId)) {
            return {
              ...stu,
              type: "matched",
              status: "正常",
              classStudent: selectedClassStudent,
              displayName: getClassStudentName(selectedClassStudent),
              recognizedName:
                stu.recognizedName || getClassStudentName(selectedClassStudent),
              recognizedNo: stu.recognizedNo || targetStudentNo,
            };
          }
          return stu;
        });

        updated.sort((a, b) => {
          const typeOrder = { matched: 0, abnormal: 1, absent: 2 }; // 异常学生排在缺考学生前面
          const typeDiff = (typeOrder[a.type] || 3) - (typeOrder[b.type] || 3);
          if (typeDiff !== 0) return typeDiff;
          return (a.displayName || "").localeCompare(b.displayName || "");
        });

        const newIndex = updated.findIndex(
          (stu) => String(stu.paperId) === String(currentModifyStudent.paperId)
        );
        if (newIndex !== -1) {
          setCurrentStudentIndex(newIndex);
        }

        return updated;
      });

      antdMessage.success("修改匹配关系成功");
      setIsModifyMatchModalVisible(false);
      setCurrentModifyStudent(null);
      setSelectedClassStudentId(null);

      // 刷新数据
      await refreshStudentData();
    } catch (error) {
      console.error("修改匹配关系失败:", error);
      antdMessage.error(error?.response?.data?.message || error.message || "修改匹配关系失败");
    } finally {
      setIsModifying(false);
    }
  };

  // 处理删除异常学生
  const handleDeleteAbnormal = (student) => {
    setCurrentDeleteStudent(student);
    setIsDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!currentDeleteStudent) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAllInfoByPaperId({
        paper_id: currentDeleteStudent.paperId,
      });

      antdMessage.success("删除成功");
      setIsDeleteModalVisible(false);
      setCurrentDeleteStudent(null);

      // 刷新数据
      await refreshStudentData();
    } catch (error) {
      console.error("删除失败:", error);
      antdMessage.error(error?.response?.data?.message || error.message || "删除失败");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleManualEntry = (student) => {
    setCurrentManualEntryStudent(student);
    setIsManualEntryModalVisible(true);
  };

  const handleManualEntryConfirm = async () => {
    if (!currentManualEntryStudent) {
      setIsManualEntryModalVisible(false);
      return;
    }
    const studentNo = String(
      currentManualEntryStudent?.classStudent?.student_no ??
      currentManualEntryStudent?.classStudent?.studentNo ??
      currentManualEntryStudent?.v2Data?.student_no ??
      currentManualEntryStudent?.v2Data?.studentNo ??
      currentManualEntryStudent?.recognizedNo ??
      ""
    ).trim();
    const studentName =
      getClassStudentName(currentManualEntryStudent?.classStudent) ||
      currentManualEntryStudent?.v2Data?.student_name ||
      currentManualEntryStudent?.v2Data?.studentName ||
      currentManualEntryStudent?.displayName ||
      "";
    if (!studentNo) {
      antdMessage.warning("缺少学号，无法进行人工录入");
      return;
    }
    setIsManualEntrySubmitting(true);
    try {
      await createHumanGrading({
        student_no: studentNo,
        grading_id: gradingId,
        student_name: studentName,
      });
      setIsManualEntryModalVisible(false);
      setCurrentManualEntryStudent(null);
      const q = new URLSearchParams({ grading_id: String(gradingId || ""), exam_id: String(examId || "") }).toString();
      navigate(`/manual-review?${q}`);
    } catch (error) {
      const errMsg = error?.response?.data?.message || error.message || "创建人工阅卷任务失败";
      antdMessage.error(errMsg);
    } finally {
      setIsManualEntrySubmitting(false);
    }
  };

  const classStudentOptions = useMemo(() => {
    return classStudents.map((cs, index) => {
      const key = getClassStudentKey(cs, index);
      const name = getClassStudentName(cs, index);
      const studentNo = getClassStudentNo(cs);
      return {
        value: key,
        label: studentNo ? `${name}（${studentNo}）` : name,
      };
    });
  }, [classStudents]);

  const classStudentLookup = useMemo(() => {
    const map = new Map();
    classStudents.forEach((cs, index) => {
      const key = getClassStudentKey(cs, index);
      map.set(key, cs);
    });
    return map;
  }, [classStudents]);

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
                disabled={currentStudentIndex === 0 || filteredStudents.length === 0}
              />
              <span>
                {filteredStudents.length > 0 ? `${currentStudentIndex + 1}/${filteredStudents.length}` : "0/0"}
              </span>
              <Button
                icon={<RightOutlined />}
                onClick={handleNextStudent}
                disabled={currentStudentIndex >= filteredStudents.length - 1 || filteredStudents.length === 0}
              />
            </div>
          </div>
          {/* 学生状态筛选 Tab */}
          <div className="student-filter-tabs">
            <Tabs
              activeKey={studentFilterTab}
              onChange={(key) => {
                setStudentFilterTab(key);
                // 切换 tab 时，重置到第一个学生
                setCurrentStudentIndex(0);
              }}
              size="small"
              tabBarGutter={0}
              moreIcon={null}
              items={[
                {
                  key: "all",
                  label: "全部",
                },
                {
                  key: "matched",
                  label: "正常",
                },
                {
                  key: "absent",
                  label: "缺考",
                },
                {
                  key: "abnormal",
                  label: "异常",
                },
              ]}
            />
          </div>
          <div className="student-list">
            {(() => {
              // 确保 currentStudentIndex 在有效范围内
              if (currentStudentIndex >= filteredStudents.length && filteredStudents.length > 0) {
                setCurrentStudentIndex(Math.max(0, filteredStudents.length - 1));
              }

              // 按类型分组（用于显示分组标题），异常学生排在缺考学生前面
              const matchedStudents = filteredStudents.filter((s) => s.type === "matched");
              const abnormalStudents = filteredStudents.filter((s) => s.type === "abnormal");
              const absentStudents = filteredStudents.filter((s) => s.type === "absent");

              const renderStudentItem = (student, index) => {
                const isActive = index === currentStudentIndex;
                const typeColors = {
                  matched: { accent: "#52c41a", bg: "#ffffff", border: "#e8f5e9" },
                  abnormal: { accent: "#ff4d4f", bg: "#ffffff", border: "#ffa39e" },
                  absent: { accent: "#fa8c16", bg: "#ffffff", border: "#ffd591" },
                };
                const colors = typeColors[student.type] || typeColors.matched;

                return (
                  <div
                    key={
                      [
                        student.paperId,
                        student.v2Data?.paperId || student.v2Data?.paper_id,
                        student.v2Data?.student_no,
                        student.classStudent?.student_no,
                        student.recognizedNo,
                        student.displayName,
                        index,
                      ]
                        .filter((v) => v !== undefined && v !== null && String(v).length > 0)
                        .join("-")
                    }
                    className={`student-item ${isActive ? "active" : ""}`}
                    onClick={(e) => {
                      // 如果点击的是按钮，不触发选中
                      if (e.target.tagName === "BUTTON" || e.target.closest("button")) {
                        return;
                      }
                      setCurrentStudentIndex(index);
                    }}
                    style={{
                      backgroundColor: colors.bg,
                      border: `1px solid ${isActive ? colors.accent : colors.border}`,
                        borderRadius: 8,
                      marginBottom: 10,
                      padding: "14px 16px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      boxShadow: isActive
                        ? `0 2px 8px ${colors.accent}20, 0 1px 2px rgba(0,0,0,0.05)`
                        : "0 1px 2px rgba(0,0,0,0.04)",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.04)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }
                    }}
                  >
                    <div className="student-info" style={{ flex: 1, minWidth: 0 }}>
                      <div
                        className="student-name"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 16,
                          fontWeight: 600,
                          color: "#262626",
                          marginBottom: student.type !== "matched" ? 8 : 4,
                          lineHeight: 1.4,
                        }}
                      >
                        <span>{student.displayName}</span>
                        {student.nameImageUrl ? (
                          <img
                            src={student.nameImageUrl}
                            alt={student.displayName || student.recognizedNo || "学生姓名"}
                            style={{
                              width: "6em",
                              height: "2em",
                              objectFit: "cover",
                              borderRadius: 6,
                              border: "1px solid #f0f0f0",
                              pointerEvents: "auto",
                            }}
                          />
                        ) : null}
                      </div>
                      {student.type !== "abnormal" ? (
                        <div style={{ fontSize: 12, color: "#8c8c8c", marginTop: 4 }}>
                          学号：
                          {student.classStudent?.student_no ||
                            student.classStudent?.studentNo ||
                            student.recognizedNo ||
                            student.v2Data?.student_no ||
                            "未知"}
                        </div>
                      ) : null}
                    </div>
                    <div
                      className="student-score-section"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: 8,
                        marginTop: 4,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {student.type !== "matched" && (
                          <span
                            style={{
                              color: colors.accent,
                              fontSize: 11,
                              fontWeight: 500,
                              border: `1px solid ${colors.border}`,
                              backgroundColor: `${colors.accent}08`,
                              borderRadius: 10,
                              padding: "3px 10px",
                              lineHeight: 1.4,
                            }}
                          >
                            {student.status}
                          </span>
                        )}
                        {/* 缺考学生不显示分数 */}
                        {student.score !== null && student.score !== undefined && student.type !== "absent" && (
                          <div
                            className="student-score"
                            style={{
                              fontSize: 15,
                              fontWeight: 600,
                              color: "#1890ff",
                              lineHeight: 1.2,
                            }}
                          >
                            {student.score}分
                          </div>
                        )}
                      </div>
                      {student.type === "abnormal" && (
                        <div style={{ display: "flex", gap: 6 }}>
                          <Button
                            size="small"
                            type="text"
                            icon={<UserOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleModifyMatch(student);
                            }}
                            style={{
                              fontSize: 12,
                              padding: "2px 6px",
                              height: 24,
                              color: "#595959",
                            }}
                          >
                            修改
                          </Button>
                          <Button
                            size="small"
                            type="text"
                            icon={<DeleteOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAbnormal(student);
                            }}
                            style={{
                              fontSize: 12,
                              padding: "2px 8px",
                              height: 24,
                              color: "#ff4d4f",
                            }}
                          >
                            删除
                          </Button>
                        </div>
                      )}
                      {student.type === "absent" && (
                        <Button
                          size="small"
                          type="text"
                          icon={<ReloadOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleManualEntry(student);
                          }}
                          style={{
                            fontSize: 12,
                            padding: "2px 8px",
                            height: 24,
                            color: "#595959",
                          }}
                        >
                          人工录入成绩
                        </Button>
                      )}
                    </div>
                      </div>
                    );
              };

              const renderGroupHeader = (title, count, color, icon) => (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 12,
                    marginTop: 24,
                    paddingLeft: 4,
                  }}
                >
                  <div
                    style={{
                      width: 3,
                      height: 16,
                      backgroundColor: color,
                      borderRadius: 2,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {icon}
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: "#262626",
                        letterSpacing: 0.2,
                      }}
                    >
                      {title}
                    </span>
                    <span style={{ marginLeft: 6 }}>({count})</span>
                  </div>
                </div>
              );

              return (
                <>
                  {/* 正常学生 */}
                  {matchedStudents.length > 0 && (
                    <div>
                      {renderGroupHeader(
                        "正常学生",
                        matchedStudents.length,
                        "#52c41a",
                        <CheckCircleOutlined style={{ fontSize: 14, color: "#52c41a" }} />
                      )}
                      {matchedStudents.map((student) => {
                        const globalIndex = students.findIndex((s) => s === student);
                        return renderStudentItem(student, globalIndex);
                      })}
          </div>
                  )}

                  {/* 异常学生 */}
                  {abnormalStudents.length > 0 && (
                    <div>
                      {renderGroupHeader(
                        "异常学生",
                        abnormalStudents.length,
                        "#ff4d4f",
                        <EditOutlined style={{ fontSize: 14, color: "#ff4d4f" }} />
                      )}
                      {abnormalStudents.map((student) => {
                        const globalIndex = students.findIndex((s) => s === student);
                        return renderStudentItem(student, globalIndex);
                      })}
                    </div>
                  )}

                  {/* 缺考学生 */}
                  {absentStudents.length > 0 && (
                    <div>
                      {renderGroupHeader(
                        "缺考/批改错误",
                        absentStudents.length,
                        "#fa8c16",
                        <InboxOutlined style={{ fontSize: 14, color: "#fa8c16" }} />
                      )}
                      {absentStudents.map((student) => {
                        const globalIndex = students.findIndex((s) => s === student);
                        return renderStudentItem(student, globalIndex);
                      })}
                    </div>
                  )}

                  {students.length === 0 && (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "60px 20px",
                        color: "#bfbfbf",
                      }}
                    >
                      <InboxOutlined style={{ fontSize: 48, marginBottom: 12, opacity: 0.4 }} />
                      <div style={{ fontSize: 14, marginTop: 8 }}>暂无学生数据</div>
                    </div>
                  )}
                </>
              );
            })()}
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
                        minWidth: 80,
                        whiteSpace: "nowrap",
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
                        minWidth: 80,
                        whiteSpace: "nowrap",
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
                        marginLeft: "20px",
                      }}
                    >
                      {/* 第一行题目，总是显示 */}
                      <div style={{ display: "flex" }}>
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
                      </div>

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

      <Modal
        title="人工录入成绩"
        open={isManualEntryModalVisible}
        onOk={handleManualEntryConfirm}
        onCancel={() => {
          setIsManualEntryModalVisible(false);
          setCurrentManualEntryStudent(null);
        }}
        confirmLoading={isManualEntrySubmitting}
        okText="确定"
        cancelText="取消"
      >
        <div style={{ fontSize: 14, color: "#333", lineHeight: 1.6 }}>
          <div>会将学生初始化为0分并跳转至人工批阅窗口，需要手动为每一题打分。</div>
          <div>作文需进入查看作文批改界面，对该学生打分</div>
          <div style={{ marginTop: 8 }}>是否对该学生进行成绩录入？</div>
        </div>
      </Modal>

      {/* 修改匹配关系Modal */}
      <Modal
        title="修改对应学生"
        open={isModifyMatchModalVisible}
        onOk={handleModifyMatchConfirm}
        onCancel={() => {
          setIsModifyMatchModalVisible(false);
          setCurrentModifyStudent(null);
          setSelectedClassStudentId(null);
        }}
        confirmLoading={isModifying}
        okText="确定"
        cancelText="取消"
      >
        {currentModifyStudent && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>当前异常学生：</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>
                {currentModifyStudent.displayName}
              </div>
              {currentModifyStudent.recognizedName && (
                <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
                  识别姓名：{currentModifyStudent.recognizedName}
                </div>
              )}
              {currentModifyStudent.recognizedNo && (
                <div style={{ fontSize: 12, color: "#999" }}>
                  识别学号：{currentModifyStudent.recognizedNo}
                </div>
              )}
            </div>
            <div>
              <div style={{ fontSize: 14, marginBottom: 8 }}>选择要匹配的班级学生：</div>
              <Select
                style={{ width: "100%" }}
                placeholder="请选择班级学生"
                value={selectedClassStudentId}
                onChange={setSelectedClassStudentId}
                onSelect={(value) => {
                  setSelectedClassStudentId(value);
                  refreshStudentData();
                }}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                }
                options={classStudentOptions}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* 删除确认Modal */}
      <Modal
        title="确认删除"
        open={isDeleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={() => {
          setIsDeleteModalVisible(false);
          setCurrentDeleteStudent(null);
        }}
        confirmLoading={isDeleting}
        okText="确定删除"
        cancelText="取消"
        okButtonProps={{ danger: true }}
      >
        {currentDeleteStudent && (
          <div>
            <div style={{ marginBottom: 16, fontSize: 16, fontWeight: 600, color: "#ff4d4f" }}>
              确定要删除该异常学生吗？
            </div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 14, color: "#666" }}>学生信息：</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>
                {currentDeleteStudent.displayName}
              </div>
              {currentDeleteStudent.recognizedName && (
                <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
                  识别姓名：{currentDeleteStudent.recognizedName}
                </div>
              )}
              {currentDeleteStudent.recognizedNo && (
                <div style={{ fontSize: 12, color: "#999" }}>
                  识别学号：{currentDeleteStudent.recognizedNo}
                </div>
              )}
            </div>
            <div style={{ fontSize: 14, color: "#ff4d4f", marginTop: 16 }}>
              注意：删除后将无法恢复，该学生的所有批改数据将被永久删除。
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default QuestionAnalysis;
