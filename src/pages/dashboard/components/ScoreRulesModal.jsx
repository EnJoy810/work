import { Modal, Typography, Button } from "antd";

const { Title, Text, Paragraph } = Typography;

/**
 * 评分细则弹窗组件
 * @param {Object} props
 * @param {boolean} props.visible - 弹窗是否可见
 * @param {function} props.onCancel - 关闭弹窗回调函数
 * @param {Object} props.exam - 考试数据
 */
const ScoreRulesModal = ({ visible, onCancel, exam }) => {
  // 模拟评分细则数据
  const getScoreRules = () => {
    // 这里可以根据实际情况从API获取评分细则
    return {
      totalScore: exam?.totalScore || 150,
      sections: [
        {
          name: "选择题",
          score: 60,
          description: "每题3分，共20题",
          standard: "选择正确得全分，错误或未作答不得分",
        },
        {
          name: "填空题",
          score: 30,
          description: "每题2分，共15题",
          standard: "答案完全正确得全分，部分正确视情况给分",
        },
        {
          name: "解答题",
          score: 40,
          description: "共5题",
          standard: "按步骤给分，最终答案正确但过程不完整视情况扣分",
        },
        {
          name: "作文题",
          score: 20,
          description: "1题",
          standard: "根据内容、结构、语言表达等方面综合评分",
        },
      ],
    };
  };

  const scoreRules = getScoreRules();

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
      <div style={{ marginBottom: "20px" }}>
        <Title level={5} style={{ marginBottom: "10px" }}>
          考试基本信息
        </Title>
        <div style={{ fontSize: "14px", color: "#666" }}>
          <div>学科: {exam?.subject || "未知"}</div>
          <div>年级: {exam?.grade || "未知"}</div>
          <div>总分: {exam?.totalScore || "未知"}分</div>
          <div>创建时间: {exam?.createTime || "未知"}</div>
        </div>
      </div>

      <div>
        <Title level={5} style={{ marginBottom: "10px" }}>
          评分标准明细
        </Title>
        <div style={{ fontSize: "14px" }}>
          {scoreRules.sections.map((section, index) => (
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
                {section.name} ({section.score}分)
              </div>
              <div style={{ marginBottom: "5px", color: "#666" }}>
                {section.description}
              </div>
              <div style={{ color: "#333" }}>
                <Text type="secondary">评分标准: </Text>
                <Paragraph type="secondary" style={{ margin: 0 }}>
                  {section.standard}
                </Paragraph>
              </div>
            </div>
          ))}
        </div>
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
    </Modal>
  );
};

export default ScoreRulesModal;
