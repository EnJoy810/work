import React, { useMemo } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "../utils/classNames";
// No tabs or navigation here; this component only renders grouped students

const StudentList = ({
  students = [],
  selectedKey,
  onSelectKey,
  getKeyFn,
  isLoading = false,
}) => {
  const getKey = (s, idx) => {
    if (typeof getKeyFn === "function") return getKeyFn(s, idx);
    return String(s?.paperId || s?.id || s?.studentNo || `${s?.name || "unknown"}-${idx}`);
  };

  const groups = useMemo(() => {
    const byType = { matched: [], abnormal: [], absent: [] };
    students.forEach((s, i) => {
      const type = s.__type__ || (() => {
        const st = String(s?.status || "");
        if (/缺考|缺席|未到|未交/.test(st)) return "absent";
        if (/异常|待匹配|录入|错误|无效/.test(st)) return "abnormal";
        return "matched";
      })();
      byType[type]?.push({ s, idx: i });
    });
    return byType;
  }, [students]);

  const renderGroup = (title, list, iconType) => {
    if (!list || list.length === 0) return null;
    return (
      <section className="student-list__section">
        <div className="student-list__section-header">
          <h2>{title}</h2>
          <span>{list.length}</span>
        </div>
        <div className="student-list__items">
          {list.map(({ s }, i) => {
            const key = getKey(s, i);
            const active = selectedKey && key === selectedKey;
            return (
              <button
                key={`${key}-${i}`}
                type="button"
                onClick={() => onSelectKey?.(key)}
                className={cn("student-list__button", active ? "student-list__button--active" : "")}
              >
                <span className="student-list__info">
                  <span className="student-list__name">
                    {iconType === "matched" ? (
                      <CheckCircle2 size={16} color="#2463eb" />
                    ) : iconType === "absent" ? (
                      <Circle size={16} color="#a0a7ba" />
                    ) : (
                      <Circle size={16} color="#fa8c16" />
                    )}
                    {s.name || s.displayName || "未知姓名"}
                  </span>
                  {s.studentNo ? (
                    <div className="student-list__meta-group">
                      <span className="student-list__meta">学号：{s.studentNo}</span>
                    </div>
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    );
  };

  return (
    <div className={cn("student-list")}> 
      <div className="student-list__scroll">
        {isLoading ? (
          <div className="student-list__empty">学生列表加载中...</div>
        ) : students.length === 0 ? (
          <div className="student-list__empty">暂无学生数据</div>
        ) : (
          <>
            {renderGroup("正常学生", groups.matched, "matched")}
            {renderGroup("异常学生", groups.abnormal, "abnormal")}
            {renderGroup("缺考学生", groups.absent, "absent")}
          </>
        )}
      </div>
    </div>
  );
};

export default StudentList;
