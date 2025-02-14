class WebSocketService {
  private static instance: WebSocketService;
  private ws: WebSocket | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private callbacks: Set<(data: any) => void> = new Set();
  private connectionAttempts: number = 0;
  private readonly maxReconnectAttempts: number = 5;
  private subscribers: ((data: any) => void)[] = [];

  private constructor() {
    this.connect();
  }

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  private connect(): void {
    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:3001';
    console.log('Attempting to connect to WebSocket at:', wsUrl);
    
    try {
      console.log('Creating new WebSocket connection...');
      this.ws = new WebSocket(wsUrl);

      // Add connection timeout before the connection is established
      const connectionTimeout = setTimeout(() => {
        if (this.ws?.readyState !== WebSocket.OPEN) {
          console.error('WebSocket connection timeout');
          this.ws?.close();
        }
      }, 5000);

      this.ws.onopen = () => {
        console.log('WebSocket connection opened successfully');
        this.connectionAttempts = 0;
        clearTimeout(connectionTimeout);
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket connection error:', error);
        console.error('WebSocket readyState:', this.ws?.readyState);
        console.error('Connection attempt:', this.connectionAttempts + 1);
        console.error('Trying to connect to:', wsUrl);
        console.error('Current WebSocket state:', this.ws?.readyState);
      };

      this.ws.onmessage = (event) => {
        try {
          console.log('Received message:', event.data);
          const data = JSON.parse(event.data);
          if (data.type === 'parkingUpdate') {
            this.callbacks.forEach(callback => callback(data.data));
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket closed with code:', event.code);
        this.ws = null;
        clearTimeout(connectionTimeout);
        
        if (this.connectionAttempts < this.maxReconnectAttempts) {
          console.log(`WebSocket connection closed. Attempting to reconnect (${this.connectionAttempts + 1}/${this.maxReconnectAttempts})...`);
          const reconnectDelay = Math.min(1000 * Math.pow(2, this.connectionAttempts), 10000);
          this.reconnectTimeout = setTimeout(() => this.connect(), reconnectDelay);
          this.connectionAttempts++;
        } else {
          console.error('Maximum reconnection attempts reached. Please check if the server is running.');
        }
      };

    } catch (error) {
      console.error('Error creating WebSocket:', error);
    }
  }

  subscribe(callback: (data: any) => void): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    if (this.ws) {
      this.ws.close();
    }
  }

  public reconnect() {
    if (this.ws) {
      this.ws.close();
    }
    this.connect();
  }
}

export default WebSocketService; 