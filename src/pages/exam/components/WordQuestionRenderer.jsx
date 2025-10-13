import QuestionWrapper from "./QuestionWrapper";

/**
 * 作文题渲染组件
 * 负责根据字数渲染作文格子页面
 *
 * @param {Object} props
 * @param {Object} props.wordQuestionValues - 作文题相关配置
 * @param {Object} props.pageConfig - 页面配置信息
 * @param {number} props.totalPages - 总页数（不包含作文题页面）
 * @param {number} props.questionIndex - 作文题在题目列表中的索引
 * @param {Function} props.onEdit - 编辑回调函数
 * @param {Function} props.onDelete - 删除回调函数
 */
const WordQuestionRenderer = ({
  wordQuestionValues = {},
  pageConfig = {},
  totalPages = 0,
  questionIndex = 0,
  onEdit,
  onDelete,
}) => {
  // 从配置中获取页面尺寸信息
  const {
    pageWidth = 841,
    pageHeight = 1189,
    pageMargin = 20,
    pagePoint = 10, // 添加pagePoint定义，默认值与pageMargin相同
    topBottomMargin = 20,
  } = pageConfig;

  // 从wordQuestionValues中获取总字数，如果没有则使用默认值
  if (!wordQuestionValues.totalWordCount) {
    return null;
  }
  const totalGrids = wordQuestionValues.totalWordCount || 0;
  const gridsPerPage = 600;
  const totalWordPages = Math.ceil(totalGrids / gridsPerPage);

  // 获取作文题相关信息
  const questionNumber = wordQuestionValues.questionNumber || "一";
  const score = wordQuestionValues.score || 60;
  const subQuestionNumber = wordQuestionValues.subQuestionNumber || 0;

  // 生成作文格子页面
  return Array.from({ length: totalWordPages }).map((_, pageIndex) => {
    const pageContent = (
      <div
        key={`word-page-${pageIndex}`}
        className="answer-sheet-page"
        style={{
          width: pageWidth,
          height: pageHeight,
          backgroundColor: "white",
          padding: `${topBottomMargin}px ${pageMargin}px`,
          borderRadius: "8px",
          marginBottom: "20px",
          position: "relative",
          boxShadow: "0px 0px 3px 3px #E5E9F2",
          overflow: "hidden",
        }}
      >
        {/* 四个黑色正方形用于定位 */}
        <div
          style={{
            position: "absolute",
            top: `${pagePoint}px`,
            left: `${pagePoint}px`,
            width: "10px",
            height: "10px",
            backgroundColor: "black",
          }}
        />
        {/*   左上角增加一个方框，用来识别方向 作文都显示 */}
        {pageIndex % 2 === 0 && (
          <div
            style={{
              position: "absolute",
              top: `${pagePoint}px`,
              left: `${pagePoint * 3}px`,
              width: "10px",
              height: "10px",
              backgroundColor: "black",
            }}
          />
        )}

        <div
          style={{
            position: "absolute",
            top: `${pagePoint}px`,
            right: `${pagePoint}px`,
            width: "10px",
            height: "10px",
            backgroundColor: "black",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: `${pagePoint}px`,
            left: `${pagePoint}px`,
            width: "10px",
            height: "10px",
            backgroundColor: "black",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: `${pagePoint}px`,
            right: `${pagePoint}px`,
            width: "10px",
            height: "10px",
            backgroundColor: "black",
          }}
        />

        {/* 作文题标题 - 只在第一页显示 */}
        {pageIndex === 0 && (
          <div
            className="font-black"
            style={{
              marginBottom: "20px",
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            {/* 第{questionNumber}题 */}
            <span style={{ marginLeft: 20 }}>
              {wordQuestionValues.subQuestionNumber}. &nbsp;
            </span>
            作文题（{score}分）
          </div>
        )}

        {/* 作文格子容器 */}
        <div style={{ flex: 1, overflow: "auto" }}>
          {/* 作文格子表格 */}
          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: "0 10px",
            }}
          >
            <tbody>
              {/* 计算当前页应该显示的总行数：第一页22行，其他页23行 */}
              {Array.from({
                length: pageIndex === 0 ? 22 : 23,
              }).map((_, rowIndex) => {
                // 计算当前行的起始格子序号
                const pageStartGrid =
                  pageIndex * (pageIndex === 0 ? 22 * 25 : 23 * 25) + 1;
                const rowStartGrid = pageStartGrid + rowIndex * 25;

                // 如果当前行的起始格子已经超过总格子数，则不再渲染
                if (rowStartGrid > totalGrids) return null;

                return (
                  <tr key={rowIndex}>
                    {/* 一行固定显示25个格子 */}
                    {Array.from({ length: 25 }).map((_, colIndex) => {
                      const gridNumber = rowStartGrid + colIndex;

                      return (
                        <td
                          key={colIndex}
                          style={{
                            width: "32px",
                            height: "32px",
                            border: "1px solid #000",
                            textAlign: "center",
                            verticalAlign: "middle",
                            fontSize: "12px",
                            position: "relative",
                          }}
                        >
                          {/* 在最右边，当格子数是200的倍数且不等于总字数时显示序号 */}
                          {colIndex === 24 &&
                            gridNumber % 200 === 0 &&
                            gridNumber !== totalGrids && (
                              <span
                                style={{
                                  position: "absolute",
                                  bottom: "-20px",
                                  right: "0",
                                  transform: "translateY(-50%) scale(0.7)",
                                  fontSize: "10px",
                                  color: "#333",
                                  whiteSpace: "nowrap",
                                  fontWeight: "bold",
                                }}
                              >
                                {gridNumber}
                              </span>
                            )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 页码 */}
        <div
          style={{
            position: "absolute",
            bottom: pageMargin,
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: "12px",
            color: "#666",
          }}
        >
          第 {totalPages + questionIndex * totalWordPages + pageIndex + 1} 页 /
          共 {totalPages + totalWordPages} 页
        </div>
      </div>
    );

    // 使用QuestionWrapper包裹每个作文题页面，实现每一页都能显示编辑、删除按钮
    return (
      <QuestionWrapper
        key={`word-page-wrapper-${pageIndex}`}
        subjectiveItem={wordQuestionValues}
        onEdit={onEdit}
        onDelete={onDelete}
      >
        {pageContent}
      </QuestionWrapper>
    );
  });
};

export default WordQuestionRenderer;
