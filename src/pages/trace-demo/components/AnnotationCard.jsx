import React, { useState, useRef, useEffect } from "react";

/**
 * 批注文本组件（贴在卷面上的“红字”）
 */
const AnnotationCard = ({ annotation, position, isSelected, onDrag, onClick, scale = 1 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0, scale: 1 });

  const handleMouseDown = (e) => {
    e.stopPropagation();
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      posX: position.x,
      posY: position.y,
      scale: scale || 1
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      const { mouseX, mouseY, posX, posY, scale: startScale } = dragStartRef.current;
      const divisor = startScale || 1;
      const deltaX = (e.clientX - mouseX) / divisor;
      const deltaY = (e.clientY - mouseY) / divisor;
      const newX = posX + deltaX;
      const newY = posY + deltaY;
      onDrag({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, onDrag]);

  const textColor = annotation.source === "algorithm" ? "#1677ff" : "#d32029";

  return (
    <div
      className={`annotation-card ${isSelected ? "selected" : ""} ${isDragging ? "dragging" : ""}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <div className="annotation-card__content" style={{ color: textColor }}>
        {annotation.content}
      </div>
    </div>
  );
};

export default AnnotationCard;
