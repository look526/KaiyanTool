import request from 'supertest';
import express, { Express } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../jest.setup';
import projectRoutes from '../src/routes/project.routes';
import { authenticate } from '../src/middleware/auth.middleware';

describe('Project Controller', () => {
  let app: Express;
  let testUser: any;
  let authToken: string;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    app.use('/api/projects', authenticate, projectRoutes);

    testUser = await prisma.user.create({
      data: {
        email: 'project-test@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
        name: 'Project Test User',
      },
    });

    authToken = jwt.sign(
      { userId: testUser.id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
  });

  beforeEach(async () => {
    await prisma.project.deleteMany();
    await prisma.projectMember.deleteMany();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
  });

  describe('POST /api/projects', () => {
    it('should create a new project', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'My Test Project',
          description: 'A test project description',
          type: 'script',
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('My Test Project');
      expect(response.body.description).toBe('A test project description');
      expect(response.body.type).toBe('script');
      expect(response.body.ownerId).toBe(testUser.id);
      expect(response.body.id).toBeDefined();
    });

    it('should return 400 for missing name', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'A test project without name',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Project name is required');
    });

    it('should return 401 without auth token', async () => {
      const appWithoutAuth = express();
      appWithoutAuth.use(express.json());
      appWithoutAuth.use('/api/projects', projectRoutes);

      const response = await request(appWithoutAuth)
        .post('/api/projects')
        .send({
          name: 'Unauthorized Project',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/projects', () => {
    beforeEach(async () => {
      await prisma.project.createMany({
        data: [
          {
            name: 'Project 1',
            ownerId: testUser.id,
            type: 'script',
          },
          {
            name: 'Project 2',
            ownerId: testUser.id,
            type: 'novel',
          },
        ],
      });
    });

    it('should list all projects for user', async () => {
      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].name).toBeDefined();
    });

    it('should filter projects by type', async () => {
      const response = await request(app)
        .get('/api/projects?type=script')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].type).toBe('script');
    });
  });

  describe('GET /api/projects/:id', () => {
    let testProject: any;

    beforeEach(async () => {
      testProject = await prisma.project.create({
        data: {
          name: 'Test Project',
          ownerId: testUser.id,
          description: 'Test description',
        },
      });
    });

    it('should get project by id', async () => {
      const response = await request(app)
        .get(`/api/projects/${testProject.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Test Project');
      expect(response.body.description).toBe('Test description');
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app)
        .get('/api/projects/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Project not found');
    });
  });

  describe('PATCH /api/projects/:id', () => {
    let testProject: any;

    beforeEach(async () => {
      testProject = await prisma.project.create({
        data: {
          name: 'Original Name',
          ownerId: testUser.id,
        },
      });
    });

    it('should update project', async () => {
      const response = await request(app)
        .patch(`/api/projects/${testProject.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Name',
          description: 'Updated description',
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Name');
      expect(response.body.description).toBe('Updated description');
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app)
        .patch('/api/projects/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Should Fail',
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/projects/:id', () => {
    let testProject: any;

    beforeEach(async () => {
      testProject = await prisma.project.create({
        data: {
          name: 'Project to Delete',
          ownerId: testUser.id,
        },
      });
    });

    it('should delete project', async () => {
      const response = await request(app)
        .delete(`/api/projects/${testProject.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);

      const deleted = await prisma.project.findUnique({
        where: { id: testProject.id },
      });
      expect(deleted).toBeNull();
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app)
        .delete('/api/projects/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });
});
