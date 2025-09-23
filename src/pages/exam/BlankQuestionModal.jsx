import { Modal, Input, InputNumber, Button, Table } from "antd";
import { useState, useEffect } from "react";
import { useMessageService } from "../../components/common/message";

/**
 * 填空题添加弹窗组件 - 支持批量添加和分段管理
 *
 * @param {Object} props
 * @param {boolean} props.visible - 控制弹窗显示/隐藏
 * @param {Function} props.onCancel - 关闭弹窗回调函数
 * @param {Function} props.onSuccess - 添加成功后的回调函数
 */
const BlankQuestionModal = ({ visible, onCancel, onSuccess }) => {
  const { showSuccess, showInfo } = useMessageService();

  // 内部状态管理
  // 大题题号和题目内容
  const [questionNumber, setQuestionNumber] = useState("一");
  const [questionContent, setQuestionContent] = useState("填空题");

  // 分段配置列表，每段包含起始题、结束题、分数
  const [segments, setSegments] = useState([
    {
      id: 1,
      startQuestion: "1",
      endQuestion: "",
      score: "2",
    },
  ]);

  // 生成的题目列表
  const [questions, setQuestions] = useState([]);

  // 生成大写的一到二十选项
  const numberToChinese = (num) => {
    const chineseNumbers = [
      "",
      "一",
      "二",
      "三",
      "四",
      "五",
      "六",
      "七",
      "八",
      "九",
      "十",
    ];
    if (num <= 10) return chineseNumbers[num];
    if (num <= 20)
      return chineseNumbers[Math.floor(num / 10)] + chineseNumbers[num % 10];
    return num.toString();
  };

  // 处理题号变更
  const handleNumberChange = (value) => {
    setQuestionNumber(value);
  };

  // 处理题目内容变更
  const handleContentChange = (e) => {
    setQuestionContent(e.target.value);
  };

  // 处理分段输入变更
  const handleSegmentChange = (id, field, value) => {
    setSegments(
      segments.map((segment) =>
        segment.id === id ? { ...segment, [field]: value } : segment
      )
    );
  };

  // 添加新的分段
  const addSegment = () => {
    const newId = Math.max(...segments.map((s) => s.id), 0) + 1;
    const newQuestion = 
      Math.max(
        ...segments.map((s) => s.startQuestion),
        ...segments.map((s) => s.endQuestion),
        0
      ) + 1;
    setSegments([
      ...segments,
      {
        id: newId,
        startQuestion: newQuestion.toString(),
        endQuestion: "",
        score: "2",
      },
    ]);
  };

  // 移除分段
  const removeSegment = (id) => {
    if (segments.length <= 1) {
      showInfo("至少保留一个分段");
      return;
    }
    
    // 找到要删除的分段
    const segmentToRemove = segments.find(segment => segment.id === id);
    
    // 如果找到了该分段，同时删除与之关联的题目
    if (segmentToRemove) {
      // 删除分段
      setSegments(segments.filter((segment) => segment.id !== id));
      
      // 删除该分段对应的所有题目
      setQuestions(questions.filter(question => {
        // 题目ID格式为"分段ID-题号"，所以我们可以通过检查ID前缀来判断是否属于该分段
        return !question.id.startsWith(`${id}-`);
      }));
    }
  };

  // 批量生成题目
  const generateQuestions = (segment) => {
    const { startQuestion, endQuestion, score } = segment;

    // 验证输入是否完整
    if (!startQuestion || !endQuestion || !score) {
      return [];
    }

    const start = parseInt(startQuestion);
    const end = parseInt(endQuestion);
    const scoreNum = parseInt(score);

    // 验证输入是否有效
    if (
      isNaN(start) ||
      isNaN(end) ||
      isNaN(scoreNum) ||
      start > end
    ) {
      return [];
    }

    // 生成题目
    const newQuestions = [];
    for (let i = start; i <= end; i++) {
      newQuestions.push({
        id: `${segment.id}-${i}`,
        questionNumber: i,
        displayNumber: numberToChinese(i),
        score: scoreNum,
      });
    }

    return newQuestions;
  };

  // 当分段数据变化时，根据segments中的题号范围批量修改questions中对应题号的值
  useEffect(() => {
    // 如果questions数组为空，直接使用生成的数据初始化
    if (questions.length === 0) {
      let allQuestions = [];
      segments.forEach((segment) => {
        const newQuestions = generateQuestions(segment);
        allQuestions = [...allQuestions, ...newQuestions];
      });
      allQuestions.sort((a, b) => a.questionNumber - b.questionNumber);
      setQuestions(allQuestions);
    } else {
      // 始终处理更新，无论是修改了分数还是题号范围
      const updatedQuestions = [...questions];

      segments.forEach((segment) => {
        const { startQuestion, endQuestion, score } = segment;

        // 验证输入是否完整和有效
        if (!startQuestion || !endQuestion) {
          return;
        }

        const start = parseInt(startQuestion);
        const end = parseInt(endQuestion);

        if (isNaN(start) || isNaN(end) || start > end) {
          return;
        }

        // 更新分数
        for (let i = 0; i < updatedQuestions.length; i++) {
          const question = updatedQuestions[i];
          if (
            question.questionNumber >= start &&
            question.questionNumber <= end
          ) {
            if (score) {
              updatedQuestions[i] = {
                ...question,
                score: parseInt(score),
              };
            }
          }
        }
      });

      // 处理可能新增的题目（当修改了题号范围时）
      let allQuestionsMap = new Map();
      segments.forEach((segment) => {
        const newQuestions = generateQuestions(segment);
        newQuestions.forEach((question) => {
          allQuestionsMap.set(question.id, question);
        });
      });

      // 检查是否有新添加的题目需要插入
      const existingIds = new Set(updatedQuestions.map((q) => q.id));
      const newQuestionsToAdd = [];
      allQuestionsMap.forEach((question, id) => {
        if (!existingIds.has(id)) {
          newQuestionsToAdd.push(question);
        }
      });

      // 合并并排序
      const finalQuestions = [...updatedQuestions, ...newQuestionsToAdd];
      finalQuestions.sort((a, b) => a.questionNumber - b.questionNumber);

      setQuestions(finalQuestions);
    }
  }, [segments]);

  // 重置表单
  const resetForm = () => {
    setQuestionNumber("一");
    setQuestionContent("填空题");
    setSegments([
      {
        id: 1,
        startQuestion: "1",
        endQuestion: "",
        score: "2",
      },
    ]);
    setQuestions([]);
  };

  // 确认添加题目
  const handleSubmit = () => {
    if (questions.length === 0) {
      showInfo("请先填写完整的分段信息以生成题目");
      return;
    }

    // 显示成功消息
    showSuccess(`已成功添加${questions.length}道填空题`);

    // 调用成功回调，传递添加的题目信息
    if (onSuccess) {
      onSuccess({
        questions: questions,
        totalCount: questions.length,
        questionNumber: questionNumber,
        questionContent: questionContent,
      });
    }

    // 重置状态
    resetForm();

    // 关闭弹窗
    if (onCancel) {
      onCancel();
    }
  };

  // 表格列定义
  const columns = [
    {
      title: "题号",
      dataIndex: "displayNumber",
      key: "displayNumber",
    },
    {
      title: "分数",
      dataIndex: "score",
      key: "score",
    },
  ];

  return (
    <Modal
      title="添加填空题"
      open={visible}
      onOk={handleSubmit}
      onCancel={() => {
        resetForm();
        if (onCancel) onCancel();
      }}
      okText="确定"
      cancelText="取消"
      width={800}
    >
      {/* 大题题号和题目输入区域 */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <label style={{ minWidth: "80px" }}>大题题号</label>
              <select
                value={questionNumber}
                onChange={(e) => handleNumberChange(e.target.value)}
                style={{
                  flex: 1,
                  padding: "4px 8px",
                  border: "1px solid #d9d9d9",
                  borderRadius: "4px",
                }}
              >
                {["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十"].map((num) => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ flex: 3 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <label style={{ minWidth: "80px" }}>题目内容</label>
              <Input
                value={questionContent}
                onChange={handleContentChange}
                placeholder="请输入题目内容"
                style={{ flex: 1 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 分段输入区域 */}
      {segments.map((segment) => (
        <div
          key={segment.id}
          style={{ marginBottom: 16, position: "relative" }}
        >
          {/* 移除按钮（只有分段数量大于1时显示） */}
          {segments.length > 1 && (
            <Button
              type="text"
              danger
              size="small"
              onClick={() => removeSegment(segment.id)}
              style={{ position: "absolute", right: 0, top: 0 }}
            >
              ×
            </Button>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span>从</span>
            <InputNumber
              value={segment.startQuestion}
              onChange={(value) =>
                handleSegmentChange(segment.id, "startQuestion", value)
              }
              min={1}
              style={{ width: 80 }}
              placeholder="起始题"
            />
            <span>题到</span>
            <InputNumber
              value={segment.endQuestion}
              onChange={(value) =>
                handleSegmentChange(segment.id, "endQuestion", value)
              }
              min={1}
              style={{ width: 80 }}
              placeholder="结束题"
            />
            <span>题,每题</span>
            <InputNumber
              value={segment.score}
              onChange={(value) =>
                handleSegmentChange(segment.id, "score", value)
              }
              min={0}
              style={{ width: 80 }}
              placeholder="分数"
            />
            <span>分</span>
          </div>
        </div>
      ))}

      {/* 添加分段按钮 */}
      <Button type="link" onClick={addSegment} style={{ marginBottom: 16 }}>
        + 分段添加小题
      </Button>

      {/* 生成的题目列表 */}
      {questions.length > 0 && (
        <Table
          dataSource={questions}
          columns={columns}
          pagination={false}
          rowKey="id"
          size="small"
          style={{ maxHeight: 400, overflow: "auto" }}
        />
      )}
    </Modal>
  );
};

export default BlankQuestionModal;