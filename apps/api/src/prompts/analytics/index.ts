import { prisma } from '../../lib/prisma';
import { promptRegistry } from '../registry';
import logger from '../../lib/logger';

export interface PromptAnalyticsData {
  prompt_id: string;
  name: string;
  usage_count: number;
  success_rate: number;
  average_score: number;
  last_used_at: Date | null;
  versions_count: number;
  test_runs_count: number;
  ab_tests_count: number;
}

export interface PromptPerformanceMetrics {
  prompt_id: string;
  time_range: {
    start: Date;
    end: Date;
  };
  usage: {
    total: number;
    by_day: Array<{ date: string; count: number }>;
  };
  performance: {
    average_score: number;
    success_rate: number;
    score_trend: Array<{ date: string; score: number }>;
  };
  errors: {
    total: number;
    by_type: Array<{ type: string; count: number }>;
  };
}

export class PromptAnalytics {
  async getPromptAnalytics(prompt_id: string): Promise<PromptAnalyticsData> {
    const prompt = promptRegistry.get(prompt_id);
    if (!prompt) {
      throw new Error(`Prompt ${prompt_id} not found`);
    }

    const [
      usageData,
      versions
    ] = await Promise.all([
      this.getPromptUsage(prompt_id),
      prisma.projectVersion.findMany(),
    ]);

    const success_rate = usageData.total > 0
      ? (usageData.successful / usageData.total) * 100
      : 0;

    const average_score = usageData.total > 0
      ? usageData.totalScore / usageData.total
      : 0;

    return {
      prompt_id,
      name: prompt.name,
      usage_count: usageData.total,
      success_rate,
      average_score,
      last_used_at: usageData.lastUsedAt,
      versions_count: versions.length,
      test_runs_count: 0,
      ab_tests_count: 0
    };
  }

  async getAllPromptsAnalytics(): Promise<PromptAnalyticsData[]> {
    const prompts = promptRegistry.getAll();
    const analytics = await Promise.all(
      prompts.map(p => this.getPromptAnalytics(p.id))
    );

    return analytics.sort((a, b) => b.usage_count - a.usage_count);
  }

  async getPromptPerformanceMetrics(
    prompt_id: string,
    time_range: { start: Date; end: Date }
  ): Promise<PromptPerformanceMetrics> {
    const prompt = promptRegistry.get(prompt_id);
    if (!prompt) {
      throw new Error(`Prompt ${prompt_id} not found`);
    }

    const usageByDay = await this.getUsageByDay(prompt_id, time_range);
    const scoreTrend = await this.getScoreTrend(prompt_id, time_range);
    const errorsByType = await this.getErrorsByType(prompt_id, time_range);

    const totalUsage = usageByDay.reduce((sum, day) => sum + day.count, 0);
    const totalErrors = errorsByType.reduce((sum, error) => sum + error.count, 0);

    let average_score = 0;
    let successful_tests = 0;

    const success_rate = 0;

    return {
      prompt_id,
      time_range,
      usage: {
        total: totalUsage,
        by_day: usageByDay
      },
      performance: {
        average_score,
        success_rate,
        score_trend: scoreTrend
      },
      errors: {
        total: totalErrors,
        by_type: errorsByType
      }
    };
  }

  async trackPromptUsage(
    prompt_id: string,
    success: boolean,
    score?: number
  ): Promise<void> {
    try {
      // Prompt usage tracking disabled - table not in schema
      logger.debug('Prompt usage tracked (disabled)', { prompt_id, success, score });
    } catch (error) {
      logger.error('Failed to track prompt usage', { prompt_id, error });
    }
  }

  async getTopUsedPrompts(limit: number = 10): Promise<PromptAnalyticsData[]> {
    const allAnalytics = await this.getAllPromptsAnalytics();
    return allAnalytics.slice(0, limit);
  }

  async getLowPerformingPrompts(threshold: number = 50): Promise<PromptAnalyticsData[]> {
    const allAnalytics = await this.getAllPromptsAnalytics();
    return allAnalytics.filter(a => a.success_rate < threshold);
  }

  private async getPromptUsage(prompt_id: string) {
    // Prompt usage tracking disabled - table not in schema
    return {
      total: 0,
      successful: 0,
      totalScore: 0,
      lastUsedAt: null
    };
  }

  private async getUsageByDay(
    prompt_id: string,
    time_range: { start: Date; end: Date }
  ): Promise<Array<{ date: string; count: number }>> {
    // Prompt usage tracking disabled - table not in schema
    return [];
  }

  private async getScoreTrend(
    prompt_id: string,
    time_range: { start: Date; end: Date }
  ): Promise<Array<{ date: string; score: number }>> {
    // Prompt test runs disabled - table not in schema
    return [];
  }

  private async getErrorsByType(
    prompt_id: string,
    time_range: { start: Date; end: Date }
  ): Promise<Array<{ type: string; count: number }>> {
    // Prompt test runs disabled - table not in schema
    return [];
  }

  async generatePromptReport(prompt_id: string): Promise<{
    analytics: PromptAnalyticsData;
    performance: PromptPerformanceMetrics;
    recommendations: string[];
  }> {
    const [analytics, performance] = await Promise.all([
      this.getPromptAnalytics(prompt_id),
      this.getPromptPerformanceMetrics(prompt_id, {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date()
      })
    ]);

    const recommendations = this.generateRecommendations(analytics, performance);

    return {
      analytics,
      performance,
      recommendations
    };
  }

  private generateRecommendations(
    analytics: PromptAnalyticsData,
    performance: PromptPerformanceMetrics
  ): string[] {
    const recommendations: string[] = [];

    if (analytics.success_rate < 70) {
      recommendations.push('Success rate is below 70%. Consider reviewing and improving the prompt template.');
    }

    if (analytics.average_score < 0.6) {
      recommendations.push('Average score is below 0.6. Consider A/B testing different prompt variations.');
    }

    if (analytics.versions_count === 0) {
      recommendations.push('No versions tracked. Enable version control to track prompt changes.');
    }

    if (analytics.test_runs_count === 0) {
      recommendations.push('No test runs recorded. Implement automated testing to ensure prompt quality.');
    }

    if (analytics.ab_tests_count === 0) {
      recommendations.push('No A/B tests conducted. Consider running A/B tests to optimize prompt performance.');
    }

    if (performance.errors.total > performance.usage.total * 0.1) {
      recommendations.push('Error rate exceeds 10%. Review error types and address common issues.');
    }

    const score_trend = performance.performance.score_trend;
    if (score_trend.length >= 2) {
      const recentScores = score_trend.slice(-3);
      const trend = recentScores[recentScores.length - 1].score - recentScores[0].score;

      if (trend < -0.1) {
        recommendations.push('Performance trend is declining. Review recent changes and consider rolling back.');
      } else if (trend > 0.1) {
        recommendations.push('Performance trend is improving. Continue current optimization approach.');
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('Prompt performance is good. Continue monitoring and periodic testing.');
    }

    return recommendations;
  }
}

export const promptAnalytics = new PromptAnalytics();