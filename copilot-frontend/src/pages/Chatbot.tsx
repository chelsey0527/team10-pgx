import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import { RootState } from '../store/store';
import { setUser, setLoading as setUserLoading, setError as setUserError } from '../store/userSlice';
import { setEvent, setActivationCode } from '../store/activationSlice';
import { getUserByActivationCode, createConversation, getConversationHistory, getSmartBotResponse, registerCarPlate } from '../services/api';
import { messageTemplates } from '../utils/messageTemplates';
import { setShowMapNotification } from '../store/navigationSlice';
import { Message } from '../types/message';
import { parseMessage } from '../utils/messageParser';

const formatMessage = (msg: any): Message => ({
  text: msg.message,
  sender: msg.sender,
  timestamp: new Date(msg.createdAt)
});

const Chatbot = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.user);
  const { event, activationCode, eventUser } = useSelector((state: RootState) => state.activation);
  
  const [messages, setMessages] = useState<Array<Message>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
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
            setMessages([initialMessage]);
            await createConversation(eventUserData.id, 'bot', initialMessage.text);
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !eventUser?.id) return;

    const userMessage = inputMessage;
    setInputMessage('');

    try {
      setIsLoading(true); // Start loading
      
      const newUserMessage = {
        text: userMessage,
        sender: 'user' as const,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, newUserMessage]);

      // Check if this message might be a car plate (after the registration prompt)
      const lastBotMessage = messages[messages.length - 1];
      if (lastBotMessage?.text.includes('provide your license plate number')) {
        // This is likely a car plate response
        await registerCarPlate(eventUser.id, userMessage);
      }

      await createConversation(eventUser.id, 'user', userMessage);

      const { message: botResponse } = await getSmartBotResponse(eventUser.id, userMessage);
      
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
              className={`max-w-[80%] rounded-lg p-3 ${
                message.sender === 'user'
                  ? 'bg-[#e58a2f] text-white'
                  : 'bg-white text-black'
              }`}
            >
              {message.sender === 'bot' ? (
                <div className="space-y-1">
                  {parseMessage(message.text)}
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
            <div className="max-w-[80%] rounded-lg p-3 bg-white">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '-0.32s' }} />
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '-0.16s' }} />
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form
        onSubmit={handleSendMessage}
        className="flex items-center gap-2 px-4 py-2 bg-[#F5EFE9] rounded-[24px] border border-white mb-4 mx-2 shadow-lg"
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
          className="flex-1 p-2 px-4 rounded-[18px] focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
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

// Add these styles to your existing CSS
const styles = `
  .typing-indicator {
    display: flex;
    gap: 4px;
    padding: 12px;
    background: #f0f0f0;
    border-radius: 20px;
    width: fit-content;
  }

  .dot {
    width: 8px;
    height: 8px;
    background: #666;
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out;
  }

  .dot:nth-child(1) { animation-delay: -0.32s; }
  .dot:nth-child(2) { animation-delay: -0.16s; }

  @keyframes bounce {
    0%, 80%, 100% { 
      transform: scale(0);
    } 
    40% { 
      transform: scale(1.0);
    }
  }
`;
