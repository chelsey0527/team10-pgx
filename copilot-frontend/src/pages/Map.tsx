import React, { useState } from 'react';
import mapDemo from '../assets/map-demo.png';
import mapDemoActual from '../assets/map-demo-actual.png';

const Map = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  const handleImageClick = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] bg-gradient-to-b from-[#FCF9F6] to-[#f3e6d8] px-8 py-14">
      <span className="text-2xl mb-4 font-bold">Visitor Parking Spots Available </span>
      <span className="text-lg text-gray-500 mb-6">Last update: {lastUpdateTime? lastUpdateTime : '30 secs'} ago</span>
      
      {/* Parking spot counters */}
      <div className="flex gap-4 mb-8">
        <div className="flex-1 max-w-[200px] bg-white rounded-xl p-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="text-[#BE8544] text-sm">P1</div>
            <div className="text-4xl font-medium">16</div>
            <div className="text-sm text-gray-800">spots available</div>
          </div>
        </div>
        
        <div className="flex-1 max-w-[200px] bg-white rounded-xl p-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="text-[#BE8544] text-sm">P2</div>
            <span className="text-4xl font-medium">5</span>
            <div className="text-sm text-gray-800">spots available</div>
          </div>
        </div>
      </div>
      
      {/* Main map container with flex centering */}
      <div className="flex-1 flex items-center justify-center">
        <div className="cursor-pointer" onClick={handleImageClick}>
          <img 
            src={mapDemo}
            alt="Map Demo" 
            className="max-w-full h-auto"
          />
        </div>
      </div>

      {/* Modal popup */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative">
            <button
              className="absolute top-2 right-2  rounded-full p-2 text-white hover:bg-gray-200"
              onClick={() => setIsModalOpen(false)}
            >
              ✕
            </button>
            <img 
              src={mapDemoActual}
              alt="Actual Map" 
              className="max-h-[90vh] max-w-[90vw]"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;
