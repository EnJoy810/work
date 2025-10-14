import React, { useState } from "react";
import { Card, Form, Input, Button } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserInfo } from "../../store/slices/userSlice";
import {
  setClassList,
  setSelectedClassId,
} from "../../store/slices/classSlice";
import { useMessageService } from "../../components/common/message";
import LogoIcon from "../../components/common/LogoIcon";
import request from "../../utils/request";
import { encryptPassword } from "../../utils/tools";
import "../../App.css";
import "./styles/loginWithShowcase.css";

// 导入登录导览组件
import LoginShowcase from "./LoginShowcase";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showSuccess, showError } = useMessageService();

  // 显示登录表单
  const handleShowLoginForm = () => {
    setShowLoginForm(true);
    // 滚动到登录表单区域
    setTimeout(() => {
      const loginSection = document.getElementById("login-section");
      if (loginSection) {
        loginSection.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  // 处理登录表单提交
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // 模拟登录请求
      console.log("登录信息:", values);

      // 密码加密处理 - 使用公共工具函数
      const encryptedValues = { ...values };
      try {
        // 调用公共的密码加密函数
        encryptedValues.password = encryptPassword(values.password);
      } catch (cryptoError) {
        console.warn("密码加密失败，使用原始密码:", cryptoError);
        // 加密失败时使用原始密码
        encryptedValues.password = values.password;
      }
      console.log("encryptedValues", encryptedValues);
      // 实际项目中，这里应该调用真实的登录API
      let response;
      try {
        // 根据vite.config.js中的代理配置，使用'/api'前缀
        response = await request.post("/auth/login", encryptedValues);
        console.log("登录响应:", response);

        // 登录成功提示
        showSuccess("登录成功");

        // 设置登录状态到Redux
        dispatch(
          setUserInfo({
            userInfo: response,
            token: response.token,
          })
        );

        // 检查用户角色
        // if (response.role === "TEACHER") {
        //   try {
        //     // 教师角色需要获取班级列表
        //     const classResponse = await request.get(
        //       `/teacher-class/class_list/${response.userId}`
        //     );
        //     console.log("班级列表响应:", classResponse);

        //     // 设置班级列表到Redux
        //     dispatch(setClassList(classResponse.data || []));

        //     // 默认选择第一个班级
        //     if (classResponse.data && classResponse.data.length > 0) {
        //       dispatch(setSelectedClassId(classResponse.data[0].id));
        //     }
        //     navigate("/");
        //   } catch (classError) {
        //     console.warn("获取班级列表失败:", classError);
        //     // 即使获取班级列表失败，也继续登录流程
        //     navigate("/");
        //   }
        // } else {
        // 跳转到首页
        navigate("/");
        // }
      } catch (apiError) {
        // dispatch(
        //   setUserInfo({
        //     userInfo: {},
        //     token: "111",
        //   })
        // );
        console.warn("登录请求失败:", apiError);
        // 如果API请求失败，使用模拟数据
      }
    } catch (error) {
      showError("登录失败，请检查用户名和密码");
      console.error("登录错误:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-with-showcase-container">
      {/* 导览部分 - 仅在未显示登录表单时显示 */}
      {!showLoginForm && <LoginShowcase onShowLogin={handleShowLoginForm} />}

      {/* 登录表单部分 */}
      {showLoginForm && (
        <div id="login-section" className="login-container">
          <Card
            size="small"
            title={
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 10,
                }}
              >
                <LogoIcon fontSize={20} />
                <div style={{ marginLeft: 12 }}>
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: "bold",
                      marginBottom: 2,
                    }}
                  >
                    清境智能
                  </div>
                  <div style={{ fontSize: "14px", color: "#666" }}>
                    在线阅卷系统
                  </div>
                </div>
              </div>
            }
            className="login-card"
            variant="outlined"
            styles={{
              header: { backgroundColor: "#fff", padding: 0 },
              body: { padding: "10px 0" },
            }}
          >
            <div style={{ marginBottom: 24, textAlign: "center" }}>
              <h3
                style={{
                  marginBottom: 8,
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#333",
                }}
              >
                欢迎登录
              </h3>
            </div>

            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item
                name="username"
                label="用户名"
                rules={[{ required: true, message: "请输入用户名" }]}
              >
                <Input placeholder="请输入用户名" />
              </Form.Item>

              <Form.Item
                name="password"
                label="密码"
                rules={[{ required: true, message: "请输入密码" }]}
              >
                <Input.Password
                  placeholder="请输入密码"
                  iconRender={(visible) =>
                    visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                  }
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="login-button"
                  loading={loading}
                >
                  登录
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Login;
