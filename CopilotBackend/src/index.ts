import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bodyParser from 'body-parser';
import { app, server } from './app';
import WebSocketService from './services/websocketService';

const prisma = new PrismaClient();

app.use(cors());
app.use(bodyParser.json());

// Initialize WebSocket service before starting the server
const wsService = WebSocketService.getInstance();

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log('----------------------------------------');
  console.log(`HTTP Server is running on port ${PORT}`);
  console.log(`WebSocket Server is ready for connections on ws://localhost:${PORT}`);
  console.log('----------------------------------------');
});

// Handle WebSocket upgrade requests
server.on('upgrade', (request, socket, head) => {
  console.log('WebSocket upgrade request received');
  if (request.headers.origin !== 'http://localhost:3000') {
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    socket.destroy();
    return;
  }
  wsService.handleUpgrade(request, socket, head);
});

// Handle server shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
