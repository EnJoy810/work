import React from "react";
import { Button } from "antd";
import { UserOutlined, DeleteOutlined, ReloadOutlined } from "@ant-design/icons";

export default function StudentItem({ student, active, onClick, onModifyMatch, onDeleteAbnormal, onManualEntry }) {
  const typeColors = {
    matched: { accent: "#52c41a", bg: "#ffffff", border: "#e8f5e9" },
    abnormal: { accent: "#ff4d4f", bg: "#ffffff", border: "#ffa39e" },
    absent: { accent: "#fa8c16", bg: "#ffffff", border: "#ffd591" },
  };
  const colors = typeColors[student.type] || typeColors.matched;

  return (
    <div
      className={`student-item ${active ? "active" : ""}`}
      onClick={onClick}
      style={{
        backgroundColor: colors.bg,
        border: `1px solid ${active ? colors.accent : colors.border}`,
        borderRadius: 8,
        marginBottom: 10,
        padding: "14px 16px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: active ? `0 2px 8px ${colors.accent}20, 0 1px 2px rgba(0,0,0,0.05)` : "0 1px 2px rgba(0,0,0,0.04)",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.04)";
          e.currentTarget.style.transform = "translateY(0)";
        }
      }}
    >
      <div className="student-info" style={{ flex: 1, minWidth: 0 }}>
        <div
          className="student-name"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 16,
            fontWeight: 600,
            color: "#262626",
            marginBottom: student.type !== "matched" ? 8 : 4,
            lineHeight: 1.4,
          }}
        >
          <span>{student.displayName}</span>
          {student.nameImageUrl ? (
            <img
              src={student.nameImageUrl}
              alt={student.displayName || student.recognizedNo || "学生姓名"}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
              style={{
                width: "6em",
                height: "2em",
                objectFit: "cover",
                borderRadius: 6,
                border: "1px solid #f0f0f0",
                pointerEvents: "auto",
              }}
            />
          ) : null}
        </div>
        {student.type !== "abnormal" ? (
          <div style={{ fontSize: 12, color: "#8c8c8c", marginTop: 4 }}>
            学号：
            {student.classStudent?.student_no ||
              student.classStudent?.studentNo ||
              student.recognizedNo ||
              student.v2Data?.student_no ||
              "未知"}
          </div>
        ) : null}
      </div>
      <div
        className="student-score-section"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 8,
          marginTop: 4,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {student.type !== "matched" && (
            <span
              style={{
                color: colors.accent,
                fontSize: 11,
                fontWeight: 500,
                border: `1px solid ${colors.border}`,
                backgroundColor: `${colors.accent}08`,
                borderRadius: 10,
                padding: "3px 10px",
                lineHeight: 1.4,
              }}
            >
              {student.status}
            </span>
          )}
          {student.score !== null && student.score !== undefined && student.type !== "absent" && (
            <div
              className="student-score"
              style={{ fontSize: 15, fontWeight: 600, color: "#1890ff", lineHeight: 1.2 }}
            >
              {student.score}分
            </div>
          )}
        </div>
        {student.type === "abnormal" && (
          <div style={{ display: "flex", gap: 6 }}>
            <Button
              size="small"
              type="text"
              icon={<UserOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onModifyMatch?.(student);
              }}
              style={{ fontSize: 12, padding: "2px 6px", height: 24, color: "#595959" }}
            >
              修改
            </Button>
            <Button
              size="small"
              type="text"
              icon={<DeleteOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onDeleteAbnormal?.(student);
              }}
              style={{ fontSize: 12, padding: "2px 8px", height: 24, color: "#ff4d4f" }}
            >
              删除
            </Button>
          </div>
        )}
        {student.type === "matched" && (
          <div style={{ display: "flex", gap: 6 }}>
            <Button
              size="small"
              type="text"
              icon={<UserOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onModifyMatch?.(student);
              }}
              style={{ fontSize: 12, padding: "2px 6px", height: 24, color: "#595959" }}
            >
              修改
            </Button>
          </div>
        )}
        {student.type === "absent" && (
          <Button
            size="small"
            type="text"
            icon={<ReloadOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onManualEntry?.(student);
            }}
            style={{ fontSize: 12, padding: "2px 8px", height: 24, color: "#595959" }}
          >
            人工录入成绩
          </Button>
        )}
      </div>
    </div>
  );
}
