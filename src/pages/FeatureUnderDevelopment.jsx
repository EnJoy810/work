import React from 'react'
import { Result, Button } from 'antd'
import { useNavigate } from 'react-router-dom'
import { HomeOutlined } from '@ant-design/icons'

const FeatureUnderDevelopment = () => {
  const navigate = useNavigate()

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <Result
        status="warning"
        title="功能正在开发中"
        subTitle="该功能正在紧张开发中，敬请期待！"
        extra={
          <Button type="primary" icon={<HomeOutlined />} onClick={() => navigate('/')}>
            返回首页
          </Button>
        }
      />
    </div>
  )
}

export default FeatureUnderDevelopment