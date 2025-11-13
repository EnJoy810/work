import { Menu } from "lucide-react";

const ManualHeader = ({ stats, onToggleSidebar }) => {
  return (
    <header className="manual-header">
      <button
        type="button"
        onClick={onToggleSidebar}
        className="manual-header__toggle"
        aria-label="展开学生列表"
      >
        <Menu size={18} />
      </button>
      <div className="manual-header__stats">
        <span className="manual-header__stat manual-header__stat--todo">
          待批阅<strong>{stats.ungradedCount}</strong>
        </span>
        <span className="manual-header__stat manual-header__stat--done">
          已批阅<strong>{stats.gradedCount}</strong>
        </span>
        <span className="manual-header__stat manual-header__stat--total">
          总计<strong>{stats.totalCount}</strong>
        </span>
      </div>
    </header>
  );
};

export default ManualHeader;
