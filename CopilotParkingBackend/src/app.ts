import express from 'express';
import cors from 'cors';
import eventUserRoutes from './routes/eventUserRoutes';
import activationRoutes from './routes/activationRoutes';
import conversationRoutes from './routes/conversationRoutes';

const app = express();

// Add CORS middleware before other routes
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Enable JSON body parsing
app.use(express.json());

// Add this before routes
app.use((req, res, next) => {
  console.log('Incoming request:', req.method, req.url);
  next();
});

// Use routes
app.use('/api/event-users', eventUserRoutes);
app.use('/api', activationRoutes);
app.use('/api/conversations', conversationRoutes);

export default app;
