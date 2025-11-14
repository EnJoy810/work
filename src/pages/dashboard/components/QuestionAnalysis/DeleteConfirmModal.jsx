import React from "react";
import { Modal } from "antd";

export default function DeleteConfirmModal({ open, loading, student, onOk, onCancel }) {
  return (
    <Modal
      title="确认删除"
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      confirmLoading={loading}
      okText="确定删除"
      cancelText="取消"
      okButtonProps={{ danger: true }}
    >
      {student && (
        <div>
          <div style={{ marginBottom: 16, fontSize: 16, fontWeight: 600, color: "#ff4d4f" }}>
            确定要删除该异常学生吗？
          </div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 14, color: "#666" }}>学生信息：</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>{student.displayName}</div>
            {student.recognizedName && (
              <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>识别姓名：{student.recognizedName}</div>
            )}
            {student.recognizedNo && (
              <div style={{ fontSize: 12, color: "#999" }}>识别学号：{student.recognizedNo}</div>
            )}
          </div>
          <div style={{ fontSize: 14, color: "#ff4d4f", marginTop: 16 }}>
            注意：删除后将无法恢复，该学生的所有批改数据将被永久删除。
          </div>
        </div>
      )}
    </Modal>
  );
}
