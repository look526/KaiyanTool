import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';
import { queryKeys } from '../../../core/api/client';
import type { Character } from '../../../lib/api';

export function useCharacters(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.characters.all(projectId || ''),
    queryFn: () => apiClient.getCharacters(projectId!),
    enabled: !!projectId,
  });
}

export function useCharacter(id: string | undefined, projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.characters.detail(id || ''),
    queryFn: async () => {
      const characters = await apiClient.getCharacters(projectId || '');
      return characters.find((c: Character) => c.id === id);
    },
    enabled: !!id && !!projectId,
  });
}

export function useCreateCharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: Partial<Character> }) =>
      apiClient.createCharacter(projectId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.characters.all(variables.projectId) });
    },
  });
}

export function useUpdateCharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, projectId }: { id: string; data: Partial<Character>; projectId: string }) =>
      apiClient.updateCharacter(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.characters.all(variables.projectId) });
    },
  });
}

export function useDeleteCharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, projectId }: { id: string; projectId: string }) => apiClient.deleteCharacter(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.characters.all(variables.projectId) });
    },
  });
}

export function useCreateWardrobe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ characterId, data }: { characterId: string; data: { name: string; description?: string; images?: string[] } }) =>
      apiClient.createWardrobe(characterId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.characters.all('') });
    },
  });
}

export function useDeleteWardrobe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (wardrobeId: string) => apiClient.deleteWardrobe(wardrobeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.characters.all('') });
    },
  });
}
