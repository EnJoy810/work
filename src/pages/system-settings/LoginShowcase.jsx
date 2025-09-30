import { Typography, Row, Col, Button } from "antd";
import { useState, useEffect } from "react";
import {
  StarOutlined,
  BookOutlined,
  RightOutlined,
  DownOutlined,
} from "@ant-design/icons";

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

  return (
    <div className="showcase-container">
      {/* 第一部分：欢迎页面 */}
      <section id="section-1" className="full-section welcome-section">
        <div className="green-circle"></div>
        <div className="blue-circle"></div>
        <div className="welcome-content">
          <div className="welcome-badge">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-sparkles w-4 h-4 mr-2"
              aria-hidden="true"
            >
              <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"></path>
              <path d="M20 2v4"></path>
              <path d="M22 4h-4"></path>
              <circle cx="4" cy="20" r="2"></circle>
            </svg>
            <span style={{ marginLeft: 8 }}>AI驱动的智能教育平台</span>
          </div>
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
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-graduation-cap w-5 h-5 mr-2"
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
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-arrow-right w-5 h-5 ml-2"
                aria-hidden="true"
              >
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </Button>
            <Button
              size="large"
              className="learn-more-button"
              onClick={() => scrollToSection(2)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-book-open w-5 h-5 mr-2"
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
              className={`schools-grid ${
                isSection2Visible ? "fade-in-up" : ""
              }`}
            >
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
              ].map((school, index) => (
                <div
                  key={index}
                  className={`school-card ${
                    isSection2Visible ? "fade-in-up" : ""
                  }`}
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
                        stroke-width="4"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M24 28H24.02"
                        stroke="#155DFC"
                        stroke-width="4"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M24 12H24.02"
                        stroke="#155DFC"
                        stroke-width="4"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M32 20H32.02"
                        stroke="#155DFC"
                        stroke-width="4"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M32 28H32.02"
                        stroke="#155DFC"
                        stroke-width="4"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M32 12H32.02"
                        stroke="#155DFC"
                        stroke-width="4"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M16 20H16.02"
                        stroke="#155DFC"
                        stroke-width="4"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M16 28H16.02"
                        stroke="#155DFC"
                        stroke-width="4"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M16 12H16.02"
                        stroke="#155DFC"
                        stroke-width="4"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M18 44V38C18 37.4696 18.2107 36.9609 18.5858 36.5858C18.9609 36.2107 19.4696 36 20 36H28C28.5304 36 29.0391 36.2107 29.4142 36.5858C29.7893 36.9609 30 37.4696 30 38V44"
                        stroke="#155DFC"
                        stroke-width="4"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M36 4H12C9.79086 4 8 5.79086 8 8V40C8 42.2091 9.79086 44 12 44H36C38.2091 44 40 42.2091 40 40V8C40 5.79086 38.2091 4 36 4Z"
                        stroke="#155DFC"
                        stroke-width="4"
                        stroke-linecap="round"
                        stroke-linejoin="round"
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
                          stroke-width="2.66667"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M36 33.3333C34.8464 32.9961 33.8331 32.2942 33.112 31.3327C32.3909 30.3712 32.0007 29.2019 32 28C31.9993 29.2019 31.6091 30.3712 30.888 31.3327C30.1669 32.2942 29.1536 32.9961 28 33.3333"
                          stroke="white"
                          stroke-width="2.66667"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M39.464 24.6667C39.7708 24.1353 39.9513 23.5405 39.9914 22.9283C40.0316 22.316 39.9303 21.7027 39.6956 21.1359C39.4608 20.569 39.0987 20.0637 38.6374 19.6592C38.1761 19.2546 37.6279 18.9616 37.0353 18.8028C36.4426 18.644 35.8214 18.6237 35.2196 18.7434C34.6178 18.8631 34.0517 19.1196 33.5649 19.4931C33.0781 19.8667 32.6838 20.3472 32.4125 20.8975C32.1411 21.4478 32 22.0531 32 22.6667C32 22.0531 31.8589 21.4478 31.5875 20.8975C31.3162 20.3472 30.9219 19.8667 30.4351 19.4931C29.9483 19.1196 29.3822 18.8631 28.7804 18.7434C28.1786 18.6237 27.5574 18.644 26.9647 18.8028C26.3721 18.9616 25.8239 19.2546 25.3626 19.6592C24.9013 20.0637 24.5392 20.569 24.3044 21.1359C24.0697 21.7027 23.9684 22.316 24.0086 22.9283C24.0487 23.5405 24.2292 24.1353 24.536 24.6667"
                          stroke="white"
                          stroke-width="2.66667"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M39.996 22.8333C40.7798 23.0348 41.5074 23.412 42.1237 23.9363C42.7401 24.4607 43.229 25.1184 43.5536 25.8597C43.8781 26.601 44.0297 27.4064 43.9968 28.215C43.964 29.0236 43.7476 29.814 43.364 30.5266"
                          stroke="white"
                          stroke-width="2.66667"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M40 40.0001C41.174 40 42.3152 39.6126 43.2466 38.8979C44.178 38.1832 44.8475 37.1812 45.1514 36.0471C45.4552 34.9131 45.3764 33.7106 44.9272 32.6259C44.4779 31.5413 43.6834 30.6352 42.6667 30.0481"
                          stroke="white"
                          stroke-width="2.66667"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M42.6226 39.3105C42.7161 40.0335 42.6603 40.768 42.4588 41.4686C42.2573 42.1692 41.9142 42.821 41.4509 43.3838C40.9876 43.9466 40.4138 44.4085 39.765 44.7409C39.1162 45.0733 38.4061 45.2691 37.6787 45.3163C36.9512 45.3635 36.2218 45.2611 35.5355 45.0154C34.8491 44.7696 34.2205 44.3858 33.6883 43.8876C33.1561 43.3893 32.7317 42.7873 32.4414 42.1186C32.151 41.45 32.0008 40.7289 32 39.9999C31.9992 40.7289 31.849 41.45 31.5586 42.1186C31.2682 42.7873 30.8438 43.3893 30.3117 43.8876C29.7795 44.3858 29.1508 44.7696 28.4645 45.0154C27.7782 45.2611 27.0487 45.3635 26.3213 45.3163C25.5938 45.2691 24.8837 45.0733 24.2349 44.7409C23.5861 44.4085 23.0123 43.9466 22.549 43.3838C22.0857 42.821 21.7427 42.1692 21.5412 41.4686C21.3396 40.768 21.2839 40.0335 21.3773 39.3105"
                          stroke="white"
                          stroke-width="2.66667"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M24 40.0001C22.826 40 21.6848 39.6126 20.7535 38.8979C19.8221 38.1832 19.1525 37.1812 18.8487 36.0471C18.5448 34.9131 18.6236 33.7106 19.0729 32.6259C19.5221 31.5413 20.3167 30.6352 21.3334 30.0481"
                          stroke="white"
                          stroke-width="2.66667"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M24.004 22.8333C23.2203 23.0348 22.4927 23.412 21.8763 23.9363C21.2599 24.4607 20.771 25.1184 20.4464 25.8597C20.1219 26.601 19.9703 27.4064 20.0032 28.215C20.036 29.0236 20.2524 29.814 20.636 30.5266"
                          stroke="white"
                          stroke-width="2.66667"
                          stroke-linecap="round"
                          stroke-linejoin="round"
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
                            <stop stop-color="#2B7FFF" />
                            <stop offset="1" stop-color="#00C950" />
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
                          stroke-width="2.66667"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M42.6666 18.6667V24.0001"
                          stroke="white"
                          stroke-width="2.66667"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M45.3333 21.3333H40"
                          stroke="white"
                          stroke-width="2.66667"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M21.3333 45.3333C22.8061 45.3333 24 44.1394 24 42.6667C24 41.1939 22.8061 40 21.3333 40C19.8605 40 18.6666 41.1939 18.6666 42.6667C18.6666 44.1394 19.8605 45.3333 21.3333 45.3333Z"
                          stroke="white"
                          stroke-width="2.66667"
                          stroke-linecap="round"
                          stroke-linejoin="round"
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
                            <stop stop-color="#2B7FFF" />
                            <stop offset="1" stop-color="#00C950" />
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
                          stroke-width="2.66667"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M40 38.6667V28"
                          stroke="white"
                          stroke-width="2.66667"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M33.3333 38.6667V22.6667"
                          stroke="white"
                          stroke-width="2.66667"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M26.6667 38.6667V34.6667"
                          stroke="white"
                          stroke-width="2.66667"
                          stroke-linecap="round"
                          stroke-linejoin="round"
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
                            <stop stop-color="#2B7FFF" />
                            <stop offset="1" stop-color="#00C950" />
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
                          stroke-width="2.66667"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M37.3334 20.1707C38.477 20.4671 39.4899 21.135 40.2129 22.0694C40.936 23.0038 41.3283 24.1518 41.3283 25.3333C41.3283 26.5148 40.936 27.6628 40.2129 28.5972C39.4899 29.5316 38.477 30.1995 37.3334 30.496"
                          stroke="white"
                          stroke-width="2.66667"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M45.3334 44V41.3333C45.3325 40.1516 44.9392 39.0037 44.2152 38.0698C43.4912 37.1358 42.4775 36.4688 41.3334 36.1733"
                          stroke="white"
                          stroke-width="2.66667"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M28 30.6667C30.9455 30.6667 33.3333 28.2789 33.3333 25.3333C33.3333 22.3878 30.9455 20 28 20C25.0544 20 22.6666 22.3878 22.6666 25.3333C22.6666 28.2789 25.0544 30.6667 28 30.6667Z"
                          stroke="white"
                          stroke-width="2.66667"
                          stroke-linecap="round"
                          stroke-linejoin="round"
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
                            <stop stop-color="#2B7FFF" />
                            <stop offset="1" stop-color="#00C950" />
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
                    <div className="feature-badge">{feature.badge}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div
            className="scroll-down-indicator"
            onClick={() => scrollToSection(4)}
          >
            <DownOutlined />
          </div>
        </div>
      </section>

      {/* 第四部分：开始体验 */}
      <section id="section-4" className="full-section">
        <div className="section-content">
          <Title level={3}>开始使用</Title>
          <Text>准备好体验智能阅卷系统了吗？立即登录开始使用。</Text>
          <Button
            type="primary"
            size="large"
            className="start-button"
            onClick={onShowLogin}
          >
            登录系统
          </Button>
        </div>
      </section>
    </div>
  );
};

export default LoginShowcase;
