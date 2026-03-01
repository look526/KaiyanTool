import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';
import { queryKeys } from '../../../core/api/client';
import type { Project, CreateProjectData, ProjectsResponse } from '../../../lib/api';

interface UseProjectsOptions {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  status?: string;
}

export function useProjects(options: UseProjectsOptions = {}) {
  return useQuery({
    queryKey: queryKeys.projects.list(options),
    queryFn: () => apiClient.getProjects(options),
    staleTime: 2 * 60 * 1000,
  });
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.projects.detail(id || ''),
    queryFn: () => apiClient.getProject(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useProjectMembers(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.projects.members(projectId || ''),
    queryFn: () => apiClient.getProjectMembers(projectId!),
    enabled: !!projectId,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectData) => apiClient.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateProjectData> }) =>
      apiClient.updateProject(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}

export function useExportProject() {
  return useMutation({
    mutationFn: (projectId: string) => apiClient.exportProject(projectId),
  });
}

export function useExportProjectVideos() {
  return useMutation({
    mutationFn: (projectId: string) => apiClient.exportProjectVideos(projectId),
  });
}

export function useExportProjectBundle() {
  return useMutation({
    mutationFn: (projectId: string) => apiClient.exportProjectBundle(projectId),
  });
}
