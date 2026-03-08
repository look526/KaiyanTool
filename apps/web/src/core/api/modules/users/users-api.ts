import { httpClient } from '../../client/http-client';
import type { User } from '../../../../types';

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  avatar?: string;
}

export interface UserSearchResult {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export const usersApi = {
  async searchUsers(query: string): Promise<User[]> {
    return httpClient.get<User[]>(`/users/search?q=${encodeURIComponent(query)}`);
  },

  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    return httpClient.put<User>('/users/profile', data);
  },

  async uploadAvatar(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/users/avatar`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    return response.json();
  },
};
