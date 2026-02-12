import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('登录');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should show error on invalid email', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page.locator('.error-message')).toContainText('请输入有效的邮箱');
  });

  test('should redirect to dashboard on successful login', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should show registration link', async ({ page }) => {
    await expect(page.locator('a[href="/register"]')).toBeVisible();
  });
});

test.describe('Project Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('should display project list', async ({ page }) => {
    await expect(page.locator('.project-card')).toHaveCount(10);
  });

  test('should create new project', async ({ page }) => {
    await page.click('text=新建项目');
    await expect(page.locator('h2')).toContainText('新建项目');
    
    await page.fill('input[name="name"]', '测试项目');
    await page.fill('textarea[name="description"]', '这是一个测试项目');
    await page.click('text=创建');
    
    await expect(page).toHaveURL(/\/project\//);
  });

  test('should filter projects by type', async ({ page }) => {
    await page.click('text=电影');
    await expect(page.locator('.project-card')).toHaveCount(5);
  });
});

test.describe('Script Analysis', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/project/test-project/script');
    await page.waitForLoadState('networkidle');
  });

  test('should display script editor', async ({ page }) => {
    await expect(page.locator('.monaco-editor')).toBeVisible();
  });

  test('should analyze script successfully', async ({ page }) => {
    await page.fill('.monaco-editor', '这是一个测试剧本内容');
    await page.click('text=分析剧本');
    
    await expect(page.locator('.loading-spinner')).toBeVisible();
    await page.waitForSelector('.analysis-result', { timeout: 30000 });
    await expect(page.locator('.analysis-result')).toContainText('分析完成');
  });

  test('should export analysis result', async ({ page }) => {
    await page.click('text=导出');
    await expect(page.locator('.export-dialog')).toBeVisible();
  });
});

test.describe('Character Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/project/test-project/characters');
    await page.waitForLoadState('networkidle');
  });

  test('should display character list', async ({ page }) => {
    await expect(page.locator('.character-card')).toHaveCount(3);
  });

  test('should create new character', async ({ page }) => {
    await page.click('text=添加角色');
    await page.fill('input[name="name"]', '测试角色');
    await page.fill('textarea[name="description"]', '角色描述');
    await page.click('text=生成定妆照');
    
    await expect(page.locator('.loading-spinner')).toBeVisible();
    await page.waitForSelector('.character-image', { timeout: 60000 });
  });

  test('should upload character reference image', async ({ page }) => {
    await page.click('text=上传参考图');
    const fileChooser = await page.waitForEvent('filechooser');
    await fileChooser.setFiles('tests/fixtures/character.jpg');
    await expect(page.locator('.reference-image')).toBeVisible();
  });
});

test.describe('Scene Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/project/test-project/scenes');
    await page.waitForLoadState('networkidle');
  });

  test('should display scene list', async ({ page }) => {
    await expect(page.locator('.scene-card')).toHaveCount(5);
  });

  test('should generate scene concept', async ({ page }) => {
    await page.fill('textarea[name="description"]', '一个阳光明媚的海滩场景');
    await page.click('text=生成概念图');
    
    await expect(page.locator('.loading-spinner')).toBeVisible();
    await page.waitForSelector('.concept-image', { timeout: 60000 });
  });
});

test.describe('Shot Generation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/project/test-project/shots');
    await page.waitForLoadState('networkidle');
  });

  test('should display shot grid', async ({ page }) => {
    await expect(page.locator('.shot-card')).toHaveCount(12);
  });

  test('should generate keyframe', async ({ page }) => {
    await page.click('.shot-card >> nth=0');
    await page.click('text=生成起始帧');
    
    await expect(page.locator('.loading-spinner')).toBeVisible();
    await page.waitForSelector('.keyframe-image', { timeout: 60000 });
  });

  test('should generate video from keyframes', async ({ page }) => {
    await page.click('.shot-card >> nth=0');
    await page.fill('input[name="duration"]', '5');
    await page.click('text=生成视频');
    
    await expect(page.locator('.video-preview')).toBeVisible({ timeout: 120000 });
  });
});

test.describe('Batch Generation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/project/test-project/batch');
    await page.waitForLoadState('networkidle');
  });

  test('should display 9-grid panel', async ({ page }) => {
    await expect(page.locator('.nine-grid')).toHaveCount(9);
  });

  test('should batch generate images', async ({ page }) => {
    await page.fill('textarea[name="prompt"]', '美丽的风暴场景');
    await page.click('text=一键生成全部');
    
    await expect(page.locator('.generating')).toHaveCount(9);
    await page.waitForSelector('.completed', { timeout: 300000 });
  });
});

test.describe('Export', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/project/test-project/export');
    await page.waitForLoadState('networkidle');
  });

  test('should display export options', async ({ page }) => {
    await expect(page.locator('.export-option')).toHaveCount(4);
  });

  test('should export to Premiere Pro format', async ({ page }) => {
    await page.click('text=Premiere Pro');
    await page.click('text=导出');
    
    const download = await page.waitForEvent('download');
    expect(download.suggestedFilename()).toContain('.prproj');
  });

  test('should export all assets as ZIP', async ({ page }) => {
    await page.click('text=ZIP格式');
    await page.click('text=导出全部');
    
    const download = await page.waitForEvent('download');
    expect(download.suggestedFilename()).toContain('.zip');
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('.mobile-menu')).toBeVisible();
    await expect(page.locator('.project-card').first()).toBeVisible();
  });

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('.project-card')).toHaveCount(12);
  });
});
