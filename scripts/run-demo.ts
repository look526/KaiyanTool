import { promises as fs } from 'fs';
import path from 'path';
import http from 'http';

const API_BASE_URL = 'http://localhost:3001/api/long-running-agent';
const DEMO_PROJECT_ID = 'demo-task-scheduler-001';
const DEMO_USER_ID = 'demo-user-001';

interface InitProjectRequest {
  project_id: string;
  user_id: string;
  task_description: string;
  project_context?: string;
  technologies?: string[];
  constraints?: string[];
  existing_features?: string[];
  provider_id: string;
  create_git_commits?: boolean;
  workspace_path?: string;
}

async function readDemoRequirements(): Promise<string> {
  const requirementsPath = path.join(__dirname, '..', 'demo-requirements.md');
  const content = await fs.readFile(requirementsPath, 'utf-8');
  return content;
}

async function makeRequest(method: string, path: string, body?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 3001,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'sessionId=demo-session-token', // 使用模拟会话令牌
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(parsed)}`));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function initializeProject(): Promise<void> {
  console.log('=== Long Running Agent 演示 ===\n');

  try {
    const requirementsContent = await readDemoRequirements();
    
    const projectContext = `
kaiyanTool是一个基于TypeScript的Web应用，包含：
- 后端：Express + Prisma + TypeScript (运行在3001端口)
- 前端：React 19 + Vite + Tailwind (运行在3000端口)
- AI集成：支持多个AI提供商（OpenAI、Google、智普AI等）
- 数据库：PostgreSQL

现有功能：
- 用户认证系统
- 项目管理
- 文档处理
- AI集成（文本、图像、视频、音频生成）
- 字幕生成
- BGM生成
- TTS文本转语音
- 工作流管理
- 视频生成
- 脚本分析
- 场景概念生成
- 质量评分
- 渲染队列
- 图片增强
- 服装变体生成
- 数据备份和恢复
- 协作功能
- 分析功能
`;

    const technologies = [
      'Node.js',
      'Express',
      'Prisma',
      'TypeScript',
      'React 19',
      'Vite',
      'Tailwind CSS',
      'PostgreSQL',
      'Redis',
      'WebSocket',
    ];

    const constraints = [
      '前端端口必须是3000',
      '后端端口必须是3001',
      '必须遵循snake_case命名规范',
      '所有文件不得超过200行',
      '遵循Glassmorphism UI设计规范',
      '所有UI修改必须使用ui-refactor skill',
      '使用Redis作为任务队列',
      '使用WebSocket进行实时更新',
    ];

    const existingFeatures = [
      '用户认证系统',
      '项目管理',
      '文档处理',
      'AI集成（文本、图像、视频、音频生成）',
      '字幕生成',
      'BGM生成',
      'TTS文本转语音',
      '工作流管理',
      '视频生成',
      '脚本分析',
      '场景概念生成',
      '质量评分',
      '渲染队列',
      '图片增强',
      '服装变体生成',
      '数据备份和恢复',
      '协作功能',
      '分析功能',
    ];

    const initRequest: InitProjectRequest = {
      project_id: DEMO_PROJECT_ID,
      user_id: DEMO_USER_ID,
      task_description: '为kaiyanTool项目添加一个智能任务调度功能，能够根据任务的优先级、依赖关系和资源可用性自动调度和执行任务',
      project_context: projectContext,
      technologies,
      constraints,
      existing_features: existingFeatures,
      provider_id: 'openai',
      create_git_commits: false,
      workspace_path: __dirname + '/..',
    };

    console.log('步骤 1: 初始化演示项目');
    console.log(`项目ID: ${DEMO_PROJECT_ID}`);
    console.log(`用户ID: ${DEMO_USER_ID}`);
    console.log(`任务描述: ${initRequest.task_description}`);
    console.log('');

    const initResult = await makeRequest(
      'POST',
      `/projects/${DEMO_PROJECT_ID}/users/${DEMO_USER_ID}/initialize`,
      initRequest
    );

    console.log('✓ 项目初始化成功');
    console.log('');
    console.log('初始化结果:');
    console.log(`- 生成的特性数量: ${initResult.data.features_generated}`);
    console.log(`- 进度文件创建: ${initResult.data.progress_file_created}`);
    console.log(`- Git提交创建: ${initResult.data.git_commit_created}`);
    console.log(`- 会话ID: ${initResult.data.session_id}`);
    console.log('');
    console.log('下一步建议:');
    initResult.data.next_steps.forEach((step: string, index: number) => {
      console.log(`${index + 1}. ${step}`);
    });
    console.log('');

    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('\n步骤 2: 获取项目状态');
    const statusResult = await makeRequest('GET', `/projects/${DEMO_PROJECT_ID}/status`);
    
    console.log('✓ 项目状态获取成功');
    console.log('');
    console.log('项目状态:');
    console.log(`- 总特性数: ${statusResult.data.total_features}`);
    console.log(`- 已完成: ${statusResult.data.completed_features}`);
    console.log(`- 进行中: ${statusResult.data.in_progress_features}`);
    console.log(`- 失败: ${statusResult.data.failed_features}`);
    console.log(`- 进度百分比: ${statusResult.data.progress_percentage}%`);
    console.log('');

    console.log('\n=== 演示完成 ===');
    console.log('Long Running Agent系统演示成功！');
    console.log('');
    console.log('系统已准备就绪，可以开始实现特性。');
    console.log('接下来可以：');
    console.log('1. 查看生成的特性列表');
    console.log('2. 运行编码会话实现特性');
    console.log('3. 查看进度报告');
    console.log('4. 自动运行多个会话完成所有特性');

  } catch (error) {
    console.error('\n✗ 演示失败');
    console.error(error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

async function main() {
  console.log('等待后端服务启动...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await initializeProject();
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
