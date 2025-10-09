import React from "react";
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
} from "@ant-design/icons";
import { APP_VERSION } from '../utils/appConfig';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Dropdown, Avatar } from "antd";
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
          // width: "90%",
          // margin: "0 auto",
        }}
      >
        {/* 左侧：系统标题 */}
        <div
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
          <span
            style={{
              marginLeft: 8,
              color: "#000",
              marginRight: 8,
              fontSize: 22,
              fontWeight: "bold",
            }}
          >
            清境智能 在线阅卷系统
          </span>
        </div>

        {/* 中间：顶部菜单 - 占据剩余空间并居中展示 */}
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
    </Header>
  );
};

export default Navbar;
