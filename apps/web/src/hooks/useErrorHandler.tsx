import { useCallback } from 'react';
import { useToast } from '../components/ui/Toast';
import { EnhancedToast } from '../components/ui/EnhancedToast';
import { categorizeError, ErrorInfo } from '../utils/errorHandling';

interface ErrorHandlerOptions {
  showToast?: boolean;
  showEnhanced?: boolean;
  autoRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  onError?: (error: ErrorInfo) => void;
}

interface ErrorHandlerReturn {
  handleError: (error: any) => void;
  handleAsyncError: (promise: Promise<any>, options?: ErrorHandlerOptions) => Promise<any>;
  withErrorHandling: <T>(fn: () => Promise<T>, options?: ErrorHandlerOptions) => Promise<T>;
  wrapComponent: <P extends object>(Component: React.ComponentType<P>, props: P) => JSX.Element;
}

export function useErrorHandler(defaultOptions: ErrorHandlerOptions = {}) {
  const { addToast } = useToast();

  const handleError = useCallback((error: any, options: ErrorHandlerOptions = {}) => {
    const mergedOptions = { ...defaultOptions, ...options };
    const errorInfo = categorizeError(error);

    if (mergedOptions.onError) {
      mergedOptions.onError(errorInfo);
    }

    if (mergedOptions.showEnhanced) {
      const container = document.createElement('div');
      document.body.appendChild(container);
      
      const handleRetry = mergedOptions.autoRetry ? async () => {
        document.body.removeChild(container);
        await handleAsyncError(error, mergedOptions);
      } : undefined;

      const handleDismiss = () => {
        document.body.removeChild(container);
      };

      import('react-dom/client').then(({ createRoot }) => {
        const root = createRoot(container);
        root.render(
          <EnhancedToast
            error={errorInfo}
            onClose={handleDismiss}
            onRetry={handleRetry}
            onDismiss={handleDismiss}
          />
        );
      });
    } else if (mergedOptions.showToast !== false) {
      addToast({
        type: errorInfo.severity === 'critical' ? 'error' : errorInfo.severity === 'high' ? 'error' : errorInfo.severity === 'medium' ? 'warning' : 'info',
        title: errorInfo.title,
        message: errorInfo.message,
      });
    }

    console.error('Error caught:', errorInfo);
  }, [addToast, defaultOptions]);

  const handleAsyncError = useCallback(async <T,>(promise: Promise<T>, options: ErrorHandlerOptions = {}): Promise<T | null> => {
    const mergedOptions = { ...defaultOptions, ...options };
    let retries = 0;
    const maxRetries = mergedOptions.maxRetries || 3;
    const retryDelay = mergedOptions.retryDelay || 1000;

    while (retries < maxRetries) {
      try {
        const result = await promise;
        return result;
      } catch (error: any) {
        const errorInfo = categorizeError(error);
        
        if (errorInfo.retryable && retries < maxRetries - 1) {
          retries++;
          console.warn(`Retrying (${retries}/${maxRetries}):`, errorInfo);
          await new Promise(resolve => setTimeout(resolve, retryDelay * retries));
          continue;
        }
        
        handleError(error, mergedOptions);
        return null;
      }
    }
    return null;
  }, [handleError, defaultOptions]);

  const withErrorHandling = useCallback(<T,>(fn: (...args: any[]) => Promise<T>, options: ErrorHandlerOptions = {}) => {
    return async (...args: any[]) => {
      try {
        return await fn(...args);
      } catch (error: any) {
        handleError(error, options);
        throw error;
      }
    };
  }, [handleError, defaultOptions]);

  const wrapComponent = useCallback(<P extends object>(
    Component: React.ComponentType<P>,
    props: P
  ): JSX.Element => {
    return (
      <Component
        {...props}
        onError={(error: Error, errorInfo: any) => {
          handleError(error, defaultOptions);
        }}
      />
    );
  }, [handleError, defaultOptions]);

  return {
    handleError,
    handleAsyncError,
    withErrorHandling,
    wrapComponent,
  };
}

export type ErrorHandlerContextValue = ErrorHandlerReturn;

export type { ErrorHandlerReturn };
