import { httpClient } from '../../client/http-client';
import type { Project } from '../../../../types';
import type { PaginationParams } from '../../types/common';

export interface CreateProjectRequest {
  name: string;
  description?: string;
  type?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  type?: string;
  status?: string;
}

export interface ProjectListResponse {
  items: Project[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ProjectMember {
  id: string;
  userId: string;
  role: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface AddMemberRequest {
  userId: string;
  role: string;
}

export const projectsApi = {
  async getProjects(params?: PaginationParams): Promise<ProjectListResponse> {
    const queryParams: Record<string, string | number | boolean | undefined> = {};
    if (params?.page !== undefined) queryParams.page = params.page;
    if (params?.limit !== undefined) queryParams.limit = params.limit;
    if (params?.sortBy !== undefined) queryParams.sortBy = params.sortBy;
    if (params?.sortOrder !== undefined) queryParams.sortOrder = params.sortOrder;
    return httpClient.get<ProjectListResponse>('/projects', queryParams);
  },

  async getProject(id: string): Promise<Project> {
    return httpClient.get<Project>(`/projects/${id}`);
  },

  async createProject(data: CreateProjectRequest): Promise<Project> {
    return httpClient.post<Project>('/projects', data);
  },

  async updateProject(id: string, data: UpdateProjectRequest): Promise<Project> {
    return httpClient.put<Project>(`/projects/${id}`, data);
  },

  async deleteProject(id: string): Promise<void> {
    return httpClient.delete<void>(`/projects/${id}`);
  },

  async getProjectMembers(projectId: string): Promise<ProjectMember[]> {
    return httpClient.get<ProjectMember[]>(`/projects/${projectId}/members`);
  },

  async addProjectMember(projectId: string, data: AddMemberRequest): Promise<ProjectMember> {
    return httpClient.post<ProjectMember>(`/projects/${projectId}/members`, data);
  },

  async removeProjectMember(projectId: string, userId: string): Promise<void> {
    return httpClient.delete<void>(`/projects/${projectId}/members/${userId}`);
  },

  async updateProjectMemberRole(projectId: string, userId: string, role: string): Promise<ProjectMember> {
    return httpClient.put<ProjectMember>(`/projects/${projectId}/members/${userId}`, { role });
  },

  async saveStoryline(projectId: string, storyline: unknown): Promise<{ id: string }> {
    return httpClient.post<{ id: string }>(`/projects/${projectId}/storyline`, storyline);
  },
};
