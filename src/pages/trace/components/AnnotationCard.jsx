import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Rnd } from "react-rnd";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical";
import {
  ANNOTATION_WIDTH_MIN,
  ANNOTATION_WIDTH_MAX,
  ANNOTATION_HEIGHT_MIN,
  ANNOTATION_HEIGHT_MAX,
  ANNOTATION_PADDING_VERTICAL,
  ANNOTATION_CONTENT_MEASURE_DELAY,
  ANNOTATION_RESIZE_SAVE_DELAY,
  ANNOTATION_FONT_SIZE_DEFAULT,
  ANNOTATION_FONT_SIZE_MIN,
  ANNOTATION_FONT_SIZE_MAX,
  ANNOTATION_FONT_SIZE_STEP,
  calculateAnnotationWidth
} from "../constants";

const EditorPlaceholder = () => <div className="annotation-card__placeholder">请输入批注</div>;

const EditableStatePlugin = ({ isEditable }) => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    editor.setEditable(isEditable);
  }, [editor, isEditable]);
  return null;
};

const SyncValuePlugin = ({ value, isEditing }) => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (isEditing) return;
    editor.update(() => {
      const root = $getRoot();
      root.clear();
      const paragraph = $createParagraphNode();
      paragraph.append($createTextNode(value || ""));
      root.append(paragraph);
    });
  }, [editor, value, isEditing]);
  return null;
};

const LexicalOnChangeBridge = ({ isEditing, onContentChange }) => {
  return (
    <OnChangePlugin
      onChange={(editorState) => {
        if (!isEditing) return;
        editorState.read(() => {
          const text = $getRoot().getTextContent();
          onContentChange(text);
        });
      }}
    />
  );
};

const AnnotationLexicalEditor = ({
  annotationId,
  initialText,
  value,
  isEditing,
  onContentChange,
  onBlur,
  onCommand
}) => {
  const initialConfig = useMemo(
    () => ({
      namespace: `annotation-${annotationId}`,
      editable: true,
      theme: { paragraph: "annotation-card__paragraph" },
      nodes: [],
      editorState: () => {
        const root = $getRoot();
        root.clear();
        const paragraph = $createParagraphNode();
        paragraph.append($createTextNode(initialText || ""));
        root.append(paragraph);
      },
      onError: (error) => {
        console.error("Lexical error", error);
      }
    }),
    [annotationId, initialText]
  );

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <EditableStatePlugin isEditable={isEditing} />
      <SyncValuePlugin value={value} isEditing={isEditing} />
      <PlainTextPlugin
        contentEditable={
          <ContentEditable
            className="annotation-card__editor"
            onBlur={onBlur}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                onCommand?.("cancel");
              } else if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                event.preventDefault();
                onCommand?.("confirm");
              }
            }}
          />
        }
        placeholder={<EditorPlaceholder />}
      />
      <HistoryPlugin />
      <LexicalOnChangeBridge isEditing={isEditing} onContentChange={onContentChange} />
    </LexicalComposer>
  );
};

const AnnotationCard = ({
  annotation,
  position,
  isSelected,
  onDrag,
  onClick,
  onEdit,
  onResize,
  onFontSizeChange,
  canvasScale = 1,
  readOnly = false
}) => {
  // 使用批注自己的字号，默认为 ANNOTATION_FONT_SIZE_DEFAULT
  const fontSize = annotation.fontSize ?? ANNOTATION_FONT_SIZE_DEFAULT;
  const centerX = position?.x ?? 0;
  const centerY = position?.y ?? 0;

  const [isEditing, setIsEditing] = useState(false);
  const [pendingContent, setPendingContent] = useState(annotation.content || "");
  const contentRef = useRef(null);
  const editorRef = useRef(null);
  
  // 宽度状态：根据字号和内容自动计算
  const [currentWidth, setCurrentWidth] = useState(
    calculateAnnotationWidth(annotation.content, fontSize)
  );
  
  // 批注框的位置和尺寸状态
  const [frame, setFrame] = useState({
    width: currentWidth,
    height: ANNOTATION_HEIGHT_MIN,
    x: centerX - currentWidth / 2,
    y: centerY - ANNOTATION_HEIGHT_MIN / 2
  });

  useEffect(() => {
    if (!isEditing) {
      setPendingContent(annotation.content || "");
    }
  }, [annotation.content, isEditing]);

  // 当字号或内容变化时，自动调整宽度（包括编辑时的实时内容）
  useEffect(() => {
    // 编辑时使用 pendingContent，否则使用 annotation.content
    const contentToMeasure = isEditing ? pendingContent : annotation.content;
    const newWidth = calculateAnnotationWidth(contentToMeasure, fontSize);
    if (Math.abs(newWidth - currentWidth) < 1) return;
    
    setCurrentWidth(newWidth);
    setFrame(prevFrame => ({
      ...prevFrame,
      width: newWidth,
      x: prevFrame.x + (prevFrame.width - newWidth) / 2
    }));
  }, [annotation.content, pendingContent, fontSize, currentWidth, isEditing]);

  // 监听 position 变化（例如重置时），更新 frame 位置
  useEffect(() => {
    setFrame(prevFrame => {
      // 计算新的中心位置
      const newCenterX = centerX;
      const newCenterY = centerY;
      
      // 计算当前中心位置
      const currentCenterX = prevFrame.x + prevFrame.width / 2;
      const currentCenterY = prevFrame.y + prevFrame.height / 2;
      
      // 如果中心位置变化超过阈值，更新位置
      const threshold = 1;
      if (Math.abs(newCenterX - currentCenterX) > threshold || 
          Math.abs(newCenterY - currentCenterY) > threshold) {
        return {
          ...prevFrame,
          x: newCenterX - prevFrame.width / 2,
          y: newCenterY - prevFrame.height / 2
        };
      }
      
      return prevFrame;
    });
  }, [centerX, centerY]);

  // 测量文本内容的实际高度（宽度保持固定）
  const measureContentHeight = useCallback(() => {
    // 优先测量编辑器内容，如果没有则测量容器
    const targetElement = editorRef.current || contentRef.current;
    if (!targetElement) return null;
    
    const canvasScaleFactor = canvasScale || 1;
    
    // 使用 scrollHeight 获取实际内容高度（更准确）
    let contentHeight = targetElement.scrollHeight;
    
    // 如果 scrollHeight 为 0，使用 getBoundingClientRect
    if (contentHeight === 0) {
      const rect = targetElement.getBoundingClientRect();
      contentHeight = rect.height / canvasScaleFactor;
    } else {
      contentHeight = contentHeight / canvasScaleFactor;
    }
    
    // 计算实际高度：文本高度 + padding
    const measuredHeight = Math.ceil(contentHeight + ANNOTATION_PADDING_VERTICAL);
    
    // 限制高度在合理范围内
    return Math.max(ANNOTATION_HEIGHT_MIN, Math.min(measuredHeight, ANNOTATION_HEIGHT_MAX));
  }, [canvasScale]);

  // 当内容变化时，自动调整高度
  useEffect(() => {
    const timer = setTimeout(() => {
      const measuredHeight = measureContentHeight();
      if (measuredHeight && measuredHeight !== frame.height) {
        setFrame(prevFrame => {
          const heightDiff = measuredHeight - prevFrame.height;
          return {
            ...prevFrame,
            height: measuredHeight,
            y: prevFrame.y - heightDiff / 2
          };
        });
      }
    }, ANNOTATION_CONTENT_MEASURE_DELAY);
    
    return () => clearTimeout(timer);
  }, [pendingContent, fontSize, measureContentHeight, frame.height]);

  // 字体设置：使用传入的 fontSize
  const baseLineHeight = 1.4;
  const computedFontSize = fontSize * canvasScale;
  const computedLineHeight = baseLineHeight;

  const handleDrag = useCallback(
    (data) => {
      setFrame(prevFrame => ({ 
        ...prevFrame, 
        x: data.x, 
        y: data.y 
      }));
    },
    []
  );

  const handleDragStop = useCallback(
    (data) => {
      setFrame(prevFrame => {
        const nextFrame = { 
          ...prevFrame, 
          x: data.x, 
          y: data.y 
        };
        
        // 通知父组件位置变化
        const center = {
          x: data.x + nextFrame.width / 2,
          y: data.y + nextFrame.height / 2
        };
        onDrag?.(center);
        
        return nextFrame;
      });
    },
    [onDrag]
  );

  const handleResizeInternal = useCallback(
    (ref, position) => {
      const measuredWidth = parseFloat(ref.style.width);
      const clampedWidth = Math.max(ANNOTATION_WIDTH_MIN, Math.min(measuredWidth, ANNOTATION_WIDTH_MAX));
      
      setCurrentWidth(clampedWidth);
      
      setFrame(prevFrame => ({
        width: clampedWidth,
        height: prevFrame.height,
        x: position.x,
        y: position.y
      }));
      
      return { size: { width: clampedWidth } };
    },
    []
  );

  const handleResizeStop = useCallback(
    (ref, position) => {
      const result = handleResizeInternal(ref, position);
      if (!result) return;
      const { size: finalSize } = result;

      setTimeout(() => {
        setFrame(currentFrame => {
          onResize?.(annotation.id, { width: finalSize.width, height: currentFrame.height });

          const centerPos = {
            x: currentFrame.x + currentFrame.width / 2,
            y: currentFrame.y + currentFrame.height / 2
          };
          onDrag?.(centerPos);
          
          return currentFrame;
        });
      }, ANNOTATION_RESIZE_SAVE_DELAY);
    },
    [annotation.id, handleResizeInternal, onDrag, onResize]
  );

  const resizeHandleClasses = useMemo(
    () => ({
      bottomRight: "annotation-card__resize-handle annotation-card__resize-handle--bottom-right",
      bottomLeft: "annotation-card__resize-handle annotation-card__resize-handle--bottom-left",
      topRight: "annotation-card__resize-handle annotation-card__resize-handle--top-right",
      topLeft: "annotation-card__resize-handle annotation-card__resize-handle--top-left"
    }),
    []
  );

  // 判断是否为分数框或总分框
  const isScoreCard = annotation.source === "score" || annotation.source === "total_score";

  const resizeHandleStyles = useMemo(() => {
    const borderColor = isScoreCard 
      ? "1.5px solid rgba(24, 144, 255, 0.85)"
      : "1.5px solid rgba(211, 32, 41, 0.85)";
    
    const baseStyle = {
      width: "6px",
      height: "6px",
      border: borderColor,
      background: "#fff",
      borderRadius: "50%",
      pointerEvents: "auto"
    };
    return {
      bottomRight: { ...baseStyle, right: "-3px", bottom: "-3px" },
      bottomLeft: { ...baseStyle, left: "-3px", bottom: "-3px" },
      topRight: { ...baseStyle, right: "-3px", top: "-3px" },
      topLeft: { ...baseStyle, left: "-3px", top: "-3px" }
    };
  }, [isScoreCard]);

  const startEditing = () => {
    if (readOnly) return;
    if (!isSelected) {
      onClick?.();
    }
    setIsEditing(true);
  };

  const handleCardClick = (e) => {
    e.stopPropagation();
    if (readOnly) return;
    if (!isEditing) {
      onClick?.();
    }
  };

  const triggerEditChange = useCallback(() => {
    if (!onEdit) return;
    const currentContent = annotation.content ?? "";
    const nextContent = pendingContent ?? "";
    if (nextContent !== currentContent) {
      onEdit(annotation.id, nextContent);
    }
  }, [annotation.content, annotation.id, onEdit, pendingContent]);

  const finishEditing = useCallback(
    (shouldSave) => {
      if (shouldSave) {
        triggerEditChange();
      } else {
        setPendingContent(annotation.content || "");
      }
      setIsEditing(false);
    },
    [annotation.content, triggerEditChange]
  );

  const handleEditorBlur = useCallback(() => {
    if (isEditing) {
      finishEditing(true);
    }
  }, [finishEditing, isEditing]);

  const handleEditorCommand = useCallback(
    (command) => {
      if (command === "cancel") {
        finishEditing(false);
      } else if (command === "confirm") {
        finishEditing(true);
      }
    },
    [finishEditing]
  );

  // 字号调整处理
  const handleFontSizeIncrease = useCallback((e) => {
    e.stopPropagation();
    if (fontSize >= ANNOTATION_FONT_SIZE_MAX) return;
    onFontSizeChange?.(annotation.id, fontSize + ANNOTATION_FONT_SIZE_STEP);
  }, [annotation.id, fontSize, onFontSizeChange]);

  const handleFontSizeDecrease = useCallback((e) => {
    e.stopPropagation();
    if (fontSize <= ANNOTATION_FONT_SIZE_MIN) return;
    onFontSizeChange?.(annotation.id, fontSize - ANNOTATION_FONT_SIZE_STEP);
  }, [annotation.id, fontSize, onFontSizeChange]);

  return (
    <Rnd
      className={`annotation-card ${isSelected ? "selected" : ""} ${isEditing ? "editing" : ""} ${isScoreCard ? "score-card" : ""} ${readOnly ? "read-only" : ""}`}
      size={{ width: frame.width, height: frame.height }}
      position={{ x: frame.x, y: frame.y }}
      scale={canvasScale || 1}
      bounds="parent"
      enableResizing={readOnly ? false : { top: false, right: true, bottom: false, left: true, topRight: true, topLeft: true, bottomLeft: true, bottomRight: true }}
      resizeHandleClasses={resizeHandleClasses}
      resizeHandleStyles={resizeHandleStyles}
      dragHandleClassName="annotation-card__drag-region"
      disableDragging={isEditing || readOnly}
      onDrag={(e, data) => handleDrag(data)}
      onDragStop={(e, data) => handleDragStop(data)}
      onResize={(e, direction, ref, delta, position) => handleResizeInternal(ref, position)}
      onResizeStop={(e, direction, ref, delta, position) => handleResizeStop(ref, position)}
    >
      {/* 字号调整按钮 - 仅选中且非只读时显示 */}
      {isSelected && !readOnly && !isEditing && (
        <div className="annotation-card__font-controls" onClick={e => e.stopPropagation()}>
          <button
            type="button"
            onClick={handleFontSizeDecrease}
            disabled={fontSize <= ANNOTATION_FONT_SIZE_MIN}
            title="减小字号"
          >
            A-
          </button>
          <span>{fontSize}</span>
          <button
            type="button"
            onClick={handleFontSizeIncrease}
            disabled={fontSize >= ANNOTATION_FONT_SIZE_MAX}
            title="增大字号"
          >
            A+
          </button>
        </div>
      )}
      <div
        ref={contentRef}
        className={`annotation-card__inner annotation-card__drag-region ${isEditing ? "annotation-card__inner--editing" : ""}`}
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (!isEditing) {
            startEditing();
          }
        }}
        onClick={handleCardClick}
        style={{
          fontSize: `${computedFontSize}px`,
          lineHeight: computedLineHeight
        }}
      >
        <div ref={editorRef} className="annotation-card__editor-wrapper">
          <AnnotationLexicalEditor
            annotationId={annotation.id}
            initialText={annotation.content || ""}
            value={pendingContent}
            isEditing={isEditing}
            onContentChange={setPendingContent}
            onBlur={handleEditorBlur}
            onCommand={handleEditorCommand}
          />
        </div>
      </div>
    </Rnd>
  );
};

export default AnnotationCard;
