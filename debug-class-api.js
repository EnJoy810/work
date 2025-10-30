// 班级接口调试脚本
// 在浏览器控制台中运行此脚本来检查班级接口

async function debugClassAPI() {
  console.log("=== 班级接口调试开始 ===");
  
  // 1. 检查 Redux Store 状态
  console.log("\n1. 检查 Redux Store:");
  const state = window.__REDUX_DEVTOOLS_EXTENSION__ ? 
    window.__REDUX_DEVTOOLS_EXTENSION__.store.getState() : 
    "Redux DevTools 未安装";
  
  console.log("  - User Info:", state?.user);
  console.log("  - Class Info:", state?.class);
  console.log("  - Token:", state?.user?.token ? "存在" : "不存在");
  
  // 2. 检查 localStorage
  console.log("\n2. 检查 localStorage:");
  console.log("  - currentClassId:", localStorage.getItem('currentClassId'));
  console.log("  - persist:user:", localStorage.getItem('persist:user'));
  console.log("  - persist:class:", localStorage.getItem('persist:class'));
  
  // 3. 尝试手动调用班级接口
  console.log("\n3. 尝试调用班级接口:");
  
  const token = state?.user?.token;
  const userId = state?.user?.userInfo?.userId;
  
  if (!token) {
    console.error("  ❌ 未找到 token，请先登录");
    return;
  }
  
  if (!userId) {
    console.error("  ❌ 未找到 userId");
    return;
  }
  
  console.log(`  - 使用 userId: ${userId}`);
  
  // 尝试不同的接口路径
  const apiPaths = [
    `/api/teacher-class/class_list?teacher_id=${userId}`,
    `/api/teacher-class/class?teacher_id=${userId}`,
    `/api/teacher-class/class_list`,
    `/api/teacher-class/class`,
  ];
  
  for (const path of apiPaths) {
    try {
      console.log(`\n  测试接口: ${path}`);
      
      const url = path.includes('?') ? path : `${path}?teacher_id=${userId}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      console.log(`    - 状态码: ${response.status}`);
      console.log(`    - 状态: ${response.statusText}`);
      
      const data = await response.json();
      console.log(`    - 响应数据:`, data);
      
      if (response.ok && data.code === "200") {
        console.log(`    ✅ 接口调用成功!`);
        console.log(`    - 班级列表:`, data.data?.classes || data.data);
      } else {
        console.log(`    ❌ 接口返回错误: ${data.message}`);
      }
      
    } catch (error) {
      console.error(`    ❌ 请求失败:`, error);
    }
  }
  
  console.log("\n=== 调试结束 ===");
}

// 导出到全局，方便在控制台调用
window.debugClassAPI = debugClassAPI;

console.log("调试脚本已加载！在控制台运行 debugClassAPI() 来开始调试");

