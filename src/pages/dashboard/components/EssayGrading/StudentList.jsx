import React, { memo } from "react";
import { Button, Badge } from "antd";
import { LeftOutlined, RightOutlined, UserSwitchOutlined } from "@ant-design/icons";

/**
 * 学生列表组件
 * 使用 React.memo 优化，避免不必要的重新渲染
 */
const StudentList = memo(({
  students,
  currentStudentIndex,
  onPrevStudent,
  onNextStudent,
  onStudentClick,
}) => {
  return (
    <div className="left-panel">
      <div className="student-navigation">
        <h3>
          <UserSwitchOutlined style={{ marginRight: "4px" }} /> 学生导航
        </h3>
        <div className="navigation-controls">
          <Button
            icon={<LeftOutlined />}
            onClick={onPrevStudent}
            disabled={currentStudentIndex === 0}
          />
          <span>
            {currentStudentIndex + 1}/{students.length}
          </span>
          <Button
            icon={<RightOutlined />}
            onClick={onNextStudent}
            disabled={currentStudentIndex === students.length - 1}
          />
        </div>
      </div>
      <div className="student-list">
        {students.map((student, index) => (
          <div
            key={`student-${index}`}
            className={`student-item ${
              index === currentStudentIndex ? "active" : ""
            }`}
            onClick={() => onStudentClick(index)}
          >
            <div className="student-info">
              <div className="student-name">{student.name}</div>
              <div className="student-id">学号：{student.id}</div>
            </div>
            <div className="student-score-section">
              <div className="student-score">{student.score}分</div>
              <Badge
                status={
                  student.statusType === "success"
                    ? "success"
                    : student.statusType === "processing"
                    ? "processing"
                    : "warning"
                }
                text={student.status}
                className="status-badge"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数，优化性能
  return (
    prevProps.currentStudentIndex === nextProps.currentStudentIndex &&
    prevProps.students.length === nextProps.students.length &&
    prevProps.students.every((student, index) => {
      const nextStudent = nextProps.students[index];
      return (
        student.name === nextStudent.name &&
        student.id === nextStudent.id &&
        student.score === nextStudent.score &&
        student.status === nextStudent.status &&
        student.statusType === nextStudent.statusType
      );
    })
  );
});

StudentList.displayName = "StudentList";

export default StudentList;

