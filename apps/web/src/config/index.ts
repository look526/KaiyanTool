interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
    retryDelay: number;
  };
  cache: {
    enabled: boolean;
    defaultTTL: number;
  };
  ui: {
    successMessageDuration: number;
    errorMessageDuration: number;
    pollingInterval: number;
    videoMergePollingInterval: number;
    workflowPollingInterval: number;
  };
  app: {
    name: string;
    version: string;
    environment: string;
  };
}

const config: AppConfig = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
    timeout: 30000,
    retries: 3,
    retryDelay: 1000,
  },
  cache: {
    enabled: true,
    defaultTTL: 60000,
  },
  ui: {
    successMessageDuration: 3000,
    errorMessageDuration: 5000,
    pollingInterval: 2000,
    videoMergePollingInterval: 3000,
    workflowPollingInterval: 2000,
  },
  app: {
    name: import.meta.env.VITE_APP_NAME || '开演AI',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: import.meta.env.VITE_NODE_ENV || 'development',
  },
};

export function getConfig(): AppConfig {
  return config;
}

export const apiConfig = config.api;
export const cacheConfig = config.cache;
export const uiConfig = config.ui;
export const appConfig = config.app;

export default config;
