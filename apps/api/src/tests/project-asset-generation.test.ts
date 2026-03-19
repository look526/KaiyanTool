import crypto from 'crypto';
import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { prisma } from '../../jest.setup';
import sceneRoutes from '../routes/scene.routes';
import shotRoutes from '../routes/shot.routes';

describe('Project asset generation routes', () => {
  let app: Express;
  let userId: string;
  let projectId: string;
  let sessionToken: string;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use('/api', sceneRoutes);
    app.use('/api', shotRoutes);
  });

  beforeEach(async () => {
    userId = crypto.randomUUID();
    projectId = crypto.randomUUID();
    sessionToken = crypto.randomUUID().replace(/-/g, '');

    await prisma.shot.deleteMany({
      where: {
        OR: [{ project_id: projectId }],
      },
    });
    await prisma.scene.deleteMany({
      where: {
        OR: [{ project_id: projectId }],
      },
    });
    await prisma.episode.deleteMany({
      where: { project_id: projectId },
    });
    await prisma.project.deleteMany({
      where: { id: projectId },
    });
    await prisma.session.deleteMany({
      where: { user_id: userId },
    });
    await prisma.user.deleteMany({
      where: { id: userId },
    });

    await prisma.user.create({
      data: {
        id: userId,
        email: `asset-test-${userId}@example.com`,
        password_hash: 'test-password-hash',
        name: 'Asset Test User',
        updated_at: new Date(),
      },
    });

    await prisma.project.create({
      data: {
        id: projectId,
        owner_id: userId,
        name: 'Asset Generation Project',
        updated_at: new Date(),
      },
    });

    await prisma.session.create({
      data: {
        id: crypto.randomUUID(),
        user_id: userId,
        token: sessionToken,
        expires_at: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
  });

  afterEach(async () => {
    await prisma.shot.deleteMany({
      where: { project_id: projectId },
    });
    await prisma.scene.deleteMany({
      where: { project_id: projectId },
    });
    await prisma.episode.deleteMany({
      where: { project_id: projectId },
    });
    await prisma.project.deleteMany({
      where: { id: projectId },
    });
    await prisma.session.deleteMany({
      where: { user_id: userId },
    });
    await prisma.user.deleteMany({
      where: { id: userId },
    });
  });

  it('should create a project scene and shot even when the project has no episode yet', async () => {
    const sceneResponse = await request(app)
      .post(`/api/projects/${projectId}/scenes`)
      .set('Cookie', [`sessionId=${sessionToken}`])
      .send({
        location: '测试场景',
        time: '白天',
        description: '用于测试自动创建分集',
      });

    expect(sceneResponse.status).toBe(201);
    expect(sceneResponse.body.success).toBe(true);
    expect(sceneResponse.body.data.id).toBeDefined();
    expect(sceneResponse.body.data.episode_id).toBeDefined();
    expect(sceneResponse.body.data.project_id).toBe(projectId);

    const episodes = await prisma.episode.findMany({
      where: { project_id: projectId },
    });

    expect(episodes).toHaveLength(1);
    expect(sceneResponse.body.data.episode_id).toBe(episodes[0].id);

    const shotResponse = await request(app)
      .post(`/api/projects/${projectId}/shots`)
      .set('Cookie', [`sessionId=${sessionToken}`])
      .send({
        scene_id: sceneResponse.body.data.id,
        chapter_number: 1,
        episode_number: 1,
        segment_id: 1,
        cell_id: 1,
        action_summary: '测试分镜',
        start_prompt: '开始提示词',
        end_prompt: '结束提示词',
        duration: 3,
        aspect_ratio: '16:9',
        camera_movement: '固定镜头',
      });

    expect(shotResponse.status).toBe(201);
    expect(shotResponse.body.id).toBeDefined();
    expect(shotResponse.body.project_id).toBe(projectId);
    expect(shotResponse.body.scene_id).toBe(sceneResponse.body.data.id);
    expect(shotResponse.body.episode_id).toBe(episodes[0].id);
  });
});
