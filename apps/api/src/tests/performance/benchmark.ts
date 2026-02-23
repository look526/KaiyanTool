import { prisma } from '../../lib/prisma';
import { LoadTester } from './load-test';

interface BenchmarkResult {
  name: string;
  duration: number;
  memoryUsage: number;
  cpuUsage?: number;
}

class Benchmark {
  private results: BenchmarkResult[] = [];
  private startMemory: number;

  constructor() {
    this.startMemory = process.memoryUsage().heapUsed;
  }

  async measure(name: string, fn: () => Promise<void>): Promise<BenchmarkResult> {
    const startTime = Date.now();
    const startMemory = process.memoryUsage().heapUsed;

    await fn();

    const duration = Date.now() - startTime;
    const memoryUsage = process.memoryUsage().heapUsed - startMemory;

    const result: BenchmarkResult = {
      name,
      duration,
      memoryUsage,
    };

    this.results.push(result);
    return result;
  }

  async benchmarkDatabaseQueries() {
    console.log('\n=== Database Query Benchmarks ===\n');

    await this.measure('Create Project', async () => {
      await prisma.project.create({
        data: {
          name: `Test Project ${Date.now()}`,
          description: 'Benchmark test project',
          type: 'video',
          ownerId: 'test-user-id',
        },
      });
    });

    await this.measure('Read Projects', async () => {
      await prisma.project.findMany({
        take: 100,
        include: {
          members: true,
          documents: true,
        },
      });
    });

    await this.measure('Update Project', async () => {
      const project = await prisma.project.findFirst();
      if (project) {
        await prisma.project.update({
          where: { id: project.id },
          data: { name: `Updated ${Date.now()}` },
        });
      }
    });

    await this.measure('Delete Project', async () => {
      const project = await prisma.project.findFirst({
        where: { name: { startsWith: 'Test Project' } },
      });
      if (project) {
        await prisma.project.delete({ where: { id: project.id } });
      }
    });

    await this.measure('Complex Query with Joins', async () => {
      await prisma.project.findMany({
        where: {
          type: 'video',
          members: {
            some: {
              role: 'OWNER',
            },
          },
        },
        include: {
          members: {
            include: {
              user: true,
            },
          },
          documents: {
            where: {
              type: 'storyline',
            },
          },
        },
        take: 50,
      });
    });
  }

  async benchmarkAIOperations(baseUrl: string) {
    console.log('\n=== AI Operation Benchmarks ===\n');

    const tester = new LoadTester({
      baseUrl,
      concurrency: 5,
      totalRequests: 10,
      timeout: 30000,
    });

    await tester.runTest('POST', '/api/storyline', {
      title: 'Benchmark Storyline',
      genre: 'drama',
      description: 'A test story for benchmarking',
      targetDuration: 10,
    });

    const result = tester.getAllResults()[0];
    if (result) {
      console.log(`\nStoryline Generation:`);
      console.log(`  Avg Latency: ${result.avgLatency.toFixed(2)}ms`);
      console.log(`  P95 Latency: ${result.p95Latency}ms`);
      console.log(`  Success Rate: ${((result.successfulRequests / result.totalRequests) * 100).toFixed(2)}%`);
    }
  }

  async benchmarkMemoryUsage() {
    console.log('\n=== Memory Usage Benchmarks ===\n');

    const projects = [];

    await this.measure('Load 100 Projects into Memory', async () => {
      const data = await prisma.project.findMany({ take: 100 });
      projects.push(...data);
    });

    await this.measure('Process 100 Projects', async () => {
      projects.forEach(p => {
        JSON.stringify(p);
      });
    });

    const memoryBefore = process.memoryUsage().heapUsed;

    await this.measure('Create 1000 Objects', async () => {
      const objects = [];
      for (let i = 0; i < 1000; i++) {
        objects.push({
          id: `obj-${i}`,
          name: `Object ${i}`,
          value: Math.random(),
          timestamp: Date.now(),
        });
      }
    });

    const memoryAfter = process.memoryUsage().heapUsed;
    const memoryDiff = (memoryAfter - memoryBefore) / 1024 / 1024;

    console.log(`\nMemory increase for 1000 objects: ${memoryDiff.toFixed(2)} MB`);
  }

  async benchmarkFileUploads(baseUrl: string) {
    console.log('\n=== File Upload Benchmarks ===\n');

    const tester = new LoadTester({
      baseUrl,
      concurrency: 5,
      totalRequests: 20,
      timeout: 15000,
    });

    const fileData = Buffer.alloc(1024 * 1024);

    await tester.runTest('POST', '/api/upload', fileData, {
      'Content-Type': 'application/octet-stream',
    });

    const result = tester.getAllResults()[0];
    if (result) {
      console.log(`\nFile Upload:`);
      console.log(`  Avg Latency: ${result.avgLatency.toFixed(2)}ms`);
      console.log(`  P95 Latency: ${result.p95Latency}ms`);
      console.log(`  Throughput: ${result.requestsPerSecond.toFixed(2)} uploads/sec`);
    }
  }

  printResults() {
    console.log('\n========================================');
    console.log('        BENCHMARK RESULTS');
    console.log('========================================');

    this.results.forEach(result => {
      console.log(`\n${result.name}:`);
      console.log(`  Duration: ${result.duration}ms`);
      console.log(`  Memory: ${(result.memoryUsage / 1024 / 1024).toFixed(2)} MB`);
    });

    const totalTime = this.results.reduce((sum, r) => sum + r.duration, 0);
    const totalMemory = this.results.reduce((sum, r) => sum + r.memoryUsage, 0);

    console.log('\n========================================');
    console.log('             SUMMARY');
    console.log('========================================');
    console.log(`Total Duration: ${totalTime}ms`);
    console.log(`Total Memory: ${(totalMemory / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Average Duration: ${(totalTime / this.results.length).toFixed(2)}ms`);
    console.log('========================================\n');
  }

  exportResults(filePath: string) {
    const fs = require('fs');
    const data = JSON.stringify({
      timestamp: new Date().toISOString(),
      results: this.results,
      summary: {
        totalDuration: this.results.reduce((sum, r) => sum + r.duration, 0),
        totalMemory: this.results.reduce((sum, r) => sum + r.memoryUsage, 0),
        averageDuration: this.results.reduce((sum, r) => sum + r.duration, 0) / this.results.length,
      },
    }, null, 2);

    fs.writeFileSync(filePath, data);
    console.log(`\n✓ Results exported to ${filePath}\n`);
  }
}

async function runBenchmarks(baseUrl: string) {
  const benchmark = new Benchmark();

  try {
    await benchmark.benchmarkDatabaseQueries();
    await benchmark.benchmarkMemoryUsage();

    if (baseUrl) {
      await benchmark.benchmarkAIOperations(baseUrl);
      await benchmark.benchmarkFileUploads(baseUrl);
    }

    benchmark.printResults();

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = `benchmark-report-${timestamp}.json`;
    benchmark.exportResults(reportPath);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Benchmark failed:', error);
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const baseUrl = args[0] || 'http://localhost:3001';
  const command = args[1] || 'all';

  try {
    switch (command) {
      case 'database':
        const dbBenchmark = new Benchmark();
        await dbBenchmark.benchmarkDatabaseQueries();
        dbBenchmark.printResults();
        break;

      case 'memory':
        const memBenchmark = new Benchmark();
        await memBenchmark.benchmarkMemoryUsage();
        memBenchmark.printResults();
        break;

      case 'ai':
        const aiBenchmark = new Benchmark();
        await aiBenchmark.benchmarkAIOperations(baseUrl);
        aiBenchmark.printResults();
        break;

      case 'upload':
        const uploadBenchmark = new Benchmark();
        await uploadBenchmark.benchmarkFileUploads(baseUrl);
        uploadBenchmark.printResults();
        break;

      case 'all':
        await runBenchmarks(baseUrl);
        break;

      default:
        console.log(`
Usage: npm run test:benchmark <baseUrl> <command>

Arguments:
  baseUrl      API base URL (default: http://localhost:3001)
  command      Type of benchmark: all, database, memory, ai, upload

Examples:
  npm run test:benchmark http://localhost:3001 all
  npm run test:benchmark http://localhost:3001 database
  npm run test:benchmark http://localhost:3001 memory
  npm run test:benchmark http://localhost:3001 ai
        `);
        process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Benchmark failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { Benchmark, runBenchmarks };
