export interface Message {
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
} 