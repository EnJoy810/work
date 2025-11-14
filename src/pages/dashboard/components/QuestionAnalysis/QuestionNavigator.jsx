import React from "react";

export default function QuestionNavigator({
  choiceQuestions = [],
  nonChoiceQuestions = [],
  currentQuestionId,
  onChangeQuestion,
  questionsPerRow = 8,
  containerRef,
  choiceExpanded,
  onToggleChoice,
  nonChoiceExpanded,
  onToggleNonChoice,
}) {
  return (
    <div style={{ marginLeft: "16px", display: "flex", flexDirection: "column", flex: 1 }}>
      {/* 选择题组 */}
      <div ref={containerRef} style={{ marginBottom: "12px", display: "flex", flexWrap: "wrap" }}>
        <div
          style={{ display: "flex", justifyContent: "flex-end", marginBottom: "8px", cursor: "pointer", minWidth: 80, whiteSpace: "nowrap" }}
          onClick={onToggleChoice}
        >
          <span style={{ marginRight: "8px", fontWeight: "bold" }}>选择题</span>
          <span>{choiceExpanded ? "▼" : "▶"}</span>
        </div>
        <div style={{ flex: 1, marginLeft: "20px" }}>
          <div style={{ display: "flex" }}>
            {choiceQuestions.slice(0, questionsPerRow).map((q) => (
              <span
                key={q.question_id}
                onClick={() => onChangeQuestion(q.question_id)}
                style={{
                  width: "40px",
                  height: "30px",
                  margin: "0 4px",
                  borderRadius: "4px",
                  border: "1px solid #d9d9d9",
                  backgroundColor: q.question_id === currentQuestionId ? "oklch(.7 .2 254)" : "#fff",
                  color: q.question_id === currentQuestionId ? "#fff" : "#000",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "bold",
                  lineHeight: "30px",
                  textAlign: "center",
                }}
              >
                {q.question_id}
              </span>
            ))}
          </div>
          {choiceExpanded && (
            <>
              {Array.from({
                length: Math.ceil(choiceQuestions.slice(questionsPerRow).length / questionsPerRow),
              }).map((_, rowIndex) => {
                const start = rowIndex * questionsPerRow;
                const end = start + questionsPerRow;
                const rowQuestions = choiceQuestions.slice(questionsPerRow).slice(start, end);
                return (
                  <div key={`choice-row-${rowIndex}`} style={{ display: "flex", marginTop: "8px" }}>
                    {rowQuestions.map((q) => (
                      <span
                        key={q.question_id}
                        onClick={() => onChangeQuestion(q.question_id)}
                        style={{
                          width: "40px",
                          height: "30px",
                          margin: "0 4px",
                          borderRadius: "4px",
                          border: "1px solid #d9d9d9",
                          backgroundColor: q.question_id === currentQuestionId ? "oklch(.7 .2 254)" : "#fff",
                          color: q.question_id === currentQuestionId ? "#fff" : "#000",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "bold",
                          lineHeight: "30px",
                          textAlign: "center",
                        }}
                      >
                        {q.question_id}
                      </span>
                    ))}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* 非选择题组 */}
      <div ref={containerRef} style={{ display: "flex", flexWrap: "wrap" }}>
        <div
          style={{ display: "flex", marginBottom: "8px", cursor: "pointer", justifyContent: "flex-end", minWidth: 80, whiteSpace: "nowrap" }}
          onClick={onToggleNonChoice}
        >
          <span style={{ marginRight: "8px", fontWeight: "bold" }}>非选择题</span>
          <span>{nonChoiceExpanded ? "▼" : "▶"}</span>
        </div>
        <div style={{ flex: 1, marginLeft: "20px" }}>
          <div style={{ display: "flex" }}>
            {nonChoiceQuestions.slice(0, questionsPerRow).map((q) => (
              <span
                key={q.question_id}
                onClick={() => onChangeQuestion(q.question_id)}
                style={{
                  width: "40px",
                  height: "30px",
                  margin: "0 4px",
                  borderRadius: "4px",
                  border: "1px solid #d9d9d9",
                  backgroundColor: q.question_id === currentQuestionId ? "oklch(.7 .2 254)" : "#fff",
                  color: q.question_id === currentQuestionId ? "#fff" : "#000",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "bold",
                  lineHeight: "30px",
                  textAlign: "center",
                }}
              >
                {q.question_id}
              </span>
            ))}
          </div>

          {nonChoiceExpanded && (
            <>
              {Array.from({
                length: Math.ceil(nonChoiceQuestions.slice(questionsPerRow).length / questionsPerRow),
              }).map((_, rowIndex) => {
                const start = rowIndex * questionsPerRow;
                const end = start + questionsPerRow;
                const rowQuestions = nonChoiceQuestions.slice(questionsPerRow).slice(start, end);
                return (
                  <div key={`non-choice-row-${rowIndex}`} style={{ display: "flex", marginTop: "8px" }}>
                    {rowQuestions.map((q) => (
                      <span
                        key={q.question_id}
                        onClick={() => onChangeQuestion(q.question_id)}
                        style={{
                          width: "40px",
                          height: "30px",
                          margin: "0 4px",
                          borderRadius: "4px",
                          border: "1px solid #d9d9d9",
                          backgroundColor: q.question_id === currentQuestionId ? "oklch(.7 .2 254)" : "#fff",
                          color: q.question_id === currentQuestionId ? "#fff" : "#000",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "bold",
                          lineHeight: "30px",
                          textAlign: "center",
                        }}
                      >
                        {q.question_id}
                      </span>
                    ))}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
