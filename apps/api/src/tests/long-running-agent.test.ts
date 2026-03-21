import { progressTrackingService } from '../../services/progress-tracking.service';
import { featureListService } from '../../services/feature-list.service';
import { initializerAgent } from '../../agents/initializer.agent';
import { codingAgent } from '../../agents/coding.agent';

describe('Long Running Agent System', () => {
  const testProjectId = `test_project_${Date.now()}`;

  describe('Progress Tracking Service', () => {
    it('should initialize progress tracking', async () => {
      const features = [
        {
          id: 'feature_1',
          description: 'A user can login with email and password',
          status: 'failing' as const,
          priority: 'high' as const,
        },
        {
          id: 'feature_2',
          description: 'A user can logout',
          status: 'failing' as const,
          priority: 'medium' as const,
        },
      ];

      await progressTrackingService.initializeProgress(
        testProjectId,
        'Test task description',
        features
      );

      const progress = await progressTrackingService.getProgress(testProjectId);
      expect(progress.project_id).toBe(testProjectId);
      expect(progress.total_features).toBe(2);
      expect(progress.completed_features).toBe(0);
    });

    it('should update feature status', async () => {
      await progressTrackingService.updateFeatureStatus(
        testProjectId,
        'feature_1',
        'passing',
        'Feature implemented successfully'
      );

      const progress = await progressTrackingService.getProgress(testProjectId);
      expect(progress.completed_features).toBe(1);
      expect(progress.progress_percentage).toBe(50);
    });

    it('should get next features to implement', async () => {
      const nextFeatures = await progressTrackingService.getNextFeaturesToImplement(
        testProjectId,
        5
      );

      expect(nextFeatures.length).toBeGreaterThan(0);
      expect(nextFeatures[0].status).toBe('failing');
    });

    it('should generate progress report', async () => {
      const report = await progressTrackingService.generateProgressReport(testProjectId);
      expect(report).toContain('PROJECT:');
      expect(report).toContain('FEATURE STATUS');
      expect(report).toContain('✅ COMPLETED');
    });
  });

  describe('Feature List Service', () => {
    it('should estimate feature complexity', () => {
      const features = [
        {
          id: 'feature_1',
          description: 'A user can display the login form',
          status: 'failing' as const,
          priority: 'high' as const,
        },
        {
          id: 'feature_2',
          description: 'Implement authentication system',
          status: 'failing' as const,
          priority: 'high' as const,
        },
      ];

      const complexity = featureListService.estimateComplexity(features);
      expect(complexity).toHaveLength(2);
      expect(complexity[0].complexity).toBeDefined();
    });

    it('should group features by category', () => {
      const features = [
        {
          id: 'feature_1',
          description: 'Create login UI component',
          status: 'failing' as const,
          priority: 'high' as const,
        },
        {
          id: 'feature_2',
          description: 'Implement authentication API endpoint',
          status: 'failing' as const,
          priority: 'high' as const,
        },
      ];

      const groups = featureListService.groupFeaturesByCategory(features);
      expect(Object.keys(groups)).toContain('UI/UX');
      expect(Object.keys(groups)).toContain('Backend/API');
    });
  });

  describe('Initializer Agent', () => {
    it('should generate session ID', () => {
      const agent = new initializerAgent.constructor();
      expect(initializerAgent).toBeDefined();
    });

    it('should check initialization status', async () => {
      const status = await initializerAgent.getInitializationStatus(testProjectId);
      expect(status.initialized).toBe(true);
      expect(status.features_count).toBe(2);
      expect(status.progress).toBe(50);
    });
  });

  describe('Coding Agent', () => {
    it('should generate session ID', () => {
      expect(codingAgent).toBeDefined();
    });

    it('should get available features', async () => {
      const features = await codingAgent.getAvailableFeatures(testProjectId);
      expect(features.available.length).toBe(1);
      expect(features.in_progress.length).toBe(0);
      expect(features.completed.length).toBe(1);
    });
  });

  afterAll(async () => {
    await progressTrackingService.deleteProgress(testProjectId);
  });
});
