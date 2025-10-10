import React from "react";
import { Layout } from "antd";
import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./Navbar";

const { Content } = Layout;

const LayoutComponent = () => {
  const location = useLocation();

  // 监听路由变化，当路由改变时滚动到页面顶部
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* 顶部导航 - 使用独立的Navbar组件 */}
      <Navbar />

      {/* 主内容区 */}
      <Content style={{ overflow: "auto" }}>
        <div
          style={{ padding: "64px 24px 40px 24px", background: "#fff", minHeight: 360 }}
        >
          <Outlet />
        </div>
      </Content>
    </Layout>
  );
};

export default LayoutComponent;
