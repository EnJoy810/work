import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
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
  Modal,
  message,
  Image,
} from "antd";
import {
  LeftOutlined,
  RightOutlined,
  CheckCircleOutlined,
  EditOutlined,
  UserSwitchOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getEssayResult, alterSentenceFeedbacks, alterScore, deleteGrading, getGradingResultsV2 } from "../../api/grading";
import {
  StudentList,
  EssayContent,
  ScoreEditor,
  DimensionScores,
  SentenceComments,
  ColorSelectionModal,
} from "./components/EssayGrading";
import "./styles/EssayGrading.css";

/**
 * 作文批改页面
 * 布局为左中右三部分，左右固定宽度，中间自适应
 */
const EssayGrading = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const grading_id = searchParams.get("grading_id");
  const paper_id = searchParams.get("paper_id");
  const student_no = searchParams.get("student_no");
  
  // ========== 数据状态 ==========
  // 作文基础数据
  const [essayData, setEssayData] = useState({
    essayResultId: null,
    title: "作文标题",
    wordCount: 0,
    sentences: [],
    studentImages: [],
    score: 0,
    dimensions: [],
    overallComment: '',
  });
  
  // 学生相关数据
  const [students, setStudents] = useState([]);
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0);
  const studentsRef = useRef([]);
  const currentStudentIndexRef = useRef(0);

  useEffect(() => {
    studentsRef.current = students;
  }, [students]);

  useEffect(() => {
    currentStudentIndexRef.current = currentStudentIndex;
  }, [currentStudentIndex]);

  const resolveStatusInfo = useCallback((statusValue) => {
    const raw = statusValue !== undefined && statusValue !== null ? String(statusValue).trim() : "";
    const lower = raw.toLowerCase();
    if (raw === "异常" || lower === "abnormal" || lower === "1") {
      return { type: "abnormal", statusText: "异常", badge: "error" };
    }
    if (raw === "缺考" || lower === "absent" || lower === "2") {
      return { type: "absent", statusText: "缺考", badge: "warning" };
    }
    return { type: "matched", statusText: "正常", badge: "success" };
  }, []);
  
  // 评语数据（按学生存储）
  const [studentComments, setStudentComments] = useState({});
  
  // ========== UI交互状态 ==========
  // 视图模式
  const [viewMode, setViewMode] = useState("text"); // "text" | "image"
  
  // 句子交互状态
  const [sentenceInteraction, setSentenceInteraction] = useState({
    highlightedIndex: -1,
    selectedIndex: -1, // 只需要索引，句子可以从 sentences[selectedIndex] 获取
    animationKey: 0,
    showAddComment: false,
  });
  
  // 编辑状态
  const [editingState, setEditingState] = useState({
    score: null, // null 表示未编辑，数字表示正在编辑的分数
    comment: {
      index: null, // null 表示未编辑
      content: "",
    },
  });
  
  // ========== 计算派生状态 ==========
  // 当前选中的学生（从 students 和 currentStudentIndex 计算）
  const currentStudent = students[currentStudentIndex] || null;
  const lastLoadedStudentKeyRef = useRef(null);
  const inflightKeyRef = useRef(null);
  const essayContentRef = useRef(null);
  const [studentFilterTab, setStudentFilterTab] = useState("all");

  const resolveStudentKey = useCallback((student) => {
     if (!student) return "";
     if (Array.isArray(student.candidateIds) && student.candidateIds.length > 0) {
       return student.candidateIds[0];
     }
     return (
       student.paperId ||
       student.studentNo ||
       student.student_no ||
       student.id ||
       ""
     );
   }, []);

  // 当前学生的评语列表（按学生聚合）
  const sentenceComments = useMemo(() => {
    const key = resolveStudentKey(currentStudent);
    if (!key) return [];
    return studentComments[key] || [];
  }, [studentComments, currentStudent, resolveStudentKey]);

  // 根据质量标记查询该句子的颜色
  const getSentenceColor = useCallback((index) => {
    const item = sentenceComments.find((it) => it.sentenceIndex === index);
    return item ? item.color : "";
  }, [sentenceComments]);

  // 选中的句子文本
  const selectedSentence = useMemo(() => {
    return sentenceInteraction.selectedIndex >= 0
      ? essayData.sentences[sentenceInteraction.selectedIndex]
      : null;
  }, [sentenceInteraction.selectedIndex, essayData.sentences]);

  const splitSentences = useCallback((text) => {
    if (!text) return [];
    const regex = /([。！？!?])/;
    const result = [];
    let remaining = String(text);
    while (remaining) {
      const match = remaining.match(regex);
      if (!match) {
        const rest = remaining.trim();
        if (rest) result.push(rest);
        break;
      }
      const index = match.index ?? 0;
      const sentence = remaining.slice(0, index + 1);
      result.push(sentence);
      remaining = remaining.slice(index + 1).trim();
    }
    return result;
  }, []);

  // 从后端加载作文数据（使用 useCallback 优化，修复依赖问题），使用 paper_id
  // 注意：此函数需要在 loadStudentList 之前定义，因为 loadStudentList 依赖它
  const loadEssayData = useCallback(
    async (student) => {
      if (!grading_id) {
        message.warning("缺少必要参数：grading_id 或学生信息");
        return;
      }

      const studentKey = resolveStudentKey(student);
      // 跟 in-flight key 去重（同一个学生未完成前不重复发）
      if (studentKey && inflightKeyRef.current === studentKey) {
        return;
      }
      inflightKeyRef.current = studentKey || null;

      const candidates = [];
      if (student) {
        const maybePaperId = student.paperId || student.v2Data?.paper_id;
        if (maybePaperId) candidates.push(String(maybePaperId));
        if (student.studentNo || student.student_no) candidates.push(String(student.studentNo || student.student_no));
        if (student.id) candidates.push(String(student.id));
        // never push name to candidates
      }

      const uniqueCandidates = [...new Set(candidates.filter(Boolean))];
      if (uniqueCandidates.length === 0) {
        message.warning("未找到有效的学生标识，无法加载作文数据");
        inflightKeyRef.current = null;
        return;
      }

      const safeParseArray = (payload) => {
        if (!payload) return [];
        if (Array.isArray(payload)) return payload;
        if (typeof payload === "string") {
          const trimmed = payload.trim();
          if (!trimmed) return [];
          try {
            const parsed = JSON.parse(trimmed);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        }
        return [];
      };

      const toNumber = (value, fallback = 0) => {
        const num = Number(value);
        return Number.isFinite(num) ? num : fallback;
      };

      const normalizeAnswerText = (value) => {
        if (value === undefined || value === null) return "";
        if (typeof value === "string") return value;
        if (Array.isArray(value)) {
          return value
            .map((item) => (typeof item === "string" ? item.trim() : ""))
            .filter(Boolean)
            .join(" ");
        }
        if (typeof value === "object") {
          return (
            value.student_answer ||
            value.studentAnswer ||
            value.content ||
            value.text ||
            value.answer ||
            value.value ||
            ""
          );
        }
        return String(value);
      };

      const normalizeImages = (candidates) => {
        const list = [];
        const pushValue = (value) => {
          if (value === undefined || value === null) return;
          if (Array.isArray(value)) {
            value.forEach(pushValue);
            return;
          }
          if (typeof value === "object") {
            const nested = value.url || value.src || value.path || value.imageUrl || value.answer_photo_url;
            if (nested) {
              pushValue(nested);
            }
            return;
          }
          let str = String(value).trim();
          if (!str) return;
          if (
            (str.startsWith("[") && str.endsWith("]")) ||
            (str.startsWith("{") && str.endsWith("}"))
          ) {
            try {
              const parsed = JSON.parse(str);
              pushValue(parsed);
              return;
            } catch {
              // fall through
            }
          }
          str
            .split(/[,;\n]/)
            .map((segment) => segment.trim())
            .filter(Boolean)
            .forEach((segment) => {
              if (!list.includes(segment)) {
                list.push(segment);
              }
            });
        };
        candidates.forEach(pushValue);
        return list;
      };

      try {
        // 先清空旧数据，确保切换学生时能立即看到变化
        setEssayData((prev) => ({
          ...prev,
          sentences: [],
          studentImages: [],
          wordCount: 0,
        }));
 
        message.loading({ content: "正在加载作文数据...", key: "loadEssay" });
        let response = null;
        let lastError = null;
        for (const candidate of uniqueCandidates) {
          if (!candidate) continue;
          console.log("[EssayGrading] 请求作文数据", { grading_id, paper_id: candidate });
          try {
            response = await getEssayResult({ grading_id, paper_id: candidate });
            if (response?.data) {
              lastError = null;
              break;
            }
          } catch (err) {
            lastError = err;
            console.warn("[EssayGrading] 使用标识加载失败，尝试下一个", candidate, err);
          }
        }
 
        if (!response?.data) {
          const msg = lastError?.message || "未找到该学生的作文数据";
          console.warn("[EssayGrading] 未加载到作文数据", { grading_id, student, candidates: uniqueCandidates }, lastError);
          message.warning({ content: msg, key: "loadEssay" });
          inflightKeyRef.current = null;
          return;
        }

        const data = response.data || {};

        const essayResultId =
          data.id ?? data.essay_result_id ?? data.essayResultId ?? data.tempId ?? null;
        if (!essayResultId) {
          console.error("后端返回的数据中没有 essay_result_id / id 字段");
          message.error("无法获取作文ID，请检查后端返回数据");
          inflightKeyRef.current = null;
          return;
        }

        const studentAnswerText = normalizeAnswerText(
          data.student_answer ??
            data.studentAnswer ??
            data.student_content ??
            data.studentContent ??
            data.answer_content ??
            data.answer ??
            "",
        );

        // 分割作文内容为句子
        const contentSentences = splitSentences(studentAnswerText);

        // 计算字数（去除空格和换行符）
        const wordCount = studentAnswerText.replace(/[\s\n\r]/g, "").length;

        const parsedFeedbacks = safeParseArray(
          data.sentences ??
            data.sentence_feedbacks ??
            data.sentenceFeedbacks ??
            data.sentence_feedback_list ??
            data.sentenceFeedbackList,
        );

        const parsedDimensionsRaw = safeParseArray(
          data.dimensions ?? data.dimension_list ?? data.dimensionList,
        );
        const parsedDimensions = parsedDimensionsRaw.map((item) => ({
          dimensionName: item.dimensionName || item.name || item.dimension || "",
          maxScore: toNumber(item.maxScore ?? item.fullScore ?? item.max_score),
          studentScore: toNumber(item.studentScore ?? item.score ?? item.student_score),
          comment: item.comment || item.scoreReason || item.score_reason || "",
        }));

        const images = normalizeImages([
          data.imgUrl,
          data.img_url,
          data.imgUrls,
          data.img_urls,
          data.answer_photo_url,
          data.answer_photo_urls,
          data.answerPhotoUrl,
          data.answerPhotoUrls,
          data.student_images,
          data.studentImages,
        ]);

        // 转换评语格式：后端 -> 前端
        const convertedComments = parsedFeedbacks
          .map((feedback) => {
            const sentenceText = (feedback?.sentence || "").trim();
            if (!sentenceText) return null;
            // 在句子数组中查找匹配的句子索引
            const sentenceIndex = contentSentences.findIndex((s) => s.trim() === sentenceText);
            const color =
              qualityToColor(
                feedback?.quality || feedback?.scoreQuality || feedback?.level || "",
              ) || "blue";
            return {
              sentenceIndex: sentenceIndex >= 0 ? sentenceIndex : -1,
              originalSentence: sentenceText,
              comment: feedback?.comment || "",
              color,
            };
          })
          .filter((comment) => comment && comment.sentenceIndex >= 0);

        // 更新当前学生的评语缓存，paperId 优先，其次学生唯一信息
        const fallbackKey =
          data.student_no || data.studentNo || data.student_name || data.studentName || "";
        setStudentComments((prev) => {
          const next = { ...prev };
          const primaryKey = resolveStudentKey(student);
          if (primaryKey) {
            next[primaryKey] = convertedComments;
          }
          if (fallbackKey && fallbackKey !== primaryKey) {
            next[fallbackKey] = convertedComments;
          }
          return next;
        });

        // 一次性更新所有作文数据
        const resolvedScore = toNumber(
          data.total_score ??
            data.totalScore ??
            data.essay_score ??
            data.essayScore ??
            data.score,
        );
        setEssayData({
          essayResultId,
          title:
            data.title ||
            data.question_title ||
            data.questionTitle ||
            data.question_content ||
            "作文批改",
          wordCount,
          sentences: contentSentences,
          studentImages: images,
          score: resolvedScore,
          dimensions: parsedDimensions,
          overallComment: data.overall_comment || data.overallComment || "",
        });

        message.success({ content: "作文数据加载成功", key: "loadEssay", duration: 2 });
      } catch (error) {
        console.error("加载作文数据失败:", error);
        message.error({ content: error?.message || "加载作文数据失败，请稍后重试", key: "loadEssay" });
      }
      // 请求结束，释放 in-flight 标记
      inflightKeyRef.current = null;
    },
    [grading_id, splitSentences, resolveStudentKey]
  ); // 只依赖 grading_id，其他都使用函数式更新或稳定的 setState

  useEffect(() => {
    if (!currentStudent) {
      lastLoadedStudentKeyRef.current = null;
      return;
    }
    const studentKey = resolveStudentKey(currentStudent);
    if (lastLoadedStudentKeyRef.current === studentKey) {
      return;
    }
    lastLoadedStudentKeyRef.current = studentKey;
    loadEssayData(currentStudent);
  }, [currentStudent, loadEssayData, resolveStudentKey]);

  // 当切到某个tab且该列表为空时，清空中间显示
  useEffect(() => {
    const getCountByTab = () => {
      if (!Array.isArray(students)) return 0;
      switch (studentFilterTab) {
        case "matched":
          return students.filter(s => s.type === "matched").length;
        case "absent":
          return students.filter(s => s.type === "absent").length;
        case "abnormal":
          return students.filter(s => s.type === "abnormal").length;
        case "all":
        default:
          return students.length;
      }
    };
    const count = getCountByTab();
    if (count === 0) {
      setEssayData(prev => ({
        ...prev,
        sentences: [],
        studentImages: [],
        wordCount: 0,
        overallComment: "",
      }));
    }
  }, [studentFilterTab, students]);

  // 如果 URL 携带了 paper_id 或 student_no，根据学生列表定位并加载对应作文
  useEffect(() => {
    if (!students || students.length === 0) return;
    // 优先 paper_id
    if (paper_id) {
      const idx = students.findIndex(s => String(s.paperId) === String(paper_id));
      if (idx >= 0) {
        setCurrentStudentIndex(idx);
        // 仅设置索引，实际加载统一由监听 currentStudent 的 useEffect 触发
        return;
      }
    }
    // 回退 student_no
    if (student_no) {
      const idx = students.findIndex(s => String(s.studentNo) === String(student_no));
      if (idx >= 0 && students[idx].paperId) {
        setCurrentStudentIndex(idx);
        // 仅设置索引，实际加载统一由监听 currentStudent 的 useEffect 触发
      }
    }
  }, [paper_id, student_no, students, resolveStudentKey]);

  // 加载批改结果列表（包含学生信息）- 使用 useCallback 优化，修复依赖问题
  const loadStudentList = useCallback(async (keepCurrentStudent = false) => {
    if (!grading_id) {
      message.warning("缺少必要参数：grading_id");
      return;
    }

    try {
      const previousStudent = keepCurrentStudent
        ? studentsRef.current[currentStudentIndexRef.current]
        : null;
      const previousStudentKey = resolveStudentKey(previousStudent);

      const v2Res = await getGradingResultsV2(grading_id).catch(() => ({ data: {} }));

      const v2Data = v2Res?.data || {};
      const v2Normal = Array.isArray(v2Data?.normal) ? v2Data.normal : [];
      const v2Abnormal = Array.isArray(v2Data?.abnormal) ? v2Data.abnormal : [];
      const v2Exceptional = Array.isArray(v2Data?.exceptional) ? v2Data.exceptional : [];
      const v2Absent = Array.isArray(v2Data?.absent) ? v2Data.absent : [];

      const v2List = [...v2Normal, ...v2Abnormal, ...v2Exceptional];

      if (v2List.length === 0 && v2Absent.length === 0) {
        message.warning("该批改会话暂无学生数据");
        setStudents([]);
        return;
      }

      // 统一将 v2 数据转换为学生数据格式
      const mapV2ItemToStudent = (item) => {
        const pid = item.paper_id || item.paperId || null;
        const sno = item.student_no || item.studentNo || "";
        const name = item.student_name || item.studentName || "未知";
        const { type, statusText, badge } = resolveStatusInfo(item?.status);
        const score = Number(
          item.essay_score ?? item.essayScore ?? 0
        ) || 0;
        const candidateIds = [pid, sno, item.id]
          .map((v) => (v === undefined || v === null ? "" : String(v)))
          .filter(Boolean);
        return {
          id: pid || sno || name,
          name,
          score,
          status: statusText,
          statusBadge: badge,
          studentNo: sno || name,
          paperId: pid || null,
          wordCount: 0,
          type,
          v2Data: item,
          candidateIds: Array.from(new Set(candidateIds)),
          nameImageUrl: item.student_name_img_url || "",
        };
      };

      const formattedStudents = v2List.map(mapV2ItemToStudent);

      const absentStudents = v2Absent.map((item, idx) => {
        const base = mapV2ItemToStudent(item);
        return {
          ...base,
          id: base.studentNo || base.name || `absent-${idx}`,
          type: "absent",
          status: "缺考",
          statusBadge: "warning",
          paperId: null,
          score: Number(item.essay_score ?? item.essayScore ?? 0) || 0,
        };
      });

      const combinedStudents = [...formattedStudents, ...absentStudents];

      const typeOrder = { matched: 0, absent: 1, abnormal: 2 };
      combinedStudents.sort((a, b) => {
        const diff = (typeOrder[a.type] ?? 3) - (typeOrder[b.type] ?? 3);
        if (diff !== 0) return diff;
        return (a.name || "").localeCompare(b.name || "");
      });

      setStudents(combinedStudents);

      const findFirstEssayIndex = () => {
        const idx = combinedStudents.findIndex((student) => student.paperId);
        return idx >= 0 ? idx : 0;
      };

      if (keepCurrentStudent && previousStudentKey) {
        const stayIndex = combinedStudents.findIndex(
          (student) => resolveStudentKey(student) === previousStudentKey
        );
        if (stayIndex >= 0) {
          setCurrentStudentIndex(stayIndex);
          // 仅设置索引，实际加载统一由监听 currentStudent 的 useEffect 触发
        } else {
          const fallbackIndex = findFirstEssayIndex();
          setCurrentStudentIndex(fallbackIndex);
          // 仅设置索引，实际加载统一由监听 currentStudent 的 useEffect 触发
        }
      } else if (!keepCurrentStudent) {
        const initialIndex = findFirstEssayIndex();
        setCurrentStudentIndex(initialIndex);
        // 仅设置索引，实际加载统一由监听 currentStudent 的 useEffect 触发
      }
    } catch (error) {
      console.error("加载批改结果列表失败:", error);
      message.error("加载学生数据失败，请稍后重试");
    }
  }, [grading_id, resolveStatusInfo, resolveStudentKey]);

  // 组件挂载时加载学生列表
  useEffect(() => {
    if (grading_id) {
      loadStudentList();
    }
  }, [grading_id, loadStudentList]); // 正确添加所有依赖

  // 当选中学生变化时，重置交互状态
  useEffect(() => {
    if (currentStudent) {
      // 重置句子交互状态
      setSentenceInteraction({
        highlightedIndex: -1,
        selectedIndex: -1,
        animationKey: 0,
        showAddComment: false,
      });
      // 重置编辑状态
      setEditingState({
        score: null,
        comment: { index: null, content: "" },
      });
    }
  }, [currentStudent]);

  // 添加点击外部区域取消选中的事件监听
  useEffect(() => {
    const handleClickOutside = (event) => {
      // 检查点击是否在essay-content之外
      const essayContent = essayContentRef.current;
      if (!essayContent) return;

      // 如果点击的是essay-content内的句子，不处理（由句子点击事件处理）
      const clickedSentence = event.target.closest('.essay-sentence');
      if (clickedSentence) return;

      // 如果点击的是操作工具栏或弹窗，不处理
      const clickedToolbar = event.target.closest('.sentence-selection-toolbar');
      const clickedModal = event.target.closest('.color-selection-modal');
      if (clickedToolbar || clickedModal) return;

      // 检查当前选中的句子是否有评语
      if (sentenceInteraction.selectedIndex >= 0) {
        const hasComment = getSentenceColor(sentenceInteraction.selectedIndex) !== "";
        
        // 如果没有评语，则取消选中
        if (!hasComment) {
          setSentenceInteraction(prev => ({
            ...prev,
            selectedIndex: -1,
            showAddComment: false,
          }));
        }
      }
    };

    // 添加全局点击监听
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sentenceInteraction.selectedIndex, sentenceComments, currentStudent, getSentenceColor]); // 正确添加所有依赖，包括 getSentenceColor

  // 处理句子高亮（使用 useCallback 优化性能）
  const handleSentenceMouseEnter = useCallback((index) => {
    setSentenceInteraction(prev => ({ ...prev, highlightedIndex: index }));
  }, []); // 空依赖，因为只使用了 setState

  // 处理句子高亮取消（使用 useCallback 优化性能）
  const handleSentenceMouseLeave = useCallback(() => {
    setSentenceInteraction(prev => ({ ...prev, highlightedIndex: -1 }));
  }, []); // 空依赖，因为只使用了 setState

  // 质量等级转颜色
  const qualityToColor = (quality) => {
    const qualityColorMap = {
      "优": "green",
      "良": "blue",
      "中": "orange",
      "差": "red",
    };
    return qualityColorMap[quality] || "blue";
  };

  // 获取颜色值
  const getColorValue = (colorName) => {
    const colorMap = {
      blue: "#1890ff",
      green: "#52c41a",
      purple: "#722ed1",
      orange: "#fa8c16",
      red: "#f5222d",
      default: "#d9d9d9",
    };
    return colorMap[colorName] || colorMap.default;
  };

  // 切换显示模式（使用 useCallback 优化性能）
  const handleViewModeChange = useCallback((e) => {
    setViewMode(e.target.value);
  }, []); // 空依赖，因为只使用了 setState

  // 点击学生列表切换学生（使用 useCallback 优化性能）
  const handleStudentClick = useCallback((index) => {
    setCurrentStudentIndex(index);
  }, [setCurrentStudentIndex]); // 依赖相关状态和函数

  // 点击句子选中（使用 useCallback 优化性能）
  const handleSentenceClick = useCallback((sentence, index) => {
    setSentenceInteraction(prev => ({
      ...prev,
      selectedIndex: index,
      animationKey: prev.animationKey + 1, // 触发动画
    }));
  }, []); // 空依赖，因为只使用了 setState

  // 使用 useMemo 缓存句子元素，优化渲染性能（必须在所有事件处理函数定义之后）
  const sentenceElements = useMemo(() => {
    return essayData.sentences.map((sentence, index) => {
      const color = getSentenceColor(index);
      const hasComment = color !== "";
      const isSelected = index === sentenceInteraction.selectedIndex;
      const isHovered = index === sentenceInteraction.highlightedIndex;
      
      return (
        <span
          key={index}
          className={`essay-sentence 
            ${isSelected ? "selected" : ""}
            ${isHovered && !isSelected ? "hovered" : ""} 
            ${hasComment ? `comment-${color}` : ""}`}
          style={
            hasComment
              ? {
                  borderBottom: `2px solid ${getColorValue(color)}`,
                  cursor: "pointer",
                }
              : { cursor: "pointer" }
          }
          onMouseEnter={() => handleSentenceMouseEnter(index)}
          onMouseLeave={handleSentenceMouseLeave}
          onClick={() => handleSentenceClick(sentence, index)}
        >
          {sentence}
        </span>
      );
    });
  }, [
    essayData.sentences,
    sentenceInteraction.selectedIndex,
    sentenceInteraction.highlightedIndex,
    getSentenceColor, // getSentenceColor 函数（已用 useCallback 包装）
    handleSentenceMouseEnter,
    handleSentenceMouseLeave,
    handleSentenceClick,
  ]);

  // 关闭选中状态（使用 useCallback 优化性能）
  const _handleCloseSelection = useCallback(() => {
    setSentenceInteraction(prev => ({
      ...prev,
      selectedIndex: -1,
      showAddComment: false,
    }));
  }, []); // 空依赖，因为只使用了 setState

  // 打开添加评语弹窗（使用 useCallback 优化性能）
  const handleOpenAddComment = useCallback(() => {
    setSentenceInteraction(prev => ({ ...prev, showAddComment: true }));
  }, []); // 空依赖，因为只使用了 setState

  // 添加评语（使用 useCallback 优化性能）
  const handleAddComment = useCallback((color) => {
    if (!selectedSentence || !currentStudent) return;
    
    // 检查该句子是否已有评语
    const existingComment = sentenceComments.find(
      (item) => item.originalSentence === selectedSentence
    );

    if (existingComment) {
      message.warning("该句子已有评语");
      setSentenceInteraction(prev => ({ ...prev, showAddComment: false }));
      return;
    }

    const newComment = {
      sentenceIndex: sentenceInteraction.selectedIndex,
      originalSentence: selectedSentence,
      comment: "", // 空字符串，等待用户输入
      color: color,
    };

    // 更新当前学生的评语
    const updatedComments = [...sentenceComments, newComment];
    const key = resolveStudentKey(currentStudent);
    setStudentComments(prev => ({
      ...prev,
      [key]: updatedComments,
    }));
    
    // 重置选中状态并进入编辑模式
    setSentenceInteraction(prev => ({
      ...prev,
      selectedIndex: -1,
      showAddComment: false,
    }));
    
    // 自动进入编辑模式，让用户立即输入内容
    const newIndex = updatedComments.length - 1;
    setEditingState(prev => ({
      ...prev,
      comment: { index: newIndex, content: "" },
    }));
    
    // 保存到后端
    if (essayData.essayResultId) {
      saveSentenceFeedbacks(essayData.essayResultId, updatedComments);
    }
    
    message.success("评语已添加，请输入内容");
  }, [selectedSentence, currentStudent, sentenceComments, sentenceInteraction.selectedIndex, essayData.essayResultId, resolveStudentKey]); // 依赖所有使用的状态

  // 删除评语（使用 useCallback 优化性能）
  const handleDeleteComment = useCallback(() => {
    if (!selectedSentence || !currentStudent) return;
    
    // 查找选中句子的评语
    const existingComment = sentenceComments.find(
      (item) => item.originalSentence === selectedSentence
    );

    if (existingComment) {
      Modal.confirm({
        title: "确认删除",
        content: "确定要删除这条评语吗？",
        okText: "确定",
        cancelText: "取消",
        onOk: () => {
          const updatedComments = sentenceComments.filter(
            (item) => item.originalSentence !== selectedSentence
          );
          const key = resolveStudentKey(currentStudent);

          // 更新当前学生的评语
          setStudentComments(prev => ({
            ...prev,
            [key]: updatedComments,
          }));
          
          // 重置选中状态
          setSentenceInteraction(prev => ({
            ...prev,
            selectedIndex: -1,
          }));
          
          // 保存到后端
          if (essayData.essayResultId) {
            saveSentenceFeedbacks(essayData.essayResultId, updatedComments);
          }
          
          message.success("评语已删除");
        },
      });
    } else {
      message.info("该句子没有评语");
    }
  }, [selectedSentence, currentStudent, sentenceComments, essayData.essayResultId, resolveStudentKey]); // 依赖所有使用的状态

  // 开始编辑评语（使用 useCallback 优化性能）
  const handleStartEdit = useCallback((index, content) => {
    // 如果内容为空或是占位符，设为空字符串
    const editContent = (!content || content === "请输入评语内容...") ? "" : content;
    setEditingState(prev => ({
      ...prev,
      comment: { index, content: editContent },
    }));
  }, []); // 空依赖，因为只使用了 setState

  // 保存编辑（使用 useCallback 优化性能）
  const handleSaveEdit = useCallback((index) => {
    if (!currentStudent) return;
    
    const updatedComments = [...sentenceComments];
    updatedComments[index] = {
      ...updatedComments[index],
      comment: editingState.comment.content,
    };
    const key = resolveStudentKey(currentStudent);
    
    // 更新当前学生的评语
    setStudentComments(prev => ({
      ...prev,
      [key]: updatedComments,
    }));
    
    // 重置编辑状态
    setEditingState(prev => ({
      ...prev,
      comment: { index: null, content: "" },
    }));
    
    // 保存到后端
    if (essayData.essayResultId) {
      saveSentenceFeedbacks(essayData.essayResultId, updatedComments);
    }
    
    message.success("评语已更新");
  }, [currentStudent, sentenceComments, editingState.comment.content, essayData.essayResultId, resolveStudentKey]); // 依赖所有使用的状态

  // 取消编辑（使用 useCallback 优化性能）
  const handleCancelEdit = useCallback(() => {
    setEditingState(prev => ({
      ...prev,
      comment: { index: null, content: "" },
    }));
  }, []); // 空依赖，因为只使用了 setState

  // 开始编辑分数（使用 useCallback 优化性能）
  const handleStartEditScore = useCallback(() => {
    setEditingState(prev => ({
      ...prev,
      score: essayData.score, // 编辑作文分数
    }));
  }, [essayData.score]); // 依赖 essayData.score

  // 处理分数输入变化（使用 useCallback 优化性能）
  const handleScoreInputChange = useCallback((e) => {
    const value = e.target.value;
    
    // 允许空字符串（用户正在删除）
    if (value === '') {
      setEditingState(prev => ({ ...prev, score: '' }));
      return;
    }
    
    // 只允许输入数字
    if (!/^\d+$/.test(value)) {
      return;
    }
    
    const numValue = parseInt(value, 10);
    
    // 验证范围：0-60的自然数
    if (numValue >= 0 && numValue <= 60) {
      setEditingState(prev => ({ ...prev, score: numValue }));
    }
  }, []); // 空依赖，因为只使用了 setState

  // 保存修改的分数（使用 useCallback 优化性能）
  const handleSaveScore = useCallback(async () => {
    if (!essayData.essayResultId || !grading_id || !currentStudent) {
      message.error("缺少必要参数，无法保存分数");
      return;
    }

    // 验证分数是否为有效数字
    if (editingState.score === '' || editingState.score === null || editingState.score === undefined) {
      message.error("请输入有效的分数");
      return;
    }

    const finalScore = typeof editingState.score === 'string' ? parseInt(editingState.score, 10) : editingState.score;

    // 验证分数范围（0-60的自然数）
    if (isNaN(finalScore) || finalScore < 0 || finalScore > 60) {
      message.error("分数必须在0-60之间");
      return;
    }

    // 如果分数没有变化，直接关闭编辑模式
    if (finalScore === essayData.score) {
      setEditingState(prev => ({ ...prev, score: null }));
      message.info("分数未发生变化");
      return;
    }

    try {
      message.loading({ content: "正在保存分数...", key: "saveScore" });
      
      await alterScore({
        essay_result_id: essayData.essayResultId,
        grading_id: grading_id,
        paper_id: currentStudent.paperId,
        old_score: essayData.score, // 传入旧的作文分数
        new_score: finalScore,  // 传入新的作文分数
      });

      // 更新本地状态
      setEssayData(prev => ({ ...prev, score: finalScore }));
      setEditingState(prev => ({ ...prev, score: null }));
      
      message.success({ content: "分数保存成功", key: "saveScore", duration: 2 });
      
      // 重新加载学生列表以更新左侧的作文分数显示（保持当前选中的学生）
      await loadStudentList(true);
      
      // 注意：不重新加载作文数据，因为后端的 ai_score 可能没有立即更新
      // 直接使用本地更新的分数即可
    } catch (error) {
      console.error("保存分数失败:", error);
      message.error({ content: "保存分数失败，请稍后重试", key: "saveScore" });
    }
  }, [essayData.essayResultId, essayData.score, grading_id, currentStudent, editingState.score, loadStudentList]); // 依赖所有使用的状态和函数

  // 取消编辑分数（使用 useCallback 优化性能）
  const handleCancelEditScore = useCallback(() => {
    setEditingState(prev => ({ ...prev, score: null }));
  }, []); // 空依赖，因为只使用了 setState

  // 保存评语到服务器
  const saveSentenceFeedbacks = async (resultId, commentsArray) => {
    try {
      // 将组件的评语格式转换为后端需要的格式
      const backendFormat = commentsArray.map((comment) => {
        // 根据颜色反推质量等级
        let quality = "良";
        if (comment.color === "green") {
          quality = "优";
        } else if (comment.color === "blue") {
          quality = "良";
        } else if (comment.color === "orange") {
          quality = "中";
        } else if (comment.color === "red") {
          quality = "差";
        }

        return {
          sentence: comment.originalSentence,
          quality: quality,
          comment: comment.comment || "",
        };
      });

      // 调用后端API
      await alterSentenceFeedbacks({
        essay_result_id: resultId,
        sentence_feedbacks: JSON.stringify(backendFormat),
      });
      
      message.success("评语保存成功");
    } catch (error) {
      console.error("保存评语失败:", error);
      message.error("保存评语失败，请稍后重试");
    }
  };

  // 删除批改会话（使用 useCallback 优化性能）
  const handleDeleteGrading = useCallback(() => {
    if (!grading_id) {
      message.error("缺少批改会话ID");
      return;
    }

    Modal.confirm({
      title: "确认删除",
      content: "确定要删除这个批改会话吗？删除后将无法恢复，所有批改数据都会被清除。",
      okText: "确定删除",
      okType: "danger",
      cancelText: "取消",
      onOk: async () => {
        try {
          message.loading({ content: "正在删除批改会话...", key: "deleteGrading" });
          
          // 调用删除API，参数使用下划线命名
          await deleteGrading({ grading_id });
          
          message.success({ content: "批改会话已删除", key: "deleteGrading", duration: 2 });
          
          // 删除成功后跳转回首页
          setTimeout(() => {
            navigate("/");
          }, 500);
        } catch (error) {
          console.error("删除批改会话失败:", error);
          message.error({ content: "删除批改会话失败，请稍后重试", key: "deleteGrading" });
        }
      },
    });
  }, [grading_id, navigate]); // 依赖 grading_id 和 navigate

  return (
    <div className="essay-grading-container">
      <div className="essay-grading-content">
        {/* 左侧：学生信息 */}
        <StudentList
          students={students}
          currentStudentIndex={currentStudentIndex}
          onStudentClick={handleStudentClick}
          onFilterChange={setStudentFilterTab}
        />

        {/* 中间：作文内容 */}
        <EssayContent
          ref={essayContentRef}
            essayData={essayData}
            currentStudent={currentStudent}
            viewMode={viewMode}
            sentenceElements={sentenceElements}
            studentImages={essayData.studentImages}
            selectedSentence={selectedSentence}
            showAddComment={sentenceInteraction.showAddComment}
            animationKey={sentenceInteraction.animationKey}
            onViewModeChange={handleViewModeChange}
            onDeleteGrading={handleDeleteGrading}
            onNavigate={navigate}
            onOpenAddComment={handleOpenAddComment}
            onDeleteComment={handleDeleteComment}
          />

        {/* 右侧：评分内容 */}
        <div className="right-panel">
          <ScoreEditor
            score={essayData.score}
            isEditing={editingState.score !== null}
            editingScore={editingState.score}
            onStartEdit={handleStartEditScore}
            onScoreChange={handleScoreInputChange}
            onSave={handleSaveScore}
            onCancel={handleCancelEditScore}
          />

          <Divider style={{ margin: "12px 0" }} />

          <div className="evaluation-section">
            <h4>总评</h4>
            <div className="evaluation-content">
              {essayData.overallComment || "暂无总评"}
            </div>
          </div>

          <Divider style={{ margin: "12px 0" }} />

          <DimensionScores dimensions={essayData.dimensions} />

          <Divider style={{ margin: "12px 0" }} />

          <SentenceComments
            comments={sentenceComments}
            highlightedIndex={sentenceInteraction.highlightedIndex}
            editingIndex={editingState.comment.index}
            editingContent={editingState.comment.content}
            getColorValue={getColorValue}
            onStartEdit={handleStartEdit}
            onContentChange={(e) => setEditingState(prev => ({
              ...prev,
              comment: { ...prev.comment, content: e.target.value }
            }))}
            onSave={handleSaveEdit}
            onCancel={handleCancelEdit}
          />
        </div>
      </div>

      {/* 添加评语颜色选择弹窗 */}
      <ColorSelectionModal
        selectedSentence={selectedSentence}
        show={sentenceInteraction.showAddComment}
        onSelectColor={handleAddComment}
        onCancel={() => setSentenceInteraction(prev => ({ ...prev, showAddComment: false }))}
      />
    </div>
  );
};

export default EssayGrading;
