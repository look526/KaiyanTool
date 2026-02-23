import axios from 'axios';

interface TestConfig {
  baseUrl: string;
  concurrency: number;
  totalRequests: number;
  timeout: number;
}

interface TestResult {
  url: string;
  method: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  minLatency: number;
  maxLatency: number;
  avgLatency: number;
  p50Latency: number;
  p95Latency: number;
  p99Latency: number;
  requestsPerSecond: number;
  totalDuration: number;
  errors: Array<{ status: number; message: string; count: number }>;
}

class LoadTester {
  private config: TestConfig;
  private results: Map<string, TestResult> = new Map();

  constructor(config: TestConfig) {
    this.config = config;
  }

  async runTest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<TestResult> {
    const key = `${method}:${url}`;
    const latencies: number[] = [];
    let successful = 0;
    let failed = 0;
    const errors: Map<number, number> = new Map();
    const errorMessages: Map<string, number> = new Map();

    const startTime = Date.now();

    const makeRequest = async (): Promise<void> => {
      const requestStart = Date.now();
      try {
        const response = await axios({
          method,
          url: `${this.config.baseUrl}${url}`,
          data,
          headers,
          timeout: this.config.timeout,
        });

        successful++;
        latencies.push(Date.now() - requestStart);
      } catch (error) {
        failed++;
        if (axios.isAxiosError(error)) {
          const status = error.response?.status || 0;
          errors.set(status, (errors.get(status) || 0) + 1);

          const message = error.message;
          errorMessages.set(message, (errorMessages.get(message) || 0) + 1);
        }
      }
    };

    const batchSize = Math.ceil(this.config.totalRequests / this.config.concurrency);

    for (let i = 0; i < this.config.concurrency; i++) {
      const batchRequests = Math.min(
        batchSize,
        this.config.totalRequests - i * batchSize
      );

      const promises = Array.from({ length: batchRequests }, () => makeRequest());
      await Promise.all(promises);
    }

    const totalDuration = Date.now() - startTime;
    const sortedLatencies = [...latencies].sort((a, b) => a - b);

    const result: TestResult = {
      url,
      method,
      totalRequests: this.config.totalRequests,
      successfulRequests: successful,
      failedRequests: failed,
      minLatency: latencies.length > 0 ? Math.min(...latencies) : 0,
      maxLatency: latencies.length > 0 ? Math.max(...latencies) : 0,
      avgLatency: latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0,
      p50Latency: sortedLatencies[Math.floor(sortedLatencies.length * 0.5)] || 0,
      p95Latency: sortedLatencies[Math.floor(sortedLatencies.length * 0.95)] || 0,
      p99Latency: sortedLatencies[Math.floor(sortedLatencies.length * 0.99)] || 0,
      requestsPerSecond: (this.config.totalRequests / totalDuration) * 1000,
      totalDuration,
      errors: Array.from(errors.entries()).map(([status, count]) => ({
        status,
        message: '',
        count,
      })),
    };

    this.results.set(key, result);
    return result;
  }

  printResult(result: TestResult) {
    console.log(`\n=== ${result.method} ${result.url} ===`);
    console.log(`Total Requests: ${result.totalRequests}`);
    console.log(`Successful: ${result.successfulRequests} (${((result.successfulRequests / result.totalRequests) * 100).toFixed(2)}%)`);
    console.log(`Failed: ${result.failedRequests} (${((result.failedRequests / result.totalRequests) * 100).toFixed(2)}%)`);
    console.log(`\nLatency:`);
    console.log(`  Min: ${result.minLatency}ms`);
    console.log(`  Avg: ${result.avgLatency.toFixed(2)}ms`);
    console.log(`  P50: ${result.p50Latency}ms`);
    console.log(`  P95: ${result.p95Latency}ms`);
    console.log(`  P99: ${result.p99Latency}ms`);
    console.log(`  Max: ${result.maxLatency}ms`);
    console.log(`\nThroughput: ${result.requestsPerSecond.toFixed(2)} requests/sec`);
    console.log(`Total Duration: ${(result.totalDuration / 1000).toFixed(2)}s`);

    if (result.errors.length > 0) {
      console.log(`\nErrors:`);
      result.errors.forEach(error => {
        console.log(`  ${error.status}: ${error.count} requests`);
      });
    }
  }

  getAllResults() {
    return Array.from(this.results.values());
  }

  generateReport() {
    const results = this.getAllResults();

    console.log('\n========================================');
    console.log('           LOAD TEST REPORT');
    console.log('========================================');

    results.forEach(result => {
      this.printResult(result);
    });

    console.log('\n========================================');
    console.log('              SUMMARY');
    console.log('========================================');

    const totalRequests = results.reduce((sum, r) => sum + r.totalRequests, 0);
    const totalSuccessful = results.reduce((sum, r) => sum + r.successfulRequests, 0);
    const totalFailed = results.reduce((sum, r) => sum + r.failedRequests, 0);
    const avgRps = results.reduce((sum, r) => sum + r.requestsPerSecond, 0) / results.length;

    console.log(`Total Requests: ${totalRequests}`);
    console.log(`Total Successful: ${totalSuccessful} (${((totalSuccessful / totalRequests) * 100).toFixed(2)}%)`);
    console.log(`Total Failed: ${totalFailed} (${((totalFailed / totalRequests) * 100).toFixed(2)}%)`);
    console.log(`Average RPS: ${avgRps.toFixed(2)} requests/sec`);
    console.log('========================================\n');
  }
}

async function runStandardTests(baseUrl: string) {
  const tester = new LoadTester({
    baseUrl,
    concurrency: 10,
    totalRequests: 100,
    timeout: 5000,
  });

  console.log('Running standard load tests...\n');

  await tester.runTest('GET', '/health');
  await tester.runTest('GET', '/api/projects');
  await tester.runTest('GET', '/api/ai-providers');

  tester.generateReport();
}

async function runHeavyTests(baseUrl: string) {
  const tester = new LoadTester({
    baseUrl,
    concurrency: 50,
    totalRequests: 500,
    timeout: 10000,
  });

  console.log('Running heavy load tests...\n');

  await tester.runTest('GET', '/health');
  await tester.runTest('GET', '/api/projects');

  tester.generateReport();
}

async function runSpecificTest(baseUrl: string, endpoint: string, method: string = 'GET') {
  const tester = new LoadTester({
    baseUrl,
    concurrency: 20,
    totalRequests: 200,
    timeout: 5000,
  });

  console.log(`Running test on ${method} ${endpoint}...\n`);

  const result = await tester.runTest(method as any, endpoint);
  tester.printResult(result);
}

async function main() {
  const args = process.argv.slice(2);
  const baseUrl = args[0] || 'http://localhost:3001';
  const testType = args[1] || 'standard';

  try {
    switch (testType) {
      case 'standard':
        await runStandardTests(baseUrl);
        break;

      case 'heavy':
        await runHeavyTests(baseUrl);
        break;

      case 'custom':
        const endpoint = args[2];
        const method = args[3] || 'GET';
        if (!endpoint) {
          console.error('Error: endpoint required for custom test');
          process.exit(1);
        }
        await runSpecificTest(baseUrl, endpoint, method);
        break;

      default:
        console.log(`
Usage: npm run test:perf <baseUrl> <testType> [endpoint] [method]

Arguments:
  baseUrl      API base URL (default: http://localhost:3001)
  testType      Type of test: standard, heavy, or custom
  endpoint      API endpoint for custom test (required for custom)
  method        HTTP method for custom test (default: GET)

Examples:
  npm run test:perf http://localhost:3001 standard
  npm run test:perf http://localhost:3001 heavy
  npm run test:perf http://localhost:3001 custom /api/projects GET
  npm run test:perf http://localhost:3001 custom /api/projects POST
        `);
        process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Performance test failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { LoadTester, runStandardTests, runHeavyTests, runSpecificTest };
