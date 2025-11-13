import { useState, useEffect, useRef } from "react";
import { Modal, Typography, Button, Input, InputNumber, Form, Space, Popconfirm, message, Tabs } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, SaveOutlined, CloseOutlined } from "@ant-design/icons";
import { getExamGuideline, getExamPaperDetail } from "../../../api/exam";
import { alterSubjectiveGuidelines, alterEssayGuidelines, alterChoiceAnswers } from "../../../api/paperDetail";
import "./ScoreRulesModal.css";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

/**
 * 评分细则弹窗组件
 * @param {Object} props
 * @param {boolean} props.visible - 弹窗是否可见
 * @param {function} props.onCancel - 关闭弹窗回调函数
 * @param {Object} props.exam - 考试数据
 */
const ScoreRulesModal = ({ visible, onCancel, exam }) => {
  // 状态管理
  const [scoreRules, setScoreRules] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // 编辑中的数据
  const [choiceGuidelines, setChoiceGuidelines] = useState([]); // 选择题评分细则
  const [subjectiveGuidelines, setSubjectiveGuidelines] = useState([]);
  const [essayGuideline, setEssayGuideline] = useState(null);
  
  // 编辑中的项索引
  const [editingIndex, setEditingIndex] = useState(null);
  
  // 当前选中的 Tab
  const [activeTab, setActiveTab] = useState("choice");

  // 从试卷详情中提取的选择题答案与题干映射
  const [_choiceAnswerMap, setChoiceAnswerMap] = useState(new Map());
  const [_questionMetaMap, setQuestionMetaMap] = useState(new Map()); // question_id -> { content, score }
  const originalChoiceGuidelinesRef = useRef([]); // 选择题细则原始快照（用于取消编辑恢复）
  const originalSubjectiveGuidelinesRef = useRef([]);
  const originalEssayGuidelineRef = useRef(null);

  // 获取评分细则数据
  const fetchScoreRules = async () => {
    if (!exam?.exam_id) {
      setError("考试ID不存在");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 并行获取评分细则与试卷详情（包含 choice_answers、题干与分值）
      const [guidelineRes, paperRes] = await Promise.all([
        getExamGuideline(exam.exam_id),
        getExamPaperDetail(exam.exam_id),
      ]);

      // 评分细则
      setScoreRules(guidelineRes.data);

      // 解析细则数据
      const choice = guidelineRes.data?.choice_guideline
        ? JSON.parse(guidelineRes.data.choice_guideline)
        : [];
      const subjective = guidelineRes.data?.subjective_guideline
        ? JSON.parse(guidelineRes.data.subjective_guideline)
        : [];
      const essay = guidelineRes.data?.essay_guideline
        ? JSON.parse(guidelineRes.data.essay_guideline)
        : null;

      // 试卷详情中的答案与题干信息
      const pa = paperRes?.data;
      const choiceAnsMap = new Map(
        (pa?.choice_answers || []).map((a) => [
          String(a.question_id),
          (a && (a.answer ?? a.standard_answer)) || "",
        ])
      );
      const metaMap = new Map();
      (pa?.origin_paper_sections || []).forEach((sec) => {
        (sec?.question_list || []).forEach((q) => {
          if (q?.question_id) {
            metaMap.set(q.question_id, {
              content: q.content || "",
              score: q.score ?? 0,
            });
          }
        });
      });
      setChoiceAnswerMap(choiceAnsMap);
      setQuestionMetaMap(metaMap);

      // 用试卷答案与题干补全/生成选择题细则项
      let mergedChoice = choice.length > 0 ? [...choice] : [];

      if (mergedChoice.length === 0 && choiceAnsMap.size > 0) {
        // 如果细则里没有选择题项，则基于答案生成初始列表
        mergedChoice = Array.from(choiceAnsMap.entries()).map(
          ([qid, ans]) => ({
            question_id: qid,
            standard_answer: ans || "",
          })
        );
      } else if (mergedChoice.length > 0) {
        // 如果已有细则项，优先使用试卷详情中的最新答案；若后端返回空，则保留本地值，避免被清空
        mergedChoice = mergedChoice.map((item) => {
          const qid = item.question_id;
          const fromMap = choiceAnsMap.get(String(qid));
          const hasNonEmptyMap = typeof fromMap === "string" ? fromMap.trim().length > 0 : !!fromMap;
          const latest = choiceAnsMap.has(String(qid)) && hasNonEmptyMap
            ? fromMap
            : (item.standard_answer || "");
          return {
            question_id: qid,
            standard_answer: latest,
          };
        });
      }

      setChoiceGuidelines(mergedChoice);
      originalChoiceGuidelinesRef.current = mergedChoice;
      setSubjectiveGuidelines(subjective);
      setEssayGuideline(essay);
      originalSubjectiveGuidelinesRef.current = subjective;
      originalEssayGuidelineRef.current = essay;

    } catch (err) {
      console.error("获取评分细则失败:", err);
      setError(err.message || "获取评分细则失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  // 当弹窗可见且exam_id存在时，获取评分细则
  useEffect(() => {
    if (visible && exam?.exam_id) {
      fetchScoreRules();
      setIsEditing(false);
      setEditingIndex(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, exam?.exam_id]);

  // 进入编辑模式
  const handleStartEdit = () => {
    setIsEditing(true);
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingIndex(null);
    // 优先使用合并后的原始快照进行还原，避免scoreRules缺失选择题导致清空
    if (originalChoiceGuidelinesRef.current && Array.isArray(originalChoiceGuidelinesRef.current)) {
      setChoiceGuidelines(originalChoiceGuidelinesRef.current);
    } else if (scoreRules) {
      const choice = scoreRules?.choice_guideline
        ? JSON.parse(scoreRules.choice_guideline)
        : [];
      const simplifiedChoice = choice.map(item => ({
        question_id: item.question_id,
        standard_answer: item.standard_answer || ""
      }));
      setChoiceGuidelines(simplifiedChoice);
    }
 
    // 其余两类优先使用原始快照
    if (originalSubjectiveGuidelinesRef.current && Array.isArray(originalSubjectiveGuidelinesRef.current)) {
      setSubjectiveGuidelines(originalSubjectiveGuidelinesRef.current);
    } else {
      const subjective = scoreRules?.subjective_guideline
        ? JSON.parse(scoreRules.subjective_guideline)
        : [];
      setSubjectiveGuidelines(subjective);
    }

    if (originalEssayGuidelineRef.current) {
      setEssayGuideline(originalEssayGuidelineRef.current);
    } else {
      const essay = scoreRules?.essay_guideline
        ? JSON.parse(scoreRules.essay_guideline)
        : null;
      setEssayGuideline(essay);
    }
  };

  // 保存修改
  const handleSave = async () => {
    if (!exam?.exam_id) {
      message.error("缺少考试ID");
      return;
    }

    setSaving(true);
    try {
      // 仅对有改动的模块发起保存请求（脏数据检测）
      const examId = exam.exam_id; // 新接口要求 examId（驼峰）
      const tasks = [];

      const changedSubjective = JSON.stringify(subjectiveGuidelines) !== JSON.stringify(originalSubjectiveGuidelinesRef.current || []);
      const changedEssay = JSON.stringify(essayGuideline) !== JSON.stringify(originalEssayGuidelineRef.current || null);
      const changedChoice = JSON.stringify(choiceGuidelines) !== JSON.stringify(originalChoiceGuidelinesRef.current || []);

      // 仅保存当前激活Tab的改动，避免多余请求
      if (activeTab === "subjective") {
        if (changedSubjective) {
          tasks.push(
            alterSubjectiveGuidelines({
              exam_id: examId,
              guidelines: subjectiveGuidelines || [],
            })
          );
        }
      } else if (activeTab === "essay") {
        if (changedEssay) {
          tasks.push(
            alterEssayGuidelines({
              exam_id: examId,
              essay_guideline: essayGuideline
                ? {
                    question_content: essayGuideline.question_content || "",
                    total_score: Number(essayGuideline.total_score ?? 0),
                    grading_guideline: essayGuideline.grading_guideline || "",
                  }
                : null,
            })
          );
        }
      } else if (activeTab === "choice") {
        if (changedChoice) {
          tasks.push(
            alterChoiceAnswers({
              exam_id: examId,
              choice_answers: Array.isArray(choiceGuidelines)
                ? choiceGuidelines.map((it) => ({
                    question_id: it.question_id,
                    answer: it.standard_answer || "",
                    standard_answer: it.standard_answer || "",
                  }))
                : [],
            })
          );
        }
      }

      // 若没有任何修改，直接返回
      if (tasks.length === 0) {
        message.info("无可保存的修改");
        setSaving(false);
        return;
      }

      await Promise.all(tasks);

      message.success("评分细则保存成功");
      setIsEditing(false);
      setEditingIndex(null);
      // 成功后更新原始快照并可选地刷新
      originalChoiceGuidelinesRef.current = choiceGuidelines;
      originalSubjectiveGuidelinesRef.current = subjectiveGuidelines;
      originalEssayGuidelineRef.current = essayGuideline;
      await fetchScoreRules();
    } catch (error) {
      console.error("保存评分细则失败:", error);
      message.error("保存评分细则失败，请稍后重试");
    } finally {
      setSaving(false);
    }
  };

  // 添加新的主观题评分细则
  const handleAddSubjective = () => {
    const newItem = {
      question_id: subjectiveGuidelines.length + 1,
      question_content: "",
      score: 0,
      standard_answer: "",
      grading_guideline: "",
    };
    setSubjectiveGuidelines([...subjectiveGuidelines, newItem]);
    setEditingIndex(subjectiveGuidelines.length);
  };

  // 删除主观题评分细则
  const handleDeleteSubjective = (index) => {
    const updated = subjectiveGuidelines.filter((_, i) => i !== index);
    // 重新编号
    const renumbered = updated.map((item, i) => ({
      ...item,
      question_id: i + 1,
    }));
    setSubjectiveGuidelines(renumbered);
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  // 更新主观题评分细则
  const handleUpdateSubjective = (index, field, value) => {
    const updated = [...subjectiveGuidelines];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setSubjectiveGuidelines(updated);
  };

  // 添加新的选择题评分细则
  const handleAddChoice = () => {
    // 从试卷详情中选择一个尚未使用的真实 question_id
    const usedIds = new Set((choiceGuidelines || []).map((i) => i.question_id));
    const allIds = Array.from(_choiceAnswerMap?.keys?.() ? _choiceAnswerMap.keys() : []);
    const availableIds = allIds.filter((id) => !usedIds.has(id));

    if (availableIds.length === 0) {
      message.warning("没有可添加的选择题（已全部添加）");
      return;
    }

    const pickId = availableIds[0];
    const defaultAnswer = _choiceAnswerMap.get(pickId) || "";
    const newItem = {
      question_id: pickId,
      standard_answer: defaultAnswer,
    };
    setChoiceGuidelines([...(choiceGuidelines || []), newItem]);
    setEditingIndex((choiceGuidelines || []).length);
  };

  // 删除选择题评分细则
  const handleDeleteChoice = (index) => {
    const updated = choiceGuidelines.filter((_, i) => i !== index);
    // 不进行重新编号，保持后端真实 question_id
    setChoiceGuidelines(updated);
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  // 更新选择题评分细则
  const handleUpdateChoice = (index, field, value) => {
    const updated = [...choiceGuidelines];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setChoiceGuidelines(updated);
  };

  // 更新作文评分细则
  const handleUpdateEssay = (field, value) => {
    setEssayGuideline({
      ...essayGuideline,
      [field]: value,
    });
  };

  return (
    <Modal
      title={`${exam?.name || "考试"}评分细则`}
      open={visible}
      onCancel={onCancel}
      footer={
        isEditing ? [
          <Button key="cancel" onClick={handleCancelEdit} icon={<CloseOutlined />}>
            取消
          </Button>,
          <Button 
            key="save" 
            type="primary" 
            onClick={handleSave} 
            loading={saving}
            icon={<SaveOutlined />}
          >
            保存
          </Button>,
        ] : [
          <Button key="edit" type="primary" onClick={handleStartEdit} icon={<EditOutlined />}>
            编辑
          </Button>,
          <Button key="close" onClick={onCancel}>
            关闭
          </Button>,
        ]
      }
      width={800}
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Text>正在获取评分细则...</Text>
        </div>
      ) : error ? (
        <div
          style={{ textAlign: "center", padding: "40px 0", color: "#ff4d4f" }}
        >
          <Text>{error}</Text>
        </div>
      ) : scoreRules || isEditing ? (
        <div className="score-rules-modal-content" style={{ maxHeight: "600px", overflowY: "auto" }}>
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            {/* 选择题评分细则 */}
            <TabPane tab="选择题" key="choice">
              <div className="score-rules-section">
                <div className="score-rules-header">
                  <Title level={5} style={{ margin: 0 }}>选择题评分细则</Title>
                  {isEditing && (
                    <Button 
                      type="dashed" 
                      icon={<PlusOutlined />} 
                      onClick={handleAddChoice}
                      size="small"
                    >
                      添加题目
                    </Button>
                  )}
                </div>
                
                {isEditing ? (
                  <Space direction="vertical" style={{ width: "100%" }} size="middle">
                    {choiceGuidelines.map((section, index) => (
                      <div
                        key={section.question_id || index}
                        className="score-rule-item editing"
                        style={{ display: "flex", gap: "10px", alignItems: "center", padding: "8px 0" }}
                      >
                        <Text strong>题号：</Text>
                        <Text style={{ width: "80px" }}>{section.question_id}</Text>
                        <Text strong>标准答案：</Text>
                        <Input
                          value={section.standard_answer}
                          onChange={(e) => handleUpdateChoice(index, "standard_answer", e.target.value)}
                          placeholder="请输入标准答案（如：A、B、C等）"
                          style={{ width: "120px" }}
                        />
                        <div style={{ marginLeft: "auto" }}>
                          <Popconfirm
                            title="确定要删除这道题目吗？"
                            onConfirm={() => handleDeleteChoice(index)}
                            okText="确定"
                            cancelText="取消"
                          >
                            <Button danger icon={<DeleteOutlined />} size="small">
                              删除
                            </Button>
                          </Popconfirm>
                        </div>
                      </div>
                    ))}
                  </Space>
                ) : (
                  <div className="answer-sheet-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, 60px)", gap: "8px", justifyContent: "center" }}>
                    {choiceGuidelines.map((section, index) => (
                      <div
                        key={section.question_id || index}
                        style={{
                          border: "1px solid #d9d9d9",
                          borderRadius: "4px",
                          padding: "4px",
                          textAlign: "center",
                          backgroundColor: "#fafafa",
                          width: "60px",
                          height: "60px",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between"
                        }}
                      >
                        <div style={{ fontWeight: "bold", fontSize: "12px", color: "#666", flex: "1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {section.question_id}
                        </div>
                        <div style={{ fontSize: "18px", fontWeight: "bold", color: "#1890ff", flex: "1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {section.standard_answer || "__"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {!isEditing && choiceGuidelines.length === 0 && (
                  <div className="empty-state">
                    暂无选择题评分细则
                  </div>
                )}
              </div>
            </TabPane>

            {/* 主观题评分细则 */}
            <TabPane tab="主观题" key="subjective">
              <div className="score-rules-section">
                <div className="score-rules-header">
                  <Title level={5} style={{ margin: 0 }}>主观题评分细则</Title>
                  {isEditing && (
                    <Button 
                      type="dashed" 
                      icon={<PlusOutlined />} 
                      onClick={handleAddSubjective}
                      size="small"
                    >
                      添加题目
                    </Button>
                  )}
                </div>
            
            {subjectiveGuidelines.map((section, index) => (
              <div
                key={index}
                className={`score-rule-item ${isEditing ? "editing" : ""}`}
              >
                {isEditing ? (
                  <Space direction="vertical" style={{ width: "100%" }} size="middle">
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <Text strong>题号：</Text>
                      <InputNumber
                        value={section.question_id}
                        onChange={(value) => handleUpdateSubjective(index, "question_id", value)}
                        min={1}
                        style={{ width: "80px" }}
                      />
                      <Text strong>分值：</Text>
                      <InputNumber
                        value={section.score}
                        onChange={(value) => handleUpdateSubjective(index, "score", value)}
                        min={0}
                        style={{ width: "80px" }}
                      />
                      <div style={{ marginLeft: "auto" }}>
                        <Popconfirm
                          title="确定要删除这道题目吗？"
                          onConfirm={() => handleDeleteSubjective(index)}
                          okText="确定"
                          cancelText="取消"
                        >
                          <Button danger icon={<DeleteOutlined />} size="small">
                            删除
                          </Button>
                        </Popconfirm>
                      </div>
                    </div>
                    
                    <div>
                      <Text strong>题目内容：</Text>
                      <Input
                        value={section.question_content}
                        onChange={(e) => handleUpdateSubjective(index, "question_content", e.target.value)}
                        placeholder="请输入题目内容"
                        style={{ marginTop: "5px" }}
                      />
                    </div>
                    
                    <div>
                      <Text strong>标准答案：</Text>
                      <TextArea
                        value={section.standard_answer}
                        onChange={(e) => handleUpdateSubjective(index, "standard_answer", e.target.value)}
                        placeholder="请输入标准答案"
                        rows={2}
                        style={{ marginTop: "5px" }}
                      />
                    </div>
                    
                    <div>
                      <Text strong>评分标准：</Text>
                      <TextArea
                        value={section.grading_guideline}
                        onChange={(e) => handleUpdateSubjective(index, "grading_guideline", e.target.value)}
                        placeholder="请输入评分标准"
                        rows={3}
                        style={{ marginTop: "5px" }}
                      />
                    </div>
                  </Space>
                ) : (
                  <>
                    <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
                      {section.question_id}、 {section.question_content} ({section.score}分)
                    </div>
                    <div style={{ marginBottom: "5px", color: "#666" }}>
                      标准答案：{section.standard_answer}
                    </div>
                    <div>
                      <Text style={{ color: "#333" }} type="secondary">
                        评分标准：
                      </Text>
                      <Paragraph type="secondary" style={{ margin: 0 }}>
                        {section.grading_guideline}
                      </Paragraph>
                    </div>
                  </>
                )}
              </div>
            ))}
            
                {!isEditing && subjectiveGuidelines.length === 0 && (
                  <div className="empty-state">
                    暂无主观题评分细则
                  </div>
                )}
              </div>
            </TabPane>

            {/* 作文评分标准 */}
            <TabPane tab="作文" key="essay">
              <div className="score-rules-section">
                <Title level={5} style={{ marginBottom: "10px" }}>作文评分细则</Title>
            
            {essayGuideline ? (
              <div
                className={`score-rule-item ${isEditing ? "editing" : ""}`}
              >
                {isEditing ? (
                  <Space direction="vertical" style={{ width: "100%" }} size="middle">
                    <div>
                      <Text strong>题目内容：</Text>
                      <Input
                        value={essayGuideline.question_content}
                        onChange={(e) => handleUpdateEssay("question_content", e.target.value)}
                        placeholder="请输入题目内容"
                        style={{ marginTop: "5px" }}
                      />
                    </div>
                    
                    <div>
                      <Text strong>标准答案/作文要求：</Text>
                      <TextArea
                        value={essayGuideline.standard_answer}
                        onChange={(e) => handleUpdateEssay("standard_answer", e.target.value)}
                        placeholder="请输入标准答案或作文要求"
                        rows={2}
                        style={{ marginTop: "5px" }}
                      />
                    </div>
                    
                    <div>
                      <Text strong>评分标准：</Text>
                      <TextArea
                        value={essayGuideline.grading_guideline}
                        onChange={(e) => handleUpdateEssay("grading_guideline", e.target.value)}
                        placeholder="请输入评分标准"
                        rows={4}
                        style={{ marginTop: "5px" }}
                      />
                    </div>
                  </Space>
                ) : (
                  <>
                    <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
                      {essayGuideline.question_content}
                    </div>
                    <div style={{ marginBottom: "5px", color: "#666" }}>
                      作文要求：{essayGuideline.standard_answer}
                    </div>
                    <div>
                      <Text style={{ color: "#333" }} type="secondary">
                        评分标准：
                      </Text>
                      <Paragraph type="secondary" style={{ margin: 0 }}>
                        {essayGuideline.grading_guideline}
                      </Paragraph>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="empty-state">
                暂无作文评分细则
              </div>
            )}
              </div>
            </TabPane>
          </Tabs>

          {!isEditing && (
            <div
              style={{
                marginTop: "20px",
                paddingTop: "10px",
                borderTop: "1px solid #eee",
              }}
            >
            </div>
          )}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Text>暂无评分细则数据</Text>
        </div>
      )}
    </Modal>
  );
};

export default ScoreRulesModal;
