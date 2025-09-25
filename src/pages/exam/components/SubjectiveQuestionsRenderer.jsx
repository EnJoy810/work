import React, { useRef, useEffect } from "react";
import { calculateElementPosition } from "../../../utils/tools";
import ShortFillRenderer from "./ShortFillRenderer";
import LongFillRenderer from "./LongFillRenderer";

/**
 * 非选择题渲染组件
 * 根据fillType属性决定渲染短填空还是长填空，并统一处理位置计算逻辑
 */
const SubjectiveQuestionsRenderer = React.forwardRef(
  ({ questions, onPositionUpdate, pageRef }, ref) => {
    const { questionNumber, content, fillType } = questions;

    // 创建ref用于获取非选择题部分的DOM元 素
    const questionsContainerRef = useRef(null);

    // 用于存储上一次的位置信息，避免不必要的更新
    const previousPositionInfoRef = useRef(null);

    // 使用useEffect在组件渲染后获取尺寸和位置信息
    useEffect(() => {
      // 当组件挂载或依赖项变化时计算元素位置
      if (questionsContainerRef.current && pageRef && onPositionUpdate) {
        const positionInfo = calculateElementPosition(
          questionsContainerRef.current,
          pageRef
        );

        // 扩展位置信息，添加额外信息
        const extendedPositionInfo = {
          ...positionInfo,
          questionType: fillType === "short" ? "shortFill" : "longFill",
          sectionId: questions.sectionId,
          timestamp: new Date().getTime(),
          fillType: fillType,
        };

        // 只有当位置信息真正变化时才调用回调函数
        const currentPositionKey = JSON.stringify(positionInfo);
        if (currentPositionKey !== previousPositionInfoRef.current) {
          // 调用回调函数传递位置信息
          onPositionUpdate(questions.sectionId, extendedPositionInfo);

          // 更新引用，存储当前位置信息
          previousPositionInfoRef.current = currentPositionKey;
        }
      }
    }, [questions, pageRef, onPositionUpdate, fillType]); // 仅当questions、pageRef或onPositionUpdate变化时重新计算

    // 根据fillType决定渲染哪种类型的填空题
    const renderQuestionContent = () => {
      if (fillType === "short") {
        return <ShortFillRenderer questions={questions} />;
      } else if (fillType === "long") {
        return <LongFillRenderer questions={questions} />;
      }
      return null;
    };

    return (
      <div
        ref={(el) => {
          // 同时设置两个ref
          if (ref) {
            ref.current = el;
          }
          questionsContainerRef.current = el;
        }}
      >
        {/* 非选择题标题 */}
        <div
          style={{
            fontWeight: "bold",
            fontSize: "16px",
          }}
        >
          {questionNumber}、{content}
        </div>

        {/* 根据fillType渲染对应的填空内容 */}
        {renderQuestionContent()}
      </div>
    );
  }
);

export default SubjectiveQuestionsRenderer;
