import { useEffect } from "react";
import { Collapse, InputNumber, Button, Select, Checkbox } from "antd";
import { useMessageService } from "../../../components/common/message";
import { generateQuestionId, generateBlankId } from "../../../utils/tools";

const { Panel } = Collapse;

/**
 * 长填空问题部分组件
 *
 * @param {Object} props
 * @param {Array} props.questions - 题目列表
 * @param {Function} props.setQuestions - 设置题目列表的函数
 * @param {Array} props.subQuestions - 小题列表
 * @param {Function} props.setSubQuestions - 设置小题列表的函数
 * @param {Object} props.lineScores - 行分数状态
 * @param {Function} props.setLineScores - 设置行分数的函数
 * @param {number} props.linesPerLine - 每行显示的行数
 * @param {Function} props.setLinesPerLine - 设置每行显示行数的函数
 * @param {boolean} props.showSubQuestionScore - 是否显示小题分数
 * @param {Function} props.setShowSubQuestionScore - 设置是否显示小题分数的函数
 * @param {Array} props.longFillConfig - 长填空配置
 * @param {Function} props.setLongFillConfig - 设置长填空配置的函数
 */
const LongFillQuestionSection = ({
  longQuestions: questions, // 重命名属性以匹配组件内部使用
  setLongQuestions: setQuestions, // 重命名属性以匹配组件内部使用
  longSubQuestions: subQuestions, // 重命名属性以匹配组件内部使用
  setLongSubQuestions: setSubQuestions, // 重命名属性以匹配组件内部使用
  longLineScores: lineScores, // 重命名属性以匹配组件内部使用
  setLongLineScores: setLineScores, // 重命名属性以匹配组件内部使用
  showSubQuestionScore,
  setShowSubQuestionScore,
  longFillConfig,
  setLongFillConfig,
}) => {
  const { showInfo } = useMessageService();

  // 处理长填空配置变化
  const handleLongFillConfigChange = (id, field, value) => {
    const newConfig = longFillConfig.map((config) =>
      config.id === id ? { ...config, [field]: value } : config
    );
    setLongFillConfig(newConfig);
  };

  // 移除长填空配置
  const removeLongFillConfig = (id) => {
    const newConfig = longFillConfig.filter((config) => config.id !== id);
    setLongFillConfig(newConfig);
  };

  // 添加小题
  const addSubQuestion = (questionId) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    const newSubQuestion = {
      id: generateQuestionId('sub'),
      questionId: questionId,
      totalLines: question.linesPerQuestion || 1,
      pointsPerLine: question.pointsPerLine || 2,
      lines: Array.from(
        { length: question.linesPerQuestion || 1 },
        (_, index) => ({
          id: generateBlankId(questionId, index),
          points: question.pointsPerLine || 2,
        })
      ),
    };

    setSubQuestions([...subQuestions, newSubQuestion]);

    // 标记该题目已点击添加小题按钮
    setQuestions(
      questions.map((q) =>
        q.id === questionId ? { ...q, isAddSubQuestionClicked: true } : q
      )
    );
  };

  // 移除小题
  const removeSubQuestion = (subQuestionId) => {
    // 找到要删除的小题所属的题目ID
    const subQuestion = subQuestions.find((sq) => sq.id === subQuestionId);
    if (!subQuestion) return;

    // 获取该题目下的所有小题
    const questionSubQuestions = subQuestions.filter(
      (sq) => sq.questionId === subQuestion.questionId
    );

    // 检查是否只剩一条小题，如果是则不允许删除
    if (questionSubQuestions.length <= 1) {
      showInfo("至少需要保留一条小题数据");
      return;
    }

    setSubQuestions(subQuestions.filter((sq) => sq.id !== subQuestionId));
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
      const question = questions.find((q) => q.id === questionId);
      if (question) {
        setSubQuestions(
          subQuestions.map((sq) => {
            if (sq.questionId === questionId) {
              const updatedSq = { ...sq };

              if (field === "pointsPerLine") {
                updatedSq.pointsPerLine = numValue;
                updatedSq.lines = updatedSq.lines.map((line) => ({
                  ...line,
                  points: numValue,
                }));
              }

              if (field === "linesPerQuestion") {
                // 严格按照大题设置的行数更新小题
                const targetLength = numValue;
                const newLines = [...sq.lines];

                if (targetLength > newLines.length) {
                  // 添加新的行，使用当前每空分数
                  for (let i = newLines.length; i < targetLength; i++) {
                    newLines.push({
                      id: generateBlankId(sq.questionId, i),
                      points: sq.pointsPerLine,
                    });
                  }
                } else if (targetLength < newLines.length) {
                  // 删除多余的行
                  newLines.splice(targetLength);
                }

                // 确保totalLines和linesPerQuestion保持一致
                updatedSq.totalLines = targetLength;
                updatedSq.lines = newLines;
              }

              return updatedSq;
            }
            return sq;
          })
        );

        // 如果更新了每行分数，批量更新lineScores状态中的对应分数
        if (field === "pointsPerLine") {
          const updatedLineScores = { ...lineScores };
          // 批量更新所有该题的行分数
          for (let i = 0; i < question.linesPerQuestion; i++) {
            updatedLineScores[`${question.id}_${i}`] = numValue;
          }
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
      });
    }

    return newQuestions;
  };

  // 当长填空配置变化时，根据配置生成或更新题目
  useEffect(() => {
    // 清空现有的题目和小题
    setQuestions([]);
    setSubQuestions([]);

    // 生成新的题目
    let allQuestions = [];
    longFillConfig.forEach((config) => {
      const newQuestions = generateQuestions(config);
      allQuestions = [...allQuestions, ...newQuestions];
    });

    allQuestions.sort((a, b) => a.questionNumber - b.questionNumber);
    setQuestions(allQuestions);
  }, [longFillConfig, setQuestions, setSubQuestions]);

  return (
    <>
      {/* 长填空配置区域 */}
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
                        {subQuestions.filter(
                          (sub) => sub.questionId === question.id
                        ).length > 0 && (
                          <span>
                            {" "}
                            总分
                            {subQuestions
                              .filter((sub) => sub.questionId === question.id)
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
                  {question.isAddSubQuestionClicked ? (
                    <div>
                      {subQuestions
                        .filter((sub) => sub.questionId === question.id)
                        .map((subQuestion, index) => (
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
                                第{index + 1}小题：
                              </span>

                              <span>行数：</span>
                              <InputNumber
                                min={1}
                                value={subQuestion.totalLines}
                                onChange={(value) => {
                                  setSubQuestions((prev) =>
                                    prev.map((sq) =>
                                      sq.id === subQuestion.id
                                        ? { ...sq, totalLines: value }
                                        : sq
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
                                  setSubQuestions((prev) =>
                                    prev.map((sq) =>
                                      sq.id === subQuestion.id
                                        ? {
                                            ...sq,
                                            pointsPerLine: value,
                                            lines: sq.lines.map((line) => ({
                                              ...line,
                                              points: value,
                                            })),
                                          }
                                        : sq
                                    )
                                  );
                                }}
                                style={{ width: 80 }}
                              />

                              <Button
                                danger
                                size="small"
                                onClick={() =>
                                  removeSubQuestion(subQuestion.id)
                                }
                                type="text"
                                disabled={
                                  subQuestions.filter(
                                    (sq) => sq.questionId === question.id
                                  ).length <= 1
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
