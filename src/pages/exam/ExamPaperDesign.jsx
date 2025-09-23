import React from "react";
import { Card, Button, Typography, Divider, Row, Col } from "antd";
import {
  BookOutlined,
  CalculatorOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Title, Paragraph } = Typography;

/**
 * 答题卷设计页面组件 - 显示各科目的试卷入口
 */
const ExamPaperDesign = () => {
  return (
    <div style={{ padding: "24px" }}>
      <Card title="答题卷设计" bordered={false}>
        <div style={{ marginBottom: "24px" }}>
          <Title level={4}>科目选择</Title>
          <Paragraph>
            请选择您要设计的科目试卷，系统支持语文、数学和英语三种科目的试卷设计。
          </Paragraph>
        </div>

        <Divider />

        {/* 科目选择区域 */}
        <Row gutter={[16, 16]}>
          {/* 语文试卷入口 */}
          <Col xs={24} md={8}>
            <Card
              hoverable
              style={{
                height: "200px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
              actions={[
                <Link to="/exam-paper-design/chinese">
                  <Button type="primary" icon={<BookOutlined />}>
                    进入设计
                  </Button>
                </Link>,
              ]}
            >
              <div style={{ textAlign: "center" }}>
                <BookOutlined
                  style={{
                    fontSize: "48px",
                    color: "#1890ff",
                    marginBottom: "16px",
                  }}
                />
                <h3 style={{ marginBottom: "8px" }}>语文试卷设计</h3>
                <p style={{ color: "#666", fontSize: "14px" }}>
                  设计语文科目的考试试卷
                </p>
              </div>
            </Card>
          </Col>

          {/* 数学试卷入口 */}
          <Col xs={24} md={8}>
            <Card
              hoverable
              style={{
                height: "200px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
              actions={[
                <Link to="/exam-paper-design/math">
                  <Button type="primary" icon={<CalculatorOutlined />}>
                    进入设计
                  </Button>
                </Link>,
              ]}
            >
              <div style={{ textAlign: "center" }}>
                <CalculatorOutlined
                  style={{
                    fontSize: "48px",
                    color: "#52c41a",
                    marginBottom: "16px",
                  }}
                />
                <h3 style={{ marginBottom: "8px" }}>数学试卷设计</h3>
                <p style={{ color: "#666", fontSize: "14px" }}>
                  设计数学科目的考试试卷
                </p>
              </div>
            </Card>
          </Col>

          {/* 英语试卷入口 */}
          <Col xs={24} md={8}>
            <Card
              hoverable
              style={{
                height: "200px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
              actions={[
                <Link to="/exam-paper-design/english">
                  <Button type="primary" icon={<GlobalOutlined />}>
                    进入设计
                  </Button>
                </Link>,
              ]}
            >
              <div style={{ textAlign: "center" }}>
                <GlobalOutlined
                  style={{
                    fontSize: "48px",
                    color: "#faad14",
                    marginBottom: "16px",
                  }}
                />
                <h3 style={{ marginBottom: "8px" }}>英语试卷设计</h3>
                <p style={{ color: "#666", fontSize: "14px" }}>
                  设计英语科目的考试试卷
                </p>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ExamPaperDesign;
