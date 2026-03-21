import { Feature } from './progress-tracking.service';
import { progressTrackingService } from './progress-tracking.service';
import logger from '../lib/logger';

export interface TestSuite {
  id: string;
  name: string;
  description: string;
  test_type: 'unit' | 'integration' | 'e2e' | 'performance' | 'security';
  features: string[];
  tests: TestCase[];
  setup_commands?: string[];
  teardown_commands?: string[];
}

export interface TestCase {
  id: string;
  name: string;
  description: string;
  feature_id: string;
  test_type: 'unit' | 'integration' | 'e2e' | 'performance' | 'security';
  priority: 'critical' | 'high' | 'medium' | 'low';
  timeout_ms?: number;
  expected_result: string;
  validation_criteria: string[];
  dependencies?: string[];
}

export interface TestResult {
  test_id: string;
  test_name: string;
  feature_id: string;
  status: 'passed' | 'failed' | 'skipped' | 'timeout' | 'error';
  duration_ms: number;
  timestamp: string;
  output?: string;
  error_message?: string;
  validation_results: Array<{
    criterion: string;
    passed: boolean;
    details?: string;
  }>;
}

export interface TestReport {
  suite_id: string;
  suite_name: string;
  project_id: string;
  session_id?: string;
  timestamp: string;
  total_tests: number;
  passed: number;
  failed: number;
  skipped: number;
  errors: number;
  pass_rate: number;
  total_duration_ms: number;
  average_test_duration_ms: number;
  results: TestResult[];
  features_tested: string[];
  critical_failures: TestCase[];
  recommendations: string[];
}

export interface TestAutomationConfig {
  auto_generate_tests?: boolean;
  run_tests_after_feature: boolean;
  fail_on_critical_failure: boolean;
  max_retries: number;
  test_timeout_ms: number;
  parallel_test_execution: boolean;
}

export class TestAutomationService {
  private config: TestAutomationConfig;
  private testSuites: Map<string, TestSuite> = new Map();
  private testHistory: Map<string, TestResult[]> = new Map();

  constructor(config: TestAutomationConfig = {}) {
    this.config = {
      auto_generate_tests: config.auto_generate_tests ?? true,
      run_tests_after_feature: config.run_tests_after_feature ?? true,
      fail_on_critical_failure: config.fail_on_critical_failure ?? false,
      max_retries: config.max_retries ?? 3,
      test_timeout_ms: config.test_timeout_ms ?? 5 * 60 * 1000,
      parallel_test_execution: config.parallel_test_execution ?? false,
    };

    logger.info('Test automation service initialized', this.config);
  }

  async generateTestSuite(
    projectId: string,
    features: Feature[],
    testType: 'unit' | 'integration' | 'e2e' = 'integration'
  ): Promise<TestSuite> {
    try {
      const suiteId = `suite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const testCases: TestCase[] = [];

      for (const feature of features) {
        const featureTests = await this.generateTestsForFeature(feature, testType);
        testCases.push(...featureTests);
      }

      const testSuite: TestSuite = {
        id: suiteId,
        name: `${testType.toUpperCase()} Tests for ${projectId}`,
        description: `Automatically generated ${testType} tests for ${features.length} features`,
        test_type: testType,
        features: features.map(f => f.id),
        tests: testCases,
        setup_commands: ['npm install', 'npm run build'],
        teardown_commands: ['npm run clean'],
      };

      this.testSuites.set(suiteId, testSuite);

      logger.info('Test suite generated', {
        suite_id: suiteId,
        test_count: testCases.length,
        features_count: features.length,
        test_type: testType,
      });

      return testSuite;
    } catch (error) {
      logger.error('Failed to generate test suite', {
        project_id: projectId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async generateTestsForFeature(
    feature: Feature,
    testType: 'unit' | 'integration' | 'e2e'
  ): Promise<TestCase[]> {
    const tests: TestCase[] = [];

    switch (testType) {
      case 'unit':
        tests.push(...this.generateUnitTests(feature));
        break;

      case 'integration':
        tests.push(...this.generateIntegrationTests(feature));
        break;

      case 'e2e':
        tests.push(...this.generateE2ETests(feature));
        break;
    }

    return tests;
  }

  private generateUnitTests(feature: Feature): TestCase[] {
    const tests: TestCase[] = [];

    const happyPathTest: TestCase = {
      id: `${feature.id}_unit_happy_path`,
      name: `Happy Path - ${feature.description}`,
      description: `Test that ${feature.description} works as expected`,
      feature_id: feature.id,
      test_type: 'unit',
      priority: 'high',
      expected_result: 'Feature executes without errors',
      validation_criteria: [
        'No exceptions thrown',
        'Expected output matches specification',
        'Return value is correct',
      ],
    };

    const edgeCaseTest: TestCase = {
      id: `${feature.id}_unit_edge_case`,
      name: `Edge Cases - ${feature.description}`,
      description: `Test edge cases and boundary conditions for ${feature.description}`,
      feature_id: feature.id,
      test_type: 'unit',
      priority: 'medium',
      expected_result: 'Feature handles edge cases correctly',
      validation_criteria: [
        'Handles null/undefined inputs',
        'Handles empty inputs',
        'Handles boundary values',
        'Error handling works correctly',
      ],
    };

    tests.push(happyPathTest, edgeCaseTest);

    return tests;
  }

  private generateIntegrationTests(feature: Feature): TestCase[] {
    const tests: TestCase[] = [];

    const apiIntegrationTest: TestCase = {
      id: `${feature.id}_integration_api`,
      name: `API Integration - ${feature.description}`,
      description: `Test API endpoints related to ${feature.description}`,
      feature_id: feature.id,
      test_type: 'integration',
      priority: 'high',
      expected_result: 'API calls succeed and return expected data',
      validation_criteria: [
        'HTTP status codes are correct',
        'Response format matches schema',
        'Authentication works correctly',
        'Rate limiting is respected',
      ],
    };

    const databaseIntegrationTest: TestCase = {
      id: `${feature.id}_integration_database`,
      name: `Database Integration - ${feature.description}`,
      description: `Test database operations related to ${feature.description}`,
      feature_id: feature.id,
      test_type: 'integration',
      priority: 'high',
      expected_result: 'Database operations complete successfully',
      validation_criteria: [
        'Data is persisted correctly',
        'Queries return expected results',
        'Transactions are handled properly',
        'Data integrity is maintained',
      ],
    };

    tests.push(apiIntegrationTest, databaseIntegrationTest);

    return tests;
  }

  private generateE2ETests(feature: Feature): TestCase[] {
    const tests: TestCase[] = [];

    const userFlowTest: TestCase = {
      id: `${feature.id}_e2e_user_flow`,
      name: `User Flow - ${feature.description}`,
      description: `Test complete user flow for ${feature.description}`,
      feature_id: feature.id,
      test_type: 'e2e',
      priority: 'critical',
      timeout_ms: 30 * 1000,
      expected_result: 'User can complete the flow without issues',
      validation_criteria: [
        'UI renders correctly',
        'User interactions work as expected',
        'Navigation is smooth',
        'Feedback is clear',
        'Error handling is user-friendly',
      ],
    };

    tests.push(userFlowTest);

    return tests;
  }

  async runTestSuite(
    suiteId: string,
    projectId: string,
    sessionId?: string
  ): Promise<TestReport> {
    try {
      const suite = this.testSuites.get(suiteId);

      if (!suite) {
        throw new Error(`Test suite not found: ${suiteId}`);
      }

      logger.info('Running test suite', {
        suite_id: suiteId,
        suite_name: suite.name,
        test_count: suite.tests.length,
      });

      const results: TestResult[] = [];

      for (const test of suite.tests) {
        const result = await this.runTestCase(test, projectId, sessionId);
        results.push(result);

        if (this.config.fail_on_critical_failure) {
          const criticalFailures = results.filter(
            r => r.status === 'failed' && r.priority === 'critical'
          );

          if (criticalFailures.length > 0) {
            logger.error('Critical test failure, aborting suite', {
              failed_tests: criticalFailures.length,
            });
            break;
          }
        }
      }

      const report = this.generateTestReport(suite, results, projectId, sessionId);

      this.recordTestHistory(projectId, sessionId, results);

      logger.info('Test suite completed', {
        suite_id: suiteId,
        total_tests: report.total_tests,
        passed: report.passed,
        failed: report.failed,
        pass_rate: report.pass_rate,
        duration_ms: report.total_duration_ms,
      });

      return report;
    } catch (error) {
      logger.error('Failed to run test suite', {
        suite_id: suiteId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async runTestCase(
    test: TestCase,
    projectId: string,
    sessionId?: string
  ): Promise<TestResult> {
    const startTime = Date.now();

    try {
      logger.debug('Running test case', {
        test_id: test.id,
        test_name: test.name,
        feature_id: test.feature_id,
      });

      const feature = await progressTrackingService.getFeature(projectId, test.feature_id);

      if (!feature || feature.status !== 'passing') {
        logger.warn('Test skipped - feature not passing', {
          test_id: test.id,
          feature_id: test.feature_id,
          feature_status: feature?.status || 'unknown',
        });

        return {
          test_id: test.id,
          test_name: test.name,
          feature_id: test.feature_id,
          status: 'skipped',
          duration_ms: 0,
          timestamp: new Date().toISOString(),
          validation_results: [],
        };
      }

      const validationResults = await this.validateFeature(feature, test);

      const allPassed = validationResults.every(v => v.passed);
      const status = allPassed ? 'passed' : 'failed';

      const duration = Date.now() - startTime;

      logger.debug('Test case completed', {
        test_id: test.id,
        status,
        duration_ms: duration,
        validations_passed: validationResults.filter(v => v.passed).length,
        validations_total: validationResults.length,
      });

      return {
        test_id: test.id,
        test_name: test.name,
        feature_id: test.feature_id,
        status,
        duration_ms: duration,
        timestamp: new Date().toISOString(),
        output: test.expected_result,
        validation_results: validationResults,
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error('Test case error', {
        test_id: test.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration_ms: duration,
      });

      return {
        test_id: test.id,
        test_name: test.name,
        feature_id: test.feature_id,
        status: 'error',
        duration_ms: duration,
        timestamp: new Date().toISOString(),
        error_message: error instanceof Error ? error.message : 'Unknown error',
        validation_results: [],
      };
    }
  }

  private async validateFeature(
    feature: Feature,
    test: TestCase
  ): Promise<Array<{ criterion: string; passed: boolean; details?: string }>> {
    const results: Array<{ criterion: string; passed: boolean; details?: string }> = [];

    for (const criterion of test.validation_criteria) {
      const passed = await this.checkValidationCriterion(feature, criterion, test);

      results.push({
        criterion,
        passed,
        details: passed ? undefined : `Failed to meet criterion: ${criterion}`,
      });
    }

    return results;
  }

  private async checkValidationCriterion(
    feature: Feature,
    criterion: string,
    test: TestCase
  ): Promise<boolean> {
    const criterionLower = criterion.toLowerCase();

    if (criterionLower.includes('no exception') || criterionLower.includes('no error')) {
      return feature.status === 'passing' && !feature.notes?.toLowerCase().includes('error');
    }

    if (criterionLower.includes('http status') || criterionLower.includes('api')) {
      return feature.status === 'passing';
    }

    if (criterionLower.includes('data') || criterionLower.includes('database')) {
      return feature.status === 'passing';
    }

    if (criterionLower.includes('ui') || criterionLower.includes('user')) {
      return feature.status === 'passing';
    }

    return feature.status === 'passing';
  }

  private generateTestReport(
    suite: TestSuite,
    results: TestResult[],
    projectId: string,
    sessionId?: string
  ): TestReport {
    const total = results.length;
    const passed = results.filter(r => r.status === 'passed').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const skipped = results.filter(r => r.status === 'skipped').length;
    const errors = results.filter(r => r.status === 'error').length;

    const totalDuration = results.reduce((sum, r) => sum + r.duration_ms, 0);
    const averageDuration = total / total;
    const passRate = total > 0 ? (passed / total) * 100 : 0;

    const featuresTested = Array.from(new Set(results.map(r => r.feature_id)));
    const criticalFailures = results.filter(
      r => r.status === 'failed' && r.priority === 'critical'
    );

    const recommendations = this.generateRecommendations(suite, results);

    return {
      suite_id: suite.id,
      suite_name: suite.name,
      project_id: projectId,
      session_id: sessionId,
      timestamp: new Date().toISOString(),
      total_tests: total,
      passed,
      failed,
      skipped,
      errors,
      pass_rate: passRate,
      total_duration_ms: totalDuration,
      average_test_duration_ms: Math.round(averageDuration),
      results,
      features_tested: featuresTested,
      critical_failures: criticalFailures,
      recommendations,
    };
  }

  private generateRecommendations(
    suite: TestSuite,
    results: TestResult[]
  ): string[] {
    const recommendations: string[] = [];

    const failedTests = results.filter(r => r.status === 'failed');

    if (failedTests.length > 0) {
      recommendations.push(
        `${failedTests.length} tests failed. Review and fix the failing tests.`
      );
    }

    const criticalFailures = failedTests.filter(
      r => r.priority === 'critical'
    );

    if (criticalFailures.length > 0) {
      recommendations.push(
        `${criticalFailures.length} critical tests failed. Address these issues immediately.`
      );
    }

    const errorTests = results.filter(r => r.status === 'error');

    if (errorTests.length > 0) {
      recommendations.push(
        `${errorTests.length} tests encountered errors. Check test configuration and environment.`
      );
    }

    const skippedTests = results.filter(r => r.status === 'skipped');

    if (skippedTests.length > 0) {
      recommendations.push(
        `${skippedTests.length} tests were skipped. Ensure features are implemented before running tests.`
      );
    }

    const avgDuration = results.reduce((sum, r) => sum + r.duration_ms, 0) / results.length;

    if (avgDuration > this.config.test_timeout_ms * 0.8) {
      recommendations.push(
        `Average test duration (${Math.round(avgDuration / 1000)}s) is approaching timeout. Consider optimizing tests.`
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('All tests passed. Continue with implementation.');
    }

    return recommendations;
  }

  private recordTestHistory(
    projectId: string,
    sessionId: string | undefined,
    results: TestResult[]
  ): void {
    const key = this.getTestHistoryKey(projectId, sessionId);

    if (!this.testHistory.has(key)) {
      this.testHistory.set(key, []);
    }

    const history = this.testHistory.get(key)!;
    history.push(...results);

    if (history.length > 100) {
      this.testHistory.set(key, history.slice(-100));
    }
  }

  getTestHistory(
    projectId: string,
    sessionId?: string,
    limit: number = 50
  ): TestResult[] {
    const key = this.getTestHistoryKey(projectId, sessionId);
    const history = this.testHistory.get(key) || [];
    return history.slice(-limit);
  }

  getTestStatistics(projectId: string): {
    total_tests: number;
    total_pass_rate: number;
    average_duration_ms: number;
    most_failing_tests: Array<{ test_id: string; test_name: string; failure_count: number }>;
    recent_trends: {
      pass_rate_trend: 'improving' | 'degrading' | 'stable';
      average_duration_trend: 'improving' | 'degrading' | 'stable';
    };
  } {
    const allResults = this.getTestHistory(projectId);

    if (allResults.length === 0) {
      return {
        total_tests: 0,
        total_pass_rate: 0,
        average_duration_ms: 0,
        most_failing_tests: [],
        recent_trends: {
          pass_rate_trend: 'stable',
          average_duration_trend: 'stable',
        },
      };
    }

    const total = allResults.length;
    const passed = allResults.filter(r => r.status === 'passed').length;
    const totalPassRate = (passed / total) * 100;
    const totalDuration = allResults.reduce((sum, r) => sum + r.duration_ms, 0);
    const averageDuration = totalDuration / total;

    const failureCounts = new Map<string, number>();

    for (const result of allResults) {
      if (result.status === 'failed') {
        const count = failureCounts.get(result.test_id) || 0;
        failureCounts.set(result.test_id, count + 1);
      }
    }

    const mostFailingTests = Array.from(failureCounts.entries())
      .map(([test_id, failure_count]) => {
        const test = allResults.find(r => r.test_id === test_id);
        return {
          test_id,
          test_name: test?.test_name || test_id,
          failure_count,
        };
      })
      .sort((a, b) => b.failure_count - a.failure_count)
      .slice(0, 10);

    const recentTrends = this.calculateTestTrends(allResults);

    return {
      total_tests: total,
      total_pass_rate: Math.round(totalPassRate * 100) / 100,
      average_duration_ms: Math.round(averageDuration),
      most_failing_tests: mostFailingTests,
      recent_trends: recentTrends,
    };
  }

  private calculateTestTrends(results: TestResult[]): {
    pass_rate_trend: 'improving' | 'degrading' | 'stable';
    average_duration_trend: 'improving' | 'degrading' | 'stable';
  } {
    if (results.length < 10) {
      return {
        pass_rate_trend: 'stable',
        average_duration_trend: 'stable',
      };
    }

    const recent = results.slice(-10);
    const earlier = results.slice(0, -10);

    const recentPassRate =
      recent.filter(r => r.status === 'passed').length / recent.length;
    const earlierPassRate =
      earlier.filter(r => r.status === 'passed').length / earlier.length;

    const recentAvgDuration =
      recent.reduce((sum, r) => sum + r.duration_ms, 0) / recent.length;
    const earlierAvgDuration =
      earlier.reduce((sum, r) => sum + r.duration_ms, 0) / earlier.length;

    const passRateTrend =
      Math.abs(recentPassRate - earlierPassRate) < 0.05
        ? 'stable'
        : recentPassRate > earlierPassRate
        ? 'improving'
        : 'degrading';

    const durationTrend =
      Math.abs(recentAvgDuration - earlierAvgDuration) < 1000
        ? 'stable'
        : recentAvgDuration < earlierAvgDuration
        ? 'improving'
        : 'degrading';

    return {
      pass_rate_trend: passRateTrend,
      average_duration_trend: durationTrend,
    };
  }

  private getTestHistoryKey(projectId: string, sessionId?: string): string {
    return sessionId ? `${projectId}:${sessionId}` : projectId;
  }

  async reset(): Promise<void> {
    this.testSuites.clear();
    this.testHistory.clear();

    logger.info('Test automation service reset');
  }
}

export const testAutomationService = new TestAutomationService();
