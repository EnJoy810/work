import React, { memo, useMemo, useState, useEffect } from "react";
import { Button, Badge, Tabs } from "antd";
import { LeftOutlined, RightOutlined, UserSwitchOutlined } from "@ant-design/icons";

/**
 * 学生列表组件
 * 使用 React.memo 优化，避免不必要的重新渲染
 */
const StudentList = memo(({ 
  students,
  currentStudentIndex,
  onStudentClick,
  onFilterChange,
}) => {
  // 过滤 Tab：all | matched | absent | abnormal
  const [filterTab, setFilterTab] = useState("all");

  const filteredStudents = useMemo(() => {
    if (!Array.isArray(students)) return [];
    if (filterTab === "matched") {
      return students.filter((s) => s.type === "matched");
    }
    if (filterTab === "absent") {
      return students.filter((s) => s.type === "absent");
    }
    if (filterTab === "abnormal") {
      return students.filter((s) => s.type === "abnormal");
    }
    return students;
  }, [students, filterTab]);

  // 当前学生在过滤后的列表中的位置
  const currentLocalIndex = useMemo(() => {
    const current = students[currentStudentIndex];
    if (!current) return -1;
    return filteredStudents.findIndex((s) => s === current);
  }, [students, currentStudentIndex, filteredStudents]);

  // 当当前选中学生不在当前筛选列表中时，自动选中筛选列表的第一个
  useEffect(() => {
    if (currentLocalIndex === -1 && filteredStudents.length > 0) {
      const first = filteredStudents[0];
      const originalIndex = students.findIndex((s) => s === first);
      if (originalIndex >= 0) {
        onStudentClick(originalIndex);
      }
    }
  }, [currentLocalIndex, filteredStudents, students, onStudentClick]);

  const handlePrevFiltered = () => {
    if (currentLocalIndex > 0) {
      const prevStudent = filteredStudents[currentLocalIndex - 1];
      const originalIndex = students.findIndex((s) => s === prevStudent);
      if (originalIndex >= 0) onStudentClick(originalIndex);
    }
  };

  const handleNextFiltered = () => {
    if (currentLocalIndex !== -1 && currentLocalIndex < filteredStudents.length - 1) {
      const nextStudent = filteredStudents[currentLocalIndex + 1];
      const originalIndex = students.findIndex((s) => s === nextStudent);
      if (originalIndex >= 0) onStudentClick(originalIndex);
    }
  };

  const isPrevDisabled = filteredStudents.length === 0 || currentLocalIndex <= 0;
  const isNextDisabled = filteredStudents.length === 0 || currentLocalIndex === -1 || currentLocalIndex >= filteredStudents.length - 1;

  return (
    <div className="left-panel">
      <div className="student-navigation">
        <h3>
          <UserSwitchOutlined style={{ marginRight: "4px" }} /> 学生导航
        </h3>
        <div className="navigation-controls">
          <Button
            icon={<LeftOutlined />}
            onClick={handlePrevFiltered}
            disabled={isPrevDisabled}
          />
          <span>
            {filteredStudents.length > 0 ? `${(currentLocalIndex >= 0 ? currentLocalIndex + 1 : 0)}/${filteredStudents.length}` : "0/0"}
          </span>
          <Button
            icon={<RightOutlined />}
            onClick={handleNextFiltered}
            disabled={isNextDisabled}
          />
        </div>
      </div>

      {/* 筛选 Tab */}
      <div className="student-filter-tabs">
        <Tabs
          activeKey={filterTab}
          onChange={(k) => {
            setFilterTab(k);
            if (onFilterChange) onFilterChange(k);
          }}
          size="small"
          tabBarGutter={0}
          moreIcon={null}
          items={[
            { key: "all", label: "全部" },
            { key: "matched", label: "正常" },
            { key: "absent", label: "缺考" },
            { key: "abnormal", label: "异常" },
          ]}
        />
      </div>

      <div className="student-list">
        {filteredStudents.map((student) => {
          const originalIndex = students.findIndex((s) => s === student);
          const isActive = originalIndex === currentStudentIndex;
          return (
            <div
              key={`student-${originalIndex}`}
              className={`student-item ${isActive ? "active" : ""}`}
              onClick={() => onStudentClick(originalIndex)}
            >
              <div className="student-info">
                <div className="student-name">{student.name}</div>
                <div className="student-id">学号：{student.studentNo || student.id}</div>
              </div>
              <div className="student-score-section">
                <div className="student-score">{student.score}分</div>
                <Badge
                  status={student.statusBadge || "default"}
                  text={student.status || ""}
                  className="status-badge"
                />
              </div>
            </div>
          );
        })}
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
        student.statusBadge === nextStudent.statusBadge &&
        student.type === nextStudent.type
      );
    })
  );
});

StudentList.displayName = "StudentList";

export default StudentList;

