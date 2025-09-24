import React from "react";

/**
 * 考试信息输入组件
 * 用于显示和编辑班级、姓名、考场、座位号等考试信息
 */
const ExamInfoSection = () => {
  return (
    <div
      style={{
        width: "100%",
        backgroundColor: "white",
        marginBottom: "20px",
        padding: "15px",
        border: "1px solid #e8e8e8",
        borderRadius: "4px",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "12px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
          }}
        >
          {/* 班级信息 */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px", color: "#333" }}>班级：</span>
            <span
              style={{
                borderBottom: "1px solid #000",
                display: "inline-block",
                minWidth: "100px",
                height: "20px",
              }}
            ></span>
          </div>

          {/* 姓名信息 */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px", color: "#333" }}>姓名：</span>
            <span
              style={{
                borderBottom: "1px solid #000",
                display: "inline-block",
                minWidth: "100px",
                height: "20px",
              }}
            ></span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
          }}
        >
          {/* 考场信息 */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px", color: "#333" }}>考场：</span>
            <span
              style={{
                borderBottom: "1px solid #000",
                display: "inline-block",
                minWidth: "100px",
                height: "20px",
              }}
            ></span>
          </div>

          {/* 座位号信息 */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px", color: "#333" }}>座位号：</span>
            <span
              style={{
                borderBottom: "1px solid #000",
                display: "inline-block",
                minWidth: "100px",
                height: "20px",
              }}
            ></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamInfoSection;
