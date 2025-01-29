import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Add this to debug route registration
router.use((req, res, next) => {
  console.log('Activation route hit:', req.method, req.path);
  next();
});

// Verify activation code and return user and event data
router.get('/users/activation/:code', async (req, res) => {
  try {
    const { code } = req.params;
    console.log('Received activation code:', code);

    const eventUser = await prisma.eventUser.findFirst({
      where: {
        activationCode: code,
      },
      include: {
        user: true,
        event: true,
      },
    });

    if (!eventUser) {
      return res.status(404).json({ error: 'Invalid activation code' });
    }

    return res.json({
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
    console.error('Error verifying activation code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 