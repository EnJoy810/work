import { test, expect } from '@playwright/test';

// 测试配置
const BASE_URL = 'http://localhost:5173';
const TEST_USER = {
  username: 't4',  
  password: 'password123'
};

// 记录所有 API 请求
const apiRequests = [];

test.describe.serial('前端接口完整测试', () => {
  
  test.beforeEach(async ({ page }) => {
    // 清空请求记录
    apiRequests.length = 0;
    
    // 监听所有网络请求
    page.on('response', async (response) => {
      const url = response.url();
      // 只记录 API 请求
      if (url.includes('/api/')) {
        const request = {
          url: url,
          method: response.request().method(),
          status: response.status(),
          endpoint: url.replace(/.*\/api/, '/api'),
        };
        
        try {
          // 尝试解析响应 JSON
          const responseData = await response.json();
          request.response = responseData;
        } catch (e) {
          // 不是 JSON 响应
        }
        
        apiRequests.push(request);
        
        // 实时打印请求信息
        const statusIcon = response.status() === 200 ? '✅' : '❌';
        console.log(`${statusIcon} [${request.method}] ${request.endpoint} - ${response.status()}`);
      }
    });
  });

  test('1. 登录测试', async ({ page }) => {
    console.log('\n开始登录测试...');
    
    // 访问登录页面
    await page.goto(BASE_URL);
    console.log('已打开页面:', BASE_URL);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    // 查找并点击"立即登录"按钮（如果有showcase页面）
    const loginShowButton = page.locator('button:has-text("立即登录")');
    if (await loginShowButton.isVisible({ timeout: 2000 })) {
      console.log('检测到showcase页面，点击"立即登录"...');
      await loginShowButton.click();
      await page.waitForTimeout(1000);
    }
    
    // 等待登录表单加载并可见
    console.log('等待登录表单加载...');
    await page.waitForSelector('input[placeholder*="用户名"]', { 
      state: 'visible',
      timeout: 10000 
    });
    await page.waitForSelector('input[placeholder*="密码"]', { 
      state: 'visible',
      timeout: 10000 
    });
    await page.waitForTimeout(1000);
    
    // 填写登录信息
    console.log('填写用户名:', TEST_USER.username);
    await page.fill('input[placeholder*="用户名"]', TEST_USER.username);
    await page.waitForTimeout(500);
    
    console.log('填写密码...');
    await page.fill('input[placeholder*="密码"]', TEST_USER.password);
    await page.waitForTimeout(500);
    
    // 点击登录并等待响应
    console.log('点击登录按钮...');
    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/auth/login'), { timeout: 15000 }),
      page.click('button:has-text("登录")')
    ]);
    
    // 验证登录响应
    const loginData = await response.json();
    console.log('登录响应:', JSON.stringify(loginData, null, 2));
    expect(loginData.code).toBe("200");
    
    // 等待登录成功跳转和加载
    console.log('等待页面跳转和加载...');
    await page.waitForURL('**/', { timeout: 10000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.waitForTimeout(3000);
    
    // 验证登录接口
    const loginRequest = apiRequests.find(r => r.endpoint.includes('/auth/login'));
    expect(loginRequest).toBeTruthy();
    expect(loginRequest.method).toBe('POST');
    expect(loginRequest.status).toBe(200);
    console.log('✅ 登录测试通过\n');
  });

  test('2. 首页接口测试', async ({ page }) => {
    // 先登录
    await login(page);
    
    // 等待首页加载
    await page.waitForTimeout(2000);
    
    // 验证批改会话列表接口
    const gradingListRequest = apiRequests.find(r => 
      r.endpoint.includes('/grading/grading/list')
    );
    expect(gradingListRequest).toBeTruthy();
    expect(gradingListRequest.status).toBe(200);
    
    console.log('\n✅ 首页接口测试通过');
  });

  test('3. 创建考试页面接口测试', async ({ page }) => {
    await login(page);
    
    // 点击创建考试
    await page.click('text=创建考试');
    await page.waitForTimeout(2000);
    
    // 验证答题卡模板列表
    const templateListRequest = apiRequests.find(r => 
      r.endpoint.includes('/answer-sheet-template/list')
    );
    expect(templateListRequest).toBeTruthy();
    
    // 点击"选择已有考试"
    await page.click('text=选择已有考试');
    await page.waitForTimeout(2000);
    
    // 验证考试列表接口
    const examListRequest = apiRequests.find(r => 
      r.endpoint.includes('/grading/exam/list')
    );
    expect(examListRequest).toBeTruthy();
    
    console.log('\n✅ 创建考试页面接口测试通过');
  });

  test('4. 题目批改页面接口测试', async ({ page }) => {
    await login(page);
    await page.waitForTimeout(2000);
    
    // 查找并点击第一个"作文批改"按钮
    const essayGradingButton = page.locator('button:has-text("作文批改")').first();
    if (await essayGradingButton.isVisible()) {
      await essayGradingButton.click();
      await page.waitForTimeout(3000);
      
      // 验证题目列表接口
      const questionListRequest = apiRequests.find(r => 
        r.endpoint.includes('/exam-question-list')
      );
      expect(questionListRequest).toBeTruthy();
      
      // 验证学生列表接口
      const studentListRequest = apiRequests.find(r => 
        r.endpoint.includes('/student-list')
      );
      expect(studentListRequest).toBeTruthy();
      
      // 验证批改信息接口
      const gradingRequest = apiRequests.find(r => 
        r.endpoint.includes('/exam-question/grading') &&
        !r.endpoint.includes('score-update')
      );
      expect(gradingRequest).toBeTruthy();
      
      console.log('\n✅ 题目批改页面接口测试通过');
    } else {
      console.log('\n⚠️  未找到可批改的考试，跳过题目批改测试');
    }
  });

  test('5. 数据分析页面接口测试', async ({ page }) => {
    await login(page);
    await page.waitForTimeout(2000);
    
    // 查找并点击第一个"数据分析"按钮
    const dataAnalysisButton = page.locator('button:has-text("数据分析")').first();
    if (await dataAnalysisButton.isVisible()) {
      await dataAnalysisButton.click();
      await page.waitForTimeout(2000);
      
      // 验证批改结果接口
      const resultRequest = apiRequests.find(r => 
        r.endpoint.includes('/grading/result')
      );
      expect(resultRequest).toBeTruthy();
      
      console.log('\n✅ 数据分析页面接口测试通过');
    } else {
      console.log('\n⚠️  未找到可分析的考试，跳过数据分析测试');
    }
  });

  test('6. 评分细则接口测试', async ({ page }) => {
    await login(page);
    await page.waitForTimeout(2000);
    
    // 查找并点击第一个"评分细则"按钮
    const guidelineButton = page.locator('button:has-text("评分细则")').first();
    if (await guidelineButton.isVisible()) {
      await guidelineButton.click();
      await page.waitForTimeout(2000);
      
      // 验证评分细则接口
      const guidelineRequest = apiRequests.find(r => 
        r.endpoint.includes('/exam/guideline')
      );
      expect(guidelineRequest).toBeTruthy();
      
      console.log('\n✅ 评分细则接口测试通过');
    } else {
      console.log('\n⚠️  未找到评分细则按钮，跳过测试');
    }
  });

  test('🎯 完整接口统计报告', async ({ page }) => {
    await login(page);
    await page.waitForTimeout(2000);
    
    // 访问各个页面
    console.log('\n📊 开始收集所有接口调用...\n');
    
    // 创建考试页面
    await page.click('text=创建考试');
    await page.waitForTimeout(2000);
    await page.click('text=选择已有考试');
    await page.waitForTimeout(2000);
    
    // 返回首页
    await page.click('text=返回首页');
    await page.waitForTimeout(2000);
    
    // 尝试访问题目批改
    const essayButton = page.locator('button:has-text("作文批改")').first();
    if (await essayButton.isVisible()) {
      await essayButton.click();
      await page.waitForTimeout(3000);
      await page.click('text=返回首页');
      await page.waitForTimeout(1000);
    }
    
    // 尝试访问数据分析
    const analysisButton = page.locator('button:has-text("数据分析")').first();
    if (await analysisButton.isVisible()) {
      await analysisButton.click();
      await page.waitForTimeout(2000);
      await page.click('text=返回首页');
      await page.waitForTimeout(1000);
    }
    
    // 生成统计报告
    console.log('\n' + '='.repeat(80));
    console.log('📊 接口调用统计报告');
    console.log('='.repeat(80));
    
    const successRequests = apiRequests.filter(r => r.status === 200);
    const failedRequests = apiRequests.filter(r => r.status !== 200);
    
    // 去重统计
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
    
    console.log('\n' + '='.repeat(80) + '\n');
  });
});

// 辅助函数：登录
async function login(page) {
  // 访问登录页面
  await page.goto(BASE_URL);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);
  
  // 查找并点击"立即登录"按钮（如果有showcase页面）
  const loginShowButton = page.locator('button:has-text("立即登录")');
  if (await loginShowButton.isVisible({ timeout: 2000 })) {
    await loginShowButton.click();
    await page.waitForTimeout(1000);
  }
  
  // 等待登录表单加载并可见
  await page.waitForSelector('input[placeholder*="用户名"]', { 
    state: 'visible',
    timeout: 10000 
  });
  await page.waitForSelector('input[placeholder*="密码"]', { 
    state: 'visible',
    timeout: 10000 
  });
  await page.waitForTimeout(1000);
  
  // 填写表单
  await page.fill('input[placeholder*="用户名"]', TEST_USER.username);
  await page.waitForTimeout(500);
  await page.fill('input[placeholder*="密码"]', TEST_USER.password);
  await page.waitForTimeout(500);
  
  // 点击登录并等待网络请求完成
  const [response] = await Promise.all([
    page.waitForResponse(resp => resp.url().includes('/auth/login'), { timeout: 15000 }),
    page.click('button:has-text("登录")')
  ]);
  
  // 检查登录是否成功
  const loginData = await response.json();
  if (loginData.code !== "200") {
    throw new Error(`登录失败: ${loginData.message}`);
  }
  
  // 等待跳转到首页
  await page.waitForURL('**/', { timeout: 10000 });
  
  // 等待页面完全加载
  await page.waitForLoadState('networkidle', { timeout: 15000 });
  await page.waitForTimeout(3000);
}

