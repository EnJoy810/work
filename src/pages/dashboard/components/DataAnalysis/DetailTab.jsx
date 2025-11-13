import React, { memo, useMemo } from "react";
import { Card, Table, Empty, Space, Button, Dropdown, Tag } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

/**
 * 学生成绩 Tab 组件
 */
const DetailTab = memo(({ 
  studentsData, 
  studentsLoading,
  currentPage,
  pageSize,
  levelFilter,
  onPageChange,
  onClearFilter,
  onExport,
}) => {
  // 表格列配置（匹配后端下划线命名）
  const columns = useMemo(() => [
    {
      title: "排名",
      dataIndex: "rank",
      key: "rank",
      width: 80,
      align: "center",
      fixed: "left",
    },
    {
      title: "学生姓名",
      dataIndex: "student_name",
      key: "student_name",
      width: 120,
      fixed: "left",
    },
    {
      title: "总分",
      dataIndex: "total_score",
      key: "total_score",
      width: 100,
      align: "center",
      sorter: (a, b) => a.total_score - b.total_score,
      render: (score) => (
        <span style={{ fontSize: 16, fontWeight: 600, color: "#1890ff" }}>
          {score}
        </span>
      ),
    },
    {
      title: "客观题",
      dataIndex: "objective_score",
      key: "objective_score",
      width: 100,
      align: "center",
      sorter: (a, b) => a.objective_score - b.objective_score,
    },
    {
      title: "填空题",
      dataIndex: "fillin_score",
      key: "fillin_score",
      width: 100,
      align: "center",
      sorter: (a, b) => a.fillin_score - b.fillin_score,
    },
    {
      title: "作文题",
      dataIndex: "essay_score",
      key: "essay_score",
      width: 100,
      align: "center",
      sorter: (a, b) => a.essay_score - b.essay_score,
    },
    {
      title: "等级",
      dataIndex: "level",
      key: "level",
      width: 100,
      align: "center",
      render: (level) => {
        const colorMap = {
          特优: "purple",
          优秀: "green",
          良好: "blue",
          及格: "gold",
          不及格: "red",
        };
        return <Tag color={colorMap[level]}>{level}</Tag>;
      },
    },
  ], []);

  return (
    <Card 
      title="学生成绩明细"
      className="table-card"
      style={{ marginTop: 0 }}
      loading={studentsLoading}
      extra={
        <Space>
          {levelFilter && (
            <Button onClick={onClearFilter}>
              清除筛选
            </Button>
          )}
          <Dropdown
            trigger={["click"]}
            menu={{
              items: [
                {
                  key: "grading",
                  label: "批改信息",
                  icon: <DownloadOutlined />,
                  onClick: () => onExport("grading"),
                },
                {
                  key: "essay",
                  label: "作文结果",
                  icon: <DownloadOutlined />,
                  onClick: () => onExport("essay"),
                },
                {
                  key: "simple",
                  label: "学生分数",
                  icon: <DownloadOutlined />,
                  onClick: () => onExport("simple"),
                },
                {
                  key: "analysis",
                  label: "统计分析结果",
                  icon: <DownloadOutlined />,
                  onClick: () => onExport("analysis"),
                },
              ],
            }}
          >
            <Button icon={<DownloadOutlined />}>
              导出为Excel
            </Button>
          </Dropdown>
        </Space>
      }
    >
      {studentsData ? (
        <Table
          columns={columns}
          dataSource={studentsData.students}
          rowKey={(record, index) => `student-${index}-${record.paper_id || record.student_id || ''}`}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: studentsData.total,
            showSizeChanger: false,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: onPageChange,
          }}
          scroll={{ x: 800 }}
        />
      ) : (
        <Empty description="请先加载数据" />
      )}
    </Card>
  );
});

DetailTab.displayName = "DetailTab";

export default DetailTab;

