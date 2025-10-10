import { useEffect } from "react";
import { Collapse, InputNumber, Button, Select, Checkbox } from "antd";
import { useMessageService } from "../../../components/common/message";
import { generateQuestionId, generateBlankId } from "../../../utils/tools";

const { Panel } = Collapse;

/**
 * 简答题题组件
 * @param {Object} props
 * @param {Array} props.longQuestions - 题目列表（包含子题数据）
 * @param {Function} props.setLongQuestions - 设置题目列表的函数
 * @param {Object} props.longLineScores - 行分数状态
 * @param {Function} props.setLongLineScores - 设置行分数的函数
 * @param {boolean} props.showSubQuestionScore - 是否显示小题分数
 * @param {Function} props.setShowSubQuestionScore - 设置是否显示小题分数的函数
 * @param {Array} props.longFillConfig - 简答题配置
 * @param {Function} props.setLongFillConfig - 设置简答题配置的函数
 */
const LongFillQuestionSection = ({
  longQuestions: questions, // 重命名属性以匹配组件内部使用
  setLongQuestions: setQuestions, // 重命名属性以匹配组件内部使用
  longLineScores: lineScores, // 重命名属性以匹配组件内部使用
  setLongLineScores: setLineScores, // 重命名属性以匹配组件内部使用
  showSubQuestionScore,
  setShowSubQuestionScore,
  longFillConfig,
  setLongFillConfig,
}) => {
  const { showInfo } = useMessageService();

  // 处理简答题配置变化
  const handleLongFillConfigChange = (id, field, value) => {
    const newConfig = longFillConfig.map((config) =>
      config.id === id ? { ...config, [field]: value } : config
    );
    setLongFillConfig(newConfig);
  };

  // 移除简答题配置
  const removeLongFillConfig = (id) => {
    const newConfig = longFillConfig.filter((config) => config.id !== id);
    setLongFillConfig(newConfig);
  };

  // 添加小题
  const addSubQuestion = (questionId) => {
      // 找到对应的题目，计算新小题的序号
      const question = questions.find((q) => q.id === questionId);
      const currentSubQuestionsCount = question?.subQuestions?.length || 0;
      const newSubQuestionNumber = currentSubQuestionsCount + 1;
      
      const newSubQuestion = {
        id: generateQuestionId('sub', Date.now()),
        number: newSubQuestionNumber, // 保存小题序号
        totalLines: 1, // 默认1行
        pointsPerLine: 2, // 默认2分
        lines: [
          {
            id: generateBlankId(questionId, Date.now()),
            points: 2,
          }
        ],
      };

      // 将新小题添加到父级question对象的subQuestions数组中
      setQuestions(
        questions.map((q) =>
          q.id === questionId 
            ? {
                ...q, 
                isAddSubQuestionClicked: true,
                subQuestions: [...(q.subQuestions || []), newSubQuestion]
              } 
            : q
        )
      );
    };

  // 移除小题
  const removeSubQuestion = (questionId, subQuestionId) => {
    // 找到对应的题目
    const question = questions.find((q) => q.id === questionId);
    if (!question || !question.subQuestions) return;

    // 检查是否只剩一条小题，如果是则不允许删除
    if (question.subQuestions.length <= 1) {
      showInfo("至少需要保留一条小题数据");
      return;
    }

    // 从父级question对象的subQuestions数组中删除指定小题
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              subQuestions: q.subQuestions.filter(
                (sub) => sub.id !== subQuestionId
              ),
            }
          : q
      )
    );
  };

  // 更新大题
  const updateQuestion = (questionId, field, value) => {
    // 确保值是数字类型
    const numValue =
      field === "pointsPerLine" || field === "linesPerQuestion"
        ? parseInt(value)
        : value;

    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const updatedQuestion = { ...q, [field]: numValue };

          // 同步更新总分
          updatedQuestion.totalScore =
            updatedQuestion.pointsPerLine * updatedQuestion.linesPerQuestion;

          return updatedQuestion;
        }
        return q;
      })
    );

    // 如果更新了每空分数或空数量，同步更新相关的小题
    if (field === "pointsPerLine" || field === "linesPerQuestion") {
      setQuestions(
        questions.map((q) => {
          if (q.id === questionId) {
            // 更新题目自身属性
            const updatedQuestion = { ...q, [field]: numValue };
            
            // 如果有子题，同步更新子题的相应属性
            if (updatedQuestion.subQuestions) {
              if (field === "pointsPerLine") {
                updatedQuestion.subQuestions = updatedQuestion.subQuestions.map((subQuestion) => ({
                  ...subQuestion,
                  pointsPerLine: numValue,
                  lines: subQuestion.lines.map((line) => ({
                    ...line,
                    points: numValue,
                  })),
                }));
              } else if (field === "linesPerQuestion") {
                // 严格按照大题设置的行数更新小题
                updatedQuestion.subQuestions = updatedQuestion.subQuestions.map((subQuestion) => {
                  const targetLength = numValue;
                  const newLines = [...subQuestion.lines];

                  if (targetLength > newLines.length) {
                    // 添加新的行，使用当前每空分数
                    for (let i = newLines.length; i < targetLength; i++) {
                      newLines.push({
                        id: `blank-${questionId}-${Date.now()}-${i}`, // 直接生成唯一ID，不再使用未定义的函数
                        points: subQuestion.pointsPerLine,
                      });
                    }
                  } else if (targetLength < newLines.length) {
                    // 删除多余的行
                    newLines.splice(targetLength);
                  }

                  // 确保totalLines和linesPerQuestion保持一致
                  return {
                    ...subQuestion,
                    totalLines: targetLength,
                    lines: newLines,
                  };
                });
              }
            }
            
            return updatedQuestion;
          }
          return q;
        })
      );

      // 如果更新了每行分数，批量更新lineScores状态中的对应分数
      if (field === "pointsPerLine") {
        const question = questions.find((q) => q.id === questionId);
        if (question) {
          const updatedLineScores = { ...lineScores };
          // 批量更新所有该题的行分数
          question.subQuestions?.forEach((subQuestion) => {
            subQuestion.lines?.forEach((line) => {
              updatedLineScores[line.id] = numValue;
            });
          });
          setLineScores(updatedLineScores);
        }
      }
    }
  };



  // 批量生成题目
  const generateQuestions = (config) => {
    const { startQuestion, endQuestion, pointsPerLine, linesPerQuestion } =
      config;

    // 验证输入是否完整
    if (!startQuestion || !endQuestion || !pointsPerLine || !linesPerQuestion) {
      return [];
    }

    const start = parseInt(startQuestion);
    const end = parseInt(endQuestion);
    const points = parseInt(pointsPerLine);
    const lines = parseInt(linesPerQuestion);

    // 验证输入是否有效
    if (
      isNaN(start) ||
      isNaN(end) ||
      isNaN(points) ||
      isNaN(lines) ||
      start > end ||
      points < 0 ||
      lines < 1
    ) {
      return [];
    }

    // 生成题目
    const newQuestions = [];
    for (let i = start; i <= end; i++) {
      newQuestions.push({
        id: generateQuestionId(null, i),
        questionNumber: i,
        pointsPerLine: points,
        linesPerQuestion: lines,
        totalScore: points * lines,
        isAddSubQuestionClicked: false, // 标记是否点击了添加小题按钮
        subQuestions: [], // 存储属于该题的小题数据
      });
    }

    return newQuestions;
  };

  // 当简答题配置变化时，根据配置生成或更新题目
  useEffect(() => {
    // 清空现有的题目
    setQuestions([]);

    // 生成新的题目
    let allQuestions = [];
    longFillConfig.forEach((config) => {
      const newQuestions = generateQuestions(config);
      allQuestions = [...allQuestions, ...newQuestions];
    });

    allQuestions.sort((a, b) => a.questionNumber - b.questionNumber);
    setQuestions(allQuestions);
  }, [longFillConfig, setQuestions]);

  return (
    <>
      {/* 简答题配置区域 */}
      {longFillConfig.map((config) => (
        <div key={config.id} style={{ marginBottom: 16, position: "relative" }}>
          {/* 移除按钮（只有配置数量大于1时显示） */}
          {longFillConfig.length > 1 && (
            <Button
              type="text"
              danger
              size="small"
              onClick={() => removeLongFillConfig(config.id)}
              style={{ position: "absolute", right: 0, top: 0 }}
            >
              ×
            </Button>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span>从</span>
            <InputNumber
              value={config.startQuestion}
              onChange={(value) =>
                handleLongFillConfigChange(config.id, "startQuestion", value)
              }
              min={1}
              style={{ width: 80 }}
              placeholder="开始题"
            />
            <span>题到</span>
            <InputNumber
              value={config.endQuestion}
              onChange={(value) =>
                handleLongFillConfigChange(config.id, "endQuestion", value)
              }
              min={1}
              style={{ width: 80 }}
              placeholder="结束题"
            />
            <span>题，每题</span>
            <InputNumber
              value={config.pointsPerLine}
              onChange={(value) =>
                handleLongFillConfigChange(config.id, "pointsPerLine", value)
              }
              min={0}
              style={{ width: 80 }}
              placeholder="分数"
            />
            <span>分，每题</span>
            <InputNumber
              value={config.linesPerQuestion}
              onChange={(value) =>
                handleLongFillConfigChange(config.id, "linesPerQuestion", value)
              }
              min={1}
              style={{ width: 80 }}
              placeholder="行数量"
            />
            <span>行</span>
          </div>
        </div>
      ))}

      {/* 添加分段按钮 */}
      {/* <Button
        type="link"
        onClick={addLongFillConfig}
        style={{ marginBottom: 16 }}
      >
        + 分段添加小题
      </Button> */}

      {/* 生成的题目列表 */}
      {questions.length > 0 && (
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
                        {question.subQuestions && question.subQuestions.length > 0 && (
                          <span>
                            {' '}
                            总分
                            {question.subQuestions
                              .reduce((total, sub) => {
                                return (
                                  total + sub.pointsPerLine
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
                        <span>题{question.questionNumber}</span>
                        <span>共</span>
                        <InputNumber
                          min={1}
                          value={question.linesPerQuestion}
                          onChange={(value) =>
                            updateQuestion(
                              question.id,
                              "linesPerQuestion",
                              value
                            )
                          }
                          style={{ width: 60 }}
                        />
                        <span>行, </span>
                        <InputNumber
                          min={1}
                          value={question.pointsPerLine}
                          onChange={(value) =>
                            updateQuestion(question.id, "pointsPerLine", value)
                          }
                          style={{ width: 60 }}
                        />
                        <span>分</span>
                      </div>
                    )
                  }
                  key="1"
                  extra={
                    <Button
                      type="link"
                      onClick={(e) => {
                        e.stopPropagation();
                        addSubQuestion(question.id);
                      }}
                    >
                      +添加小题
                    </Button>
                  }
                >
                  {question.isAddSubQuestionClicked && question.subQuestions ? (
                    <div>
                      {question.subQuestions.map((subQuestion) => (
                        <div
                          key={subQuestion.id}
                          style={{
                            marginBottom: 16,
                            padding: 12,
                            border: "1px solid #f0f0f0",
                            borderRadius: 4,
                            backgroundColor: "#fafafa",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                              marginBottom: 8,
                            }}
                          >
                            <span style={{ fontWeight: 500 }}>
                              第{subQuestion.number}小题：
                            </span>

                            <span>行数：</span>
                            <InputNumber
                              min={1}
                              value={subQuestion.totalLines}
                              onChange={(value) => {
                                setQuestions(
                                  questions.map((q) =>
                                    q.id === question.id
                                      ? {
                                          ...q,
                                          subQuestions: q.subQuestions.map(
                                            (sub) =>
                                              sub.id === subQuestion.id
                                                ? { ...sub, totalLines: value }
                                                : sub
                                          ),
                                        }
                                      : q
                                  )
                                );
                              }}
                              style={{ width: 80 }}
                            />

                            <span>分值：</span>
                            <InputNumber
                              min={0}
                              value={subQuestion.pointsPerLine}
                              onChange={(value) => {
                                setQuestions(
                                  questions.map((q) =>
                                    q.id === question.id
                                      ? {
                                          ...q,
                                          subQuestions: q.subQuestions.map(
                                            (sub) =>
                                              sub.id === subQuestion.id
                                                ? {
                                                    ...sub,
                                                    pointsPerLine: value,
                                                    lines: sub.lines.map((line) => ({
                                                      ...line,
                                                      points: value,
                                                    })),
                                                  }
                                                : sub
                                          ),
                                        }
                                      : q
                                  )
                                );
                              }}
                              style={{ width: 80 }}
                            />

                            <Button
                              danger
                              size="small"
                              onClick={() =>
                                removeSubQuestion(question.id, subQuestion.id)
                              }
                              type="text"
                              disabled={
                                question.subQuestions.length <= 1
                              }
                            >
                              删除
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
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
          <div
            style={{
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

export default LongFillQuestionSection;
