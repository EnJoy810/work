import { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Tabs,
  Collapse,
  InputNumber,
  Button,
  Select,
  Checkbox,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useMessageService } from "../../components/common/message";
import ShortFillQuestionSection from "./components/ShortFillQuestionSection";
import LongFillQuestionSection from "./components/LongFillQuestionSection";

const { TextArea } = Input;
const { Panel } = Collapse;

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

  // 选择的填空类型：短填空或长填空
  const [fillType, setFillType] = useState("short");

  // 每行显示的空数
  const [blanksPerLine, setBlanksPerLine] = useState(4);

  // 是否显示小题分数
  const [showSubQuestionScore, setShowSubQuestionScore] = useState(false);

  // 短填空配置
  const [shortFillConfig, setShortFillConfig] = useState([
    {
      id: 1,
      startQuestion: "1",
      endQuestion: "",
      pointsPerBlank: "2",
      blanksPerQuestion: "1",
    },
  ]);

  // 生成的题目列表
  const [questions, setQuestions] = useState([]);

  // 小题配置列表
  const [subQuestions, setSubQuestions] = useState([]);
  const [blankScores, setBlankScores] = useState({}); // 存储每空分数的状态

  // 长填空配置
  const [longFillConfig, setLongFillConfig] = useState([
    {
      id: 1,
      startQuestion: "1",
      endQuestion: "",
      pointsPerLine: "2",
      linesPerQuestion: "1",
    },
  ]);
  
  // 长填空生成的题目列表
  const [longQuestions, setLongQuestions] = useState([]);
  
  // 长填空小题配置列表
  const [longSubQuestions, setLongSubQuestions] = useState([]);
  const [longLineScores, setLongLineScores] = useState({}); // 存储每行分数的状态

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

  // 处理短填空配置变化
  const handleShortFillConfigChange = (id, field, value) => {
    const newConfig = shortFillConfig.map((config) =>
      config.id === id ? { ...config, [field]: value } : config
    );
    setShortFillConfig(newConfig);
  };

  // 添加新的长填空配置
  const addLongFillConfig = () => {
    const maxId = longFillConfig.length > 0 ? Math.max(...longFillConfig.map(config => config.id)) : 0;
    const newConfig = {
      id: maxId + 1,
      startQuestion: '',
      endQuestion: '',
      pointsPerLine: '2',
      linesPerQuestion: '1'
    };
    setLongFillConfig([...longFillConfig, newConfig]);
  };

  // 批量生成题目
  const generateQuestions = (config) => {
    const { startQuestion, endQuestion, pointsPerBlank, blanksPerQuestion } =
      config;

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
        displayNumber: numberToChinese(i),
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
  }, [shortFillConfig]);

  // 重置表单
  const resetForm = () => {
    setQuestionNumber("一");
    setQuestionContent("填空题");
    setShortFillConfig([
      {
        id: 1,
        startQuestion: "1",
        endQuestion: "",
        pointsPerBlank: "2",
        blanksPerQuestion: "1",
      },
    ]);
    setQuestions([]);
    setSubQuestions([]);
  };

  // 确认添加题目
  const handleSubmit = () => {
    if (questions.length === 0 && longQuestions.length === 0) {
      showInfo("请先填写完整的分段信息以生成题目");
      return;
    }

    // 显示成功消息
    const totalCount = fillType === 'short' ? questions.length : longQuestions.length;
    showSuccess(`已成功添加${totalCount}道填空题`);

    // 构建提交数据
    const submitData = {
      type: "blank", // 表示填空题
      fillType: fillType, // 填空类型：short或long
      content: questionContent, // 题目内容
      questionNumber: questionNumber,
      totalCount: totalCount,
    };

    // 根据填空类型添加对应的数据
    if (fillType === 'short') {
      // 短填空数据
      submitData.questionNumbers = questions.map((q) => q.questionNumber);
      submitData.startQuestion = questions.length > 0 ? questions[0].questionNumber : null;
      submitData.endQuestion = questions.length > 0 ? questions[questions.length - 1].questionNumber : null;
      submitData.shortFillConfig = shortFillConfig.map((config) => ({
        startQuestion: config.startQuestion,
        endQuestion: config.endQuestion,
        pointsPerBlank: config.pointsPerBlank,
        blanksPerQuestion: config.blanksPerQuestion,
      }));
      submitData.subQuestions = subQuestions;
      submitData.blankScores = blankScores;
      submitData.blanksPerLine = blanksPerLine;
      submitData.showSubQuestionScore = showSubQuestionScore;
    } else {
      // 长填空数据
      submitData.questionNumbers = longQuestions.map((q) => q.questionNumber);
      submitData.startQuestion = longQuestions.length > 0 ? longQuestions[0].questionNumber : null;
      submitData.endQuestion = longQuestions.length > 0 ? longQuestions[longQuestions.length - 1].questionNumber : null;
      submitData.longFillConfig = longFillConfig.map((config) => ({
        startQuestion: config.startQuestion,
        endQuestion: config.endQuestion,
        pointsPerLine: config.pointsPerLine,
        linesPerQuestion: config.linesPerQuestion,
      }));
      submitData.subQuestions = longSubQuestions;
      submitData.lineScores = longLineScores;
      submitData.linesPerLine = blanksPerLine; // 复用相同的设置
      submitData.showSubQuestionScore = showSubQuestionScore;
    }
    // console.log("submitData", submitData);

    // 调用成功回调，传递添加的题目信息
    if (onSuccess) {
      onSuccess(submitData);
    }

    // 重置状态
    resetForm();

    // 关闭弹窗
    if (onCancel) {
      onCancel();
    }
  };

  // 表格列定义已移除，改用折叠面板展示题目信息

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
                    {[
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
                      "十一",
                      "十二",
                      "十三",
                      "十四",
                      "十五",
                      "十六",
                      "十七",
                      "十八",
                      "十九",
                      "二十"
                    ].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
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

      <Tabs
        activeKey={fillType}
        onChange={(key) => setFillType(key)}
        items={[
          {
            key: "short",
            label: "短填空",
            children: (
              <>
                <ShortFillQuestionSection
                  shortFillConfig={shortFillConfig}
                  setShortFillConfig={setShortFillConfig}
                  questions={questions}
                  setQuestions={setQuestions}
                  subQuestions={subQuestions}
                  setSubQuestions={setSubQuestions}
                  blankScores={blankScores}
                  setBlankScores={setBlankScores}
                  blanksPerLine={blanksPerLine}
                  setBlanksPerLine={setBlanksPerLine}
                  showSubQuestionScore={showSubQuestionScore}
                  setShowSubQuestionScore={setShowSubQuestionScore}
                  handleShortFillConfigChange={handleShortFillConfigChange}
                />
              </>
            ),
          },
          {
            key: "long",
            label: "长填空",
            children: (
              <LongFillQuestionSection
                longFillConfig={longFillConfig}
                setLongFillConfig={setLongFillConfig}
                longQuestions={longQuestions}
                setLongQuestions={setLongQuestions}
                longSubQuestions={longSubQuestions}
                setLongSubQuestions={setLongSubQuestions}
                longLineScores={longLineScores}
                setLongLineScores={setLongLineScores}
                blanksPerLine={blanksPerLine}
                setBlanksPerLine={setBlanksPerLine}
                showSubQuestionScore={showSubQuestionScore}
                setShowSubQuestionScore={setShowSubQuestionScore}
              />
            ),
          },
        ]}
      />
    </Modal>
  );
};

export default BlankQuestionModal;
