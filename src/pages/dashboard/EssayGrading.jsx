import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Slider,
  Badge,
  Avatar,
  Tag,
  Divider,
  Radio,
} from "antd";
import {
  LeftOutlined,
  RightOutlined,
  CheckCircleOutlined,
  EditOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";
import "./styles/EssayGrading.css";

/**
 * 作文批改页面
 * 布局为左中右三部分，左右固定宽度，中间自适应
 */
const EssayGrading = () => {
  const [searchParams] = useSearchParams();
  const _gradingId = searchParams.get("grading_id"); // 未来将用于从API获取数据

  // 模拟学生数据
  const [students, _setStudents] = useState([
    {
      id: "S001",
      name: "张明",
      score: 85,
      status: "AI批改",
      statusType: "success",
      essay: {
        title: "春天，是希望的季节",
        content:
          '春天，是希望的季节。当第一缕春风吹过大地，万物开始复苏，我总是被这种生命力所感动。记得小时候，每到春天，爷爷总会带我到村子后面的小山上看桃花。那里有一片桃林，每到三月，粉红的花朵满树绽放，远远望去，就像天边的彩霞。爷爷说："春天会教我们希望，无论冬天多么寒冷，春天总会如期而至。"现在想来，爷爷的话蕴含着深刻的人生哲理。人生路上，我们都会遇到各种困难挫折，就像严寒的冬天。但是，只要我们心中怀着希望，相信春天一定会来临，就能够战胜一切困难。春天不仅是一个季节，更是一种精神。它告诉我们，生命是顽强的，希望是永恒的。在这个春天里，我要像那些破土而出的新芽一样，勇敢地面对生活的挑战，努力成长，绽放属于自己的光彩。',
      },
    },
    {
      id: "S002",
      name: "李华",
      score: 92,
      status: "手动批改",
      statusType: "processing",
      essay: {
        title: "秋天的收获",
        content:
          '秋天是收获的季节。田野里，金黄色的稻浪随风起伏，农民伯伯的脸上洋溢着丰收的喜悦。我最喜欢秋天的果园，红彤彤的苹果、黄澄澄的梨、紫莹莹的葡萄，让人看了就忍不住流口水。妈妈常说："一分耕耘，一分收获。"这句话我一直铭记在心。学习就像种地一样，只有付出辛勤的汗水，才能收获丰硕的果实。每当我在学习中遇到困难想要放弃时，就会想起秋天的果园，想起农民伯伯的辛苦付出。于是，我又重新振作起来，继续努力学习。我相信，只要我坚持不懈，总有一天会收获属于自己的成功。',
      },
    },
    {
      id: "S003",
      name: "王芳",
      score: 78,
      status: "AI待批",
      statusType: "warning",
      essay: {
        title: "冬天的温暖",
        content:
          "冬天虽然寒冷，却充满了温暖。记得去年冬天，我得了重感冒，躺在床上起不来。妈妈每天都给我熬姜茶，陪我打针吃药，细心地照顾我。爸爸也特意推掉了所有的应酬，在家陪我聊天，给我讲故事。同学们知道我生病了，纷纷打电话问候我，还轮流到家里给我补课。在大家的关心和照顾下，我的病很快就好了。虽然窗外飘着鹅毛大雪，但是我的心里却像春天一样温暖。这件事让我明白了，爱就像冬天里的阳光，能够驱散寒冷，带来温暖。只要我们心中充满爱，冬天也会变得温暖如春。",
      },
    },
  ]);

  // 当前选中的学生
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0);
  const currentStudent = students[currentStudentIndex];

  // 分割句子
  const [sentences, setSentences] = useState([]);
  const [highlightedSentenceIndex, setHighlightedSentenceIndex] = useState(-1);

  // 评分相关
  const [score, setScore] = useState(currentStudent?.score || 0);
  const [evaluation, _setEvaluation] = useState(
    '文章紧扣"春天与希望"的主题，内容切题，主旨明确。'
  );

  // 可用的颜色池
  const availableColors = ["blue", "green", "purple", "orange", "red"];

  // 随机选择颜色的函数，尽量避免重复
  const getRandomColor = (usedColors = []) => {
    // 找出尚未使用的颜色
    const unusedColors = availableColors.filter(
      (color) => !usedColors.includes(color)
    );

    // 如果还有未使用的颜色，从中随机选择
    if (unusedColors.length > 0) {
      return unusedColors[Math.floor(Math.random() * unusedColors.length)];
    }

    // 如果所有颜色都用过了，从所有可用颜色中随机选择
    return availableColors[Math.floor(Math.random() * availableColors.length)];
  };

  // 句子评语数据结构 - 只包含有评语的句子，包含原句和评语
  const generateInitialComments = () => {
    const commentsData = [
      {
        sentenceIndex: 0,
        originalSentence: "春天，是希望的季节。",
        comment: "开头点题，语言优美，比喻恰当",
      },
      {
        sentenceIndex: 2,
        originalSentence:
          "记得小时候，每到春天，爷爷总会带我到村子后面的小山上看桃花。",
        comment: "描述生动，画面感强",
      },
      {
        sentenceIndex: 4,
        originalSentence:
          '爷爷说："春天会教我们希望，无论冬天多么寒冷，春天总会如期而至。"',
        comment: "引用爷爷的话，增加了文章的深度",
      },
      {
        sentenceIndex: 7,
        originalSentence:
          "人生路上，我们都会遇到各种困难挫折，就像严寒的冬天。",
        comment: "对比手法运用得当，突出主题",
      },
    ];

    // 为每个评论随机分配颜色，尽量避免重复
    const usedColors = [];
    return commentsData.map((comment) => {
      const color = getRandomColor(usedColors);
      usedColors.push(color);
      return { ...comment, color };
    });
  };

  // 初始化带有随机颜色的句子评语
  const [sentenceComments, _setSentenceComments] = useState(
    generateInitialComments()
  );

  // 获取句子的颜色
  const getSentenceColor = (index) => {
    const comment = sentenceComments.find(
      (item) => item.sentenceIndex === index
    );
    return comment ? comment.color : "";
  };

  const essayContentRef = useRef(null);

  // 分割句子函数
  const splitSentences = (text) => {
    // 使用正则表达式分割句子，识别句号、问号、感叹号
    const regex = /([。！？])/;
    const result = [];
    let remainingText = text;

    while (remainingText) {
      const match = remainingText.match(regex);
      if (match) {
        const index = match.index;
        const sentence = remainingText.slice(0, index + 1);
        result.push(sentence);
        remainingText = remainingText.slice(index + 1).trim();
      } else {
        if (remainingText.trim()) {
          result.push(remainingText.trim());
        }
        break;
      }
    }

    return result;
  };

  // 当选中学生变化时，更新句子和评分
  useEffect(() => {
    if (currentStudent?.essay?.content) {
      const split = splitSentences(currentStudent.essay.content);
      setSentences(split);
      setScore(currentStudent.score);
      setHighlightedSentenceIndex(-1);
    }
  }, [currentStudent]);

  // 处理句子高亮
  const handleSentenceMouseEnter = (index) => {
    setHighlightedSentenceIndex(index);
  };

  // 处理句子高亮取消
  const handleSentenceMouseLeave = () => {
    setHighlightedSentenceIndex(-1);
  };

  // 获取颜色值
  const getColorValue = (colorName) => {
    const colorMap = {
      blue: "#1890ff",
      green: "#52c41a",
      purple: "#722ed1",
      orange: "#fa8c16",
      red: "#f5222d",
      default: "#d9d9d9",
    };
    return colorMap[colorName] || colorMap.default;
  };

  // 切换学生
  const handlePrevStudent = () => {
    if (currentStudentIndex > 0) {
      setCurrentStudentIndex(currentStudentIndex - 1);
    }
  };

  const handleNextStudent = () => {
    if (currentStudentIndex < students.length - 1) {
      setCurrentStudentIndex(currentStudentIndex + 1);
    }
  };

  return (
    <div className="essay-grading-container">
      <div className="essay-grading-content">
        {/* 左侧：学生信息 */}
        <div className="left-panel">
          <div className="student-navigation">
            <h3>
              <UserSwitchOutlined style={{ marginRight: "4px" }} /> 学生导航
            </h3>
            <div className="navigation-controls">
              <Button
                icon={<LeftOutlined />}
                onClick={handlePrevStudent}
                disabled={currentStudentIndex === 0}
              />
              <span>
                {currentStudentIndex + 1}/{students.length}
              </span>
              <Button
                icon={<RightOutlined />}
                onClick={handleNextStudent}
                disabled={currentStudentIndex === students.length - 1}
              />
            </div>
          </div>
          <div className="student-list">
            {students.map((student, index) => (
              <div
                key={student.id}
                className={`student-item ${
                  index === currentStudentIndex ? "active" : ""
                }`}
                onClick={() => setCurrentStudentIndex(index)}
              >
                <div className="student-info">
                  <div className="student-name">{student.name}</div>
                  <div className="student-id">学号：{student.id}</div>
                </div>
                <div className="student-score-section">
                  <div className="student-score">{student.score}分</div>
                  <Badge
                    status={
                      student.statusType === "success"
                        ? "success"
                        : student.statusType === "processing"
                        ? "processing"
                        : "warning"
                    }
                    text={student.status}
                    className="status-badge"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 中间：作文内容 */}
        <div className="center-panel" ref={essayContentRef}>
          <div className="essay-grading-header">
            <h3>作文批改</h3>
            <Button type="default" onClick={() => (window.location.href = "/")}>
              返回首页
            </Button>
          </div>
          <div className="essay-card">
            <h3 className="essay-title">{currentStudent?.essay?.title}</h3>
            <div className="student-info-header">
              <div>姓名：{currentStudent?.name}</div>
              <div>学号：{currentStudent?.id}</div>
            </div>
            <Divider />
            <div className="essay-content">
              {sentences.map((sentence, index) => {
                const color = getSentenceColor(index);
                const hasComment = color !== "";
                return (
                  <span
                    key={index}
                    className={`essay-sentence 
                      ${
                        index === highlightedSentenceIndex || hasComment
                          ? "highlighted"
                          : ""
                      } 
                      ${hasComment ? `comment-${color}` : ""}`}
                    style={
                      hasComment
                        ? {
                            borderBottom: `2px solid ${getColorValue(color)}`,
                            cursor: "pointer",
                          }
                        : {}
                    }
                    onMouseEnter={() => handleSentenceMouseEnter(index)}
                    onMouseLeave={handleSentenceMouseLeave}
                  >
                    {sentence}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* 右侧：评分内容 */}
        <div className="right-panel">
          <div className="score-section">
            <h3>得分</h3>
            <div className="score-display">
              <span className="score-number">{score}</span>
              <span className="score-max">/ 100</span>
            </div>
          </div>

          <div className="sentence-comments-section">
            <h4>按句评语</h4>
            <div className="sentence-comments">
              {sentenceComments.map((comment, commentIndex) => (
                <div
                  key={commentIndex}
                  className={`comment-item  comment-${comment.color}`}
                  style={{
                    borderLeft: `4px solid ${getColorValue(comment.color)}`,
                  }}
                >
                  <div className="comment-header">
                    <Tag color={comment.color}>带评语</Tag>
                    <div className="comment-icons">
                      <Badge dot>
                        <span>AI</span>
                      </Badge>
                    </div>
                  </div>
                  <div className="original-sentence">
                    {comment.originalSentence}
                  </div>
                  <div className="comment-content">{comment.comment}</div>
                  {comment.sentenceIndex === highlightedSentenceIndex && (
                    <div className="improvement-suggestion">
                      <h5>建议修改：</h5>
                      <p>段落一下面有冗余的感叹号，节省一点提问空间</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Divider />

          <div className="evaluation-section">
            <h4>多维度评价</h4>
            <div className="evaluation-content">{evaluation}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EssayGrading;
