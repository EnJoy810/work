import { useState, useCallback, useRef } from "react";
import { message } from "antd";
import { getGradingResultV2, getStudentTraceList } from "../../../api/trace";
import {
  ANNOTATION_HEIGHT_ESTIMATE,
  DEFAULT_IMAGE_WIDTH,
  DEFAULT_IMAGE_HEIGHT,
  calculateAnnotationWidth
} from "../constants";

/**
 * 学生数据管理 Hook
 * @param {string} gradingId - 批改任务ID
 */
const useStudentData = (gradingId) => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [answerSheetData, setAnswerSheetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const imageSizeCacheRef = useRef(new Map());

  /**
   * 加载单个学生的数据
   */
  const loadStudentData = useCallback(async (student) => {
    try {
      if (!student.student_id) {
        message.warning("缺少学生ID");
        return;
      }
      
      const traceResponse = await getStudentTraceList(student.student_id);
      
      if (traceResponse?.code === '200' && traceResponse?.data) {
        const traces = Array.isArray(traceResponse.data) ? traceResponse.data : [];
        
        // 解析 paper_urls
        let paperUrls = [];
        if (student.paper_urls) {
          try {
            paperUrls = typeof student.paper_urls === 'string' 
              ? JSON.parse(student.paper_urls) 
              : student.paper_urls;
          } catch (e) {
            console.error("解析 paper_urls 失败:", e);
          }
        }
        
        // 获取图片尺寸（使用缓存）
        let imageWidth = DEFAULT_IMAGE_WIDTH;
        let imageHeight = DEFAULT_IMAGE_HEIGHT;
        
        if (paperUrls.length > 0) {
          const imageUrl = paperUrls[0];
          const cached = imageSizeCacheRef.current.get(imageUrl);
          
          if (cached) {
            imageWidth = cached.width;
            imageHeight = cached.height;
          } else {
            try {
              const img = new Image();
              await new Promise((resolve, reject) => {
                img.onload = () => {
                  imageWidth = img.naturalWidth;
                  imageHeight = img.naturalHeight;
                  imageSizeCacheRef.current.set(imageUrl, { width: imageWidth, height: imageHeight });
                  resolve();
                };
                img.onerror = reject;
                img.src = imageUrl;
              });
            } catch (e) {
              console.warn("无法获取图片尺寸，使用默认值:", e);
            }
          }
        }
        
        // 构建答题卡数据
        const sheetData = {
          id: student.student_id,
          student_name: student.student_name,
          student_no: student.student_no,
          grading_id: student.grading_id,
          status: student.status,
          total_score: student.total_score,
          full_score: 100,
          paper_urls: paperUrls,
          questions: traces.map((item) => {
            if (!item.trace) return null;
            
            let traceData = {};
            try {
              traceData = typeof item.trace === 'string' ? JSON.parse(item.trace) : item.trace;
            } catch (e) {
              console.error("解析 trace 失败:", item.question_id, e);
            }
            
            if (!traceData.bbox) return null;
            
            // 处理批注
            // rtp 是批注左上角相对于 bbox 的偏移，AnnotationCard 期望的是中心点坐标
            let annotations = [];
            const rtp = traceData.rtp || { x: 0, y: 0 };
            
            if (item.question_type === 'choice' && item.score === 0) {
              // 选择题错误：显示 ❌
              const choiceWidth = 28;
              const choiceHeight = ANNOTATION_HEIGHT_ESTIMATE;
              
              // rtp 是左上角偏移，转换为中心点坐标
              const position = {
                x: traceData.bbox.x + rtp.x + choiceWidth / 2,
                y: traceData.bbox.y + rtp.y + choiceHeight / 2
              };
              
              annotations.push({
                id: `annotation-${item.question_id}`,
                content: "❌",
                position,
                width: choiceWidth,
                isChoiceError: true
              });
            } else if (item.question_type !== 'choice') {
              // 主观题：显示批注内容
              // 优先使用 trace 中保存的 score_reason（教师修改），否则使用外层的 score_reason（AI 生成）
              const hasTeacherEdit = !!traceData.score_reason;
              const content = traceData.score_reason || item.score_reason || `${item.score}分`;
              // 优先使用 trace 中保存的 width，否则根据内容计算
              const width = traceData.width || calculateAnnotationWidth(content);
              const height = ANNOTATION_HEIGHT_ESTIMATE;
              
              // rtp 是左上角偏移，转换为中心点坐标
              const position = {
                x: traceData.bbox.x + rtp.x + width / 2,
                y: traceData.bbox.y + rtp.y + height / 2
              };
              
              annotations.push({
                id: `annotation-${item.question_id}`,
                content,
                position,
                width,
                source: hasTeacherEdit ? "teacher" : "algorithm"  // 批注来源
              });
            }
            
            return {
              questionId: item.question_id,
              paper_id: student.student_id,
              question_no: item.question_id,
              question_type: item.question_type,
              score: item.score || 0,
              full_score: 10,
              bbox: traceData.bbox,
              annotations,
              imageWidth,
              imageHeight
            };
          }).filter(Boolean)
        };
        
        setAnswerSheetData(sheetData);
        setSelectedStudent(student);
        return true;
      } else {
        message.error("加载学生数据失败");
        return false;
      }
    } catch (error) {
      console.error('加载学生数据失败:', error);
      message.error("加载学生数据失败");
      return false;
    }
  }, []);

  /**
   * 获取学生列表
   */
  const fetchStudents = useCallback(async () => {
    if (!gradingId) {
      message.warning('缺少批改任务ID');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getGradingResultV2(gradingId);
      
      if (response.code === '200' && response.data) {
        const normalStudents = (response.data.normal || []).map(s => ({
          student_id: s.paper_id,
          student_name: s.student_name,
          student_no: s.student_no,
          status: parseInt(s.status) || 200,
          grading_id: s.grading_id,
          paper_urls: s.paper_urls,
          total_score: s.total_score
        }));
        
        const exceptionalStudents = (response.data.exceptional || []).map(s => ({
          student_id: s.paper_id,
          student_name: s.student_name,
          student_no: s.student_no,
          status: parseInt(s.status) || 4001,
          grading_id: s.grading_id,
          paper_urls: s.paper_urls,
          total_score: s.total_score
        }));
        
        const allStudents = [...normalStudents, ...exceptionalStudents];
        setStudents(allStudents);
        
        if (allStudents.length > 0) {
          await loadStudentData(allStudents[0]);
        } else {
          message.warning('暂无学生数据');
        }
      } else {
        message.error('获取学生列表失败');
      }
    } catch (error) {
      console.error('获取学生列表失败:', error);
      message.error('获取学生列表失败');
    } finally {
      setLoading(false);
    }
  }, [gradingId, loadStudentData]);

  return {
    students,
    selectedStudent,
    answerSheetData,
    setAnswerSheetData,
    loading,
    loadStudentData,
    fetchStudents
  };
};

export default useStudentData;
