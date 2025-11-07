import { useState, useEffect } from "react";
import { Modal, Typography, Button, Input, InputNumber, Form, Space, Popconfirm, message } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, SaveOutlined, CloseOutlined } from "@ant-design/icons";
import request from "../../../utils/request";
import { updateSubjectiveGuideline, updateEssayGuideline } from "../../../api/grading";
import "./ScoreRulesModal.css";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

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
  const [subjectiveGuidelines, setSubjectiveGuidelines] = useState([]);
  const [essayGuideline, setEssayGuideline] = useState(null);
  
  // 编辑中的项索引
  const [editingIndex, setEditingIndex] = useState(null);

  // 获取评分细则数据
  const fetchScoreRules = async () => {
    if (!exam?.exam_id) {
      setError("考试ID不存在");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 调用API获取评分细则，传递exam_id参数
      const response = await request.get("/grading/exam/guideline", {
        exam_id: exam.exam_id,
      });
      // 假设接口返回的数据格式与模拟数据一致
      setScoreRules(response.data);
      
      // 解析并设置编辑数据
      const subjective = response.data?.subjective_guideline 
        ? JSON.parse(response.data.subjective_guideline)
        : [];
      setSubjectiveGuidelines(subjective);
      
      const essay = response.data?.essay_guideline 
        ? JSON.parse(response.data.essay_guideline)
        : null;
      setEssayGuideline(essay);
      
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
  }, [visible, exam?.exam_id]);

  // 进入编辑模式
  const handleStartEdit = () => {
    setIsEditing(true);
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingIndex(null);
    // 重新从原始数据恢复
    if (scoreRules) {
      const subjective = scoreRules?.subjective_guideline 
        ? JSON.parse(scoreRules.subjective_guideline)
        : [];
      setSubjectiveGuidelines(subjective);
      
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
      // 分别调用两个接口更新主观题和作文评分细则
      const promises = [];

      // 更新主观题评分细则
      if (subjectiveGuidelines && subjectiveGuidelines.length > 0) {
        promises.push(
          updateSubjectiveGuideline({
            exam_id: exam.exam_id,
            guidelines: subjectiveGuidelines,
          })
        );
      }

      // 更新作文评分细则
      if (essayGuideline) {
        promises.push(
          updateEssayGuideline({
            exam_id: exam.exam_id,
            essay_guideline: essayGuideline,
          })
        );
      }

      // 并行执行所有更新请求
      await Promise.all(promises);

      message.success("评分细则保存成功");
      setIsEditing(false);
      setEditingIndex(null);
      // 重新获取数据
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

  // 更新作文评分细则
  const handleUpdateEssay = (field, value) => {
    setEssayGuideline({
      ...essayGuideline,
      [field]: value,
    });
  };

  return (
    <Modal
      title={`${exam?.name || "考试"} 评分细则`}
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
          {/* 主观题评分细则 */}
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

          {/* 作文评分标准 */}
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

          {!isEditing && (
            <div
              style={{
                marginTop: "20px",
                paddingTop: "10px",
                borderTop: "1px solid #eee",
              }}
            >
              <Text type="secondary">
                注：最终评分结果以系统实际计算为准，如有疑问请联系管理员。
              </Text>
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
