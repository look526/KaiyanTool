import { useEffect, useRef, useCallback } from 'react';
import { useWorkspaceStore } from '../../../store/workspace-store';
import { apiClient } from '../../../lib/api';

export function useAutoSave() {
  const { workspaceId, nodes, edges, setIsSaving, setLastSavedAt, setError } = useWorkspaceStore();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const save = useCallback(async () => {
    if (!workspaceId) return;
    setIsSaving(true);
    setError(null);
    try {
      await apiClient.put(`/workspace/${workspaceId}`, {
        snapshot: JSON.stringify({ nodes, edges }),
      });
      setLastSavedAt(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
      setError('保存失败');
    } finally {
      setIsSaving(false);
    }
  }, [workspaceId, nodes, edges, setIsSaving, setLastSavedAt, setError]);

  useEffect(() => {
    if (!workspaceId) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(save, 500);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [nodes, edges, workspaceId, save]);

  return { save };
}
