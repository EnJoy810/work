import React, { useState, useEffect, useMemo, useCallback } from "react";
import { message, Button, Switch, Tooltip } from "antd";
import { PrinterOutlined } from "@ant-design/icons";
import html2canvas from "html2canvas";
import { useSearchParams } from "react-router-dom";
import StudentList from "./components/StudentList";
import AnswerSheetCanvas from "./components/AnswerSheetCanvas";
import AnnotationPanel from "./components/AnnotationPanel";
import { MOCK_STUDENTS, getAnswerSheetByStudentId } from "./mockData";
import { getGradingResultV2, uploadTrace } from "../../api/trace";
import {
  ANNOTATION_SCALE_DEFAULT,
  ANNOTATION_WIDTH_DEFAULT,
  clampAnnotationScale
} from "./constants";
import { pixelToRtp } from "./utils/coordTransform";
import "./traceDemo.css";

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

const TraceDemoPage = () => {
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
  const [autoSaveOnSwitch, setAutoSaveOnSwitch] = useState(true); // 自动保存开关
  const [loading, setLoading] = useState(true);

  const currentStudentIndex = useMemo(() => {
    if (!selectedStudent) return -1;
    return students.findIndex((s) => s.student_id === selectedStudent.student_id);
  }, [students, selectedStudent]);

  // 加载学生数据
  const loadStudentData = useCallback(async (student) => {
    try {
      setLoading(true);
      
      // 如果有 grading_id，说明是真实数据，暂时使用 Mock 数据结构
      // TODO: 调用真实 API 获取答题卡图片和题目详细信息
      if (student.grading_id) {
        // 暂时使用第一个 Mock 学生的答题卡数据作为模板
        const mockResponse = getAnswerSheetByStudentId('S001');
        
        if (mockResponse?.data) {
          const normalizedData = normalizeAnswerSheetData(mockResponse.data);
          setAnswerSheetData(normalizedData);
          setSelectedStudent(student);
          setSelectedAnnotationId(null);
          setHasUnsavedChanges(false);
        } else {
          message.error("加载学生数据失败");
        }
      } else {
        // 使用 Mock 数据
        const response = getAnswerSheetByStudentId(student.student_id);
        
        if (response?.data) {
          const normalizedData = normalizeAnswerSheetData(response.data);
          setAnswerSheetData(normalizedData);
          setSelectedStudent(student);
          setSelectedAnnotationId(null);
          setHasUnsavedChanges(false);
        } else {
          message.error("加载学生数据失败");
        }
      }
    } catch (error) {
      console.error('加载学生数据失败:', error);
      message.error("加载学生数据失败");
    } finally {
      setLoading(false);
    }
  }, []);

  // 自动保存函数
  const handleAutoSave = useCallback(async (callback) => {
    if (autoSaveOnSwitch && hasUnsavedChanges) {
      message.loading({ content: "正在保存...", key: "auto-save" });
      // TODO [2025-11-23]: 集成真实 API - 待后端接口完成
      // await uploadTrace(answerSheetData);
      setTimeout(() => {
        setHasUnsavedChanges(false);
        message.success({ content: "保存成功", key: "auto-save", duration: 1 });
        if (callback) callback();
      }, 500);
    } else {
      if (callback) callback();
    }
  }, [autoSaveOnSwitch, hasUnsavedChanges, answerSheetData]);

  const handlePrevStudent = useCallback(() => {
    if (currentStudentIndex > 0) {
      handleAutoSave(() => {
        loadStudentData(students[currentStudentIndex - 1]);
      });
    }
  }, [students, currentStudentIndex, handleAutoSave, loadStudentData]);

  const handleNextStudent = useCallback(() => {
    if (currentStudentIndex !== -1 && currentStudentIndex < students.length - 1) {
      handleAutoSave(() => {
        loadStudentData(students[currentStudentIndex + 1]);
      });
    }
  }, [students, currentStudentIndex, handleAutoSave, loadStudentData]);

  // 获取学生列表
  useEffect(() => {
    if (!gradingId) {
      // 临时：如果没有 gradingId，使用 Mock 数据
      setStudents(MOCK_STUDENTS);
      if (MOCK_STUDENTS.length > 0) {
        loadStudentData(MOCK_STUDENTS[0]);
      }
      return;
    }

    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await getGradingResultV2(gradingId);
        
        if (response.code === '200' && response.data) {
          
          // 合并正常和异常学生列表
          // 后端使用下划线命名（snake_case）
          const normalStudents = (response.data.normal || []).map(s => ({
            student_id: s.paper_id,
            student_name: s.student_name,
            student_no: s.student_no,
            status: parseInt(s.status) || 200,
            grading_id: s.grading_id
          }));
          
          const exceptionalStudents = (response.data.exceptional || []).map(s => ({
            student_id: s.paper_id,
            student_name: s.student_name,
            student_no: s.student_no,
            status: parseInt(s.status) || 4001,
            grading_id: s.grading_id
          }));
          
          const allStudents = [...normalStudents, ...exceptionalStudents];
          setStudents(allStudents);
          
          // 加载第一个学生数据
          if (allStudents.length > 0) {
            loadStudentData(allStudents[0]);
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
  }, [gradingId, loadStudentData]);

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

  const handleSelectStudent = (student) => {
    loadStudentData(student);
  };

  const handleAnnotationDrag = (annotationId, newPixelPos, bbox, imageDimensions) => {
    if (!answerSheetData) return;

    const newRtp = pixelToRtp(newPixelPos, bbox, imageDimensions);
    const updatedQuestions = answerSheetData.questions.map((question) => ({
      ...question,
      annotations: question.annotations.map((ann) =>
        ann.id === annotationId ? { ...ann, currentPosition: newRtp } : ann
      )
    }));

    setAnswerSheetData({
      ...answerSheetData,
      questions: updatedQuestions
    });
    setHasUnsavedChanges(true);
  };

  const handleAnnotationScaleChange = (annotationId, nextScaleValue) => {
    if (!answerSheetData) return;

    const normalizedScale = clampAnnotationScale(nextScaleValue);
    let hasChange = false;

    const updatedQuestions = answerSheetData.questions.map((question) => {
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
      return;
    }

    setAnswerSheetData({
      ...answerSheetData,
      questions: updatedQuestions
    });
    setHasUnsavedChanges(true);
  };

  // 更新批注尺寸（主要是宽度，高度由内容决定）
  const handleAnnotationSizeChange = useCallback((annotationId, nextSize) => {
    if (!answerSheetData || !nextSize) return;

    const { width, height } = nextSize;
    let hasChange = false;

    const updatedQuestions = answerSheetData.questions.map((question) => {
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
      return;
    }

    setAnswerSheetData({
      ...answerSheetData,
      questions: updatedQuestions
    });
    setHasUnsavedChanges(true);
  }, [answerSheetData]);

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

  // 重置批注到初始状态
  const handleResetAnnotation = useCallback((annotationId) => {
    if (!answerSheetData) return;

    const updatedQuestions = answerSheetData.questions.map((question) => ({
      ...question,
      annotations: question.annotations.map((ann) => {
        if (ann.id !== annotationId) return ann;
        
        // 重置到初始状态，移除 height 让其自动计算
        const resetAnnotation = {
          ...ann,
          currentPosition: { ...ann.originalRtp },
          width: ann.originalWidth ?? ANNOTATION_WIDTH_DEFAULT,
          scale: clampAnnotationScale(ann.originalScale ?? ANNOTATION_SCALE_DEFAULT)
        };
        
        // 移除 height 属性，让组件根据内容自动计算
        delete resetAnnotation.height;
        
        return resetAnnotation;
      })
    }));

    setAnswerSheetData({
      ...answerSheetData,
      questions: updatedQuestions
    });
    setHasUnsavedChanges(true);
    message.success("批注已重置");
  }, [answerSheetData]);

  // 保存批注修改
  const handleSave = useCallback(async () => {
    if (!answerSheetData || !selectedStudent) {
      message.error('缺少必要信息');
      return;
    }

    try {
      message.loading({ content: "正在保存...", key: "save" });

      // 遍历所有题目，保存每道题的留痕信息
      const savePromises = answerSheetData.questions.map(async (question) => {
        // 构造 trace 数据
        const traceData = {
          annotations: question.annotations.map(ann => ({
            id: ann.id,
            content: ann.content,
            source: ann.source,
            score: ann.score,
            originalRtp: ann.originalRtp,
            currentPosition: ann.currentPosition,
            width: ann.width,
            scale: ann.scale
          }))
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
      message.success({ content: "保存成功", key: "save" });
    } catch (error) {
      console.error('保存失败:', error);
      message.error({ content: "保存失败", key: "save" });
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
          <Button 
            type="primary" 
            size="small" 
            onClick={handleNextStudent}
            disabled={currentStudentIndex >= students.length - 1 || students.length === 0}
          >
            下一个学生
          </Button>
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
          <div className="left-panel">
            <StudentList
              students={students}
              selectedStudentId={selectedStudent?.student_id}
              onSelectStudent={handleSelectStudent}
              onPrev={handlePrevStudent}
              onNext={handleNextStudent}
              currentIndex={currentStudentIndex}
              hasUnsavedChanges={hasUnsavedChanges}
            />
          </div>
        )}

        <div className="center-panel">
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

export default TraceDemoPage;
