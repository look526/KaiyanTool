import { AIProviderHelper } from '../../services/ai/provider-helper.service';
import { prisma } from '../../lib/prisma';
import { providerManager } from '../../services/ai/provider.manager';

jest.mock('../../lib/prisma', () => ({
  prisma: {
    aIProvider: {
      findMany: jest.fn(),
    },
    aIProviderModel: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('../../services/ai/provider.manager', () => ({
  providerManager: {
    getProvider: jest.fn(),
    addProvider: jest.fn(),
  },
}));

describe('AIProviderHelper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProvider', () => {
    it('should return provider when providers exist', async () => {
      const mockProvider = {
        id: 'provider-1',
        name: 'Test Provider',
        type: 'zhipu',
        apiKey: 'test-key',
        baseUrl: 'https://api.test.com',
        AIProviderModel: [],
      };

      (prisma.aIProvider.findMany as jest.Mock).mockResolvedValue([mockProvider]);
      (providerManager.getProvider as jest.Mock).mockReturnValue({
        chat: jest.fn(),
        createImage: jest.fn(),
      });

      const result = await AIProviderHelper.getProvider('user-1');

      expect(result.providerId).toBe('provider-1');
      expect(result.providerType).toBe('zhipu');
      expect(result.aiProvider).toBeDefined();
    });

    it('should throw error when no providers available', async () => {
      (prisma.aIProvider.findMany as jest.Mock).mockResolvedValue([]);

      await expect(AIProviderHelper.getProvider('user-1')).rejects.toThrow(
        'No AI provider available'
      );
    });

    it('should find model by id when modelId is provided', async () => {
      const mockProvider = {
        id: 'provider-1',
        name: 'Test Provider',
        type: 'zhipu',
        apiKey: 'test-key',
        baseUrl: 'https://api.test.com',
        AIProviderModel: [{ id: 'model-1', name: 'gpt-4' }],
      };

      (prisma.aIProvider.findMany as jest.Mock).mockResolvedValue([mockProvider]);
      (providerManager.getProvider as jest.Mock).mockReturnValue({
        chat: jest.fn(),
      });

      const result = await AIProviderHelper.getProvider('user-1', 'model-1');

      expect(result.modelName).toBe('gpt-4');
    });

    it('should find model by name when modelId is model name', async () => {
      const mockProvider = {
        id: 'provider-1',
        name: 'Test Provider',
        type: 'zhipu',
        apiKey: 'test-key',
        AIProviderModel: [{ id: 'model-1', name: 'glm-4' }],
      };

      (prisma.aIProvider.findMany as jest.Mock).mockResolvedValue([mockProvider]);
      (providerManager.getProvider as jest.Mock).mockReturnValue({
        chat: jest.fn(),
      });

      const result = await AIProviderHelper.getProvider('user-1', 'glm-4');

      expect(result.modelName).toBe('glm-4');
    });
  });

  describe('getProviderForUser', () => {
    it('should use admin-managed enabled providers', async () => {
      const mockProvider = {
        id: 'provider-1',
        userId: 'user-1',
        type: 'zhipu',
        apiKey: 'test-key',
        AIProviderModel: [],
      };

      (prisma.aIProvider.findMany as jest.Mock).mockResolvedValue([mockProvider]);
      (providerManager.getProvider as jest.Mock).mockReturnValue({
        chat: jest.fn(),
      });

      const result = await AIProviderHelper.getProviderForUser('user-1');

      expect(prisma.aIProvider.findMany).toHaveBeenCalledWith({
        where: {
          enabled: true,
          User: {
            role: { in: ['admin', 'super_admin'] },
          },
        },
        include: { AIProviderModel: true },
      });
      expect(result.providerId).toBe('provider-1');
    });
  });

  describe('resolveModelName', () => {
    it('should return modelId if it looks like a model name', async () => {
      const result = await AIProviderHelper.resolveModelName('gpt-4');
      expect(result).toBe('gpt-4');
    });

    it('should lookup model if modelId looks like UUID', async () => {
      const uuidModelId = '12345678-1234-1234-1234-123456789012';
      
      (prisma.aIProviderModel.findUnique as jest.Mock).mockResolvedValue({
        name: 'gpt-4-turbo',
      });

      const result = await AIProviderHelper.resolveModelName(uuidModelId);

      expect(result).toBe('gpt-4-turbo');
    });
  });
});
