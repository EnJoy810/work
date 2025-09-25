import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button, Layout, Typography } from "antd";
import html2pdf from "html2pdf.js";
// import { clearPreviewData } from "../../store/slices/previewSlice";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const ExamPaperPreview = () => {
  const navigate = useNavigate();
  // const dispatch = useDispatch();
  const { examData, answerSheetPages } = useSelector((state) => state.preview);

  // A4尺寸定义（单位：像素，基于72dpi）
  const A4_WIDTH = 595;
  const A4_HEIGHT = 842;

  // 清理预览数据
  // useEffect(() => {
  //   console.log("预览页面组件挂载");
  //   return () => {
  //     console.log("预览页面组件卸载，清理数据");
  //     dispatch(clearPreviewData());
  //   };
  // }, [dispatch]);
  console.log("预览页面 answerSheetPages", answerSheetPages, examData);
  // 组件挂载时滚动到页面顶部
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // 检查是否有预览数据
  useEffect(() => {
    console.log("检查预览数据 - examData:", examData);
    console.log(
      "检查预览数据 - answerSheetPages长度:",
      answerSheetPages.length
    );
    if (!examData && answerSheetPages.length === 0) {
      console.log("无预览数据，导航回设计页面");
      navigate("/exam-paper-design/chinese");
    }
  }, [examData, answerSheetPages, navigate]);

  // 下载PDF功能
  const handleDownloadPDF = () => {
    // 获取所有页面的内容
    const pageElements = document.querySelectorAll(".preview-page-container");

    // 创建一个临时容器来放置所有页面
    const tempContainer = document.createElement("div");

    // 克隆并添加所有页面
    pageElements.forEach((page) => {
      const clonedPage = page.cloneNode(true);
      const pageContent = document.createElement("div");
      pageContent.className = "pdf-page";
      pageContent.appendChild(clonedPage);
      tempContainer.appendChild(pageContent);
    });

    // 设置PDF选项
    const opt = {
      margin: 0,
      padding: 0,
      filename: examData?.basicInfo?.title
        ? `${examData.basicInfo.title}_预览.pdf`
        : "考试试卷.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        letterRendering: true,
        scrollX: 0,
        scrollY: 0,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
    };

    // 生成并下载PDF
    html2pdf()
      .set(opt)
      .from(tempContainer)
      .save()
      .then(() => {
        // 清理临时元素
        while (tempContainer.firstChild) {
          tempContainer.removeChild(tempContainer.firstChild);
        }
      })
      .catch((error) => {
        console.error("生成PDF失败:", error);
        // 如果生成PDF失败，回退到打印功能
        window.print();
      });
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          background: "#fff",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <Title level={4} style={{ margin: 0, color: "#1890ff" }}>
            试卷预览
          </Title>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {/* <Button onClick={handleBack}>返回编辑</Button> */}
          <Button type="primary" onClick={handleDownloadPDF}>
            下载PDF
          </Button>
        </div>
      </Header>
      <Content style={{ padding: "24px", background: "#f0f2f5" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {answerSheetPages.length > 0 ? (
            answerSheetPages.map((pageContent, index) => (
              <div
                key={index}
                className="preview-page-container"
                style={{
                  // width: A3_WIDTH / 4, // 缩小4倍以在屏幕上显示
                  // height: A3_HEIGHT / 4,
                  backgroundColor: "white",
                  // border: "1px solid #d9d9d9",
                  // marginBottom: "24px",
                  // padding: "16px",
                  overflow: "hidden",
                  // boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                }}
                dangerouslySetInnerHTML={{ __html: pageContent }}
              />
            ))
          ) : (
            <div
              style={{
                padding: "48px",
                textAlign: "center",
                backgroundColor: "white",
                borderRadius: "8px",
              }}
            >
              <Text type="secondary">暂无预览内容</Text>
            </div>
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default ExamPaperPreview;
