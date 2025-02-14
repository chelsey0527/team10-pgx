import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import { RootState } from '../store/store';
import { setUser, setError as setUserError, setUserVehicleInfo } from '../store/userSlice';
import { setEvent, setActivationCode } from '../store/activationSlice';
import { getUserByActivationCode, createConversation, getConversationHistory, getSmartBotResponse, registerCarPlate } from '../services/api';
import { messageTemplates } from '../utils/messageTemplates';
import { setShowMapNotification } from '../store/navigationSlice';
import { Message } from '../types/message';
import { parseMessage } from '../utils/messageParser';
import { ActionButtons } from '../components/ActionButtons';
import { setParkingRecommendation } from '../store/parkingSlice';

interface SpecialNeeds {
  needsEV: boolean;
  needsAccessible: boolean;
  needsCloserToElevator: boolean;
}

const formatMessage = (msg: any): Message => ({
  text: msg.message,
  sender: msg.sender,
  timestamp: new Date(msg.createdAt)
});

export const Chatbot = () => {
  const dispatch = useDispatch<AppDispatch>();
  // const { user } = useSelector((state: RootState) => state.user);
  const { activationCode, eventUser } = useSelector((state: RootState) => state.activation);
  
  const [messages, setMessages] = useState<Array<Message>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [specialNeeds, setSpecialNeeds] = useState<SpecialNeeds>({
    needsEV: false,
    needsAccessible: false,
    needsCloserToElevator: false
  });
  
  // Add ref to track initialization
  const hasInitialized = React.useRef(false);

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

  // Modified initialization effect
  useEffect(() => {
    const initializeChat = async (code: string) => {
      if (hasInitialized.current) return; // Skip if already initialized
      hasInitialized.current = true;

      try {
        setIsLoading(true);
        
        const { user: userData, event: eventData, eventUser: eventUserData } = await getUserByActivationCode(code);
        
        dispatch(setUser(userData));
        dispatch(setEvent(eventData));
        dispatch({ type: 'activation/setEventUser', payload: eventUserData });

        try {
          // Try to load conversation history
          const history = await getConversationHistory(eventUserData.id);
          
          if (history && history.length > 0) {
            // If history exists, load it
            setMessages(history.map(formatMessage));
          } else {
            // If no history, start a new conversation
            const initialMessage = {
              text: messageTemplates.initialGreeting(userData, eventData),
              sender: 'bot' as const,
              timestamp: new Date()
            };
            setMessages([{
              text: initialMessage.text.content,
              sender: 'bot',
              timestamp: new Date()
            }]);
            await createConversation(eventUserData.id, 'bot', initialMessage.text.content);
          }
        } catch (error) {
          console.warn('Failed to load history, starting new conversation:', error);
        }
      } catch (error) {
        console.error('Failed to initialize chat:', error);
        dispatch(setUserError(error instanceof Error ? error.message : 'An error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    // Try to get activation code from either Redux or cookies
    let code = activationCode;
    if (!code) {
      const cookies = document.cookie.split(';');
      const activationCookie = cookies.find(cookie => cookie.trim().startsWith('activationCode='));
      
      if (activationCookie) {
        code = activationCookie.split('=')[1];
        dispatch(setActivationCode(code));
      }
    }

    if (code) {
      initializeChat(code);
    } else {
      setIsLoading(false);
    }

  }, [activationCode, dispatch]); // Removed messages.length from dependencies

  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const parseVehicleInfo = (message: string) => {
    const parts = message.split(',').map(part => part.trim());
    if (parts.length >= 2) {
      const [carPlate, colorMake, state] = parts;
      const [color, make] = colorMake.split('/').map(part => part.trim());
      return {
        carPlate,
        carColor: color,
        carMake: make,
        carState: state
      };
    }
    return null;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !eventUser?.id) return;

    const userMessage = inputMessage;
    setInputMessage('');

    try {
      setIsLoading(true);
      
      // Check if this message might be a car plate
      const lastBotMessage = messages[messages.length - 1];
      if (lastBotMessage?.text.includes('drop your license plate number')) {
        const vehicleInfo = parseVehicleInfo(userMessage);
        if (vehicleInfo) {
          await dispatch(setUserVehicleInfo(vehicleInfo));
          await registerCarPlate(eventUser.id, JSON.stringify(vehicleInfo));
        }
      }

      const newUserMessage = {
        text: userMessage,
        sender: 'user' as const,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, newUserMessage]);

      await createConversation(eventUser.id, 'user', userMessage);

      const { message: botResponse, recommendation } = await getSmartBotResponse(eventUser.id, userMessage, specialNeeds);

      console.log('!!!!! ~~~~~ recommendation', recommendation);
      
      // Store parking recommendation if it exists
      if (recommendation) {
        dispatch(setParkingRecommendation({
          location: recommendation.location,
          elevator: recommendation.elevator,
          spots: recommendation.spots,
          stallNumber: recommendation.stallNumber,
          color: recommendation.color,
          zone: recommendation.zone,
          showMapNotification: true
        }));
      }
      
      if (botResponse.includes('view interactive map')) {
        dispatch(setShowMapNotification(true));
      }

      // Check if the response is a split message
      if (typeof botResponse === 'object' && Array.isArray(botResponse.content)) {
        // Send each part as a separate message with a small delay
        for (const part of botResponse.content) {
          const botMessage = {
            text: part.message,
            sender: 'bot' as const,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, botMessage]);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } else {
        // Handle regular single message
        const botMessage = {
          text: botResponse,
          sender: 'bot' as const,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Failed to process message:', error);
      setMessages(prev => [...prev, {
        text: messageTemplates.errorMessage(),
        sender: 'bot' as const,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false); // Stop loading regardless of success/failure
    }
  };

  const formatBoldText = (text: string) => {
    return text.split(/(\*\*.*?\*\*)/).map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const handleActionClick = (message: string) => {
    if (inputRef.current) {
      inputRef.current.value = message;
      setInputMessage(message);
    }
  };

  // Add back handleSend function
  const handleSend = (e: React.MouseEvent) => {
    e.preventDefault();
    handleSendMessage(e);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] bg-gradient-to-b from-[#FCF9F6] to-[#f3e6d8]">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 mt-5">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[85%] rounded-[10px] px-3 py-2 text-sm ${
                message.sender === 'user'
                  ? 'bg-[#FDE5CD] text-black'
                  : ' text-black'
              }`}
            >
              {message.sender === 'bot' ? (
                <div className="space-y-2">
                  {parseMessage(message.text, dispatch)}
                </div>
              ) : (
                <span className="whitespace-pre-line">
                  {formatBoldText(message.text)}
                </span>
              )}
            </div>
          </div>
        ))}
        
        {/* Loading indicator styled like a message */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg p-3">
              <div className="flex items-center justify-center">
                <img 
                  src="/copilot-logo-colored.png" 
                  alt="Loading..." 
                  className="w-8 h-8 animate-pulse"
                />
                <span className=" ml-2 text-sm animate-pulse">Generating response...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className=" p-4">
        <ActionButtons onActionClick={handleActionClick} agentMessage={messages[messages.length - 1]?.text} />
        <form
          onSubmit={handleSendMessage}
          className="flex items-center gap-2 px-4 py-2 bg-[#F5EFE9] rounded-[24px] border border-white shadow-lg"
        >
          <img 
            src="/copilot-logo-colored.png" 
            alt="Copilot Logo" 
            className="w-8 h-8 object-contain"
          />
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Message Copilot"
            className="flex-1 p-2 px-4 rounded-[18px] focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
            onKeyDown={handleKeyDown}
          />
          <button
            type="submit"
            className="p-2 rounded-full"
            onClick={handleSend}
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
    </div>
  );
};

export default Chatbot;