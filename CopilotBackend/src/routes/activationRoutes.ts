import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateToken, setAuthCookie } from '../utils/auth';

const router = Router();
const prisma = new PrismaClient();

// Add this to debug route registration
router.use((req, res, next) => {
  console.log('Activation route hit:', req.method, req.path);
  next();
});

// Verify activation code and return user and event data
router.get('/:code', async (req, res) => {
  try {
    const eventUser = await prisma.eventUser.findUnique({
      where: { activationCode: req.params.code },
      include: {
        user: {
          include: {
            car: true // Include car details
          }
        },
        event: {
          include: {
            organizer: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    if (!eventUser) {
      return res.status(404).json({ error: 'Activation code not found' });
    }

    res.json(eventUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

router.post('/activate', async (req, res) => {
  try {
    const { activationCode } = req.body;
    
    const eventUser = await prisma.eventUser.findFirst({
      where: {
        activationCode: activationCode,
      },
      include: {
        user: true,
        event: true,
      },
    });

    if (!eventUser) {
      return res.status(404).json({ error: 'Invalid activation code' });
    }

    // Generate JWT token
    const token = generateToken(eventUser.user.id, activationCode);
    
    // Set HTTP-only cookie
    setAuthCookie(res, token);
    
    // Return user data without sensitive information
    res.json({
      user: {
        id: eventUser.user.id,
        firstName: eventUser.user.firstName,
        lastName: eventUser.user.lastName,
        email: eventUser.user.email,
      },
      event: {
        id: eventUser.event.id,
        name: eventUser.event.meetingName,
        startTime: eventUser.event.startTime,
        endTime: eventUser.event.endTime,
        building: eventUser.event.meetingBuilding,
        organizer: eventUser.event.organizerId,
      },
      eventUser: {
        id: eventUser.id,
        eventId: eventUser.eventId,
        userId: eventUser.userId,
        activationCode: eventUser.activationCode,
        parkingSpot: eventUser.parkingSpot,
        status: eventUser.status,
      },
    });
  } catch (error) {
    console.error('Error in /activate:', error);
    res.status(400).json({ message: 'Invalid activation code' });
  }
});

export default router; 