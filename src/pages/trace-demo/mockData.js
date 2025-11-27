/**
 * 留痕功能 Mock 数据
 * 基于真实答题卡图片（4961×3509像素）标注的坐标
 */
import { ANNOTATION_SCALE_DEFAULT } from "./constants";

// 学生列表 Mock 数据
export const MOCK_STUDENTS = [
  {
    student_id: "S001",
    student_name: "张三",
    student_no: "2023001",
    status: 200,
    grading_id: "demo-grading-001"
  },
  {
    student_id: "S002",
    student_name: "李四",
    student_no: "2023002",
    status: 4001, // 学生信息识别问题
    grading_id: "demo-grading-002"
  },
  {
    student_id: "S003",
    student_name: "王五",
    student_no: "2023003",
    status: 200,
    grading_id: "demo-grading-003"
  }
];

// 答题卡数据 Mock（按学生ID索引）
export const MOCK_ANSWER_SHEETS = {
  "S001": {
    code: "200",
    message: "success",
    data: {
      id: 8053,
      student_name: "张三",
      student_no: "2023001",
      grading_id: "demo-grading-001",
      status: 200,
      total_score: 85,
      full_score: 100,
      paper_urls: [
        "/mock/答题卡正面.jpg",  // 4961×3509
        "/mock/答题卡背面.jpg"   // 4961×3509
      ],
      questions: [
        // 正面 - 第一大题（右上角）
        {
          questionId: "Q1",
          paper_id: "ai-chinese-0001",
          question_no: "一",
          question_type: "essay",
          score: 8,
          full_score: 10,
          bbox: {
            x: 0.524,   // 题目在整页的位置
            y: 0.080,
            width: 0.443,
            height: 0.256
          },
          rtp: {
            x: 0.85,    // 相对题目bbox：题目内部右侧空白处
            y: 0.15     // 相对题目bbox：题目内部靠上
          },
          annotations: [
            {
              id: "trace-1",
              content: "概念理解准确，表达清晰 ",
              source: "teacher",
              score: 8,
              originalRtp: { x: 0.85, y: 0.15 },
              currentPosition: { x: 0.85, y: 0.15 },
              scale: 1.0
            }
          ]
        },
        // 正面 - 第18题
        {
          questionId: "Q18",
          paper_id: "ai-chinese-0001",
          question_no: "18",
          question_type: "essay",
          score: 7.5,
          full_score: 10,
          bbox: {
            x: 0.524,
            y: 0.356,
            width: 0.443,
            height: 0.128
          },
          rtp: {
            x: 0.75,
            y: 0.50
          },
          annotations: [
            {
              id: "trace-2",
              content: "答案基本正确，但缺少关键步骤说明",
              source: "algorithm",
              ai_score: 7.5,
              originalRtp: { x: 0.75, y: 0.50 },
              currentPosition: { x: 0.75, y: 0.50 },
              scale: 1.0
            }
          ]
        },
        // 正面 - 第19题
        {
          questionId: "Q19",
          paper_id: "ai-chinese-0001",
          question_no: "19",
          question_type: "essay",
          score: 6,
          full_score: 8,
          bbox: {
            x: 0.524,
            y: 0.499,
            width: 0.443,
            height: 0.114
          },
          rtp: {
            x: 0.80,
            y: 0.55
          },
          annotations: [
            {
              id: "trace-3",
              content: "解题思路正确",
              source: "teacher",
              score: 6,
              originalRtp: { x: 0.80, y: 0.55 },
              currentPosition: { x: 0.80, y: 0.55 },
              scale: ANNOTATION_SCALE_DEFAULT
            }
          ]
        },
        // 正面 - 第二大题（左侧）
        {
          questionId: "Q2",
          paper_id: "ai-chinese-0001",
          question_no: "二",
          question_type: "essay",
          score: 15,
          full_score: 20,
          bbox: {
            x: 0.030,
            y: 0.456,
            width: 0.443,
            height: 0.199
          },
          rtp: {
            x: 0.20,
            y: 0.30
          },
          annotations: [
            {
              id: "trace-4",
              content: "分析到位，逻辑清晰",
              source: "teacher",
              score: 15,
              originalRtp: { x: 0.20, y: 0.30 },
              currentPosition: { x: 0.20, y: 0.30 },
              scale: 1.0
            }
          ]
        },
        // 正面 - 第三大题（左侧下部）
        {
          questionId: "Q3",
          paper_id: "ai-chinese-0001",
          question_no: "三",
          bbox: {
            x: 0.030,
            y: 0.684,
            width: 0.443,
            height: 0.256
          },
          rtp: {
            x: 0.25,
            y: 0.80
          },
          annotations: []
        },
        // 背面 - 第22题作文
        {
          questionId: "Q22",
          paper_id: "ai-chinese-0002",
          question_no: "22",
          bbox: {
            x: 0.020,
            y: 0.051,
            width: 0.484,
            height: 0.898
          },
          rtp: {
            x: 0.10,
            y: 0.05
          },
          annotations: [
            {
              id: "trace-5",
              content: "立意深刻，语言流畅，但结尾略显仓促",
              source: "teacher",
              score: 48,
              originalRtp: { x: 0.10, y: 0.05 },
              currentPosition: { x: 0.10, y: 0.05 },
              scale: 1.0
            },
            {
              id: "trace-6",
              content: "文章结构完整，论证充分，建议加强细节描写",
              source: "algorithm",
              ai_score: 45,
              originalRtp: { x: 0.10, y: 0.95 },
              currentPosition: { x: 0.10, y: 0.95 },
              scale: 1.0
            }
          ]
        }
      ]
    }
  },
  "S002": {
    code: "200",
    message: "success",
    data: {
      id: 8054,
      student_name: "李四",
      student_no: "2023002",
      grading_id: "demo-grading-002",
      status: 4001,
      paper_urls: [
        "/mock/答题卡正面.jpg",
        "/mock/答题卡背面.jpg"
      ],
      questions: [
        {
          questionId: "Q1",
          paper_id: "ai-chinese-0001",
          question_no: "一",
          bbox: {
            x: 0.524,
            y: 0.080,
            width: 0.443,
            height: 0.256
          },
          rtp: {
            x: 0.85,
            y: 0.15
          },
          annotations: [
            {
              id: "trace-7",
              content: "需要补充说明",
              source: "algorithm",
              ai_score: 5,
              originalRtp: { x: 0.85, y: 0.15 },
              currentPosition: { x: 0.85, y: 0.15 },
              scale: ANNOTATION_SCALE_DEFAULT
            }
          ]
        }
      ]
    }
  },
  "S003": {
    code: "200",
    message: "success",
    data: {
      id: 8055,
      student_name: "王五",
      student_no: "2023003",
      grading_id: "demo-grading-003",
      status: 200,
      paper_urls: [
        "/mock/答题卡正面.jpg",
        "/mock/答题卡背面.jpg"
      ],
      questions: [
        {
          questionId: "Q1",
          paper_id: "ai-chinese-0001",
          question_no: "一",
          bbox: {
            x: 0.524,
            y: 0.080,
            width: 0.443,
            height: 0.256
          },
          rtp: {
            x: 0.85,
            y: 0.15
          },
          annotations: [
            {
              id: "trace-8",
              content: "优秀 +10分",
              source: "teacher",
              score: 10,
              originalRtp: { x: 0.85, y: 0.15 },
              currentPosition: { x: 0.85, y: 0.15 },
              scale: 1.0
            }
          ]
        }
      ]
    }
  }
};

/**
 * 获取学生的答题卡数据
 * @param {string} studentId - 学生ID
 * @returns {Object} 答题卡数据
 */
export const getAnswerSheetByStudentId = (studentId) => {
  return MOCK_ANSWER_SHEETS[studentId] || null;
};
