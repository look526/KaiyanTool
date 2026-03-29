import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseWebSocketOptions {
  projectId?: string;
  onProgress?: (data: { taskId: string; progress: number; message: string; data?: any }) => void;
  onComplete?: (data: { taskId: string; result: any }) => void;
  onError?: (data: { taskId: string; error: string }) => void;
  onStreamChunk?: (data: { taskId: string; chunk: string; done: boolean }) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { projectId, onProgress, onComplete, onError, onStreamChunk } = options;
  const [token, setToken] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
  }, []);

  useEffect(() => {
    if (!token) return;

    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    socketRef.current = io(socketUrl, {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('WebSocket connected');
      if (projectId) {
        socket.emit('join-project', projectId);
      }
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    socket.on('connect_error', (error: Error) => {
      console.error('WebSocket connection error:', error);
    });

    if (onProgress) {
      socket.on('task-progress', onProgress);
    }

    if (onComplete) {
      socket.on('task-complete', onComplete);
    }

    if (onError) {
      socket.on('task-error', onError);
    }

    if (onStreamChunk) {
      socket.on('stream-chunk', onStreamChunk);
    }

    return () => {
      if (projectId) {
        socket.emit('leave-project', projectId);
      }
      socket.disconnect();
    };
  }, [token, projectId]);

  const joinProject = useCallback((newProjectId: string) => {
    if (socketRef.current && socketRef.current.connected) {
      if (projectId) {
        socketRef.current.emit('leave-project', projectId);
      }
      socketRef.current.emit('join-project', newProjectId);
    }
  }, [projectId]);

  const leaveProject = useCallback((leaveProjectId: string) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('leave-project', leaveProjectId);
    }
  }, []);

  return {
    socket: socketRef.current,
    joinProject,
    leaveProject,
    isConnected: socketRef.current?.connected || false,
  };
}
