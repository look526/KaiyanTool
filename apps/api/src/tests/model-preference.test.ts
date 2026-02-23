import request from 'supertest';
import express, { Express } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../jest.setup';
import modelPreferenceRoutes from '../routes/model-preference.routes';
import { authenticate } from '../middleware/auth.middleware';

describe('Model Preference Controller', () => {
  let app: Express;
  let user: any;
  let token: string;
  let aiProvider: any;
  let aiModel: any;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    app.use((req, res, next) => {
      const authHeader = req.headers.authorization;
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
          req.userId = decoded.userId;
        } catch (error) {
          return res.status(401).json({ error: 'Unauthorized' });
        }
      }
      next();
    });
    app.use('/api/model-preferences', modelPreferenceRoutes);
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
    await prisma.userPreferences.deleteMany();
    await prisma.modelParameters.deleteMany();
    await prisma.configurationHistory.deleteMany();
    await prisma.aIProvider.deleteMany();
    await prisma.aIProviderModel.deleteMany();

    user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
        name: 'Test User',
      },
    });

    token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '7d',
    });

    aiProvider = await prisma.aIProvider.create({
      data: {
        userId: user.id,
        type: 'openai',
        apiKey: 'test-api-key',
      },
    });

    aiModel = await prisma.aIProviderModel.create({
      data: {
        providerId: aiProvider.id,
        name: 'gpt-4',
        type: 'text',
        capabilities: ['text-generation', 'code'],
      },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.userPreferences.deleteMany();
    await prisma.modelParameters.deleteMany();
    await prisma.configurationHistory.deleteMany();
    await prisma.aIProvider.deleteMany();
    await prisma.aIProviderModel.deleteMany();
    await prisma.$disconnect();
  });

  describe('GET /api/model-preferences', () => {
    it('should return empty preferences for new user', async () => {
      const response = await request(app)
        .get('/api/model-preferences')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.defaultModels).toEqual({});
      expect(response.body.lastUsedModels).toEqual({});
      expect(response.body.modelParameters).toEqual({});
    });

    it('should return existing preferences', async () => {
      await prisma.userPreferences.create({
        data: {
          userId: user.id,
          defaultModels: { text: 'model-1' },
          lastUsedModels: { text: 'model-1' },
          modelParameters: { temperature: 0.7 },
        },
      });

      const response = await request(app)
        .get('/api/model-preferences')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.defaultModels).toEqual({ text: 'model-1' });
    });

    it('should return 401 without token', async () => {
      const response = await request(app).get('/api/model-preferences');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/model-preferences/default', () => {
    it('should set default models successfully', async () => {
      const response = await request(app)
        .post('/api/model-preferences/default')
        .set('Authorization', `Bearer ${token}`)
        .send({
          defaultModels: { text: 'model-1', image: 'model-2' },
        });

      expect(response.status).toBe(200);
      expect(response.body.defaultModels).toEqual({ text: 'model-1', image: 'model-2' });

      const preferences = await prisma.userPreferences.findUnique({
        where: { userId: user.id },
      });
      expect(preferences?.defaultModels).toEqual({ text: 'model-1', image: 'model-2' });
    });

    it('should create history entry when setting defaults', async () => {
      const response = await request(app)
        .post('/api/model-preferences/default')
        .set('Authorization', `Bearer ${token}`)
        .send({
          defaultModels: { text: 'model-1' },
        });

      expect(response.status).toBe(200);

      const history = await prisma.configurationHistory.findMany({
        where: { userId: user.id },
      });
      expect(history.length).toBe(1);
      expect(history[0].changeType).toBe('default_models');
    });

    it('should return 400 for invalid content type', async () => {
      const response = await request(app)
        .post('/api/model-preferences/default')
        .set('Authorization', `Bearer ${token}`)
        .send({
          defaultModels: { invalidType: 'model-1' },
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/model-preferences/usage', () => {
    it('should record model usage successfully', async () => {
      const response = await request(app)
        .post('/api/model-preferences/usage')
        .set('Authorization', `Bearer ${token}`)
        .send({
          modelId: aiModel.id,
          contentType: 'text',
          success: true,
        });

      expect(response.status).toBe(200);
      expect(response.body.lastUsedModels).toEqual({ text: aiModel.id });
    });

    it('should update existing last used models', async () => {
      await prisma.userPreferences.create({
        data: {
          userId: user.id,
          lastUsedModels: { image: 'other-model' },
        },
      });

      const response = await request(app)
        .post('/api/model-preferences/usage')
        .set('Authorization', `Bearer ${token}`)
        .send({
          modelId: aiModel.id,
          contentType: 'text',
        });

      expect(response.status).toBe(200);
      expect(response.body.lastUsedModels.text).toBe(aiModel.id);
      expect(response.body.lastUsedModels.image).toBe('other-model');
    });
  });

  describe('GET /api/model-preferences/parameters/:contentType', () => {
    it('should return parameters for content type', async () => {
      await prisma.modelParameters.create({
        data: {
          userId: user.id,
          contentType: 'text',
          parameters: { temperature: 0.7, maxTokens: 1000 },
        },
      });

      const response = await request(app)
        .get('/api/model-preferences/parameters/text')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.parameters).toEqual({ temperature: 0.7, maxTokens: 1000 });
    });

    it('should return empty parameters if not found', async () => {
      const response = await request(app)
        .get('/api/model-preferences/parameters/text')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.parameters).toEqual({});
    });
  });

  describe('POST /api/model-preferences/parameters', () => {
    it('should set model parameters successfully', async () => {
      const response = await request(app)
        .post('/api/model-preferences/parameters')
        .set('Authorization', `Bearer ${token}`)
        .send({
          contentType: 'text',
          parameters: { temperature: 0.8, maxTokens: 2000 },
        });

      expect(response.status).toBe(200);
      expect(response.body.parameters).toEqual({ temperature: 0.8, maxTokens: 2000 });
    });

    it('should create history entry when setting parameters', async () => {
      const response = await request(app)
        .post('/api/model-preferences/parameters')
        .set('Authorization', `Bearer ${token}`)
        .send({
          contentType: 'text',
          parameters: { temperature: 0.7 },
        });

      expect(response.status).toBe(200);

      const history = await prisma.configurationHistory.findMany({
        where: { userId: user.id },
      });
      expect(history.length).toBeGreaterThan(0);
      const paramHistory = history.find(h => h.changeType === 'model_parameters');
      expect(paramHistory).toBeDefined();
    });
  });

  describe('POST /api/model-preferences/test', () => {
    it('should test model successfully', async () => {
      const response = await request(app)
        .post('/api/model-preferences/test')
        .set('Authorization', `Bearer ${token}`)
        .send({
          modelId: aiModel.id,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.model.id).toBe(aiModel.id);
    });

    it('should return 404 for non-existent model', async () => {
      const response = await request(app)
        .post('/api/model-preferences/test')
        .set('Authorization', `Bearer ${token}`)
        .send({
          modelId: '00000000-0000-0000-0000-000000000000',
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Model not found');
    });
  });

  describe('GET /api/model-preferences/stats', () => {
    it('should return usage statistics', async () => {
      const response = await request(app)
        .get('/api/model-preferences/stats')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.modelCount).toBeDefined();
      expect(response.body.defaultModels).toBeDefined();
      expect(response.body.lastUsedModels).toBeDefined();
      expect(response.body.modelsByType).toBeDefined();
    });
  });

  describe('GET /api/model-preferences/history', () => {
    beforeEach(async () => {
      await prisma.configurationHistory.createMany({
        data: [
          {
            userId: user.id,
            changeType: 'default_models',
            changeDetails: { contentType: 'all' },
            previousValue: {},
            newValue: { text: 'model-1' },
          },
          {
            userId: user.id,
            changeType: 'model_parameters',
            changeDetails: { contentType: 'text' },
            previousValue: { temperature: 0.7 },
            newValue: { temperature: 0.8 },
          },
        ],
      });
    });

    it('should return configuration history', async () => {
      const response = await request(app)
        .get('/api/model-preferences/history')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.history).toBeDefined();
      expect(response.body.history.length).toBe(2);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/model-preferences/history?limit=1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.history.length).toBe(1);
    });
  });

  describe('GET /api/model-preferences/analytics', () => {
    it('should return detailed analytics', async () => {
      const response = await request(app)
        .get('/api/model-preferences/analytics')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.summary).toBeDefined();
      expect(response.body.byType).toBeDefined();
      expect(response.body.models).toBeDefined();
      expect(response.body.history).toBeDefined();
    });

    it('should include summary statistics', async () => {
      const response = await request(app)
        .get('/api/model-preferences/analytics')
        .set('Authorization', `Bearer ${token}`);

      expect(response.body.summary).toHaveProperty('totalModels');
      expect(response.body.summary).toHaveProperty('configuredDefaults');
      expect(response.body.summary).toHaveProperty('activeUsage');
      expect(response.body.summary).toHaveProperty('totalChanges');
    });

    it('should include model type distribution', async () => {
      const response = await request(app)
        .get('/api/model-preferences/analytics')
        .set('Authorization', `Bearer ${token}`);

      expect(response.body.byType).toHaveProperty('distribution');
      expect(response.body.byType).toHaveProperty('usage');
      expect(Object.keys(response.body.byType.distribution).length).toBeGreaterThan(0);
    });

    it('should include top used models', async () => {
      await prisma.userPreferences.create({
        data: {
          userId: user.id,
          lastUsedModels: { text: aiModel.id },
        },
      });

      const response = await request(app)
        .get('/api/model-preferences/analytics')
        .set('Authorization', `Bearer ${token}`);

      expect(response.body.models).toHaveProperty('topUsed');
      expect(response.body.models).toHaveProperty('details');
      expect(Array.isArray(response.body.models.topUsed)).toBe(true);
    });

    it('should include recent activity', async () => {
      await prisma.configurationHistory.createMany({
        data: [
          {
            userId: user.id,
            changeType: 'default_models',
            changeDetails: {},
            newValue: { text: 'model-1' },
          },
        ],
      });

      const response = await request(app)
        .get('/api/model-preferences/analytics')
        .set('Authorization', `Bearer ${token}`);

      expect(response.body.history).toHaveProperty('summary');
      expect(response.body.history).toHaveProperty('recent');
      expect(Array.isArray(response.body.history.recent)).toBe(true);
    });
  });
});
