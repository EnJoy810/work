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
import { login, getClassList } from "../../api/auth";
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
      
      // 调用后端登录 API
      const response = await login(encryptedValues);

      // 登录成功提示
      showSuccess("登录成功");

      // 设置登录状态到Redux
      dispatch(
        setUserInfo({
          userInfo: response,
          token: response.token,
        })
      );
      
      // 如果是教师角色，获取班级列表
      if (response.role === "TEACHER") {
        try {
          // 根据接口文档: GET /api/teacher-class/class_list?teacher_id={teacherId}
          const classResponse = await getClassList(response.userId);

          // 根据API文档，返回格式为: { code: 200, data: { teacherId, teacherName, classes: [...] }, message }
          // 但实际可能直接是: { code: 200, data: [...], message }
          const classList = classResponse.data?.classes || classResponse.data || [];
          
          // 设置班级列表到Redux（会自动持久化）
          dispatch(setClassList(classList));

          // 默认选择第一个班级（优先选择有正常名称的班级，而不是UUID名称）
          if (classList.length > 0) {
            // 查找第一个名称不是UUID格式的班级
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            const normalClass = classList.find(c => c.class_id && c.name && !uuidRegex.test(c.name));
            
            // 如果找到正常名称的班级，使用它；否则使用第一个
            const defaultClass = normalClass || classList[0];
            
            if (defaultClass && defaultClass.class_id) {
              const firstClassId = defaultClass.class_id;
              // 先设置到Redux store
              dispatch(setSelectedClassId(firstClassId));
              // 同步保存到localStorage，确保请求拦截器能立即读取
              localStorage.setItem('currentClassId', firstClassId);
              
              // 等待Redux Persist完成持久化（增加等待时间确保同步完成）
              await new Promise(resolve => setTimeout(resolve, 300));
            }
          }
        } catch (classError) {
          console.error("获取班级列表失败:", classError);
          // 即使获取班级列表失败，也继续登录流程
        }
      }
      
      // 跳转到首页（使用replace避免返回到登录页）
      navigate("/", { replace: true });
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
