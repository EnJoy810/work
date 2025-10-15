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
import { useMessageService } from "../../../components/common/message";
import ShortFillQuestionSection from "./ShortFillQuestionSection";
import LongFillQuestionSection from "./LongFillQuestionSection";
import { generateQuestionId, generateSectionId } from "../../../utils/tools";

/**
 * 生成空的唯一ID
 * @param {number} questionNumber - 题目编号
 * @param {number} blankIndex - 空的索引
 * @returns {string} 唯一的空ID
 */
const generateBlankId = (questionNumber, blankIndex) => {
  return `blank-${questionNumber}-${blankIndex}-${Date.now()}`;
};

const { TextArea } = Input;
const { Panel } = Collapse;

/**
 * 填空题添加/编辑弹窗组件 - 支持批量添加和分段管理
 *
 * @param {Object} props
 * @param {boolean} props.visible - 控制弹窗显示/隐藏
 * @param {Function} props.onCancel - 关闭弹窗回调函数
 * @param {Function} props.onSuccess - 添加/编辑成功后的回调函数
 * @param {Object} props.initialData - 编辑模式下的初始数据
 * @param {Array} props.existingQuestions - 已存在的题目数据，用于确定默认题号
 */
const BlankQuestionModal = ({
  visible,
  onCancel,
  onSuccess,
  initialData,
  existingQuestions = [],
}) => {
  // 每行填空题的高度为40px
  const LINE_HEIGHT = 40;

  // 判断当前是添加模式还是编辑模式
  // 使用!= null同时检查null和undefined
  const isEditMode = initialData != null;
  // 标记编辑模式下的初始数据是否已加载完成
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);

  const { showSuccess, showInfo } = useMessageService();

  // 内部状态管理
  // 大题题号和题目内容
  const [questionNumber, setQuestionNumber] = useState("一");

  // 大写数字映射
  const NUMBER_TO_CHINESE = [
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
    "十一",
    "十二",
    "十三",
    "十四",
    "十五",
    "十六",
    "十七",
    "十八",
    "十九",
    "二十",
  ];
  const [questionContent, setQuestionContent] = useState("");

  // 选择的填空类型：短填空或简答题
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

  // 简答题配置
  const [longFillConfig, setLongFillConfig] = useState([
    {
      id: 1,
      startQuestion: "1",
      endQuestion: "",
      pointsPerLine: "2",
      linesPerQuestion: "1",
    },
  ]);

  // 简答题生成的题目列表
  const [longQuestions, setLongQuestions] = useState([]);

  // 简答题行分数状态
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
      // 为每个题目生成对应的空数组
      const blanksArray = Array.from({ length: blanks }, (_, index) => ({
        id: generateBlankId(i, index),
        points: points,
      }));

      newQuestions.push({
        id: generateQuestionId(null, i),
        questionNumber: i,
        displayNumber: numberToChinese(i),
        pointsPerBlank: points,
        blanksPerQuestion: blanks,
        totalScore: points * blanks,
        isAddSubQuestionClicked: false, // 标记是否点击了添加小题按钮
        blanks: blanksArray, // 添加blanks数组，确保每空数据被正确生成
      });
    }

    return newQuestions;
  };

  // 当短填空配置变化时，根据配置生成或更新题目
  useEffect(() => {
    // 在编辑模式且初始数据加载完成前不执行此逻辑，确保初始数据不被覆盖
    // 初始数据加载完成后，允许用户通过修改segments来更新questions
    if (isEditMode && !isInitialDataLoaded) {
      return;
    }
    // 清空现有的题目和小题
    setQuestions([]);

    // 生成新的题目
    let allQuestions = [];
    shortFillConfig.forEach((config) => {
      const newQuestions = generateQuestions(config);
      allQuestions = [...allQuestions, ...newQuestions];
    });

    allQuestions.sort((a, b) => a.questionNumber - b.questionNumber);
    setQuestions(allQuestions);
  }, [shortFillConfig, isEditMode, isInitialDataLoaded]);

  // 重置表单
  const resetForm = () => {
    setQuestionNumber("一");
    setQuestionContent("");
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
  };

  // 处理initialData，实现数据回填
  useEffect(() => {
    console.log("处理initialData，实现数据回填", initialData);
    if (visible && initialData) {
      // 回填大题题号和题目内容
      setQuestionNumber(initialData.questionNumber || "一");
      setQuestionContent(initialData.content || "");
      setFillType(initialData.fillType || "short");
      if (initialData.fillType === "short") {
        // 短填空
        // 回填shortFillConfig数据
        if (
          initialData.shortFillConfig &&
          Array.isArray(initialData.shortFillConfig)
        ) {
          // 确保shortFillConfig格式包含id字段
          const configWithId = initialData.shortFillConfig.map(
            (config, index) => ({
              id: config.id || index + 1,
              startQuestion: config.startQuestion,
              endQuestion: config.endQuestion,
              pointsPerBlank: config.pointsPerBlank,
              blanksPerQuestion: config.blanksPerQuestion,
            })
          );
          setShortFillConfig(configWithId);
        }
        // 小题数据现在从questions中获取，不再需要单独的subQuestions状态
        setTimeout(() => {
          // 回填questions数据
          if (initialData.questions && Array.isArray(initialData.questions)) {
            setQuestions(initialData.originQuestions || initialData.questions);
          }
        }, 200);

        // 回填其他配置
        if (initialData.blanksPerLine) {
          setBlanksPerLine(initialData.blanksPerLine);
        }
      } else {
        // 回填简答题
        if (
          initialData.longFillConfig &&
          Array.isArray(initialData.longFillConfig)
        ) {
          // 确保longFillConfig格式包含id字段
          const configWithId = initialData.longFillConfig.map(
            (config, index) => ({
              id: config.id || index + 1,
              startQuestion: config.startQuestion,
              endQuestion: config.endQuestion,
              pointsPerLine: config.pointsPerLine,
              linesPerQuestion: config.linesPerQuestion,
            })
          );
          setLongFillConfig(configWithId);
        }
        // 小题数据现在从questions中获取，不再需要单独的subQuestions状态
        setTimeout(() => {
          // 回填questions数据
          if (initialData.questions && Array.isArray(initialData.questions)) {
            setLongQuestions(
              initialData.originQuestions || initialData.questions
            );
          }
        }, 200);
      }

      if (initialData.showSubQuestionScore !== undefined) {
        setShowSubQuestionScore(initialData.showSubQuestionScore);
      }
      // 标记初始数据已加载完成
      if (isEditMode) {
        setIsInitialDataLoaded(true);
      }
    } else if (visible) {
      // 如果是添加模式，确定默认题号为existingQuestions中大题题号的最大值加1
      let maxQuestionNumber = 0;
      let maxEndQuestion = 0;
      console.log("existingQuestions", existingQuestions);
      // 查找现有题目中大题题号的最大值和startQuestion的最大值
      if (Array.isArray(existingQuestions) && existingQuestions.length > 0) {
        existingQuestions.forEach((q) => {
          if (q.questionNumber) {
            // 转换中文数字为阿拉伯数字
            const numIndex = NUMBER_TO_CHINESE.indexOf(q.questionNumber);
            if (numIndex > maxQuestionNumber) {
              maxQuestionNumber = numIndex;
            }
          }
          // startQuestion最大值应该是所有endQuestion中最大值加1
          // 检查短填空的endQuestion
          if (q.shortFillConfig && Array.isArray(q.shortFillConfig)) {
            q.shortFillConfig.forEach((config) => {
              if (config.endQuestion) {
                const startNum = parseInt(config.endQuestion, 10);
                if (!isNaN(startNum) && startNum > maxEndQuestion) {
                  maxEndQuestion = startNum;
                }
              }
            });
          }

          // 检查简答题的endQuestion
          if (q.longFillConfig && Array.isArray(q.longFillConfig)) {
            q.longFillConfig.forEach((config) => {
              if (config.endQuestion) {
                const startNum = parseInt(config.endQuestion, 10);
                if (!isNaN(startNum) && startNum > maxEndQuestion) {
                  maxEndQuestion = startNum;
                }
              }
            });
          }
        });
      }

      // 设置默认题号为最大值加1对应的中文数字
      const defaultQuestionNumber =
        NUMBER_TO_CHINESE[Math.min(maxQuestionNumber + 1, 20)] || "一";

      setQuestionNumber(defaultQuestionNumber);
      setQuestionContent("");
      setFillType("short");

      // 设置默认的maxEndQuestion为最大值加1
      const defaultStartQuestion = (maxEndQuestion + 1).toString();

      // 设置短填空的startQuestion
      setShortFillConfig([
        {
          id: 1,
          startQuestion: defaultStartQuestion,
          endQuestion: "",
          pointsPerBlank: "2",
          blanksPerQuestion: "1",
        },
      ]);

      // 设置简答题的startQuestion为相同的值
      setLongFillConfig([
        {
          id: 1,
          startQuestion: defaultStartQuestion,
          endQuestion: "",
          pointsPerLine: "2",
          linesPerQuestion: "1",
        },
      ]);
    }
  }, [visible, initialData, isEditMode]);

  // 确认添加或编辑题目
  const handleSubmit = () => {
    console.log("确认添加或编辑题目 questions", questions);
    if (questions.length === 0 && longQuestions.length === 0) {
      showInfo("请先填写完整的分段信息以生成题目");
      return;
    }

    // 显示成功消息
    const totalCount =
      fillType === "short" ? questions.length : longQuestions.length;
    showSuccess(
      isEditMode
        ? `已成功编辑${totalCount}道填空题`
        : `已成功添加${totalCount}道填空题`
    );

    // 构建提交数据
    let submitData = {
      type: "blank", // 表示填空题
      fillType: fillType, // 填空类型：short或long
      content: questionContent, // 题目内容
      questionNumber: questionNumber,
      totalCount: totalCount,
      isEdit: isEditMode,
       sliceQuestion: false, // 初始未分页
    };

    // 根据填空类型添加对应的数据
    if (fillType === "short") {
      // 短填空数据
      submitData.shortFillConfig = shortFillConfig.map((config) => ({
        startQuestion: config.startQuestion,
        endQuestion: config.endQuestion,
        pointsPerBlank: config.pointsPerBlank,
        blanksPerQuestion: config.blanksPerQuestion,
      }));
      // 小题数据现在从questions中获取，不再需要单独的subQuestions状态
      submitData.blanksPerLine = blanksPerLine;
      submitData.showSubQuestionScore = showSubQuestionScore;
      // 短填空的总行数 = 总空数 / 每行空数，向上取整
      const totalBlanksPerQuestion = questions.reduce(
        (sum, q) => sum + q.blanksPerQuestion,
        0
      );
      let totalBlanks = 0;
      let totalScore = 0;

      // 整合循环，一次遍历同时计算总空数和总分
      questions.forEach((q) => {
        let subQTotalScore = 0; // 小题总分
        if (q.isAddSubQuestionClicked) {
          // 总空数的计算始终包含所有子题
          q.subQuestions.forEach((subQ) => {
            totalBlanks += subQ.totalBlanks;
          });

          // 分数计算根据是否为多选题决定
          if (q.isMultipleChoice && q.selectedBlanksCount !== undefined) {
            // 多选题只计算前selectedBlanksCount道题的分数
            const limitedSubQuestions = q.subQuestions.slice(
              0,
              q.selectedBlanksCount
            );
            console.log("limitedSubQuestions", limitedSubQuestions);
            limitedSubQuestions.forEach((subQ, index) => {
              if (subQ.blanks && Array.isArray(subQ.blanks)) {
                const subTotalScore = subQ.blanks.reduce(
                  (sum, blank) => sum + (blank.points || 0),
                  0
                );
                console.log("subTotalScore 多选题 小题总分", subTotalScore);
                subQTotalScore += subTotalScore; // question的总分
                q.totalScore = subQTotalScore; //question的总分
                q.subQuestions[index].totalScore = subTotalScore; //小题总分
                totalScore += subTotalScore; // 总分数
              }
            });
          } else {
            // 非多选题计算所有题的分数
            q.subQuestions.forEach((subQ) => {
              if (subQ.blanks && Array.isArray(subQ.blanks)) {
                const subTotalScore = subQ.blanks.reduce(
                  (sum, blank) => sum + (blank.points || 0),
                  0
                );
                console.log("subTotalScore 小题总分", subTotalScore);
                subQTotalScore += subTotalScore; // question的总分
                q.totalScore = subQTotalScore; //question的总分
                subQ.totalScore = subTotalScore; //小题总分
                totalScore += subTotalScore;
              }
            });
          }
        } else {
          // 计算总空数
          totalBlanks += q.blanksPerQuestion;

          // 计算总分
          if (q.blanks && Array.isArray(q.blanks)) {
            const subTotalScore = q.blanks.reduce(
              (sum, blank) => sum + (blank.points || 0),
              0
            );
            q.totalScore = subTotalScore; //小题总分
            totalScore += subTotalScore;
          }
        }
      });

      const totalLines = Math.ceil(totalBlanks / blanksPerLine);
      submitData.questions = questions;

      console.log(
        "totalLines 短填空带标题 总行数",
        totalLines,
        "空数",
        totalBlanks,
        "总分",
        totalScore
      );
      console.log("提交的数据", submitData);
      submitData.totalBlanksPerQuestion = totalBlanksPerQuestion;
      submitData.totalLines = totalLines;
      submitData.totalScore = totalScore;
    } else {
      // 简答题数据
      submitData.longFillConfig = longFillConfig.map((config) => ({
        startQuestion: config.startQuestion,
        endQuestion: config.endQuestion,
        pointsPerLine: config.pointsPerLine,
        linesPerQuestion: config.linesPerQuestion,
      }));
      submitData.showSubQuestionScore = showSubQuestionScore;
      console.log("longQuestions", longQuestions);
      // 简答题的总行数 = 题目数量 × 每道题行数
      let totalLines = 0;
      let totalScore = 0;
      longQuestions.forEach((q) => {
        // 小题
        if (q.isAddSubQuestionClicked) {
          let subTotalScore = 0; // 小题总分
          q.subQuestions.forEach((subQ) => {
            totalLines += subQ.totalLines;
            // 根据每行分数计算总分
            if (subQ.pointsPerLine !== undefined) {
              subQ.totalScore = subQ.pointsPerLine;
              subTotalScore += subQ.pointsPerLine;
              totalScore += subQ.pointsPerLine;
            }
            subQ.perQuestionRemindLines = undefined
            subQ.perQuestionSplitLines = undefined
          });
          q.totalScore = subTotalScore; //question的总分
        } else {
          totalLines += q.linesPerQuestion;
          // 根据每行分数计算总分
          if (q.pointsPerLine !== undefined) {
            q.totalScore = q.pointsPerLine;
            totalScore += q.pointsPerLine;
          }
        }
      });
      // console.log("totalLines 总行数", totalLines);
      submitData.totalLines = totalLines;
      submitData.totalScore = totalScore;
      submitData.questions = longQuestions;
    }
    console.log("提交的数据", submitData);

    // 如果是编辑模式，保留原有sectionId
    if (isEditMode && initialData && initialData.sectionId) {
      submitData = { ...initialData, ...submitData };
    } else {
      // 如果是非编辑模式，为大题添加唯一ID，用于标识题目的唯一性
      submitData.sectionId = generateSectionId();
    }
    console.log("submitData", submitData);
    // 调用成功回调，传递添加/编辑的题目信息
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
      title={isEditMode ? "编辑填空题" : "添加填空题"}
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
              <Select
                value={questionNumber}
                onChange={handleNumberChange}
                style={{
                  flex: 1,
                }}
              >
                {NUMBER_TO_CHINESE.slice(1).map((num) => (
                  <Select.Option key={num} value={num}>
                    {num}
                  </Select.Option>
                ))}
              </Select>
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
                  questions={questions}
                  onQuestionsChange={({ questions: updatedQuestions }) => {
                    setQuestions(updatedQuestions);
                  }}
                  onConfigChange={(type, data) => {
                    if (type === "update") {
                      const { id, field, value } = data;
                      setShortFillConfig(
                        shortFillConfig.map((config) =>
                          config.id === id
                            ? { ...config, [field]: value }
                            : config
                        )
                      );
                    } else if (type === "remove") {
                      setShortFillConfig(
                        shortFillConfig.filter(
                          (config) => config.id !== data.id
                        )
                      );
                    }
                  }}
                  blanksPerLine={blanksPerLine}
                  setBlanksPerLine={setBlanksPerLine}
                  showSubQuestionScore={showSubQuestionScore}
                  setShowSubQuestionScore={setShowSubQuestionScore}
                />
              </>
            ),
          },
          {
            key: "long",
            label: "简答题",
            children: (
              <LongFillQuestionSection
                longFillConfig={longFillConfig}
                setLongFillConfig={setLongFillConfig}
                longQuestions={longQuestions}
                setLongQuestions={setLongQuestions}
                longLineScores={longLineScores}
                setLongLineScores={setLongLineScores}
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
