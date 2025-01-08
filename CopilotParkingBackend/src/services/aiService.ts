import axios from 'axios';

const FLASK_API_URL = process.env.FLASK_API_URL || 'http://localhost:5000/autogen';

export const getAIResponseFromFlask = async (input: string): Promise<string> => {
  try {
    const response = await axios.post(`${FLASK_API_URL}/response`, { input });
    return response.data.response;
  } catch (error) {
    console.error("Error fetching AI response:", error);
    throw new Error("Failed to fetch AI response");
  }
};