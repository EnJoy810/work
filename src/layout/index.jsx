import React, { useEffect, useRef } from "react";
import { Layout } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "./Navbar";

const { Content } = Layout;

const CLASS_SENSITIVE_PATHS = [
  "/essay-grading",
  "/question-analysis",
  "/data-analysis",
  "/upload-answer-sheet",
  "/score-process",
];

const LayoutComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedClassId = useSelector((state) => state.class.selectedClassId);
  const previousClassIdRef = useRef(selectedClassId);

  // 监听路由变化，当路由改变时滚动到页面顶部
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  useEffect(() => {
    const previousClassId = previousClassIdRef.current;

    if (!selectedClassId) {
      previousClassIdRef.current = selectedClassId;
      return;
    }

    if (previousClassId && previousClassId !== selectedClassId) {
      const shouldRedirect = CLASS_SENSITIVE_PATHS.some((path) =>
        location.pathname.startsWith(path)
      );

      if (shouldRedirect) {
        navigate("/", {
          replace: true,
          state: { resetByClassSwitch: true },
        });
      }
    }

    previousClassIdRef.current = selectedClassId;
  }, [selectedClassId, location.pathname, navigate]);

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
