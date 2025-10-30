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
  Modal,
  message,
} from "antd";
import {
  LeftOutlined,
  RightOutlined,
  CheckCircleOutlined,
  EditOutlined,
  UserSwitchOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";
import { getGradingResults, getEssayResult, alterSentenceFeedbacks } from "../../api/grading";
import "./styles/EssayGrading.css";

/**
 * 作文批改页面
 * 布局为左中右三部分，左右固定宽度，中间自适应
 */
const EssayGrading = () => {
  const [searchParams] = useSearchParams();
  const grading_id = searchParams.get("grading_id");
  
  // 保存从后端获取的 essay_result_id
  const [essayResultId, setEssayResultId] = useState(null);
  
  // 当前作文信息
  const [currentEssayTitle, setCurrentEssayTitle] = useState("作文标题");
  
  // 学生列表数据（从后端加载）
  const [students, setStudents] = useState([
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
  
  // 选中的句子状态
  const [selectedSentence, setSelectedSentence] = useState(null);
  const [selectedSentenceIndex, setSelectedSentenceIndex] = useState(-1);
  // 动画key，用于触发重新动画
  const [animationKey, setAnimationKey] = useState(0);
 
  // 评分相关
  const [score, setScore] = useState(currentStudent?.score || 0);
  const [evaluation, _setEvaluation] = useState(
    '文章紧扣"春天与希望"的主题，内容切题，主旨明确。'
  );

  // 可用的颜色池
  const availableColors = ["blue", "green", "purple", "orange", "red"];

  // 随机选择颜色的函数，尽量避免重复
  const _getRandomColor = (usedColors = []) => {
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

  // 为每个学生生成初始评语数据
  const generateInitialCommentsForStudent = (studentId) => {
    // 只有张明(S001)有初始评语
    if (studentId === "S001") {
      return [
        {
          sentenceIndex: 0,
          originalSentence: "春天，是希望的季节。",
          comment: "开头点题，语言优美，比喻恰当",
          color: "green",
        },
        {
          sentenceIndex: 2,
          originalSentence:
            "记得小时候，每到春天，爷爷总会带我到村子后面的小山上看桃花。",
          comment: "描述生动，画面感强",
          color: "blue",
        },
        {
          sentenceIndex: 4,
          originalSentence:
            '爷爷说："春天会教我们希望，无论冬天多么寒冷，春天总会如期而至。"',
          comment: "引用爷爷的话，增加了文章的深度",
          color: "purple",
        },
        {
          sentenceIndex: 7,
          originalSentence:
            "人生路上，我们都会遇到各种困难挫折，就像严寒的冬天。",
          comment: "对比手法运用得当，突出主题",
          color: "orange",
        },
      ];
    }
    // 其他学生暂无评语
    return [];
  };

  // 为每个学生存储独立的评语数据
  const [studentComments, setStudentComments] = useState({
    S001: generateInitialCommentsForStudent("S001"),
    S002: generateInitialCommentsForStudent("S002"),
    S003: generateInitialCommentsForStudent("S003"),
  });

  // 当前学生的评语（基于 studentNo）
  const sentenceComments = studentComments[currentStudent?.studentNo] || [];

  // 添加评语弹窗状态
  const [showAddComment, setShowAddComment] = useState(false);

  // 编辑评语状态
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingContent, setEditingContent] = useState("");

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

  // 加载批改结果列表（包含学生信息）
  const loadStudentList = async () => {
    if (!grading_id) {
      message.warning("缺少必要参数：grading_id");
      return;
    }

    try {
      const response = await getGradingResults({ grading_id });
      const resultList = response.data || [];
      
      if (resultList.length === 0) {
        message.warning("该批改会话暂无学生数据");
        setStudents([]);
        return;
      }

      // 转换学生数据格式
      const formattedStudents = resultList.map((result) => ({
        id: result.studentNo || result.studentName, // 优先用学号，如果为空则用姓名
        name: result.studentName,
        score: result.essayScore || 0, // 显示作文分数
        status: "待批改",
        statusType: "warning",
        studentNo: result.studentNo || result.studentName, // 优先用学号，如果为空则用姓名
      }));

      setStudents(formattedStudents);

      // 默认选中第一个学生并加载其作文
      if (formattedStudents.length > 0) {
        setCurrentStudentIndex(0);
        loadEssayData(formattedStudents[0].studentNo);
      }
    } catch (error) {
      console.error("加载批改结果列表失败:", error);
      message.error("加载学生数据失败，请稍后重试");
    }
  };

  // 从后端加载作文数据
  const loadEssayData = async (studentNo) => {
    if (!grading_id || !studentNo) {
      message.warning("缺少必要参数：grading_id 或 student_no");
      return;
    }

    try {
      message.loading({ content: "正在加载作文数据...", key: "loadEssay" });
      const response = await getEssayResult({ grading_id, student_no: studentNo });
      const data = response.data;

      // 保存 essay_result_id
      if (!data.id) {
        console.error("后端返回的数据中没有 id 字段");
        message.error("无法获取作文ID，请检查后端返回数据");
        return;
      }
      
      setEssayResultId(data.id);

      // 解析评语
      let parsedFeedbacks = [];
      if (data.sentenceFeedbacks) {
        try {
          parsedFeedbacks = JSON.parse(data.sentenceFeedbacks);
        } catch (error) {
          console.error("解析评语失败:", error);
        }
      }

      // 分割作文内容为句子
      const contentSentences = splitSentences(data.studentAnswer || "");
      setSentences(contentSentences);

      // 转换评语格式：后端 → 前端
      const convertedComments = parsedFeedbacks.map((feedback) => {
        // 在句子数组中查找匹配的句子索引
        const sentenceIndex = contentSentences.findIndex(
          (s) => s.trim() === feedback.sentence.trim()
        );

        return {
          sentenceIndex: sentenceIndex >= 0 ? sentenceIndex : -1,
          originalSentence: feedback.sentence,
          comment: feedback.comment || "",
          color: qualityToColor(feedback.quality),
        };
      }).filter(comment => comment.sentenceIndex >= 0); // 只保留找到索引的评语

      // 更新当前学生的评语（基于 studentNo）
      setStudentComments({
        ...studentComments,
        [studentNo]: convertedComments,
      });

      // 更新分数
      setScore(data.totalScore || 0);
      
      // 设置作文标题（如果有的话）
      setCurrentEssayTitle(data.title || "作文批改");

      message.success({ content: "作文数据加载成功", key: "loadEssay", duration: 2 });
    } catch (error) {
      console.error("加载作文数据失败:", error);
      message.error({ content: "加载作文数据失败，请稍后重试", key: "loadEssay" });
    }
  };

  // 组件挂载时加载学生列表
  useEffect(() => {
    if (grading_id) {
      loadStudentList();
    }
  }, [grading_id]);

  // 当选中学生变化时，更新句子和评分
  useEffect(() => {
    if (currentStudent?.essay?.content) {
      const split = splitSentences(currentStudent.essay.content);
      setSentences(split);
      setScore(currentStudent.score);
      setHighlightedSentenceIndex(-1);
      setSelectedSentence(null);
      setSelectedSentenceIndex(-1);
      // 重置编辑状态
      setEditingIndex(null);
      setEditingContent("");
      setShowAddComment(false);
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

  // 质量等级转颜色
  const qualityToColor = (quality) => {
    const qualityColorMap = {
      "优": "green",
      "良": "blue",
      "中": "orange",
      "差": "red",
    };
    return qualityColorMap[quality] || "blue";
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
      const newIndex = currentStudentIndex - 1;
      setCurrentStudentIndex(newIndex);
      const student = students[newIndex];
      if (student?.studentNo) {
        loadEssayData(student.studentNo);
      }
    }
  };

  const handleNextStudent = () => {
    if (currentStudentIndex < students.length - 1) {
      const newIndex = currentStudentIndex + 1;
      setCurrentStudentIndex(newIndex);
      const student = students[newIndex];
      if (student?.studentNo) {
        loadEssayData(student.studentNo);
      }
    }
  };

  // 点击学生列表切换学生
  const handleStudentClick = (index) => {
    setCurrentStudentIndex(index);
    const student = students[index];
    if (student?.studentNo) {
      loadEssayData(student.studentNo);
    }
  };

  // 点击句子选中
  const handleSentenceClick = (sentence, index) => {
    setSelectedSentence(sentence);
    setSelectedSentenceIndex(index);
    setAnimationKey((prev) => prev + 1); // 触发动画
  };

  // 关闭选中状态
  const _handleCloseSelection = () => {
    setSelectedSentence(null);
    setSelectedSentenceIndex(-1);
  };

  // 打开添加评语弹窗
  const handleOpenAddComment = () => {
    setShowAddComment(true);
  };

  // 添加评语
  const handleAddComment = (color) => {
    if (selectedSentence && currentStudent) {
      // 检查该句子是否已有评语
      const existingComment = sentenceComments.find(
        (item) => item.originalSentence === selectedSentence
      );

      if (existingComment) {
        message.warning("该句子已有评语");
        setShowAddComment(false);
        return;
      }

      const newComment = {
        sentenceIndex: selectedSentenceIndex,
        originalSentence: selectedSentence,
        comment: "", // 空字符串，等待用户输入
        color: color,
      };

      // 更新当前学生的评语
      const updatedComments = [...sentenceComments, newComment];
      setStudentComments({
        ...studentComments,
        [currentStudent.studentNo]: updatedComments,
      });
      
      setShowAddComment(false);
      setSelectedSentence(null);
      setSelectedSentenceIndex(-1);
      
      // 自动进入编辑模式，让用户立即输入内容
      const newIndex = updatedComments.length - 1;
      setEditingIndex(newIndex);
      setEditingContent("");
      
      // 保存到后端
      if (essayResultId) {
        saveSentenceFeedbacks(essayResultId, updatedComments);
      }
      
      message.success("评语已添加，请输入内容");
    }
  };

  // 删除评语
  const handleDeleteComment = () => {
    if (selectedSentence && currentStudent) {
      // 查找选中句子的评语
      const existingComment = sentenceComments.find(
        (item) => item.originalSentence === selectedSentence
      );

      if (existingComment) {
        Modal.confirm({
          title: "确认删除",
          content: "确定要删除这条评语吗？",
          okText: "确定",
          cancelText: "取消",
          onOk: () => {
            const updatedComments = sentenceComments.filter(
              (item) => item.originalSentence !== selectedSentence
            );
            
            // 更新当前学生的评语
            setStudentComments({
              ...studentComments,
              [currentStudent.studentNo]: updatedComments,
            });
            
            setSelectedSentence(null);
            setSelectedSentenceIndex(-1);
            
            // 保存到后端
            if (essayResultId) {
              saveSentenceFeedbacks(essayResultId, updatedComments);
            }
            
            message.success("评语已删除");
          },
        });
      } else {
        message.info("该句子没有评语");
      }
    }
  };

  // 开始编辑评语
  const handleStartEdit = (index, content) => {
    setEditingIndex(index);
    // 如果内容为空或是占位符，设为空字符串
    const editContent = (!content || content === "请输入评语内容...") ? "" : content;
    setEditingContent(editContent);
  };

  // 保存编辑
  const handleSaveEdit = (index) => {
    if (currentStudent) {
      const updatedComments = [...sentenceComments];
      updatedComments[index] = {
        ...updatedComments[index],
        comment: editingContent,
      };
      
      // 更新当前学生的评语
      setStudentComments({
        ...studentComments,
        [currentStudent.studentNo]: updatedComments,
      });
      
      setEditingIndex(null);
      setEditingContent("");
      
      // 保存到后端
      if (essayResultId) {
        saveSentenceFeedbacks(essayResultId, updatedComments);
      }
      
      message.success("评语已更新");
    }
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingContent("");
  };

  // 保存评语到服务器
  const saveSentenceFeedbacks = async (resultId, commentsArray) => {
    try {
      // 将组件的评语格式转换为后端需要的格式
      const backendFormat = commentsArray.map((comment) => {
        // 根据颜色反推质量等级
        let quality = "良";
        if (comment.color === "green") {
          quality = "优";
        } else if (comment.color === "blue") {
          quality = "良";
        } else if (comment.color === "orange") {
          quality = "中";
        } else if (comment.color === "red") {
          quality = "差";
        }

        return {
          sentence: comment.originalSentence,
          quality: quality,
          comment: comment.comment || "",
        };
      });

      // 调用后端API
      await alterSentenceFeedbacks({
        essay_result_id: resultId,
        sentence_feedbacks: JSON.stringify(backendFormat),
      });
      
      message.success("评语保存成功");
    } catch (error) {
      console.error("保存评语失败:", error);
      message.error("保存评语失败，请稍后重试");
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
                onClick={() => handleStudentClick(index)}
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
            <h3 className="essay-title">{currentEssayTitle}</h3>
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
                        : { cursor: "pointer" }
                    }
                    onMouseEnter={() => handleSentenceMouseEnter(index)}
                    onMouseLeave={handleSentenceMouseLeave}
                    onClick={() => handleSentenceClick(sentence, index)}
                  >
                    {sentence}
                  </span>
                );
              })}
            </div>
            
            {/* 底部导航栏 - 参考demo */}
            {selectedSentence && !showAddComment && (
              <div key={animationKey} className="sentence-selection-toolbar">
                {/* 功能按钮栏 */}
                <div className="toolbar-actions">
                  <button className="action-btn" onClick={handleOpenAddComment}>
                    <EditOutlined className="action-icon" />
                    <span>添加评语</span>
                  </button>
                  <button className="action-btn" onClick={handleDeleteComment}>
                    <DeleteOutlined className="action-icon" />
                    <span>删除评语</span>
                  </button>
                </div>
              </div>
            )}
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
              {sentenceComments.map((comment, commentIndex) => {
                const isEditing = editingIndex === commentIndex;
                
                return (
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
                    
                    {isEditing ? (
                      <div className="comment-edit-mode">
                        <textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          className="comment-edit-textarea"
                          rows={4}
                          autoFocus
                        />
                        <div className="comment-edit-actions">
                          <Button
                            size="small"
                            onClick={handleCancelEdit}
                            className="edit-cancel-btn"
                          >
                            取消
                          </Button>
                          <Button
                            size="small"
                            type="primary"
                            onClick={() => handleSaveEdit(commentIndex)}
                            className="edit-save-btn"
                          >
                            保存
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`comment-content comment-editable ${!comment.comment ? "comment-placeholder" : ""}`}
                        onClick={() => handleStartEdit(commentIndex, comment.comment)}
                        title="点击编辑评语"
                      >
                        {comment.comment || "请输入评语内容..."}
                      </div>
                    )}
                    
                    {comment.sentenceIndex === highlightedSentenceIndex && !isEditing && (
                      <div className="improvement-suggestion">
                        <h5>建议修改：</h5>
                        <p>段落一下面有冗余的感叹号，节省一点提问空间</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <Divider />

          <div className="evaluation-section">
            <h4>多维度评价</h4>
            <div className="evaluation-content">{evaluation}</div>
          </div>
        </div>
      </div>

      {/* 添加评语颜色选择弹窗 */}
      {showAddComment && (
        <div className="color-selection-modal">
          <div className="color-modal-content">
            <h3 className="color-modal-title">选择评语颜色</h3>
            <p className="color-modal-sentence">选中的句子：{selectedSentence}</p>
            
            <div className="color-buttons-grid">
              <button
                onClick={() => handleAddComment("orange")}
                className="color-btn color-btn-orange"
              >
                橙色
              </button>
              <button
                onClick={() => handleAddComment("green")}
                className="color-btn color-btn-green"
              >
                绿色
              </button>
              <button
                onClick={() => handleAddComment("blue")}
                className="color-btn color-btn-blue"
              >
                蓝色
              </button>
              <button
                onClick={() => handleAddComment("purple")}
                className="color-btn color-btn-purple"
              >
                紫色
              </button>
            </div>
            
            <button
              onClick={() => setShowAddComment(false)}
              className="color-cancel-btn"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EssayGrading;
