import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
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
  
  // ========== 数据状态 ==========
  // 作文基础数据
  const [essayData, setEssayData] = useState({
    essayResultId: null,
    title: "作文标题",
    wordCount: 0,
    sentences: [],
    studentImages: [],
    score: 0,
    dimensions: [],
    overallComment: '',
  });
  
  // 学生相关数据
  const [students, setStudents] = useState([]);
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0);
  
  // 评语数据（按学生存储）
  const [studentComments, setStudentComments] = useState({});
  
  // ========== UI交互状态 ==========
  // 视图模式
  const [viewMode, setViewMode] = useState("text"); // "text" | "image"
  
  // 句子交互状态（合并冗余状态）
  const [sentenceInteraction, setSentenceInteraction] = useState({
    highlightedIndex: -1,
    selectedIndex: -1, // 只需要索引，句子可以从 sentences[selectedIndex] 获取
    animationKey: 0,
    showAddComment: false,
  });
  
  // 编辑状态（合并相关状态）
  const [editingState, setEditingState] = useState({
    score: null, // null 表示未编辑，数字表示正在编辑的分数
    comment: {
      index: null, // null 表示未编辑
      content: "",
    },
  });
  
  // ========== 计算派生状态 ==========
  // 当前选中的学生（从 students 和 currentStudentIndex 计算）
  const currentStudent = students[currentStudentIndex] || null;
  
  // 当前学生的评语（基于 studentNo）
  const sentenceComments = studentComments[currentStudent?.studentNo] || [];

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

  // 获取句子的颜色（使用 useCallback 优化，避免在 useEffect 中产生依赖问题）
  const getSentenceColor = useCallback((index) => {
    const comment = sentenceComments.find(
      (item) => item.sentenceIndex === index
    );
    return comment ? comment.color : "";
  }, [sentenceComments]);
  
  // 获取选中的句子（从索引计算，使用 useMemo 优化）
  const selectedSentence = useMemo(() => {
    return sentenceInteraction.selectedIndex >= 0 
      ? essayData.sentences[sentenceInteraction.selectedIndex] 
      : null;
  }, [sentenceInteraction.selectedIndex, essayData.sentences]);

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

  // 从后端加载作文数据（使用 useCallback 优化，修复依赖问题）
  // 注意：此函数需要在 loadStudentList 之前定义，因为 loadStudentList 依赖它
  const loadEssayData = useCallback(async (studentNo) => {
    if (!grading_id || !studentNo) {
      message.warning("缺少必要参数：grading_id 或 student_no");
      return;
    }

    try {
      // 先清空旧数据，确保切换学生时能立即看到变化
      setEssayData(prev => ({
        ...prev,
        sentences: [],
        studentImages: [],
        wordCount: 0,
      }));
      
      message.loading({ content: "正在加载作文数据...", key: "loadEssay" });
      const response = await getEssayResult({ grading_id, student_no: studentNo });
      const data = response.data;

      // 保存 essay_result_id
      if (!data.id) {
        console.error("后端返回的数据中没有 id 字段");
        message.error("无法获取作文ID，请检查后端返回数据");
        return;
      }

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
      
      // 计算字数（去除空格和换行符）
      const wordCount = (data.student_answer || "").replace(/[\s\n\r]/g, "").length;
      
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

      // 更新当前学生的评语（基于 studentNo）- 使用函数式更新避免依赖 studentComments
      setStudentComments(prev => ({
        ...prev,
        [studentNo]: convertedComments,
      }));

      // 一次性更新所有作文数据
      setEssayData({
        essayResultId: data.id,
        title: data.title || "作文批改",
        wordCount: wordCount,
        sentences: contentSentences,
        studentImages: images,
        score: data.total_score || 0,
        dimensions: parsedDimensions,
        overallComment: data.overall_comment || "",
      });

      message.success({ content: "作文数据加载成功", key: "loadEssay", duration: 2 });
    } catch (error) {
      console.error("加载作文数据失败:", error);
      message.error({ content: "加载作文数据失败，请稍后重试", key: "loadEssay" });
    }
  }, [grading_id]); // 只依赖 grading_id，其他都使用函数式更新或稳定的 setState

  // 加载批改结果列表（包含学生信息）- 使用 useCallback 优化，修复依赖问题
  const loadStudentList = useCallback(async (keepCurrentStudent = false) => {
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
  }, [grading_id, loadEssayData]); // 依赖 grading_id 和 loadEssayData

  // 组件挂载时加载学生列表
  useEffect(() => {
    if (grading_id) {
      loadStudentList();
    }
  }, [grading_id, loadStudentList]); // 正确添加所有依赖

  // 当选中学生变化时，重置交互状态
  useEffect(() => {
    if (currentStudent) {
      // 重置句子交互状态
      setSentenceInteraction({
        highlightedIndex: -1,
        selectedIndex: -1,
        animationKey: 0,
        showAddComment: false,
      });
      // 重置编辑状态
      setEditingState({
        score: null,
        comment: { index: null, content: "" },
      });
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
      if (sentenceInteraction.selectedIndex >= 0) {
        const hasComment = getSentenceColor(sentenceInteraction.selectedIndex) !== "";
        
        // 如果没有评语，则取消选中
        if (!hasComment) {
          setSentenceInteraction(prev => ({
            ...prev,
            selectedIndex: -1,
            showAddComment: false,
          }));
        }
      }
    };

    // 添加全局点击监听
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sentenceInteraction.selectedIndex, sentenceComments, currentStudent, getSentenceColor]); // 正确添加所有依赖，包括 getSentenceColor

  // 处理句子高亮（使用 useCallback 优化性能）
  const handleSentenceMouseEnter = useCallback((index) => {
    setSentenceInteraction(prev => ({ ...prev, highlightedIndex: index }));
  }, []); // 空依赖，因为只使用了 setState

  // 处理句子高亮取消（使用 useCallback 优化性能）
  const handleSentenceMouseLeave = useCallback(() => {
    setSentenceInteraction(prev => ({ ...prev, highlightedIndex: -1 }));
  }, []); // 空依赖，因为只使用了 setState

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

  // 切换显示模式（使用 useCallback 优化性能）
  const handleViewModeChange = useCallback((e) => {
    setViewMode(e.target.value);
  }, []); // 空依赖，因为只使用了 setState

  // 切换学生（使用 useCallback 优化性能）
  const handlePrevStudent = useCallback(() => {
    if (currentStudentIndex > 0) {
      const newIndex = currentStudentIndex - 1;
      setCurrentStudentIndex(newIndex);
      const student = students[newIndex];
      if (student?.studentNo) {
        loadEssayData(student.studentNo);
      }
    }
  }, [currentStudentIndex, students, loadEssayData]); // 依赖相关状态和函数

  const handleNextStudent = useCallback(() => {
    if (currentStudentIndex < students.length - 1) {
      const newIndex = currentStudentIndex + 1;
      setCurrentStudentIndex(newIndex);
      const student = students[newIndex];
      if (student?.studentNo) {
        loadEssayData(student.studentNo);
      }
    }
  }, [currentStudentIndex, students, loadEssayData]); // 依赖相关状态和函数

  // 点击学生列表切换学生（使用 useCallback 优化性能）
  const handleStudentClick = useCallback((index) => {
    setCurrentStudentIndex(index);
    const student = students[index];
    if (student?.studentNo) {
      loadEssayData(student.studentNo);
    }
  }, [students, loadEssayData]); // 依赖相关状态和函数

  // 点击句子选中（使用 useCallback 优化性能）
  const handleSentenceClick = useCallback((sentence, index) => {
    setSentenceInteraction(prev => ({
      ...prev,
      selectedIndex: index,
      animationKey: prev.animationKey + 1, // 触发动画
    }));
  }, []); // 空依赖，因为只使用了 setState

  // 关闭选中状态（使用 useCallback 优化性能）
  const _handleCloseSelection = useCallback(() => {
    setSentenceInteraction(prev => ({
      ...prev,
      selectedIndex: -1,
      showAddComment: false,
    }));
  }, []); // 空依赖，因为只使用了 setState

  // 打开添加评语弹窗（使用 useCallback 优化性能）
  const handleOpenAddComment = useCallback(() => {
    setSentenceInteraction(prev => ({ ...prev, showAddComment: true }));
  }, []); // 空依赖，因为只使用了 setState

  // 添加评语（使用 useCallback 优化性能）
  const handleAddComment = useCallback((color) => {
    if (!selectedSentence || !currentStudent) return;
    
    // 检查该句子是否已有评语
    const existingComment = sentenceComments.find(
      (item) => item.originalSentence === selectedSentence
    );

    if (existingComment) {
      message.warning("该句子已有评语");
      setSentenceInteraction(prev => ({ ...prev, showAddComment: false }));
      return;
    }

    const newComment = {
      sentenceIndex: sentenceInteraction.selectedIndex,
      originalSentence: selectedSentence,
      comment: "", // 空字符串，等待用户输入
      color: color,
    };

    // 更新当前学生的评语
    const updatedComments = [...sentenceComments, newComment];
    setStudentComments(prev => ({
      ...prev,
      [currentStudent.studentNo]: updatedComments,
    }));
    
    // 重置选中状态并进入编辑模式
    setSentenceInteraction(prev => ({
      ...prev,
      selectedIndex: -1,
      showAddComment: false,
    }));
    
    // 自动进入编辑模式，让用户立即输入内容
    const newIndex = updatedComments.length - 1;
    setEditingState(prev => ({
      ...prev,
      comment: { index: newIndex, content: "" },
    }));
    
    // 保存到后端
    if (essayData.essayResultId) {
      saveSentenceFeedbacks(essayData.essayResultId, updatedComments);
    }
    
    message.success("评语已添加，请输入内容");
  }, [selectedSentence, currentStudent, sentenceComments, sentenceInteraction.selectedIndex, essayData.essayResultId]); // 依赖所有使用的状态

  // 删除评语（使用 useCallback 优化性能）
  const handleDeleteComment = useCallback(() => {
    if (!selectedSentence || !currentStudent) return;
    
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
          setStudentComments(prev => ({
            ...prev,
            [currentStudent.studentNo]: updatedComments,
          }));
          
          // 重置选中状态
          setSentenceInteraction(prev => ({
            ...prev,
            selectedIndex: -1,
          }));
          
          // 保存到后端
          if (essayData.essayResultId) {
            saveSentenceFeedbacks(essayData.essayResultId, updatedComments);
          }
          
          message.success("评语已删除");
        },
      });
    } else {
      message.info("该句子没有评语");
    }
  }, [selectedSentence, currentStudent, sentenceComments, essayData.essayResultId]); // 依赖所有使用的状态

  // 开始编辑评语（使用 useCallback 优化性能）
  const handleStartEdit = useCallback((index, content) => {
    // 如果内容为空或是占位符，设为空字符串
    const editContent = (!content || content === "请输入评语内容...") ? "" : content;
    setEditingState(prev => ({
      ...prev,
      comment: { index, content: editContent },
    }));
  }, []); // 空依赖，因为只使用了 setState

  // 保存编辑（使用 useCallback 优化性能）
  const handleSaveEdit = useCallback((index) => {
    if (!currentStudent) return;
    
    const updatedComments = [...sentenceComments];
    updatedComments[index] = {
      ...updatedComments[index],
      comment: editingState.comment.content,
    };
    
    // 更新当前学生的评语
    setStudentComments(prev => ({
      ...prev,
      [currentStudent.studentNo]: updatedComments,
    }));
    
    // 重置编辑状态
    setEditingState(prev => ({
      ...prev,
      comment: { index: null, content: "" },
    }));
    
    // 保存到后端
    if (essayData.essayResultId) {
      saveSentenceFeedbacks(essayData.essayResultId, updatedComments);
    }
    
    message.success("评语已更新");
  }, [currentStudent, sentenceComments, editingState.comment.content, essayData.essayResultId]); // 依赖所有使用的状态

  // 取消编辑（使用 useCallback 优化性能）
  const handleCancelEdit = useCallback(() => {
    setEditingState(prev => ({
      ...prev,
      comment: { index: null, content: "" },
    }));
  }, []); // 空依赖，因为只使用了 setState

  // 开始编辑分数（使用 useCallback 优化性能）
  const handleStartEditScore = useCallback(() => {
    setEditingState(prev => ({
      ...prev,
      score: essayData.score, // 编辑作文分数
    }));
  }, [essayData.score]); // 依赖 essayData.score

  // 处理分数输入变化（使用 useCallback 优化性能）
  const handleScoreInputChange = useCallback((e) => {
    const value = e.target.value;
    
    // 允许空字符串（用户正在删除）
    if (value === '') {
      setEditingState(prev => ({ ...prev, score: '' }));
      return;
    }
    
    // 只允许输入数字
    if (!/^\d+$/.test(value)) {
      return;
    }
    
    const numValue = parseInt(value, 10);
    
    // 验证范围：0-60的自然数
    if (numValue >= 0 && numValue <= 60) {
      setEditingState(prev => ({ ...prev, score: numValue }));
    }
  }, []); // 空依赖，因为只使用了 setState

  // 保存修改的分数（使用 useCallback 优化性能）
  const handleSaveScore = useCallback(async () => {
    if (!essayData.essayResultId || !grading_id || !currentStudent) {
      message.error("缺少必要参数，无法保存分数");
      return;
    }

    // 验证分数是否为有效数字
    if (editingState.score === '' || editingState.score === null || editingState.score === undefined) {
      message.error("请输入有效的分数");
      return;
    }

    const finalScore = typeof editingState.score === 'string' ? parseInt(editingState.score, 10) : editingState.score;

    // 验证分数范围（0-60的自然数）
    if (isNaN(finalScore) || finalScore < 0 || finalScore > 60) {
      message.error("分数必须在0-60之间");
      return;
    }

    // 如果分数没有变化，直接关闭编辑模式
    if (finalScore === essayData.score) {
      setEditingState(prev => ({ ...prev, score: null }));
      message.info("分数未发生变化");
      return;
    }

    try {
      message.loading({ content: "正在保存分数...", key: "saveScore" });
      
      await alterScore({
        essay_result_id: essayData.essayResultId,
        grading_id: grading_id,
        student_no: currentStudent.studentNo,
        old_score: essayData.score, // 传入旧的作文分数
        new_score: finalScore,  // 传入新的作文分数
      });

      // 更新本地状态
      setEssayData(prev => ({ ...prev, score: finalScore }));
      setEditingState(prev => ({ ...prev, score: null }));
      
      message.success({ content: "分数保存成功", key: "saveScore", duration: 2 });
      
      // 重新加载学生列表以更新左侧的作文分数显示（保持当前选中的学生）
      await loadStudentList(true);
      
      // 注意：不重新加载作文数据，因为后端的 ai_score 可能没有立即更新
      // 直接使用本地更新的分数即可
    } catch (error) {
      console.error("保存分数失败:", error);
      message.error({ content: "保存分数失败，请稍后重试", key: "saveScore" });
    }
  }, [essayData.essayResultId, essayData.score, grading_id, currentStudent, editingState.score, loadStudentList]); // 依赖所有使用的状态和函数

  // 取消编辑分数（使用 useCallback 优化性能）
  const handleCancelEditScore = useCallback(() => {
    setEditingState(prev => ({ ...prev, score: null }));
  }, []); // 空依赖，因为只使用了 setState

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

  // 删除批改会话（使用 useCallback 优化性能）
  const handleDeleteGrading = useCallback(() => {
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
  }, [grading_id, navigate]); // 依赖 grading_id 和 navigate

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
            <h3 className="essay-title">{essayData.title}</h3>
            <div className="student-info-header">
              <div>姓名：{currentStudent?.name}</div>
              <div>字数：{essayData.wordCount}字</div>
            </div>
            <Divider />
            
            {/* 根据 viewMode 显示不同内容 */}
            {viewMode === "text" ? (
              <div className="essay-content">
              {essayData.sentences.map((sentence, index) => {
                const color = getSentenceColor(index);
                const hasComment = color !== "";
                const isSelected = index === sentenceInteraction.selectedIndex;
                const isHovered = index === sentenceInteraction.highlightedIndex;
                
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
                {essayData.studentImages.length > 0 ? (
                  <Image.PreviewGroup>
                    <div className="images-grid">
                      {essayData.studentImages.map((imageUrl, index) => (
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
            {viewMode === "text" && selectedSentence && !sentenceInteraction.showAddComment && (
              <div key={sentenceInteraction.animationKey} className="sentence-selection-toolbar">
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
            {editingState.score !== null ? (
              <div className="score-edit-mode">
                <div className="score-input-wrapper">
                  <input
                    type="text"
                    value={editingState.score}
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
                <span className="score-number">{essayData.score}</span>
                <span className="score-max">/ 60</span>
                <EditOutlined className="score-edit-icon" style={{ marginLeft: "8px", fontSize: "16px" }} />
              </div>
            )}
          </div>

          <Divider style={{ margin: "12px 0" }} />

          <div className="evaluation-section">
            <h4>总评</h4>
            <div className="evaluation-content">
              {essayData.overallComment || "暂无总评"}
            </div>
          </div>

          <Divider style={{ margin: "12px 0" }} />

          <div className="evaluation-section">
            <h4>多维度评分</h4>
            {essayData.dimensions.length > 0 ? (
              <div className="dimensions-list">
                {essayData.dimensions.map((dimension, index) => {
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
                const isEditing = editingState.comment.index === commentIndex;
                
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
                          value={editingState.comment.content}
                          onChange={(e) => setEditingState(prev => ({
                            ...prev,
                            comment: { ...prev.comment, content: e.target.value }
                          }))}
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
                    
                    {comment.sentenceIndex === sentenceInteraction.highlightedIndex && !isEditing && (
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
      {sentenceInteraction.showAddComment && (
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
              onClick={() => setSentenceInteraction(prev => ({ ...prev, showAddComment: false }))}
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
