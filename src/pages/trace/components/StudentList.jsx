import React, { memo, useMemo, useState, useEffect } from "react";
import { Button, Badge, Tabs } from "antd";
import { LeftOutlined, RightOutlined, UserSwitchOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";

/**
 * 学生列表组件 - 参考作文批改页面
 * @param {Object} props
 * @param {Array} props.students - 学生列表
 * @param {number} props.currentStudentIndex - 当前选中的学生索引
 * @param {Function} props.onStudentClick - 选择学生的回调
 */
const StudentList = memo(({ 
  students, 
  currentStudentIndex,
  onStudentClick
}) => {
  // 过滤 Tab：all | matched | absent | abnormal
  const [filterTab, setFilterTab] = useState("all");

  const filteredStudents = useMemo(() => {
    if (!Array.isArray(students)) return [];
    if (filterTab === "matched") {
      return students.filter((s) => s.type === "matched" || s.status === 200 || s.status === "正常");
    }
    if (filterTab === "absent") {
      return students.filter((s) => s.type === "absent" || s.status === "缺考");
    }
    if (filterTab === "abnormal") {
      return students.filter((s) => s.type === "abnormal" || s.status === 4001 || s.status === "异常");
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

  const getStatusIcon = (status) => {
    if (status === 200 || status === "正常") {
      return <CheckCircleOutlined style={{ color: '#1ca87a', fontSize: 14 }} />;
    } else {
      return <ExclamationCircleOutlined style={{ color: '#d14343', fontSize: 14 }} />;
    }
  };


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
          onChange={setFilterTab}
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

      {/* 学生列表 */}
      <div className="student-list-container">
        <div className="student-list__items">
          {filteredStudents.map((student) => {
            const originalIndex = students.findIndex((s) => s === student);
            const isActive = originalIndex === currentStudentIndex;
            return (
              <button
                key={student.student_id}
                type="button"
                className={`student-list__button ${isActive ? 'student-list__button--active' : ''}`}
                onClick={() => onStudentClick(originalIndex)}
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
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default StudentList;
