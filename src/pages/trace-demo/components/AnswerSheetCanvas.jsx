import React, { useState, useRef, useEffect } from "react";
import { Spin, Empty } from "antd";
import AnnotationCard from "./AnnotationCard";
import { rtpToPixel } from "../utils/coordTransform";

/**
 * 答题卡画布组件
 * @param {Object} props
 * @param {Array} props.paperUrls
 * @param {Array} props.questions
 * @param {Function} props.onAnnotationDrag
 * @param {Function} props.onAnnotationSelect
 * @param {Function} props.onAnnotationEdit
 * @param {Function} props.onAnnotationResize
 * @param {string} props.selectedAnnotationId
 * @param {number} props.totalScore - 总分
 */
const AnswerSheetCanvas = ({
  paperUrls,
  questions,
  onAnnotationDrag,
  onAnnotationSelect,
  onAnnotationEdit,
  onAnnotationResize,
  selectedAnnotationId,
  scale = 1,
  totalScore
}) => {
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [imageDimensions, setImageDimensions] = useState(null);
  const [naturalImageSize, setNaturalImageSize] = useState(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const updateImageDimensions = () => {
      if (imageRef.current && imageRef.current.complete && containerRef.current && naturalImageSize) {
        // 获取容器尺寸（容器就是整个展示区）
        const containerRect = containerRef.current.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;
        
        // 计算适配比例，让图片完整显示在容器中
        const scaleX = containerWidth / naturalImageSize.width;
        const scaleY = containerHeight / naturalImageSize.height;
        const fitScale = Math.min(scaleX, scaleY, 1);
        
        // 应用用户缩放比例（基于自适应尺寸）
        const userScale = scale || 1;
        const displayWidth = naturalImageSize.width * fitScale * userScale;
        const displayHeight = naturalImageSize.height * fitScale * userScale;
        
        setImageDimensions({
          width: displayWidth,
          height: displayHeight,
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
  }, [currentPage, naturalImageSize, scale]);

  const handleImageLoad = () => {
    setLoading(false);
    if (imageRef.current && containerRef.current) {
      // 获取图片原始尺寸
      const naturalWidth = imageRef.current.naturalWidth;
      const naturalHeight = imageRef.current.naturalHeight;
      setNaturalImageSize({ width: naturalWidth, height: naturalHeight });
      
      // 获取容器尺寸（容器就是整个展示区）
      const containerRect = containerRef.current.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const containerHeight = containerRect.height;
      
      // 计算适配比例，让图片完整显示在容器中
      const scaleX = containerWidth / naturalWidth;
      const scaleY = containerHeight / naturalHeight;
      const fitScale = Math.min(scaleX, scaleY, 1); // 不超过原始大小
      
      // 应用用户缩放比例（基于自适应尺寸）
      const userScale = scale || 1;
      const displayWidth = naturalWidth * fitScale * userScale;
      const displayHeight = naturalHeight * fitScale * userScale;
      
      setImageDimensions({
        width: displayWidth,
        height: displayHeight,
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

        const annotationScale = typeof annotation.scale === "number" ? annotation.scale : 1;

        return (
          <AnnotationCard
            key={annotation.id}
            annotation={annotation}
            position={pixelPos}
            isSelected={selectedAnnotationId === annotation.id}
            canvasScale={scale}
            annotationScale={annotationScale}
            onDrag={(newPixelPos) =>
              onAnnotationDrag(annotation.id, newPixelPos, question.bbox, imageDimensions)
            }
            onClick={() => onAnnotationSelect(annotation.id)}
            onEdit={onAnnotationEdit}
            onResize={(nextSize) => onAnnotationResize && onAnnotationResize(annotation.id, nextSize)}
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

  // 渲染简答题分数（在 bbox 右上角，蓝色边框）
  const renderQuestionScores = () => {
    if (!imageDimensions) return null;

    return getCurrentPageQuestions()
      .filter(q => q.question_type === 'essay' && q.score !== undefined)
      .map((question) => {
        // 计算 bbox 的右上角位置
        const bboxRight = (question.bbox.x + question.bbox.width) * imageDimensions.width;
        const bboxTop = question.bbox.y * imageDimensions.height;

        // 创建分数批注框对象
        const scoreAnnotation = {
          id: `score-${question.questionId}`,
          content: String(question.score),
          source: "score",  // 标记为分数类型
          scale: 1.0,
          width: 60,  // 较小的宽度
        };

        return (
          <AnnotationCard
            key={`score-${question.questionId}`}
            annotation={scoreAnnotation}
            position={{ x: bboxRight, y: bboxTop }}
            isSelected={false}
            canvasScale={scale}
            annotationScale={1.0}
            onDrag={(newPixelPos) => {
              console.log(`题目 ${question.question_no} 分数拖动到:`, newPixelPos);
            }}
            onClick={() => {
              console.log('分数不可编辑');
            }}
            onEdit={() => {
              // 不允许编辑
            }}
            onResize={(nextSize) => {
              console.log(`题目 ${question.question_no} 分数缩放到:`, nextSize);
            }}
            readOnly={true}
          />
        );
      });
  };

  // 渲染总分（在答题卡顶部中间，蓝色边框）
  const renderTotalScore = () => {
    if (!imageDimensions || totalScore === undefined) return null;
    
    // 只在第一页显示总分
    if (currentPage !== 0) return null;

    // 总分位置：顶部中间，距离顶部 5% 的位置
    const topPosition = imageDimensions.height * 0.05;
    const leftPosition = imageDimensions.width * 0.5;

    // 创建总分批注框对象
    const totalScoreAnnotation = {
      id: "total-score",
      content: String(totalScore),
      source: "score",  // 标记为分数类型
      scale: 1.5,
      width: 80,  // 稍大的宽度
    };

    return (
      <AnnotationCard
        key="total-score"
        annotation={totalScoreAnnotation}
        position={{ x: leftPosition, y: topPosition }}
        isSelected={false}
        canvasScale={scale}
        annotationScale={1.5}
        onDrag={(newPixelPos) => {
          console.log('总分拖动到:', newPixelPos);
        }}
        onClick={() => {
          console.log('总分不可编辑');
        }}
        onEdit={() => {
          // 不允许编辑
        }}
        onResize={(nextSize) => {
          console.log('总分缩放到:', nextSize);
        }}
        readOnly={true}
      />
    );
  };

  if (!paperUrls || paperUrls.length === 0) {
    return <Empty description="暂无答题卡数据" />;
  }

  const currentPaperUrl = paperUrls[currentPage] || paperUrls[0];

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < paperUrls.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="canvas-wrapper">
      <div className="canvas-page-navigation">
        <button 
          type="button"
          className="page-nav-btn"
          onClick={handlePrevPage}
          disabled={currentPage === 0}
        >
          ‹
        </button>
        <span className="page-nav-index">
          {currentPage + 1}/{paperUrls.length}
        </span>
        <button 
          type="button"
          className="page-nav-btn"
          onClick={handleNextPage}
          disabled={currentPage >= paperUrls.length - 1}
        >
          ›
        </button>
      </div>
      <div className="canvas-body">
        <div className="canvas-body-content">
          <Spin spinning={loading}>
            <div className="answer-sheet-container" ref={containerRef}>
              <div className="answer-sheet-zoom-wrapper">
                <div
                  className="answer-sheet-inner"
                  style={
                    imageDimensions
                      ? {
                          width: `${imageDimensions.width}px`,
                          height: `${imageDimensions.height}px`,
                        }
                      : undefined
                  }
                  onClick={(e) => {
                    // 点击答题卡空白处取消选中
                    if (e.target.classList.contains('answer-sheet-inner') || 
                        e.target.classList.contains('answer-sheet-image')) {
                      onAnnotationSelect(null);
                    }
                  }}
                >
                  <img
                    ref={imageRef}
                    src={currentPaperUrl}
                    alt={`答题卡${currentPage === 0 ? "正面" : "背面"}`}
                    className="answer-sheet-image"
                    style={
                      imageDimensions
                        ? {
                            width: `${imageDimensions.width}px`,
                            height: `${imageDimensions.height}px`,
                          }
                        : undefined
                    }
                    onLoad={handleImageLoad}
                  />
                  {renderQuestionBoxes()}
                  {renderTotalScore()}
                  {renderQuestionScores()}
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
