import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';
import { queryKeys } from '../../../core/api/client';
import type { AIProvider, CreateAIProviderData, UpdateAIProviderData } from '../../../lib/api';

export function useAIProviders() {
  return useQuery({
    queryKey: queryKeys.aiProviders.all,
    queryFn: () => apiClient.getAIProviders(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAIProvider(id: string | undefined) {
  return useQuery({
    queryKey: [...queryKeys.aiProviders.all, id],
    queryFn: () => apiClient.getAIProvider(id!),
    enabled: !!id,
  });
}

export function useAIProviderModels(providerId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.aiProviders.models(providerId || ''),
    queryFn: async () => {
      const provider = await apiClient.getAIProvider(providerId!);
      return provider.models || [];
    },
    enabled: !!providerId,
  });
}

export function useCreateAIProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAIProviderData) => apiClient.createAIProvider(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.aiProviders.all });
    },
  });
}

export function useUpdateAIProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAIProviderData }) =>
      apiClient.updateAIProvider(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.aiProviders.all });
    },
  });
}

export function useDeleteAIProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteAIProvider(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.aiProviders.all });
    },
  });
}

export function useTestAIProvider() {
  return useMutation({
    mutationFn: (id: string) => apiClient.testAIProvider(id),
  });
}

export function useTestAIProviderModel() {
  return useMutation({
    mutationFn: (modelId: string) => apiClient.testAIProviderModel(modelId),
  });
}

export function useSetAssistantDefaultModel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (modelId: string) => apiClient.setAssistantDefaultModel(modelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.aiProviders.all });
    },
  });
}

export function useCreateAIProviderModel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ providerId, data }: { providerId: string; data: any }) =>
      apiClient.createAIProviderModel(providerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.aiProviders.all });
    },
  });
}

export function useDeleteAIProviderModel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ providerId, modelId }: { providerId: string; modelId: string }) =>
      apiClient.deleteAIProviderModel(providerId, modelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.aiProviders.all });
    },
  });
}
