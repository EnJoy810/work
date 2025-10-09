import { Typography, Row, Col, Button } from "antd";
import { useState, useEffect } from "react";
import {
  StarOutlined,
  BookOutlined,
  RightOutlined,
  DownOutlined,
} from "@ant-design/icons";
import XLabSvg from "../../assets/Badge.svg";

const { Title, Text } = Typography;

/**
 * 登录页面导览组件
 * 用于展示产品特性、数据和引导用户登录
 */
const LoginShowcase = ({ onShowLogin }) => {
  // 滚动到下一个部分
  const scrollToSection = (index) => {
    const section = document.getElementById(`section-${index}`);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  // 状态用于跟踪第二部分是否已进入视图
  const [isSection2Visible, setIsSection2Visible] = useState(false);
  // 状态用于跟踪第三部分是否已进入视图
  const [isSection3Visible, setIsSection3Visible] = useState(false);
  // 状态用于跟踪第四部分是否已进入视图
  const [isSection4Visible, setIsSection4Visible] = useState(false);
  
  // 状态用于跟踪当前是否为移动端
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    // 创建Intersection Observer实例
    const observer = new IntersectionObserver(
      ([entry]) => {
        // 当元素进入视图时，设置isSection2Visible为true
        if (entry.isIntersecting) {
          setIsSection2Visible(true);
          // 只需要观察一次
          observer.unobserve(entry.target);
        }
      },
      {
        // 当元素的10%进入视图时触发
        threshold: 0.1,
      }
    );

    // 获取第二部分元素并开始观察
    const section2 = document.getElementById("section-2");
    if (section2) {
      observer.observe(section2);
    }

    // 组件卸载时停止观察
    return () => {
      if (section2) {
        observer.unobserve(section2);
      }
    };
  }, []);

  useEffect(() => {
    // 创建Intersection Observer实例
    const observer = new IntersectionObserver(
      ([entry]) => {
        // 当元素进入视图时，设置isSection3Visible为true
        if (entry.isIntersecting) {
          setIsSection3Visible(true);
          // 只需要观察一次
          observer.unobserve(entry.target);
        }
      },
      {
        // 当元素的10%进入视图时触发
        threshold: 0.1,
      }
    );

    // 获取第三部分元素并开始观察
    const section3 = document.getElementById("section-3");
    if (section3) {
      observer.observe(section3);
    }

    // 组件卸载时停止观察
    return () => {
      if (section3) {
        observer.unobserve(section3);
      }
    };
  }, []);

  useEffect(() => {
    // 创建Intersection Observer实例
    const observer = new IntersectionObserver(
      ([entry]) => {
        // 当元素进入视图时，设置isSection4Visible为true
        if (entry.isIntersecting) {
          setIsSection4Visible(true);
          // 只需要观察一次
          observer.unobserve(entry.target);
        }
      },
      {
        // 当元素的10%进入视图时触发
        threshold: 0.1,
      }
    );

    // 获取第四部分元素并开始观察
    const section4 = document.getElementById("section-4");
    if (section4) {
      observer.observe(section4);
    }

    // 组件卸载时停止观察
    return () => {
      if (section4) {
        observer.unobserve(section4);
      }
    };
  }, []);

  // 监听窗口尺寸变化
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };

    // 添加事件监听器
    window.addEventListener('resize', handleResize);
    
    // 组件卸载时移除事件监听器
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="showcase-container">
      {/* 第一部分：欢迎页面 */}
      <section id="section-1" className="full-section welcome-section">
        <div className="green-circle"></div>
        <div className="blue-circle"></div>
        <div className="welcome-content">
          {/* <div className="welcome-badge">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-sparkles w-4 h-4 mr-2"
              aria-hidden="true"
            >
              <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"></path>
              <path d="M20 2v4"></path>
              <path d="M22 4h-4"></path>
              <circle cx="4" cy="20" r="2"></circle>
            </svg>
            <span style={{ marginLeft: 8 }}>AI驱动的智能教育平台</span>
          </div> */}
          <h1 className="welcome-title">清境智能</h1>
          <h2 className="welcome-subtitle">在线阅卷系统</h2>
          <p className="welcome-description">
            基于先进AI技术的智能阅卷平台，为K12及高校教师提供
            高效、准确、智能的试卷批改解决方案
          </p>
          <div className="welcome-buttons">
            <Button
              type="primary"
              size="large"
              className="experience-button"
              onClick={onShowLogin}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-graduation-cap w-5 h-5 mr-2"
                aria-hidden="true"
              >
                <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"></path>
                <path d="M22 10v6"></path>
                <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"></path>
              </svg>
              <span style={{ marginLeft: 8 }}>立即体验</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-arrow-right w-5 h-5 ml-2"
                aria-hidden="true"
              >
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </Button>
            <Button
              size="large"
              className="learn-more-button"
              onClick={() => scrollToSection(3)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-book-open w-5 h-5 mr-2"
                aria-hidden="true"
              >
                <path d="M12 7v14"></path>
                <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path>
              </svg>
              了解更多
            </Button>
          </div>
          <div className="welcome-stats">
            <Row>
              <Col xs={12} sm={6}>
                <div className="stat-item">
                  <Text className="stat-number">3x</Text>
                  <Text className="stat-label">批改效率增加</Text>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div className="stat-item">
                  <Text className="stat-number">3,000+</Text>
                  <Text className="stat-label">服务学生数量</Text>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div className="stat-item">
                  <Text className="stat-number">20,000+</Text>
                  <Text className="stat-label">批改试卷</Text>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div className="stat-item">
                  <Text className="stat-number">99%</Text>
                  <Text className="stat-label">批改正确率</Text>
                </div>
              </Col>
            </Row>

            <div
              className="welcome-logo"
              style={{ marginTop: "40px", textAlign: "center" }}
            >
              <img
                className="logo-image"
                src={XLabSvg}
                alt="X-Lab"
                style={{ maxWidth: "140px", height: "auto" }}
              />
            </div>
          </div>
          <div
            className="scroll-down-indicator"
            onClick={() => scrollToSection(2)}
          >
            <DownOutlined />
          </div>
        </div>
      </section>

      {/* 第二部分：合作院校 */}
      <section id="section-2" className="full-section">
        <div className="section-content">
          <div className="partner-schools-content">
            <h2
              className={`partner-schools-title ${
                isSection2Visible ? "fade-in-up" : ""
              }`}
            >
              合作院校
            </h2>
            <p
              className={`partner-schools-subtitle ${
                isSection2Visible ? "fade-in-up" : ""
              }`}
            >
              全国重点大学的信任之选
            </p>
            <div
              className={`schools-grid ${isSection2Visible ? "fade-in-up" : ""}`}
            >
              {/* 定义学校数据 */}
              {[
                {
                  name: "清华大学附属中学",
                  type: "985高校附中",
                  location: "北京",
                },
                {
                  name: "复旦大学附属中学",
                  type: "985高校附中",
                  location: "上海",
                },
                {
                  name: "浙江大学附属中学",
                  type: "985高校附中",
                  location: "杭州",
                },
                {
                  name: "中国人民大学附属中学",
                  type: "985高校附中",
                  location: "北京",
                },
                {
                  name: "华东师范大学第二附属中学",
                  type: "211高校附中",
                  location: "上海",
                },
                {
                  name: "西北工业大学附属中学",
                  type: "985高校附中",
                  location: "西安",
                },
                {
                  name: "哈尔滨工业大学附属中学",
                  type: "985高校附中",
                  location: "哈尔滨",
                },
                {
                  name: "大连理工大学附属高中",
                  type: "985高校附中",
                  location: "大连",
                },
              ]
              /* 根据当前设备尺寸动态显示学校数据 */
              .filter((_, index) => {
                return isMobile ? index < 6 : true;
              })
              .map((school, index) => (
                <div
                  key={index}
                  className={`school-card ${isSection2Visible ? "fade-in-up" : ""}`}
                >
                  <div className="school-icon">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 48 48"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M24 20H24.02"
                        stroke="#155DFC"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M24 28H24.02"
                        stroke="#155DFC"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M24 12H24.02"
                        stroke="#155DFC"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M32 20H32.02"
                        stroke="#155DFC"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M32 28H32.02"
                        stroke="#155DFC"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M32 12H32.02"
                        stroke="#155DFC"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M16 20H16.02"
                        stroke="#155DFC"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M16 28H16.02"
                        stroke="#155DFC"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M16 12H16.02"
                        stroke="#155DFC"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M18 44V38C18 37.4696 18.2107 36.9609 18.5858 36.5858C18.9609 36.2107 19.4696 36 20 36H28C28.5304 36 29.0391 36.2107 29.4142 36.5858C29.7893 36.9609 30 37.4696 30 38V44"
                        stroke="#155DFC"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M36 4H12C9.79086 4 8 5.79086 8 8V40C8 42.2091 9.79086 44 12 44H36C38.2091 44 40 42.2091 40 40V8C40 5.79086 38.2091 4 36 4Z"
                        stroke="#155DFC"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h4 className="school-name">{school.name}</h4>
                  <p className="school-type">{school.type}</p>
                  <p className="school-location">{school.location}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 第三部分：核心功能 */}
      <section id="section-3" className="full-section">
        <div className="section-content">
          <div className="core-features-content">
            <h2
              className={`core-features-title ${
                isSection3Visible ? "fade-in-up" : ""
              }`}
            >
              核心功能
            </h2>
            <p
              className={`core-features-subtitle ${
                isSection3Visible ? "fade-in-up" : ""
              }`}
            >
              让AI为教育赋能，提升教学效率
            </p>
            <div
              className={`features-grid ${
                isSection3Visible ? "fade-in-up" : ""
              }`}
            >
              {[
                {
                  icon: (
                    <div className="feature-icon-container blue">
                      <svg
                        width="64"
                        height="64"
                        viewBox="0 0 64 64"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0 14C0 6.26801 6.26801 0 14 0H50C57.732 0 64 6.26801 64 14V50C64 57.732 57.732 64 50 64H14C6.26801 64 0 57.732 0 50V14Z"
                          fill="url(#paint0_linear_1_1553)"
                        />
                        <path
                          d="M32 40.0001V22.6667"
                          stroke="white"
                          strokeWidth="2.66667"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M36 33.3333C34.8464 32.9961 33.8331 32.2942 33.112 31.3327C32.3909 30.3712 32.0007 29.2019 32 28C31.9993 29.2019 31.6091 30.3712 30.888 31.3327C30.1669 32.2942 29.1536 32.9961 28 33.3333"
                          stroke="white"
                          strokeWidth="2.66667"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M39.464 24.6667C39.7708 24.1353 39.9513 23.5405 39.9914 22.9283C40.0316 22.316 39.9303 21.7027 39.6956 21.1359C39.4608 20.569 39.0987 20.0637 38.6374 19.6592C38.1761 19.2546 37.6279 18.9616 37.0353 18.8028C36.4426 18.644 35.8214 18.6237 35.2196 18.7434C34.6178 18.8631 34.0517 19.1196 33.5649 19.4931C33.0781 19.8667 32.6838 20.3472 32.4125 20.8975C32.1411 21.4478 32 22.0531 32 22.6667C32 22.0531 31.8589 21.4478 31.5875 20.8975C31.3162 20.3472 30.9219 19.8667 30.4351 19.4931C29.9483 19.1196 29.3822 18.8631 28.7804 18.7434C28.1786 18.6237 27.5574 18.644 26.9647 18.8028C26.3721 18.9616 25.8239 19.2546 25.3626 19.6592C24.9013 20.0637 24.5392 20.569 24.3044 21.1359C24.0697 21.7027 23.9684 22.316 24.0086 22.9283C24.0487 23.5405 24.2292 24.1353 24.536 24.6667"
                          stroke="white"
                          strokeWidth="2.66667"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M39.996 22.8333C40.7798 23.0348 41.5074 23.412 42.1237 23.9363C42.7401 24.4607 43.229 25.1184 43.5536 25.8597C43.8781 26.601 44.0297 27.4064 43.9968 28.215C43.964 29.0236 43.7476 29.814 43.364 30.5266"
                          stroke="white"
                          strokeWidth="2.66667"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M40 40.0001C41.174 40 42.3152 39.6126 43.2466 38.8979C44.178 38.1832 44.8475 37.1812 45.1514 36.0471C45.4552 34.9131 45.3764 33.7106 44.9272 32.6259C44.4779 31.5413 43.6834 30.6352 42.6667 30.0481"
                          stroke="white"
                          strokeWidth="2.66667"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M42.6226 39.3105C42.7161 40.0335 42.6603 40.768 42.4588 41.4686C42.2573 42.1692 41.9142 42.821 41.4509 43.3838C40.9876 43.9466 40.4138 44.4085 39.765 44.7409C39.1162 45.0733 38.4061 45.2691 37.6787 45.3163C36.9512 45.3635 36.2218 45.2611 35.5355 45.0154C34.8491 44.7696 34.2205 44.3858 33.6883 43.8876C33.1561 43.3893 32.7317 42.7873 32.4414 42.1186C32.151 41.45 32.0008 40.7289 32 39.9999C31.9992 40.7289 31.849 41.45 31.5586 42.1186C31.2682 42.7873 30.8438 43.3893 30.3117 43.8876C29.7795 44.3858 29.1508 44.7696 28.4645 45.0154C27.7782 45.2611 27.0487 45.3635 26.3213 45.3163C25.5938 45.2691 24.8837 45.0733 24.2349 44.7409C23.5861 44.4085 23.0123 43.9466 22.549 43.3838C22.0857 42.821 21.7427 42.1692 21.5412 41.4686C21.3396 40.768 21.2839 40.0335 21.3773 39.3105"
                          stroke="white"
                          strokeWidth="2.66667"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M24 40.0001C22.826 40 21.6848 39.6126 20.7535 38.8979C19.8221 38.1832 19.1525 37.1812 18.8487 36.0471C18.5448 34.9131 18.6236 33.7106 19.0729 32.6259C19.5221 31.5413 20.3167 30.6352 21.3334 30.0481"
                          stroke="white"
                          strokeWidth="2.66667"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M24.004 22.8333C23.2203 23.0348 22.4927 23.412 21.8763 23.9363C21.2599 24.4607 20.771 25.1184 20.4464 25.8597C20.1219 26.601 19.9703 27.4064 20.0032 28.215C20.036 29.0236 20.2524 29.814 20.636 30.5266"
                          stroke="white"
                          strokeWidth="2.66667"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <defs>
                          <linearGradient
                            id="paint0_linear_1_1553"
                            x1="0"
                            y1="0"
                            x2="64"
                            y2="64"
                            gradientUnits="userSpaceOnUse"
                          >
                            <stop stopColor="#2B7FFF" />
                            <stop offset="1" stopColor="#00C950" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  ),
                  title: "AI智能识别",
                  description:
                    "先进的光学字符识别技术，精准识别手写答案，支持各种题型自动批改",
                  badge: "识别准确率达99.2%",
                },
                {
                  icon: (
                    <div className="feature-icon-container green">
                      <svg
                        width="64"
                        height="64"
                        viewBox="0 0 64 64"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0 14C0 6.26801 6.26801 0 14 0H50C57.732 0 64 6.26801 64 14V50C64 57.732 57.732 64 50 64H14C6.26801 64 0 57.732 0 50V14Z"
                          fill="url(#paint0_linear_1_1574)"
                        />
                        <path
                          d="M30.6893 19.7521C30.7464 19.4462 30.9087 19.17 31.1481 18.9712C31.3875 18.7724 31.6888 18.6636 32 18.6636C32.3111 18.6636 32.6125 18.7724 32.8518 18.9712C33.0912 19.17 33.2535 19.4462 33.3106 19.7521L34.712 27.1628C34.8115 27.6896 35.0675 28.1743 35.4467 28.5534C35.8258 28.9325 36.3104 29.1886 36.8373 29.2881L44.248 30.6894C44.5538 30.7466 44.8301 30.9089 45.0289 31.1482C45.2277 31.3876 45.3365 31.6889 45.3365 32.0001C45.3365 32.3113 45.2277 32.6126 45.0289 32.852C44.8301 33.0913 44.5538 33.2536 44.248 33.3108L36.8373 34.7121C36.3104 34.8116 35.8258 35.0677 35.4467 35.4468C35.0675 35.8259 34.8115 36.3106 34.712 36.8374L33.3106 44.2481C33.2535 44.554 33.0912 44.8302 32.8518 45.029C32.6125 45.2278 32.3111 45.3366 32 45.3366C31.6888 45.3366 31.3875 45.2278 31.1481 45.029C30.9087 44.8302 30.7464 44.554 30.6893 44.2481L29.288 36.8374C29.1885 36.3106 28.9324 35.8259 28.5533 35.4468C28.1741 35.0677 27.6895 34.8116 27.1626 34.7121L19.752 33.3108C19.4461 33.2536 19.1699 33.0913 18.9711 32.852C18.7723 32.6126 18.6635 32.3113 18.6635 32.0001C18.6635 31.6889 18.7723 31.3876 18.9711 31.1482C19.1699 30.9089 19.4461 30.7466 19.752 30.6894L27.1626 29.2881C27.6895 29.1886 28.1741 28.9325 28.5533 28.5534C28.9324 28.1743 29.1885 27.6896 29.288 27.1628L30.6893 19.7521Z"
                          stroke="white"
                          strokeWidth="2.66667"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M42.6666 18.6667V24.0001"
                          stroke="white"
                          strokeWidth="2.66667"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M45.3333 21.3333H40"
                          stroke="white"
                          strokeWidth="2.66667"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M21.3333 45.3333C22.8061 45.3333 24 44.1394 24 42.6667C24 41.1939 22.8061 40 21.3333 40C19.8605 40 18.6666 41.1939 18.6666 42.6667C18.6666 44.1394 19.8605 45.3333 21.3333 45.3333Z"
                          stroke="white"
                          strokeWidth="2.66667"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <defs>
                          <linearGradient
                            id="paint0_linear_1_1574"
                            x1="0"
                            y1="0"
                            x2="64"
                            y2="64"
                            gradientUnits="userSpaceOnUse"
                          >
                            <stop stopColor="#2B7FFF" />
                            <stop offset="1" stopColor="#00C950" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  ),
                  title: "智能批改引擎",
                  description:
                    "客观题秒判，主观题AI辅助批改，大幅减轻教师批改负担",
                  badge: "效率提升80%",
                },
                {
                  icon: (
                    <div className="feature-icon-container purple">
                      <svg
                        width="64"
                        height="64"
                        viewBox="0 0 64 64"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0 14C0 6.26801 6.26801 0 14 0H50C57.732 0 64 6.26801 64 14V50C64 57.732 57.732 64 50 64H14C6.26801 64 0 57.732 0 50V14Z"
                          fill="url(#paint0_linear_1_1591)"
                        />
                        <path
                          d="M20 20V41.3333C20 42.0406 20.281 42.7189 20.781 43.219C21.2811 43.719 21.9594 44 22.6667 44H44"
                          stroke="white"
                          strokeWidth="2.66667"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M40 38.6667V28"
                          stroke="white"
                          strokeWidth="2.66667"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M33.3333 38.6667V22.6667"
                          stroke="white"
                          strokeWidth="2.66667"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M26.6667 38.6667V34.6667"
                          stroke="white"
                          strokeWidth="2.66667"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <defs>
                          <linearGradient
                            id="paint0_linear_1_1591"
                            x1="0"
                            y1="0"
                            x2="64"
                            y2="64"
                            gradientUnits="userSpaceOnUse"
                          >
                            <stop stopColor="#2B7FFF" />
                            <stop offset="1" stopColor="#00C950" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  ),
                  title: "学情深度分析",
                  description:
                    "全面的数据分析报告，洞察学生学习状况和知识点掌握情况",
                  badge: "多维度分析",
                },
                {
                  icon: (
                    <div className="feature-icon-container cyan">
                      <svg
                        width="64"
                        height="64"
                        viewBox="0 0 64 64"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0 14C0 6.26801 6.26801 0 14 0H50C57.732 0 64 6.26801 64 14V50C64 57.732 57.732 64 50 64H14C6.26801 64 0 57.732 0 50V14Z"
                          fill="url(#paint0_linear_1_1608)"
                        />
                        <path
                          d="M37.3333 44V41.3333C37.3333 39.9188 36.7714 38.5623 35.7712 37.5621C34.771 36.5619 33.4144 36 32 36H24C22.5855 36 21.2289 36.5619 20.2287 37.5621C19.2285 38.5623 18.6666 39.9188 18.6666 41.3333V44"
                          stroke="white"
                          strokeWidth="2.66667"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M37.3334 20.1707C38.477 20.4671 39.4899 21.135 40.2129 22.0694C40.936 23.0038 41.3283 24.1518 41.3283 25.3333C41.3283 26.5148 40.936 27.6628 40.2129 28.5972C39.4899 29.5316 38.477 30.1995 37.3334 30.496"
                          stroke="white"
                          strokeWidth="2.66667"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M45.3334 44V41.3333C45.3325 40.1516 44.9392 39.0037 44.2152 38.0698C43.4912 37.1358 42.4775 36.4688 41.3334 36.1733"
                          stroke="white"
                          strokeWidth="2.66667"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M28 30.6667C30.9455 30.6667 33.3333 28.2789 33.3333 25.3333C33.3333 22.3878 30.9455 20 28 20C25.0544 20 22.6666 22.3878 22.6666 25.3333C22.6666 28.2789 25.0544 30.6667 28 30.6667Z"
                          stroke="white"
                          strokeWidth="2.66667"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <defs>
                          <linearGradient
                            id="paint0_linear_1_1608"
                            x1="0"
                            y1="0"
                            x2="64"
                            y2="64"
                            gradientUnits="userSpaceOnUse"
                          >
                            <stop stopColor="#2B7FFF" />
                            <stop offset="1" stopColor="#00C950" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  ),
                  title: "协作批改模式",
                  description:
                    "支持多教师协作批改，统一评分标准，提高批改质量和一致性",
                  badge: "团队协作",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className={`feature-card ${
                    isSection3Visible ? "fade-in-up" : ""
                  }`}
                >
                  {feature.icon}
                  <div className="feature-content">
                    <h4 className="feature-title">{feature.title}</h4>
                    <p className="feature-description">{feature.description}</p>
                    <div className="feature-badge">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g clipPath="url(#clip0_1_1569)">
                          <path
                            d="M5.76255 1.14745C5.78446 1.10318 5.81831 1.06591 5.86027 1.03986C5.90224 1.01381 5.95065 1 6.00005 1C6.04944 1 6.09785 1.01381 6.13982 1.03986C6.18178 1.06591 6.21563 1.10318 6.23755 1.14745L7.39255 3.48695C7.46863 3.64093 7.58095 3.77415 7.71986 3.87517C7.85876 3.9762 8.02011 4.042 8.19004 4.06695L10.773 4.44495C10.822 4.45204 10.868 4.47268 10.9058 4.50455C10.9436 4.53641 10.9718 4.57822 10.9871 4.62525C11.0023 4.67228 11.0042 4.72265 10.9923 4.77066C10.9805 4.81868 10.9555 4.86242 10.92 4.89695L9.05205 6.71595C8.92885 6.836 8.83668 6.98419 8.78346 7.14776C8.73024 7.31133 8.71758 7.48539 8.74655 7.65495L9.18755 10.2249C9.19619 10.2739 9.1909 10.3242 9.17229 10.3703C9.15369 10.4163 9.12251 10.4563 9.08232 10.4854C9.04212 10.5146 8.99453 10.5319 8.94498 10.5354C8.89542 10.5388 8.84589 10.5283 8.80205 10.5049L6.49305 9.29095C6.3409 9.21106 6.17164 9.16932 5.9998 9.16932C5.82796 9.16932 5.65869 9.21106 5.50655 9.29095L3.19805 10.5049C3.15421 10.5282 3.10474 10.5386 3.05527 10.5351C3.0058 10.5316 2.9583 10.5142 2.91819 10.4851C2.87808 10.4559 2.84696 10.416 2.82837 10.3701C2.80979 10.3241 2.80447 10.2738 2.81305 10.2249L3.25355 7.65545C3.28264 7.48581 3.27004 7.31165 3.21681 7.14797C3.16359 6.98429 3.07135 6.83602 2.94805 6.71595L1.08005 4.89745C1.04434 4.86296 1.01904 4.81914 1.00703 4.77098C0.995011 4.72282 0.996764 4.67226 1.01208 4.62504C1.02741 4.57783 1.05568 4.53587 1.09368 4.50394C1.13169 4.47201 1.1779 4.4514 1.22705 4.44445L3.80955 4.06695C3.97967 4.0422 4.14124 3.97648 4.28034 3.87544C4.41943 3.77441 4.5319 3.64108 4.60805 3.48695L5.76255 1.14745Z"
                            stroke="#155DFC"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_1_1569">
                            <rect width="12" height="12" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                      <span style={{ marginLeft: 6 }}>{feature.badge}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 第四部分：使用流程和开启智能阅卷新时代 */}
      <section
        id="section-4"
        className="full-section"
        style={{ display: "flex", flexDirection: "column", height: "100vh" }}
      >
        {/* 使用流程部分 - 上半部分 */}
        <div
          className="section-content"
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 0,
          }}
        >
          <div style={{ textAlign: "center", width: "100%" }}>
            <h2
              className={`${isSection4Visible ? "fade-in-up" : ""}`}
              style={{
                fontSize: "36px",
                fontWeight: "bold",
                marginBottom: "16px",
                color: "#1E2939",
                opacity: 0,
                transform: "translateY(50px)",
                transition: "opacity 1s ease, transform 1s ease"
              }}
            >
              使用流程
            </h2>
            <p
              className={`${isSection4Visible ? "fade-in-up" : ""}`}
              style={{
                fontSize: "20px",
                color: "#4A5565",
                marginBottom: "64px",
                opacity: 0,
                transform: "translateY(50px)",
                transition: "opacity 1s ease 0.2s, transform 1s ease 0.2s"
              }}
            >
              简单四步，轻松完成智能阅卷
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                maxWidth: "1000px",
                width: "100%",
                margin: "0 auto",
              }}
            >
              {/* 步骤1 */}
              <div
                style={{ textAlign: "center", width: "25%", padding: "0 10px" }}
              >
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: "linear-gradient(to right, #155DFC, #00a63e)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    fontWeight: "bold",
                    margin: "0 auto 16px",
                  }}
                >
                  01
                </div>
                <h4
                  className={`${isSection4Visible ? "fade-in-up" : ""}`}
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    marginBottom: "8px",
                    color: "#111827",
                    opacity: 0,
                    transform: "translateY(50px)",
                    transition: "opacity 1s ease 0.4s, transform 1s ease 0.4s"
                  }}
                >
                  创建考试
                </h4>
                <p className={`${isSection4Visible ? "fade-in-up" : ""}`} style={{ fontSize: "14px", color: "#6b7280", opacity: 0, transform: "translateY(50px)", transition: "opacity 1s ease 0.6s, transform 1s ease 0.6s" }}>
                  设置考试信息和题目
                </p>
              </div>

              {/* 步骤2 */}
              <div
                style={{ textAlign: "center", width: "25%", padding: "0 10px" }}
              >
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: "linear-gradient(to right, #155DFC, #00a63e)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    fontWeight: "bold",
                    margin: "0 auto 16px",
                  }}
                >
                  02
                </div>
                <h4
                  className={`${isSection4Visible ? "fade-in-up" : ""}`}
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    marginBottom: "8px",
                    color: "#111827",
                    opacity: 0,
                    transform: "translateY(50px)",
                    transition: "opacity 1s ease 0.6s, transform 1s ease 0.6s"
                  }}
                >
                  上传试卷
                </h4>
                <p className={`${isSection4Visible ? "fade-in-up" : ""}`} style={{ fontSize: "14px", color: "#6b7280", opacity: 0, transform: "translateY(50px)", transition: "opacity 1s ease 0.8s, transform 1s ease 0.8s" }}>
                  扫描或拍照上传试卷
                </p>
              </div>

              {/* 步骤3 */}
              <div
                style={{ textAlign: "center", width: "25%", padding: "0 10px" }}
              >
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: "linear-gradient(to right, #155DFC, #00a63e)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    fontWeight: "bold",
                    margin: "0 auto 16px",
                  }}
                >
                  03
                </div>
                <h4
                  className={`${isSection4Visible ? "fade-in-up" : ""}`}
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    marginBottom: "8px",
                    color: "#111827",
                    opacity: 0,
                    transform: "translateY(50px)",
                    transition: "opacity 1s ease 0.8s, transform 1s ease 0.8s"
                  }}
                >
                  AI批改
                </h4>
                <p className={`${isSection4Visible ? "fade-in-up" : ""}`} style={{ fontSize: "14px", color: "#6b7280", opacity: 0, transform: "translateY(50px)", transition: "opacity 1s ease 1s, transform 1s ease 1s" }}>
                  智能识别并自动批改
                </p>
              </div>

              {/* 步骤4 */}
              <div
                style={{ textAlign: "center", width: "25%", padding: "0 10px" }}
              >
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: "linear-gradient(to right, #155DFC, #00a63e)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    fontWeight: "bold",
                    margin: "0 auto 16px",
                  }}
                >
                  04
                </div>
                <h4
                  className={`${isSection4Visible ? "fade-in-up" : ""}`}
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    marginBottom: "8px",
                    color: "#111827",
                    opacity: 0,
                    transform: "translateY(50px)",
                    transition: "opacity 1s ease 1s, transform 1s ease 1s"
                  }}
                >
                  生成报告
                </h4>
                <p className={`${isSection4Visible ? "fade-in-up" : ""}`} style={{ fontSize: "14px", color: "#6b7280", opacity: 0, transform: "translateY(50px)", transition: "opacity 1s ease 1.2s, transform 1s ease 1.2s" }}>
                  查看详细分析报告
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 开启智能阅卷新时代部分 - 下半部分 */}
        <div
          style={{
            background: "linear-gradient(to right, #155DFC, #00a63e)",
            width: "100%",
            padding: "60px 0",
            textAlign: "center",
            color: "white",
            minHeight: "300px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h2
              className={`${isSection4Visible ? "fade-in-up" : ""}`}
              style={{
                fontSize: "36px",
                fontWeight: "bold",
                marginBottom: "16px",
                opacity: 0,
                transform: "translateY(50px)",
                transition: "opacity 1s ease 1.2s, transform 1s ease 1.2s"
              }}
            >
              开启智能阅卷新时代
            </h2>
          <p
              className={`${isSection4Visible ? "fade-in-up" : ""}`}
              style={{
                fontSize: "18px",
                marginBottom: "40px",
                maxWidth: "600px",
                margin: "0 auto 40px",
                opacity: 0,
                transform: "translateY(50px)",
                transition: "opacity 1s ease 1.4s, transform 1s ease 1.4s"
              }}
            >
              加入我们，体验AI技术为教育带来的革命性变化
            </p>
          <Button
              className={`${isSection4Visible ? "fade-in-up" : ""}`}
              type="primary"
              size="large"
              style={{
                background: "white",
                color: "#155DFC",
                border: "none",
                padding: "12px 36px",
                fontSize: "18px",
                fontWeight: "500",
                opacity: 0,
                transform: "translateY(50px)",
                transition: "opacity 1s ease 1.6s, transform 1s ease 1.6s"
              }}
              onClick={onShowLogin}
            >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_1_1665)">
                <path
                  d="M14.534 6.66666C14.8385 8.16086 14.6215 9.71427 13.9192 11.0679C13.217 12.4214 12.0719 13.4934 10.675 14.1049C9.2781 14.7164 7.71376 14.8305 6.24287 14.4282C4.77199 14.026 3.48347 13.1316 2.59219 11.8943C1.70091 10.657 1.26075 9.15148 1.34511 7.62892C1.42948 6.10635 2.03326 4.65872 3.05577 3.52744C4.07829 2.39616 5.45773 1.64961 6.96405 1.4123C8.47037 1.17498 10.0125 1.46123 11.3333 2.22333"
                  stroke="#155DFC"
                  strokeWidth="1.33333"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 7.33341L8 9.33341L14.6667 2.66675"
                  stroke="#155DFC"
                  strokeWidth="1.33333"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
              <defs>
                <clipPath id="clip0_1_1665">
                  <rect width="16" height="16" fill="white" />
                </clipPath>
              </defs>
            </svg>
            立即开始使用
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3.33337 8H12.6667"
                stroke="#155DFC"
                strokeWidth="1.33333"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 3.33325L12.6667 7.99992L8 12.6666"
                stroke="#155DFC"
                strokeWidth="1.33333"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default LoginShowcase;
