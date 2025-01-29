import express from 'express';
import cors from 'cors';
import eventUserRoutes from './routes/eventUserRoutes';

const app = express();

// Add CORS middleware before other routes
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Enable JSON body parsing
app.use(express.json());

// Use event user routes
app.use('/api/event-users', eventUserRoutes);

export default app;
