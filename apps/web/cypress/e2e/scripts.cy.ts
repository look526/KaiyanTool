describe('剧本功能测试', () => {
  beforeEach(() => {
    // 登录
    cy.login('test@example.com', 'password123');
    
    // 进入第一个项目
    cy.get('[data-testid="project-item"]').first().click();
  });

  it('应该能够访问剧本编辑器', () => {
    // 导航到剧本编辑器
    cy.contains('剧本').click();
    
    // 验证在剧本编辑器页面
    cy.url().should('include', '/script');
    cy.contains('剧本编辑器').should('be.visible');
    
    // 验证编辑器元素存在
    cy.get('[data-testid="script-editor"]').should('exist');
  });

  it('应该能够编辑剧本内容', () => {
    // 导航到剧本编辑器
    cy.contains('剧本').click();
    
    // 输入剧本标题
    cy.get('input[placeholder="剧本标题"]').type('测试剧本');
    
    // 输入剧本内容
    cy.get('[data-testid="script-content"]').type('场景1 - 室内，白天\n\n主角A：你好！\n主角B：你好！\n');
    
    // 点击保存按钮
    cy.contains('保存').click();
    
    // 验证保存成功
    cy.contains('保存成功').should('be.visible');
  });

  it('应该能够使用AI续写功能', () => {
    // 导航到剧本编辑器
    cy.contains('剧本').click();
    
    // 输入一些初始内容
    cy.get('[data-testid="script-content"]').type('场景1 - 咖啡厅\n\n主角A：今天天气真好！\n');
    
    // 点击AI续写按钮
    cy.contains('AI续写').click();
    
    // 等待AI生成内容
    cy.wait(5000);
    
    // 验证内容被添加
    cy.get('[data-testid="script-content"]').should('contain', '主角B');
  });

  it('应该能够使用AI改写功能', () => {
    // 导航到剧本编辑器
    cy.contains('剧本').click();
    
    // 输入一些初始内容
    cy.get('[data-testid="script-content"]').type('场景1 - 咖啡厅\n\n主角A：你好！\n');
    
    // 点击AI改写按钮
    cy.contains('AI改写').click();
    
    // 等待AI生成内容
    cy.wait(5000);
    
    // 验证内容被修改
    cy.get('[data-testid="script-content"]').should('not.equal', '场景1 - 咖啡厅\n\n主角A：你好！\n');
  });

  it('应该能够查看剧本预览', () => {
    // 导航到剧本编辑器
    cy.contains('剧本').click();
    
    // 输入剧本内容
    cy.get('[data-testid="script-content"]').type('场景1 - 室内，白天\n\n主角A：你好！\n主角B：你好！\n');
    
    // 点击预览按钮
    cy.contains('预览').click();
    
    // 验证预览模式
    cy.contains('场景 1').should('be.visible');
    cy.contains('主角A').should('be.visible');
    cy.contains('主角B').should('be.visible');
  });

  it('应该能够导入剧本文件', () => {
    // 导航到剧本编辑器
    cy.contains('剧本').click();
    
    // 点击导入按钮
    cy.contains('导入').click();
    
    // 这里需要使用Cypress的文件上传功能
    // 注意：实际测试中需要准备一个测试剧本文件
    cy.get('input[type="file"]').attachFile('test-script.txt');
    
    // 验证文件内容被导入
    cy.get('[data-testid="script-content"]').should('not.be.empty');
  });

  it('应该能够导出剧本文件', () => {
    // 导航到剧本编辑器
    cy.contains('剧本').click();
    
    // 输入剧本内容
    cy.get('[data-testid="script-content"]').type('场景1 - 室内，白天\n\n主角A：你好！\n');
    
    // 点击导出按钮
    cy.contains('导出').click();
    
    // 验证文件下载
    cy.verifyDownload('测试剧本.txt');
  });
});
