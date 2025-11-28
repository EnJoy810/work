import { Outlet } from 'react-router-dom';

/**
 * 落地页布局组件
 * 无侧边栏、无 Header，纯净的落地页布局
 */
function LandingLayout() {
  return (
    <div className="landing-layout">
      <Outlet />
    </div>
  );
}

export default LandingLayout;
