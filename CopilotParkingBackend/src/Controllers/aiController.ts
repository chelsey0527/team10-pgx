import { Request, Response } from 'express';
import { getAIResponseFromFlask } from '../services/aiService';

export const getAIResponse = async (req: Request, res: Response) => {
  try {
    const { input } = req.body;
    if (!input) {
      return res.status(400).json({ error: "Input text is required" });
    }

    const aiResponse = await getAIResponseFromFlask(input);
    res.json({ response: aiResponse });
  } catch (error) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};
