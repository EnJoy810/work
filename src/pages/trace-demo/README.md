# 留痕功能 Demo 页面

## 功能概述

本页面用于展示"留痕"功能的前端实现。留痕功能允许教师查看和管理学生答题卡上的批注信息。批注可能来自算法自动生成或教师手动添加，每个批注都有其在答题卡上的位置信息。

**注意：本页面 UI 设计与人工阅卷页面保持一致。**

## 页面布局

页面采用两栏布局：

1. **顶部 Header**：
   - 显示页面标题"手动留痕"
   - 显示当前学生信息（姓名、学号、批注数）
   - 显示未保存状态提示
   - 提供保存按钮

2. **左侧栏（学生列表，宽度 280px）**：
   - 学生导航区域（固定顶部）
     - 显示当前学生序号和总数
     - 提供上一个/下一个学生切换按钮
   - 学生列表区域（可滚动）
     - 显示所有学生列表
     - 显示学生状态图标（正常✓/异常✗）
     - 支持点击切换学生
     - 切换学生时会提示保存未保存的修改
     - 当前选中学生高亮显示

3. **中间栏（答题卡画布，占 75% 宽度）**：
   - 白色卡片容器，带圆角和阴影
   - 顶部工具栏
     - 显示"答题卡预览"标题
     - 缩放控制按钮（-/+）和当前缩放比例
   - 答题卡显示区域
     - 支持多页切换（Tab 切换正面/背面）
     - 显示题目框选区域（虚线框）
     - 显示批注卡片（可拖动）
     - 支持选中批注（点击高亮）
     - 支持缩放功能（50%-200%）

## 核心功能

### 1. 学生切换
- 点击左侧学生列表可切换不同学生的答题卡
- 切换前会提示保存未保存的修改

### 2. 批注展示
- 批注以卡片形式叠加在答题卡上
- 显示批注来源（老师/算法）、分数、内容
- 支持正反面切换（Tab 切换）

### 3. 批注拖动
- 鼠标拖动批注卡片可调整位置
- 拖动时自动计算相对坐标
- 拖动后标记为"未保存"状态

### 4. 缩放控制
- 支持答题卡缩放（50%-200%）
- 批注位置随缩放自动调整

### 5. 保存功能
- 点击顶部"保存修改"按钮提交所有修改
- 保存成功后清除"未保存"标记

## 坐标系统

### 三种坐标空间

1. **bbox 坐标**（P 空间）
   - 相对答题卡左上角 (0,0)
   - 范围：[0, 1] 比例坐标
   - 表示题目在整页的位置

2. **rtp 坐标**（Q 空间）
   - 相对题目 bbox 左上角
   - 范围：[0, 1] 比例坐标
   - 表示批注在题目内的位置

3. **像素坐标**
   - 屏幕上的绝对像素位置
   - 用于渲染和拖动交互

### 坐标转换

```javascript
// RTP → 整页比例
pageX = bbox.x + rtp.x * bbox.width
pageY = bbox.y + rtp.y * bbox.height

// 整页比例 → 像素
pixelX = pageX * containerWidth
pixelY = pageY * containerHeight

// 拖动时逆向转换
pageX = pixelX / containerWidth
rtp.x = (pageX - bbox.x) / bbox.width
```

## 文件结构

```
src/pages/trace-demo/
├── TraceDemoPage.jsx          # 主页面组件
├── index.js                    # 导出文件
├── traceDemo.css              # 样式文件（与人工阅卷页面样式一致）
├── mockData.js                # Mock 数据
├── README.md                  # 说明文档
├── components/
│   ├── StudentList.jsx        # 学生列表组件（含导航）
│   ├── AnswerSheetCanvas.jsx  # 答题卡画布组件
│   └── AnnotationCard.jsx     # 批注卡片组件
└── utils/
    └── coordTransform.js      # 坐标转换工具
```

## Mock 数据说明

### 学生数据
```javascript
{
  student_id: "S001",
  student_name: "张三",
  student_no: "2023001",
  status: 200,  // 200=正常, 4001=异常
  grading_id: "demo-grading-001"
}
```

### 答题卡数据
```javascript
{
  paper_urls: ["/mock/答题卡正面.jpg", "/mock/答题卡背面.jpg"],
  questions: [
    {
      questionId: "Q1",
      paper_id: "ai-chinese-0001",
      bbox: { x: 0.524, y: 0.080, width: 0.443, height: 0.256 },
      rtp: { x: 0.85, y: 0.15 },
      annotations: [...]
    }
  ]
}
```

### 批注数据
```javascript
{
  id: "trace-1",
  content: "概念理解准确，表达清晰 +8分",
  source: "teacher",  // "teacher" 或 "algorithm"
  score: 8,
  originalRtp: { x: 0.85, y: 0.15 },
  currentPosition: { x: 0.85, y: 0.15 }
}
```

## 使用方式

### 1. 访问页面
在考试卡片的"已完成"状态下，点击"手动留痕"按钮进入页面。

### 2. 查看批注
- 左侧选择学生
- 中间查看答题卡和批注
- 点击批注卡片可选中高亮

### 3. 调整批注
- 拖动批注卡片调整位置
- 拖动后自动标记为"未保存"状态

### 4. 保存修改
点击顶部"保存修改"按钮提交所有更改。

## 技术栈

- React 18
- Ant Design 5
- React Router 6
- CSS3

## 后续接入真实接口

### 需要替换的部分

1. **数据加载**
   ```javascript
   // 替换 mockData.js 中的静态数据
   const loadStudentData = async (student) => {
     const response = await fetch(`/api/trace/${student.grading_id}`);
     const data = await response.json();
     setAnswerSheetData(data);
   };
   ```

2. **保存接口**
   ```javascript
   // 替换 handleSave 中的模拟保存
   const handleSave = async () => {
     await fetch(`/api/trace/${grading_id}`, {
       method: 'PATCH',
       body: JSON.stringify(answerSheetData)
     });
   };
   ```

3. **图片路径**
   - 将 `paper_urls` 替换为真实的 OSS 图片 URL

## 注意事项

1. **坐标精度**：所有坐标使用 0-1 比例，确保不同分辨率下一致
2. **边界处理**：拖动时自动限制在 [0,1] 范围内
3. **性能优化**：大量批注时考虑虚拟化渲染
4. **兼容性**：建议使用现代浏览器（Chrome/Edge/Firefox）

## 开发者

- 创建时间：2025-11-20
- 基于需求文档和答题卡图片（4961×3509像素）设计
