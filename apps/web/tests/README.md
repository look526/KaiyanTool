# E2E测试文档

## 概述

使用 Playwright 进行端到端 (E2E) 测试。

## 快速开始

### 安装依赖

```bash
npm install
```

### 安装 Playwright 浏览器

```bash
npx playwright install
```

### 运行测试

```bash
# 交互式模式（带UI）
npm run e2e:playwright:open

# 无头模式（CI环境）
npm run e2e:playwright

# 指定浏览器
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# 指定测试文件
npx playwright test full-workflow.spec.ts

# 运行特定测试
npx playwright test -g "should display login form"

# 调试模式
npx playwright test --debug
```

## 测试结构

```
tests/
├── e2e/              # E2E测试文件
│   └── full-workflow.spec.ts
└── fixtures/           # 测试资源
    ├── character.jpg
    ├── reference.png
    └── script.txt
```

## 测试覆盖范围

### 1. 认证测试 (Authentication)
- 登录表单显示
- 邮箱格式验证
- 成功登录跳转
- 注册链接显示

### 2. 项目管理 (Project Management)
- 项目列表显示
- 创建新项目
- 按类型过滤项目

### 3. 剧本分析 (Script Analysis)
- 剧本编辑器显示
- 剧本分析功能
- 导出分析结果

### 4. 角色管理 (Character Management)
- 角色列表显示
- 创建新角色
- 上传参考图

### 5. 场景管理 (Scene Management)
- 场景列表显示
- 生成概念图

### 6. 镜头生成 (Shot Generation)
- 镜头网格显示
- 生成关键帧
- 从关键帧生成视频

### 7. 批量生成 (Batch Generation)
- 九宫格显示
- 批量生成图片

### 8. 导出功能 (Export)
- 导出选项显示
- Premiere Pro 格式导出
- ZIP 格式导出

### 9. 响应式设计 (Responsive Design)
- 移动端视图
- 平板端视图

## 配置说明

### playwright.config.ts

- **baseURL**: API基础URL
- **retries**: 重试次数（CI: 2, 本地: 0）
- **workers**: 并发工作进程数
- **timeout**: 超时时间（60秒）
- **webServer**: 自动启动开发服务器

### 浏览器支持

- Chromium (桌面版)
- Firefox (桌面版)
- WebKit (Safari桌面版)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

## 最佳实践

### 1. 选择器稳定性

```typescript
// 推荐：使用语义化选择器
await page.click('text=登录')
await page.locator('input[type="email"]').fill('test@example.com')

// 避免：使用脆弱的CSS选择器
await page.click('.btn-primary')
```

### 2. 等待策略

```typescript
// 网络空闲等待
await page.waitForLoadState('networkidle')

// 元素可见等待
await page.waitForSelector('.result', { timeout: 30000 })

// 条件等待
await expect(page.locator('.loading')).not.toBeVisible()
```

### 3. 测试独立性

```typescript
test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.clearCookies();
});
```

### 4. 断言清晰

```typescript
// 明确的期望
await expect(page.locator('h1')).toHaveText('欢迎');

// 等待超时
await expect(page.locator('.result')).toBeVisible({ timeout: 30000 });
```

## 调试技巧

### 1. 查看测试报告

```bash
npm run e2e:playwright
```

测试完成后会生成 HTML 报告在 `playwright-report/index.html`

### 2. 调试模式

```bash
npx playwright test --debug
```

可以单步执行测试，查看每一步的状态。

### 3. 追踪模式

在测试失败时自动生成：
- 截图
- 视频
- 追踪日志

位于 `playwright-report/` 目录。

## CI/CD 集成

### GitHub Actions 示例

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## 常见问题

### 1. 测试超时

```typescript
// 增加特定测试的超时时间
test('slow operation', async ({ page }) => {
  test.setTimeout(120000);
  // ...
});
```

### 2. 网络请求失败

确保在运行测试前：
- API服务已启动 (`npm run dev` in `apps/api`)
- Web服务已启动 (`npm run dev` in `apps/web`)
- 环境变量正确配置

### 3. 浏览器未安装

```bash
npx playwright install --with-deps
```

## 维护建议

1. **定期更新**: 每次功能变更后更新测试
2. **覆盖率监控**: 确保关键路径100%覆盖
3. **快速失败**: CI环境应该快速失败
4. **独立测试**: 每个测试应该独立运行
5. **清晰命名**: 测试名称应该描述测试意图
