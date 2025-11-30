import { useState, useCallback } from "react";
import { message } from "antd";
import { uploadTrace } from "../../../api/trace";
import {
  ANNOTATION_WIDTH_DEFAULT,
  ANNOTATION_HEIGHT_ESTIMATE,
  clampAnnotationScale,
  clampPositionInBounds
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

  /**
   * 处理批注拖拽
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
          const clampedPos = clampPositionInBounds(
            pagePixelPos, width, ANNOTATION_HEIGHT_ESTIMATE, question.imageWidth, question.imageHeight
          );
          
          return { 
            ...ann, 
            position: clampedPos
          };
        })
      }));

      return { ...prevData, questions: updatedQuestions };
    });
    setHasUnsavedChanges(true);
  }, [setAnswerSheetData]);

  /**
   * 处理批注缩放变化
   */
  const handleAnnotationScaleChange = useCallback((annotationId, nextScaleValue) => {
    const normalizedScale = clampAnnotationScale(nextScaleValue);
    let hasChange = false;

    setAnswerSheetData(prevData => {
      if (!prevData) return prevData;
      
      const updatedQuestions = prevData.questions.map((question) => {
        if (!Array.isArray(question.annotations)) return question;
        
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

      return hasChange ? { ...prevData, questions: updatedQuestions } : prevData;
    });
    
    if (hasChange) {
      setHasUnsavedChanges(true);
    }
  }, [setAnswerSheetData]);

  /**
   * 处理批注尺寸变化
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
          return { ...ann, width, ...(height && { height }) };
        });
        
        return questionChanged ? { ...question, annotations: updatedAnnotations } : question;
      });

      return hasChange ? { ...prevData, questions: updatedQuestions } : prevData;
    });
    
    if (hasChange) {
      setHasUnsavedChanges(true);
    }
  }, [setAnswerSheetData]);

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
      setHasUnsavedChanges(true);
    }
  }, [setAnswerSheetData]);

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
          const height = ANNOTATION_HEIGHT_ESTIMATE;
          
          let defaultPosition;
          if (ann.isChoiceError) {
            // 选择题错误：重置到 bbox 中心
            defaultPosition = {
              x: question.bbox.x + question.bbox.width / 2,
              y: question.bbox.y + question.bbox.height / 2
            };
          } else {
            // 主观题：重置到 bbox 右上角（与分数框位置一致）
            // 左上角位置 = bbox 右上角
            const leftTopX = question.bbox.x + question.bbox.width - width;
            const leftTopY = question.bbox.y;
            // 转换为中心点坐标
            defaultPosition = {
              x: leftTopX + width / 2,
              y: leftTopY + height / 2
            };
          }
          
          const clampedPosition = clampPositionInBounds(
            defaultPosition, width, height, question.imageWidth, question.imageHeight
          );
          
          return {
            ...ann,
            position: clampedPosition
          };
        })
      }));

      return { ...prevData, questions: updatedQuestions };
    });
    
    setHasUnsavedChanges(true);
    message.success("批注位置已恢复");
  }, [setAnswerSheetData]);

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

      const savePromises = answerSheetData.questions
        .filter(question => {
          // 只保存非选择题的批注（选择题的红X不需要保存）
          return question.bbox && question.question_type !== 'choice';
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
          
          // 保存的数据结构：与后端格式一致
          const traceData = {
            bbox: question.bbox,
            rtp,
            score_reason: scoreReason,
            width
          };

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

  /**
   * 清除未保存状态
   */
  const clearUnsavedChanges = useCallback(() => {
    setHasUnsavedChanges(false);
    setSelectedAnnotationId(null);
  }, []);

  return {
    selectedAnnotationId,
    hasUnsavedChanges,
    handleAnnotationDrag,
    handleAnnotationScaleChange,
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
