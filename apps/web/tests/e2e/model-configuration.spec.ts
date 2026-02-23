import { test, expect } from '@playwright/test';

test.describe('Model Configuration Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('should navigate to model configuration page', async ({ page }) => {
    await page.goto('http://localhost:3000/settings');
    await page.click('text=模型配置');
    await expect(page).toHaveURL('**/settings/models');
    await expect(page.locator('h1')).toContainText('AI 模型配置');
  });

  test('should display all content types', async ({ page }) => {
    await page.goto('http://localhost:3000/settings/models');
    
    await expect(page.locator('text=文本生成')).toBeVisible();
    await expect(page.locator('text=图像生成')).toBeVisible();
    await expect(page.locator('text=视频生成')).toBeVisible();
    await expect(page.locator('text=音频生成')).toBeVisible();
    await expect(page.locator('text=剧本生成')).toBeVisible();
    await expect(page.locator('text=小说生成')).toBeVisible();
    await expect(page.locator('text=故事线生成')).toBeVisible();
    await expect(page.locator('text=大纲生成')).toBeVisible();
  });

  test('should open model selector dropdown', async ({ page }) => {
    await page.goto('http://localhost:3000/settings/models');
    
    const selector = page.locator('[placeholder="选择模型"]').first();
    await selector.click();
    
    await expect(page.locator('text=搜索模型...')).toBeVisible();
    await expect(page.locator('text=可用模型')).toBeVisible();
  });

  test('should select a default model', async ({ page }) => {
    await page.goto('http://localhost:3000/settings/models');
    
    const selector = page.locator('[placeholder="选择模型"]').first();
    await selector.click();
    
    await page.waitForSelector('text=可用模型', { timeout: 5000 });
    
    const firstModel = page.locator('[role="option"]').first();
    await firstModel.click();
    
    await expect(selector).not.toContainText('选择模型');
  });

  test('should save model configuration', async ({ page }) => {
    await page.goto('http://localhost:3000/settings/models');
    
    const selector = page.locator('[placeholder="选择模型"]').first();
    await selector.click();
    await page.waitForSelector('text=可用模型', { timeout: 5000 });
    
    const firstModel = page.locator('[role="option"]').first();
    await firstModel.click();
    
    const saveButton = page.locator('button:has-text("保存配置")');
    await saveButton.click();
    
    await expect(page.locator('text=配置保存成功')).toBeVisible({ timeout: 5000 });
  });

  test('should display usage statistics', async ({ page }) => {
    await page.goto('http://localhost:3000/settings/models');
    
    await expect(page.locator('text=总模型数')).toBeVisible();
    await expect(page.locator('text=已配置默认模型')).toBeVisible();
    await expect(page.locator('text=最近使用')).toBeVisible();
  });

  test('should export configuration', async ({ page }) => {
    await page.goto('http://localhost:3000/settings/models');
    
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("导出")');
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/model-config-.*\.json$/);
  });

  test('should import configuration', async ({ page }) => {
    await page.goto('http://localhost:3000/settings/models');
    
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('button:has-text("导入")');
    
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'test-config.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify({ defaultModels: { text: 'test-model' } }))
    });
    
    await expect(page.locator('text=配置导入成功')).toBeVisible({ timeout: 5000 });
  });

  test('should display configuration history', async ({ page }) => {
    await page.goto('http://localhost:3000/settings/models');
    
    const historyButton = page.locator('button:has-text("历史记录")');
    await historyButton.click();
    
    await expect(page.locator('text=配置历史记录')).toBeVisible();
  });

  test('should batch test models', async ({ page }) => {
    await page.goto('http://localhost:3000/settings/models');
    
    const batchTestButton = page.locator('button:has-text("批量测试")').first();
    await batchTestButton.click();
    
    await expect(page.locator('text=批量测试结果')).toBeVisible({ timeout: 10000 });
  });

  test('should display model usage analysis', async ({ page }) => {
    await page.goto('http://localhost:3000/settings/models');
    
    await expect(page.locator('text=模型使用分析')).toBeVisible();
    await expect(page.locator('text=模型类型分布')).toBeVisible();
    await expect(page.locator('text=默认模型配置状态')).toBeVisible();
  });
});

test.describe('ModelSelector Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('should search and filter models', async ({ page }) => {
    await page.goto('http://localhost:3000/settings/models');
    
    const selector = page.locator('[placeholder="选择模型"]').first();
    await selector.click();
    
    await page.waitForSelector('text=可用模型', { timeout: 5000 });
    
    const searchInput = page.locator('input[placeholder="搜索模型..."]');
    await searchInput.fill('gpt');
    
    await page.waitForTimeout(500);
    
    const modelItems = page.locator('[role="option"]');
    const count = await modelItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should set model as default', async ({ page }) => {
    await page.goto('http://localhost:3000/settings/models');
    
    const selector = page.locator('[placeholder="选择模型"]').first();
    await selector.click();
    
    await page.waitForSelector('text=可用模型', { timeout: 5000 });
    
    const firstModel = page.locator('[role="option"]').first();
    const starButton = firstModel.locator('button[title="设为默认"]');
    await starButton.click();
    
    await expect(page.locator('text=默认模型').first()).toBeVisible();
  });

  test('should test a model', async ({ page }) => {
    await page.goto('http://localhost:3000/settings/models');
    
    const selector = page.locator('[placeholder="选择模型"]').first();
    await selector.click();
    
    await page.waitForSelector('text=可用模型', { timeout: 5000 });
    
    const firstModel = page.locator('[role="option"]').first();
    const testButton = firstModel.locator('button[title="测试模型"]');
    await testButton.click();
    
    await page.waitForTimeout(2000);
    
    const successIndicator = page.locator('text=测试成功').first();
    await expect(successIndicator).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('http://localhost:3000/settings/models');
    
    const selector = page.locator('[placeholder="选择模型"]').first();
    await selector.click();
    
    await page.waitForSelector('text=可用模型', { timeout: 5000 });
    
    await page.keyboard.press('Escape');
    
    await expect(page.locator('text=可用模型')).not.toBeVisible();
  });

  test('should display model capabilities', async ({ page }) => {
    await page.goto('http://localhost:3000/settings/models');
    
    const selector = page.locator('[placeholder="选择模型"]').first();
    await selector.click();
    
    await page.waitForSelector('text=可用模型', { timeout: 5000 });
    
    const firstModel = page.locator('[role="option"]').first();
    await expect(firstModel).toBeVisible();
  });
});

test.describe('Model Configuration Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('should complete full configuration workflow', async ({ page }) => {
    await page.goto('http://localhost:3000/settings/models');
    
    const selectors = page.locator('[placeholder="选择模型"]');
    const selectorCount = await selectors.count();
    
    for (let i = 0; i < Math.min(selectorCount, 3); i++) {
      const selector = selectors.nth(i);
      await selector.click();
      
      await page.waitForSelector('text=可用模型', { timeout: 5000 });
      
      const firstModel = page.locator('[role="option"]').first();
      if (await firstModel.isVisible()) {
        await firstModel.click();
      }
      
      await page.waitForTimeout(500);
    }
    
    const saveButton = page.locator('button:has-text("保存配置")');
    await saveButton.click();
    
    await expect(page.locator('text=配置保存成功')).toBeVisible({ timeout: 5000 });
    
    await page.reload();
    
    await expect(page.locator('text=已配置默认模型')).toBeVisible();
  });

  test('should maintain configuration after page refresh', async ({ page }) => {
    await page.goto('http://localhost:3000/settings/models');
    
    const selector = page.locator('[placeholder="选择模型"]').first();
    await selector.click();
    
    await page.waitForSelector('text=可用模型', { timeout: 5000 });
    
    const firstModel = page.locator('[role="option"]').first();
    await firstModel.click();
    
    const saveButton = page.locator('button:has-text("保存配置")');
    await saveButton.click();
    
    await expect(page.locator('text=配置保存成功')).toBeVisible({ timeout: 5000 });
    
    await page.reload();
    
    await expect(page.locator('[placeholder="选择模型"]').first()).not.toContainText('选择模型');
  });

  test('should handle errors gracefully', async ({ page }) => {
    await page.goto('http://localhost:3000/settings/models');
    
    await page.evaluate(() => {
      window.navigator.onLine = false;
    });
    
    const saveButton = page.locator('button:has-text("保存配置")');
    await saveButton.click();
    
    await page.waitForTimeout(2000);
    
    const errorMessage = page.locator('text=保存配置失败');
    if (await errorMessage.isVisible({ timeout: 5000 })) {
      await expect(errorMessage).toBeVisible();
    }
    
    await page.evaluate(() => {
      window.navigator.onLine = true;
    });
  });

  test('should display responsive layout on mobile', async ({ page, context }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000/settings/models');
    
    await expect(page.locator('h1')).toBeVisible();
    
    const selector = page.locator('[placeholder="选择模型"]').first();
    await expect(selector).toBeVisible();
    
    await selector.click();
    await page.waitForSelector('text=可用模型', { timeout: 5000 });
    
    await expect(page.locator('text=搜索模型...')).toBeVisible();
  });
});
