import React from "react";
import { Modal } from "antd";

export default function ManualEntryModal({ open, loading, onOk, onCancel }) {
  return (
    <Modal
      title="人工录入成绩"
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      confirmLoading={loading}
      okText="确定"
      cancelText="取消"
    >
      <div style={{ fontSize: 14, color: "#333", lineHeight: 1.6 }}>
        <div>会将学生初始化为0分并跳转至人工批阅窗口，需要手动为每一题打分。</div>
        <div>作文需进入查看作文批改界面，对该学生打分</div>
        <div style={{ marginTop: 8 }}>是否对该学生进行成绩录入？</div>
      </div>
    </Modal>
  );
}
