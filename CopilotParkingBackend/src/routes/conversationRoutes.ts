import express from 'express';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { messageTemplates } from '../utils/messageTemplates';

const router = express.Router();
const prisma = new PrismaClient();

const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// At the top of the file, after router definition
router.use((req, res, next) => {
  console.log('Conversation route hit:', req.method, req.path);
  next();
});

// Create a new conversation message
router.post('/', async (req, res) => {
  console.log('Creating conversation with data:', req.body);
  try {
    const { eventUserId, sender, message } = req.body;

    const conversation = await prisma.conversation.create({
      data: {
        conversationId: eventUserId, // Using eventUserId as conversationId to group chats
        eventUserId,
        sender,
        message,
      },
    });

    res.status(201).json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Get conversation history for an eventUser
router.get('/:eventUserId', async (req, res) => {
  try {
    const { eventUserId } = req.params;

    const conversations = await prisma.conversation.findMany({
      where: {
        eventUserId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

router.post('/smart-response', async (req, res) => {
  try {
    const { eventUserId, message } = req.body;

    const eventUser = await prisma.eventUser.findUnique({
      where: { id: eventUserId },
      include: {
        user: true,
        event: true,
      },
    });

    if (!eventUser || !eventUser.user || !eventUser.event) {
      throw new Error('Event user data not found');
    }

    const { user, event } = eventUser;
    
    // Get conversation history
    const conversationHistory = await prisma.conversation.findMany({
      where: { eventUserId },
      orderBy: { createdAt: 'asc' },
      take: 10,
    });

    // Format conversation history for Groq
    const formattedHistory: ChatMessage[] = conversationHistory.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.message,
    }));

    // Create messages array with proper formatting
    const messages = [
      messageTemplates.initialGreeting(user, event), // Use the entire object as is
      ...formattedHistory,
      { role: 'user', content: message }
    ];

    // Add logging to debug the request
    console.log('Sending request to Groq API:', JSON.stringify({
      messages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 150,
      stream: false
    }, null, 2));

    const response = await axios.post(API_URL, {
      messages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 150,
      stream: false
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    const aiMessage = response.data.choices[0]?.message?.content || '';
    
    // Store the bot's response in the database
    await prisma.conversation.create({
      data: {
        conversationId: eventUserId,
        eventUserId,
        sender: 'bot',
        message: aiMessage,
      },
    });

    res.json({ message: aiMessage });
  } catch (error: any) {
    console.error('Smart response error:', error);
    res.status(500).json({ 
      error: 'Failed to get AI response',
      details: error.response?.data || error.message
    });
  }
});

router.post('/chat', async (req, res) => {
  try {
    const { message, user, event } = req.body;
    
    // Log incoming request
    console.log('Received message:', message);
    console.log('User:', user);
    console.log('Event:', event);

    // Log which template is being used
    if (message.toLowerCase() === 'no') {
      console.log('Using contactAdmin template');
      return res.json(messageTemplates.contactAdmin(user, event));
    }

    // Add more logging for different stages
    // ... your existing conversation logic ...

  } catch (error) {
    console.error('Error in chat route:', error);
    res.status(500).json(messageTemplates.errorResponse);
  }
});

router.post('/register-plate', async (req, res) => {
  try {
    const { eventUserId, carPlate } = req.body;

    // First get the eventUser to find the associated user
    const eventUser = await prisma.eventUser.findUnique({
      where: { id: eventUserId },
      include: { user: true }
    });

    if (!eventUser) {
      return res.status(404).json({ error: 'Event user not found' });
    }

    // Update the user's car plate
    const updatedUser = await prisma.user.update({
      where: { id: eventUser.userId },
      data: { carPlate }
    });

    // Return the full eventUser with updated user data
    const updatedEventUser = await prisma.eventUser.findUnique({
      where: { id: eventUserId },
      include: {
        user: true,
        event: true,
      },
    });

    res.json(updatedEventUser);
  } catch (error) {
    console.error('Error registering car plate:', error);
    res.status(500).json({ error: 'Failed to register car plate' });
  }
});

export default router; 