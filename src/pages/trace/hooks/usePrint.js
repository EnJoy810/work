import { useCallback } from "react";
import { message } from "antd";
import html2canvas from "html2canvas";

/**
 * 打印功能 Hook
 */
const usePrint = () => {
  const handlePrint = useCallback(async () => {
    try {
      // 1. 获取答题卡容器元素
      const canvasElement = document.querySelector('.answer-sheet-inner');
      if (!canvasElement) {
        message.error('未找到答题卡元素');
        return;
      }

      // 2. 显示加载提示
      const loadingMessage = message.loading('正在生成打印预览...', 0);

      // 3. 等待 DOM 完全渲染
      await new Promise(resolve => setTimeout(resolve, 100));

      // 4. 使用 html2canvas 渲染答题卡
      const canvas = await html2canvas(canvasElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: true,
        imageTimeout: 0,
      });

      // 5. 转换为高清图片
      const imgData = canvas.toDataURL('image/png', 1.0);

      // 6. 关闭加载提示
      loadingMessage();

      // 7. 创建打印窗口
      const printWindow = window.open('', '_blank', 'width=1200,height=800');
      if (!printWindow) {
        message.error('无法打开打印窗口，请检查浏览器弹窗设置');
        return;
      }

      // 8. 写入打印页面内容
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>打印答题卡</title>
            <style>
              @page {
                size: A3 landscape;
                margin: 0.5cm;
              }
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              html, body {
                width: 100%;
                height: 100%;
                overflow: hidden;
              }
              body {
                display: flex;
                justify-content: center;
                align-items: center;
                background: #ffffff;
              }
              img {
                max-width: 100%;
                max-height: 100%;
                width: auto;
                height: auto;
                object-fit: contain;
                display: block;
              }
              @media print {
                body {
                  margin: 0;
                  padding: 0;
                }
                img {
                  width: 100%;
                  height: auto;
                  page-break-inside: avoid;
                }
              }
            </style>
          </head>
          <body>
            <img src="${imgData}" alt="答题卡" />
          </body>
        </html>
      `);

      // 9. 关闭文档流
      printWindow.document.close();

      // 10. 等待图片加载完成后自动打印
      const img = printWindow.document.querySelector('img');
      if (img) {
        const triggerPrint = () => {
          setTimeout(() => {
            printWindow.focus();
            printWindow.print();
          }, 500);
        };

        img.onload = triggerPrint;
        
        // 如果图片已经加载（从缓存）
        if (img.complete) {
          triggerPrint();
        }
      }
    } catch (error) {
      message.error('生成打印预览失败：' + error.message);
      console.error('打印错误：', error);
    }
  }, []);

  return { handlePrint };
};

export default usePrint;
