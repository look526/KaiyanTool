# Performance Testing Guide

## Overview

This guide covers the performance testing tools and procedures for KaiyanTool.

## Load Testing

Load testing helps evaluate system performance under expected and peak load conditions.

### Running Load Tests

```bash
# Standard load test (100 requests, 10 concurrent)
npm run test:perf http://localhost:3001 standard

# Heavy load test (500 requests, 50 concurrent)
npm run test:perf http://localhost:3001 heavy

# Custom endpoint test
npm run test:perf http://localhost:3001 custom /api/projects GET
```

### Load Test Metrics

- **Total Requests**: Number of requests sent
- **Successful Requests**: Requests that completed successfully
- **Failed Requests**: Requests that failed
- **Latency**:
  - Min/Max: Minimum and maximum response times
  - Average: Mean response time
  - P50/P95/P99: Latency percentiles
- **Requests Per Second (RPS)**: Throughput metric
- **Total Duration**: Time taken to complete all requests

### Load Test Configuration

Modify `LoadTester` configuration in `src/tests/performance/load-test.ts`:

```typescript
{
  baseUrl: 'http://localhost:3001',
  concurrency: 10,      // Number of concurrent requests
  totalRequests: 100,   // Total requests to send
  timeout: 5000,        // Request timeout in ms
}
```

## Benchmarking

Benchmarking measures specific operations to identify performance bottlenecks.

### Running Benchmarks

```bash
# Run all benchmarks
npm run test:benchmark http://localhost:3001 all

# Database benchmarks only
npm run test:benchmark http://localhost:3001 database

# Memory benchmarks only
npm run test:benchmark http://localhost:3001 memory

# AI operation benchmarks
npm run test:benchmark http://localhost:3001 ai

# File upload benchmarks
npm run test:benchmark http://localhost:3001 upload
```

### Benchmark Categories

1. **Database Query Benchmarks**
   - Create, Read, Update, Delete operations
   - Complex queries with joins
   - Query performance under load

2. **Memory Usage Benchmarks**
   - Memory allocation patterns
   - Memory efficiency
   - Garbage collection impact

3. **AI Operation Benchmarks**
   - Storyline generation latency
   - AI response times
   - Success rates

4. **File Upload Benchmarks**
   - Upload latency
   - Throughput
   - Large file handling

### Benchmark Reports

Results are automatically exported to JSON files:
```
benchmark-report-2024-02-22T10-30-00-000Z.json
```

## Performance Goals

### Target Metrics

| Metric | Target | Notes |
|--------|--------|-------|
| API Response Time (P50) | < 100ms | Median response time |
| API Response Time (P95) | < 500ms | 95th percentile |
| API Response Time (P99) | < 1000ms | 99th percentile |
| Database Query Time | < 50ms | Average query time |
| AI Generation Time | < 30s | Storyline generation |
| File Upload (1MB) | < 2s | Upload latency |
| Concurrent Users | 100+ | Standard load |
| Requests Per Second | 50+ | Standard load |

## Performance Optimization Checklist

- [ ] Add database indexes on frequently queried fields
- [ ] Implement response caching for read-heavy endpoints
- [ ] Optimize complex database queries
- [ ] Use connection pooling for database
- [ ] Implement request rate limiting
- [ ] Add CDN for static assets
- [ ] Optimize image sizes and formats
- [ ] Implement lazy loading for large lists
- [ ] Use Redis for session and cache storage
- [ ] Monitor memory usage and implement garbage collection

## Continuous Monitoring

Use the built-in monitoring tools to track performance:

```bash
# View Prometheus metrics
curl http://localhost:3001/metrics

# Check Grafana dashboards
# Navigate to http://localhost:3000
```

## Troubleshooting Performance Issues

### High API Latency

1. Check database query performance
2. Review slow query logs
3. Verify database indexes
4. Check for N+1 query problems

### High Memory Usage

1. Profile memory allocations
2. Check for memory leaks
3. Review object pooling
4. Optimize data structures

### Low Throughput

1. Check connection pool settings
2. Review thread/concurrency limits
3. Verify rate limiting configuration
4. Check for bottlenecks in request pipeline

## Load Testing Best Practices

1. **Start Small**: Begin with low load and gradually increase
2. **Use Realistic Scenarios**: Test with realistic user patterns
3. **Monitor Resources**: Track CPU, memory, and disk I/O during tests
4. **Run Multiple Times**: Results can vary between runs
5. **Test in Production-like Environment**: Use similar hardware and configuration
6. **Document Baselines**: Establish performance baselines for comparison

## CI/CD Integration

Add performance tests to your CI pipeline:

```yaml
# .github/workflows/performance.yml
name: Performance Tests
on: [push, pull_request]
jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Start services
        run: docker-compose up -d
      - name: Run load tests
        run: npm run test:perf http://localhost:3001 standard
      - name: Run benchmarks
        run: npm run test:benchmark http://localhost:3001 database
```
