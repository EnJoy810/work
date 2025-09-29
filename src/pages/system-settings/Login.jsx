import React, { useState } from "react";
import { Card, Form, Input, Select, Button } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserInfo } from "../../store/slices/userSlice";
import { useMessageService } from "../../components/common/message";
import LogoIcon from "../../components/common/LogoIcon";
import request from "../../utils/request";
import { encryptPassword } from "../../utils/tools";
import "../../App.css";

const { Option } = Select;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showSuccess, showError } = useMessageService();

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
        encryptedValues.password = await encryptPassword(values.password);
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

        // 跳转到首页
        navigate("/");
      } catch (apiError) {
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
    <div className="login-container">
      <Card
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
          header: { backgroundColor: "#fff" },
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
          {/* <p style={{ color: "#666", fontSize: "14px" }}>
            请选择学校和角色，输入账号密码登录系统
          </p> */}
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* <Form.Item
            name="school"
            label="所属学校"
            rules={[{ required: true, message: "请选择所属学校" }]}
          >
            <Select placeholder="请选择您所在的学校">
              {schoolOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="role"
            label="用户角色"
            rules={[{ required: true, message: "请选择用户角色" }]}
          >
            <Select placeholder="请选择您的角色">
              {roleOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item> */}

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

          {/* <div style={{ textAlign: "center", marginTop: 8 }}>
            <Button
              type="link"
              onClick={handleForgotPassword}
              style={{ color: "#1890ff" }}
            >
              忘记密码？请联系技术支持
            </Button>
          </div> */}
        </Form>
      </Card>
    </div>
  );
};

export default Login;
