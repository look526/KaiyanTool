export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: string;
}

class WebSocketManagerClass {
  private ws: WebSocket | null = null;
  private url: string = '';
  private status: WebSocketStatus = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private heartbeatInterval = 30000;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private messageQueue: WebSocketMessage[] = [];
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private statusListeners: Set<(status: WebSocketStatus) => void> = new Set();

  connect(url?: string): Promise<void> {
    if (url) {
      this.url = url;
    }

    if (!this.url) {
      console.warn('WebSocket URL not provided');
      return Promise.reject(new Error('WebSocket URL not provided'));
    }

    return new Promise((resolve, reject) => {
      try {
        this.status = 'connecting';
        this.notifyStatusChange();
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('[WebSocket] Connected');
          this.status = 'connected';
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.flushMessageQueue();
          this.notifyStatusChange();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('[WebSocket] Failed to parse message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('[WebSocket] Disconnected:', event.code, event.reason);
          this.status = 'disconnected';
          this.stopHeartbeat();
          this.notifyStatusChange();
          this.scheduleReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('[WebSocket] Error:', error);
          this.status = 'error';
          this.notifyStatusChange();
          reject(error);
        };
      } catch (error) {
        this.status = 'error';
        this.notifyStatusChange();
        reject(error);
      }
    });
  }

  disconnect(): void {
    this.stopHeartbeat();
    this.clearReconnectTimer();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    
    this.status = 'disconnected';
    this.notifyStatusChange();
  }

  send(type: string, payload: any): void {
    const message: WebSocketMessage = {
      type,
      payload,
      timestamp: new Date().toISOString(),
    };

    if (this.status === 'connected' && this.ws) {
      this.ws.send(JSON.stringify(message));
    } else {
      this.messageQueue.push(message);
    }
  }

  subscribe(event: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  onStatusChange(callback: (status: WebSocketStatus) => void): () => void {
    this.statusListeners.add(callback);
    callback(this.status);
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  getStatus(): WebSocketStatus {
    return this.status;
  }

  isConnected(): boolean {
    return this.status === 'connected';
  }

  private handleMessage(message: WebSocketMessage): void {
    const { type, payload } = message;
    const callbacks = this.listeners.get(type);
    callbacks?.forEach((cb) => cb(payload));
  }

  private notifyStatusChange(): void {
    this.statusListeners.forEach((cb) => cb(this.status));
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      this.send('ping', {});
    }, this.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('[WebSocket] Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectInterval * Math.min(this.reconnectAttempts, 5);
    
    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.status === 'connected') {
      const message = this.messageQueue.shift();
      if (message && this.ws) {
        this.ws.send(JSON.stringify(message));
      }
    }
  }
}

export const webSocketManager = new WebSocketManagerClass();
