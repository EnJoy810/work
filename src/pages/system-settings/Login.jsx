import React, { useState } from "react";
import { Card, Form, Input, Select, Button } from "antd";
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserInfo } from "../../store/slices/userSlice";
import { useMessageService } from "../../components/common/message";
import LogoIcon from "../../components/common/LogoIcon";
import "../../App.css";

const { Option } = Select;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showSuccess, showError, showInfo } = useMessageService();

  // 学校选项
  const schoolOptions = [
    { value: "school1", label: "北京大学" },
    { value: "school2", label: "清华大学" },
    { value: "school3", label: "复旦大学" },
    { value: "school4", label: "上海交通大学" },
    { value: "school5", label: "浙江大学" },
  ];

  // 角色选项
  const roleOptions = [
    { value: "admin", label: "管理员" },
    { value: "teacher", label: "教师" },
    { value: "student", label: "学生" },
    { value: "parent", label: "家长" },
  ];

  // 处理登录表单提交
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // 模拟登录请求
      console.log("登录信息:", values);

      // 实际项目中，这里应该调用真实的登录API
      // const response = await request.post('/login', values)

      // 模拟网络延迟
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 登录成功提示
      showSuccess("登录成功");

      // 设置登录状态到Redux
      const mockUserInfo = {
        username: values.username,
        role: values.role,
        school:
          schoolOptions.find((school) => school.value === values.school)
            ?.label || values.school,
        avatar:
          "https://api.dicebear.com/7.x/avataaars/svg?seed=" + values.username,
        id: "user_" + Math.random().toString(36).substr(2, 9),
      };

      dispatch(
        setUserInfo({
          userInfo: mockUserInfo,
          token: "mock_token_" + Date.now(),
        })
      );

      // 跳转到首页
      navigate("/");
    } catch (error) {
      showError("登录失败，请检查用户名和密码");
      console.error("登录错误:", error);
    } finally {
      setLoading(false);
    }
  };

  // 处理忘记密码
  const handleForgotPassword = () => {
    showInfo("请联系技术支持重置密码");
  };

  return (
    <div className="login-container">
      <Card
        title={
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}
            >
              <LogoIcon fontSize={20} />
              <div style={{ marginLeft: 12 }}>
                <div
                  style={{ fontSize: "20px", fontWeight: "bold", marginBottom: 2 }}
                >
                  清境智能
                </div>
                <div style={{ fontSize: "14px", color: "#666" }}>在线阅卷系统</div>
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
