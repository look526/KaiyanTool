import { httpClient } from '../../client/http-client';
import type { User } from '../../../../types';

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface CurrentUserResponse {
  user: User;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const authApi = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    return httpClient.post<AuthResponse>('/auth/login', data);
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    return httpClient.post<AuthResponse>('/auth/register', data);
  },

  async logout(): Promise<void> {
    return httpClient.post<void>('/auth/logout');
  },

  async getCurrentUser(): Promise<CurrentUserResponse> {
    return httpClient.get<CurrentUserResponse>('/auth/me');
  },

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    return httpClient.post<void>('/auth/change-password', data);
  },

  async logoutAll(): Promise<void> {
    return httpClient.post<void>('/auth/logout-all', {});
  },
};
