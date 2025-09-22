import React from "react";
import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const { Content } = Layout;

const LayoutComponent = () => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* 顶部导航 - 使用独立的Navbar组件 */}
      <Navbar />

      {/* 主内容区 */}
      <Content style={{ overflow: "auto" }}>
        <div style={{ padding: 24, background: "#fff", minHeight: 360 }}>
          <Outlet />
        </div>
      </Content>
    </Layout>
  );
};

export default LayoutComponent;
