import { useCallback, useEffect, useMemo, useState } from "react";
import { message } from "antd";
import { useSearchParams } from "react-router-dom";
import ManualHeader from "./components/ManualHeader";
import QuestionNavigator from "./components/QuestionNavigator";
import StudentList from "./components/StudentList";
import AnswerPreview from "./components/AnswerPreview";
import ScoringPanel from "./components/ScoringPanel";
import StudentFilterTabs from "../dashboard/components/QuestionAnalysis/StudentFilterTabs";
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
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isAutoAdvanceEnabled, setIsAutoAdvanceEnabled] = useState(true);
  // 左侧列表对齐题目分析：Tab与键
  const [activeTab, setActiveTab] = useState("all"); // all | matched | absent | abnormal
  const [selectedStudentKey, setSelectedStudentKey] = useState(undefined);

  const getStudentItemKey = useCallback((s, idx) => {
    return String(
      s?.paperId || s?.paper_id || s?.id || s?.studentNo || `${s?.name || "unknown"}-${idx || 0}`
    );
  }, []);

  const getStudentType = useCallback((s) => {
    const st = String(s?.status || "");
    if (/^\s*正常\s*$/.test(st)) return "matched";
    if (/缺考|缺席|未到|未交/.test(st)) return "absent";
    if (/异常|待匹配|录入|错误|无效/.test(st)) return "abnormal";
    return "matched";
  }, []);

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
          const prevList = Array.isArray(prev) ? prev : [];
          const getKey = (s) => String(s?.paperId ?? s?.id ?? "").trim();
          const prevMap = new Map(prevList.map((s) => [getKey(s), s]));

          // 合并/更新来自权威列表的信息，但不移除现有的缺考学生
          paperToStudent.forEach((stu, key) => {
            const existing = prevMap.get(key);
            if (existing) {
              prevMap.set(key, { ...existing, ...stu });
            } else {
              prevMap.set(key, stu);
            }
          });

          // 保留顺序：先按原有顺序输出（已更新），再补充新增项
          const result = [];
          const seen = new Set();
          prevList.forEach((s) => {
            const key = getKey(s);
            const updated = prevMap.get(key);
            if (updated && !seen.has(key)) {
              result.push(updated);
              seen.add(key);
            }
          });
          paperToStudent.forEach((stu, key) => {
            if (!seen.has(key)) {
              result.push(stu);
              seen.add(key);
            }
          });

          // 保留当前选中项（若仍存在于合并后的列表）
          setCurrentStudentId((prevId) => (prevId && result.some((s) => s.id === prevId) ? prevId : (result[0]?.id ?? null)));
          return result;
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
    setCurrentAnswerDetail(null);
    if (!currentStudent || !currentQuestionId || !gradingId) {
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
        // 乐观更新：仅当分数发生变化时，将 teacher_alter 标记为 true
        const prevNumeric = Number.isFinite(previousScore) ? Number(previousScore) : NaN;
        const newNumeric = Number(newScore);
        const changed = !Number.isFinite(prevNumeric) || Math.abs(newNumeric - prevNumeric) > 1e-9;
        setCurrentAnswerDetail((prev) => {
          if (!prev) return prev;
          const alreadyTrue = Boolean(prev?.teacher_alter || prev?.teacherAlter);
          const nextAlter = alreadyTrue || changed;
          return {
            ...prev,
            score: newNumeric,
            manual_score: newNumeric,
            teacher_alter: nextAlter,
            teacherAlter: nextAlter,
          };
        });
        
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

  const handleQuestionSelect = useCallback((questionId) => {
    setCurrentQuestionId(questionId);
  }, []);

  const currentStudentIndex = useMemo(() => {
    if (!currentStudent) return -1;
    return students.findIndex((student) => student.id === currentStudent.id);
  }, [students, currentStudent]);

  const toggleSidebar = useCallback(() => {}, []);

  // 过滤学生列表（与题目分析一致）
  const filteredStudents = useMemo(() => {
    const withType = students.map((s) => ({ ...s, __type__: getStudentType(s) }));
    if (activeTab === "matched") return withType.filter((s) => s.__type__ === "matched");
    if (activeTab === "absent") return withType.filter((s) => s.__type__ === "absent");
    if (activeTab === "abnormal") return withType.filter((s) => s.__type__ === "abnormal");
    return withType;
  }, [students, activeTab, getStudentType]);

  // key -> 索引映射与当前索引
  const keyToFilteredIndex = useMemo(() => {
    const m = new Map();
    filteredStudents.forEach((s, i) => m.set(getStudentItemKey(s, i), i));
    return m;
  }, [filteredStudents, getStudentItemKey]);

  const currentFilteredIndex = useMemo(() => {
    if (!filteredStudents || filteredStudents.length === 0) return 0;
    if (selectedStudentKey && keyToFilteredIndex.has(selectedStudentKey)) {
      return keyToFilteredIndex.get(selectedStudentKey);
    }
    // 若无selectedKey，尝试用当前选中的学生匹配
    if (currentStudent) {
      const tmpKey = getStudentItemKey(currentStudent, 0);
      if (keyToFilteredIndex.has(tmpKey)) return keyToFilteredIndex.get(tmpKey);
    }
    return 0;
  }, [filteredStudents, selectedStudentKey, keyToFilteredIndex, currentStudent, getStudentItemKey]);

  // 当过滤列表或选中学生变化时，保证 selectedStudentKey 有效
  useEffect(() => {
    if (!filteredStudents || filteredStudents.length === 0) {
      setSelectedStudentKey(undefined);
      return;
    }
    if (!selectedStudentKey || !keyToFilteredIndex.has(selectedStudentKey)) {
      const firstKey = getStudentItemKey(filteredStudents[0], 0);
      setSelectedStudentKey(firstKey);
      setCurrentStudentId(filteredStudents[0].id);
    }
  }, [filteredStudents, selectedStudentKey, keyToFilteredIndex, getStudentItemKey]);

  const handleSelectKey = useCallback((key) => {
    setSelectedStudentKey(String(key));
    // 映射到具体学生并更新 currentStudentId
    const idx = keyToFilteredIndex.get(String(key));
    if (typeof idx === "number" && filteredStudents[idx]) {
      setCurrentStudentId(filteredStudents[idx].id);
    }
  }, [keyToFilteredIndex, filteredStudents]);

  const handlePrevFiltered = useCallback(() => {
    if (!filteredStudents || filteredStudents.length === 0) return;
    const idx = currentFilteredIndex;
    if (idx > 0) {
      const target = filteredStudents[idx - 1];
      setSelectedStudentKey(getStudentItemKey(target, idx - 1));
      setCurrentStudentId(target.id);
    }
  }, [filteredStudents, currentFilteredIndex, getStudentItemKey]);

  const handleNextFiltered = useCallback(() => {
    if (!filteredStudents || filteredStudents.length === 0) return;
    const idx = currentFilteredIndex;
    if (idx < filteredStudents.length - 1) {
      const target = filteredStudents[idx + 1];
      setSelectedStudentKey(getStudentItemKey(target, idx + 1));
      setCurrentStudentId(target.id);
    }
  }, [filteredStudents, currentFilteredIndex, getStudentItemKey]);

  return (
    <div className="manual-review">
      <ManualHeader stats={stats} onToggleSidebar={toggleSidebar} />
      <QuestionNavigator
        questions={questions}
        currentQuestionId={currentQuestionId}
        onQuestionSelect={handleQuestionSelect}
      />

      <div className="manual-review__body">
        <div className="left-panel">
          <div className="student-navigation">
            <h3>学生导航</h3>
            <div className="navigation-controls">
              <button
                type="button"
                className="student-list__nav-btn"
                onClick={handlePrevFiltered}
                disabled={currentFilteredIndex === 0 || filteredStudents.length === 0}
              >
                ‹
              </button>
              <span className="student-list__nav-index">
                {filteredStudents.length > 0 ? `${currentFilteredIndex + 1}/${filteredStudents.length}` : "0/0"}
              </span>
              <button
                type="button"
                className="student-list__nav-btn"
                onClick={handleNextFiltered}
                disabled={currentFilteredIndex >= filteredStudents.length - 1 || filteredStudents.length === 0}
              >
                ›
              </button>
            </div>
          </div>
          <div className="student-filter-tabs">
            <StudentFilterTabs
              activeKey={activeTab}
              onChange={(key) => {
                setActiveTab(key);
                const next = key === "all"
                  ? students.map((s) => ({ ...s, __type__: getStudentType(s) }))
                  : students.map((s) => ({ ...s, __type__: getStudentType(s) })).filter((s) => s.__type__ === key);
                if (next && next.length > 0) {
                  setSelectedStudentKey(getStudentItemKey(next[0], 0));
                  setCurrentStudentId(next[0].id);
                } else {
                  setSelectedStudentKey(undefined);
                  setCurrentStudentId(null);
                }
              }}
            />
          </div>
          <div className="student-list">
            <StudentList
              students={filteredStudents}
              selectedKey={selectedStudentKey}
              onSelectKey={handleSelectKey}
              getKeyFn={(s, i) => getStudentItemKey(s, i)}
              isLoading={isLoadingStudents}
            />
          </div>
        </div>

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
                disabled={!currentAnswerDetail}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualReviewPage;

