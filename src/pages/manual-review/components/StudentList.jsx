import { useMemo } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "../utils/classNames";

const StudentList = ({
  students,
  currentStudentId,
  currentQuestionId,
  onStudentSelect,
  isOpen,
  isLoading = false,
  resolveScore,
}) => {
  // 检测是否有同名或同学号的学生，用于决定是否显示 paperId
  const hasDuplicateNamesOrNos = useMemo(() => {
    const nameCount = new Map();
    const noCount = new Map();
    students.forEach((student) => {
      if (student.name) {
        nameCount.set(student.name, (nameCount.get(student.name) || 0) + 1);
      }
      if (student.studentNo) {
        noCount.set(student.studentNo, (noCount.get(student.studentNo) || 0) + 1);
      }
    });
    // 如果有同名或同学号的学生，返回 true
    return (
      Array.from(nameCount.values()).some((count) => count > 1) ||
      Array.from(noCount.values()).some((count) => count > 1)
    );
  }, [students]);

  const { graded, ungraded, hasStudents } = useMemo(() => {
    const withScore = students.map((student) => {
      let value;
      if (resolveScore) {
        value = resolveScore(student);
      } else if (student?.scores && student.scores[currentQuestionId] !== undefined) {
        value = student.scores[currentQuestionId];
      }
      return {
        ...student,
        __score__: value,
      };
    });
    const ungradedList = withScore.filter(
      (student) => student.__score__ === undefined || student.__score__ === null,
    );
    const gradedList = withScore.filter(
      (student) => student.__score__ !== undefined && student.__score__ !== null,
    );
    return {
      graded: gradedList,
      ungraded: ungradedList,
      hasStudents: withScore.length > 0,
    };
  }, [currentQuestionId, resolveScore, students]);

  const getStudentKey = (student, listType, index) => {
    // 使用 paperId 作为唯一标识，确保同名同学号的学生能被区分
    const baseKey = student?.paperId ?? student?.id ?? student?.studentNo ?? "student";
    return `${listType}-${baseKey}-${index}`;
  };

  return (
    <aside className={cn("student-list", isOpen ? "student-list--open" : "")}>
      <div className="student-list__scroll">
        {isLoading && !hasStudents ? (
          <div className="student-list__empty">学生列表加载中...</div>
        ) : hasStudents ? (
          <>
            <section className="student-list__section">
              <div className="student-list__section-header">
                <h2>待批学生</h2>
                <span>{ungraded.length}</span>
              </div>
              {ungraded.length > 0 ? (
                <div className="student-list__items">
                  {ungraded.map((student, index) => (
                    <button
                      key={getStudentKey(student, "ungraded", index)}
                      type="button"
                      onClick={() => onStudentSelect(student.id)}
                      className={cn(
                        "student-list__button",
                        currentStudentId === student.id ? "student-list__button--active" : "",
                      )}
                    >
                      <span className="student-list__info">
                        <span className="student-list__name">
                          <Circle size={16} color="#a0a7ba" />
                          {student.name}
                        </span>
                        <div className="student-list__meta-group">
                          {student.studentNo && <span className="student-list__meta">学号：{student.studentNo}</span>}
                        </div>
                      </span>
                      <span className="student-list__meta">未评分</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="student-list__empty">暂无待批学生</div>
              )}
            </section>

            {graded.length > 0 && (
              <section className="student-list__section">
                <div className="student-list__section-header">
                  <h2>已批学生</h2>
                  <span>{graded.length}</span>
                </div>
                <div className="student-list__items">
                  {graded.map((student, index) => (
                    <button
                      key={getStudentKey(student, "graded", index)}
                      type="button"
                      onClick={() => onStudentSelect(student.id)}
                      className={cn(
                        "student-list__button",
                        currentStudentId === student.id ? "student-list__button--active" : "",
                      )}
                    >
                      <span className="student-list__info">
                        <span className="student-list__name">
                          <CheckCircle2 size={16} color="#2463eb" />
                          {student.name}
                        </span>
                        <div className="student-list__meta-group">
                          {student.studentNo && <span className="student-list__meta">学号：{student.studentNo}</span>}
                        </div>
                      </span>
                      <span className="student-list__score">
                        {student.__score__}
                        <span className="student-list__score-unit">分</span>
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <div className="student-list__empty">暂无学生数据</div>
        )}
      </div>
    </aside>
  );
};

export default StudentList;
