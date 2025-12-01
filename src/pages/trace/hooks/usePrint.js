import { useCallback } from "react";
import { message } from "antd";
import html2canvas from "html2canvas";

/**
 * 打印功能 Hook
 * 支持多页打印（正面+反面）
 */
const usePrint = () => {
  const handlePrint = useCallback(async () => {
    try {
      // 1. 获取页面导航按钮和当前页信息
      const pageNavIndex = document.querySelector('.page-nav-index');
      const nextBtn = document.querySelector('.canvas-page-navigation .page-nav-btn:last-child');
      const prevBtn = document.querySelector('.canvas-page-navigation .page-nav-btn:first-child');
      
      if (!pageNavIndex) {
        message.error('未找到页面导航元素');
        return;
      }

      // 解析总页数
      const pageText = pageNavIndex.textContent; // 格式: "1/2"
      const totalPages = parseInt(pageText.split('/')[1], 10);
      
      if (isNaN(totalPages) || totalPages < 1) {
        message.error('无法获取页面数量');
        return;
      }

      // 2. 显示加载提示
      const loadingMessage = message.loading(`正在生成打印预览 (共${totalPages}页)...`, 0);

      // 3. 截取所有页面
      const pageImages = [];
      
      // 记录当前页
      const currentPageNum = parseInt(pageText.split('/')[0], 10);
      
      // 先回到第一页
      for (let i = currentPageNum; i > 1; i--) {
        if (!prevBtn.disabled) {
          prevBtn.click();
          await new Promise(resolve => setTimeout(resolve, 600));
        }
      }
      
      // 等待第一页加载
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 遍历所有页面截图
      for (let i = 0; i < totalPages; i++) {
        // 等待图片加载完成
        const waitForImage = () => new Promise(resolve => {
          const checkImage = () => {
            const img = document.querySelector('.answer-sheet-image');
            if (img && img.complete && img.naturalHeight > 0) {
              resolve();
            } else {
              setTimeout(checkImage, 100);
            }
          };
          checkImage();
          // 最多等3秒
          setTimeout(resolve, 3000);
        });
        
        await waitForImage();
        
        // 再等一下确保批注渲染完成
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 获取当前页的答题卡元素
        const canvasElement = document.querySelector('.answer-sheet-inner');
        if (!canvasElement) {
          console.error(`未找到第${i + 1}页答题卡元素`);
          continue;
        }

        console.log(`正在截取第 ${i + 1}/${totalPages} 页`);

        // 隐藏背景图片，只保留批注
        const bgImage = canvasElement.querySelector('.answer-sheet-image');
        if (bgImage) {
          bgImage.style.visibility = 'hidden';
        }

        // 截图
        const canvas = await html2canvas(canvasElement, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          allowTaint: false,
          imageTimeout: 0,
        });

        // 恢复背景图片显示
        if (bgImage) {
          bgImage.style.visibility = 'visible';
        }

        const imgData = canvas.toDataURL('image/png', 1.0);
        pageImages.push(imgData);
        
        console.log(`第 ${i + 1} 页截图完成`);

        // 如果不是最后一页，点击下一页
        if (i < totalPages - 1) {
          nextBtn.click();
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      }
      
      console.log(`共截取 ${pageImages.length} 页`);
      
      if (pageImages.length === 0) {
        loadingMessage();
        message.error('未能截取任何页面');
        return;
      }

      // 4. 关闭加载提示
      loadingMessage();

      // 5. 创建打印窗口
      const printWindow = window.open('', '_blank', 'width=1200,height=800');
      if (!printWindow) {
        message.error('无法打开打印窗口，请检查浏览器弹窗设置');
        return;
      }

      // 6. 生成多页图片的 HTML
      const imagesHtml = pageImages.map((imgData, index) => 
        `<div class="page"><img src="${imgData}" alt="答题卡第${index + 1}页" /></div>`
      ).join('');

      // 7. 写入打印页面内容
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
                background: #ffffff;
              }
              .page {
                width: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                page-break-after: always;
                min-height: 100vh;
              }
              .page:last-child {
                page-break-after: auto;
              }
              img {
                max-width: 100%;
                max-height: 100vh;
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
                .page {
                  page-break-after: always;
                  height: 100vh;
                }
                .page:last-child {
                  page-break-after: auto;
                }
                img {
                  max-width: 100%;
                  max-height: 100%;
                }
              }
            </style>
          </head>
          <body>
            ${imagesHtml}
          </body>
        </html>
      `);

      // 8. 关闭文档流
      printWindow.document.close();

      // 9. 等待所有图片加载完成后自动打印
      const images = printWindow.document.querySelectorAll('img');
      let loadedCount = 0;
      
      const checkAllLoaded = () => {
        loadedCount++;
        if (loadedCount === images.length) {
          setTimeout(() => {
            printWindow.focus();
            printWindow.print();
          }, 500);
        }
      };

      images.forEach(img => {
        if (img.complete) {
          checkAllLoaded();
        } else {
          img.onload = checkAllLoaded;
        }
      });

    } catch (error) {
      message.error('生成打印预览失败：' + error.message);
      console.error('打印错误：', error);
    }
  }, []);

  return { handlePrint };
};

export default usePrint;
