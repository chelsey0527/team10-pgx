import React, { useState, useEffect } from 'react';
import mapDemo from '../assets/map-demo.png';
import mapDemoActual from '../assets/map-demo-actual.png';

const Map = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState(0);
  const [parkingSpots, setParkingSpots] = useState({ p1: 16, p2: 5 });

  useEffect(() => {
    // Update every 30 seconds
    const interval = setInterval(() => {
      setLastUpdateTime(0);
      // Randomly adjust parking spots within reasonable bounds
      setParkingSpots(prev => ({
        p1: Math.max(0, Math.min(20, prev.p1 + Math.floor(Math.random() * 3) - 1)),
        p2: Math.max(0, Math.min(10, prev.p2 + Math.floor(Math.random() * 3) - 1))
      }));
    }, 1000);

    // Update the "seconds ago" counter every second
    const secondsInterval = setInterval(() => {
      setLastUpdateTime(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(secondsInterval);
    };
  }, []);

  const handleImageClick = () => {
    setIsModalOpen(true);
    setIsImageLoading(true);
  };

  const handleImageLoad = () => {
    // Add minimum 1 second delay before hiding the loading spinner
    setTimeout(() => {
      setIsImageLoading(false);
    }, 1000);

  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] bg-gradient-to-b from-[#FCF9F6] to-[#f3e6d8] px-8 py-14">
      <span className="text-2xl mb-4 font-bold">Visitor Parking Spots Available </span>
      <span className="text-lg text-gray-500 mb-6">Last update: {lastUpdateTime? lastUpdateTime : '30 secs'} ago</span>
      
      {/* Parking spot counters */}
      <div className="flex gap-4 mb-8">
        <div className="flex-1 max-w-[200px] bg-white rounded-xl p-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="text-[#BE8544] text-lg">P1</div>
            <div className="text-xl font-medium">{parkingSpots.p1} spots</div>
          </div>
        </div>
        
        <div className="flex-1 max-w-[200px] bg-white rounded-xl p-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="text-[#BE8544] text-lg">P2</div>
            <span className="text-xl font-medium">{parkingSpots.p2} spots</span>
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
            {isImageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
              </div>
            )}
            <img 
              src={mapDemoActual}
              alt="Actual Map" 
              className="max-h-[90vh] max-w-[90vw]"
              onLoad={handleImageLoad}
              style={{ opacity: isImageLoading ? '0' : '1' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;
