import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';
import { queryKeys } from '../../../core/api/client';
import type { Scene } from '../../../lib/api';

export function useScenes(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.scenes.all(projectId || ''),
    queryFn: () => apiClient.getScenes(projectId!),
    enabled: !!projectId,
  });
}

export function useScene(id: string | undefined, projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.scenes.detail(id || ''),
    queryFn: async () => {
      const scenes = await apiClient.getScenes(projectId || '');
      return scenes.find((s: Scene) => s.id === id);
    },
    enabled: !!id && !!projectId,
  });
}

export function useCreateScene() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: Partial<Scene> }) =>
      apiClient.createScene(projectId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scenes.all(variables.projectId) });
    },
  });
}

export function useUpdateScene() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, projectId }: { id: string; data: Partial<Scene>; projectId: string }) =>
      apiClient.updateScene(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scenes.all(variables.projectId) });
    },
  });
}

export function useDeleteScene() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, projectId }: { id: string; projectId: string }) => apiClient.deleteScene(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scenes.all(variables.projectId) });
    },
  });
}

export function useOptimizeScene() {
  return useMutation({
    mutationFn: (data: { sceneContent: string; location: string; time: string; direction?: string }) =>
      apiClient.optimizeScene(data),
  });
}
