import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bodyParser from 'body-parser';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(bodyParser.json());

// Fetch messages
app.get('/messages', async (req, res) => {
  const messages = await prisma.message.findMany();
  res.json(messages);
});

// Save a message
app.post('/messages', async (req, res) => {
  const { type, text, path } = req.body;
  const message = await prisma.message.create({
    data: { type, text, path },
  });
  res.json(message);
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
