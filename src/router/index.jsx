import { createBrowserRouter } from 'react-router-dom'
import Layout from '../layout'
import pages from '../pages'
import { ProtectedRoute, LoginPage } from './ProtectedRoutes.jsx'

// 解构获取各个页面组件
const { Home } = pages.dashboard;
const { UserList } = pages.studentManagement;
const { NotFound } = pages;
const { MessageDemo } = pages.systemSettings;
const { ExamPaperDesign } = pages.exam;

// 创建路由配置
const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: 'users',
        element: <UserList />
      },
      {
        path: 'message-demo',
        element: <MessageDemo />
      },
      {
        path: 'exam-paper-design',
        element: <ExamPaperDesign />
      }
    ]
  }
])

export default router