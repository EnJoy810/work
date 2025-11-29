import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { message, Button, Switch, Tooltip } from "antd";
import { PrinterOutlined } from "@ant-design/icons";
import html2canvas from "html2canvas";
import { useSearchParams } from "react-router-dom";
import StudentList from "./components/StudentList";
import AnswerSheetCanvas from "./components/AnswerSheetCanvas";
import AnnotationPanel from "./components/AnnotationPanel";
import { getGradingResultV2, uploadTrace, getStudentTraceList } from "../../api/trace";
import {
  ANNOTATION_SCALE_DEFAULT,
  ANNOTATION_WIDTH_DEFAULT,
  clampAnnotationScale
} from "./constants";
import "./trace.css";

// Quick feature flag so the entire zoom experiment can be disabled in one line if needed.
const ENABLE_CANVAS_ZOOM = true;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.1;

const PANEL_UI_KEY = "trace-demo-panels";

const getInitialPanelState = () => {
  if (typeof window === "undefined") {
    return { left: true, right: true };
  }
  try {
    const stored = localStorage.getItem(PANEL_UI_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        left: typeof parsed.left === "boolean" ? parsed.left : true,
        right: typeof parsed.right === "boolean" ? parsed.right : true
      };
    }
  } catch (e) {
    console.warn("Failed to parse trace demo panel state", e);
  }
  return { left: true, right: true };
};

const persistPanelState = (left, right) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PANEL_UI_KEY, JSON.stringify({ left, right }));
  } catch (e) {
    console.warn("Failed to store trace demo panel state", e);
  }
};

const ensureAnnotationScale = (annotation) => {
  if (!annotation) return annotation;
  const nextScale =
    typeof annotation.scale === "number" ? clampAnnotationScale(annotation.scale) : ANNOTATION_SCALE_DEFAULT;
  const originalScale =
    typeof annotation.originalScale === "number"
      ? clampAnnotationScale(annotation.originalScale)
      : nextScale;
  return {
    ...annotation,
    scale: nextScale,
    originalScale
  };
};

// 确保批注宽度合法（高度由内容自动计算）
const ensureAnnotationWidth = (annotation) => {
  if (!annotation) return annotation;
  const width = typeof annotation.width === "number" 
    ? annotation.width 
    : annotation.defaultWidth ?? ANNOTATION_WIDTH_DEFAULT;
  const originalWidth = typeof annotation.originalWidth === "number" 
    ? annotation.originalWidth 
    : annotation.defaultWidth ?? width;

  return {
    ...annotation,
    width,
    originalWidth
  };
};

const normalizeAnnotation = (annotation) => {
  if (!annotation) return annotation;
  return ensureAnnotationWidth(ensureAnnotationScale(annotation));
};

const normalizeAnswerSheetData = (payload) => {
  if (!payload) return payload;
  const nextQuestions = Array.isArray(payload.questions)
    ? payload.questions.map((question) => ({
        ...question,
        annotations: Array.isArray(question.annotations)
          ? question.annotations.map(normalizeAnnotation)
          : []
      }))
    : [];

  return {
    ...payload,
    questions: nextQuestions
  };
};

const TracePage = () => {
  const [searchParams] = useSearchParams();
  const gradingId = searchParams.get('grading_id');
  
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [answerSheetData, setAnswerSheetData] = useState(null);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showLeftPanel, setShowLeftPanel] = useState(() => getInitialPanelState().left);
  const [showRightPanel, setShowRightPanel] = useState(() => getInitialPanelState().right);
  const [scale, setScale] = useState(1);
  const [autoSaveOnSwitch, setAutoSaveOnSwitch] = useState(false); // 自动保存开关（默认关闭）
  const [loading, setLoading] = useState(true);
  const imageSizeCacheRef = useRef(new Map()); // 缓存图片尺寸

  const currentStudentIndex = useMemo(() => {
    if (!selectedStudent) return -1;
    return students.findIndex((s) => s.student_id === selectedStudent.student_id);
  }, [students, selectedStudent]);

  // 加载学生数据
  const loadStudentData = useCallback(async (student) => {
    try {
      // 不设置 loading，避免页面闪烁
      // setLoading(true);
      
      if (!student.student_id) {
        message.warning("缺少学生ID");
        return;
      }
      
      // 加载留痕列表（包含所有题目的批改信息）
      const traceResponse = await getStudentTraceList(student.student_id);
      
      if (traceResponse?.code === '200' && traceResponse?.data) {
        const traces = Array.isArray(traceResponse.data) ? traceResponse.data : [];
        
        // 解析 paper_urls（JSON 字符串格式）
        let paperUrls = [];
        if (student.paper_urls) {
          try {
            paperUrls = typeof student.paper_urls === 'string' 
              ? JSON.parse(student.paper_urls) 
              : student.paper_urls;
          } catch (e) {
            console.error("解析 paper_urls 失败:", e);
          }
        }
        
        // 获取第一张图片的真实尺寸（使用缓存）
        let IMAGE_WIDTH = 4961;  // 默认值
        let IMAGE_HEIGHT = 3509; // 默认值
        
        if (paperUrls.length > 0) {
          const imageUrl = paperUrls[0];
          const cached = imageSizeCacheRef.current.get(imageUrl);
          
          if (cached) {
            // 使用缓存的尺寸
            IMAGE_WIDTH = cached.width;
            IMAGE_HEIGHT = cached.height;
          } else {
            // 首次加载，获取尺寸并缓存
            try {
              const img = new Image();
              await new Promise((resolve, reject) => {
                img.onload = () => {
                  IMAGE_WIDTH = img.naturalWidth;
                  IMAGE_HEIGHT = img.naturalHeight;
                  imageSizeCacheRef.current.set(imageUrl, { width: IMAGE_WIDTH, height: IMAGE_HEIGHT });
                  resolve();
                };
                img.onerror = reject;
                img.src = imageUrl;
              });
            } catch (e) {
              console.warn("无法获取图片尺寸，使用默认值:", e);
            }
          }
        }
        
        // 构建答题卡数据结构
        const answerSheetData = {
          id: student.student_id,
          student_name: student.student_name,
          student_no: student.student_no,
          grading_id: student.grading_id,
          status: student.status,
          total_score: student.total_score,
          full_score: 100,
          paper_urls: paperUrls,
          questions: traces.map((item) => {
            // 如果 trace 为 null（如作文题），跳过该题目
            if (!item.trace) {
              return null;
            }
            
            // 解析 trace 字段（JSON 字符串）
            let traceData = {};
            if (item.trace) {
              try {
                traceData = typeof item.trace === 'string' ? JSON.parse(item.trace) : item.trace;
              } catch (e) {
                console.error("解析 trace 失败:", item.question_id, e);
              }
            }
            
            // 检查数据完整性
            if (!traceData.bbox) {
              return null;
            }
            
            // 处理批注：使用像素坐标
            let annotations = [];
            
            if (traceData.annotations && Array.isArray(traceData.annotations) && traceData.annotations.length > 0) {
              // 已有批注：需要限制范围，防止超出边界
              annotations = traceData.annotations.map(ann => {
                if (!ann) return null;
                // 如果没有保存宽度，根据内容长度计算
                let width = ann.width;
                if (!width && ann.content) {
                  const contentLength = ann.content.length;
                  if (contentLength <= 10) {
                    width = 80;
                  } else if (contentLength <= 30) {
                    width = 200;
                  } else if (contentLength <= 60) {
                    width = 300;
                  } else {
                    width = 400;
                  }
                } else if (!width) {
                  width = ANNOTATION_WIDTH_DEFAULT;
                }
                const height = 40;
                
                // 获取位置（后端返回的是像素坐标）
                const pixelPos = ann.position || ann.currentPosition;
                if (!pixelPos) {
                  // 跳过没有位置信息的批注
                  return null;
                }
                
                // 限制范围：确保批注框不超出图片边界
                const clampedPosition = {
                  x: Math.max(width / 2, Math.min(pixelPos.x, IMAGE_WIDTH - width / 2)),
                  y: Math.max(height / 2, Math.min(pixelPos.y, IMAGE_HEIGHT - height / 2))
                };
                
                return {
                  ...ann,
                  position: clampedPosition,
                  currentPosition: clampedPosition
                };
              }).filter(ann => ann !== null);
            } else {
              // 生成默认批注
              if (item.question_type === 'choice' && item.score === 0) {
                // 错误选择题：显示红X，使用后端提供的 rtp
                const rtp = traceData.rtp || { x: 0, y: 0 };
                const position = {
                  x: traceData.bbox.x + rtp.x,
                  y: traceData.bbox.y + rtp.y
                };
                
                annotations.push({
                  id: `annotation-${item.question_id}`,
                  content: "X",
                  position: position,  // 像素坐标
                  scale: 1,
                  width: 20,
                  isChoiceError: true
                });
              } else if (item.question_type !== 'choice') {
                // 非选择题：显示分数，使用后端提供的 rtp
                const rtp = traceData.rtp || { x: 0, y: 0 };
                const position = {
                  x: traceData.bbox.x + rtp.x,
                  y: traceData.bbox.y + rtp.y
                };
                
                // 根据内容长度动态计算宽度
                const contentLength = (item.score_reason || `${item.score}分`).length;
                let width;
                if (contentLength <= 10) {
                  width = 80;   // 短文本：如 "5分"
                } else if (contentLength <= 30) {
                  width = 200;  // 中等文本
                } else if (contentLength <= 60) {
                  width = 300;  // 较长文本
                } else {
                  width = 400;  // 长文本
                }
                
                annotations.push({
                  id: `annotation-${item.question_id}`,
                  content: item.score_reason || `${item.score}分`,
                  position: position,  // 像素坐标
                  originalRtp: { ...rtp },  // 保存原始 rtp，用于重置位置
                  score: item.score,
                  scale: ANNOTATION_SCALE_DEFAULT,
                  width: width
                });
              }
            }
            
            return {
              questionId: item.question_id,
              paper_id: student.student_id,
              question_no: item.question_id,
              question_type: item.question_type,
              score: item.score || 0,
              full_score: 10,
              bbox: traceData.bbox,  // 像素坐标
              annotations: annotations,
              imageWidth: IMAGE_WIDTH,
              imageHeight: IMAGE_HEIGHT
            };
          }).filter(q => q !== null)
        };
        
        const normalizedData = normalizeAnswerSheetData(answerSheetData);
        setAnswerSheetData(normalizedData);
        setSelectedStudent(student);
        setSelectedAnnotationId(null);
        setHasUnsavedChanges(false);
      } else {
        message.error("加载学生数据失败");
      }
    } catch (error) {
      console.error('加载学生数据失败:', error);
      message.error("加载学生数据失败");
    }
    // 不需要 finally 设置 loading，避免闪烁
  }, []);



  // 获取学生列表
  useEffect(() => {
    if (!gradingId) {
      message.warning('缺少批改任务ID');
      setLoading(false);
      return;
    }

    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await getGradingResultV2(gradingId);
        
        if (response.code === '200' && response.data) {
          
          // 合并正常和异常学生列表
          const normalStudents = (response.data.normal || []).map(s => ({
            student_id: s.paper_id,
            student_name: s.student_name,
            student_no: s.student_no,
            status: parseInt(s.status) || 200,
            grading_id: s.grading_id,
            paper_urls: s.paper_urls,
            total_score: s.total_score
          }));
          
          const exceptionalStudents = (response.data.exceptional || []).map(s => ({
            student_id: s.paper_id,
            student_name: s.student_name,
            student_no: s.student_no,
            status: parseInt(s.status) || 4001,
            grading_id: s.grading_id,
            paper_urls: s.paper_urls,
            total_score: s.total_score
          }));
          
          const allStudents = [...normalStudents, ...exceptionalStudents];
          setStudents(allStudents);
          
          // 加载第一个学生数据
          if (allStudents.length > 0) {
            await loadStudentData(allStudents[0]);
            setLoading(false); // 加载完成后关闭 loading
          } else {
            message.warning('暂无学生数据');
            setLoading(false);
          }
        } else {
          message.error('获取学生列表失败');
          setLoading(false);
        }
      } catch (error) {
        console.error('获取学生列表失败:', error);
        message.error('获取学生列表失败');
        setLoading(false);
      }
    };

    fetchStudents();
  }, [gradingId]); // eslint-disable-line react-hooks/exhaustive-deps

  const applyZoom = (updater) => {
    setScale((prev) => {
      if (!ENABLE_CANVAS_ZOOM) return 1;
      const target = typeof updater === "function" ? updater(prev) : updater ?? prev;
      const clamped = Math.min(Math.max(target, MIN_ZOOM), MAX_ZOOM);
      return Number(clamped.toFixed(2));
    });
  };

  const handleZoomIn = () => applyZoom((prev) => prev + ZOOM_STEP);
  const handleZoomOut = () => applyZoom((prev) => prev - ZOOM_STEP);
  const handleZoomReset = () => applyZoom(1);


  const handleAnnotationDrag = (annotationId, newDisplayPos, bbox, imageDimensions) => {
    // newDisplayPos 是显示坐标（缩放后的像素值）
    // 需要转换为整页像素坐标
    
    setAnswerSheetData(prevData => {
      if (!prevData) return prevData;
      
      const updatedQuestions = prevData.questions.map((question) => ({
        ...question,
        annotations: question.annotations.map((ann) => {
          if (ann.id !== annotationId) return ann;
          
          // 显示坐标 → 归一化坐标 → 整页像素坐标
          const normalizedPos = {
            x: newDisplayPos.x / imageDimensions.width,
            y: newDisplayPos.y / imageDimensions.height
          };
          
          const pagePixelPos = {
            x: normalizedPos.x * question.imageWidth,
            y: normalizedPos.y * question.imageHeight
          };
          
          // 限制范围：确保批注框不超出图片边界
          // position 是中心点坐标，需要考虑批注框的宽高
          const width = ann.width || ANNOTATION_WIDTH_DEFAULT;
          const height = 40;  // 批注框高度（估算）
          
          const clampedPos = {
            x: Math.max(width / 2, Math.min(pagePixelPos.x, question.imageWidth - width / 2)),
            y: Math.max(height / 2, Math.min(pagePixelPos.y, question.imageHeight - height / 2))
          };
          
          return { 
            ...ann, 
            position: clampedPos,  // 保存限制后的像素坐标
            currentPosition: clampedPos  // 兼容
          };
        })
      }));

      return {
        ...prevData,
        questions: updatedQuestions
      };
    });
    setHasUnsavedChanges(true);
  };

  const handleAnnotationScaleChange = (annotationId, nextScaleValue) => {
    const normalizedScale = clampAnnotationScale(nextScaleValue);
    let hasChange = false;

    setAnswerSheetData(prevData => {
      if (!prevData) return prevData;
      
      const updatedQuestions = prevData.questions.map((question) => {
        if (!Array.isArray(question.annotations)) {
          return question;
        }
        let questionChanged = false;
        const updatedAnnotations = question.annotations.map((ann) => {
          if (ann.id !== annotationId) return ann;
          if (ann.scale === normalizedScale) return ann;
          questionChanged = true;
          hasChange = true;
          return { ...ann, scale: normalizedScale };
        });
        return questionChanged ? { ...question, annotations: updatedAnnotations } : question;
      });

      if (!hasChange) {
        return prevData;
      }

      return {
        ...prevData,
        questions: updatedQuestions
      };
    });
    
    if (hasChange) {
      setHasUnsavedChanges(true);
    }
  };

  // 更新批注尺寸（主要是宽度，高度由内容决定）
  const handleAnnotationSizeChange = useCallback((annotationId, nextSize) => {
    if (!nextSize) return;

    const { width, height } = nextSize;
    let hasChange = false;

    setAnswerSheetData(prevData => {
      if (!prevData) return prevData;
      
      const updatedQuestions = prevData.questions.map((question) => {
        if (!Array.isArray(question.annotations)) {
          return question;
        }
        let questionChanged = false;
        const updatedAnnotations = question.annotations.map((ann) => {
          if (ann.id !== annotationId) return ann;
          // 检查是否有变化
          const widthChanged = Math.abs((ann.width ?? 0) - width) >= 0.5;
          const heightChanged = height && Math.abs((ann.height ?? 0) - height) >= 0.5;
          if (!widthChanged && !heightChanged) {
            return ann;
          }
          questionChanged = true;
          hasChange = true;
          return { ...ann, width, ...(height && { height }) };
        });
        return questionChanged ? { ...question, annotations: updatedAnnotations } : question;
      });

      if (!hasChange) {
        return prevData;
      }

      return {
        ...prevData,
        questions: updatedQuestions
      };
    });
    
    if (hasChange) {
      setHasUnsavedChanges(true);
    }
  }, []);

  const handleEditAnnotation = useCallback((annotationId, nextContent) => {
    if (!answerSheetData) return;

    const safeContent =
      typeof nextContent === "string"
        ? nextContent
        : nextContent === null || nextContent === undefined
        ? ""
        : String(nextContent);
    let hasChange = false;

    const updatedQuestions = answerSheetData.questions.map((question) => {
      if (!Array.isArray(question.annotations)) {
        return question;
      }
      let questionChanged = false;
      const updatedAnnotations = question.annotations.map((ann) => {
        if (ann.id !== annotationId) return ann;
        const currentContent =
          typeof ann.content === "string"
            ? ann.content
            : ann.content === null || ann.content === undefined
            ? ""
            : String(ann.content);
        if (currentContent === safeContent) {
          return ann;
        }
        questionChanged = true;
        hasChange = true;
        return { ...ann, content: safeContent };
      });
      return questionChanged ? { ...question, annotations: updatedAnnotations } : question;
    });

    if (!hasChange) {
      return;
    }

    setAnswerSheetData({
      ...answerSheetData,
      questions: updatedQuestions
    });
    setHasUnsavedChanges(true);
  }, [answerSheetData]);

  const handleSelectAnnotation = useCallback((annotationId) => {
    setSelectedAnnotationId(annotationId);
  }, []);

  const handleToggleLeftPanel = useCallback(() => {
    const next = !showLeftPanel;
    setShowLeftPanel(next);
    persistPanelState(next, showRightPanel);
  }, [showLeftPanel, showRightPanel]);

  const handleToggleRightPanel = useCallback(() => {
    const next = !showRightPanel;
    setShowRightPanel(next);
    persistPanelState(showLeftPanel, next);
  }, [showLeftPanel, showRightPanel]);

  // 恢复批注到默认位置（只重置位置，保留内容和宽度）
  const handleResetAnnotation = useCallback((annotationId) => {
    if (!answerSheetData) return;

    const updatedQuestions = answerSheetData.questions.map((question) => ({
      ...question,
      annotations: question.annotations.map((ann) => {
        if (ann.id !== annotationId) return ann;
        
        // 计算默认位置（根据题目类型，像素坐标）
        let defaultPosition;
        if (ann.isChoiceError) {
          // 选择题错误：中心位置
          defaultPosition = {
            x: question.bbox.x + question.bbox.width / 2,
            y: question.bbox.y + question.bbox.height / 2
          };
        } else {
          // 非选择题：使用原始 rtp 或右上角偏移
          const rtp = ann.originalRtp || { x: 0, y: 0 };
          defaultPosition = {
            x: question.bbox.x + (rtp.x || question.bbox.width * 0.85),
            y: question.bbox.y + (rtp.y || question.bbox.height * 0.15)
          };
        }
        
        // 限制范围：确保批注框不超出图片边界
        const width = ann.width || ANNOTATION_WIDTH_DEFAULT;
        const height = 40;
        const clampedPosition = {
          x: Math.max(width / 2, Math.min(defaultPosition.x, question.imageWidth - width / 2)),
          y: Math.max(height / 2, Math.min(defaultPosition.y, question.imageHeight - height / 2))
        };
        
        // 只重置位置，保留内容、宽度等其他属性
        return {
          ...ann,
          position: clampedPosition,
          currentPosition: clampedPosition  // 兼容两种字段名
        };
      })
    }));

    setAnswerSheetData({
      ...answerSheetData,
      questions: updatedQuestions
    });
    setHasUnsavedChanges(true);
    message.success("批注位置已恢复");
  }, [answerSheetData]);

  // 保存批注修改
  const handleSave = useCallback(async (silent = false) => {
    if (!answerSheetData || !selectedStudent) {
      if (!silent) {
        message.error('缺少必要信息');
      }
      return false;
    }

    try {
      if (!silent) {
        message.loading({ content: "正在保存...", key: "save" });
      }

      // 遍历所有题目，保存每道题的留痕信息
      const savePromises = answerSheetData.questions.map(async (question) => {
        // 跳过没有 bbox 的题目（如作文题）
        if (!question.bbox) {
          return Promise.resolve();
        }
        
        // 计算 rtp：取第一个批注的位置相对 bbox 的偏移
        let rtp = { x: 0, y: 0 };
        let annotations = [];
        
        if (question.annotations && question.annotations.length > 0) {
          const firstAnnotation = question.annotations[0];
          if (firstAnnotation.position) {
            // position 是中心点像素坐标，需要转换为左上角坐标
            // 左上角 = 中心点 - 宽高的一半
            const annotationWidth = firstAnnotation.width || ANNOTATION_WIDTH_DEFAULT;
            const annotationHeight = firstAnnotation.height || 40;  // 估算高度
            
            const leftTopX = firstAnnotation.position.x - annotationWidth / 2;
            const leftTopY = firstAnnotation.position.y - annotationHeight / 2;
            
            // rtp 是左上角相对 bbox 左上角的像素偏移
            rtp = {
              x: leftTopX - question.bbox.x,
              y: leftTopY - question.bbox.y
            };
          }
          
          // 保存完整的批注信息（包括 content、width、position 等）
          annotations = question.annotations.map(ann => ({
            id: ann.id,
            content: ann.content,
            position: ann.position,
            currentPosition: ann.currentPosition,
            width: ann.width,
            height: ann.height,
            scale: ann.scale,
            score: ann.score,
            isChoiceError: ann.isChoiceError,
            originalRtp: ann.originalRtp
          }));
        }
        
        // 构造 trace 数据：保存 bbox、rtp 和完整的批注信息
        const traceData = {
          bbox: question.bbox,  // 像素坐标
          rtp: rtp,  // 像素坐标，相对 bbox
          annotations: annotations  // 完整批注信息
        };

        // 调用 API 保存
        return uploadTrace({
          paperId: selectedStudent.student_id,
          questionId: question.questionId,
          trace: JSON.stringify(traceData)
        });
      });

      await Promise.all(savePromises);
      
      setHasUnsavedChanges(false);
      if (!silent) {
        message.success({ content: "保存成功", key: "save" });
      }
      return true;
    } catch (error) {
      console.error('保存失败:', error);
      if (!silent) {
        message.error({ content: "保存失败", key: "save" });
      }
      return false;
    }
  }, [answerSheetData, selectedStudent]);

  // 获取所有批注列表
  const getAllAnnotations = useCallback(() => {
    if (!answerSheetData) return [];

    const annotations = [];
    answerSheetData.questions.forEach((question) => {
      question.annotations.forEach((ann) => {
        annotations.push({
          ...ann,
          questionNo: question.question_no
        });
      });
    });
    return annotations;
  }, [answerSheetData]);

  // 打印功能 - 使用 Canvas 导出
  const handlePrint = useCallback(async () => {
    try {
      // 1. 获取答题卡容器元素
      const canvasElement = document.querySelector('.answer-sheet-inner');
      if (!canvasElement) {
        message.error('未找到答题卡元素');
        return;
      }

      // 2. 显示加载提示
      const loadingMessage = message.loading('正在生成打印预览...', 0);

      // 3. 等待一小段时间确保 DOM 完全渲染
      await new Promise(resolve => setTimeout(resolve, 100));

      // 4. 使用 html2canvas 渲染答题卡
      const canvas = await html2canvas(canvasElement, {
        scale: 2, // 2倍清晰度，适合打印
        useCORS: true, // 支持跨域图片
        logging: false, // 关闭日志
        backgroundColor: '#ffffff', // 白色背景
        allowTaint: true, // 允许跨域图片
        imageTimeout: 0, // 图片加载超时时间
      });

      // 5. 转换为高清图片
      const imgData = canvas.toDataURL('image/png', 1.0);

      // 6. 关闭加载提示
      loadingMessage();

      // 7. 创建打印窗口
      const printWindow = window.open('', '_blank', 'width=1200,height=800');
      if (!printWindow) {
        message.error('无法打开打印窗口，请检查浏览器弹窗设置');
        return;
      }

      // 8. 写入打印页面内容
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>打印答题卡</title>
            <style>
              @page {
                size: A3 landscape;
                margin: 0.5cm;
              }
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              html, body {
                width: 100%;
                height: 100%;
                overflow: hidden;
              }
              body {
                display: flex;
                justify-content: center;
                align-items: center;
                background: #ffffff;
              }
              img {
                max-width: 100%;
                max-height: 100%;
                width: auto;
                height: auto;
                object-fit: contain;
                display: block;
              }
              @media print {
                body {
                  margin: 0;
                  padding: 0;
                }
                img {
                  width: 100%;
                  height: auto;
                  page-break-inside: avoid;
                }
              }
            </style>
          </head>
          <body>
            <img src="${imgData}" alt="答题卡" />
          </body>
        </html>
      `);

      // 9. 关闭文档流
      printWindow.document.close();

      // 10. 等待图片加载完成后自动打印
      const img = printWindow.document.querySelector('img');
      if (img) {
        img.onload = () => {
          // 延迟一下确保渲染完成
          setTimeout(() => {
            printWindow.focus();
            printWindow.print();
          }, 500);
        };

        // 如果图片已经加载（从缓存）
        if (img.complete) {
          setTimeout(() => {
            printWindow.focus();
            printWindow.print();
          }, 500);
        }
      }

    } catch (error) {
      message.error('生成打印预览失败：' + error.message);
      console.error('打印错误：', error);
    }
  }, []);

  if (loading || !answerSheetData) {
    return <div className="trace-demo-loading">加载中...</div>;
  }

  return (
    <div className="trace-demo-page">
      <div className="trace-demo-header">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h2>手动留痕</h2>
          <div className="header-info">
            <span>学生: {selectedStudent?.student_name}</span>
            <span>学号: {selectedStudent?.student_no}</span>
            <span>批注数: {getAllAnnotations().length} 条</span>
            {hasUnsavedChanges && <span style={{ color: "#ff4d4f", fontWeight: 600 }}>· 未保存</span>}
          </div>
        </div>
        <div className="header-actions">
          <Tooltip title={autoSaveOnSwitch ? "切换学生时自动保存" : "切换学生时不自动保存"}>
            <div className="auto-save-switch">
              <span>自动保存</span>
              <Switch 
                size="small" 
                checked={autoSaveOnSwitch} 
                onChange={setAutoSaveOnSwitch}
              />
            </div>
          </Tooltip>
          <Button 
            size="small" 
            icon={<PrinterOutlined />} 
            onClick={handlePrint}
          >
            打印
          </Button>
          <Button size="small" onClick={handleToggleLeftPanel}>
            {showLeftPanel ? "隐藏左栏" : "显示左栏"}
          </Button>
          <Button size="small" onClick={handleToggleRightPanel}>
            {showRightPanel ? "隐藏右栏" : "显示右栏"}
          </Button>
          {ENABLE_CANVAS_ZOOM && (
            <div className="zoom-controls">
              <button type="button" onClick={handleZoomOut} disabled={scale <= MIN_ZOOM}>
                -
              </button>
              <span>{Math.round(scale * 100)}%</span>
              <button type="button" onClick={handleZoomIn} disabled={scale >= MAX_ZOOM}>
                +
              </button>
              <button type="button" onClick={handleZoomReset} disabled={Math.abs(scale - 1) < 0.01}>
                重置
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="trace-demo-content">
        {showLeftPanel && (
          <StudentList
            students={students}
            currentStudentIndex={currentStudentIndex}
            onStudentClick={async (index) => {
              // 避免重复加载同一个学生
              if (students[index] && index !== currentStudentIndex) {
                // 如果开启了自动保存且有未保存的修改，先保存
                if (autoSaveOnSwitch && hasUnsavedChanges) {
                  const saved = await handleSave(true); // 静默保存
                  if (saved) {
                    message.success('已自动保存修改', 1);
                  }
                }
                loadStudentData(students[index]);
              }
            }}
          />
        )}

        <div className="center-panel">
          {answerSheetData ? (
            <AnswerSheetCanvas
              paperUrls={answerSheetData.paper_urls}
              questions={answerSheetData.questions}
              onAnnotationDrag={handleAnnotationDrag}
              onAnnotationSelect={handleSelectAnnotation}
              onAnnotationEdit={handleEditAnnotation}
              onAnnotationResize={handleAnnotationSizeChange}
              selectedAnnotationId={selectedAnnotationId}
              scale={ENABLE_CANVAS_ZOOM ? scale : 1}
              totalScore={answerSheetData.total_score}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <span>请选择学生查看答题卡</span>
            </div>
          )}
        </div>

        {showRightPanel && (
          <div className="right-panel">
            <AnnotationPanel
              annotations={getAllAnnotations()}
              selectedAnnotationId={selectedAnnotationId}
              onSelectAnnotation={handleSelectAnnotation}
              onEditAnnotation={handleEditAnnotation}
              onResetAnnotation={handleResetAnnotation}
              onSave={handleSave}
              hasUnsavedChanges={hasUnsavedChanges}
              onScaleChange={handleAnnotationScaleChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TracePage;
