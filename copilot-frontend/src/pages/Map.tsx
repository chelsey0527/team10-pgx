import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import mapDemo from '../assets/map-demo.png';
import generalBlueB1 from '../assets/general-blue-b-1.png';
import evOrangeB1 from '../assets/ev-orange-b-1.png';
import { setParkingRecommendation } from '../store/parkingSlice';
import { RootState } from '../store/store';
import Draggable from 'react-draggable';
import { mapConfigs } from '../config/mapConfigs';
import MapMarker from '../components/MapMarker';
import voiceIcon from '../assets/icon/Voice.png';
// import { getParkingRecommendation } from '../services/api';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';
const GROQ_API_KEY = process.env.REACT_APP_API_KEY;

const Map = () => {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  
  // Convert state to refs for values that don't need re-renders
  // const lastUpdateTimeRef = useRef(0);
  const parkingSpotsRef = useRef({ p1: 36, p2: 23 });

  // Update the selector to use typed state
  const userNeeds = useSelector((state: RootState) => 
    state.user?.user?.specialNeeds ?? {
      needsEV: false,
      needsAccessible: false,
      needsCloserToElevator: false
    }
  );
  const recommendedParking = useSelector((state: RootState) => state.parking?.recommendation);
  
  console.log('userNeeds:', userNeeds);
  console.log('Recommended parking from Redux:', recommendedParking);

  // Add useEffect to log user needs when component mounts or userNeeds changes
  useEffect(() => {
    console.log('Map component - userNeeds changed:', userNeeds);
  }, [userNeeds]);

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

  // Add state for tracking drag bounds
  const [dragBounds, setDragBounds] = useState({ left: 0, top: 0, right: 0, bottom: 0 });
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Add effect to calculate drag bounds
  useEffect(() => {
    if (mapContainerRef.current) {
      const container = mapContainerRef.current;
      const containerRect = container.getBoundingClientRect();
      const bounds = {
        left: containerRect.width - containerRect.width * 2.5,
        top: containerRect.height - containerRect.height * 2.5,
        right: 0,
        bottom: 0
      };
      setDragBounds(bounds);
    }
  }, []);

  // Function to get current map config
  const getCurrentMapConfig = () => {
    if (!recommendedParking) return mapConfigs['general-blue-b1'];
    
    const color = recommendedParking.color?.toLowerCase() || '';
    const zone = recommendedParking.zone?.toLowerCase() || '';
    
    if (userNeeds?.needsEV && color === 'orange' && zone === 'b') {
      return mapConfigs['ev-orange-b1'];
    }
    
    return mapConfigs['general-blue-b1'];
  };

  const [selectedLevel, setSelectedLevel] = useState('P1');

  // Add this new function to handle level selection
  const handleLevelSelect = (level: string) => {
    setSelectedLevel(level);
    // Here you can add logic to change the map view based on level
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] bg-gradient-to-b from-[#FCF9F6] to-[#f3e6d8] pt-10 pb-2">
      <span className="text-lg mb-4 font-bold px-8">Visitor Parking Spots Available </span>
      <span className="text-sm text-gray-500 mb-6 px-8">
        Last update: {'30 secs'} ago
      </span>
      
      {/* Parking spot counters */}
      <div className="flex gap-4 mb-8 px-8">
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
      
      {/* Main map container - add relative positioning */}
      <div className="flex-1 flex items-start justify-center overflow-hidden relative" ref={mapContainerRef}>
        <Draggable
          bounds={dragBounds}
          defaultPosition={{x: 0, y: 0}}
          cancel=".clickable"
          axis="x"
        >
          <div className="cursor-move relative">
            <img 
              src={getMapImage()}
              alt="Parking Map" 
              className="max-w-[240%] h-auto"
              draggable={false}
            />
            {getCurrentMapConfig().markers.map(marker => (
              <MapMarker key={marker.id} marker={marker} />
            ))}
          </div>
        </Draggable>

        {/* Add the vertical level selector */}
        <div className="absolute left-4 bottom-4 flex flex-col py-2 gap-1 bg-[#F7F7F7] rounded-xl overflow-hidden">
          {['P1', 'P2', 'P3', 'P4'].map((level) => (
            <button
              key={level}
              onClick={() => handleLevelSelect(level)}
              className={`px-4 py-2 text-sm transition-colors ${
                selectedLevel === level
                  ?  'text-black font-bold'
                  : 'text-gray-400 '
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        {/* Add Voice Mode button */}
        <div className="absolute right-4 bottom-2 opacity-90">
          <div className="flex items-center gap-2 bg-[#F7F7F7] rounded-xl px-4 py-2">
            <img src={voiceIcon} alt="Voice Mode" className="w-5 h-5" />
            <span className="text-sm text-gray-600">Voice Mode</span>
          </div>
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
            <Draggable bounds="parent" defaultPosition={{x: 0, y: 0}}>
              <div className="relative">
                <img 
                  src={getDetailedMapImage()}
                  alt="Detailed Parking Map" 
                  className="max-h-[90vh] max-w-[90vw] cursor-move"
                  onLoad={handleImageLoad}
                  style={{ opacity: isImageLoading ? '0' : '1' }}
                  draggable={false}
                />
                {getCurrentMapConfig().markers.map(marker => (
                  <MapMarker key={marker.id} marker={marker} />
                ))}
              </div>
            </Draggable>
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;
