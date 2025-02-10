import express from 'express';
import { getParkingRecommendation } from '../utils/parkingRecommendation';

const router = express.Router();

router.post('/recommendation', async (req, res) => {
  try {
    const { specialNeeds } = req.body;
    // For now, hardcode building number - you might want to make this configurable
    const buildingNumber = "1";
    
    const recommendation = await getParkingRecommendation(buildingNumber, specialNeeds);
    res.json(recommendation);
  } catch (error) {
    console.error('Error getting parking recommendation:', error);
    res.status(500).json({ error: 'Failed to get parking recommendation' });
  }
});

export default router; 