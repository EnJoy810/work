import { useState, useEffect } from "react";
import { Modal, Typography, Button } from "antd";
import request from "../../../utils/request";

const { Title, Text, Paragraph } = Typography;

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
    }
  }, [visible, exam?.exam_id]);

  return (
    <Modal
      title={`${exam?.name || "考试"} 评分细则`}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>
          关闭
        </Button>,
      ]}
      width={700}
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
      ) : scoreRules ? (
        <>
          <div>
            <div style={{ fontSize: "14px" }}>
              {(scoreRules.subjective_guideline
                ? JSON.parse(scoreRules.subjective_guideline)
                : []
              ).map((section, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: "15px",
                    padding: "10px",
                    backgroundColor: "#fafafa",
                    borderRadius: "4px",
                  }}
                >
                  <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
                    {section.question_id}、 {section.question_content} (
                    {section.score}分)
                  </div>
                  <div style={{ marginBottom: "5px", color: "#666" }}>
                    {section.standard_answer}
                  </div>
                  <div>
                    <Text style={{ color: "#333" }} type="secondary">
                      评分标准:{" "}
                    </Text>
                    <Paragraph type="secondary" style={{ margin: 0 }}>
                      {section.grading_guideline}
                    </Paragraph>
                  </div>
                </div>
              ))}
            </div>

            {/* 作文评分标准 */}
            {scoreRules.essay_guideline && (
              <div style={{ fontSize: "14px" }}>
                <div
                  style={{
                    marginBottom: "15px",
                    padding: "10px",
                    backgroundColor: "#fafafa",
                    borderRadius: "4px",
                  }}
                >
                  <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
                    {JSON.parse(scoreRules.essay_guideline).question_content}
                  </div>
                  <div style={{ marginBottom: "5px", color: "#666" }}>
                    {JSON.parse(scoreRules.essay_guideline).standard_answer}
                  </div>
                  <div>
                    <Text style={{ color: "#333" }} type="secondary">
                      评分标准:{" "}
                    </Text>
                    <Paragraph type="secondary" style={{ margin: 0 }}>
                      {JSON.parse(scoreRules.essay_guideline).grading_guideline}
                    </Paragraph>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div
            style={{
              marginTop: "10px",
              paddingTop: "10px",
              borderTop: "1px solid #eee",
            }}
          >
            <Text type="secondary">
              注：最终评分结果以系统实际计算为准，如有疑问请联系管理员。
            </Text>
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Text>暂无评分细则数据</Text>
        </div>
      )}
    </Modal>
  );
};

export default ScoreRulesModal;
