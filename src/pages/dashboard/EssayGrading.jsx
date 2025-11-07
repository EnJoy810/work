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
  Image,
} from "antd";
import {
  LeftOutlined,
  RightOutlined,
  CheckCircleOutlined,
  EditOutlined,
  UserSwitchOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getGradingResults, getEssayResult, alterSentenceFeedbacks, alterScore, deleteGrading } from "../../api/grading";
import "./styles/EssayGrading.css";

/**
 * 作文批改页面
 * 布局为左中右三部分，左右固定宽度，中间自适应
 */
const EssayGrading = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const grading_id = searchParams.get("grading_id");
  
  // 保存从后端获取的 essay_result_id
  const [essayResultId, setEssayResultId] = useState(null);
  
  // 当前作文信息
  const [currentEssayTitle, setCurrentEssayTitle] = useState("作文标题");
  
  // 当前作文字数
  const [currentWordCount, setCurrentWordCount] = useState(0);
  
  // 显示模式：识别结果 or 学生图片
  const [viewMode, setViewMode] = useState("text"); // "text" | "image"
  
  // 学生图片 URL（可能是单个或数组）
  const [studentImages, setStudentImages] = useState([]);
  
  // 学生列表数据（从后端加载）
  const [students, setStudents] = useState([

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
  const [essayScore, setEssayScore] = useState(0); // 作文分数
  const [dimensions, setDimensions] = useState([]); // 维度评分
  const [overallComment, setOverallComment] = useState(''); // 总评
  
  // 改分相关状态
  const [isEditingScore, setIsEditingScore] = useState(false);
  const [editingScoreValue, setEditingScoreValue] = useState(0);

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

  // 为每个学生存储独立的评语数据
  const [studentComments, setStudentComments] = useState({
    
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
  const loadStudentList = async (keepCurrentStudent = false) => {
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
      const formattedStudents = resultList.map((result) => {
        // 计算字数（去除空格和换行符）
        const content = result.student_answer || "";
        const wordCount = content.replace(/[\s\n\r]/g, "").length;
        
        return {
          id: result.student_no || result.student_name, // 优先用学号，如果为空则用姓名
          name: result.student_name,
          score: result.essay_score || 0, // 显示作文分数
          status: "待批改",
          statusType: "warning",
          studentNo: result.student_no || result.student_name, // 优先用学号，如果为空则用姓名
          wordCount: wordCount, // 添加字数统计
        };
      });

      setStudents(formattedStudents);

      // 如果不需要保持当前学生，则默认选中第一个学生并加载其作文
      if (!keepCurrentStudent && formattedStudents.length > 0) {
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
      // 先清空旧数据，确保切换学生时能立即看到变化
      setStudentImages([]);
      setSentences([]);
      setCurrentWordCount(0);
      
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
      if (data.sentence_feedbacks) {
        try {
          parsedFeedbacks = JSON.parse(data.sentence_feedbacks);
        } catch (error) {
          console.error("解析评语失败:", error);
        }
      }

      // 解析维度评分
      let parsedDimensions = [];
      if (data.dimensions) {
        try {
          parsedDimensions = typeof data.dimensions === 'string' 
            ? JSON.parse(data.dimensions) 
            : data.dimensions;
        } catch (error) {
          console.error("解析维度评分失败:", error);
        }
      }

      // 分割作文内容为句子
      const contentSentences = splitSentences(data.student_answer || "");
      setSentences(contentSentences);
      
      // 计算字数（去除空格和换行符）
      const wordCount = (data.student_answer || "").replace(/[\s\n\r]/g, "").length;
      setCurrentWordCount(wordCount);
      
      // 获取学生图片（从 answer_photo_url 字段）
      let images = [];
      if (data.answer_photo_url) {
        // 如果是字符串 URL，转为数组
        if (typeof data.answer_photo_url === 'string') {
          images = [data.answer_photo_url];
        } else if (Array.isArray(data.answer_photo_url)) {
          // 如果后端返回的是数组，直接使用
          images = data.answer_photo_url;
        }
      }
      console.log('学生图片 URL:', images); // 调试日志
      setStudentImages(images);

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

      // 更新分数（使用下划线命名的字段）
      setEssayScore(data.total_score || 0); // 作文分数（最终分数，包含人工修改）
      
      // 更新维度评分和总评
      setDimensions(parsedDimensions);
      setOverallComment(data.overall_comment || "");
      
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grading_id]);

  // 当选中学生变化时，更新句子和评分
  useEffect(() => {
    if (currentStudent?.essay?.content) {
      const split = splitSentences(currentStudent.essay.content);
      setSentences(split);
      setHighlightedSentenceIndex(-1);
      setSelectedSentence(null);
      setSelectedSentenceIndex(-1);
      // 重置编辑状态
      setEditingIndex(null);
      setEditingContent("");
      setShowAddComment(false);
    }
  }, [currentStudent]);

  // 添加点击外部区域取消选中的事件监听
  useEffect(() => {
    const handleClickOutside = (event) => {
      // 检查点击是否在essay-content之外
      const essayContent = essayContentRef.current;
      if (!essayContent) return;

      // 如果点击的是essay-content内的句子，不处理（由句子点击事件处理）
      const clickedSentence = event.target.closest('.essay-sentence');
      if (clickedSentence) return;

      // 如果点击的是操作工具栏或弹窗，不处理
      const clickedToolbar = event.target.closest('.sentence-selection-toolbar');
      const clickedModal = event.target.closest('.color-selection-modal');
      if (clickedToolbar || clickedModal) return;

      // 检查当前选中的句子是否有评语
      if (selectedSentenceIndex >= 0) {
        const hasComment = getSentenceColor(selectedSentenceIndex) !== "";
        
        // 如果没有评语，则取消选中
        if (!hasComment) {
          setSelectedSentence(null);
          setSelectedSentenceIndex(-1);
          setShowAddComment(false);
        }
      }
    };

    // 添加全局点击监听
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSentenceIndex, sentenceComments, currentStudent]);

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

  // 切换显示模式
  const handleViewModeChange = (e) => {
    setViewMode(e.target.value);
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

  // 开始编辑分数
  const handleStartEditScore = () => {
    setEditingScoreValue(essayScore); // 编辑作文分数
    setIsEditingScore(true);
  };

  // 处理分数输入变化
  const handleScoreInputChange = (e) => {
    const value = e.target.value;
    
    // 允许空字符串（用户正在删除）
    if (value === '') {
      setEditingScoreValue('');
      return;
    }
    
    // 只允许输入数字
    if (!/^\d+$/.test(value)) {
      return;
    }
    
    const numValue = parseInt(value, 10);
    
    // 验证范围：0-60的自然数
    if (numValue >= 0 && numValue <= 60) {
      setEditingScoreValue(numValue);
    }
  };

  // 保存修改的分数
  const handleSaveScore = async () => {
    if (!essayResultId || !grading_id || !currentStudent) {
      message.error("缺少必要参数，无法保存分数");
      return;
    }

    // 验证分数是否为有效数字
    if (editingScoreValue === '' || editingScoreValue === null || editingScoreValue === undefined) {
      message.error("请输入有效的分数");
      return;
    }

    const finalScore = typeof editingScoreValue === 'string' ? parseInt(editingScoreValue, 10) : editingScoreValue;

    // 验证分数范围（0-60的自然数）
    if (isNaN(finalScore) || finalScore < 0 || finalScore > 60) {
      message.error("分数必须在0-60之间");
      return;
    }

    // 如果分数没有变化，直接关闭编辑模式
    if (finalScore === essayScore) {
      setIsEditingScore(false);
      message.info("分数未发生变化");
      return;
    }

    try {
      message.loading({ content: "正在保存分数...", key: "saveScore" });
      
      await alterScore({
        essay_result_id: essayResultId,
        grading_id: grading_id,
        student_no: currentStudent.studentNo,
        old_score: essayScore, // 传入旧的作文分数
        new_score: finalScore,  // 传入新的作文分数
      });

      setIsEditingScore(false);
      
      // 直接更新本地的作文分数
      setEssayScore(finalScore);
      
      message.success({ content: "分数保存成功", key: "saveScore", duration: 2 });
      
      // 重新加载学生列表以更新左侧的作文分数显示（保持当前选中的学生）
      await loadStudentList(true);
      
      // 注意：不重新加载作文数据，因为后端的 ai_score 可能没有立即更新
      // 直接使用本地更新的分数即可
    } catch (error) {
      console.error("保存分数失败:", error);
      message.error({ content: "保存分数失败，请稍后重试", key: "saveScore" });
    }
  };

  // 取消编辑分数
  const handleCancelEditScore = () => {
    setIsEditingScore(false);
    setEditingScoreValue(essayScore); // 恢复为作文分数
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

  // 删除批改会话
  const handleDeleteGrading = () => {
    if (!grading_id) {
      message.error("缺少批改会话ID");
      return;
    }

    Modal.confirm({
      title: "确认删除",
      content: "确定要删除这个批改会话吗？删除后将无法恢复，所有批改数据都会被清除。",
      okText: "确定删除",
      okType: "danger",
      cancelText: "取消",
      onOk: async () => {
        try {
          message.loading({ content: "正在删除批改会话...", key: "deleteGrading" });
          
          // 调用删除API，参数使用下划线命名
          await deleteGrading({ grading_id });
          
          message.success({ content: "批改会话已删除", key: "deleteGrading", duration: 2 });
          
          // 删除成功后跳转回首页
          setTimeout(() => {
            navigate("/");
          }, 500);
        } catch (error) {
          console.error("删除批改会话失败:", error);
          message.error({ content: "删除批改会话失败，请稍后重试", key: "deleteGrading" });
        }
      },
    });
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
                key={`student-${index}`}
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
            <div style={{ display: "flex", alignItems: "baseline", gap: "16px" }}>
              <h3 style={{ margin: 0 }}>作文批改</h3>
              <Radio.Group value={viewMode} onChange={handleViewModeChange} buttonStyle="solid" size="small">
                <Radio.Button value="text">识别结果</Radio.Button>
                <Radio.Button value="image">学生图片</Radio.Button>
              </Radio.Group>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <Button 
                type="default" 
                danger 
                icon={<DeleteOutlined />}
                onClick={handleDeleteGrading}
              >
                删除批改
              </Button>
              <Button type="default" onClick={() => navigate("/")}>
                返回首页
              </Button>
            </div>
          </div>
          <div className="essay-card">
            <h3 className="essay-title">{currentEssayTitle}</h3>
            <div className="student-info-header">
              <div>姓名：{currentStudent?.name}</div>
              <div>字数：{currentWordCount}字</div>
            </div>
            <Divider />
            
            {/* 根据 viewMode 显示不同内容 */}
            {viewMode === "text" ? (
              <div className="essay-content">
              {sentences.map((sentence, index) => {
                const color = getSentenceColor(index);
                const hasComment = color !== "";
                const isSelected = index === selectedSentenceIndex;
                const isHovered = index === highlightedSentenceIndex;
                
                return (
                  <span
                    key={index}
                    className={`essay-sentence 
                      ${isSelected ? "selected" : ""}
                      ${isHovered && !isSelected ? "hovered" : ""} 
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
            ) : (
              <div className="student-images-container">
                {studentImages.length > 0 ? (
                  <Image.PreviewGroup>
                    <div className="images-grid">
                      {studentImages.map((imageUrl, index) => (
                        <div key={index} className="image-wrapper">
                          <Image
                            src={imageUrl}
                            alt={`学生作答图片 ${index + 1}`}
                            style={{ 
                              width: "100%",
                              borderRadius: "8px",
                              border: "1px solid #e8e8e8"
                            }}
                            placeholder={
                              <div style={{ 
                                background: "#f5f5f5", 
                                height: "400px", 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "center" 
                              }}>
                                加载中...
                              </div>
                            }
                          />
                          <div className="image-label">图片 {index + 1}</div>
                        </div>
                      ))}
                    </div>
                  </Image.PreviewGroup>
                ) : (
                  <div className="no-images-placeholder">
                    <p>暂无学生图片</p>
                  </div>
                )}
              </div>
            )}
            
            {/* 底部导航栏 - 参考demo - 只在文字模式下显示 */}
            {viewMode === "text" && selectedSentence && !showAddComment && (
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
            <h3>
              <CheckCircleOutlined style={{ marginRight: "4px" }} /> 作文得分
            </h3>
            {isEditingScore ? (
              <div className="score-edit-mode">
                <div className="score-input-wrapper">
                  <input
                    type="text"
                    value={editingScoreValue}
                    onChange={handleScoreInputChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveScore();
                      } else if (e.key === 'Escape') {
                        handleCancelEditScore();
                      }
                    }}
                    className="score-input"
                    placeholder="0-60"
                    autoFocus
                  />
                  <span className="score-max">/ 60</span>
                </div>
                <div className="score-edit-actions">
                  <Button
                    size="small"
                    onClick={handleCancelEditScore}
                    className="edit-cancel-btn"
                  >
                    取消
                  </Button>
                  <Button
                    size="small"
                    type="primary"
                    onClick={handleSaveScore}
                    className="edit-save-btn"
                  >
                    保存
                  </Button>
                </div>
              </div>
            ) : (
              <div className="score-display" onClick={handleStartEditScore} style={{ cursor: "pointer" }}>
                <span className="score-number">{essayScore}</span>
                <span className="score-max">/ 60</span>
                <EditOutlined className="score-edit-icon" style={{ marginLeft: "8px", fontSize: "16px" }} />
              </div>
            )}
          </div>

          <Divider style={{ margin: "12px 0" }} />

          <div className="evaluation-section">
            <h4>总评</h4>
            <div className="evaluation-content">
              {overallComment || "暂无总评"}
            </div>
          </div>

          <Divider style={{ margin: "12px 0" }} />

          <div className="evaluation-section">
            <h4>多维度评分</h4>
            {dimensions.length > 0 ? (
              <div className="dimensions-list">
                {dimensions.map((dimension, index) => {
                  // 计算得分百分比
                  const percentage = dimension.maxScore > 0 
                    ? dimension.studentScore / dimension.maxScore 
                    : 0;
                  
                  // 根据百分比确定等级
                  let gradeLabel = '';
                  let gradeColor = '';
                  if (percentage < 0.5) {
                    gradeLabel = '差';
                    gradeColor = '#f5222d'; // 红色
                  } else if (percentage < 0.8) {
                    gradeLabel = '良';
                    gradeColor = '#faad14'; // 黄色
                  } else {
                    gradeLabel = '优';
                    gradeColor = '#1890ff'; // 蓝色
                  }
                  
                  return (
                    <div key={index} className="dimension-item">
                      <div className="dimension-header">
                        <span className="dimension-name">{dimension.dimensionName}</span>
                        <span className="dimension-grade" style={{ color: gradeColor, fontWeight: 'bold' }}>
                          {gradeLabel}
                        </span>
                      </div>
                      {dimension.comment && (
                        <div className="dimension-comment">{dimension.comment}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="evaluation-content">暂无维度评分</div>
            )}
          </div>

          <Divider style={{ margin: "12px 0" }} />

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
