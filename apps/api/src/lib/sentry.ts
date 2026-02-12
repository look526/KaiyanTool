import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

export function initSentry() {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.Express({ app: require('express')() }),
        new ProfilingIntegration(),
      ],
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      beforeSend(event, hint) {
        if (event.exception) {
          const error = hint.originalException as Error;
          if (error?.message) {
            event.tags = {
              ...event.tags,
              errorType: error.constructor.name,
            };
          }
        }
        return event;
      },
    });
  }
}

let requestHandler: any = null;
let tracingHandler: any = null;
let errorHandler: any = null;

export function sentryRequestHandler(req: any, res: any, next: any) {
  if (!requestHandler) {
    try {
      requestHandler = (Sentry as any).Handlers?.requestHandler?.();
    } catch (e) {
      console.error('Failed to init Sentry request handler:', e);
    }
  }
  if (requestHandler) {
    return requestHandler(req, res, next);
  }
  return next();
}

export function sentryTracingHandler(req: any, res: any, next: any) {
  if (!tracingHandler) {
    try {
      tracingHandler = (Sentry as any).Handlers?.tracingHandler?.();
    } catch (e) {
      console.error('Failed to init Sentry tracing handler:', e);
    }
  }
  if (tracingHandler) {
    return tracingHandler(req, res, next);
  }
  return next();
}

export function sentryErrorHandler(err: Error, req: any, res: any, next: any) {
  if (!errorHandler) {
    try {
      errorHandler = (Sentry as any).Handlers?.errorHandler?.();
    } catch (e) {
      console.error('Failed to init Sentry error handler:', e);
    }
  }
  if (errorHandler) {
    return errorHandler(err, req, res, next);
  }
  return next();
}
