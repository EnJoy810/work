# 快速开始 - 作文批改页面数据渲染

## 概述

本指南说明如何使用新的数据格式在作文批改页面中渲染学生的作文批改结果。

## 已完成的改动

### 1. 代码修改

**文件**: `src/pages/dashboard/EssayGrading.jsx`

- ✅ 添加了 `maxScore` 状态来存储作文满分
- ✅ 添加了 `dimensions` 状态来存储多维度评分
- ✅ 更新了 `loadEssayData` 函数来解析 `essay_result` 字段
- ✅ 添加了多维度评分的UI展示
- ✅ 更新了整体评语的获取逻辑

**文件**: `src/pages/dashboard/styles/EssayGrading.css`

- ✅ 添加了多维度评分的样式
- ✅ 包括进度条、评语卡片等样式

### 2. 新功能

#### 多维度评分展示

页面右侧现在会显示:

1. **作文总分**: `52 / 60`
2. **多维度评分**:
   - 内容: 22/25 (绿色进度条)
   - 结构: 20/25 (蓝色进度条)
   - 语言: 8/10 (蓝色进度条)
   - 书写: 0/0 (灰色进度条)
3. **每个维度的评语**: 显示在进度条下方
4. **按句评语**: 显示有评语的句子及其评语内容
5. **整体评语**: 显示在底部

#### 进度条颜色规则

- 得分率 ≥ 80%: 🟢 绿色
- 得分率 ≥ 60%: 🔵 蓝色
- 得分率 ≥ 40%: 🟠 橙色
- 得分率 < 40%: 🔴 红色

## 数据格式要求

### 后端API返回格式

#### 1. `getGradingResults` API

返回学生列表，每个学生对象包含:

```json
{
  "student_name": "蔡雨欣",
  "student_no": "20230258",
  "essay_score": 52,
  "essay_result": "{...}"  // JSON字符串
}
```

#### 2. `getEssayResult` API

返回学生作文详情:

```json
{
  "id": "essay_result_id",
  "essayResult": "{...}",  // JSON字符串，包含完整的作文评分信息
  "studentAnswer": "作文内容...",
  "sentenceFeedbacks": "[...]"
}
```

#### 3. `essayResult` 字段结构

解析后的 `essayResult` 应包含:

```json
{
  "totalScore": 52,
  "maxTotalScore": 60,
  "dimensions": [
    {
      "dimensionName": "内容",
      "maxScore": 25,
      "studentScore": 22,
      "comment": "评语内容..."
    }
  ],
  "studentAnswer": "作文正文...",
  "overallComment": "整体评语...",
  "sentences": [
    {
      "sentence": "句子内容",
      "quality": "1",  // "1"表示优质，"0"表示待改进
      "comment": "句子评语"
    }
  ]
}
```

## 使用方法

### 1. 访问页面

访问作文批改页面，URL格式:

```
/essay-grading?grading_id=3824e8a1-7c26-4f7f-9b3b-ccf0321fd0ca
```

### 2. 页面加载流程

1. **自动加载学生列表**: 页面会自动调用 `getGradingResults` API
2. **选择学生**: 点击左侧学生列表中的学生
3. **加载作文详情**: 自动调用 `getEssayResult` API
4. **渲染数据**: 
   - 中间显示作文内容
   - 右侧显示多维度评分、按句评语、整体评语

### 3. 交互功能

- **切换学生**: 点击左侧学生列表或使用上下箭头按钮
- **选择句子**: 点击作文中的句子
- **添加评语**: 选中句子后，点击底部工具栏的"添加评语"按钮
- **编辑评语**: 点击右侧评语卡片中的评语内容
- **删除评语**: 选中有评语的句子，点击"删除评语"按钮

## 测试数据

示例数据文件: `EXAMPLE_DATA.json`

你可以使用这个文件中的数据结构来测试页面的渲染效果。

## 注意事项

1. **JSON字符串解析**: `essay_result` 字段是JSON字符串，代码会自动解析
2. **质量等级映射**: 
   - "1" → 绿色 (优质)
   - "0" → 红色 (待改进)
   - 其他 → 蓝色 (一般)
3. **分数显示**: 作文总分会显示在右上角，格式为 `得分 / 满分`
4. **进度条动画**: 多维度评分的进度条有平滑的动画效果

## 下一步

1. ✅ 确保后端API返回的数据格式符合上述要求
2. ✅ 测试页面渲染效果
3. ✅ 检查各个功能是否正常工作
4. ✅ 调整样式以符合设计要求

## 相关文档

- `DATA_FORMAT.md`: 详细的数据格式说明
- `EXAMPLE_DATA.json`: 完整的示例数据
- `src/pages/dashboard/EssayGrading.jsx`: 主要代码文件
- `src/pages/dashboard/styles/EssayGrading.css`: 样式文件

## 联系方式

如有问题，请查看相关文档或联系开发团队。

