import React, { useState, useEffect, useMemo, useCallback } from "react";
import { message, Button } from "antd";
import StudentList from "./components/StudentList";
import AnswerSheetCanvas from "./components/AnswerSheetCanvas";
import AnnotationPanel from "./components/AnnotationPanel";
import { MOCK_STUDENTS, getAnswerSheetByStudentId } from "./mockData";
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

const TraceDemoPage = () => {
  const [students] = useState(MOCK_STUDENTS);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [answerSheetData, setAnswerSheetData] = useState(null);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showLeftPanel, setShowLeftPanel] = useState(() => getInitialPanelState().left);
  const [showRightPanel, setShowRightPanel] = useState(() => getInitialPanelState().right);
  const [scale, setScale] = useState(1);

  const currentStudentIndex = useMemo(() => {
    if (!selectedStudent) return -1;
    return students.findIndex((s) => s.student_id === selectedStudent.student_id);
  }, [students, selectedStudent]);

  const handlePrevStudent = useCallback(() => {
    if (currentStudentIndex > 0) {
      loadStudentData(students[currentStudentIndex - 1]);
    }
  }, [students, currentStudentIndex]);

  const handleNextStudent = useCallback(() => {
    if (currentStudentIndex !== -1 && currentStudentIndex < students.length - 1) {
      loadStudentData(students[currentStudentIndex + 1]);
    }
  }, [students, currentStudentIndex]);

  useEffect(() => {
    if (students.length > 0) {
      loadStudentData(students[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStudentData = (student) => {
    const data = getAnswerSheetByStudentId(student.student_id);
    if (data) {
      setAnswerSheetData(data.data);
      setSelectedStudent(student);
      setSelectedAnnotationId(null);
      setHasUnsavedChanges(false);
    } else {
      message.error("加载学生数据失败");
    }
  };

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

  const handleSelectAnnotation = (annotationId) => {
    setSelectedAnnotationId(annotationId);
  };

  const handleToggleLeftPanel = () => {
    const next = !showLeftPanel;
    setShowLeftPanel(next);
    persistPanelState(next, showRightPanel);
  };

  const handleToggleRightPanel = () => {
    const next = !showRightPanel;
    setShowRightPanel(next);
    persistPanelState(showLeftPanel, next);
  };

  const handleEditAnnotation = (annotationId, newContent) => {
    if (!answerSheetData) return;

    const updatedQuestions = answerSheetData.questions.map((question) => ({
      ...question,
      annotations: question.annotations.map((ann) =>
        ann.id === annotationId ? { ...ann, content: newContent } : ann
      )
    }));

    setAnswerSheetData({
      ...answerSheetData,
      questions: updatedQuestions
    });
    setHasUnsavedChanges(true);
    message.success("批注内容已更新");
  };

  const handleResetPosition = (annotationId) => {
    if (!answerSheetData) return;

    const updatedQuestions = answerSheetData.questions.map((question) => ({
      ...question,
      annotations: question.annotations.map((ann) =>
        ann.id === annotationId ? { ...ann, currentPosition: { ...ann.originalRtp } } : ann
      )
    }));

    setAnswerSheetData({
      ...answerSheetData,
      questions: updatedQuestions
    });
    setHasUnsavedChanges(true);
    message.success("已重置到推荐位置");
  };

  const handleSave = () => {
    message.loading({ content: "正在保存...", key: "save" });

    setTimeout(() => {
      console.log("保存的数据:", answerSheetData);
      setHasUnsavedChanges(false);
      message.success({ content: "保存成功", key: "save" });
    }, 1000);
  };

  const getAllAnnotations = () => {
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
  };

  if (!answerSheetData) {
    return <div className="trace-demo-loading">加载中...</div>;
  }

  return (
    <div className="trace-demo-page">
      <div className="trace-demo-header">
        <h2>手动留痕</h2>
        <div className="header-info">
          <span>学生: {selectedStudent?.student_name}</span>
          <span>学号: {selectedStudent?.student_no}</span>
          <span>批注数: {getAllAnnotations().length} 条</span>
          {hasUnsavedChanges && <span style={{ color: "#d14343", fontWeight: 600 }}>· 未保存</span>}
        </div>
        <div className="header-actions">
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
            selectedAnnotationId={selectedAnnotationId}
            scale={ENABLE_CANVAS_ZOOM ? scale : 1}
          />
        </div>

        {showRightPanel && (
          <div className="right-panel">
            <AnnotationPanel
              annotations={getAllAnnotations()}
              selectedAnnotationId={selectedAnnotationId}
              onSelectAnnotation={handleSelectAnnotation}
              onEditAnnotation={handleEditAnnotation}
              onResetPosition={handleResetPosition}
              onSave={handleSave}
              hasUnsavedChanges={hasUnsavedChanges}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TraceDemoPage;
