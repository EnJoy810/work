import { useState, useEffect } from 'react';
import { Collapse, InputNumber, Button, Select, Checkbox } from 'antd';
import { useMessageService } from '../../../components/common/message';

const { Panel } = Collapse;

/**
 * 短填空问题部分组件
 * 
 * @param {Object} props
 * @param {Array} props.questions - 题目列表
 * @param {Function} props.setQuestions - 设置题目列表的函数
 * @param {Array} props.subQuestions - 小题列表
 * @param {Function} props.setSubQuestions - 设置小题列表的函数
 * @param {Object} props.blankScores - 空分数状态
 * @param {Function} props.setBlankScores - 设置空分数的函数
 * @param {number} props.blanksPerLine - 每行显示的空数
 * @param {Function} props.setBlanksPerLine - 设置每行显示空数的函数
 * @param {boolean} props.showSubQuestionScore - 是否显示小题分数
 * @param {Function} props.setShowSubQuestionScore - 设置是否显示小题分数的函数
 * @param {Array} props.shortFillConfig - 短填空配置
 * @param {Function} props.setShortFillConfig - 设置短填空配置的函数
 */
const ShortFillQuestionSection = ({
  questions,
  setQuestions,
  subQuestions,
  setSubQuestions,
  blankScores,
  setBlankScores,
  blanksPerLine,
  setBlanksPerLine,
  showSubQuestionScore,
  setShowSubQuestionScore,
  shortFillConfig,
  setShortFillConfig
}) => {
  const { showInfo } = useMessageService();

  // 处理短填空配置变化
  const handleShortFillConfigChange = (id, field, value) => {
    const newConfig = shortFillConfig.map((config) =>
      config.id === id ? { ...config, [field]: value } : config
    );
    setShortFillConfig(newConfig);
  };

  // 移除短填空配置
  const removeShortFillConfig = (id) => {
    const newConfig = shortFillConfig.filter((config) => config.id !== id);
    setShortFillConfig(newConfig);
  };

  // 添加小题
  const addSubQuestion = (questionId) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    const newSubQuestion = {
      id: `sub-${Date.now()}`,
      questionId: questionId,
      totalBlanks: question.blanksPerQuestion || 1,
      pointsPerBlank: question.pointsPerBlank || 2,
      blanks: Array.from(
        { length: question.blanksPerQuestion || 1 },
        (_, index) => ({
          id: `blank-${Date.now()}-${index}`,
          points: question.pointsPerBlank || 2,
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
    setSubQuestions(subQuestions.filter((sq) => sq.id !== subQuestionId));
  };

  // 更新大题
  const updateQuestion = (questionId, field, value) => {
    // 确保值是数字类型
    const numValue = 
      field === 'pointsPerBlank' || field === 'blanksPerQuestion'
        ? parseInt(value)
        : value;

    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const updatedQuestion = { ...q, [field]: numValue };

          // 同步更新总分
          updatedQuestion.totalScore = 
            updatedQuestion.pointsPerBlank * updatedQuestion.blanksPerQuestion;

          return updatedQuestion;
        }
        return q;
      })
    );

    // 如果更新了每空分数或空数量，同步更新相关的小题
    if (field === 'pointsPerBlank' || field === 'blanksPerQuestion') {
      const question = questions.find((q) => q.id === questionId);
      if (question) {
        setSubQuestions(
          subQuestions.map((sq) => {
            if (sq.questionId === questionId) {
              const updatedSq = { ...sq };

              if (field === 'pointsPerBlank') {
                updatedSq.pointsPerBlank = numValue;
                updatedSq.blanks = updatedSq.blanks.map((blank) => ({
                  ...blank,
                  points: numValue,
                }));
              }

              if (field === 'blanksPerQuestion') {
                // 严格按照大题设置的空数更新小题
                const targetLength = numValue;
                const newBlanks = [...sq.blanks];

                if (targetLength > newBlanks.length) {
                  // 添加新的空，使用当前每空分数
                  for (let i = newBlanks.length; i < targetLength; i++) {
                    newBlanks.push({
                      id: `blank-${Date.now()}-${i}`,
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
            }
            return sq;
          })
        );

        // 如果更新了每空分数，批量更新blankScores状态中的对应分数
        if (field === 'pointsPerBlank') {
          const updatedBlankScores = { ...blankScores };
          // 批量更新所有该题的空分数
          for (let i = 0; i < question.blanksPerQuestion; i++) {
            updatedBlankScores[`${question.id}_${i}`] = numValue;
          }
          setBlankScores(updatedBlankScores);
        }
      }
    }
  };

  // 更新空分数
  const updateBlankPoints = (subQuestionId, blankId, value) => {
    setSubQuestions(
      subQuestions.map((sq) => {
        if (sq.id === subQuestionId) {
          return {
            ...sq,
            blanks: sq.blanks.map((blank) =>
              blank.id === blankId ? { ...blank, points: value } : blank
            ),
          };
        }
        return sq;
      })
    );
  };

  // 批量生成题目
  const generateQuestions = (config) => {
    const { startQuestion, endQuestion, pointsPerBlank, blanksPerQuestion } = config;

    // 验证输入是否完整
    if (
      !startQuestion ||
      !endQuestion ||
      !pointsPerBlank ||
      !blanksPerQuestion
    ) {
      return [];
    }

    const start = parseInt(startQuestion);
    const end = parseInt(endQuestion);
    const points = parseInt(pointsPerBlank);
    const blanks = parseInt(blanksPerQuestion);

    // 验证输入是否有效
    if (
      isNaN(start) ||
      isNaN(end) ||
      isNaN(points) ||
      isNaN(blanks) ||
      start > end ||
      points < 0 ||
      blanks < 1
    ) {
      return [];
    }

    // 生成题目
    const newQuestions = [];
    for (let i = start; i <= end; i++) {
      newQuestions.push({
        id: `question-${i}`,
        questionNumber: i,
        pointsPerBlank: points,
        blanksPerQuestion: blanks,
        totalScore: points * blanks,
        isAddSubQuestionClicked: false, // 标记是否点击了添加小题按钮
      });
    }

    return newQuestions;
  };

  // 当短填空配置变化时，根据配置生成或更新题目
  useEffect(() => {
    // 清空现有的题目和小题
    setQuestions([]);
    setSubQuestions([]);

    // 生成新的题目
    let allQuestions = [];
    shortFillConfig.forEach((config) => {
      const newQuestions = generateQuestions(config);
      allQuestions = [...allQuestions, ...newQuestions];
    });

    allQuestions.sort((a, b) => a.questionNumber - b.questionNumber);
    setQuestions(allQuestions);
  }, [shortFillConfig, setQuestions, setSubQuestions]);

  return (
    <>
      {/* 短填空配置区域 */}
      {shortFillConfig.map((config) => (
        <div
          key={config.id}
          style={{ marginBottom: 16, position: 'relative' }}
        >
          {/* 移除按钮（只有配置数量大于1时显示） */}
          {shortFillConfig.length > 1 && (
            <Button
              type="text"
              danger
              size="small"
              onClick={() => removeShortFillConfig(config.id)}
              style={{ position: 'absolute', right: 0, top: 0 }}
            >
              ×
            </Button>
          )}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <span>从</span>
            <InputNumber
              value={config.startQuestion}
              onChange={(value) =>
                handleShortFillConfigChange(
                  config.id,
                  'startQuestion',
                  value
                )
              }
              min={1}
              style={{ width: 80 }}
              placeholder="开始题"
            />
            <span>题到</span>
            <InputNumber
              value={config.endQuestion}
              onChange={(value) =>
                handleShortFillConfigChange(
                  config.id,
                  'endQuestion',
                  value
                )
              }
              min={1}
              style={{ width: 80 }}
              placeholder="结束题"
            />
            <span>题，每空</span>
            <InputNumber
              value={config.pointsPerBlank}
              onChange={(value) =>
                handleShortFillConfigChange(
                  config.id,
                  'pointsPerBlank',
                  value
                )
              }
              min={0}
              style={{ width: 80 }}
              placeholder="分数"
            />
            <span>分，每题</span>
            <InputNumber
              value={config.blanksPerQuestion}
              onChange={(value) =>
                handleShortFillConfigChange(
                  config.id,
                  'blanksPerQuestion',
                  value
                )
              }
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

      {/* 生成的题目列表 */}
      {questions.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          {questions.map((question) => (
            <div key={question.id} style={{ marginBottom: 8 }}>
              <Collapse defaultActiveKey={['1']} collapsible="icon">
                <Panel
                  header={
                    question.isAddSubQuestionClicked ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                        }}
                      >
                        <span>题{question.questionNumber}</span>
                        {subQuestions.filter(
                          (sub) => sub.questionId === question.id
                        ).length > 0 && (
                          <span>
                            {' '}
                            总分
                            {subQuestions
                              .filter(
                                (sub) =>
                                  sub.questionId === question.id
                              )
                              .reduce((total, sub) => {
                                return (
                                  total +
                                  sub.pointsPerBlank * sub.totalBlanks
                                );
                              }, 0)}
                            分
                          </span>
                        )}
                      </div>
                    ) : (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                        }}
                      >
                        <span>
                          题{question.questionNumber} 共
                          {question.totalScore}分
                        </span>
                        <span>每空</span>
                        <InputNumber
                          min={1}
                          value={question.pointsPerBlank}
                          onChange={(value) =>
                            updateQuestion(
                              question.id,
                              'pointsPerBlank',
                              value
                            )
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
                              'blanksPerQuestion',
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
                  {!question.isAddSubQuestionClicked ? (
                    <div>
                      {Array.from(
                        { length: question.blanksPerQuestion },
                        (_, index) => (
                          <div
                            key={index}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              marginBottom: 8,
                            }}
                          >
                            <span>第 {index + 1} 空：</span>
                            <InputNumber
                              min={0}
                              value={
                                blankScores[
                                  `${question.id}_${index}`
                                ] || question.pointsPerBlank
                              }
                              onChange={(value) => {
                                // 更新空分数
                                setBlankScores((prev) => ({
                                  ...prev,
                                  [`${question.id}_${index}`]: value,
                                }));
                              }}
                              style={{ width: 80, marginLeft: 8 }}
                            />
                            <span style={{ marginLeft: 8 }}>分</span>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    subQuestions
                      .filter((sub) => sub.questionId === question.id)
                      .map((subQuestion, index) => (
                        <div
                          key={subQuestion.id}
                          style={{
                            marginBottom: 8,
                            border: '1px solid #f0f0f0',
                            padding: 8,
                            borderRadius: 4,
                          }}
                        >
                          <Collapse
                            collapsible="icon"
                            defaultActiveKey={['1']}
                          >
                            <Panel
                              header={
                                <div
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                  }}
                                >
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 8,
                                    }}
                                  >
                                    <span>({index + 1}) 共</span>
                                    <InputNumber
                                      min={1}
                                      value={subQuestion.totalBlanks}
                                      onChange={(value) => {
                                        // 更新小题的空数量
                                        setSubQuestions(
                                          subQuestions.map((sq) => {
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
                                              updatedSq.totalBlanks = targetLength;
                                              updatedSq.blanks = newBlanks;
                                              return updatedSq;
                                            }
                                            return sq;
                                          })
                                        );
                                      }}
                                      style={{ width: 60 }}
                                    />
                                    <span>空 每空</span>
                                    <InputNumber
                                      min={0}
                                      value={
                                        subQuestion.pointsPerBlank
                                      }
                                      onChange={(value) => {
                                        // 更新小题的每空分数
                                        setSubQuestions(
                                          subQuestions.map((sq) => {
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
                                          })
                                        );
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
                                        subQuestion.id
                                      )
                                    }
                                    disabled={
                                      subQuestions.filter(
                                        (sq) =>
                                          sq.questionId ===
                                          subQuestion.questionId
                                      ).length <= 1
                                    }
                                  >
                                    删除
                                  </Button>
                                </div>
                              }
                              key="1"
                            >
                              {subQuestion.blanks &&
                                subQuestion.blanks.map(
                                  (blank, blankIndex) => (
                                    <div
                                      key={blank.id}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        marginBottom: 8,
                                      }}
                                    >
                                      <span>
                                        第 {blankIndex + 1} 空：
                                      </span>
                                      <InputNumber
                                        min={0}
                                        value={blank.points}
                                        onChange={(value) =>
                                          updateBlankPoints(
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
                                      <span style={{ marginLeft: 8 }}>
                                        分
                                      </span>
                                    </div>
                                  )
                                )}
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
          borderTop: '1px solid #f0f0f0',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <span>每行展示</span>
          <Select
            value={blanksPerLine}
            onChange={(value) => setBlanksPerLine(value)}
            style={{ width: 80, margin: '0 8px' }}
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
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Checkbox
              checked={showSubQuestionScore}
              onChange={(e) =>
                setShowSubQuestionScore(e.target.checked)
              }
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