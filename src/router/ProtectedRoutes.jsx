import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import pages from '../pages'

// 从统一导出入口获取Login组件
const { Login } = pages.systemSettings;

// 受保护的路由组件 - 使用Redux状态判断登录状态
export const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useSelector(state => state.user)
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }
  return children
}

// 登录页面组件 - 内部使用Redux状态判断
export const LoginPage = () => {
  const { isLoggedIn } = useSelector(state => state.user)
  if (isLoggedIn) {
    return <Navigate to="/" replace />
  }
  return <Login />
}