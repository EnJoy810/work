import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

const AnswerPreview = ({
  student,
  question,
  answerDetail,
  currentIndex,
  totalCount,
  showNavigation,
  onPrev,
  onNext,
  isFirst,
  isLast,
  isAutoAdvanceEnabled = true,
  onToggleAutoAdvance = () => {},
}) => {
  const [zoom, setZoom] = useState(100);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const normalizeText = useCallback((value) => {
    if (value === undefined || value === null) return "";
    if (typeof value === "string") return value;
    if (Array.isArray(value)) {
      return value
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean)
        .join("\n");
    }
    if (typeof value === "object") {
      const nested =
        value?.content ||
        value?.text ||
        value?.value ||
        value?.answer ||
        value?.student_answer;
      return normalizeText(nested);
    }
    return "";
  }, []);

  const normalizeImages = useCallback((value) => {
    if (!value) return [];
    const collect = [];
    const append = (candidate) => {
      if (!candidate) return;
      const url = candidate.trim();
      if (url && !collect.includes(url)) {
        collect.push(url);
      }
    };
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (typeof item === "string") {
          append(item);
        } else if (item && typeof item === "object") {
          const nestedUrl =
            item.url ||
            item.src ||
            item.path ||
            item.image ||
            item.imageUrl ||
            item.answer_photo_url ||
            item.answerPhotoUrl;
          if (nestedUrl) append(String(nestedUrl));
        }
      });
      return collect;
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return [];
      if ((trimmed.startsWith("[") && trimmed.endsWith("]")) || (trimmed.startsWith("{") && trimmed.endsWith("}"))) {
        try {
          const parsed = JSON.parse(trimmed);
          return normalizeImages(parsed);
        } catch {
          // fall through to delimiter split
        }
      }
      trimmed
        .split(/[,;\n]/)
        .map((item) => item.trim())
        .filter(Boolean)
        .forEach(append);
      return collect;
    }
    if (typeof value === "object") {
      const nestedUrl = value?.url || value?.src || value?.imageUrl || value?.answer_photo_url;
      if (nestedUrl) append(String(nestedUrl));
      return collect;
    }
    return [];
  }, []);

  const studentAnswer = useMemo(() => {
    const candidates = [
      answerDetail?.student_answer,
      answerDetail?.studentAnswer,
      answerDetail?.answer_content,
      answerDetail?.answerContent,
      answerDetail?.answer_text,
      answerDetail?.answerText,
      answerDetail?.content,
      answerDetail?.student_content,
      answerDetail?.studentContent,
      answerDetail?.essayContent,
      answerDetail?.answer,
    ];
    for (const candidate of candidates) {
      const normalized = normalizeText(candidate);
      if (normalized) return normalized;
    }
    return "";
  }, [answerDetail, normalizeText]);

  const answerImages = useMemo(() => {
    if (!answerDetail) return [];
    const fields = [
      answerDetail?.paper_urls,        // v2 接口返回的答题卡图片
      answerDetail?.paperUrls,
      answerDetail?.answer_photo_url,
      answerDetail?.answerPhotoUrl,
      answerDetail?.answer_photo_urls,
      answerDetail?.answerPhotoUrls,
      answerDetail?.answer_photo_list,
      answerDetail?.answerPhotoList,
      answerDetail?.answerPhotos,
      answerDetail?.answer_photos,
      answerDetail?.img_url,
      answerDetail?.imgUrl,
      answerDetail?.images,
      answerDetail?.image_list,
      answerDetail?.imageList,
      answerDetail?.answer_images,
      answerDetail?.answerImages,
    ];
    const collected = [];
    fields.forEach((field) => {
      normalizeImages(field).forEach((url) => {
        if (!collected.includes(url)) {
          collected.push(url);
        }
      });
    });
    return collected;
  }, [answerDetail, normalizeImages]);

  const answerImage = answerImages[currentImageIndex] || answerImages[0] || null;
  
  // 切换学生或题目时重置图片索引和缩放
  useEffect(() => {
    setZoom(100);
    setCurrentImageIndex(0);
  }, [student?.id, question?.id]);
  
  // 图片索引超出范围时重置
  useEffect(() => {
    if (currentImageIndex >= answerImages.length && answerImages.length > 0) {
      setCurrentImageIndex(0);
    }
  }, [currentImageIndex, answerImages.length]);
  const scoreReason = answerDetail?.score_reason || answerDetail?.scoreReason || "";

  if (!student) {
    return (
      <div className="answer-preview">
        <div className="answer-preview__empty">暂无学生信息</div>
      </div>
    );
  }

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 50));
  const handleReset = () => setZoom(100);
  const handlePrevImage = () => setCurrentImageIndex((prev) => Math.max(0, prev - 1));
  const handleNextImage = () => setCurrentImageIndex((prev) => Math.min(answerImages.length - 1, prev + 1));

  return (
    <section className="answer-preview">
      <div className="answer-preview__top">
        <div className="answer-preview__info">
          <span>{student.name}</span>
          <span className="answer-preview__meta">
            第 {currentIndex + 1} / {totalCount} 位
          </span>
        </div>
        <div className="answer-preview__controls">
          {showNavigation && (
            <>
              {(answerDetail?.teacher_alter || answerDetail?.teacherAlter) ? (
                <span style={{ marginRight: 8, color: '#16a34a' }}>已批改</span>
              ) : null}
              <button
                type="button"
                onClick={onToggleAutoAdvance}
                className={`answer-preview__nav-button answer-preview__auto-toggle${
                  isAutoAdvanceEnabled ? "" : " answer-preview__auto-toggle--disabled"
                }`}
                aria-pressed={isAutoAdvanceEnabled}
              >
                {isAutoAdvanceEnabled ? "自动切换开启" : "自动切换关闭"}
              </button>
              <button
                type="button"
                onClick={onPrev}
                disabled={isFirst}
                className="answer-preview__nav-button answer-preview__nav-button--prev"
                aria-label="上一位学生"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={onNext}
                disabled={isLast}
                className="answer-preview__nav-button answer-preview__nav-button--next"
                aria-label="下一位学生"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
          <div className="answer-preview__zoom">
            <button type="button" onClick={handleZoomOut} disabled={zoom <= 50} aria-label="缩小">
              <ZoomOut size={16} />
            </button>
            <button type="button" onClick={handleReset} className="answer-preview__zoom-reset">
              {zoom}%
            </button>
            <button type="button" onClick={handleZoomIn} disabled={zoom >= 200} aria-label="放大">
              <ZoomIn size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="answer-preview__image">
        <div className={`answer-preview__image-inner${zoom > 100 ? " answer-preview__image-inner--zoomed" : ""}`}>
          {answerImage ? (
            <>
              <img
                src={answerImage}
                alt={`${student.name} 的答题卡`}
                style={{ transform: zoom === 100 ? "none" : `scale(${zoom / 100})`, transformOrigin: "center center" }}
                draggable={false}
              />
              {answerImages.length > 1 && (
                <div style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  color: 'white',
                  fontSize: '14px'
                }}>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    disabled={currentImageIndex === 0}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'white',
                      cursor: currentImageIndex === 0 ? 'not-allowed' : 'pointer',
                      opacity: currentImageIndex === 0 ? 0.5 : 1,
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    aria-label="上一张"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span style={{ fontWeight: 500 }}>
                    {currentImageIndex + 1} / {answerImages.length}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    disabled={currentImageIndex === answerImages.length - 1}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'white',
                      cursor: currentImageIndex === answerImages.length - 1 ? 'not-allowed' : 'pointer',
                      opacity: currentImageIndex === answerImages.length - 1 ? 0.5 : 1,
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    aria-label="下一张"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="answer-preview__image-placeholder">暂无答题图片</div>
          )}
        </div>
      </div>

      {question && (
        <div className="answer-preview__question">
          <div className="answer-preview__question-title">{question.title}</div>
          <div className="answer-preview__question-meta">
            <span>满分：{question.maxScore} 分</span>
            {question.type === "choice" && question.answer ? <span>参考答案：{question.answer}</span> : null}
            {question.type === "essay" && question.wordCount ? <span>要求字数：{question.wordCount} 字</span> : null}
          </div>
          {studentAnswer ? (
            <div className="answer-preview__student-answer">
              <strong>学生作答：</strong>
              <p>{studentAnswer}</p>
            </div>
          ) : null}
          {scoreReason ? (
            <div className="answer-preview__score-reason">
              <strong>扣分说明：</strong>
              <p>{scoreReason}</p>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
};

export default AnswerPreview;
