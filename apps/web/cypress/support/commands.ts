// 导入文件上传插件
import 'cypress-file-upload';

// 登录命令
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/projects');
});

// 导航到项目详情页
Cypress.Commands.add('navigateToProject', (projectId: string) => {
  cy.visit(`/projects/${projectId}`);
  cy.url().should('include', `/projects/${projectId}`);
});

// 导航到剧本编辑器
Cypress.Commands.add('navigateToScriptEditor', (projectId: string) => {
  cy.visit(`/projects/${projectId}/script`);
  cy.url().should('include', `/projects/${projectId}/script`);
});

// 导航到剧本查看器
Cypress.Commands.add('navigateToScriptViewer', (projectId: string, scriptId: string) => {
  cy.visit(`/projects/${projectId}/scripts/${scriptId}`);
  cy.url().should('include', `/projects/${projectId}/scripts/${scriptId}`);
});

// 创建新项目
Cypress.Commands.add('createProject', (name: string, description: string = '测试项目') => {
  cy.visit('/projects/new');
  cy.get('input[name="name"]').type(name);
  cy.get('textarea[name="description"]').type(description);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/projects/');
});

// 等待页面加载完成
Cypress.Commands.add('waitForPageLoad', () => {
  cy.window().its('document.readyState').should('eq', 'complete');
});

// 检查元素是否可见
Cypress.Commands.add('isVisible', (selector: string) => {
  cy.get(selector).should('be.visible');
});

// 检查元素是否存在
Cypress.Commands.add('exists', (selector: string) => {
  cy.get(selector).should('exist');
});
