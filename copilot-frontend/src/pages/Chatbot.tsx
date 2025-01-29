import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import { RootState } from '../store/store';
import { setUser, setLoading as setUserLoading, setError as setUserError } from '../store/userSlice';
import { setEvent, setActivationCode } from '../store/activationSlice';
import { getUserByActivationCode, createConversation, getConversationHistory, getSmartBotResponse } from '../services/api';
import { initializeChatSession, processUserMessage } from '../services/chatService';
import { messageTemplates } from '../utils/messageTemplates';
import { setShowMapNotification } from '../store/navigationSlice';
import { Message } from '../types/message';

const formatMessage = (msg: any): Message => ({
  text: msg.message,
  sender: msg.sender,
  timestamp: new Date(msg.createdAt)
});

const Chatbot = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { firstName } = useSelector((state: RootState) => state.user);
  const { event, activationCode, eventUser } = useSelector((state: RootState) => state.activation);
  
  const [messages, setMessages] = useState<Array<Message>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isReload, setIsReload] = useState(false);

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

  // Add this near the top of the component, with other state declarations
  useEffect(() => {
    // Check if this is a reload by looking at performance navigation type
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation.type === 'reload') {
      console.log('Page was reloaded');
      setIsReload(true);
    }
  }, []);

  // Initialize chat and handle activation code
  useEffect(() => {
    console.log('Effect triggered - checking initialization needs');
    console.log('Current activation code in Redux:', activationCode);
    console.log('Current document.cookie:', document.cookie);
    
    const initializeChat = async (code: string) => {
      try {
        setIsLoading(true);
        console.log('Starting to fetch user data with code:', code);
        
        const { user: userData, event: eventData, eventUser: eventUserData } = await getUserByActivationCode(code);
        console.log('Received user data:', { userData, eventData, eventUserData });
        
        dispatch(setUser(userData));
        dispatch(setEvent(eventData));
        dispatch({ type: 'activation/setEventUser', payload: eventUserData });

        // Load conversation history
        const history = await getConversationHistory(eventUserData.id);
        setMessages(history.map(formatMessage));
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
      console.log('All cookies:', cookies);
      
      const activationCookie = cookies.find(cookie => cookie.trim().startsWith('activationCode='));
      console.log('Found activation cookie:', activationCookie);
      
      if (activationCookie) {
        code = activationCookie.split('=')[1];
        console.log('Extracted code from cookie:', code);
        dispatch(setActivationCode(code));
      }
    }

    if (code) {
      console.log('Initializing chat with code:', code);
      initializeChat(code);
    } else {
      console.log('No activation code available');
      setIsLoading(false);
    }

  }, [isReload]); // This will run on initial load and when page is reloaded

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
        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-full space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#F5EFE9] border-t-blue-500"></div>
            <p className="text-gray-500 animate-pulse">Loading conversation...</p>
          </div>
        ) : (
          messages.map((message, index) => (
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
          ))
        )}
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
