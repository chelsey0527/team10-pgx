import express from 'express';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { messageTemplates } from '../utils/messageTemplates';
import { getParkingRecommendation } from '../utils/parkingRecommendation';

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
    }).then(messages => messages.reverse()); // Reverse to maintain chronological order
    

    const specialNeeds = {
      needsEV: false,
      needsAccessible: false,
      needsCloserToElevator: false
    };

    // Convert current message to lowercase for easier checking
    const currentMessageLower = message.toLowerCase();

    // Check if any of the last 5 messages contains the trigger phrase
    const hasSpecialNeedsSummary = conversationHistory.some((msg, index) => {
      if (msg.sender === 'bot' && 
          msg.message.toLowerCase().includes("here's your summarized special needs:")) {
        // Check if there's a "yes" response in the next message
        const nextMsg = conversationHistory[index + 1];
        return !(nextMsg && nextMsg.sender === 'user' && 
                 nextMsg.message.toLowerCase() === 'yes');
      }
      return false;
    });

    // Check for EV needs in current message
    const hasEVKeywords = 
      currentMessageLower.includes('ev') ||
      currentMessageLower.includes('electric vehicle') ||
      currentMessageLower.includes('ev charging') ||
      currentMessageLower.includes('charging station') ||
      currentMessageLower.includes('i drive ev');

    // Set EV flag if keywords are found
    if (hasEVKeywords) {
      specialNeeds.needsEV = true;
    }

    // Check for accessibility needs
    if (
      currentMessageLower.includes('wheelchair') ||
      currentMessageLower.includes('disabled') ||
      currentMessageLower.includes('accessibility')
    ) {
      specialNeeds.needsAccessible = true;
    }

    // Check for elevator proximity needs
    if (
      currentMessageLower.includes('elevator') ||
      currentMessageLower.includes('close to entrance')
    ) {
      specialNeeds.needsCloserToElevator = true;
    }

    // Unset special needs if user indicates no requirements
    if (
      currentMessageLower.includes("don't need") || 
      currentMessageLower.includes("no needs") ||
      currentMessageLower.includes("no special requirements")
    ) {
      specialNeeds.needsEV = false;
      specialNeeds.needsAccessible = false;
      specialNeeds.needsCloserToElevator = false;
    }

    console.log('------------------------------------------');
    console.log(hasSpecialNeedsSummary, hasEVKeywords, specialNeeds.needsAccessible, specialNeeds.needsCloserToElevator);
    console.log('------------------------------------------');
    let parkingRecommendation;
    // Get recommendation if we're in special needs context or user mentioned specific needs
    if (hasSpecialNeedsSummary || hasEVKeywords || specialNeeds.needsAccessible || specialNeeds.needsCloserToElevator ||
      currentMessageLower.includes("don't need") || 
      currentMessageLower.includes("no needs") ||
      currentMessageLower.includes("no special requirements")) {
      console.log(specialNeeds);
      parkingRecommendation = await getParkingRecommendation(
        event.meetingBuilding,
        specialNeeds
      );
      console.log('Parking recommendation triggered:', parkingRecommendation);
    }

    // Add the recommendation to the templates object that's passed in the initial greeting
    const messages = [
      messageTemplates.initialGreeting(user, event, parkingRecommendation),
      ...conversationHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.message.replace('-----', '') // Clean up any placeholder dashes
      })),
      { role: 'user', content: message }
    ];

    console.log('********************************* 1. messages', messages);

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


    console.log('********************************* 2. response', response.data.choices[0]?.message?.content);

    const aiMessage = response.data.choices[0]?.message?.content || '';
    
    // If the message contains the final recommendation template, replace placeholders with actual values
    let processedMessage = aiMessage;
    if (parkingRecommendation && aiMessage.includes('Park in P1')) {
      processedMessage = aiMessage
        .replace('P1 -----', `P1 ${parkingRecommendation.location || ''}`)
        .replace('----- elevator', `${parkingRecommendation.elevator || ''} elevator`)
        .replace('----- spots', `${parkingRecommendation.spots || ''} spots`);
    }

    // Store the bot's response with the processed message
    await prisma.conversation.create({
      data: {
        conversationId: eventUserId,
        eventUserId,
        sender: 'bot',
        message: processedMessage,
      },
    });

    res.json({ message: processedMessage, recommendation: parkingRecommendation });
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