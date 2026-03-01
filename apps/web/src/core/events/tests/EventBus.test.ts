import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('EventBus', () => {
  let eventBus: typeof import('../EventBus').eventBus;

  beforeEach(async () => {
    vi.resetModules();
    const module = await import('../EventBus');
    eventBus = module.eventBus;
    eventBus.clear();
  });

  describe('on', () => {
    it('should register event listener', () => {
      const callback = vi.fn();
      
      eventBus.on('project:created', callback);
      eventBus.emit('project:created', { projectId: '1', name: 'Test' });
      
      expect(callback).toHaveBeenCalledWith({ projectId: '1', name: 'Test' });
    });

    it('should return unsubscribe function', () => {
      const callback = vi.fn();
      
      const unsubscribe = eventBus.on('project:created', callback);
      unsubscribe();
      eventBus.emit('project:created', { projectId: '1', name: 'Test' });
      
      expect(callback).not.toHaveBeenCalled();
    });

    it('should support multiple listeners', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      eventBus.on('project:created', callback1);
      eventBus.on('project:created', callback2);
      eventBus.emit('project:created', { projectId: '1', name: 'Test' });
      
      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });
  });

  describe('once', () => {
    it('should call listener only once', () => {
      const callback = vi.fn();
      
      eventBus.once('project:created', callback);
      eventBus.emit('project:created', { projectId: '1', name: 'Test1' });
      eventBus.emit('project:created', { projectId: '2', name: 'Test2' });
      
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith({ projectId: '1', name: 'Test1' });
    });
  });

  describe('off', () => {
    it('should remove specific listener', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      eventBus.on('project:created', callback1);
      eventBus.on('project:created', callback2);
      eventBus.off('project:created', callback1);
      eventBus.emit('project:created', { projectId: '1', name: 'Test' });
      
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });
  });

  describe('emit', () => {
    it('should emit event with data', () => {
      const callback = vi.fn();
      
      eventBus.on('auth:login', callback);
      eventBus.emit('auth:login', { userId: 'user-1' });
      
      expect(callback).toHaveBeenCalledWith({ userId: 'user-1' });
    });

    it('should not throw if no listeners', () => {
      expect(() => {
        eventBus.emit('project:created', { projectId: '1', name: 'Test' });
      }).not.toThrow();
    });
  });

  describe('clear', () => {
    it('should clear all listeners', () => {
      const callback = vi.fn();
      
      eventBus.on('project:created', callback);
      eventBus.on('project:updated', callback);
      eventBus.clear();
      eventBus.emit('project:created', { projectId: '1', name: 'Test' });
      eventBus.emit('project:updated', { projectId: '1' });
      
      expect(callback).not.toHaveBeenCalled();
    });

    it('should clear specific event listeners', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      eventBus.on('project:created', callback1);
      eventBus.on('project:updated', callback2);
      eventBus.clear('project:created');
      eventBus.emit('project:created', { projectId: '1', name: 'Test' });
      eventBus.emit('project:updated', { projectId: '1' });
      
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });
  });

  describe('listenerCount', () => {
    it('should return correct count', () => {
      const callback = vi.fn();
      
      expect(eventBus.listenerCount('project:created')).toBe(0);
      
      eventBus.on('project:created', callback);
      expect(eventBus.listenerCount('project:created')).toBe(1);
      
      eventBus.once('project:created', callback);
      expect(eventBus.listenerCount('project:created')).toBe(2);
    });
  });
});
