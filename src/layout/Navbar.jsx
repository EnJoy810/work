import React, { useState, useEffect } from "react";
import {
  HomeOutlined,
  UserOutlined,
  FileTextOutlined,
  DatabaseOutlined,
  UserAddOutlined,
  SettingOutlined,
  ToolOutlined,
  LogoutOutlined,
  DownOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { APP_VERSION } from '../utils/appConfig';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Dropdown, Avatar, Drawer } from "antd";
import { useMessageService } from "../components/common/message";
import { useSelector, useDispatch } from "react-redux";
import { clearUserInfo } from "../store/slices/userSlice";
import "./navbar.css";
import LogoIcon from "../components/common/LogoIcon";

const { Header } = Layout;

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.user);
  const { showSuccess } = useMessageService();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth > 768 && window.innerWidth <= 1024);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 用户菜单配置
  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "个人资料",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "系统设置",
    },
    {
      type: "divider",
    },
    {
      key: "version",
      label: `版本号：${APP_VERSION}`,
    },
    {
      key: "logout",
      danger: true,
      icon: <LogoutOutlined />,
      label: "退出登录",
    },
  ];

  // 导航菜单列表，包含路径信息用于路由跳转
  const menuList = [
    {
      key: "1",
      icon: <HomeOutlined />,
      label: "仪表盘",
      path: "/",
    },
    {
      key: "2",
      icon: <FileTextOutlined />,
      label: "考试管理",
      path: "/exams",
    },
    {
      key: "6",
      icon: <FileTextOutlined />,
      label: "答题卷设计",
      path: "/exam-paper-design",
    },
    {
      key: "3",
      icon: <DatabaseOutlined />,
      label: "题库",
      path: "/questions",
    },
    {
      key: "4",
      icon: <UserAddOutlined />,
      label: "学生管理",
      path: "/users",
    },
    {
      key: "5",
      icon: <SettingOutlined />,
      label: "系统设置",
      path: "/settings",
    },
  ];

  const handleUserMenuClick = (e) => {
    if (e.key === "logout") {
      // 退出登录逻辑 - 使用Redux清除用户信息
      dispatch(clearUserInfo());
      showSuccess("退出登录成功");
      navigate("/login", { replace: true });
    }
  };

  // 监听窗口尺寸变化
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsTablet(window.innerWidth > 768 && window.innerWidth <= 1024);
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 切换侧边菜单显示状态
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // 关闭侧边菜单
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <Header
      className="nav-bar-header"
      style={{
        padding: 0,
        background: "#fff",
        boxShadow: "0 1px 4px rgba(0,21,41,0.28)",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: "100%",
        }}
      >
        {/* 移动端菜单按钮 */}
        {isMobile && (
          <button
            className="mobile-menu-button"
            onClick={toggleMenu}
            style={{
              background: "none",
              border: "none",
              padding: "0 16px",
              color: "#000",
              fontSize: "20px",
              cursor: "pointer",
            }}
          >
            {isMenuOpen ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </button>
        )}
        {/* 左侧：系统标题 */}
        <div
          className="logo-container"
          style={{
            display: "flex",
            alignItems: "center",
            padding: "0 24px",
            color: "#000",
            fontSize: 18,
            fontWeight: "bold",
          }}
        >
          <LogoIcon fontSize={18} />
          {!isTablet && (
            <span
              style={{
                marginLeft: 8,
                color: "#000",
                marginRight: 8,
                fontSize: isMobile ? 16 : 22,
                fontWeight: "bold",
              }}
            >
              清境智能 在线阅卷系统
            </span>
          )}
        </div>

        {/* 桌面端顶部菜单 */}
        {!isMobile && (
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {menuList.map((item) => {
              // 判断当前路由是否匹配菜单项的路径
              const isActive =
                location.pathname === item.path ||
                (item.path !== "/" &&
                  location.pathname.startsWith(item.path + "/"));

              return (
                <Link
                  key={item.key}
                  to={item.path}
                  className={`menu-item ${isActive ? "active" : ""}`}
                  style={{ textDecoration: "none" }}
                >
                  {item.icon}
                  <span className="menu-item-label">{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* 右侧：用户信息 */}
        <Dropdown
          menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
          trigger={["click"]}
        >
          <div className="user-drop" style={{}}>
            <Avatar
              src={userInfo?.avatar}
              size={22}
              icon={<UserOutlined />}
              style={{ marginRight: 8, backgroundColor: "#1890ff" }}
            />
            <span style={{ marginRight: 8 }}>{userInfo?.username || " "}</span>
            <DownOutlined style={{ fontSize: "12px" }} />
          </div>
        </Dropdown>
      </div>

      {/* 移动端左侧抽屉菜单 */}
      <Drawer
        title="菜单导航"
        placement="left"
        onClose={closeMenu}
        open={isMenuOpen && isMobile}
        width={250}
        style={{
          zIndex: 1000,
        }}
      >
        <div className="mobile-menu-container">
          {menuList.map((item) => {
            // 判断当前路由是否匹配菜单项的路径
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/" &&
                location.pathname.startsWith(item.path + "/"));

            return (
              <Link
                key={item.key}
                to={item.path}
                onClick={closeMenu}
                className={`mobile-menu-item ${isActive ? "active" : ""}`}
                style={{
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 16px",
                  marginBottom: "8px",
                  borderRadius: "6px",
                  color: isActive ? "#fff" : "#000",
                  backgroundColor: isActive ? "#001529" : "transparent",
                }}
              >
                {item.icon}
                <span style={{ marginLeft: 12 }}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </Drawer>
    </Header>
  );
};

export default Navbar;
