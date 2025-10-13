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
  const { paperSize = 'A3' } = examData || {}; //页面默认A3版式
  // A4尺寸定义（单位：像素，基于72dpi）
  const A4_WIDTH = 783;
  const A4_HEIGHT = 1135;

  // A3尺寸定义（单位：像素，基于72dpi）
  const A3_WIDTH = 783 * 2;
  const A3_HEIGHT = 1135; // 1165 

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
    // 创建一个临时容器来放置所有页面
    const tempContainer = document.createElement("div");

    if (paperSize === 'A3') {
      // 获取所有A3预览容器
      const a3Containers = document.querySelectorAll(".a3-preview-container");

      // 克隆并添加所有A3容器
      a3Containers.forEach((container) => {
        const clonedContainer = container.cloneNode(true);

        // 重置样式，确保以A3尺寸渲染
        clonedContainer.style.width = A3_WIDTH + "px";
        clonedContainer.style.height = A3_HEIGHT + "px";
        clonedContainer.style.margin = "0 0 0 0";
        clonedContainer.style.padding = "0";
        clonedContainer.style.boxShadow = "none";
        clonedContainer.style.border = "none";

        // 为每个A3容器创建一个PDF页面容器
        const pageContent = document.createElement("div");
        pageContent.className = "pdf-a3-page";
        pageContent.appendChild(clonedContainer);
        tempContainer.appendChild(pageContent);
      });
    } else {
      // 获取所有A4预览容器
      const a4Containers = document.querySelectorAll(".a4-preview-container");

      // 克隆并添加所有A4容器
      a4Containers.forEach((container) => {
        const clonedContainer = container.cloneNode(true);

        // 重置样式，确保以A4尺寸渲染
        clonedContainer.style.width = A4_WIDTH + "px";
        clonedContainer.style.height = A4_HEIGHT + "px";
        clonedContainer.style.margin = "0 0 0 0";
        clonedContainer.style.padding = "0";
        clonedContainer.style.boxShadow = "none";
        clonedContainer.style.border = "none";

        // 为每个A4容器创建一个PDF页面容器
        const pageContent = document.createElement("div");
        pageContent.className = "pdf-a4-page";
        pageContent.appendChild(clonedContainer);
        tempContainer.appendChild(pageContent);
      });
    }

    // 设置PDF选项，根据paperSize选择不同的尺寸和方向
    const opt = {
      margin: 0,
      padding: 0,
      filename: examData?.basicInfo?.title
        ? `${examData.basicInfo.title}_答题卷_${paperSize}.pdf`
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
        unit: "px", // 使用像素单位以匹配我们的尺寸定义
        format: paperSize === 'A3' ? [A3_WIDTH, A3_HEIGHT] : [A4_WIDTH, A4_HEIGHT],
        orientation: paperSize === 'A3' ? "landscape" : "portrait",
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
      <Content style={{ background: "#f0f2f5" }}>
        <div
          style={{
            overflow: "scroll",
            width: "100%",
            height: "100%",
            // display: "flex",
            // flexDirection: "column",
            // alignItems: "center",
          }}
        >
          {answerSheetPages.length > 0 ? (
            // 根据paperSize决定如何展示页面
            paperSize === 'A3' ? (
              // A3版式：将页面两两分组，每两页放在一个A3大小的容器中
              Array.from(
                { length: Math.ceil(answerSheetPages.length / 2) },
                (_, groupIndex) => {
                  const leftPage = answerSheetPages[groupIndex * 2];
                  const rightPage = answerSheetPages[groupIndex * 2 + 1];

                  return (
                    <div
                      key={groupIndex}
                      className="a3-preview-container"
                      style={{
                        width: A3_WIDTH, // A3尺寸宽度
                        height: A3_HEIGHT,
                        backgroundColor: "white",
                        marginBottom: "24px",
                        padding: "10px",
                        overflow: "hidden",
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      {/* 左页 */}
                      {leftPage && (
                        <div
                          className="preview-page-container left-page"
                          style={{
                            width: "49%",
                            height: "100%",
                            backgroundColor: "white",
                            overflow: "hidden",
                          }}
                          dangerouslySetInnerHTML={{ __html: leftPage }}
                        />
                      )}

                      {/* 右页 */}
                      {rightPage && (
                        <div
                          className="preview-page-container right-page"
                          style={{
                            width: "49%",
                            height: "100%",
                            backgroundColor: "white",
                            overflow: "hidden",
                          }}
                          dangerouslySetInnerHTML={{ __html: rightPage }}
                        />
                      )}
                    </div>
                  );
                }
              )
            ) : (
              // A4版式：每页单独放在一个A4大小的容器中
              answerSheetPages.map((page, pageIndex) => (
                <div
                  key={pageIndex}
                  className="a4-preview-container"
                  style={{
                    width: A4_WIDTH, // A4尺寸宽度
                    height: A4_HEIGHT,
                    backgroundColor: "white",
                    marginBottom: "24px",
                    padding: "10px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    className="preview-page-container"
                    style={{
                      width: "100%",
                      height: "100%",
                      backgroundColor: "white",
                      overflow: "hidden",
                    }}
                    dangerouslySetInnerHTML={{ __html: page }}
                  />
                </div>
              ))
            )
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
