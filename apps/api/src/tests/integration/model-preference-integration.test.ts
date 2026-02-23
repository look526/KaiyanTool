import request from 'supertest';
import express, { Express } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../jest.setup';
import modelPreferenceRoutes from '../../routes/model-preference.routes';

describe('Model Preference Integration Tests', () => {
  let app: Express;
  let user: any;
  let token: string;
  let aiProvider: any;
  let aiModels: any[];

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
        email: 'integration-test@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
        name: 'Integration Test User',
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

    aiModels = await Promise.all([
      prisma.aIProviderModel.create({
        data: {
          providerId: aiProvider.id,
          name: 'gpt-4',
          type: 'text',
          capabilities: ['text-generation'],
        },
      }),
      prisma.aIProviderModel.create({
        data: {
          providerId: aiProvider.id,
          name: 'dall-e-3',
          type: 'image',
          capabilities: ['image-generation'],
        },
      }),
      prisma.aIProviderModel.create({
        data: {
          providerId: aiProvider.id,
          name: 'gpt-3.5-turbo',
          type: 'text',
          capabilities: ['text-generation'],
        },
      }),
    ]);
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

  describe('Complete Workflow: Configure and Use Model Preferences', () => {
    it('should handle full workflow: create preferences, set defaults, record usage, and retrieve analytics', async () => {
      const defaultModels = {
        text: aiModels[0].id,
        image: aiModels[1].id,
      };

      const response = await request(app)
        .post('/api/model-preferences/default')
        .set('Authorization', `Bearer ${token}`)
        .send({ defaultModels });

      expect(response.status).toBe(200);
      expect(response.body.defaultModels).toEqual(defaultModels);

      const preferences = await prisma.userPreferences.findUnique({
        where: { userId: user.id },
      });
      expect(preferences?.defaultModels).toEqual(defaultModels);

      const history = await prisma.configurationHistory.findMany({
        where: { userId: user.id, changeType: 'default_models' },
      });
      expect(history.length).toBe(1);
      expect(history[0].previousValue).toEqual({});
      expect(history[0].newValue).toEqual(defaultModels);

      await request(app)
        .post('/api/model-preferences/usage')
        .set('Authorization', `Bearer ${token}`)
        .send({
          modelId: aiModels[0].id,
          contentType: 'text',
          success: true,
          duration: 1500,
        });

      const updatedPreferences = await prisma.userPreferences.findUnique({
        where: { userId: user.id },
      });
      expect(updatedPreferences?.lastUsedModels).toEqual({ text: aiModels[0].id });

      const analyticsResponse = await request(app)
        .get('/api/model-preferences/analytics')
        .set('Authorization', `Bearer ${token}`);

      expect(analyticsResponse.status).toBe(200);
      expect(analyticsResponse.body.summary).toBeDefined();
      expect(analyticsResponse.body.summary.totalModels).toBe(3);
      expect(analyticsResponse.body.summary.configuredDefaults).toBe(2);
      expect(analyticsResponse.body.summary.activeUsage).toBe(1);
      expect(analyticsResponse.body.summary.totalChanges).toBe(2);
    });
  });

  describe('Model Parameters Workflow', () => {
    it('should handle parameters workflow: set parameters, update, and retrieve', async () => {
      const initialParams = { temperature: 0.7, maxTokens: 1000 };

      const createResponse = await request(app)
        .post('/api/model-preferences/parameters')
        .set('Authorization', `Bearer ${token}`)
        .send({
          contentType: 'text',
          parameters: initialParams,
        });

      expect(createResponse.status).toBe(200);
      expect(createResponse.body.parameters).toEqual(initialParams);

      const getResponse = await request(app)
        .get('/api/model-preferences/parameters/text')
        .set('Authorization', `Bearer ${token}`);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.parameters).toEqual(initialParams);

      const updatedParams = { temperature: 0.9, maxTokens: 2000 };

      const updateResponse = await request(app)
        .post('/api/model-preferences/parameters')
        .set('Authorization', `Bearer ${token}`)
        .send({
          contentType: 'text',
          parameters: updatedParams,
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.parameters).toEqual(updatedParams);

      const paramHistory = await prisma.configurationHistory.findMany({
        where: { userId: user.id, changeType: 'model_parameters' },
      });
      expect(paramHistory.length).toBe(2);
      expect(paramHistory[0].previousValue).toEqual({});
      expect(paramHistory[0].newValue).toEqual(initialParams);
      expect(paramHistory[1].previousValue).toEqual(initialParams);
      expect(paramHistory[1].newValue).toEqual(updatedParams);
    });
  });

  describe('Multiple Content Types Workflow', () => {
    it('should handle different content types independently', async () => {
      const textParams = { temperature: 0.7, topP: 0.9 };
      const imageParams = { size: '1024x1024', quality: 'standard' };

      await request(app)
        .post('/api/model-preferences/parameters')
        .set('Authorization', `Bearer ${token}`)
        .send({
          contentType: 'text',
          parameters: textParams,
        });

      await request(app)
        .post('/api/model-preferences/parameters')
        .set('Authorization', `Bearer ${token}`)
        .send({
          contentType: 'image',
          parameters: imageParams,
        });

      const textParamsResponse = await request(app)
        .get('/api/model-preferences/parameters/text')
        .set('Authorization', `Bearer ${token}`);

      expect(textParamsResponse.body.parameters).toEqual(textParams);

      const imageParamsResponse = await request(app)
        .get('/api/model-preferences/parameters/image')
        .set('Authorization', `Bearer ${token}`);

      expect(imageParamsResponse.body.parameters).toEqual(imageParams);

      const allParams = await prisma.modelParameters.findMany({
        where: { userId: user.id },
      });
      expect(allParams.length).toBe(2);
      expect(allParams.some(p => p.contentType === 'text')).toBe(true);
      expect(allParams.some(p => p.contentType === 'image')).toBe(true);
    });
  });

  describe('Model Testing Workflow', () => {
    it('should test multiple models and handle success/failure', async () => {
      const testResponse1 = await request(app)
        .post('/api/model-preferences/test')
        .set('Authorization', `Bearer ${token}`)
        .send({
          modelId: aiModels[0].id,
        });

      expect(testResponse1.status).toBe(200);
      expect(testResponse1.body.success).toBe(true);
      expect(testResponse1.body.model.id).toBe(aiModels[0].id);

      const testResponse2 = await request(app)
        .post('/api/model-preferences/test')
        .set('Authorization', `Bearer ${token}`)
        .send({
          modelId: aiModels[1].id,
        });

      expect(testResponse2.status).toBe(200);
      expect(testResponse2.body.success).toBe(true);
      expect(testResponse2.body.model.id).toBe(aiModels[1].id);

      const testResponse3 = await request(app)
        .post('/api/model-preferences/test')
        .set('Authorization', `Bearer ${token}`)
        .send({
          modelId: 'non-existent-model-id',
        });

      expect(testResponse3.status).toBe(404);
      expect(testResponse3.body.error).toBe('Model not found');
    });
  });

  describe('History and Analytics Integration', () => {
    it('should maintain consistent history across operations', async () => {
      const operations = [
        {
          type: 'default',
          data: { defaultModels: { text: aiModels[0].id } },
        },
        {
          type: 'parameters',
          data: { contentType: 'text', parameters: { temperature: 0.7 } },
        },
        {
          type: 'default',
          data: { defaultModels: { text: aiModels[2].id } },
        },
        {
          type: 'parameters',
          data: { contentType: 'text', parameters: { temperature: 0.8 } },
        },
      ];

      for (const op of operations) {
        if (op.type === 'default') {
          await request(app)
            .post('/api/model-preferences/default')
            .set('Authorization', `Bearer ${token}`)
            .send(op.data);
        } else {
          await request(app)
            .post('/api/model-preferences/parameters')
            .set('Authorization', `Bearer ${token}`)
            .send(op.data);
        }
      }

      const historyResponse = await request(app)
        .get('/api/model-preferences/history')
        .set('Authorization', `Bearer ${token}`);

      expect(historyResponse.status).toBe(200);
      expect(historyResponse.body.history.length).toBe(4);

      const analyticsResponse = await request(app)
        .get('/api/model-preferences/analytics')
        .set('Authorization', `Bearer ${token}`);

      expect(analyticsResponse.status).toBe(200);
      expect(analyticsResponse.body.history.summary['default_models']).toBe(2);
      expect(analyticsResponse.body.history.summary['model_parameters']).toBe(2);
      expect(analyticsResponse.body.summary.totalChanges).toBe(4);
    });
  });

  describe('Error Handling and Validation', () => {
    it('should handle concurrent operations gracefully', async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        request(app)
          .post('/api/model-preferences/usage')
          .set('Authorization', `Bearer ${token}`)
          .send({
            modelId: aiModels[i % aiModels.length].id,
            contentType: i % 2 === 0 ? 'text' : 'image',
            success: true,
          })
      );

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      const preferences = await prisma.userPreferences.findUnique({
        where: { userId: user.id },
      });
      expect(preferences).toBeDefined();
    });

    it('should validate content types correctly', async () => {
      const invalidResponse = await request(app)
        .post('/api/model-preferences/default')
        .set('Authorization', `Bearer ${token}`)
        .send({
          defaultModels: { invalidType: aiModels[0].id },
        });

      expect(invalidResponse.status).toBe(400);

      const validResponse = await request(app)
        .post('/api/model-preferences/default')
        .set('Authorization', `Bearer ${token}`)
        .send({
          defaultModels: { text: aiModels[0].id },
        });

      expect(validResponse.status).toBe(200);
    });

    it('should handle unauthorized access correctly', async () => {
      const response = await request(app)
        .get('/api/model-preferences')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });
});
