import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import mapDemo from '../assets/map-demo.png';
import generalBlueB110 from '../assets/general-blue-b-110.png';
import generalBlueB132 from '../assets/general-blue-b-132.png';
import evOrangeB1 from '../assets/ev-orange-b-1.png';
import floor2 from '../assets/floor-2.png';
import { setParkingRecommendation } from '../store/parkingSlice';
import { RootState } from '../store/store';
import Draggable from 'react-draggable';
import { mapConfigs } from '../config/mapConfigs';
import MapMarker from '../components/MapMarker';
import voiceIcon from '../assets/icon/Voice.png';
import WebSocketService from '../services/websocketService';
import BackButton from 'components/BackButton';

const Map = () => {
  const dispatch = useDispatch();
  const [parkingSpots, setParkingSpots] = useState({ p1: 20, p2: 20 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState('P1');
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const [dragBounds, setDragBounds] = useState({ left: 0, top: 0, right: 0, bottom: 0 });
  
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

  // Function to determine which map to show
  const getMapImage = () => {
    if (selectedLevel === 'P2') {
      return floor2;
    }

    if (!recommendedParking) return mapDemo;

    const color = recommendedParking.color?.toLowerCase() || '';
    const zone = recommendedParking.zone?.toLowerCase() || '';

    if (color === 'orange' && zone === 'b') {
      return evOrangeB1;
    }

    // Convert stallNumber to integer and compare
    const stallNum = parseInt(recommendedParking.stallNumber?.toString() || '132');
    return stallNum === 132 ? generalBlueB132 : generalBlueB110;
  };

  // Function to get detailed map image
  const getDetailedMapImage = () => {
    if (!recommendedParking) return mapDemo;

    // Parse the location string to get color and zone
    const color = recommendedParking.color?.toLowerCase() || '';
    const zone = recommendedParking.zone?.toLowerCase() || '';

    // Match the format: "{color}-{zone}-{level}.png"
    if (color === 'orange' && zone === 'b') {
      return evOrangeB1;
    }

    return generalBlueB110;
  };

  const handleImageLoad = () => {
    // Add minimum 1 second delay before hiding the loading spinner
    setTimeout(() => {
      setIsImageLoading(false);
    }, 1000);
  };

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
    if (!recommendedParking) return mapConfigs['general-blue-b110'];
    
    const color = recommendedParking.color?.toLowerCase() || '';
    const zone = recommendedParking.zone?.toLowerCase() || '';
    
    if (color === 'orange' && zone === 'b') {
      return mapConfigs['ev-orange-b1'];
    }
    
    const stallNum = parseInt(recommendedParking.stallNumber?.toString() || '132');
    return stallNum === 132 ?mapConfigs['general-blue-b132'] : mapConfigs['general-blue-b110'];
  };

  // Add this new function to handle level selection
  const handleLevelSelect = (level: string) => {
    setSelectedLevel(level);
  };

  // Get parking recommendation from Redux at component level
  const parkingRecommendation = useSelector((state: RootState) => state.parking?.recommendation);

  // Modified useEffect to use the parkingRecommendation from props
  useEffect(() => {
    if (!parkingRecommendation) {
      const initialParkingData = {
        location: "blue Zone B",
        elevator: "North",
        spots: 5,
        stallNumber: "132",
        color: "blue",
        zone: "B",
        showMapNotification: true
      };
      
      dispatch(setParkingRecommendation(initialParkingData));
    }
  }, [parkingRecommendation, dispatch]); // Add dependencies

  // Function to get available spots for a marker
  const getAvailableSpots = (markerTooltip: string) => {
    if (!parkingRecommendation) return 5;
    
    const isRecommendedSpot = 
      markerTooltip.toLowerCase().includes(parkingRecommendation.color?.toLowerCase() || '') &&
      markerTooltip.toLowerCase().includes(parkingRecommendation.zone?.toLowerCase() || '');

    if (isRecommendedSpot) {
      return parkingRecommendation.spots || 5;
    }
    
    return 5;
  };

  // Update the WebSocket effect to include timestamp updates
  useEffect(() => {
    const wsService = WebSocketService.getInstance();
    
    // Initial connection
    const unsubscribe = wsService.subscribe((message) => {
      setParkingSpots(prev => ({
        p1: message,
        p2: prev.p2
      }));
      setLastUpdateTime(new Date());
    });

    // Set up polling interval for every minute
    const pollInterval = setInterval(() => {
      wsService.reconnect(); // Reconnect to get fresh data
    }, 60000); // 60000ms = 1 minute

    return () => {
      unsubscribe();
      clearInterval(pollInterval);
    };
  }, []);

  // Update the time formatting function to be more precise
  const getTimeSinceLastUpdate = () => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - lastUpdateTime.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'a minute';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
    } else {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] bg-white pt-10 pb-2">
      <BackButton />
      <span className="text-lg mb-4 font-bold px-8">Visitor Parking Spots Available </span>
      <span className="text-sm text-gray-500 mb-6 px-8">
        Last update: {getTimeSinceLastUpdate()} ago
      </span>
      
      {/* Parking spot counters */}
      <div className="flex gap-4 mb-2 px-8">
        <div className="flex-1 max-w-[200px] bg-white rounded-xl shadow-md flex items-center h-12">
          <div className="flex items-center justify-center text-[#BE8544] text-lg bg-[#fbe7d7] rounded-xl h-full w-10">P1</div>
          <div className="text-xl font-medium flex-1 text-center">{parkingSpots.p1}</div>
        </div>
        
        <div className="flex-1 max-w-[200px] bg-white rounded-xl shadow-md flex items-center h-12">
          <div className="flex items-center justify-center text-[#BE8544] text-lg bg-[#fbe7d7] rounded-xl h-full w-10">P2</div>
          <div className="text-xl font-medium flex-1 text-center">{parkingSpots.p2}</div>
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
              className="max-w-[200%] h-auto pt-[100px] transition-opacity duration-300 ease-in-out"
              draggable={false}
              style={{ opacity: isImageLoading ? 0 : 1 }}
              onLoad={() => setIsImageLoading(false)}
            />
            {getCurrentMapConfig().markers.map(marker => (
              <MapMarker 
                key={marker.id} 
                marker={marker} 
                selectedLevel={selectedLevel}
                availableSpots={getAvailableSpots(marker.tooltip)}
              />
            ))}
          </div>
        </Draggable>

        {/* Add the vertical level selector */}
        <div className="absolute left-4 bottom-4 flex flex-col py-2 gap-1 bg-[#F7F7F7] rounded-xl overflow-hidden">
          {['P1', 'P2'].map((level) => (
            <button
              key={level}
              onClick={() => {
                setIsImageLoading(true);
                handleLevelSelect(level);
              }}
              className={`px-4 py-2 text-sm transition-all duration-300 ${
                selectedLevel === level
                  ? 'text-black font-bold'
                  : 'text-gray-400 hover:bg-gray-100'
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        {/* Add Voice Mode button */}
        <div className="absolute right-4 bottom-2 opacity-90">
          <div className="flex items-center gap-2 bg-[#F7F7F7] rounded-xl px-4 py-3">
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
                  <MapMarker 
                    key={marker.id} 
                    marker={marker} 
                    selectedLevel={selectedLevel}
                    availableSpots={getAvailableSpots(marker.tooltip)}
                  />
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
