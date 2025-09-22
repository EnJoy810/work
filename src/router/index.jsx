import React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import Layout from '../layout'
import Home from '../pages/Home'
import UserList from '../pages/UserList'
import NotFound from '../pages/NotFound'

// 创建路由配置
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: 'users',
        element: <UserList />
      }
    ]
  }
])

export default router