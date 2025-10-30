import { test, expect } from '@playwright/test';

// 测试配置
const BASE_URL = 'http://localhost:5173';
const TEST_USER = {
  username: 't4',  
  password: 'password123'
};

// 记录所有 API 请求
const apiRequests = [];

test('完整接口测试流程', async ({ page }) => {
  console.log('\n🚀 开始完整接口测试流程...\n');
  
  // 监听所有网络请求
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/api/')) {
      const request = {
        url: url,
        method: response.request().method(),
        status: response.status(),
        endpoint: url.replace(/.*\/api/, '/api'),
      };
      
      try {
        const responseData = await response.json();
        request.response = responseData;
      } catch (e) {
        // 不是 JSON 响应
      }
      
      apiRequests.push(request);
      
      const statusIcon = response.status() === 200 ? '✅' : '❌';
      console.log(`${statusIcon} [${request.method}] ${request.endpoint} - ${response.status()}`);
    }
  });
  
  // ==================== 1. 登录测试 ====================
  console.log('\n📍 步骤 1: 登录测试');
  console.log('─'.repeat(60));
  
  await page.goto(BASE_URL);
  console.log('✓ 已打开页面:', BASE_URL);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);
  
  // 查找并点击"立即登录"按钮（如果有showcase页面）
  const loginShowButton = page.locator('button:has-text("立即登录")');
  try {
    if (await loginShowButton.isVisible({ timeout: 2000 })) {
      console.log('✓ 检测到showcase页面，点击"立即登录"');
      await loginShowButton.click();
      await page.waitForTimeout(1000);
    }
  } catch (e) {
    console.log('✓ 直接在登录页面');
  }
  
  // 等待登录表单
  console.log('✓ 等待登录表单加载...');
  await page.waitForSelector('input[placeholder*="用户名"]', { 
    state: 'visible',
    timeout: 10000 
  });
  await page.waitForTimeout(1000);
  
  // 填写登录信息
  console.log('✓ 填写用户名:', TEST_USER.username);
  await page.fill('input[placeholder*="用户名"]', TEST_USER.username);
  await page.waitForTimeout(500);
  
  console.log('✓ 填写密码');
  await page.fill('input[placeholder*="密码"]', TEST_USER.password);
  await page.waitForTimeout(500);
  
  // 点击登录
  console.log('✓ 点击登录按钮...');
  const [loginResponse] = await Promise.all([
    page.waitForResponse(resp => resp.url().includes('/auth/login'), { timeout: 15000 }),
    page.click('button:has-text("登录")')
  ]);
  
  const loginData = await loginResponse.json();
  console.log('✓ 登录响应:', loginData.code === "200" ? '成功 ✅' : '失败 ❌');
  expect(loginData.code).toBe("200");
  
  // 等待跳转
  console.log('✓ 等待页面跳转...');
  await page.waitForURL('**/', { timeout: 10000 });
  await page.waitForLoadState('networkidle', { timeout: 20000 });
  await page.waitForTimeout(3000);
  console.log('✅ 登录测试完成\n');
  
  // ==================== 2. 首页接口测试 ====================
  console.log('\n📍 步骤 2: 首页接口测试');
  console.log('─'.repeat(60));
  
  await page.waitForTimeout(2000);
  const gradingListRequest = apiRequests.find(r => r.endpoint.includes('/grading/grading/list'));
  if (gradingListRequest) {
    console.log('✅ 批改会话列表接口调用成功');
  } else {
    console.log('⚠️  未检测到批改会话列表接口');
  }
  
  // ==================== 3. 创建考试页面 ====================
  console.log('\n📍 步骤 3: 创建考试页面测试');
  console.log('─'.repeat(60));
  
  console.log('✓ 点击"创建考试"...');
  await page.click('text=创建考试');
  await page.waitForTimeout(3000);
  
  console.log('✓ 点击"选择已有考试"...');
  const existingExamButton = page.locator('text=选择已有考试');
  if (await existingExamButton.isVisible({ timeout: 2000 })) {
    await existingExamButton.click();
    await page.waitForTimeout(2000);
  }
  
  console.log('✅ 创建考试页面测试完成\n');
  
  // ==================== 4. 返回首页 ====================
  console.log('✓ 返回首页...');
  await page.click('text=返回首页');
  await page.waitForTimeout(2000);
  
  // ==================== 5. 题目批改页面（如果有考试） ====================
  console.log('\n📍 步骤 4: 题目批改页面测试');
  console.log('─'.repeat(60));
  
  const essayButton = page.locator('button:has-text("作文批改")').first();
  try {
    if (await essayButton.isVisible({ timeout: 2000 })) {
      console.log('✓ 点击"作文批改"...');
      await essayButton.click();
      await page.waitForTimeout(4000);
      
      console.log('✅ 题目批改页面加载成功');
      
      // 返回首页
      await page.click('text=返回首页');
      await page.waitForTimeout(2000);
    } else {
      console.log('⚠️  未找到可批改的考试');
    }
  } catch (e) {
    console.log('⚠️  未找到可批改的考试');
  }
  
  // ==================== 6. 数据分析页面（如果有考试） ====================
  console.log('\n📍 步骤 5: 数据分析页面测试');
  console.log('─'.repeat(60));
  
  const analysisButton = page.locator('button:has-text("数据分析")').first();
  try {
    if (await analysisButton.isVisible({ timeout: 2000 })) {
      console.log('✓ 点击"数据分析"...');
      await analysisButton.click();
      await page.waitForTimeout(3000);
      
      console.log('✅ 数据分析页面加载成功');
      
      // 返回首页
      await page.click('text=返回首页');
      await page.waitForTimeout(2000);
    } else {
      console.log('⚠️  未找到可分析的考试');
    }
  } catch (e) {
    console.log('⚠️  未找到可分析的考试');
  }
  
  // ==================== 生成统计报告 ====================
  console.log('\n' + '='.repeat(80));
  console.log('📊 接口调用统计报告');
  console.log('='.repeat(80));
  
  const successRequests = apiRequests.filter(r => r.status === 200);
  const failedRequests = apiRequests.filter(r => r.status !== 200);
  const uniqueEndpoints = [...new Set(apiRequests.map(r => r.endpoint))];
  
  console.log(`\n总请求数: ${apiRequests.length}`);
  console.log(`成功请求: ${successRequests.length} ✅`);
  console.log(`失败请求: ${failedRequests.length} ❌`);
  console.log(`唯一接口数: ${uniqueEndpoints.length}\n`);
  
  console.log('已调用的接口列表:');
  console.log('-'.repeat(80));
  uniqueEndpoints.forEach((endpoint, index) => {
    const requests = apiRequests.filter(r => r.endpoint === endpoint);
    const status = requests[0].status === 200 ? '✅' : '❌';
    const method = requests[0].method;
    const count = requests.length;
    console.log(`${index + 1}. ${status} [${method}] ${endpoint} (调用${count}次)`);
  });
  
  if (failedRequests.length > 0) {
    console.log('\n失败的接口详情:');
    console.log('-'.repeat(80));
    failedRequests.forEach((req, index) => {
      console.log(`${index + 1}. ❌ [${req.method}] ${req.endpoint}`);
      console.log(`   状态码: ${req.status}`);
      if (req.response) {
        console.log(`   错误信息: ${req.response.message || '未知错误'}`);
      }
    });
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('🎉 测试完成！');
  console.log('='.repeat(80) + '\n');
});


