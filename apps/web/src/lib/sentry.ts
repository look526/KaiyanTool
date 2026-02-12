import * as Sentry from '@sentry/react';

interface ImportMetaEnv {
  VITE_SENTRY_DSN?: string;
  VITE_NODE_ENV?: string;
  [key: string]: unknown;
}

export function initSentry() {
  if ((import.meta.env as ImportMetaEnv).VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: (import.meta.env as ImportMetaEnv).VITE_SENTRY_DSN,
      environment: (import.meta.env as ImportMetaEnv).VITE_NODE_ENV || 'development',
      tracesSampleRate: (import.meta.env as ImportMetaEnv).VITE_NODE_ENV === 'production' ? 0.1 : 1.0,
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

export function captureException(error: Error, context?: Record<string, unknown>) {
  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setContext(key, value as Record<string, unknown>);
      });
    }
    Sentry.captureException(error);
  });
}

export function captureMessage(message: string, level: 'debug' | 'info' | 'warning' | 'error' = 'info') {
  Sentry.captureMessage(message, level);
}

export function setUser(user: {
  id: string;
  email?: string;
  name?: string;
}) {
  Sentry.setUser(user);
}

export function setTag(key: string, value: string) {
  Sentry.setTag(key, value);
}

export function setContext(name: string, context: Record<string, unknown>) {
  Sentry.setContext(name, context);
}
