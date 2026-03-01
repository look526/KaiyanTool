import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';
import { queryKeys } from '../../../core/api/client';

export function useScript(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.scripts.detail(projectId || ''),
    queryFn: async () => {
      const scripts = await apiClient.getProjectScripts(projectId!);
      return scripts[0] || null;
    },
    enabled: !!projectId,
  });
}

export function useProjectScripts(projectId: string | undefined) {
  return useQuery({
    queryKey: [...queryKeys.scripts.all, projectId],
    queryFn: () => apiClient.getProjectScripts(projectId!),
    enabled: !!projectId,
  });
}

export function useScriptById(scriptId: string | undefined) {
  return useQuery({
    queryKey: [...queryKeys.scripts.all, 'detail', scriptId],
    queryFn: () => apiClient.getScript(scriptId!),
    enabled: !!scriptId,
  });
}

export function useParseScript() {
  return useMutation({
    mutationFn: ({ content, model }: { content: string; model?: string }) =>
      apiClient.parseScript(content, model),
  });
}

export function useParseScriptWithAI() {
  return useMutation({
    mutationFn: ({ content, model }: { content: string; model?: string }) =>
      apiClient.parseScriptWithAI(content, model),
  });
}

export function useSaveScript() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, title, content }: { projectId: string; title: string; content: string }) =>
      apiClient.saveScript(projectId, title, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scripts.detail(variables.projectId) });
    },
  });
}

export function useContinueScript() {
  return useMutation({
    mutationFn: ({ content, context }: { content: string; context?: string }) =>
      apiClient.continueScript(content, context),
  });
}

export function useRewriteScript() {
  return useMutation({
    mutationFn: ({ content, instruction }: { content: string; instruction?: string }) =>
      apiClient.rewriteScript(content, instruction),
  });
}

export function useGenerateShotsFromScript() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, scriptContent, visualStyle }: { projectId: string; scriptContent: string; visualStyle?: string }) =>
      apiClient.generateShotsFromScript(projectId, scriptContent, visualStyle),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shots.all(variables.projectId) });
    },
  });
}
