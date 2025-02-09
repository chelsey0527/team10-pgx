import express from 'express';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { messageTemplates } from '../utils/messageTemplates';
// import { findBestParking, ParkingGraph, ParkingPreferences } from '../utils/parkingRecommendation';

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

    const messages = [
      messageTemplates.initialGreeting(user, event),
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
      temperature: 0.4,
      max_tokens: 150,
      stream: false
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    const aiMessage = response.data.choices[0]?.message?.content || '';
    
    // Force the correct template only in specific scenarios
    // let finalMessage = aiMessage;

    // Only force templates in very specific cases
    // if ((aiMessage.toLowerCase().includes('provide your license plate') || 
    //      aiMessage.toLowerCase().includes('register your vehicle')) && 
    //     !aiMessage.toLowerCase().includes('already have your')) {
    //   finalMessage = messageTemplates.carRegistration(user, event).content;
    // } 
    // else if ((aiMessage.toLowerCase().includes('customized cards for visualization')) && 
    // (aiMessage.toLowerCase().includes('your final parking details') ||
    //          aiMessage.toLowerCase().includes('here is your final parking details') || 
    //          aiMessage.toLowerCase().includes('view interactive map'))) {
    //   finalMessage = messageTemplates.finalRecommendation(user, event).content;
    // }
    // else if (aiMessage.toLowerCase().includes('contact the event organizer') || 
    //          aiMessage.toLowerCase().includes('meeting information incorrect')) {
    //   finalMessage = messageTemplates.contactAdmin(user, event).content;
    // }
    // // For special needs responses, combine AI response with template
    // else if (aiMessage.toLowerCase().includes('parking') && 
    //          aiMessage.toLowerCase().includes('recommend') &&
    //          (aiMessage.toLowerCase().includes('pregnant') || 
    //           aiMessage.toLowerCase().includes('injury') || 
    //           aiMessage.toLowerCase().includes('accessibility'))) {
    //   // Extract first sentence using regex only for special needs acknowledgment
    //   const firstSentence = aiMessage.match(/^[^.!?]+[.!?]/)?.[0] || aiMessage;
    //   finalMessage = `${firstSentence}\n\n${messageTemplates.finalRecommendation(user, event).content}`;
    // }
    // // Keep original AI response for all other cases
    // else {
    //   finalMessage = aiMessage;
    // }
    
    console.log('AI Response:', aiMessage);
    // console.log('Final Message after template check:', finalMessage);

    // Store the bot's response with the forced template
    await prisma.conversation.create({
      data: {
        conversationId: eventUserId,
        eventUserId,
        sender: 'bot',
        // message: finalMessage,
        message: aiMessage,
      },
    });

    // res.json({ message: finalMessage });
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

// router.post('/recommend-parking', async (req, res) => {
//   try {
//     const { 
//       eventUserId,
//       entranceId,
//       preferences
//     }: {
//       eventUserId: string;
//       entranceId: string;
//       preferences: ParkingPreferences;
//     } = req.body;

//     // Get event details to load correct parking graph
//     const eventUser = await prisma.eventUser.findUnique({
//       where: { id: eventUserId },
//       include: { event: true }
//     });

//     if (!eventUser || !eventUser.event) {
//       throw new Error('Event user or event not found');
//     }

//     // In the future, this would come from your database based on the event
//     const parkingGraph: ParkingGraph = {
//       nodes: [
//         // Example nodes - in production, load from database
//         {
//           id: 'entrance1',
//           type: 'entrance',
//           coordinates: { x: 0, y: 0, z: 0 }
//         },
//         {
//           id: 'parking1',
//           type: 'parking',
//           coordinates: { x: 10, y: 10, z: 0 },
//           features: {
//             isEV: true,
//             nearElevator: true
//           }
//         }
//         // ... more nodes
//       ],
//       edges: [
//         // Example edges - in production, load from database
//         {
//           from: 'entrance1',
//           to: 'parking1',
//           weight: 10
//         }
//         // ... more edges
//       ]
//     };

//     const recommendation = findBestParking(parkingGraph, entranceId, preferences);

//     // Store the recommendation in the conversation
//     await prisma.conversation.create({
//       data: {
//         conversationId: eventUserId,
//         eventUserId,
//         sender: 'bot',
//         message: `I've found the perfect parking spot for you! Follow this path: ${recommendation.path.join(' → ')}`,
//       },
//     });

//     res.json({
//       success: true,
//       recommendation
//     });

//   } catch (error) {
//     console.error('Error generating parking recommendation:', error);
//     res.status(500).json({ error: 'Failed to generate parking recommendation' });
//   }
// });

export default router; 