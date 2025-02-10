import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Route to verify registration code
router.post('/verify-registration', async (req: Request, res: Response) => {
    try {
        const { activationCode } = req.body;

        if (!activationCode) {
            return res.status(400).json({ 
                success: false, 
                message: 'Registration code is required' 
            });
        }

        const eventUser = await prisma.eventUser.findFirst({
            where: {
                activationCode: activationCode
            },
            select: {
                id: true
            }
        });

        if (!eventUser) {
            return res.status(404).json({ 
                success: false, 
                message: 'Invalid registration code' 
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                userId: eventUser.id
                
            }
        });
    } catch (error) {
        console.error('Error verifying registration code:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

export default router; 