import { Router } from 'express';
import { getAIResponse } from '../controllers/aiController';

const router = Router();

router.post('/ai-response', getAIResponse);

export default router;
