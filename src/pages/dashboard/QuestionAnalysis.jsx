import React, { useState, useRef, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { Button, message as antdMessage } from "antd";
import { LeftOutlined, RightOutlined, UserSwitchOutlined } from "@ant-design/icons";
import { useSearchParams, useNavigate } from "react-router-dom";
import { mergeStudents, getClassStudentName, getClassStudentNo, getClassStudentKey } from "../../utils/students";
import StudentFilterTabs from "./components/QuestionAnalysis/StudentFilterTabs";
import StudentList from "./components/QuestionAnalysis/StudentList";
import QuestionNavigator from "./components/QuestionAnalysis/QuestionNavigator";
import AnswerPreview from "./components/QuestionAnalysis/AnswerPreview";
import ScoreSummary from "./components/QuestionAnalysis/ScoreSummary";
import ManualScorePanel from "./components/QuestionAnalysis/ManualScorePanel";
import QuestionInfoPanel from "./components/QuestionAnalysis/QuestionInfoPanel";
import ManualEntryModal from "./components/QuestionAnalysis/ManualEntryModal";
import ModifyMatchModal from "./components/QuestionAnalysis/ModifyMatchModal";
import DeleteConfirmModal from "./components/QuestionAnalysis/DeleteConfirmModal";
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

  

  // 当班级或批次发生切换时，重置手动匹配记录
  useEffect(() => {
    manuallyMatchedPaperIdsRef.current.clear();
  }, [selectedClassId, gradingId]);

  // 从API同时获取题目数据和学生数据
  useEffect(() => {
    if (!examId || !gradingId || !selectedClassId) {
      return;
    }
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

        // 统一合并学生数据
        const mergedStudents = mergeStudents({
          classStudents: classStudentsList,
          v2Data: v2Res?.data || {},
          answerSheets: Array.isArray(answerSheetRes?.data) ? answerSheetRes.data : [],
          manualMatchedSet: manuallyMatchedPaperIdsRef.current,
        });

        setStudents(mergedStudents);
      } catch (error) {
        console.error("获取考试数据失败:", error);
        antdMessage.error("获取考试数据失败，请稍后重试");
      }
    };

    fetchExamData();
  }, [gradingId, examId, selectedClassId]);

  // 当前选中的学生（以key标识）
  const [selectedStudentKey, setSelectedStudentKey] = useState();
  
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
  const getStudentItemKey = (s) =>
    String(
      s?.paperId ||
        s?.v2Data?.paperId ||
        s?.v2Data?.paper_id ||
        s?.v2Data?.student_no ||
        s?.classStudent?.student_no ||
        s?.recognizedNo ||
        `${s?.displayName || "unknown"}-${s?.type || "t"}`
    );
  const keyToFilteredIndex = useMemo(() => {
    const m = new Map();
    filteredStudents.forEach((s, i) => m.set(getStudentItemKey(s), i));
    return m;
  }, [filteredStudents]);
  const currentIndex = useMemo(() => {
    if (!filteredStudents || filteredStudents.length === 0) return 0;
    if (!selectedStudentKey) return 0;
    const idx = keyToFilteredIndex.get(selectedStudentKey);
    return typeof idx === "number" ? idx : 0;
  }, [filteredStudents, selectedStudentKey, keyToFilteredIndex]);
  const currentStudent = useMemo(() => {
    if (!filteredStudents || filteredStudents.length === 0) return undefined;
    if (selectedStudentKey && keyToFilteredIndex.has(selectedStudentKey)) {
      return filteredStudents[keyToFilteredIndex.get(selectedStudentKey)];
    }
    return filteredStudents[0];
  }, [filteredStudents, selectedStudentKey, keyToFilteredIndex]);

  // 当过滤后的学生列表变化时，确保选中项有效
  useEffect(() => {
    if (!filteredStudents || filteredStudents.length === 0) {
      setSelectedStudentKey(undefined);
      return;
    }
    if (!selectedStudentKey || !keyToFilteredIndex.has(selectedStudentKey)) {
      setSelectedStudentKey(getStudentItemKey(filteredStudents[0]));
    }
  }, [studentFilterTab, filteredStudents, selectedStudentKey, keyToFilteredIndex]);

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
        await refreshStudentData();
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
    const maxScore = Number(questionDetail?.score || 0);

    // 如果没有满分信息，不允许操作
    if (!(maxScore > 0)) {
      antdMessage.warning("无法获取题目满分信息");
      return;
    }

    if (num === ".5") {
      // 点击 .5 按钮：在当前整数基础上加 0.5
      const curr = parseFloat(manualScore);
      const base = Number.isFinite(curr) ? Math.floor(curr) : 0; // 兜底为0
      let newValue = base + 0.5;

      // 限制不超过满分
      if (newValue > maxScore) newValue = maxScore;

      // 如果当前已是目标值，保持不变
      if (Number.isFinite(parseFloat(manualScore)) && parseFloat(manualScore) === newValue) {
        return;
      }

      setManualScore(String(newValue));
      setInputHistory([String(newValue)]); // 记录为单个块
    } else {
      // 点击数字按钮 0-9：直接替换为该数字
      let numValue = parseFloat(num);
      if (!Number.isFinite(numValue)) numValue = 0;

      // 限制不超过满分
      if (numValue > maxScore) numValue = maxScore;

      // 如果和当前值相同，不做任何操作
      if (Number.isFinite(parseFloat(manualScore)) && parseFloat(manualScore) === numValue) {
        return;
      }

      setManualScore(String(numValue));
      setInputHistory([String(numValue)]); // 记录为单个块
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
  const choiceQuestions = useMemo(() => questions.filter((q) => q.question_type === "choice"), [questions]);
  const nonChoiceQuestions = useMemo(() => questions.filter((q) => q.question_type !== "choice"), [questions]);

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
    if (!filteredStudents || filteredStudents.length === 0) return;
    const idx = selectedStudentKey ? keyToFilteredIndex.get(selectedStudentKey) ?? 0 : 0;
    if (idx > 0) setSelectedStudentKey(getStudentItemKey(filteredStudents[idx - 1]));
  };

  const handleNextStudent = () => {
    if (!filteredStudents || filteredStudents.length === 0) return;
    const idx = selectedStudentKey ? keyToFilteredIndex.get(selectedStudentKey) ?? 0 : 0;
    if (idx < filteredStudents.length - 1) setSelectedStudentKey(getStudentItemKey(filteredStudents[idx + 1]));
  };

  // 刷新学生数据
  const refreshStudentData = async () => {
    if (!gradingId || !selectedClassId) {
      return;
    }
    try {
      const [classStudentsRes, v2Res, answerSheetRes] = await Promise.all([
        getStudentsByClassId(selectedClassId).catch(() => ({ data: [] })),
        getGradingResultsV2(gradingId).catch(() => ({ data: [] })),
        getStudentList(gradingId).catch(() => ({ data: [] })),
      ]);

      const classStudentsList = Array.isArray(classStudentsRes?.data) ? classStudentsRes.data : [];
      setClassStudents(classStudentsList);

      const mergedStudents = mergeStudents({
        classStudents: classStudentsList,
        v2Data: v2Res?.data || {},
        answerSheets: Array.isArray(answerSheetRes?.data) ? answerSheetRes.data : [],
        manualMatchedSet: manuallyMatchedPaperIdsRef.current,
      });

      const seenPaperIds = new Set(
        mergedStudents
          .map((s) => (s.paperId ? String(s.paperId) : null))
          .filter((x) => x)
      );
      manuallyMatchedPaperIdsRef.current.forEach((id) => {
        if (!seenPaperIds.has(id)) manuallyMatchedPaperIdsRef.current.delete(id);
      });

      setStudents(mergedStudents);

      // 处理当前选中学生定位（基于key）
      const currentPaperId = currentStudent?.paperId;
      if (currentPaperId) {
        const found = mergedStudents.find((s) => s.paperId === currentPaperId);
        if (found) {
          setSelectedStudentKey(getStudentItemKey(found));
        } else if (mergedStudents.length > 0) {
          setSelectedStudentKey(getStudentItemKey(mergedStudents[0]));
        }
      } else if (mergedStudents.length > 0) {
        setSelectedStudentKey(getStudentItemKey(mergedStudents[0]));
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

        const matched = updated.find((stu) => String(stu.paperId) === String(currentModifyStudent.paperId));
        if (matched) {
          setSelectedStudentKey(getStudentItemKey(matched));
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
                disabled={currentIndex === 0 || filteredStudents.length === 0}
              />
              <span>
                {filteredStudents.length > 0 ? `${currentIndex + 1}/${filteredStudents.length}` : "0/0"}
              </span>
              <Button
                icon={<RightOutlined />}
                onClick={handleNextStudent}
                disabled={currentIndex >= filteredStudents.length - 1 || filteredStudents.length === 0}
              />
            </div>
          </div>
          {/* 学生状态筛选 Tab */}
          <div className="student-filter-tabs">
            <StudentFilterTabs
              activeKey={studentFilterTab}
              onChange={(key) => {
                setStudentFilterTab(key);
                setSelectedStudentKey(undefined);
              }}
            />
          </div>
          <div className="student-list">
            <StudentList
              students={filteredStudents}
              selectedKey={currentStudent ? getStudentItemKey(currentStudent) : undefined}
              onSelectKey={(key) => setSelectedStudentKey(String(key))}
              onModifyMatch={handleModifyMatch}
              onDeleteAbnormal={handleDeleteAbnormal}
              onManualEntry={handleManualEntry}
              getKeyFn={(s) => getStudentItemKey(s)}
            />
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

              {/* 题目序号切换按钮 - 组件化 */}
              {questions && questions.length > 0 && (
                <QuestionNavigator
                  choiceQuestions={choiceQuestions}
                  nonChoiceQuestions={nonChoiceQuestions}
                  currentQuestionId={currentQuestionId}
                  onChangeQuestion={setCurrentQuestionId}
                  questionsPerRow={questionsPerRow}
                  containerRef={questionsContainerRef}
                  choiceExpanded={choiceExpanded}
                  onToggleChoice={() => setChoiceExpanded(!choiceExpanded)}
                  nonChoiceExpanded={nonChoiceExpanded}
                  onToggleNonChoice={() => setNonChoiceExpanded(!nonChoiceExpanded)}
                />
              )}
            </div>
            <Button type="default" onClick={() => navigate("/")}>
              返回首页
            </Button>
          </div>
          <div className="question-card">
            <div className="question-content">
              <div className="answer-image-container" style={{ border: "1px solid #e8e8e8", borderRadius: 8, padding: 20, backgroundColor: "white" }}>
                <div style={{ textAlign: "center", fontSize: 16, fontWeight: "bold", marginBottom: 16, color: "oklch(.145 0 0)" }}>
                  第{questionDetail.question_id}题
                </div>
                <div style={{ backgroundColor: "oklch(.97 .014 254.604)", borderRadius: 8, padding: 16, marginBottom: 16, width: "100%", border: "1px solid oklch(.882 .059 254.128)" }}>
                  <div style={{ fontSize: 14, fontWeight: "bold", color: "#1890ff", marginBottom: 12 }}>学生答案：</div>
                  <AnswerPreview answerUrl={studentAnswer.answer_photo_url} />
                </div>
              </div>
            </div>
            <ScoreSummary score={studentAnswer?.score || 0} maxScore={questionDetail?.score} />
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
              <QuestionInfoPanel questionDetail={questionDetail} />
              
              {/* 手动改分区域 - 只在非选择题时显示 */}
              {(() => {
                const currentQuestion = questions.find(
                  (q) => q.question_id === currentQuestionId
                );
                
                // 只在非选择题时显示
                return currentQuestion?.question_type !== "choice" ? (
                  <ManualScorePanel
                    value={manualScore}
                    submitting={isSubmittingScore}
                    questionMaxScore={questionDetail?.score}
                    currentScore={studentAnswer?.score}
                    onBackspace={handleBackspace}
                    onFull={handleFullScore}
                    onZero={handleZeroScore}
                    onClickNumber={handleNumberClick}
                    onSubmit={handleSubmitManualScore}
                  />
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

      <ManualEntryModal
        open={isManualEntryModalVisible}
        loading={isManualEntrySubmitting}
        onOk={handleManualEntryConfirm}
        onCancel={() => {
          setIsManualEntryModalVisible(false);
          setCurrentManualEntryStudent(null);
        }}
      />

      {/* 修改匹配关系Modal */}
      <ModifyMatchModal
        open={isModifyMatchModalVisible}
        loading={isModifying}
        student={currentModifyStudent}
        classStudentOptions={classStudentOptions}
        selectedClassStudentId={selectedClassStudentId}
        onChangeSelected={setSelectedClassStudentId}
        onOk={handleModifyMatchConfirm}
        onCancel={() => {
          setIsModifyMatchModalVisible(false);
          setCurrentModifyStudent(null);
          setSelectedClassStudentId(null);
        }}
      />

      {/* 删除确认Modal */}
      <DeleteConfirmModal
        open={isDeleteModalVisible}
        loading={isDeleting}
        student={currentDeleteStudent}
        onOk={handleDeleteConfirm}
        onCancel={() => {
          setIsDeleteModalVisible(false);
          setCurrentDeleteStudent(null);
        }}
      />
    </div>
  );
};

export default QuestionAnalysis;
