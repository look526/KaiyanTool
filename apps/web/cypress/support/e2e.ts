// 导入 Cypress 命令
import './commands';

// 全局 beforeEach 钩子
beforeEach(() => {
  // 在每个测试前执行的操作
  cy.viewport(1280, 720); // 设置视口大小
});

// 全局 afterEach 钩子
afterEach(() => {
  // 在每个测试后执行的操作
  // 可以在这里添加清理操作
});
