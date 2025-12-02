import { useState, useCallback, useRef } from "react";
import { message } from "antd";
import { uploadTrace } from "../../../api/trace";
import {
  ANNOTATION_WIDTH_DEFAULT,
  ANNOTATION_HEIGHT_ESTIMATE
} from "../constants";

/**
 * 批注管理 Hook
 * @param {Object} answerSheetData - 答题卡数据
 * @param {Function} setAnswerSheetData - 设置答题卡数据
 * @param {Object} selectedStudent - 当前选中的学生
 */
const useAnnotations = (answerSheetData, setAnswerSheetData, selectedStudent) => {
  const [selectedAnnotationId, setSelectedAnnotationId] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  // 追踪被修改的题目ID
  const modifiedQuestionIdsRef = useRef(new Set());

  /**
   * 根据 annotationId 获取对应的 questionId
   */
  const getQuestionIdByAnnotationId = useCallback((annotationId) => {
    if (!answerSheetData?.questions) return null;
    for (const question of answerSheetData.questions) {
      if (question.annotations?.some(ann => ann.id === annotationId)) {
        return question.questionId;
      }
    }
    return null;
  }, [answerSheetData]);

  /**
   * 标记题目为已修改
   */
  const markQuestionModified = useCallback((annotationId) => {
    const questionId = getQuestionIdByAnnotationId(annotationId);
    if (questionId) {
      modifiedQuestionIdsRef.current.add(questionId);
    }
  }, [getQuestionIdByAnnotationId]);

  /**
   * 处理批注拖拽（限制在 bbox 范围内）
   */
  const handleAnnotationDrag = useCallback((annotationId, newDisplayPos, bbox, imageDimensions) => {
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
          
          const width = ann.width || ANNOTATION_WIDTH_DEFAULT;
          const height = ANNOTATION_HEIGHT_ESTIMATE;
          
          // 限制在 bbox 范围内（position 是中心点坐标）
          const clampedPos = {
            x: Math.max(question.bbox.x + width / 2, Math.min(pagePixelPos.x, question.bbox.x + question.bbox.width - width / 2)),
            y: Math.max(question.bbox.y + height / 2, Math.min(pagePixelPos.y, question.bbox.y + question.bbox.height - height / 2))
          };
          
          return { 
            ...ann, 
            position: clampedPos
          };
        })
      }));

      return { ...prevData, questions: updatedQuestions };
    });
    markQuestionModified(annotationId);
    setHasUnsavedChanges(true);
  }, [setAnswerSheetData, markQuestionModified]);

  /**
   * 处理批注尺寸变化（只调整宽度，不改变位置）
   */
  const handleAnnotationSizeChange = useCallback((annotationId, nextSize) => {
    if (!nextSize) return;

    const { width, height } = nextSize;
    let hasChange = false;

    setAnswerSheetData(prevData => {
      if (!prevData) return prevData;
      
      const updatedQuestions = prevData.questions.map((question) => {
        if (!Array.isArray(question.annotations)) return question;
        
        let questionChanged = false;
        const updatedAnnotations = question.annotations.map((ann) => {
          if (ann.id !== annotationId) return ann;
          
          const widthChanged = Math.abs((ann.width ?? 0) - width) >= 0.5;
          const heightChanged = height && Math.abs((ann.height ?? 0) - height) >= 0.5;
          
          if (!widthChanged && !heightChanged) return ann;
          
          questionChanged = true;
          hasChange = true;
          
          // 只更新尺寸，不改变位置
          return { ...ann, width, ...(height && { height }) };
        });
        
        return questionChanged ? { ...question, annotations: updatedAnnotations } : question;
      });

      return hasChange ? { ...prevData, questions: updatedQuestions } : prevData;
    });
    
    if (hasChange) {
      markQuestionModified(annotationId);
      setHasUnsavedChanges(true);
    }
  }, [setAnswerSheetData, markQuestionModified]);

  /**
   * 处理批注内容编辑
   */
  const handleEditAnnotation = useCallback((annotationId, nextContent) => {
    const safeContent = typeof nextContent === "string"
      ? nextContent
      : nextContent == null ? "" : String(nextContent);
    
    let hasChange = false;

    setAnswerSheetData(prevData => {
      if (!prevData) return prevData;

      const updatedQuestions = prevData.questions.map((question) => {
        if (!Array.isArray(question.annotations)) return question;
        
        let questionChanged = false;
        const updatedAnnotations = question.annotations.map((ann) => {
          if (ann.id !== annotationId) return ann;
          
          const currentContent = typeof ann.content === "string"
            ? ann.content
            : ann.content == null ? "" : String(ann.content);
          
          if (currentContent === safeContent) return ann;
          
          questionChanged = true;
          hasChange = true;
          return { ...ann, content: safeContent };
        });
        
        return questionChanged ? { ...question, annotations: updatedAnnotations } : question;
      });

      return hasChange ? { ...prevData, questions: updatedQuestions } : prevData;
    });

    if (hasChange) {
      markQuestionModified(annotationId);
      setHasUnsavedChanges(true);
    }
  }, [setAnswerSheetData, markQuestionModified]);

  /**
   * 选择批注
   */
  const handleSelectAnnotation = useCallback((annotationId) => {
    setSelectedAnnotationId(annotationId);
  }, []);

  /**
   * 重置批注位置（重置到 bbox 右上角）
   */
  const handleResetAnnotation = useCallback((annotationId) => {
    setAnswerSheetData(prevData => {
      if (!prevData) return prevData;

      const updatedQuestions = prevData.questions.map((question) => ({
        ...question,
        annotations: question.annotations.map((ann) => {
          if (ann.id !== annotationId) return ann;
          
          const width = ann.width || ANNOTATION_WIDTH_DEFAULT;
          const height = ann.height || ANNOTATION_HEIGHT_ESTIMATE;
          
          // 主观题：重置到 bbox 左上角（rtp = {x: 0, y: 0}）
          const defaultPosition = {
            x: question.bbox.x + width / 2,
            y: question.bbox.y + height / 2
          };
          
          return {
            ...ann,
            position: defaultPosition
          };
        })
      }));

      return { ...prevData, questions: updatedQuestions };
    });
    
    markQuestionModified(annotationId);
    setHasUnsavedChanges(true);
    message.success("批注位置已恢复");
  }, [setAnswerSheetData, markQuestionModified]);

  /**
   * 获取所有批注列表
   */
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

  /**
   * 保存批注
   */
  const handleSave = useCallback(async (silent = false) => {
    if (!answerSheetData || !selectedStudent) {
      if (!silent) message.error('缺少必要信息');
      return false;
    }

    try {
      if (!silent) {
        message.loading({ content: "正在保存...", key: "save" });
      }

      // 只保存被修改的题目
      const modifiedIds = modifiedQuestionIdsRef.current;
      if (modifiedIds.size === 0) {
        if (!silent) message.info('没有需要保存的修改');
        return true;
      }

      const savePromises = answerSheetData.questions
        .filter(question => {
          // 只保存被修改的非选择题
          return question.bbox && 
                 question.question_type !== 'choice' && 
                 modifiedIds.has(question.questionId);
        })
        .map(async (question) => {
          // 默认值
          let rtp = { x: 0, y: 0 };
          let scoreReason = '';
          let width = ANNOTATION_WIDTH_DEFAULT;
          
          if (question.annotations?.length > 0) {
            const firstAnnotation = question.annotations[0];
            
            // 计算 rtp：position 是中心点坐标，转换为左上角相对于 bbox 的偏移
            if (firstAnnotation.position) {
              const annotationWidth = firstAnnotation.width || ANNOTATION_WIDTH_DEFAULT;
              const annotationHeight = firstAnnotation.height || ANNOTATION_HEIGHT_ESTIMATE;
              
              const leftTopX = firstAnnotation.position.x - annotationWidth / 2;
              const leftTopY = firstAnnotation.position.y - annotationHeight / 2;
              
              rtp = {
                x: leftTopX - question.bbox.x,
                y: leftTopY - question.bbox.y
              };
            }
            
            // 批注内容和宽度
            scoreReason = firstAnnotation.content || '';
            width = firstAnnotation.width || ANNOTATION_WIDTH_DEFAULT;
          }
          
          // trace: 位置信息（rtp, width）
          const traceData = {
            rtp,
            width
          };

          return uploadTrace({
            paperId: selectedStudent.student_id,
            questionId: question.questionId,
            trace: JSON.stringify(traceData),
            scoreReason
          });
        });

      await Promise.all(savePromises);
      
      // 清空修改记录
      modifiedQuestionIdsRef.current.clear();
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

  /**
   * 清除未保存状态
   */
  const clearUnsavedChanges = useCallback(() => {
    modifiedQuestionIdsRef.current.clear();
    setHasUnsavedChanges(false);
    setSelectedAnnotationId(null);
  }, []);

  return {
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
  };
};

export default useAnnotations;
