import { WebSocket, WebSocketServer } from 'ws';
import { PrismaClient } from '@prisma/client';

class WebSocketService {
  private static instance: WebSocketService;
  private wss: WebSocketServer;
  private prisma: PrismaClient;
  private clients: Set<WebSocket>;
  private updateInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.wss = new WebSocketServer({ 
      noServer: true,
      clientTracking: true,
    });
    this.prisma = new PrismaClient();
    this.clients = new Set();
    this.initialize();
    console.log('WebSocket service initialized and ready for connections');
  }

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  private initialize(): void {
    this.wss.on('connection', (ws: WebSocket, request: any) => {
      console.log('New client connected from:', request.headers.origin);
      this.clients.add(ws);

      // Send initial parking data
      this.sendParkingUpdate(ws);
      console.log('---- Parking data sent to client');

      ws.on('close', () => {
        console.log('Client disconnected');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

      // Add ping/pong to keep connection alive
      ws.on('pong', () => {
        console.log('Received pong from client');
      });

      // Send an immediate ping to verify connection
      ws.ping();
    });

    // Start periodic updates
    this.startPeriodicUpdates();

    // Add connection heartbeat
    setInterval(() => {
      this.clients.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.ping();
        }
      });
    }, 30000);
  }

  private async sendParkingUpdate(ws: WebSocket): Promise<void> {
    try {
      const parkingSpots = await this.prisma.garage.findMany();
      const message = JSON.stringify({
        type: 'parkingUpdate',
        data: parkingSpots
      });
      
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    } catch (error) {
      console.error('Error fetching parking data:', error);
    }
  }

  private async broadcastParkingUpdate(): Promise<void> {
    try {
      const parkingSpots = await this.prisma.garage.findMany();
      const message = JSON.stringify({
        type: 'parkingUpdate',
        data: parkingSpots
      });

      this.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    } catch (error) {
      console.error('Error broadcasting parking data:', error);
    }
  }

  private startPeriodicUpdates(): void {
    // Update every 5 seconds
    this.updateInterval = setInterval(() => {
      this.broadcastParkingUpdate();
    }, 5000);
  }

  public handleUpgrade(request: any, socket: any, head: any): void {
    try {
      console.log('Handling WebSocket upgrade request from:', request.headers.origin);
      console.log('WebSocket path:', request.url);
      
      this.wss.handleUpgrade(request, socket, head, (ws) => {
        console.log('WebSocket connection upgraded successfully');
        this.wss.emit('connection', ws, request);
      });
    } catch (error) {
      console.error('Error during WebSocket upgrade:', error);
      socket.destroy();
    }
  }

  public shutdown(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    this.wss.close();
    this.prisma.$disconnect();
  }
}

export default WebSocketService; 