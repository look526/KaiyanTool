describe('项目管理测试', () => {
  beforeEach(() => {
    // 登录
    cy.login('test@example.com', 'password123');
  });

  it('应该能够查看项目列表', () => {
    // 验证在项目列表页面
    cy.url().should('include', '/projects');
    cy.contains('项目列表').should('be.visible');
    
    // 验证项目列表元素存在
    cy.get('[data-testid="project-list"]').should('exist');
  });

  it('应该能够创建新项目', () => {
    // 点击创建项目按钮
    cy.contains('创建项目').click();
    
    // 验证在创建项目页面
    cy.url().should('include', '/projects/new');
    cy.contains('创建新项目').should('be.visible');
    
    // 填写项目信息
    const projectName = `测试项目_${Date.now()}`;
    cy.get('input[name="name"]').type(projectName);
    cy.get('textarea[name="description"]').type('这是一个测试项目');
    cy.get('select[name="type"]').select('script');
    
    // 提交表单
    cy.get('button[type="submit"]').click();
    
    // 验证跳转到项目详情页
    cy.url().should('include', '/projects/');
    cy.contains(projectName).should('be.visible');
  });

  it('应该能够查看项目详情', () => {
    // 点击第一个项目
    cy.get('[data-testid="project-item"]').first().click();
    
    // 验证在项目详情页面
    cy.url().should('include', '/projects/');
    cy.contains('项目详情').should('be.visible');
    
    // 验证项目详情元素存在
    cy.get('[data-testid="project-details"]').should('exist');
  });

  it('应该能够导航到项目的各个子页面', () => {
    // 点击第一个项目
    cy.get('[data-testid="project-item"]').first().click();
    
    // 导航到剧本编辑器
    cy.contains('剧本').click();
    cy.url().should('include', '/script');
    
    // 导航到角色页面
    cy.contains('角色').click();
    cy.url().should('include', '/characters');
    
    // 导航到场景页面
    cy.contains('场景').click();
    cy.url().should('include', '/scenes');
    
    // 导航到成员页面
    cy.contains('成员').click();
    cy.url().should('include', '/members');
  });

  it('应该能够搜索项目', () => {
    // 输入搜索关键词
    cy.get('input[placeholder="搜索项目"]').type('测试');
    
    // 验证搜索结果
    cy.get('[data-testid="project-item"]').should('exist');
  });
});
