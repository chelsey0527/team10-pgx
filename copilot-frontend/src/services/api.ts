import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getUserByActivationCode = async (activationCode: string) => {
  const response = await api.get(`/api/users/activation/${activationCode}`);
  return response.data;
};

export const verifyActivationCode = async (code: string) => {
  const response = await api.get(`/api/users/activation/${code}`);
  return response.data;
};

export const createConversation = async (eventUserId: string, sender: 'user' | 'bot', message: string) => {
  console.log('--- entered conversation ----');
  const response = await api.post('/api/conversations', {
    eventUserId,
    sender,
    message,
  });
  return response.data;
};

export const getConversationHistory = async (eventUserId: string) => {
  const response = await api.get(`/api/conversations/${eventUserId}`);
  return response.data;
};

export const getBotResponse = async (eventUserId: string, userMessage: string) => {
  const response = await api.post('/api/conversations/bot-response', {
    eventUserId,
    message: userMessage,
  });
  return response.data;
}; 