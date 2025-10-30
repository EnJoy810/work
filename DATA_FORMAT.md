# 作文批改数据格式说明

## 概述

本文档说明了作文批改系统的数据格式和如何在前端页面中渲染这些数据。

## 数据结构

### 批改结果对象 (Grading Result)

从 `getGradingResults` API 返回的数据结构:

```json
{
  "grading_id": "3824e8a1-7c26-4f7f-9b3b-ccf0321fd0ca",
  "class_id": null,
  "student_name": "蔡雨欣",
  "student_no": "20230258",
  "exam_room": "",
  "seat_number": "",
  "total_score": 133,
  "max_total_score": 150,
  "objective_score": 42,
  "fillin_score": 6,
  "essay_score": 52,
  "objective_res": "[...]",  // JSON字符串
  "fillin_res": "[...]",      // JSON字符串
  "subjective_res": "[...]",  // JSON字符串
  "essay_result": "{...}",    // JSON字符串
  "grading_time": "2025-10-30T23:14:49.926917"
}
```

### 作文结果对象 (Essay Result)

`essay_result` 字段解析后的结构:

```json
{
  "tempId": "2",
  "totalScore": 52,
  "maxTotalScore": 60,
  "dimensions": [
    {
      "dimensionName": "内容",
      "maxScore": 25,
      "studentScore": 22,
      "comment": "准确把握'新工匠精神'的时代内涵，观点明确，内容充实...",
      "confidence": 0.0
    },
    {
      "dimensionName": "结构",
      "maxScore": 25,
      "studentScore": 20,
      "comment": "结构严谨，采用小标题形式，层次分明...",
      "confidence": 0.0
    },
    {
      "dimensionName": "语言",
      "maxScore": 10,
      "studentScore": 8,
      "comment": "语言流畅生动，富有文采...",
      "confidence": 0.0
    },
    {
      "dimensionName": "书写",
      "maxScore": 0,
      "studentScore": 0,
      "comment": "无法评估书写质量",
      "confidence": 0.0
    }
  ],
  "studentAnswer": "以"新业"之火，点振兴之路\n\n节目《2024技行天下》...",
  "imgUrl": "https://...",
  "overallComment": "文章立意新颖，结构清晰，语言生动...",
  "sentences": [
    {
      "sentence": "以'新姿'点新火。让我们以青春的活力感，照亮未来的道路。",
      "quality": "1",
      "comment": "运用对偶修辞，语言精炼有力..."
    },
    {
      "sentence": "他们引入无人机植保，智能灌溉系统...",
      "quality": "1",
      "comment": "事例具体实在，体现了新时代技能人才的特点..."
    },
    {
      "sentence": "不必急于一时流落，一时之果...",
      "quality": "0",
      "comment": "'一时流落''不是可人言'表达不清，存在语病..."
    }
  ]
}
```

## 数据渲染

### 1. 学生列表

从 `getGradingResults` API 获取的数据会被转换为学生列表格式:

- 显示学生姓名、学号
- 显示作文分数 (`essay_score`)
- 显示批改状态

### 2. 作文内容

从 `essay_result.studentAnswer` 中获取作文内容:

- 将作文内容按句子分割
- 每个句子可以被点击选中
- 有评语的句子会显示彩色下划线

### 3. 多维度评分

从 `essay_result.dimensions` 中获取多维度评分:

- 显示每个维度的名称（内容、结构、语言、书写）
- 显示每个维度的得分和满分
- 显示进度条（根据得分比例）
- 显示每个维度的评语

进度条颜色规则:
- 得分率 ≥ 80%: 绿色 (#52c41a)
- 得分率 ≥ 60%: 蓝色 (#1890ff)
- 得分率 ≥ 40%: 橙色 (#fa8c16)
- 得分率 < 40%: 红色 (#f5222d)

### 4. 按句评语

从 `essay_result.sentences` 中获取按句评语:

- 每条评语包含原句、质量等级、评语内容
- 质量等级转换为颜色:
  - "1" (优质) → 绿色 (green)
  - "0" (待改进) → 红色 (red)
  - 其他 → 蓝色 (blue)

### 5. 整体评语

从 `essay_result.overallComment` 中获取整体评语，显示在右侧面板底部。

## 使用示例

### 前端代码调用流程

1. **加载学生列表**
```javascript
const response = await getGradingResults({ grading_id });
const studentList = response.data;
```

2. **加载作文详情**
```javascript
const response = await getEssayResult({ 
  grading_id, 
  student_no: studentNo 
});

// 解析 essay_result
const essayResult = JSON.parse(response.data.essayResult);

// 获取作文内容
const studentAnswer = essayResult.studentAnswer;

// 获取多维度评分
const dimensions = essayResult.dimensions;

// 获取按句评语
const sentences = essayResult.sentences;

// 获取整体评语
const overallComment = essayResult.overallComment;
```

## 页面展示

### 左侧面板
- 学生列表
- 显示姓名、学号、分数
- 点击切换学生

### 中间面板
- 作文标题
- 学生信息（姓名、学号）
- 作文内容（可按句选中和点评）

### 右侧面板
- 作文总分 (totalScore / maxTotalScore)
- 多维度评分（进度条 + 评语）
- 按句评语列表
- 整体评语

## 注意事项

1. `essay_result`、`objective_res`、`fillin_res`、`subjective_res` 都是JSON字符串，需要先解析才能使用
2. 按句评语的 `quality` 字段是字符串类型（"0"或"1"），需要转换为对应的颜色
3. 作文内容需要按句分割，使用句号、问号、感叹号作为分隔符
4. 多维度评分的进度条颜色根据得分率自动计算

## 更新日志

- 2025-10-30: 初始版本，支持作文批改数据的完整渲染

