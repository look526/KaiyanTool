describe('登录测试', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('应该能够使用正确的凭据登录', () => {
    // 使用测试账号登录
    cy.login('test@example.com', 'password123');
    
    // 验证登录后跳转到项目列表页
    cy.url().should('include', '/projects');
    cy.contains('项目列表').should('be.visible');
  });

  it('应该在使用错误的凭据时显示错误信息', () => {
    // 使用错误的密码
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    
    // 验证显示错误信息
    cy.contains('登录失败').should('be.visible');
  });

  it('应该在输入为空时显示验证错误', () => {
    // 直接点击登录按钮
    cy.get('button[type="submit"]').click();
    
    // 验证显示验证错误
    cy.get('input[type="email"]').should('have.class', 'border-red-500');
    cy.get('input[type="password"]').should('have.class', 'border-red-500');
  });

  it('应该能够导航到注册页面', () => {
    // 点击注册链接
    cy.contains('注册').click();
    
    // 验证跳转到注册页面
    cy.url().should('include', '/register');
    cy.contains('创建账户').should('be.visible');
  });

  it('应该能够导航到忘记密码页面', () => {
    // 点击忘记密码链接
    cy.contains('忘记密码').click();
    
    // 验证跳转到忘记密码页面
    cy.url().should('include', '/forgot-password');
    cy.contains('重置密码').should('be.visible');
  });
});
