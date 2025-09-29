import { useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Carousel, Typography, Card, Space, Button } from "antd";
import {
  LeftOutlined,
  RightOutlined,
  DownloadOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

/**
 * 评分过程查看页面
 * 展示考试评分过程的图片轮播
 */
const ScoreProcess = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const examId = searchParams.get("examId");

  // 创建carousel引用
  const carouselRef = useRef(null);
  
  // 模拟评分过程图片数据
  const scoreProcessImages = useMemo(
    () => [
      {
        id: 1,
        title: "试卷扫描",
        description: "考试结束后，对学生答题卡进行扫描和数字化处理",
        url: "https://picsum.photos/id/1/800/600",
      },
      {
        id: 2,
        title: "客观题自动评分",
        description: "系统自动识别客观题答案并进行评分",
        url: "https://picsum.photos/id/2/800/600",
      },
      {
        id: 3,
        title: "主观题人工审核",
        description: "教师对主观题进行评分和审核",
        url: "https://picsum.photos/id/3/800/600",
      },
      {
        id: 4,
        title: "成绩统计",
        description: "系统统计和分析考试成绩数据",
        url: "https://picsum.photos/id/4/800/600",
      },
      {
        id: 5,
        title: "成绩发布",
        description: "考试成绩最终确认并发布给学生",
        url: "https://picsum.photos/id/5/800/600",
      },
    ],
    []
  );



  // 图片加载失败时的回退方案
  const handleImageError = (e) => {
    e.target.src = "https://picsum.photos/id/20/800/600";
  };

  return (
    <div style={{ padding: "24px", minHeight: "80vh" }}>
      <div style={{ marginBottom: "24px" }}>
        <Title level={3}>考试评分过程查看</Title>
        <Text type="secondary">考试ID: {examId || "未知"}</Text>
      </div>

      <Card
        title="评分流程展示"
        extra={
          <Button icon={<DownloadOutlined />} type="default">
            下载完整报告
          </Button>
        }
        style={{ marginBottom: "24px" }}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "500px",
              marginBottom: "16px",
            }}
          >
            {/* 自定义前一个按钮 */}
            <Button
              type="primary"
              shape="circle"
              icon={<LeftOutlined />}
              onClick={() => carouselRef.current?.prev()}
              style={{
                position: "absolute",
                top: "50%",
                left: "20px",
                zIndex: 10,
                transform: "translateY(-50%)",
                opacity: 0.8,
              }}
            />
            
            <Carousel
              ref={carouselRef}
              dots={{
                className: "custom-dots",
                style: {
                  bottom: "10px",
                },
              }}
              arrows={false}
              autoplay
              fade
              infinite
              style={{ height: "100%" }}
            >
              {scoreProcessImages.map((image) => (
                <div
                  key={image.id}
                  style={{ height: "100%", position: "relative" }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      backgroundColor: "#f5f5f5",
                    }}
                  >
                    <img
                      src={image.url}
                      alt={image.title}
                      onError={handleImageError}
                      style={{
                        maxWidth: "90%",
                        maxHeight: "70%",
                        objectFit: "contain",
                        marginBottom: "16px",
                      }}
                    />
                    <div style={{ textAlign: "center", padding: "0 20px" }}>
                      <Title level={4} style={{ margin: "0 0 8px 0" }}>
                        {image.title}
                      </Title>
                      <Text>{image.description}</Text>
                    </div>
                  </div>
                </div>
              ))}
            </Carousel>
            
            {/* 自定义后一个按钮 */}
            <Button
              type="primary"
              shape="circle"
              icon={<RightOutlined />}
              onClick={() => carouselRef.current?.next()}
              style={{
                position: "absolute",
                top: "50%",
                right: "20px",
                zIndex: 10,
                transform: "translateY(-50%)",
                opacity: 0.8,
              }}
            />
          </div>
        </Space>
      </Card>

      <Card title="评分过程说明">
        <Typography>
          <Paragraph>
            本页面展示了考试从完成到成绩发布的完整评分流程，包括试卷扫描、客观题自动评分、主观题人工审核、成绩统计和成绩发布等环节。
          </Paragraph>
          <Paragraph>
            通过图片轮播的方式，可以直观地了解每个评分阶段的工作内容和流程。如有任何疑问，请联系系统管理员。
          </Paragraph>
        </Typography>
      </Card>
    </div>
  );
};

export default ScoreProcess;
