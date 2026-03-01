import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { webSocketManager, WebSocketStatus } from './WebSocketManager';
import { eventBus } from '../events/EventBus';
import { queryKeys } from '../api/client';
import { useToast } from '../../components/ui/Toast';

export function useRealtimeSync(projectId?: string) {
  const queryClient = useQueryClient();
  const statusRef = useRef<WebSocketStatus>('disconnected');

  useEffect(() => {
    const handleEntityUpdate = (data: { entityType: string; entityId: string }) => {
      if (!projectId) return;
      
      switch (data.entityType) {
        case 'project':
          queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(data.entityId) });
          break;
        case 'character':
          queryClient.invalidateQueries({ queryKey: queryKeys.characters.all(projectId) });
          break;
        case 'scene':
          queryClient.invalidateQueries({ queryKey: queryKeys.scenes.all(projectId) });
          break;
        case 'shot':
          queryClient.invalidateQueries({ queryKey: queryKeys.shots.all(projectId) });
          break;
        case 'script':
          queryClient.invalidateQueries({ queryKey: queryKeys.scripts.detail(projectId) });
          break;
      }
    };

    const unsubProject = eventBus.on('project:updated', handleEntityUpdate as any);
    
    return () => {
      unsubProject();
    };
  }, [projectId, queryClient]);

  const subscribeToProject = useCallback((projId: string) => {
    webSocketManager.send('subscribe', { projectId: projId });
  }, []);

  const unsubscribeFromProject = useCallback((projId: string) => {
    webSocketManager.send('unsubscribe', { projectId: projId });
  }, []);

  return {
    status: statusRef.current,
    isConnected: webSocketManager.isConnected(),
    subscribeToProject,
    unsubscribeFromProject,
  };
}

export function useGenerationProgress(taskId: string | undefined, projectId?: string) {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    message?: string;
    result?: any;
    error?: string;
  } | null>(null);

  useEffect(() => {
    if (!taskId) return;

    const unsubscribe = webSocketManager.subscribe(`generation:${taskId}`, (data) => {
      setProgress(data);
      
      if (data.status === 'completed' && projectId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.assets.all(projectId) });
      }
    });

    return unsubscribe;
  }, [taskId, projectId, queryClient]);

  return progress;
}

export function useRealtimeNotifications() {
  const { addToast } = useToast();

  useEffect(() => {
    const unsubscribe = webSocketManager.subscribe('notification', (data) => {
      addToast({
        type: data.type || 'info',
        title: data.title,
        message: data.message,
      });
    });

    return unsubscribe;
  }, [addToast]);
}
