import { useCallback, useEffect, useMemo, useState } from "react";
import { message } from "antd";
import { useSearchParams } from "react-router-dom";
import ManualHeader from "./components/ManualHeader";
import QuestionNavigator from "./components/QuestionNavigator";
import StudentList from "./components/StudentList";
import AnswerPreview from "./components/AnswerPreview";
import ScoringPanel from "./components/ScoringPanel";
import {
  fetchManualStudents,
  fetchManualQuestions,
  fetchManualQuestionScoreList,
  fetchManualAnswerDetail,
  submitManualScore,
} from "../../api/manual";
import "./manualReview.css";

/**
 * 标准化学生数据
 * 优先使用 paper_id 作为唯一标识，确保不同 paper_id 的学生能被正确区分
 */
const normalizeStudent = (record) => {
  // 优先从 paper_id 字段获取，确保不同 paper_id 的学生能被正确区分
  const paperIdRaw = record?.paper_id ?? record?.paperId;
  const paperId = paperIdRaw !== undefined && paperIdRaw !== null ? String(paperIdRaw).trim() : "";
  // id ??????? paperId???????????????��????
  // ??????????????????????? paperId ?????id ????
  // 如果 paper_id 存在，直接使用它作为 id；如果不存在，才使用其他字段作为 fallback
  const idFallbackStrict = String(record?.id ?? "").trim();
  const id = paperId || idFallbackStrict || String(record?.student_no ?? record?.studentNo ?? "").trim();
  const name = record?.student_name ?? record?.studentName ?? record?.name ?? "未知姓名";
  const studentNo = record?.student_no ?? record?.studentNo ?? "";
  return {
    id,
    paperId, // 严格只使用真实的 paper_id，不再回退到其他字段
    name,
    studentNo,
    status: record?.status ?? "",
    raw: record,
  };
};

const normalizeQuestion = (record, index) => {
  const id = String(record?.question_id ?? record?.questionId ?? record?.id ?? index).trim();
  const type = record?.question_type ?? record?.questionType ?? record?.type ?? "subjective";
  const title =
    record?.title ??
    record?.question_title ??
    record?.questionTitle ??
    (type === "choice" ? `选择题 ${id}` : `第${id}题`);
  const maxScoreRaw =
    record?.max_score ??
    record?.maxScore ??
    record?.score ??
    record?.question_score ??
    record?.questionScore;
  const maxScore = Number.isFinite(Number(maxScoreRaw)) ? Number(maxScoreRaw) : null;
  const answer = record?.answer ?? record?.standard_answer ?? record?.standardAnswer ?? "";
  const wordCount = record?.word_count ?? record?.wordCount ?? null;
  return {
    id,
    type,
    title,
    maxScore,
    answer,
    wordCount,
    raw: record,
  };
};

/**
 * 获取学生唯一标识键
 * 优先使用 paper_id，确保不同 paper_id 的学生能被正确区分
 * 用于 resolveScore 和 buildScoreMap 中的分数查找
 */
const getStudentKey = (entry) => {
  return String(entry?.paperId ?? entry?.paper_id ?? "").trim();
};

const buildScoreMap = (questionScoreList = []) => {
  const result = {};
  questionScoreList.forEach((item) => {
    const questionId = String(item?.questionId ?? item?.question_id ?? item?.id ?? "").trim();
    if (!questionId) return;
    const gradingList =
      item?.gradingVOS ??
      item?.grading_vos ??
      item?.gradingVos ??
      item?.grading_list ??
      item?.gradingList ??
      item?.grading ??
      [];
    const bucket = {};
    if (Array.isArray(gradingList)) {
      gradingList.forEach((entry) => {
        const paperKey = getStudentKey(entry);
        if (!paperKey) return;
        const value =
          entry?.score ??
          entry?.manualScore ??
          entry?.manual_score ??
          entry?.total_score ??
          entry?.final_score ??
          entry?.value;
        if (value !== undefined && value !== null && value !== "") {
          const numeric = Number(value);
          if (!Number.isNaN(numeric)) {
            bucket[paperKey] = numeric;
          }
        }
      });
    }
    result[questionId] = bucket;
  });

  return result;
};

const ManualReviewPage = () => {
  const [searchParams] = useSearchParams();
  const gradingId = searchParams.get("grading_id") || "";
  const examId = searchParams.get("exam_id") || "";

  const [students, setStudents] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [scoreMap, setScoreMap] = useState({});
  const [currentStudentId, setCurrentStudentId] = useState(null);
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [currentAnswerDetail, setCurrentAnswerDetail] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isAutoAdvanceEnabled, setIsAutoAdvanceEnabled] = useState(true);

  const currentStudent = useMemo(
    () => students.find((student) => student.id === currentStudentId) || null,
    [students, currentStudentId],
  );

  const currentQuestion = useMemo(
    () => questions.find((question) => question.id === currentQuestionId) || null,
    [questions, currentQuestionId]
  );

  const resolveScore = useCallback(
    (student, questionId = currentQuestionId) => {
      if (!student || !questionId) return undefined;
      const bucket = scoreMap[questionId];
      if (!bucket) return undefined;
      const key = getStudentKey(student);
      if (!key) return undefined;
      return bucket[key] ?? bucket[String(key)];
    },
    [scoreMap, currentQuestionId],
  );

  const stats = useMemo(() => {
    const totalCount = students.length;
    if (!currentQuestionId) {
      return {
        totalCount,
        gradedCount: 0,
        ungradedCount: totalCount,
      };
    }
    const bucket = scoreMap[currentQuestionId] || {};
    let gradedCount = 0;
    students.forEach((student) => {
      const key = getStudentKey(student);
      if (!key) return;
      const score = bucket[key] ?? bucket[String(key)];
      if (score !== undefined && score !== null) {
        gradedCount += 1;
      }
    });
    return {
      totalCount,
      gradedCount,
      ungradedCount: Math.max(totalCount - gradedCount, 0),
    };
  }, [students, scoreMap, currentQuestionId]);

  const loadStudents = useCallback(async () => {
    if (!gradingId) {
      setStudents([]);
      setCurrentStudentId(null);
      return;
    }
    setIsLoadingStudents(true);
    try {
      const response = await fetchManualStudents(gradingId);
      const list = Array.isArray(response?.data) ? response.data : [];
      const formatted = list
        .map((item) => normalizeStudent(item))
        .filter((student) => student.id && student.paperId);
      setStudents(formatted);
      if (formatted.length > 0) {
        setCurrentStudentId((prev) => (formatted.some((student) => student.id === prev) ? prev : formatted[0].id));
      } else {
        setCurrentStudentId(null);
      }
    } catch (error) {
      console.error("加载学生列表失败", error);
      message.error(error?.response?.data?.message || "获取学生列表失败");
      setStudents([]);
      setCurrentStudentId(null);
    } finally {
      setIsLoadingStudents(false);
    }
  }, [gradingId]);

  const loadQuestions = useCallback(async () => {
    if (!examId) {
      setQuestions([]);
      setCurrentQuestionId(null);
      return;
    }
    try {
      const response = await fetchManualQuestions(examId);
      const list = Array.isArray(response?.data) ? response.data : [];
      const formatted = list
        .map((item, index) => normalizeQuestion(item, index))
        .filter((question) => question.id);
      setQuestions(formatted);
      if (formatted.length > 0) {
        setCurrentQuestionId((prev) => (formatted.some((question) => question.id === prev) ? prev : formatted[0].id));
      } else {
        setCurrentQuestionId(null);
      }
    } catch (error) {
      console.error("加载题目列表失败", error);
      message.error(error?.response?.data?.message || "获取题目列表失败");
      setQuestions([]);
      setCurrentQuestionId(null);
    }
  }, [examId]);

  const loadScoreMap = useCallback(async () => {
    if (!gradingId) {
      setScoreMap({});
      return;
    }
    try {
      const response = await fetchManualQuestionScoreList(gradingId);
      const list = Array.isArray(response?.data) ? response.data : [];
      const newScoreMap = buildScoreMap(list);
      setScoreMap(newScoreMap);
      
      // ??��??��?????????????????????��? questions ??
      if (list.length > 0) {
        setQuestions((prevQuestions) => {
          const updated = prevQuestions.map((q) => {
            // ?????????????????????????��??��??��??
            if (q.maxScore === null || q.maxScore === undefined) {
              const questionItem = list.find(
                (item) => String(item?.questionId ?? item?.question_id ?? item?.id ?? "").trim() === q.id
              );
              if (questionItem) {
                const maxScoreRaw =
                  questionItem?.score ??
                  questionItem?.max_score ??
                  questionItem?.maxScore ??
                  questionItem?.question_score ??
                  questionItem?.questionScore;
                const maxScore = Number.isFinite(Number(maxScoreRaw)) ? Number(maxScoreRaw) : null;
                if (maxScore !== null) {
                  return { ...q, maxScore };
                }
              }
            }
            return q;
          });
          return updated;
        });
      }

      // 基于返回的 grading 列表，按 paper_id 聚合出权威学生列表（避免 student-list 缺少 paper_id 导致合并）
      const paperToStudent = new Map();
      list.forEach((item) => {
        const gradingList =
          item?.gradingVOS ||
          item?.grading_vos ||
          item?.gradingVos ||
          item?.grading_list ||
          item?.gradingList ||
          item?.grading || [];
        if (Array.isArray(gradingList)) {
          gradingList.forEach((entry) => {
            const paperKey = String(entry?.paperId ?? entry?.paper_id ?? "").trim();
            if (!paperKey) return;
            if (!paperToStudent.has(paperKey)) {
              paperToStudent.set(paperKey, {
                id: paperKey,
                paperId: paperKey,
                name: entry?.student_name ?? entry?.studentName ?? entry?.name ?? "未知姓名",
                studentNo: entry?.student_no ?? entry?.studentNo ?? "",
                status: entry?.status ?? "",
                raw: entry,
              });
            }
          });
        }
      });

      if (paperToStudent.size > 0) {
        setStudents((prev) => {
          const prevAllHavePaperId = Array.isArray(prev) && prev.length > 0 && prev.every((s) => s.paperId);
          const prevPaperSet = new Set(prev.map((s) => s.paperId));
          const nextStudents = Array.from(paperToStudent.values());
          const nextPaperSet = new Set(nextStudents.map((s) => s.paperId));

          // 如果现有列表缺少 paperId 或者 paperId 集不同，则用权威列表覆盖
          const needReplace = !prevAllHavePaperId || prevPaperSet.size !== nextPaperSet.size || [...prevPaperSet].some((k) => !nextPaperSet.has(k));
          if (!needReplace) return prev;

          // 尽量保留当前选中项
          setCurrentStudentId((prevId) => (prevId && nextPaperSet.has(prevId) ? prevId : (nextStudents[0]?.id ?? null)));
          return nextStudents;
        });
      }
    } catch (error) {
      console.error("加载得分列表失败", error);
      message.error(error?.response?.data?.message || "获取得分列表失败");
      setScoreMap({});
    }
  }, [gradingId]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  useEffect(() => {
    loadScoreMap();
  }, [loadScoreMap]);

  useEffect(() => {
    if (!currentStudent || !currentQuestionId || !gradingId) {
      setCurrentAnswerDetail(null);
      return;
    }

    const controller = new AbortController();
    const fetchDetail = async () => {
      try {
        const response = await fetchManualAnswerDetail({
          grading_id: gradingId,
          paper_id: currentStudent.paperId,
          question_id: currentQuestionId,
        });
        if (!controller.signal.aborted) {
          const answerDetail = response?.data ?? null;
          setCurrentAnswerDetail(answerDetail);
          
          // ??????????????��????????????? scoreMap ?��?????? scoreMap
          if (answerDetail && currentQuestionId) {
            const scoreValue = answerDetail?.score ?? answerDetail?.manual_score ?? answerDetail?.manualScore;
            if (scoreValue !== undefined && scoreValue !== null && scoreValue !== "") {
              const numeric = Number(scoreValue);
              if (!Number.isNaN(numeric)) {
                setScoreMap((prev) => {
                  const next = { ...prev };
                  const bucket = { ...(next[currentQuestionId] || {}) };
                  const key = getStudentKey(currentStudent);
                  if (key && bucket[key] === undefined) {
                    bucket[key] = numeric;
                    // 同步字符串形式的相同 key，避免 number/string 差异
                    bucket[String(key)] = numeric;
                    next[currentQuestionId] = bucket;
                  }
                  return next;
                });
              }
            }
          }
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("获取答题详情失败", error);
          message.error(error?.response?.data?.message || "获取答题详情失败");
          setCurrentAnswerDetail(null);
        }
      }
    };

    fetchDetail();
    return () => controller.abort();
  }, [currentStudent, currentQuestionId, gradingId]);

  const handleScoreSubmit = useCallback(
    async (newScore) => {
      if (!currentStudent || !currentQuestion || !gradingId || !currentQuestionId) {
        message.warning("请先选择学生与题目");
        return;
      }

      const previousScore = resolveScore(currentStudent);
      try {
        await submitManualScore({
          grading_id: gradingId,
          paper_id: currentStudent.paperId,
          question_id: currentQuestionId,
          question_type: currentQuestion.type,
          old_score: Number.isFinite(previousScore) ? Number(previousScore) : 0,
          new_score: Number(newScore),
        });
        message.success("提交成功");
        setScoreMap((prev) => {
          const next = { ...prev };
          const bucket = { ...(next[currentQuestionId] || {}) };
          const key = getStudentKey(currentStudent);
          if (key) {
            bucket[key] = Number(newScore);
            // 同步字符串形式的相同 key，避免 number/string 差异
            bucket[String(key)] = Number(newScore);
          }
          next[currentQuestionId] = bucket;
          return next;
        });
        setCurrentAnswerDetail((prev) =>
          prev ? { ...prev, score: Number(newScore), manual_score: Number(newScore) } : prev
        );
        
        // 提交成功后根据开关自动跳转到下一个学生
        if (isAutoAdvanceEnabled) {
          const currentIndex = students.findIndex((student) => student.id === currentStudent.id);
          if (currentIndex !== -1 && currentIndex < students.length - 1) {
            // 延迟一小段时间，让用户看到成功提示
            setTimeout(() => {
              setCurrentStudentId(students[currentIndex + 1].id);
            }, 300);
          }
        }
      } catch (error) {
        console.error("提交分数失败", error);
        message.error(error?.response?.data?.message || "提交失败");
        throw error;
      }
    },
    [currentStudent, currentQuestion, gradingId, currentQuestionId, resolveScore, students, isAutoAdvanceEnabled]
  );

  const handlePrevStudent = useCallback(() => {
    if (!currentStudent || students.length === 0) return;
    const index = students.findIndex((student) => student.id === currentStudent.id);
    if (index > 0) {
      setCurrentStudentId(students[index - 1].id);
    }
  }, [students, currentStudent]);

  const handleNextStudent = useCallback(() => {
    if (!currentStudent || students.length === 0) return;
    const index = students.findIndex((student) => student.id === currentStudent.id);
    if (index !== -1 && index < students.length - 1) {
      setCurrentStudentId(students[index + 1].id);
    }
  }, [students, currentStudent]);

  const handleStudentSelect = useCallback((studentId) => {
    setCurrentStudentId(studentId);
    setIsSidebarOpen(false);
  }, []);

  const handleQuestionSelect = useCallback((questionId) => {
    setCurrentQuestionId(questionId);
  }, []);

  const currentStudentIndex = useMemo(() => {
    if (!currentStudent) return -1;
    return students.findIndex((student) => student.id === currentStudent.id);
  }, [students, currentStudent]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  return (
    <div className="manual-review">
      <ManualHeader stats={stats} onToggleSidebar={toggleSidebar} />
      <QuestionNavigator
        questions={questions}
        currentQuestionId={currentQuestionId}
        onQuestionSelect={handleQuestionSelect}
      />

      <div className="manual-review__body">
        <StudentList
          students={students}
          currentStudentId={currentStudentId}
          currentQuestionId={currentQuestionId}
          onStudentSelect={handleStudentSelect}
          isOpen={isSidebarOpen}
          isLoading={isLoadingStudents}
          resolveScore={resolveScore}
        />

        <div className="manual-review__canvas">
          <div className="manual-review__canvas-inner">
            <AnswerPreview
              student={currentStudent}
              question={currentQuestion}
              answerDetail={currentAnswerDetail}
              currentIndex={currentStudentIndex >= 0 ? currentStudentIndex : 0}
              totalCount={students.length}
              showNavigation
              onPrev={handlePrevStudent}
              onNext={handleNextStudent}
              isFirst={currentStudentIndex <= 0}
              isLast={currentStudentIndex >= students.length - 1 && students.length > 0}
              isAutoAdvanceEnabled={isAutoAdvanceEnabled}
              onToggleAutoAdvance={() => setIsAutoAdvanceEnabled((prev) => !prev)}
            />
            {currentQuestion && currentStudent ? (
              <ScoringPanel
                maxScore={currentQuestion.maxScore}
                currentScore={resolveScore(currentStudent)}
                onSubmit={handleScoreSubmit}
                studentName={currentStudent.name}
                questionTitle={currentQuestion.title}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualReviewPage;

