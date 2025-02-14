import { createConversation, getSmartBotResponse, getConversationHistory } from './api';
import { messageTemplates } from '../utils/messageTemplates';
import {parseMessage} from '../utils/messageParser';

interface ConversationMessage {
  message: string;
  sender: 'bot' | 'user';
  createdAt: string | Date;
}

interface SpecialNeeds {
  needsEV: boolean;
  needsAccessible: boolean;
  needsCloserToElevator: boolean;
}

export const initializeChatSession = async (userData: any, eventData: any, eventUserId: string, dispatch: any) => {
  // First try to load existing conversation history
  try {
    const history = await getConversationHistory(eventUserId);
    
    if (history && history.length > 0) {
      // Parse messages when formatting for UI
      return history.map((msg: ConversationMessage) => ({
        text: parseMessage(msg.message, dispatch),
        sender: msg.sender,
        timestamp: new Date(msg.createdAt),
      }));
    }
  } catch (error) {
    console.error('Error loading conversation history:', error);
  }

  // If no history exists or there was an error, create initial greeting
  const initialMessage = messageTemplates.initialGreeting(userData, eventData);
  // Store the raw content in database, display parsed content in UI
  if (eventUserId) {
    await createConversation(eventUserId, 'bot', initialMessage.content);
  }

  return [{
    text: parseMessage(initialMessage.content, dispatch),
    sender: 'bot' as const,
    timestamp: new Date(),
  }];
};

export const processUserMessage = async (eventUserId: string, message: string, specialNeeds: SpecialNeeds) => {
  try {
    const response = await getSmartBotResponse(eventUserId, message, specialNeeds);
    
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