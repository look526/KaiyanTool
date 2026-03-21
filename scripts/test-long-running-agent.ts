import { promises as fs } from 'fs';
import path from 'path';
import http from 'http';

const API_BASE_URL = 'http://localhost:3001/api/long-running-agent';
const TEST_PROJECT_ID = 'test-optimization-project-001';
const TEST_USER_ID = 'test-user-001';

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

async function readTestScenario(): Promise<string> {
  const scenarioPath = path.join(__dirname, '..', 'test-optimization-scenario.md');
  const content = await fs.readFile(scenarioPath, 'utf-8');
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
  console.log('=== 测试 Long Running Agent 系统 ===\n');

  try {
    const scenarioContent = await readTestScenario();
    
    const projectContext = `
kaiyanTool是一个基于TypeScript的Web应用，包含：
- 后端：Express + Prisma + TypeScript (运行在3001端口)
- 前端：React 19 + Vite + Tailwind (运行在3000端口)
- AI集成：支持多个AI提供商（OpenAI、Google、智普AI等）
- 数据库：PostgreSQL

已有功能：
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
    ];

    const constraints = [
      '前端端口必须是3000',
      '后端端口必须是3001',
      '必须遵循snake_case命名规范',
      '所有文件不得超过200行',
      '遵循Glassmorphism UI设计规范',
      '所有UI修改必须使用ui-refactor skill',
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
      project_id: TEST_PROJECT_ID,
      user_id: TEST_USER_ID,
      task_description: '优化kaiyanTool项目的性能、代码质量和用户体验，重点关注性能优化、代码质量提升和用户体验改进',
      project_context: projectContext,
      technologies,
      constraints,
      existing_features: existingFeatures,
      provider_id: 'openai',
      create_git_commits: false,
      workspace_path: __dirname + '/..',
    };

    console.log('步骤 1: 初始化项目');
    console.log(`项目ID: ${TEST_PROJECT_ID}`);
    console.log(`用户ID: ${TEST_USER_ID}`);
    console.log(`任务描述: ${initRequest.task_description}`);
    console.log('');

    const initResult = await makeRequest(
      'POST',
      `/projects/${TEST_PROJECT_ID}/users/${TEST_USER_ID}/initialize`,
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

    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\n步骤 2: 获取项目状态');
    const statusResult = await makeRequest('GET', `/projects/${TEST_PROJECT_ID}/status`);
    
    console.log('✓ 项目状态获取成功');
    console.log('');
    console.log('项目状态:');
    console.log(`- 总特性数: ${statusResult.data.total_features}`);
    console.log(`- 已完成: ${statusResult.data.completed_features}`);
    console.log(`- 进行中: ${statusResult.data.in_progress_features}`);
    console.log(`- 失败: ${statusResult.data.failed_features}`);
    console.log(`- 进度百分比: ${statusResult.data.progress_percentage}%`);
    console.log('');

    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\n步骤 3: 运行第一个编码会话');
    const sessionResult = await makeRequest(
      'POST',
      `/projects/${TEST_PROJECT_ID}/users/${TEST_USER_ID}/sessions`,
      {
        max_features: 3,
        session_notes: '第一个测试会话，实现前3个优先级最高的特性',
      }
    );

    console.log('✓ 编码会话执行完成');
    console.log('');
    console.log('会话结果:');
    console.log(`- 会话ID: ${sessionResult.data.session_id}`);
    console.log(`- 尝试实现的特性数: ${sessionResult.data.features_attempted}`);
    console.log(`- 成功实现的特性数: ${sessionResult.data.features_completed}`);
    console.log(`- 持续时间: ${sessionResult.data.duration_ms}ms`);
    console.log('');

    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\n步骤 4: 获取进度报告');
    const reportResult = await makeRequest('GET', `/projects/${TEST_PROJECT_ID}/report?format=json`);
    
    console.log('✓ 进度报告获取成功');
    console.log('');
    console.log('进度报告摘要:');
    console.log(`- 总进度: ${reportResult.data.summary.progress_percentage}%`);
    console.log(`- 高优先级完成: ${reportResult.data.summary.high_priority_completed}/${reportResult.data.summary.high_priority_total}`);
    console.log(`- 中优先级完成: ${reportResult.data.summary.medium_priority_completed}/${reportResult.data.summary.medium_priority_total}`);
    console.log(`- 低优先级完成: ${reportResult.data.summary.low_priority_completed}/${reportResult.data.summary.low_priority_total}`);
    console.log('');

    console.log('\n=== 测试完成 ===');
    console.log('Long Running Agent系统测试成功！');
    console.log('');
    console.log('后续步骤:');
    console.log('1. 查看生成的特性列表');
    console.log('2. 检查实现的代码质量');
    console.log('3. 运行测试验证功能');
    console.log('4. 继续运行更多编码会话以完成所有特性');

  } catch (error) {
    console.error('\n✗ 测试失败');
    console.error(error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

async function main() {
  console.log('等待后端服务启动...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  await initializeProject();
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
