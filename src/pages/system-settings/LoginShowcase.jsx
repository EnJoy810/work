import { Typography, Row, Col, Button } from 'antd';
import { ArrowDownOutlined, StarOutlined } from '@ant-design/icons';

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
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="showcase-container">
      {/* 第一部分：欢迎页面 */}
      <section id="section-1" className="full-section welcome-section">
        <div className="welcome-content">
          <div className="welcome-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles w-4 h-4 mr-2" aria-hidden="true"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"></path><path d="M20 2v4"></path><path d="M22 4h-4"></path><circle cx="4" cy="20" r="2"></circle></svg>
            <span style={{marginLeft: 8}}>AI驱动的智能教育平台</span>
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
              立即体验
            </Button>
            <Button 
              size="large" 
              className="learn-more-button"
              onClick={() => scrollToSection(2)}
            >
              了解更多
            </Button>
          </div>
          <div className="welcome-stats">
            <Row gutter={[64, 0]}>
              <Col xs={12} sm={6}>
                <div className="stat-item">
                  <Text className="stat-number">50,000+</Text>
                  <Text className="stat-label">服务师生</Text>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div className="stat-item">
                  <Text className="stat-number">1,200+</Text>
                  <Text className="stat-label">合作学校</Text>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div className="stat-item">
                  <Text className="stat-number">500万+</Text>
                  <Text className="stat-label">批改试卷</Text>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div className="stat-item">
                  <Text className="stat-number">98.5%</Text>
                  <Text className="stat-label">用户满意度</Text>
                </div>
              </Col>
            </Row>
          </div>
          <div 
            className="scroll-down-indicator"
            onClick={() => scrollToSection(2)}
          >
            <ArrowDownOutlined />
          </div>
        </div>
      </section>

      {/* 第二部分：产品介绍 */}
      <section id="section-2" className="full-section">
        <div className="section-content">
          <Title level={3}>产品介绍</Title>
          <Text>这里是产品介绍内容...</Text>
          <div className="scroll-down-indicator" onClick={() => scrollToSection(3)}>
            <ArrowDownOutlined />
          </div>
        </div>
      </section>

      {/* 第三部分：合作院校 */}
      <section id="section-3" className="full-section">
        <div className="section-content">
          <Title level={3}>合作院校</Title>
          <Text>这里是合作院校列表...</Text>
          <div className="scroll-down-indicator" onClick={() => scrollToSection(4)}>
            <ArrowDownOutlined />
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