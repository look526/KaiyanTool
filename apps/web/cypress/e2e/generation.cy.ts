describe('图像生成测试', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'password123');
    cy.visit('/projects');
  });

  it('应该能够导航到图像生成页面', () => {
    cy.get('[data-testid="project-item"]').first().click();
    cy.contains('图像生成').click();
    cy.url().should('include', '/image-generation');
  });

  it('应该能够输入提示词并生成图像', () => {
    cy.visit('/projects/test-project-id/image-generation');
    
    const prompt = '一只可爱的猫咪在草地上玩耍';
    cy.get('textarea[name="prompt"]').type(prompt);
    
    cy.get('button:contains("生成图像")').click();
    
    cy.contains('生成中', { timeout: 10000 }).should('be.visible');
  });

  it('应该能够选择图像模型', () => {
    cy.visit('/projects/test-project-id/image-generation');
    
    cy.get('[data-testid="model-selector"]').click();
    cy.contains('GPT-4o').click();
    
    cy.contains('GPT-4o').should('be.visible');
  });

  it('应该能够设置宽高比', () => {
    cy.visit('/projects/test-project-id/image-generation');
    
    cy.get('select[name="aspectRatio"]').select('16:9');
    cy.get('select[name="aspectRatio"]').should('have.value', '16:9');
  });
});

describe('视频生成测试', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'password123');
  });

  it('应该能够导航到视频生成页面', () => {
    cy.visit('/projects');
    cy.get('[data-testid="project-item"]').first().click();
    cy.contains('视频生成').click();
    cy.url().should('include', '/video-generation');
  });

  it('应该能够选择视频生成模型', () => {
    cy.visit('/projects/test-project-id/video-generation');
    
    cy.get('[data-testid="model-selector"]').click();
    cy.contains('Sora').click();
    
    cy.contains('Sora').should('be.visible');
  });
});

describe('角色管理测试', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'password123');
  });

  it('应该能够导航到角色管理页面', () => {
    cy.visit('/projects');
    cy.get('[data-testid="project-item"]').first().click();
    cy.contains('角色').click();
    cy.url().should('include', '/characters');
  });

  it('应该能够查看角色列表', () => {
    cy.visit('/projects/test-project-id/characters');
    cy.get('[data-testid="character-list"]').should('exist');
  });

  it('应该能够创建新角色', () => {
    cy.visit('/projects/test-project-id/characters');
    cy.contains('添加角色').click();
    
    cy.get('input[name="name"]').type('测试角色');
    cy.get('textarea[name="description"]').type('这是一个测试角色');
    
    cy.get('button[type="submit"]').click();
    
    cy.contains('测试角色').should('be.visible');
  });
});

describe('场景管理测试', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'password123');
  });

  it('应该能够导航到场景管理页面', () => {
    cy.visit('/projects');
    cy.get('[data-testid="project-item"]').first().click();
    cy.contains('场景').click();
    cy.url().should('include', '/scenes');
  });

  it('应该能够查看场景列表', () => {
    cy.visit('/projects/test-project-id/scenes');
    cy.get('[data-testid="scene-list"]').should('exist');
  });
});

describe('渲染队列测试', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'password123');
  });

  it('应该能够查看渲染队列', () => {
    cy.visit('/projects/test-project-id');
    cy.contains('渲染队列').click();
    cy.url().should('include', '/render-queue');
  });

  it('应该能够查看队列统计', () => {
    cy.visit('/projects/test-project-id/render-queue');
    
    cy.get('[data-testid="queue-stats"]').should('exist');
    cy.contains('待处理').should('be.visible');
    cy.contains('处理中').should('be.visible');
    cy.contains('已完成').should('be.visible');
  });
});

describe('项目设置测试', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'password123');
  });

  it('应该能够导航到项目设置', () => {
    cy.visit('/projects');
    cy.get('[data-testid="project-item"]').first().click();
    cy.contains('设置').click();
    cy.url().should('include', '/settings');
  });

  it('应该能够修改项目名称', () => {
    cy.visit('/projects/test-project-id/settings');
    
    cy.get('input[name="name"]').clear().type('新项目名称');
    cy.contains('保存').click();
    
    cy.contains('新项目名称').should('be.visible');
  });
});

describe('AI提供商设置测试', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'password123');
  });

  it('应该能够导航到AI提供商设置', () => {
    cy.visit('/settings/ai-providers');
    cy.url().should('include', '/ai-providers');
  });

  it('应该能够查看提供商列表', () => {
    cy.visit('/settings/ai-providers');
    cy.get('[data-testid="provider-list"]').should('exist');
  });
});

describe('模型配置测试', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'password123');
  });

  it('应该能够导航到模型配置页面', () => {
    cy.visit('/settings/model-configuration');
    cy.url().should('include', '/model-configuration');
  });

  it('应该能够切换内容类型标签', () => {
    cy.visit('/settings/model-configuration');
    
    cy.contains('图像生成').click();
    cy.contains('视频生成').click();
    cy.contains('文本生成').click();
  });
});
