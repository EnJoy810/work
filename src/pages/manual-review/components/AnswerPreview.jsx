import { useEffect, useMemo, useState } from "react";
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
  const normalizeText = (value) => {
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
  };

  const normalizeImages = (value) => {
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
  };

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
  }, [answerDetail]);

  const answerImages = useMemo(() => {
    if (!answerDetail) return [];
    const fields = [
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
  }, [answerDetail]);

  const answerImage = answerImages[0] || null;
  useEffect(() => {
    setZoom(100);
  }, [student?.id, question?.id, answerImage]);
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
            <img
              src={answerImage}
              alt={`${student.name} 的答题卡`}
              style={{ transform: zoom === 100 ? "none" : `scale(${zoom / 100})`, transformOrigin: "center center" }}
              draggable={false}
            />
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
