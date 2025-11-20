import React, { useState, useRef, useEffect, useMemo } from "react";
import { Spin, Empty, Tabs } from "antd";
import AnnotationCard from "./AnnotationCard";
import { rtpToPixel } from "../utils/coordTransform";

/**
 * 答题卡画布组件
 * @param {Object} props
 * @param {Array} props.paperUrls
 * @param {Array} props.questions
 * @param {Function} props.onAnnotationDrag
 * @param {Function} props.onAnnotationSelect
 * @param {string} props.selectedAnnotationId
 */
const AnswerSheetCanvas = ({
  paperUrls,
  questions,
  onAnnotationDrag,
  onAnnotationSelect,
  selectedAnnotationId,
  scale = 1,
}) => {
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [imageDimensions, setImageDimensions] = useState(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  const tabItems = useMemo(
    () =>
      paperUrls.map((_, index) => ({
        key: String(index),
        label: index === 0 ? "正面" : "背面",
      })),
    [paperUrls]
  );

  useEffect(() => {
    const updateImageDimensions = () => {
      if (imageRef.current && imageRef.current.complete) {
        const rect = imageRef.current.getBoundingClientRect();
        const safeScale = scale || 1;
        setImageDimensions({
          width: rect.width / safeScale,
          height: rect.height / safeScale,
        });
      }
    };

    updateImageDimensions();
    window.addEventListener("resize", updateImageDimensions);

    let resizeObserver;
    if (typeof ResizeObserver !== "undefined" && containerRef.current) {
      resizeObserver = new ResizeObserver(updateImageDimensions);
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener("resize", updateImageDimensions);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [currentPage, scale]);

  const handleImageLoad = () => {
    setLoading(false);
    if (imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect();
      const safeScale = scale || 1;
      setImageDimensions({
        width: rect.width / safeScale,
        height: rect.height / safeScale,
      });
    }
  };

  const getCurrentPageQuestions = () => {
    const currentPaperId = `ai-chinese-000${currentPage + 1}`;
    return questions.filter((q) => q.paper_id === currentPaperId);
  };

  const renderAnnotations = () => {
    if (!imageDimensions) return null;
    const currentQuestions = getCurrentPageQuestions();

    return currentQuestions.flatMap((question) =>
      question.annotations.map((annotation) => {
        const pixelPos = rtpToPixel(annotation.currentPosition, question.bbox, imageDimensions);

        return (
          <AnnotationCard
            key={annotation.id}
            annotation={annotation}
            position={pixelPos}
            isSelected={selectedAnnotationId === annotation.id}
            scale={scale}
            onDrag={(newPixelPos) =>
              onAnnotationDrag(annotation.id, newPixelPos, question.bbox, imageDimensions)
            }
            onClick={() => onAnnotationSelect(annotation.id)}
          />
        );
      })
    );
  };

  const renderQuestionBoxes = () => {
    if (!imageDimensions) return null;

    return getCurrentPageQuestions().map((question) => {
      const left = question.bbox.x * imageDimensions.width;
      const top = question.bbox.y * imageDimensions.height;
      const width = question.bbox.width * imageDimensions.width;
      const height = question.bbox.height * imageDimensions.height;

      return (
        <div
          key={question.questionId}
          className="question-bbox"
          style={{
            position: "absolute",
            left: `${left}px`,
            top: `${top}px`,
            width: `${width}px`,
            height: `${height}px`,
            border: "1px dashed rgba(24, 144, 255, 0)",
            pointerEvents: "auto",
            transition: "border-color 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(24, 144, 255, 0.5)";
            const label = e.currentTarget.querySelector(".question-label");
            if (label) label.style.opacity = "1";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(24, 144, 255, 0)";
            const label = e.currentTarget.querySelector(".question-label");
            if (label) label.style.opacity = "0";
          }}
        >
          <span
            className="question-label"
            style={{
              position: "absolute",
              top: -20,
              left: 0,
              background: "#1890ff",
              color: "white",
              padding: "2px 8px",
              borderRadius: 4,
              fontSize: 12,
              opacity: 0,
              transition: "opacity 0.2s ease",
            }}
          >
            {question.question_no}
          </span>
        </div>
      );
    });
  };

  if (!paperUrls || paperUrls.length === 0) {
    return <Empty description="暂无答题卡数据" />;
  }

  const currentPaperUrl = paperUrls[currentPage] || paperUrls[0];
  const scaledDimensions = imageDimensions
    ? {
        width: imageDimensions.width * scale,
        height: imageDimensions.height * scale,
      }
    : null;

  return (
    <div className="canvas-wrapper">
      <div className="canvas-tabs">
        <Tabs
          items={tabItems}
          size="small"
          activeKey={String(currentPage)}
          onChange={(key) => setCurrentPage(Number(key))}
        />
      </div>
      <div className="canvas-body">
        <div className="canvas-body-content">
          <Spin spinning={loading}>
            <div className="answer-sheet-container" ref={containerRef}>
              <div
                className="answer-sheet-zoom-wrapper"
                style={
                  scaledDimensions
                    ? {
                        width: `${scaledDimensions.width}px`,
                        height: `${scaledDimensions.height}px`,
                      }
                    : undefined
                }
              >
                <div
                  className="answer-sheet-inner"
                  style={
                    imageDimensions
                      ? {
                          width: `${imageDimensions.width}px`,
                          height: `${imageDimensions.height}px`,
                          transform: `scale(${scale})`,
                          transformOrigin: "top left",
                        }
                      : {
                          transform: `scale(${scale})`,
                          transformOrigin: "top left",
                        }
                  }
                >
                  <img
                    ref={imageRef}
                    src={currentPaperUrl}
                    alt={`答题卡${currentPage === 0 ? "正面" : "背面"}`}
                    className="answer-sheet-image"
                    onLoad={handleImageLoad}
                  />
                  {renderQuestionBoxes()}
                  {renderAnnotations()}
                </div>
              </div>
            </div>
          </Spin>
        </div>
      </div>
    </div>
  );
};

export default AnswerSheetCanvas;
