import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bodyParser from 'body-parser';
import app from './app';

const prisma = new PrismaClient();

app.use(cors());
app.use(bodyParser.json());

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
