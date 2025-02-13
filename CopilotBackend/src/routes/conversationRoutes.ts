import express from 'express';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { messageTemplates } from '../utils/messageTemplates';
import { getParkingRecommendation } from '../utils/parkingRecommendation';
import OpenAI from 'openai';

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
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Get the last bot message
    const lastBotMessage = conversationHistory
      .find(msg => msg.sender === 'bot');

    console.log('Current message:', message);
    console.log('Last bot message:', lastBotMessage);

    const specialNeeds = {
      needsEV: false,
      needsAccessible: false,
      needsCloserToElevator: false
    };

    // Convert messages to lowercase for easier checking
    const currentMessageLower = message.toLowerCase();
    const lastBotMessageLower = lastBotMessage?.message.toLowerCase() || '';

    // Check conditions to set EV flag
    if (
      // If user explicitly mentions EV needs
      currentMessageLower.includes('ev') ||
      currentMessageLower.includes('ev charging') ||
      currentMessageLower.includes('ev charging station') ||
      currentMessageLower.includes('i drive ev') ||
      // Or if they're modifying in response to EV question
      (currentMessageLower.includes('modify') && 
       lastBotMessageLower.includes('need an ev charging spot'))
    ) {
      specialNeeds.needsEV = true;
    }

    // Check conditions to unset EV flag
    if (
      currentMessageLower.includes("don't drive ev") || 
      currentMessageLower.includes("no needs") ||
      lastBotMessageLower.includes("don't have any specific requirements")
    ) {
      specialNeeds.needsEV = false;
    }
    
    console.log('------------------------------------------ 0. lastBotMessageLower', lastBotMessageLower);
    console.log('0. specialNeeds', specialNeeds);
    
    let parkingRecommendation;
    if (lastBotMessageLower.includes("here's your summarized special needs:")) {
      parkingRecommendation = await getParkingRecommendation(
        event.meetingBuilding,
        specialNeeds
      );
      console.log('------------------------------------------ 1. recommendation', parkingRecommendation);
    }

    const messages = [
      messageTemplates.initialGreeting(user, event, parkingRecommendation),
      ...conversationHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.message,
      })),
      { role: 'user', content: message }
    ];

    const response = await axios.post(API_URL, {
      messages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.4,
      max_tokens: 150,
      stream: false
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    console.log('------------------------------------------ 2. response', response.data.choices[0]?.message?.content);

    const aiMessage = response.data.choices[0]?.message?.content || '';
    
    // console.log('AI Response:', aiMessage);

    // Store the bot's response with the forced template
    await prisma.conversation.create({
      data: {
        conversationId: eventUserId,
        eventUserId,
        sender: 'bot',
        message: aiMessage,
      },
    });

    res.json({ message: aiMessage, recommendation: parkingRecommendation });
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
      return res.json(messageTemplates.contactAdmin());
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
    const vehicleInfo = JSON.parse(carPlate);

    const eventUser = await prisma.eventUser.findUnique({
      where: { id: eventUserId },
      include: { 
        user: {
          include: {
            car: true
          }
        }
      }
    });

    if (!eventUser) {
      return res.status(404).json({ error: 'Event user not found' });
    }

    // Update or create car information
    const updatedUser = await prisma.user.update({
      where: { id: eventUser.userId },
      data: {
        carPlate: vehicleInfo.carPlate, // Keep for backward compatibility
        car: {
          upsert: {
            create: {
              carPlate: vehicleInfo.carPlate,
              carColor: vehicleInfo.carColor,
              carMake: vehicleInfo.carMake,
              carState: vehicleInfo.carState,
            },
            update: {
              carColor: vehicleInfo.carColor,
              carMake: vehicleInfo.carMake,
              carState: vehicleInfo.carState,
            }
          }
        }
      },
      include: {
        car: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error registering car plate:', error);
    res.status(500).json({ error: 'Failed to register car plate' });
  }
});

export default router; 