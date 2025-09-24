import React from "react";
import { Button } from "antd";
import { EditOutlined } from "@ant-design/icons";

/**
 * 非选择题渲染组件
 * 负责渲染非选择题的单独布局
 */
const SubjectiveQuestionsRenderer = ({ questions, pageIndex }) => {
  console.log("questions, pageIndex 非选择题", questions, pageIndex);
  const {
    questionNumber,
    content,
    blanksPerLine,
    questions: subQuestions,
  } = questions;

  // 获取subQuestions数组中的所有blanks数组，形成一个新的数组
  const allBlanks = [];
  subQuestions.forEach((question) => {
    if (question.blanks && Array.isArray(question.blanks)) {
      question.blanks.forEach((blank, index) => {
        if (index === 0) {
          blank.questionNumber = question.questionNumber; // 第一项获取上级的题号显示
        }
        allBlanks.push(blank);
      });
    }
  });
  console.log("allBlanks", allBlanks);

  return (
    <div>
      {/* 非选择题标题 */}
      <div
        style={{
          marginBottom: "20px",
          fontWeight: "bold",
          fontSize: "16px",
        }}
      >
        {questionNumber}、{content}
      </div>

      {/* 短填空题下划线区域 */}
      {allBlanks.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          {/* 计算需要渲染的行数 */}
          {Array.from({ length: Math.ceil(allBlanks.length / blanksPerLine) }).map((_, lineIndex) => {
            // 获取当前行需要显示的blanks
            const startIndex = lineIndex * blanksPerLine;
            const endIndex = startIndex + blanksPerLine;
            const lineBlanks = allBlanks.slice(startIndex, endIndex);
            
            return (
              <div 
                key={lineIndex} 
                style={{
                  display: 'flex',
                  marginBottom: '15px',
                  alignItems: 'center',
                  width: '100%',
                  paddingRight: '10px',
                  boxSizing: 'border-box'
                }}
              >
                {lineBlanks.map((blank, blankIndex) => (
                  <div 
                    key={blankIndex} 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      flex: '0 0 ' + (98 / blanksPerLine) + '%',
                      maxWidth: (98 / blanksPerLine) + '%',
                      marginRight: blankIndex < lineBlanks.length - 1 ? '10px' : 0,
                      boxSizing: 'border-box'
                    }}
                  >
                    {/* 无论是否有值都渲染span，确保空间占用 */}
                    <span style={{
                      marginRight: '5px',
                      visibility: blank.questionNumber ? 'visible' : 'hidden',
                      minWidth: '20px'
                    }}>{blank.questionNumber || ''}</span>
                    {/* 下划线根据页面宽度均匀分布 */}
                    <div 
                      style={{
                        borderBottom: '1px solid #000',
                        flexGrow: 1,
                        minWidth: '50px',
                        height: '30px',
                        display: 'flex',
                        alignItems: 'flex-end'
                      }}
                    />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SubjectiveQuestionsRenderer;
