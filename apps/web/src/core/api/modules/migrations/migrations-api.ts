import { httpClient } from '../../client/http-client';

export interface Migration {
  id: string;
  type: string;
  status: string;
  data?: unknown;
  createdAt?: string;
}

export interface MigrateFromCinegenRequest {
  data: unknown;
}

export interface MigrateFromJianYingRequest {
  data: unknown;
}

export const migrationsApi = {
  async getMigrations(): Promise<Migration[]> {
    return httpClient.get<Migration[]>('/migration');
  },

  async migrateFromCinegen(data: unknown): Promise<unknown> {
    return httpClient.post<unknown>('/migration/cinegen', data);
  },

  async migrateFromJianYing(data: unknown): Promise<unknown> {
    return httpClient.post<unknown>('/migration/jianying', data);
  },
};
