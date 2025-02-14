import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import monster2 from '../assets/monster2.png';

const Landing = () => {
  const navigate = useNavigate();
  const [expandedCard, setExpandedCard] = useState<number | null>(1);

  const handleRegisterClick = () => {
    navigate('/chatbot');
  };

  const handleCardClick = (stepNumber: number) => {
    setExpandedCard(expandedCard === stepNumber ? null : stepNumber);
  };

  const getCardBackground = (stepNumber: number) => {
    return expandedCard === stepNumber ? 'bg-[#FCF9F6]' : 'bg-[#FAEDE1]';
  };

  const getTextColor = (stepNumber: number) => {
    return expandedCard === stepNumber ? 'text-black' : 'text-[#666666]';
  };

  const getNumberStyle = (stepNumber: number) => {
    return expandedCard === stepNumber ? 'bg-black text-white' : 'bg-[#666666] text-white';
  };

  return (
    <div className="flex flex-col h-screen bg-white p-6">
      {/* Header with logo */}
      <div className="mt-16 mb-8">
        <img 
          src="/copilot-logo-colored.png" 
          alt="Logo" 
          className="w-16 h-16 mx-auto mb-4"
        />
        <h1 className="text-2xl font-semibold text-center">
          4 Steps for a Seamless<br />Parking Experience
        </h1>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2">
        {/* Step 1 */}
        <div 
          className={`${getCardBackground(1)} rounded-xl px-6 py-4 shadow-lg cursor-pointer`}
          onClick={() => handleCardClick(1)}
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <span className={`${getNumberStyle(1)} rounded px-2 py-1 text-xs`}>1</span>
                <h2 className={`text-md font-semibold ${getTextColor(1)}`}>Pre-register Your Vehicle</h2>
              </div>
              {expandedCard === 1 && (
                <>
                  <div className="pl-[28px] pt-2">
                    <span className="text-gray-600 text-sm">
                      Register in advance to speed up your visitor check-in process.
                    </span>
                    <br />
                    <span className="inline-block mt-2 text-orange-400 border border-orange-400 rounded-lg px-3 py-1 text-xs">
                      Recommended
                    </span>
                  </div>
                  <div className="relative">
                    <img 
                      src={monster2} 
                      alt="Monster" 
                      className="absolute -top-8 right-1 w-30 h-16 z-10"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRegisterClick();
                      }}
                      className="mt-8 w-full py-2 rounded-full bg-gradient-to-r from-purple-500 to-teal-500 text-white text-sm font-medium"
                    >
                      Register Now!
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div 
          className={`${getCardBackground(2)} rounded-xl px-6 py-4 shadow-lg cursor-pointer`}
          onClick={() => handleCardClick(2)}
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`${getNumberStyle(2)} rounded px-2 py-1 text-xs`}>2</span>
                <h2 className={`text-md font-semibold ${getTextColor(2)}`}>Get Parking Recommendation</h2>
              </div>
              {expandedCard === 2 && (
                <div className="pl-[28px] pt-2">
                  <span className="text-gray-600 text-sm">
                    Receive personalized parking suggestions based on your destination.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div 
          className={`${getCardBackground(3)} rounded-xl px-6 py-4 shadow-lg cursor-pointer`}
          onClick={() => handleCardClick(3)}
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`${getNumberStyle(3)} rounded px-2 py-1 text-xs`}>3</span>
                <h2 className={`text-md font-semibold ${getTextColor(3)}`}>Record Parking Spot</h2>
              </div>
              {expandedCard === 3 && (
                <div className="pl-[28px] pt-2">
                  <span className="text-gray-600 text-sm">
                    Save your parking location to easily find your vehicle later.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 4 */}
        <div 
          className={`${getCardBackground(4)} rounded-xl px-6 py-4 shadow-lg cursor-pointer`}
          onClick={() => handleCardClick(4)}
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`${getNumberStyle(4)} rounded px-2 py-1 text-xs`}>4</span>
                <h2 className={`text-md font-semibold ${getTextColor(4)}`}>Learn more about Headquarter</h2>
              </div>
              {expandedCard === 4 && (
                <div className="pl-[28px] pt-2">
                  <span className="text-gray-600 text-sm">
                    Discover useful information about facilities and services available.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing; 