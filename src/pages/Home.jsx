import React from 'react'
import { Card, Button, Row, Col, Statistic, Typography } from 'antd'
import { PieChartOutlined, BarChartOutlined, LineChartOutlined, UserOutlined } from '@ant-design/icons'

const { Title, Paragraph } = Typography

const Home = () => {
  return (
    <div>
      <Title level={2}>欢迎使用系统</Title>
      
      {/* 统计卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="用户总数"
              value={1258}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="今日访问"
              value={128}
              prefix={<PieChartOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="数据总量"
              value={10000}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="系统运行"
              value={365}
              suffix="天"
              prefix={<LineChartOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>
      
      {/* 功能介绍 */}
      <div style={{ marginTop: 32 }}>
        <Title level={3}>功能介绍</Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card hoverable title="数据管理">
              <Paragraph>
                提供全面的数据管理功能，支持增删改查等操作，帮助您高效管理系统数据。
              </Paragraph>
              <Button type="link">查看详情</Button>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card hoverable title="统计分析">
              <Paragraph>
                多种图表展示，直观呈现数据分析结果，助力业务决策。
              </Paragraph>
              <Button type="link">查看详情</Button>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card hoverable title="系统设置">
              <Paragraph>
                灵活的系统配置选项，满足不同场景的使用需求。
              </Paragraph>
              <Button type="link">查看详情</Button>
            </Card>
          </Col>
        </Row>
      </div>
      
      {/* 快速操作 */}
      <div style={{ marginTop: 32 }}>
        <Title level={3}>快速操作</Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Button type="primary" block size="large">
              添加用户
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button type="default" block size="large">
              导出数据
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button type="default" block size="large">
              系统日志
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button type="default" block size="large">
              帮助中心
            </Button>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default Home