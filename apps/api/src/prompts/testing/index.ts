import { prisma } from '../../lib/prisma';
import { TestCase, EvaluationMetric, TestResult } from './ab-test';
import { promptRegistry } from '../registry';
import { providerManager } from '../../services/ai/provider.manager';
import logger from '../../lib/logger';

export class PromptTester {
  async testPrompt(
    promptId: string,
    testCases: TestCase[],
    metrics: EvaluationMetric[],
    modelId?: string
  ): Promise<{
    results: TestResult[];
    summary: {
      total: number;
      passed: number;
      failed: number;
      averageScores: Record<string, number>;
    };
  }> {
    const results: TestResult[] = [];

    for (const testCase of testCases) {
      const result = await this.executeTest(promptId, testCase, metrics, modelId);
      results.push(result);
    }

    const summary = this.aggregateResults(results);

    return { results, summary };
  }

  private async executeTest(
    promptId: string,
    testCase: TestCase,
    metrics: EvaluationMetric[],
    modelId?: string
  ): Promise<TestResult> {
    try {
      const prompt = promptRegistry.get(promptId);
      if (!prompt) {
        throw new Error(`Prompt ${promptId} not found`);
      }

      const renderedPrompt = promptRegistry.render(promptId, testCase.input);

      const provider = providerManager.getProvider(modelId || 'openai');
      if (!provider) {
        throw new Error(`Provider not found: ${modelId || 'openai'}`);
      }

      const response = await provider.chat(
        [{ role: 'user', content: renderedPrompt }],
        undefined
      );

      const scores: Record<string, number> = {};

      for (const metric of metrics) {
        try {
          const content = response.content || '';
          const score = metric.evaluate(content, testCase.expectedOutput);
          scores[metric.name] = score;
        } catch (error) {
          logger.error(`Metric ${metric.name} evaluation failed`, { error });
          scores[metric.name] = 0;
        }
      }

      const scoreValues = Object.values(scores);
      const averageScore = scoreValues.length > 0 ? scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length : 0;
      const passed = averageScore >= 0.7;

      return {
        testCaseId: testCase.id,
        passed,
        response: response.content,
        scores,
        errors: passed ? undefined : ['Test failed due to low scores']
      };
    } catch (error) {
      logger.error('Test execution failed', { promptId, testCaseId: testCase.id, error });
      return {
        testCaseId: testCase.id,
        passed: false,
        response: '',
        scores: {},
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  private aggregateResults(results: TestResult[]): {
    total: number;
    passed: number;
    failed: number;
    averageScores: Record<string, number>;
  } {
    const total = results.length;
    const passed = results.filter(r => r.passed).length;
    const failed = total - passed;

    const allScores: Record<string, number[]> = {};

    for (const result of results) {
      for (const [metric, score] of Object.entries(result.scores)) {
        if (!allScores[metric]) {
          allScores[metric] = [];
        }
        allScores[metric].push(score);
      }
    }

    const averageScores: Record<string, number> = {};
    for (const [metric, scores] of Object.entries(allScores)) {
      if (scores.length > 0) {
        const sum = scores.reduce((a, b) => a + b, 0);
        averageScores[metric] = sum / scores.length;
      } else {
        averageScores[metric] = 0;
      }
    }

    return { total, passed, failed, averageScores };
  }

  async saveTestRun(
    promptId: string,
    results: TestResult[],
    testCases: TestCase[]
  ): Promise<string> {
    const testRun = await (prisma as any).promptTestRun.create({
      data: {
        prompt_id: promptId,
        results: results as any,
        test_cases: testCases as any,
        summary: this.aggregateResults(results) as any
      }
    });

    return testRun.id;
  }

  async getTestRun(testRunId: string) {
    return await (prisma as any).promptTestRun.findUnique({
      where: { id: testRunId }
    });
  }

  async getPromptTestHistory(promptId: string) {
    return await (prisma as any).promptTestRun.findMany({
      where: { prompt_id: promptId },
      orderBy: { created_at: 'desc' },
      take: 50
    });
  }
}

export const promptTester = new PromptTester();