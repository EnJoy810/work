import React from "react";
import { Modal, Select } from "antd";

export default function ModifyMatchModal({
  open,
  loading,
  student,
  classStudentOptions = [],
  selectedClassStudentId,
  onChangeSelected,
  onOk,
  onCancel,
}) {
  return (
    <Modal
      title="修改对应学生"
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      confirmLoading={loading}
      okText="确定"
      cancelText="取消"
    >
      {student && (
        <div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>当前异常学生：</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{student.displayName}</div>
            {student.recognizedName && (
              <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
                识别姓名：{student.recognizedName}
              </div>
            )}
            {student.recognizedNo && (
              <div style={{ fontSize: 12, color: "#999" }}>识别学号：{student.recognizedNo}</div>
            )}
          </div>
          <div>
            <div style={{ fontSize: 14, marginBottom: 8 }}>选择要匹配的班级学生：</div>
            <Select
              style={{ width: "100%" }}
              placeholder="请选择班级学生"
              value={selectedClassStudentId}
              onChange={onChangeSelected}
              showSearch
              filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
              options={classStudentOptions}
            />
          </div>
        </div>
      )}
    </Modal>
  );
}
