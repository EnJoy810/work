import React, { useMemo } from "react";
import StudentItem from "./StudentItem";
import { CheckCircleOutlined, EditOutlined, InboxOutlined } from "@ant-design/icons";

function GroupHeader({ title, count, color, icon }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, marginTop: 24, paddingLeft: 4 }}>
      <div style={{ width: 3, height: 16, backgroundColor: color, borderRadius: 2, flexShrink: 0 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {icon}
        <span style={{ fontSize: 15, fontWeight: 600, color: "#262626", letterSpacing: 0.2 }}>{title}</span>
        <span style={{ marginLeft: 6 }}>({count})</span>
      </div>
    </div>
  );
}

export default function StudentList({
  students,
  selectedKey,
  onSelectKey,
  onModifyMatch,
  onDeleteAbnormal,
  onManualEntry,
  getKeyFn,
}) {
  const fallbackGetKey = (s, idx) =>
    String(
      s?.paperId ||
        s?.v2Data?.paperId ||
        s?.v2Data?.paper_id ||
        s?.v2Data?.student_no ||
        s?.classStudent?.student_no ||
        s?.recognizedNo ||
        `${s?.displayName || "unknown"}-${s?.type || "t"}-${idx}`
    );
  const getKey = (s, idx) => (getKeyFn ? getKeyFn(s, idx) : fallbackGetKey(s, idx));

  const matchedStudents = useMemo(() => students.filter((s) => s.type === "matched"), [students]);
  const abnormalStudents = useMemo(() => students.filter((s) => s.type === "abnormal"), [students]);
  const absentStudents = useMemo(() => students.filter((s) => s.type === "absent"), [students]);

  if (students.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px", color: "#bfbfbf" }}>
        <InboxOutlined style={{ fontSize: 48, marginBottom: 12, opacity: 0.4 }} />
        <div style={{ fontSize: 14, marginTop: 8 }}>暂无学生数据</div>
      </div>
    );
  }

  return (
    <>
      {matchedStudents.length > 0 && (
        <div>
          <GroupHeader
            title="正常学生"
            count={matchedStudents.length}
            color="#52c41a"
            icon={<CheckCircleOutlined style={{ fontSize: 14, color: "#52c41a" }} />}
          />
          {matchedStudents.map((student, i) => {
            const baseKey = getKey(student, i);
            const reactKey = `${baseKey}-matched-${i}`;
            return (
              <StudentItem
                key={reactKey}
                student={student}
                active={baseKey === selectedKey}
                onClick={(e) => {
                  if (e.target.tagName === "BUTTON" || e.target.closest("button")) return;
                  onSelectKey?.(baseKey);
                }}
                onModifyMatch={onModifyMatch}
                onDeleteAbnormal={onDeleteAbnormal}
                onManualEntry={onManualEntry}
              />
            );
          })}
        </div>
      )}

      {abnormalStudents.length > 0 && (
        <div>
          <GroupHeader
            title="异常学生"
            count={abnormalStudents.length}
            color="#ff4d4f"
            icon={<EditOutlined style={{ fontSize: 14, color: "#ff4d4f" }} />}
          />
          {abnormalStudents.map((student, i) => {
            const baseKey = getKey(student, i);
            const reactKey = `${baseKey}-abnormal-${i}`;
            return (
              <StudentItem
                key={reactKey}
                student={student}
                active={baseKey === selectedKey}
                onClick={(e) => {
                  if (e.target.tagName === "BUTTON" || e.target.closest("button")) return;
                  onSelectKey?.(baseKey);
                }}
                onModifyMatch={onModifyMatch}
                onDeleteAbnormal={onDeleteAbnormal}
                onManualEntry={onManualEntry}
              />
            );
          })}
        </div>
      )}

      {absentStudents.length > 0 && (
        <div>
          <GroupHeader
            title="缺考/批改错误"
            count={absentStudents.length}
            color="#fa8c16"
            icon={<InboxOutlined style={{ fontSize: 14, color: "#fa8c16" }} />}
          />
          {absentStudents.map((student, i) => {
            const baseKey = getKey(student, i);
            const reactKey = `${baseKey}-absent-${i}`;
            return (
              <StudentItem
                key={reactKey}
                student={student}
                active={baseKey === selectedKey}
                onClick={(e) => {
                  if (e.target.tagName === "BUTTON" || e.target.closest("button")) return;
                  onSelectKey?.(baseKey);
                }}
                onModifyMatch={onModifyMatch}
                onDeleteAbnormal={onDeleteAbnormal}
                onManualEntry={onManualEntry}
              />
            );
          })}
        </div>
      )}
    </>
  );
}
