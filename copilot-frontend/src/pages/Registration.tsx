import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import { verifyActivationCode } from '../services/api';
import { setUser } from '../store/userSlice';
import { setEvent, setEventUser, setActivationCode } from '../store/activationSlice';


// Create an async action creator
const verifyAndStoreData = (code: string) => async (dispatch: AppDispatch) => {
  try {
    const { user, event, eventUser } = await verifyActivationCode(code);
    
    // Use action creators instead of dispatching by type
    dispatch(setUser(user));
    dispatch(setActivationCode(code));
    dispatch(setEvent(event));
    dispatch(setEventUser(eventUser));

    // Store activation code in cookie
    document.cookie = `activationCode=${code}; path=/; max-age=86400`; // 24 hours
    console.log('Cookie set after verification:', document.cookie);
    
    return { success: true };
  } catch (error) {
    console.error('Verification failed:', error);
    return { success: false, error };
  }
};

const Registration = () => {
  const [activationCode, setActivationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await dispatch(verifyAndStoreData(activationCode));
    
    if (result?.success) {
      navigate('/chatbot');
    } else {
      setError('Invalid activation code. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen min-w-[375px] bg-gradient-to-br from-[#e9e9e9] to-[#ffffff] p-10">
      <div className="flex flex-col justify-center flex-grow md:items-center">
        <div className="md:w-[600px] w-full">
          {/* Logo */}
          <div className="mb-8 self-start">
            <img src="/copilot-logo.png" alt="Copilot Logo" className="w-16 h-16" />
          </div>

          {/* Title */}
          <h1 className="text-4xl font-['ABC_Ginto'] mb-2 text-left">
            Hi, I'm Copilot, your <br/> AI companion.
          </h1>

          {/* Code Input Section */}
          <div className="w-full max-w-md mt-20">
            <h2 className="text-gray-500 text-xl font-['ABC_Ginto'] mb-6 text-center">
              Enter One-time Code here
            </h2>
            
            <form onSubmit={handleSubmit} className="flex flex-col items-center">
              <div className="flex justify-center gap-2 mb-8">
                {[...Array(6)].map((_, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    className="w-10 h-12 text-center text-2xl font-medium border rounded-lg bg-[#D9D9D9]"
                    value={activationCode[index] || ''}
                    onChange={(e) => {
                      const newCode = activationCode.split('');
                      newCode[index] = e.target.value.toUpperCase();
                      setActivationCode(newCode.join(''));
                    }}
                    disabled={loading}
                  />
                ))}
              </div>
              
              <button
                type="submit"
                className="w-full max-w-xs py-3 rounded-full bg-[#D9D9D9] text-black mt-20"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </form>
            {error && <div className="error text-center">{error}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registration;