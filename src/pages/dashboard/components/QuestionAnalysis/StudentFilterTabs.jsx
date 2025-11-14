import React from "react";
import { Tabs } from "antd";

export default function StudentFilterTabs({ activeKey, onChange }) {
  return (
    <Tabs
      activeKey={activeKey}
      onChange={onChange}
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
  );
}
