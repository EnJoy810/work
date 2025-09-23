import React, { useState } from "react";
import SealingLine from './SealingLine';
import { Button } from "antd";
import ExamInfoModal from "./ExamInfoModal";

/**
 * 答题卷渲染组件
 * 负责在固定大小的页面上绘制题目，并支持多页显示
 */
const AnswerSheetRenderer = ({
  questions = [],
  hasSealingLine = true,
  hasNote = true,
}) => {
  // console.log("hasSealingLine", hasSealingLine, hasNote);
  const pageWidth = 740; // 页面宽度，单位：px
  const pageHeight = 1111; // 页面高度，单位：px
  const pageMargin = 20; // 左右页边距，单位：px
  const topBottomMargin = 80; // 上下页边距，单位：px

  // 标题状态管理
  const [title, setTitle] = useState("");

  // 考试相关信息状态
  const [examSubject, setExamSubject] = useState("语文");
  const [applicableMajor, setApplicableMajor] = useState("25级高职高考");
  const [examTime, setExamTime] = useState("150");

  // 弹窗可见性状态
  const [isModalVisible, setIsModalVisible] = useState(false);

  // 打开弹窗
  const showModal = () => {
    setIsModalVisible(true);
  };

  // 关闭弹窗
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // 保存修改
  const handleSave = (updatedData) => {
    setExamSubject(updatedData.examSubject);
    setApplicableMajor(updatedData.applicableMajor);
    setExamTime(updatedData.examTime);
    setIsModalVisible(false);
  };

  // 计算页面数量
  const calculatePageCount = () => {
    // 这里是简化的计算逻辑，实际应该根据题目数量和每页可容纳的题目数来计算
    // 为了演示多页效果，当题目数量超过5时，显示第二页
    return questions.length > 5 ? 2 : 1;
  };

  // 渲染考试信息
  const renderExamInfo = () => {

    return (
      <div
        style={{
          marginBottom: "20px",
          fontSize: "14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* 右上角编辑按钮 */}
        <Button
          type="primary"
          ghost
          size="small"
          onClick={showModal}
          style={{
            position: "absolute",
            right: "0",
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          编辑
        </Button>

        <div style={{ marginRight: "30px" }}>
          考试科目:{" "}
          <span
            style={{
              borderBottom: "1px solid #000",
              paddingBottom: "1px",
              marginLeft: "5px",
            }}
          >
            {examSubject}
          </span>
        </div>
        <div style={{ marginRight: "30px" }}>
          适用专业（班级）:{" "}
          <span
            style={{
              borderBottom: "1px solid #000",
              paddingBottom: "1px",
              marginLeft: "5px",
            }}
          >
            {applicableMajor}
          </span>
        </div>
        <div>考试时间: {examTime}分钟</div>
      </div>
    );
  };

  // 渲染注意事项
  const renderNote = () => {
    if (!hasNote) return null;

    return (
      <div
        style={{
          marginBottom: "20px",
          border: "1px solid #000",
          display: "flex",
        }}
      >
        {/* 左边填涂样例 */}
        <div
          style={{
            alignSelf: "stretch",
            width: "200px",
            borderRight: "1px solid #000",
            padding: "10px",
            backgroundColor: "#f9f9f9",
            display: "flex",
          }}
        >
          {/* 左边：填涂样例 垂直排列 */}
          <div
            style={{
              width: "20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              borderRight: "1px solid #ccc",
              marginRight: "10px",
              paddingRight: "5px",
            }}
          >
            {"填涂样例".split("").map((char, index) => (
              <div
                key={index}
                style={{
                  fontSize: "14px",
                  margin: "3px 0",
                  fontWeight: "bold",
                }}
              >
                {char}
              </div>
            ))}
          </div>

          {/* 右边：正确填涂及示例 */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
            }}
          >
            <p style={{ margin: "0", padding: "0", fontWeight: "bold" }}>
              正确填涂
            </p>
            <div
              style={{
                border: "1px solid #000",
                width: "20px",
                height: "20px",
                backgroundColor: "#000",
                margin: "3px auto",
              }}
            ></div>
            <p style={{ margin: "0", padding: "0", fontWeight: "bold" }}>
              错误填涂
            </p>
            <div
              style={{
                marginTop: "10px",
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              <div
                style={{
                  border: "1px solid #000",
                  width: "20px",
                  height: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                }}
              >
                √
              </div>
              <div
                style={{
                  border: "1px solid #000",
                  width: "20px",
                  height: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                }}
              >
                ×
              </div>
              <div
                style={{
                  border: "1px solid #000",
                  width: "20px",
                  height: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                }}
              >
                ●
              </div>
              <div
                style={{
                  border: "1px solid #000",
                  width: "20px",
                  height: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                }}
              >
                ○
              </div>
            </div>
          </div>
        </div>

        {/* 右边注意事项说明 */}
        <div
          style={{
            flex: 1,
            padding: "10px",
            fontSize: "14px",
            display: "flex",
            height: "100%",
          }}
        >
          {/* 左边注意事项标题，垂直排列 */}
          <div
            style={{
              width: "20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "10px",
              borderRight: "1px solid #ccc",
              paddingRight: "5px",
            }}
          >
            {"注意事项".split("").map((char, index) => (
              <div key={index} style={{ margin: "3px 0", fontWeight: "bold" }}>
                {char}
              </div>
            ))}
          </div>

          {/* 右边注意事项内容 */}
          <div style={{ flex: 1 }}>
            <p style={{ margin: "3px 0" }}>
              1.答题前，考生先将自己的姓名、班级、考场、座位号填写清楚。
            </p>
            <p style={{ margin: "3px 0" }}>
              2.选择题部分必须使用2B铅笔填涂;非选择题部分使用黑色字迹的钢笔、圆珠笔或签字笔书写，字体工整、笔迹清楚。
            </p>
            <p style={{ margin: "3px 0" }}>
              3.请按照题号顺序在各题目的答题区域内作答，超出答题区域书写的答案无效;在草稿纸、试题卷上答题无效。
            </p>
            <p style={{ margin: "3px 0" }}>4.保持纸面清洁，不折叠、不破损。</p>
          </div>
        </div>
      </div>
    );
  };

  // 渲染单页内容
  const renderPageContent = (pageIndex) => {
    // 模拟题目数据，实际应该根据传入的questions和pageIndex筛选显示的题目
    const pageQuestions = questions.slice(pageIndex * 5, (pageIndex + 1) * 5);

    return (
      <div
        key={pageIndex}
        style={{
          width: pageWidth,
          height: pageHeight,
          backgroundColor: "white",
          padding: `${topBottomMargin}px ${pageMargin}px`,
          borderRadius: "8px",
          marginRight: "20px",
          marginBottom: "20px",
          position: "relative",
          boxShadow: "0px 0px 3px 3px #E5E9F2",
        }}
      >
        {/* 页面标题 */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="请输入答题卡标题"
          style={{
            textAlign: "center",
            margin: "0 0 10px 0",
            width: "100%",
            border: "1px dashed #ccc",
            borderRadius: "4px",
            padding: "8px 12px",
            fontSize: "24px",
            fontWeight: "bold",
            backgroundColor: "transparent",
            fontFamily: "inherit",
            transition: "border-color 0.3s ease",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#1890ff";
            e.target.style.boxShadow = "0 0 0 2px rgba(24, 144, 255, 0.2)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#ccc";
            e.target.style.boxShadow = "none";
          }}
        />
        {/* 考试信息 */}
        {renderExamInfo()}

        {/* 注意事项 */}
        {hasNote && renderNote()}

        {/* 题目列表 */}
        <div style={{ marginTop: "20px" }}>
          {pageQuestions.length > 0 ? (
            pageQuestions.map((question, idx) => (
              <div key={question.id || idx} style={{ marginBottom: "20px" }}>
                <div style={{ marginBottom: "10px", fontWeight: "bold" }}>
                  {question.title || `第${pageIndex * 5 + idx + 1}题`}
                </div>
                <div
                  style={{
                    border: "1px solid #ddd",
                    minHeight: "50px",
                    padding: "10px",
                  }}
                >
                  {/* 这里根据题目类型渲染不同的答题区域 */}
                  {question.type === "objective" && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "5px",
                      }}
                    >
                      {["A", "B", "C", "D"].map((option) => (
                        <div
                          key={option}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <div
                            style={{
                              width: "20px",
                              height: "20px",
                              border: "1px solid #000",
                              textAlign: "center",
                            }}
                          >
                            {option}
                          </div>
                          <div>____________________</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {question.type === "blank" && (
                    <div style={{ minHeight: "60px" }}>
                      {Array.from({ length: question.lines || 3 }).map(
                        (_, lineIdx) => (
                          <div
                            key={lineIdx}
                            style={{
                              marginBottom: "8px",
                              borderBottom: "1px solid #000",
                            }}
                          ></div>
                        )
                      )}
                    </div>
                  )}
                  {!question.type && <div>答题区域</div>}
                </div>
              </div>
            ))
          ) : (
            <div
              style={{ textAlign: "center", color: "#999", padding: "20px" }}
            >
              {pageIndex === 0 ? "暂无题目" : "此页无题目"}
            </div>
          )}
        </div>

        {/* 页码 */}
        <div
          style={{
            position: "absolute",
            bottom: pageMargin,
            right: pageMargin,
            fontSize: "12px",
            color: "#666",
          }}
        >
          第 {pageIndex + 1} 页 / 共 {calculatePageCount()} 页
        </div>
      </div>
    );
  };

  // 渲染所有页面
  const renderAllPages = () => {
    const pageCount = calculatePageCount();

    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        {Array.from({ length: pageCount }).map((_, pageIndex) => {
          if (pageIndex === 0 && hasSealingLine) {
            // 第一页添加密封线内容
            return (
              <div key={pageIndex} style={{ position: "relative", display: "flex" }}>
                {/* 使用密封线组件 - 绝对定位 */}
                <SealingLine pageHeight={pageHeight} topBottomMargin={topBottomMargin} />
                {/* 右侧正常页面内容 - 调整位置在密封线右侧 */}
                <div style={{ marginLeft: '120px' }}>
                  {renderPageContent(pageIndex)}
                </div>
              </div>
            );
          }
          // 其他页保持原样
          return renderPageContent(pageIndex);
        })}
      </div>
    );
  };

  return (
    <div
      className="answer-sheet-scroll-container"
      style={{
        marginTop: 20,
        flex: 1,
        overflow: "auto",
      }}
    >
      {renderAllPages()}
      <ExamInfoModal
        visible={isModalVisible}
        onCancel={handleCancel}
        onSave={handleSave}
        initialData={{
          examSubject,
          applicableMajor,
          examTime,
        }}
      />
    </div>
  );
};

export default AnswerSheetRenderer;
