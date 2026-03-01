type EventCallback<T = any> = (data: T) => void;
type EventUnsubscribe = () => void;

interface EventBusEvents {
  'auth:login': { userId: string };
  'auth:logout': void;
  'auth:session-expired': void;
  'project:created': { projectId: string; name: string };
  'project:updated': { projectId: string };
  'project:deleted': { projectId: string };
  'script:saved': { projectId: string; content: string };
  'script:parsed': { projectId: string; scenes: number };
  'ai:generation-start': { type: string; model: string };
  'ai:generation-complete': { type: string; result: any };
  'ai:generation-error': { type: string; error: string };
  'notification:show': { type: 'success' | 'error' | 'warning' | 'info'; message: string };
  'ui:theme-changed': { theme: 'light' | 'dark' };
}

class EventBusClass {
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private onceListeners: Map<string, Set<EventCallback>> = new Map();

  on<K extends keyof EventBusEvents>(
    event: K,
    callback: EventCallback<EventBusEvents[K]>
  ): EventUnsubscribe {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => this.off(event, callback);
  }

  once<K extends keyof EventBusEvents>(
    event: K,
    callback: EventCallback<EventBusEvents[K]>
  ): EventUnsubscribe {
    if (!this.onceListeners.has(event)) {
      this.onceListeners.set(event, new Set());
    }
    this.onceListeners.get(event)!.add(callback);

    return () => this.onceListeners.get(event)?.delete(callback);
  }

  off<K extends keyof EventBusEvents>(
    event: K,
    callback: EventCallback<EventBusEvents[K]>
  ): void {
    this.listeners.get(event)?.delete(callback);
    this.onceListeners.get(event)?.delete(callback);
  }

  emit<K extends keyof EventBusEvents>(
    event: K,
    data: EventBusEvents[K]
  ): void {
    const callbacks = this.listeners.get(event);
    callbacks?.forEach((cb) => cb(data));

    const onceCallbacks = this.onceListeners.get(event);
    if (onceCallbacks) {
      onceCallbacks.forEach((cb) => cb(data));
      onceCallbacks.clear();
    }
  }

  clear(event?: string): void {
    if (event) {
      this.listeners.delete(event);
      this.onceListeners.delete(event);
    } else {
      this.listeners.clear();
      this.onceListeners.clear();
    }
  }

  listenerCount(event: string): number {
    const regular = this.listeners.get(event)?.size || 0;
    const once = this.onceListeners.get(event)?.size || 0;
    return regular + once;
  }
}

export const eventBus = new EventBusClass();

export function useEvent<K extends keyof EventBusEvents>(
  event: K,
  callback: EventCallback<EventBusEvents[K]>,
  deps: any[] = []
): void {
  const { useEffect } = require('react');
  
  useEffect(() => {
    const unsubscribe = eventBus.on(event, callback);
    return unsubscribe;
  }, [event, ...deps]);
}

export type { EventBusEvents };
