import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import { RootState } from '../store/store';
import { setUser, setLoading as setUserLoading, setError as setUserError } from '../store/userSlice';
import { setEvent } from '../store/activationSlice';
import { getUserByActivationCode, createConversation, getConversationHistory, getSmartBotResponse } from '../services/api';
import { initializeChatSession, processUserMessage } from '../services/chatService';
import { messageTemplates } from '../utils/messageTemplates';
import { setShowMapNotification } from '../store/navigationSlice';

const Chatbot = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { firstName } = useSelector((state: RootState) => state.user);
  const { event, activationCode, eventUser } = useSelector((state: RootState) => state.activation);
  
  const [messages, setMessages] = useState<Array<{
    text: string;
    sender: 'bot' | 'user';
    timestamp: Date;
  }>>([]);
  const [inputMessage, setInputMessage] = useState('');

  // Add ref for the messages container
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const initializeChat = async () => {
      if (!activationCode) return;

      try {
        dispatch(setUserLoading(true));
        const { user: userData, event: eventData, eventUser: eventUserData } = await getUserByActivationCode(activationCode);
        
        dispatch(setUser(userData));
        dispatch(setEvent(eventData));
        dispatch({ type: 'activation/setEventUser', payload: eventUserData });
        
        if (userData && eventUserData?.id) {
          const initialMessages = await initializeChatSession(userData, eventData, eventUserData.id);
          setMessages(initialMessages);
        }
      } catch (error) {
        dispatch(setUserError(error instanceof Error ? error.message : 'An error occurred'));
      } finally {
        dispatch(setUserLoading(false));
      }
    };

    initializeChat();
  }, [activationCode, dispatch]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !eventUser?.id) return;

    const userMessage = inputMessage;
    setInputMessage('');

    try {
      const newUserMessage = {
        text: userMessage,
        sender: 'user' as const,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, newUserMessage]);

      await createConversation(eventUser.id, 'user', userMessage);

      const { message: botResponse } = await getSmartBotResponse(eventUser.id, userMessage);
      
      if (botResponse.includes('view interactive map')) {
        dispatch(setShowMapNotification(true));
      }

      const botMessage = {
        text: botResponse,
        sender: 'bot' as const,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Failed to process message:', error);
      setMessages(prev => [...prev, {
        text: messageTemplates.errorMessage(),
        sender: 'bot' as const,
        timestamp: new Date(),
      }]);
    }
  };

  // Load conversation history
  useEffect(() => {
    const loadConversationHistory = async () => {
      if (!eventUser?.id) return;

      try {
        const history = await getConversationHistory(eventUser.id);
        const formattedMessages = history.map((msg: any) => ({
          text: msg.message,
          sender: msg.sender,
          timestamp: new Date(msg.createdAt),
        }));
        setMessages(formattedMessages);
      } catch (error) {
        console.error('Failed to load conversation history:', error);
      }
    };

    loadConversationHistory();
  }, [eventUser?.id]);

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] bg-gradient-to-b from-[#FCF9F6] to-[#f3e6d8]">
      {/* Header */}
      <div className="flex items-center p-4">
        <div className="flex-1">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-black rounded-full mr-2" />
            <span className="font-regular">Register License Plate</span>
          </div>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 whitespace-pre-line ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-black'
              }`}
            >
              {message.text.split('\n').map((line, i) => (
                <div key={i}>
                  {line.startsWith('**') && line.endsWith('**') 
                    ? <strong>{line.slice(2, -2)}</strong> 
                    : line}
                </div>
              ))}
            </div>
          </div>
        ))}
        {/* Add div ref for scrolling */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form
        onSubmit={handleSendMessage}
        className="flex items-center gap-2 p-4 bg-[#F5EFE9] rounded-[40px] border border-white mb-4 mx-4"
      >
        <img 
          src="/copilot-logo-colored.png" 
          alt="Copilot Logo" 
          className="w-8 h-8 object-contain"
        />
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Message Copilot"
          className="flex-1 p-2 px-4 rounded-[18px] focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="p-2 rounded-full"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
            />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default Chatbot;
