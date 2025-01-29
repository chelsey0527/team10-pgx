import { createConversation, getSmartBotResponse } from './api';
import { messageTemplates } from '../utils/messageTemplates';

export const initializeChatSession = async (userData: any, eventData: any, eventUserId: string) => {
  const initialMessage = messageTemplates.initialGreeting(userData, eventData);
  
  if (eventUserId) {
    await createConversation(eventUserId, 'bot', initialMessage);
  }

  return {
    text: initialMessage,
    sender: 'bot' as const,
    timestamp: new Date(),
  };
};

export const processUserMessage = async (eventUserId: string, message: string) => {
  try {
    const response = await getSmartBotResponse(eventUserId, message);
    await createConversation(eventUserId, 'bot', response.message);
    
    return {
      text: response.message,
      sender: 'bot' as const,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Error processing message:', error);
    throw error;
  }
}; 