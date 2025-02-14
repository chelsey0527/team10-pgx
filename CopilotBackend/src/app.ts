import express from 'express';
import cors from 'cors';
import eventUserRoutes from './routes/eventUserRoutes';
import activationRoutes from './routes/activationRoutes';
import conversationRoutes from './routes/conversationRoutes';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import parkingRoutes from './routes/parkingRoutes';
import { createServer } from 'http';

// Load environment variables first
dotenv.config();

const app = express();
const server = createServer(app);

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'ws://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Upgrade', 'Connection'],
  exposedHeaders: ['Upgrade']
}));

// Middleware
app.use(cookieParser());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Add WebSocket specific headers middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

// Routes
app.use('/api/conversations', conversationRoutes);
app.use('/api/event-users', eventUserRoutes);
app.use('/api', activationRoutes);
app.use('/api/parking', parkingRoutes);

// Catch-all route
app.use('*', (req, res) => {
  console.log('No route matched:', req.method, req.originalUrl);
  res.status(404).json({ error: 'Route not found' });
});

export { app, server };
