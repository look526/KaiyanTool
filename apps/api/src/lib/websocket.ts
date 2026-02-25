import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import logger from '../lib/logger';

let io: SocketIOServer | null = null;

interface AuthenticatedSocket extends Socket {
  userId?: string;
  projectId?: string;
}

export function initializeWebSocket(httpServer: HttpServer) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    path: '/socket.io',
  });

  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as { userId: string };
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info('WebSocket client connected', { socketId: socket.id, userId: socket.userId });

    socket.on('join-project', (projectId: string) => {
      socket.projectId = projectId;
      socket.join(`project:${projectId}`);
      logger.info('Client joined project room', { socketId: socket.id, projectId });
    });

    socket.on('leave-project', (projectId: string) => {
      socket.leave(`project:${projectId}`);
      logger.info('Client left project room', { socketId: socket.id, projectId });
    });

    socket.on('disconnect', () => {
      logger.info('WebSocket client disconnected', { socketId: socket.id });
    });
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('WebSocket not initialized');
  }
  return io;
}

export function emitToProject(projectId: string, event: string, data: any) {
  if (io) {
    io.to(`project:${projectId}`).emit(event, data);
  }
}

export function emitToUser(userId: string, event: string, data: any) {
  if (io) {
    const sockets = Array.from(io.sockets.sockets.values()) as AuthenticatedSocket[];
    sockets
      .filter(s => s.userId === userId)
      .forEach(s => s.emit(event, data));
  }
}

export function emitProgress(projectId: string, taskId: string, progress: number, message: string, data?: any) {
  emitToProject(projectId, 'task-progress', {
    taskId,
    progress,
    message,
    timestamp: new Date().toISOString(),
    data,
  });
}

export function emitTaskComplete(projectId: string, taskId: string, result: any) {
  emitToProject(projectId, 'task-complete', {
    taskId,
    status: 'completed',
    result,
    timestamp: new Date().toISOString(),
  });
}

export function emitTaskError(projectId: string, taskId: string, error: string) {
  emitToProject(projectId, 'task-error', {
    taskId,
    status: 'error',
    error,
    timestamp: new Date().toISOString(),
  });
}

export function emitStreamChunk(projectId: string, taskId: string, chunk: string, done: boolean = false) {
  emitToProject(projectId, 'stream-chunk', {
    taskId,
    chunk,
    done,
    timestamp: new Date().toISOString(),
  });
}
