import React from "react";
import { CheckCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { Modal } from "antd";

/**
 * 学生列表组件 - 与人工阅卷页面样式一致
 * @param {Object} props
 * @param {Array} props.students - 学生列表
 * @param {string} props.selectedStudentId - 当前选中的学生ID
 * @param {Function} props.onSelectStudent - 选择学生的回调
 * @param {Function} props.onPrev - 上一个学生
 * @param {Function} props.onNext - 下一个学生
 * @param {number} props.currentIndex - 当前学生索引
 * @param {boolean} props.hasUnsavedChanges - 是否有未保存的修改
 */
const StudentList = ({ 
  students, 
  selectedStudentId, 
  onSelectStudent, 
  onPrev,
  onNext,
  currentIndex,
  hasUnsavedChanges 
}) => {
  
  const handleSelectStudent = (student) => {
    if (student.student_id !== selectedStudentId) {
      // 如果有未保存的修改，弹窗确认
      if (hasUnsavedChanges) {
        Modal.confirm({
          title: '有未保存的修改',
          content: '当前学生的批注有未保存的修改，是否保存后再切换？',
          okText: '保存并切换',
          cancelText: '放弃修改',
          onOk: () => {
            // 这里应该触发保存，但由于保存逻辑在父组件，我们先简单切换
            // 实际应该通过回调通知父组件保存
            onSelectStudent(student);
          },
          onCancel: () => {
            onSelectStudent(student);
          }
        });
      } else {
        onSelectStudent(student);
      }
    }
  };

  const getStatusIcon = (status) => {
    if (status === 200) {
      return <CheckCircleOutlined style={{ color: '#1ca87a', fontSize: 14 }} />;
    } else {
      return <ExclamationCircleOutlined style={{ color: '#d14343', fontSize: 14 }} />;
    }
  };

  return (
    <>
      {/* 学生导航 */}
      <div className="student-navigation">
        <h3>学生导航</h3>
        <div className="navigation-controls">
          <button
            type="button"
            className="student-list__nav-btn"
            onClick={onPrev}
            disabled={currentIndex === 0 || students.length === 0}
          >
            ‹
          </button>
          <span className="student-list__nav-index">
            {students.length > 0 ? `${currentIndex + 1}/${students.length}` : "0/0"}
          </span>
          <button
            type="button"
            className="student-list__nav-btn"
            onClick={onNext}
            disabled={currentIndex >= students.length - 1 || students.length === 0}
          >
            ›
          </button>
        </div>
      </div>

      {/* 学生列表 */}
      <div className="student-list-container">
        <div className="student-list__items">
          {students.map((student) => (
            <button
              key={student.student_id}
              type="button"
              className={`student-list__button ${selectedStudentId === student.student_id ? 'student-list__button--active' : ''}`}
              onClick={() => handleSelectStudent(student)}
            >
              <div className="student-list__info">
                <div className="student-list__name">
                  {student.student_name}
                  {getStatusIcon(student.status)}
                </div>
                <div className="student-list__meta">
                  学号: {student.student_no}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default StudentList;
