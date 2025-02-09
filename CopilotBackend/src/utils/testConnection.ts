import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function testConnection() {
  try {
    await client.connect();
    console.log('Connected to the database successfully!');
  } catch (err) {
    console.error('Failed to connect to the database:', err);
  } finally {
    await client.end();
  }
}

testConnection();
