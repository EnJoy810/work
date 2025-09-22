import React from 'react'
import { Layout, Menu, Avatar, Dropdown } from 'antd'
import { UserOutlined, HomeOutlined, UserAddOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons'
import { Outlet, Link } from 'react-router-dom'

const { Header, Content } = Layout

const LayoutComponent = () => {
  // 用户菜单配置
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料'
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置'
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      danger: true,
      icon: <LogoutOutlined />,
      label: '退出登录'
    }
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 顶部导航 - 包含标题、菜单和用户信息 */}
      <Header style={{ padding: 0, background: '#fff', boxShadow: '0 1px 4px rgba(0,21,41,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
          {/* 左侧：系统标题 */}
          <div style={{ height: 64, display: 'flex', alignItems: 'center', padding: '0 24px', background: '#1890ff', color: 'white', fontSize: 18, fontWeight: 'bold', marginRight: 24 }}>
            管理系统
          </div>
          
          {/* 中间：顶部菜单 */}
          <Menu 
            theme="light" 
            mode="horizontal" 
            defaultSelectedKeys={['1']}
            style={{ flex: 1, borderBottom: 0, lineHeight: '64px' }}
            items={[
              {
                key: '1',
                icon: <HomeOutlined />,
                label: <Link to="/">首页</Link>
              },
              {
                key: '2',
                icon: <UserAddOutlined />,
                label: <Link to="/users">用户管理</Link>
              },
              {
                key: 'sub1',
                icon: <SettingOutlined />,
                label: '系统设置',
                children: [
                  { key: '3', label: '基础设置' },
                  { key: '4', label: '权限管理' },
                  { key: '5', label: '日志管理' }
                ]
              }
            ]}
          />
          
          {/* 右侧：用户信息 */}
          <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 24px', cursor: 'pointer', color: 'rgba(0,0,0,.65)' }}>
              <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />
              <span>管理员</span>
            </div>
          </Dropdown>
        </div>
      </Header>
      
      {/* 主内容区 */}
      <Content style={{ margin: '24px 24px 0', overflow: 'auto' }}>
        <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
          <Outlet />
        </div>
      </Content>
    </Layout>
  )
}

export default LayoutComponent