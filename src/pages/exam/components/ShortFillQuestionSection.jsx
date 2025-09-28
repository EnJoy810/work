import { useEffect } from "react";
import { Collapse, InputNumber, Button, Select, Checkbox } from "antd";
import { generateQuestionId, generateBlankId } from "../../../utils/tools";

const { Panel } = Collapse;

/**
 * 短填空问题部分组件
 *
 * @param {Object} props
 * @param {Array} props.shortFillConfig - 短填空配置
 * @param {Function} props.onQuestionsChange - 题目数据变化时的回调函数
 * @param {number} props.blanksPerLine - 每行显示的空数
 * @param {Function} props.setBlanksPerLine - 设置每行显示空数的函数
 * @param {boolean} props.showSubQuestionScore - 是否显示小题分数
 * @param {Function} props.setShowSubQuestionScore - 设置是否显示小题分数的函数
 * @param {Array} props.questions - 题目数据
 */
const ShortFillQuestionSection = ({
  shortFillConfig,
  onQuestionsChange,
  blanksPerLine,
  setBlanksPerLine,
  showSubQuestionScore,
  setShowSubQuestionScore,
  onConfigChange,
  questions,
}) => {
  // 添加小题
  const addSubQuestion = (questionId) => {
    const newSubQuestion = {
      id: generateQuestionId("sub", Date.now()),
      questionId: questionId,
      totalBlanks: 1,
      pointsPerBlank: 2,
      blanks: [
        {
          id: generateBlankId(questionId, 0),
          points: 2,
        },
      ],
    };

    // 将小题添加到对应题目中
    const updatedQuestions = questions.map((q) =>
      q.id === questionId
        ? {
            ...q,
            isAddSubQuestionClicked: true,
            subQuestions: [...(q.subQuestions || []), newSubQuestion],
          }
        : q
    );

    if (onQuestionsChange) {
      onQuestionsChange({ questions: updatedQuestions });
    }
  };

  // 移除小题
  const removeSubQuestion = (questionId, subQuestionId) => {
    const updatedQuestions = questions.map((q) =>
      q.id === questionId
        ? {
            ...q,
            subQuestions: (q.subQuestions || []).filter(
              (sq) => sq.id !== subQuestionId
            ),
          }
        : q
    );

    if (onQuestionsChange) {
      onQuestionsChange({ questions: updatedQuestions });
    }
  };

  // 更新大题
  const updateQuestion = (questionId, field, value) => {
    // 确保值是数字类型
    const numValue =
      field === "pointsPerBlank" || field === "blanksPerQuestion"
        ? parseInt(value)
        : value;

    const updatedQuestions = questions.map((q) => {
      if (q.id === questionId) {
        // 先更新题目本身的属性
        const updatedQuestion = { ...q, [field]: numValue };

        // 同步更新总分
        updatedQuestion.totalScore =
          updatedQuestion.pointsPerBlank * updatedQuestion.blanksPerQuestion;

        // 根据更新的字段调整blanks数组
        // 确保blanks数组存在
        if (!updatedQuestion.blanks) {
          updatedQuestion.blanks = [];
        }

        if (field === "pointsPerBlank") {
          // 更新所有空的分数
          updatedQuestion.blanks = updatedQuestion.blanks.map((blank) => ({
            ...blank,
            points: numValue,
          }));
        } else if (field === "blanksPerQuestion") {
          // 调整空的数量
          const targetLength = numValue;
          const currentLength = updatedQuestion.blanks.length;
          const newBlanks = [...updatedQuestion.blanks];

          if (targetLength > currentLength) {
            // 添加新的空
            for (let i = currentLength; i < targetLength; i++) {
              newBlanks.push({
                id: generateBlankId(updatedQuestion.questionNumber, i),
                points: updatedQuestion.pointsPerBlank,
              });
            }
          } else if (targetLength < currentLength) {
            // 删除多余的空
            newBlanks.splice(targetLength);
          }

          updatedQuestion.blanks = newBlanks;
        }

        // 然后同步更新相关的小题（如果有）
        if (
          (field === "pointsPerBlank" || field === "blanksPerQuestion") &&
          updatedQuestion.subQuestions &&
          updatedQuestion.subQuestions.length > 0
        ) {
          // 更新该题的所有小题
          const updatedSubQuestions = updatedQuestion.subQuestions.map((sq) => {
            const updatedSq = { ...sq };

            if (field === "pointsPerBlank") {
              updatedSq.pointsPerBlank = numValue;
              updatedSq.blanks = updatedSq.blanks.map((blank) => ({
                ...blank,
                points: numValue,
              }));
            }

            if (field === "blanksPerQuestion") {
              // 严格按照大题设置的空数更新小题
              const targetLength = numValue;
              const newBlanks = [...sq.blanks];

              if (targetLength > newBlanks.length) {
                // 添加新的空，使用当前每空分数
                for (let i = newBlanks.length; i < targetLength; i++) {
                  newBlanks.push({
                    id: generateBlankId(sq.questionId, i),
                    points: sq.pointsPerBlank,
                  });
                }
              } else if (targetLength < newBlanks.length) {
                // 删除多余的空
                newBlanks.splice(targetLength);
              }

              // 确保totalBlanks和blanksPerQuestion保持一致
              updatedSq.totalBlanks = targetLength;
              updatedSq.blanks = newBlanks;
            }

            return updatedSq;
          });

          // 应用更新后的小题
          updatedQuestion.subQuestions = updatedSubQuestions;
        }

        return updatedQuestion;
      }
      return q;
    });

    if (onQuestionsChange) {
      onQuestionsChange({ questions: updatedQuestions });
    }
  };

  // 更新空分数
  const updateBlankPoints = (questionId, subQuestionId, blankId, value) => {
    const updatedQuestions = questions.map((q) => {
      if (q.id === questionId && q.subQuestions) {
        return {
          ...q,
          subQuestions: q.subQuestions.map((sq) => {
            if (sq.id === subQuestionId) {
              return {
                ...sq,
                blanks: sq.blanks.map((blank) =>
                  blank.id === blankId ? { ...blank, points: value } : blank
                ),
              };
            }
            return sq;
          }),
        };
      }
      return q;
    });

    if (onQuestionsChange) {
      onQuestionsChange({ questions: updatedQuestions });
    }
  };

  // 注意：questions状态现在由父组件管理
  // 短填空配置变化的逻辑已移至父组件处理

  // 当题目数据变化时，通知父组件
  useEffect(() => {
    // 只有当题目数据不为空时才通知父组件
    if (onQuestionsChange && questions && questions.length > 0) {
      onQuestionsChange({
        questions,
      });
    }
  }, [questions, onQuestionsChange]);

  // 检查是否有至少一个配置项是完全填完整的
  const hasCompletedConfig = shortFillConfig.some(
    (config) =>
      config.startQuestion !== undefined &&
      config.startQuestion !== null &&
      config.endQuestion !== undefined &&
      config.endQuestion !== null &&
      config.pointsPerBlank !== undefined &&
      config.pointsPerBlank !== null &&
      config.pointsPerBlank > 0 &&
      config.blanksPerQuestion !== undefined &&
      config.blanksPerQuestion !== null &&
      config.blanksPerQuestion > 0
  );

  return (
    <>
      {/* 短填空配置区域 */}
      {shortFillConfig.map((config) => (
        <div key={config.id} style={{ marginBottom: 16, position: "relative" }}>
          {/* 移除按钮（只有配置数量大于1时显示） */}
          {shortFillConfig.length > 1 && (
            <Button
              type="text"
              danger
              size="small"
              onClick={() => {
                if (onConfigChange) {
                  onConfigChange("remove", { id: config.id });
                }
              }}
              style={{ position: "absolute", right: 0, top: 0 }}
            >
              ×
            </Button>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span>从</span>
            <InputNumber
              value={config.startQuestion}
              onChange={(value) => {
                if (onConfigChange) {
                  onConfigChange("update", {
                    id: config.id,
                    field: "startQuestion",
                    value,
                  });
                }
              }}
              min={1}
              style={{ width: 80 }}
              placeholder="开始题"
            />
            <span>题到</span>
            <InputNumber
              value={config.endQuestion}
              onChange={(value) => {
                if (onConfigChange) {
                  onConfigChange("update", {
                    id: config.id,
                    field: "endQuestion",
                    value,
                  });
                }
              }}
              min={1}
              style={{ width: 80 }}
              placeholder="结束题"
            />
            <span>题，每空</span>
            <InputNumber
              value={config.pointsPerBlank}
              onChange={(value) => {
                if (onConfigChange) {
                  onConfigChange("update", {
                    id: config.id,
                    field: "pointsPerBlank",
                    value,
                  });
                }
              }}
              min={0}
              style={{ width: 80 }}
              placeholder="分数"
            />
            <span>分，每题</span>
            <InputNumber
              value={config.blanksPerQuestion}
              onChange={(value) => {
                if (onConfigChange) {
                  onConfigChange("update", {
                    id: config.id,
                    field: "blanksPerQuestion",
                    value,
                  });
                }
              }}
              min={1}
              style={{ width: 80 }}
              placeholder="空数量"
            />
            <span>空</span>
          </div>
        </div>
      ))}

      {/* 添加分段按钮 */}
      {/* <Button
        type="link"
        onClick={addShortFillConfig}
        style={{ marginBottom: 16 }}
      >
        + 分段添加小题
      </Button> */}

      {/* 生成的题目列表 - 只有当至少有一个配置项完全填完整时才显示 */}
      {hasCompletedConfig && questions.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          {questions.map((question) => (
            <div key={question.id} style={{ marginBottom: 8 }}>
              <Collapse defaultActiveKey={["1"]} collapsible="icon">
                <Panel
                  header={
                    question.isAddSubQuestionClicked ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <span>题{question.questionNumber}</span>
                        {question.subQuestions &&
                          question.subQuestions.length > 0 && (
                            <span>
                              {" "}
                              总分
                              {question.subQuestions.reduce((total, sub) => {
                                return (
                                  total + sub.pointsPerBlank * sub.totalBlanks
                                );
                              }, 0)}
                              分
                            </span>
                          )}
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <span>
                          题{question.questionNumber} 共{question.totalScore}分
                        </span>
                        <span>每空</span>
                        <InputNumber
                          min={1}
                          value={question.pointsPerBlank}
                          onChange={(value) =>
                            updateQuestion(question.id, "pointsPerBlank", value)
                          }
                          style={{ width: 60 }}
                        />
                        <span>分, 共</span>
                        <InputNumber
                          min={1}
                          value={question.blanksPerQuestion}
                          onChange={(value) =>
                            updateQuestion(
                              question.id,
                              "blanksPerQuestion",
                              value
                            )
                          }
                          style={{ width: 60 }}
                        />
                        <span>空</span>
                      </div>
                    )
                  }
                  key="1"
                  extra={
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      {question.isAddSubQuestionClicked && (
                        <>
                          {question.isMultipleChoice &&
                            question.subQuestions && (
                              <>
                                <span>
                                  {question.subQuestions.length}
                                  选
                                </span>
                                <Select
                                  value={
                                    question.selectedBlanksCount ||
                                    question.subQuestions.length
                                  }
                                  onChange={(value, option) => {
                                    if (option && option.nativeElement) {
                                      option.nativeElement.stopPropagation();
                                    }
                                    updateQuestion(
                                      question.id,
                                      "selectedBlanksCount",
                                      parseInt(value)
                                    );
                                  }}
                                  style={{ width: 60, marginRight: 8 }}
                                >
                                  {Array.from(
                                    {
                                      length: question.subQuestions.length,
                                    },
                                    (_, i) => i + 1
                                  ).map((num) => (
                                    <Select.Option key={num} value={num}>
                                      {num}
                                    </Select.Option>
                                  ))}
                                </Select>
                                <span>空</span>
                              </>
                            )}
                          <Checkbox
                            checked={question.isMultipleChoice || false}
                            onChange={(e) => {
                              e.stopPropagation();
                              // 当选中时，设置默认值为总空数
                              if (e.target.checked && question.subQuestions) {
                                const totalSubQuestions =
                                  question.subQuestions.length;
                                // console.log("totalBlanks", totalBlanks);
                                updateQuestion(
                                  question.id,
                                  "selectedBlanksCount",
                                  totalSubQuestions
                                );
                              }

                              updateQuestion(
                                question.id,
                                "isMultipleChoice",
                                e.target.checked
                              );
                            }}
                          >
                            多选
                          </Checkbox>
                        </>
                      )}

                      <Button
                        type="link"
                        onClick={(e) => {
                          e.stopPropagation();
                          addSubQuestion(question.id);
                        }}
                      >
                        +添加小题
                      </Button>
                    </div>
                  }
                >
                  {!question.isAddSubQuestionClicked ? (
                    <div>
                      {/* 使用预先生成的blanks数组 */}
                      {question.blanks &&
                        question.blanks.map((blank, index) => (
                          <div
                            key={blank.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              marginBottom: 8,
                            }}
                          >
                            <span>第 {index + 1} 空：</span>
                            <InputNumber
                              min={0}
                              value={blank.points}
                              onChange={(value) => {
                                // 直接更新questions对象中的blanks数组
                                const updatedQuestions = questions.map((q) =>
                                  q.id === question.id
                                    ? {
                                        ...q,
                                        blanks: q.blanks.map((b, idx) =>
                                          idx === index
                                            ? { ...b, points: value }
                                            : b
                                        ),
                                      }
                                    : q
                                );

                                if (onQuestionsChange) {
                                  onQuestionsChange({
                                    questions: updatedQuestions,
                                  });
                                }
                              }}
                              style={{ width: 80, marginLeft: 8 }}
                            />
                            <span style={{ marginLeft: 8 }}>分</span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    (question.subQuestions || []).map((subQuestion, index) => (
                      <div
                        key={subQuestion.id}
                        style={{
                          marginBottom: 8,
                          border: "1px solid #f0f0f0",
                          padding: 8,
                          borderRadius: 4,
                        }}
                      >
                        <Collapse collapsible="icon" defaultActiveKey={["1"]}>
                          <Panel
                            header={
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                  }}
                                >
                                  <span>({index + 1}) 共</span>
                                  <InputNumber
                                    min={1}
                                    value={subQuestion.totalBlanks}
                                    onChange={(value) => {
                                      // 更新小题的空数量
                                      const updatedQuestions = questions.map(
                                        (q) => {
                                          if (
                                            q.id === question.id &&
                                            q.subQuestions
                                          ) {
                                            return {
                                              ...q,
                                              subQuestions: q.subQuestions.map(
                                                (sq) => {
                                                  if (
                                                    sq.id === subQuestion.id
                                                  ) {
                                                    const updatedSq = {
                                                      ...sq,
                                                    };
                                                    const targetLength = value;
                                                    const newBlanks = [
                                                      ...sq.blanks,
                                                    ];

                                                    if (
                                                      targetLength >
                                                      newBlanks.length
                                                    ) {
                                                      // 添加新的空，使用当前每空分数
                                                      for (
                                                        let i =
                                                          newBlanks.length;
                                                        i < targetLength;
                                                        i++
                                                      ) {
                                                        newBlanks.push({
                                                          id: `blank-${Date.now()}-${i}`,
                                                          points:
                                                            sq.pointsPerBlank,
                                                        });
                                                      }
                                                    } else if (
                                                      targetLength <
                                                      newBlanks.length
                                                    ) {
                                                      // 删除多余的空
                                                      newBlanks.splice(
                                                        targetLength
                                                      );
                                                    }

                                                    // 确保totalBlanks一致
                                                    updatedSq.totalBlanks =
                                                      targetLength;
                                                    updatedSq.blanks =
                                                      newBlanks;
                                                    return updatedSq;
                                                  }
                                                  return sq;
                                                }
                                              ),
                                            };
                                          }
                                          return q;
                                        }
                                      );

                                      if (onQuestionsChange) {
                                        onQuestionsChange({
                                          questions: updatedQuestions,
                                        });
                                      }
                                    }}
                                    style={{ width: 60 }}
                                  />
                                  <span>空 每空</span>
                                  <InputNumber
                                    min={0}
                                    value={subQuestion.pointsPerBlank}
                                    onChange={(value) => {
                                      // 更新小题的每空分数
                                      const updatedQuestions = questions.map(
                                        (q) => {
                                          if (
                                            q.id === question.id &&
                                            q.subQuestions
                                          ) {
                                            return {
                                              ...q,
                                              subQuestions: q.subQuestions.map(
                                                (sq) => {
                                                  if (
                                                    sq.id === subQuestion.id
                                                  ) {
                                                    return {
                                                      ...sq,
                                                      pointsPerBlank: value,
                                                      blanks: sq.blanks.map(
                                                        (blank) => ({
                                                          ...blank,
                                                          points: value,
                                                        })
                                                      ),
                                                    };
                                                  }
                                                  return sq;
                                                }
                                              ),
                                            };
                                          }
                                          return q;
                                        }
                                      );

                                      if (onQuestionsChange) {
                                        onQuestionsChange({
                                          questions: updatedQuestions,
                                        });
                                      }
                                    }}
                                    style={{ width: 60 }}
                                  />
                                  <span>分</span>
                                </div>
                                <Button
                                  type="text"
                                  danger
                                  size="small"
                                  onClick={() =>
                                    removeSubQuestion(
                                      question.id,
                                      subQuestion.id
                                    )
                                  }
                                  disabled={
                                    (question.subQuestions || []).length <= 1
                                  }
                                >
                                  删除
                                </Button>
                              </div>
                            }
                            key="1"
                          >
                            {subQuestion.blanks &&
                              subQuestion.blanks.map((blank, blankIndex) => (
                                <div
                                  key={blank.id}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    marginBottom: 8,
                                  }}
                                >
                                  <span>第 {blankIndex + 1} 空：</span>
                                  <InputNumber
                                    min={0}
                                    value={blank.points}
                                    onChange={(value) =>
                                      updateBlankPoints(
                                        question.id,
                                        subQuestion.id,
                                        blank.id,
                                        value
                                      )
                                    }
                                    style={{
                                      width: 80,
                                      marginLeft: 8,
                                    }}
                                  />
                                  <span style={{ marginLeft: 8 }}>分</span>
                                </div>
                              ))}
                          </Panel>
                        </Collapse>
                      </div>
                    ))
                  )}
                </Panel>
              </Collapse>
            </div>
          ))}
        </div>
      )}

      {/* 显示设置 */}
      <div
        style={{
          marginTop: 24,
          paddingTop: 16,
          borderTop: "1px solid #f0f0f0",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <span>每行展示</span>
          <Select
            value={blanksPerLine}
            onChange={(value) => setBlanksPerLine(value)}
            style={{ width: 80, margin: "0 8px" }}
          >
            <Select.Option value={1}>1</Select.Option>
            <Select.Option value={2}>2</Select.Option>
            <Select.Option value={3}>3</Select.Option>
            <Select.Option value={4}>4</Select.Option>
            <Select.Option value={5}>5</Select.Option>
            <Select.Option value={6}>6</Select.Option>
            <Select.Option value={7}>7</Select.Option>
            <Select.Option value={8}>8</Select.Option>
            <Select.Option value={9}>9</Select.Option>
            <Select.Option value={10}>10</Select.Option>
          </Select>
          <span>空</span>
          <div
            style={{
              marginLeft: 50,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Checkbox
              checked={showSubQuestionScore}
              onChange={(e) => setShowSubQuestionScore(e.target.checked)}
            >
              小题显示分数
            </Checkbox>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShortFillQuestionSection;
