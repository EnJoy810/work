import React, { useState, useEffect, useMemo, useCallback } from "react";
import { message, Button, Switch, Tooltip } from "antd";
import { PrinterOutlined } from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";
import StudentList from "./components/StudentList";
import AnswerSheetCanvas from "./components/AnswerSheetCanvas";
import AnnotationPanel from "./components/AnnotationPanel";
import { useStudentData, useAnnotations, usePrint } from "./hooks";
import { CANVAS_ZOOM_MIN, CANVAS_ZOOM_MAX, CANVAS_ZOOM_STEP } from "./constants";
import "./trace.css";

// 缩放功能开关
const ENABLE_CANVAS_ZOOM = true;

// 面板状态持久化 key
const PANEL_UI_KEY = "trace-demo-panels";

/**
 * 获取初始面板状态
 */
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

/**
 * 持久化面板状态
 */
const persistPanelState = (left, right) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PANEL_UI_KEY, JSON.stringify({ left, right }));
  } catch (e) {
    console.warn("Failed to store trace demo panel state", e);
  }
};

const TracePage = () => {
  const [searchParams] = useSearchParams();
  const gradingId = searchParams.get('grading_id');
  
  // 使用自定义 hooks
  const {
    students,
    selectedStudent,
    answerSheetData,
    setAnswerSheetData,
    loading,
    loadStudentData,
    fetchStudents
  } = useStudentData(gradingId);

  const {
    selectedAnnotationId,
    hasUnsavedChanges,
    handleAnnotationDrag,
    handleAnnotationSizeChange,
    handleEditAnnotation,
    handleSelectAnnotation,
    handleResetAnnotation,
    getAllAnnotations,
    handleSave,
    clearUnsavedChanges
  } = useAnnotations(answerSheetData, setAnswerSheetData, selectedStudent);

  const { handlePrint, handleBatchPrint } = usePrint();

  // UI 状态
  const [showLeftPanel, setShowLeftPanel] = useState(() => getInitialPanelState().left);
  const [showRightPanel, setShowRightPanel] = useState(() => getInitialPanelState().right);
  const [scale, setScale] = useState(1);
  const [autoSaveOnSwitch, setAutoSaveOnSwitch] = useState(false);

  const [showScoreReason, setShowScoreReason] = useState(false);
  // 保存显示评语偏好
  const handleShowScoreReasonChange = useCallback((checked) => {
    setShowScoreReason(checked);
    localStorage.setItem('trace_show_score_reason', String(checked));
  }, []);

  // 当前学生索引
  const currentStudentIndex = useMemo(() => {
    if (!selectedStudent) return -1;
    return students.findIndex((s) => s.student_id === selectedStudent.student_id);
  }, [students, selectedStudent]);

  // 初始化加载学生列表
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // 缩放控制
  const applyZoom = useCallback((updater) => {
    setScale((prev) => {
      if (!ENABLE_CANVAS_ZOOM) return 1;
      const target = typeof updater === "function" ? updater(prev) : updater ?? prev;
      const clamped = Math.min(Math.max(target, CANVAS_ZOOM_MIN), CANVAS_ZOOM_MAX);
      return Number(clamped.toFixed(2));
    });
  }, []);

  const handleZoomIn = useCallback(() => applyZoom((prev) => prev + CANVAS_ZOOM_STEP), [applyZoom]);
  const handleZoomOut = useCallback(() => applyZoom((prev) => prev - CANVAS_ZOOM_STEP), [applyZoom]);
  const handleZoomReset = useCallback(() => applyZoom(1), [applyZoom]);

  // 面板切换
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

  // 切换学生
  const handleStudentClick = useCallback(async (index) => {
    if (!students[index] || index === currentStudentIndex) return;
    
    // 如果开启了自动保存且有未保存的修改，先保存
    if (autoSaveOnSwitch && hasUnsavedChanges) {
      const saved = await handleSave(true);
      if (saved) {
        message.success('已自动保存修改', 1);
      }
    }
    
    clearUnsavedChanges();
    loadStudentData(students[index]);
  }, [students, currentStudentIndex, autoSaveOnSwitch, hasUnsavedChanges, handleSave, clearUnsavedChanges, loadStudentData]);

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
          <Tooltip title={showScoreReason ? "显示分数和评语" : "只显示分数"}>
            <div className="auto-save-switch">
              <span>显示评语</span>
              <Switch 
                size="small" 
                checked={showScoreReason} 
                onChange={handleShowScoreReasonChange}
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
              <button type="button" onClick={handleZoomOut} disabled={scale <= CANVAS_ZOOM_MIN}>
                -
              </button>
              <span>{Math.round(scale * 100)}%</span>
              <button type="button" onClick={handleZoomIn} disabled={scale >= CANVAS_ZOOM_MAX}>
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
            onStudentClick={handleStudentClick}
            onBatchPrint={() => handleBatchPrint(students, handleStudentClick)}
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
              showScoreReason={showScoreReason}
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
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TracePage;
