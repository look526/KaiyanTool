import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import { RedisInstrumentation } from '@opentelemetry/instrumentation-redis';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';

// 配置OpenTelemetry SDK
export const setupOpenTelemetry = () => {
  const resource = {
    attributes: {
      [SemanticResourceAttributes.SERVICE_NAME]: 'kaiyan-api',
      [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
    }
  };

  // 创建导出器
  const traceExporter = process.env.NODE_ENV === 'production'
    ? new OTLPTraceExporter({
        url: process.env.OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
      })
    : new ConsoleSpanExporter();

  // 创建指标导出器
  const metricExporter = process.env.NODE_ENV === 'production'
    ? new OTLPMetricExporter({
        url: process.env.OTLP_ENDPOINT || 'http://localhost:4318/v1/metrics',
      })
    : undefined;

  // 创建指标读取器
  const metricReader = metricExporter ? new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: 10000,
  }) : undefined;

  // 创建SDK
  const sdk = new NodeSDK({
    resource: resource as any,
    traceExporter,
    metricReader: metricReader,
    instrumentations: [
      new HttpInstrumentation(),
      new ExpressInstrumentation(),
      new PgInstrumentation({
        enhancedDatabaseReporting: true,
      }),
      new RedisInstrumentation(),
    ],
  });

  // 初始化SDK
  sdk.start();

  // 处理进程退出
  process.on('SIGTERM', () => {
    sdk.shutdown()
      .then(() => console.log('OpenTelemetry SDK shutdown'))
      .catch((error) => console.error('Error shutting down OpenTelemetry SDK', error))
      .finally(() => process.exit(0));
  });

  console.log('OpenTelemetry SDK initialized');
  return sdk;
};
