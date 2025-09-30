import { Typography, Row, Col, Button } from "antd";
import { useState, useEffect } from 'react';
import { StarOutlined, BookOutlined, RightOutlined, DownOutlined, } from "@ant-design/icons";

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
        threshold: 0.1
      }
    );

    // 获取第二部分元素并开始观察
    const section2 = document.getElementById('section-2');
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
            <h2 className={`partner-schools-title ${isSection2Visible ? 'fade-in-up' : ''}`}>合作院校</h2>
            <p className={`partner-schools-subtitle ${isSection2Visible ? 'fade-in-up' : ''}`}>全国重点大学的信任之选</p>
            <div className={`schools-grid ${isSection2Visible ? 'fade-in-up' : ''}`}>
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
                <div key={index} className={`school-card ${isSection2Visible ? 'fade-in-up' : ''}`}>
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

      {/* 第三部分：合作院校 */}
      <section id="section-3" className="full-section">
        <div className="section-content">
          <Title level={3}>合作院校</Title>
          <Text>这里是合作院校列表...</Text>
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
