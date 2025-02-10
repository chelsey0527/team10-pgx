import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import mapDemo from '../assets/map-demo.png';
import generalBlueB1 from '../assets/general-blue-b-1.png';
import evOrangeB1 from '../assets/ev-orange-b-1.png';

const Map = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  
  // Convert state to refs for values that don't need re-renders
  // const lastUpdateTimeRef = useRef(0);
  const parkingSpotsRef = useRef({ p1: 16, p2: 5 });

  // Update the selector to use optional chaining and provide a default value
  const userNeeds = useSelector((state: any) => 
    state.user?.user?.specialNeeds ?? {
      needsEV: false,
      needsAccessible: false,
      needsCloserToElevator: false
    }
  );
  const recommendedParking = useSelector((state: any) => state.parking?.recommendation);
  
  console.log('userNeeds:', userNeeds);
  console.log('Recommended parking from Redux:', recommendedParking);

  // Function to determine which map to show
  const getMapImage = () => {
    if (!recommendedParking) return mapDemo;

    // Parse the location string to get color and zone
    const location = recommendedParking.location?.toLowerCase() || '';
    const color = recommendedParking.color?.toLowerCase() || '';
    const zone = recommendedParking.zone?.toLowerCase() || '';

    // Match the format: "{color}-{zone}-{level}.png"
    console.log(userNeeds?.needsEV, color, zone)
    if (userNeeds?.needsEV && color === 'orange' && zone === 'b' ) {
      return evOrangeB1;
    }

    // Default to general blue B1 map for general parking
    return generalBlueB1;
  };

  // Function to get detailed map image
  const getDetailedMapImage = () => {
    if (!recommendedParking) return mapDemo;

    // Parse the location string to get color and zone
    const location = recommendedParking.location?.toLowerCase() || '';
    const color = recommendedParking.color?.toLowerCase() || '';
    const zone = recommendedParking.zone?.toLowerCase() || '';

    // Match the format: "{color}-{zone}-{level}.png"
    if (userNeeds?.needsEV && color === 'orange' && zone === 'b') {
      return evOrangeB1;
    }

    return generalBlueB1;
  };

  // useEffect(() => {
  //   // Update every 30 seconds
  //   const interval = setInterval(() => {
  //     lastUpdateTimeRef.current = 0;
  //     // Randomly adjust parking spots within reasonable bounds
  //     parkingSpotsRef.current = {
  //       p1: Math.max(0, Math.min(20, parkingSpotsRef.current.p1 + Math.floor(Math.random() * 3) - 1)),
  //       p2: Math.max(0, Math.min(10, parkingSpotsRef.current.p2 + Math.floor(Math.random() * 3) - 1))
  //     };
  //     forceUpdate({}); // Force a re-render to update the display
  //   }, 5000);


  //   return () => {
  //     clearInterval(interval);
  //   };
  // }, []);

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
      <span className="text-lg text-gray-500 mb-6">
        Last update: {'30 secs'} ago
      </span>
      
      {/* Parking spot counters */}
      <div className="flex gap-4 mb-8">
        <div className="flex-1 max-w-[200px] bg-white rounded-xl p-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="text-[#BE8544] text-lg">P1</div>
            <div className="text-xl font-medium">{parkingSpotsRef.current.p1} spots</div>
          </div>
        </div>
        
        <div className="flex-1 max-w-[200px] bg-white rounded-xl p-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="text-[#BE8544] text-lg">P2</div>
            <span className="text-xl font-medium">{parkingSpotsRef.current.p2} spots</span>
          </div>
        </div>
      </div>
      
      {/* Main map container with flex centering */}
      <div className="flex-1 flex items-center justify-center">
        <div className="cursor-pointer" onClick={handleImageClick}>
          <img 
            src={getMapImage()}
            alt="Parking Map" 
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
              src={getDetailedMapImage()}
              alt="Detailed Parking Map" 
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
