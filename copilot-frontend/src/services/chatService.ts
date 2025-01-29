import { createConversation, getSmartBotResponse, getConversationHistory } from './api';
import { messageTemplates } from '../utils/messageTemplates';

interface ConversationMessage {
  message: string;
  sender: 'bot' | 'user';
  createdAt: string | Date;
}

export const initializeChatSession = async (userData: any, eventData: any, eventUserId: string) => {
  // First try to load existing conversation history
  try {
    const history = await getConversationHistory(eventUserId);
    
    if (history && history.length > 0) {
      // If there's existing history, return it formatted for the UI
      return history.map((msg: ConversationMessage) => ({
        text: msg.message,
        sender: msg.sender,
        timestamp: new Date(msg.createdAt),
      }));
    }
  } catch (error) {
    console.error('Error loading conversation history:', error);
  }

  // If no history exists or there was an error, create initial greeting
  const initialMessage = messageTemplates.initialGreeting(userData, eventData);
  
  if (eventUserId) {
    // Store initial greeting in database
    await createConversation(eventUserId, 'bot', initialMessage);
  }

  return [{
    text: initialMessage,
    sender: 'bot' as const,
    timestamp: new Date(),
  }];
};

export const processUserMessage = async (eventUserId: string, message: string) => {
  try {
    // Get bot's response - the backend already stores it in /smart-response
    const response = await getSmartBotResponse(eventUserId, message);
    
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