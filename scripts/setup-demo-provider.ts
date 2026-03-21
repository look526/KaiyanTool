import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupDemoProvider() {
  console.log('设置演示AI提供商...');

  try {
    const demoUserId = '00000000-0000-0000-0000-000000000001';
    const providerId = '00000000-0000-0000-0000-000000000002';

    console.log('创建演示用户...');
    await prisma.user.upsert({
      where: { id: demoUserId },
      update: {},
      create: {
        id: demoUserId,
        email: 'dev@example.com',
        password_hash: 'demo',
        name: 'Dev User',
        updated_at: new Date(),
      },
    });
    console.log('✓ 演示用户创建成功');

    const provider = await prisma.aIProvider.upsert({
      where: {
        id: providerId,
      },
      update: {},
      create: {
        id: providerId,
        user_id: demoUserId,
        type: 'openai',
        api_key: process.env.OPENAI_API_KEY || 'demo-key',
        enabled: true,
        updated_at: new Date(),
      },
    });

    console.log('✓ AI提供商设置成功');
    console.log(`提供商ID: ${provider.id}`);
    console.log(`类型: ${provider.type}`);
    console.log(`已启用: ${provider.enabled}`);
  } catch (error) {
    console.error('✗ 设置失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

setupDemoProvider().catch(console.error);
