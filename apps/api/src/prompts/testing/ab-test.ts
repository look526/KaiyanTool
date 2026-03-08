import { prisma } from '../../lib/prisma';
import { promptRegistry } from '../registry';
import { providerManager } from '../../services/ai/provider.manager';
import logger from '../../lib/logger';

export interface TestCase {
  id: string;
  input: Record<string, any>;
  expectedOutput: any;
}

export interface EvaluationMetric {
  name: string;
  evaluate: (actual: string, expected: any) => number;
}

export interface TestResult {
  testCaseId: string;
  passed: boolean;
  response: string;
  scores: Record<string, number>;
  errors?: string[];
}

export interface ABTestResult {
  winner: 'A' | 'B' | 'tie';
  scoresA: Record<string, number>;
  scoresB: Record<string, number>;
  statisticalSignificance: number;
  testCasesCount: number;
}

export class PromptABTester {
  async runABTest(
    promptIdA: string,
    promptIdB: string,
    testCases: TestCase[],
    metrics: EvaluationMetric[],
    modelId?: string
  ): Promise<ABTestResult & {
    resultsA: TestResult[];
    resultsB: TestResult[];
    details: {
      testCaseId: string;
      scoreA: number;
      scoreB: number;
      winner: 'A' | 'B' | 'tie';
    }[];
  }> {
    const [resultsA, resultsB] = await Promise.all([
      this.runTestsForPrompt(promptIdA, testCases, metrics, modelId),
      this.runTestsForPrompt(promptIdB, testCases, metrics, modelId)
    ]);

    const scoresA = this.calculateScores(resultsA, metrics);
    const scoresB = this.calculateScores(resultsB, metrics);

    const winner = this.determineWinner(scoresA, scoresB);
    const statisticalSignificance = this.calculateStatisticalSignificance(
      resultsA,
      resultsB
    );

    const details = testCases.map((testCase, index) => {
      const scoreA = this.getAverageScore(resultsA[index], metrics);
      const scoreB = this.getAverageScore(resultsB[index], metrics);

      const winner: 'A' | 'B' | 'tie' = scoreA > scoreB ? 'A' : scoreB > scoreA ? 'B' : 'tie';

      return {
        testCaseId: testCase.id,
        scoreA,
        scoreB,
        winner,
      };
    });

    const abTestResult: ABTestResult = {
      winner,
      scoresA,
      scoresB,
      statisticalSignificance,
      testCasesCount: testCases.length
    };

    await this.saveABTest(promptIdA, promptIdB, abTestResult, details);

    return {
      ...abTestResult,
      resultsA,
      resultsB,
      details
    };
  }

  private async runTestsForPrompt(
    promptId: string,
    testCases: TestCase[],
    metrics: EvaluationMetric[],
    modelId?: string
  ): Promise<TestResult[]> {
    const results: TestResult[] = [];

    for (const testCase of testCases) {
      const result = await this.executeTest(promptId, testCase, metrics, modelId);
      results.push(result);
    }

    return results;
  }

  private async executeTest(
    promptId: string,
    testCase: TestCase,
    metrics: EvaluationMetric[],
    modelId?: string
  ): Promise<TestResult> {
    try {
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

      return {
        testCaseId: testCase.id,
        passed: true,
        response: response.content,
        scores
      };
    } catch (error) {
      logger.error('AB test execution failed', { promptId, testCaseId: testCase.id, error });
      return {
        testCaseId: testCase.id,
        passed: false,
        response: '',
        scores: {},
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  private calculateScores(
    results: TestResult[],
    metrics: EvaluationMetric[]
  ): Record<string, number> {
    const scores: Record<string, number> = {};

    for (const metric of metrics) {
      const metricScores = results
        .map(r => r.scores[metric.name] || 0)
        .filter(s => !isNaN(s));

      if (metricScores.length > 0) {
        scores[metric.name] = metricScores.reduce((a, b) => a + b, 0) / metricScores.length;
      } else {
        scores[metric.name] = 0;
      }
    }

    return scores;
  }

  private getAverageScore(result: TestResult, metrics: EvaluationMetric[]): number {
    const scores = metrics.map(m => result.scores[m.name] || 0);
    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  }

  private determineWinner(
    scoresA: Record<string, number>,
    scoresB: Record<string, number>
  ): 'A' | 'B' | 'tie' {
    const keysA = Object.keys(scoresA);
    const keysB = Object.keys(scoresB);
    
    const avgScoreA = keysA.length > 0 ? Object.values(scoresA).reduce((a, b) => a + b, 0) / keysA.length : 0;
    const avgScoreB = keysB.length > 0 ? Object.values(scoresB).reduce((a, b) => a + b, 0) / keysB.length : 0;

    const threshold = 0.05;

    if (avgScoreA > avgScoreB * (1 + threshold)) {
      return 'A';
    } else if (avgScoreB > avgScoreA * (1 + threshold)) {
      return 'B';
    } else {
      return 'tie';
    }
  }

  private calculateStatisticalSignificance(
    resultsA: TestResult[],
    resultsB: TestResult[]
  ): number {
    const scoresA = resultsA.map(r => {
      const scoreValues = Object.values(r.scores);
      const scoreKeys = Object.keys(r.scores);
      return scoreKeys.length > 0 ? scoreValues.reduce((a, b) => a + b, 0) / scoreKeys.length : 0;
    });
    const scoresB = resultsB.map(r => {
      const scoreValues = Object.values(r.scores);
      const scoreKeys = Object.keys(r.scores);
      return scoreKeys.length > 0 ? scoreValues.reduce((a, b) => a + b, 0) / scoreKeys.length : 0;
    });

    if (scoresA.length < 2 || scoresB.length < 2) {
      return 0;
    }

    const meanA = scoresA.reduce((a, b) => a + b, 0) / scoresA.length;
    const meanB = scoresB.reduce((a, b) => a + b, 0) / scoresB.length;

    const varianceA = scoresA.reduce((sum, score) => sum + Math.pow(score - meanA, 2), 0) / scoresA.length;
    const varianceB = scoresB.reduce((sum, score) => sum + Math.pow(score - meanB, 2), 0) / scoresB.length;

    const pooledStdError = Math.sqrt(varianceA / scoresA.length + varianceB / scoresB.length);

    if (pooledStdError === 0) {
      return 0;
    }

    const tStat = (meanB - meanA) / pooledStdError;
    const degreesOfFreedom = scoresA.length + scoresB.length - 2;

    const significance = this.tDistributionCDF(Math.abs(tStat), degreesOfFreedom);

    return Math.min(Math.max(significance * 2 - 1, 0), 1);
  }

  private tDistributionCDF(t: number, df: number): number {
    if (df < 1) return 0.5;

    const x = df / (df + t * t);
    const probability = this.incompleteBeta(df / 2, 0.5, x);

    return 1 - probability / 2;
  }

  private incompleteBeta(a: number, b: number, x: number): number {
    if (x === 0) return 0;
    if (x === 1) return 1;

    const maxIterations = 100;
    const epsilon = 1e-10;
    let sum = 0;
    let term = 1;

    for (let n = 0; n < maxIterations; n++) {
      sum += term;
      term *= x * (a + n) / (a + b + n) / (n + 1);

      if (Math.abs(term) < epsilon) break;
    }

    return Math.pow(x, a) * Math.pow(1 - x, b) * sum / a;
  }

  private async saveABTest(
    promptIdA: string,
    promptIdB: string,
    result: ABTestResult,
    details: any[]
  ): Promise<string> {
    const abTest = await (prisma as any).promptABTest.create({
      data: {
        prompt_id_a: promptIdA,
        prompt_id_b: promptIdB,
        result: result as any,
        details: details as any,
        created_at: new Date()
      }
    });

    return abTest.id;
  }

  async getABTest(testId: string) {
    return await (prisma as any).promptABTest.findUnique({
      where: { id: testId }
    });
  }

  async getABTestHistory(promptId: string) {
    return await (prisma as any).promptABTest.findMany({
      where: {
        OR: [{ prompt_id_a: promptId }, { prompt_id_b: promptId }]
      },
      orderBy: { created_at: 'desc' },
      take: 20
    });
  }
}

export const promptABTester = new PromptABTester();