import React from "react";

/**
 * 密封线组件
 * 用于显示答题卡第一页左侧的密封线内容
 */
const SealingLine = ({ pageHeight }) => {
  return (
    <div
      style={{
        width: "120px",
        height: pageHeight,
        backgroundColor: "white",
        // padding: `${topBottomMargin}px 10px`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        left: 0,
        top: 0,
        zIndex: 1,
      }}
    >
      {/* 垂直排列的密封线内容 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          height: "100%",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* 右侧信息区域与密封线文字 */}
        <div
          style={{
            display: "flex",
            height: "100%",
            position: "relative",
            alignItems: "center",
          }}
        >
          {/* 密封线和信息区域容器 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              height: "100%",
              paddingLeft: "0",
              position: "relative",
            }}
          >
            {/* 密封线虚线和文字组合 - 占满整个高度并均匀分布文字 */}
            <div
              style={{
                position: "absolute",
                right: "-1px",
                top: 0,
                height: "100%",
                width: "2px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {/* 顶部虚线 */}
              <div
                style={{
                  width: "2px",
                  height: "20%",
                  borderRight: "2px dashed #000",
                }}
              ></div>

              {/* "密"字和中间上虚线 */}
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    transform: "rotate(-90deg)",
                    fontWeight: "bold",
                    fontSize: "14px",
                    whiteSpace: "nowrap",
                    padding: "0 10px",
                    backgroundColor: "white",
                    zIndex: 2,
                  }}
                >
                  密
                </div>
                <div
                  style={{
                    position: "absolute",
                    top: "-20px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "2px",
                    height: "20px",
                    borderRight: "2px dashed #000",
                  }}
                ></div>
                <div
                  style={{
                    position: "absolute",
                    bottom: "-20px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "2px",
                    height: "20px",
                    borderRight: "2px dashed #000",
                  }}
                ></div>
              </div>

              {/* 中间上虚线 */}
              <div
                style={{
                  width: "2px",
                  height: "20%",
                  borderRight: "2px dashed #000",
                }}
              ></div>

              {/* "封"字和中间下虚线 */}
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    transform: "rotate(-90deg)",
                    fontWeight: "bold",
                    fontSize: "14px",
                    whiteSpace: "nowrap",
                    padding: "0 10px",
                    backgroundColor: "white",
                    zIndex: 2,
                  }}
                >
                  封
                </div>
                <div
                  style={{
                    position: "absolute",
                    top: "-20px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "2px",
                    height: "20px",
                    borderRight: "2px dashed #000",
                  }}
                ></div>
                <div
                  style={{
                    position: "absolute",
                    bottom: "-20px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "2px",
                    height: "20px",
                    borderRight: "2px dashed #000",
                  }}
                ></div>
              </div>

              {/* 中间下虚线 */}
              <div
                style={{
                  width: "2px",
                  height: "20%",
                  borderRight: "2px dashed #000",
                }}
              ></div>

              {/* "线"字和底部虚线 */}
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    transform: "rotate(-90deg)",
                    fontWeight: "bold",
                    fontSize: "14px",
                    whiteSpace: "nowrap",
                    padding: "0 10px",
                    backgroundColor: "white",
                    zIndex: 2,
                  }}
                >
                  线
                </div>
                <div
                  style={{
                    position: "absolute",
                    top: "-20px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "2px",
                    height: "20px",
                    borderRight: "2px dashed #000",
                  }}
                ></div>
              </div>

              {/* 底部虚线 */}
              <div
                style={{
                  width: "2px",
                  height: "20%",
                  borderRight: "2px dashed #000",
                }}
              ></div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                height: "70%",
                // width: "100%",
                paddingLeft: "10px",
              }}
            >
              {/* 班级信息 - 逆时针旋转90度 */}
              <div
                style={{ transform: "rotate(-90deg)", whiteSpace: "nowrap" }}
              >
                <span style={{ fontSize: "14px" }}>班级：</span>
                <span
                  style={{
                    borderBottom: "1px solid #000",
                    display: "inline-block",
                    minWidth: "60px",
                    marginLeft: "5px",
                  }}
                ></span>
              </div>

              {/* 姓名信息 - 逆时针旋转90度 */}
              <div
                style={{ transform: "rotate(-90deg)", whiteSpace: "nowrap" }}
              >
                <span style={{ fontSize: "14px" }}>姓名：</span>
                <span
                  style={{
                    borderBottom: "1px solid #000",
                    display: "inline-block",
                    minWidth: "60px",
                    marginLeft: "5px",
                  }}
                ></span>
              </div>

              {/* 考场信息 - 逆时针旋转90度 */}
              <div
                style={{ transform: "rotate(-90deg)", whiteSpace: "nowrap" }}
              >
                <span style={{ fontSize: "14px" }}>考场：</span>
                <span
                  style={{
                    borderBottom: "1px solid #000",
                    display: "inline-block",
                    minWidth: "60px",
                    marginLeft: "5px",
                  }}
                ></span>
              </div>

              {/* 座位号信息 - 逆时针旋转90度 */}
              <div
                style={{ transform: "rotate(-90deg)", whiteSpace: "nowrap" }}
              >
                <span style={{ fontSize: "14px" }}>座位号：</span>
                <span
                  style={{
                    borderBottom: "1px solid #000",
                    display: "inline-block",
                    minWidth: "60px",
                    marginLeft: "5px",
                  }}
                ></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SealingLine;
