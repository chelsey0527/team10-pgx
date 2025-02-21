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
import { Dialog } from '@headlessui/react';

// Add new interface for parking details
interface ParkingDetails {
  zone: string;
  availableSpots: number;
  totalSpots: number;
  hasEVCharging: boolean;
  entryInfo: string;
  walkInfo: string;
}

// Add this new interface for multiple parking options
interface ParkingOption {
  zone: string;
  availableSpots: number;
  totalSpots: number;
  hasEVCharging: boolean;
  entryInfo: string;
  walkInfo: string;
  walkType: string;
  evStatus: 'available' | 'unavailable';
}

const Map = () => {
  const dispatch = useDispatch();
  const [parkingSpots, setParkingSpots] = useState({ p1: 20, p2: 20 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState('P1');
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const [dragBounds, setDragBounds] = useState({ left: 0, top: 0, right: 0, bottom: 0 });
  const [showParkingOptions, setShowParkingOptions] = useState(true);
  
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

  // Add new function to get parking details
  // const getParkingDetails = (): ParkingDetails => {
  //   if (!recommendedParking) {
  //     return {
  //       zone: 'P1 Blue Zone A Row 2',
  //       availableSpots: 4,
  //       totalSpots: 8,
  //       hasEVCharging: true,
  //       entryInfo: 'Enter from NE 36th St Garage Entry',
  //       walkInfo: '1 min walk to North Elevator'
  //     };
  //   }

  //   return {
  //     zone: `${selectedLevel} ${recommendedParking.color} Zone ${recommendedParking.zone}`,
  //     availableSpots: recommendedParking.spots || 0,
  //     totalSpots: 8,
  //     hasEVCharging: true,
  //     entryInfo: 'Enter from NE 36th St Garage Entry',
  //     walkInfo: '1 min walk to North Elevator'
  //   };
  // };

  // Update the getParkingOptions function to return multiple options
  const getParkingOptions = (): ParkingOption[] => {
    return [
      {
        zone: 'P1 Blue Zone A Row 2',
        availableSpots: 2,
        totalSpots: 8,
        hasEVCharging: true,
        entryInfo: 'Enter from NE 36th St Garage Entry',
        walkInfo: '1 min walk to North Elevator',
        walkType: 'Shortest Walk',
        evStatus: 'available'
      },
      {
        zone: 'P1 Blue Zone A Row 5',
        availableSpots: 8,
        totalSpots: 8,
        hasEVCharging: true,
        entryInfo: 'Enter from 156th Ave NE Garage Entry',
        walkInfo: '2 min walk to North Elevator',
        walkType: 'More Spacious Parking',
        evStatus: 'unavailable'
      }
    ];
  };

  return (
    <div className="flex flex-col h-[100vh] bg-gradient-to-b from-white to-[#f3e6d8]">
      <div className="flex items-center px-8 py-6 border-gray-200 bg-white">
        <BackButton />
        <h1 className="flex-1 text-md text-center">Map</h1>
      </div>

      <div className="flex flex-col flex-1">
        <span className="text-xl mt-4 ml-4 mb-4 font-medium px-8">East Campus Garage</span>
        
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

          {/* Move and update the Parking Options button */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
            <button
              onClick={() => setShowParkingOptions(true)}
              className="bg-black text-white rounded-full px-8 py-3 text-sm font-medium shadow-lg"
            >
              View Details
            </button>
          </div>
        </div>

        {/* Add Parking Options Modal */}
        <Dialog
          open={showParkingOptions}
          onClose={() => setShowParkingOptions(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0" aria-hidden="true" />
          
          <div className="fixed inset-x-0 bottom-0 flex items-end justify-center">
            <Dialog.Panel className="w-full bg-white p-6 rounded-t-3xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] border-t border-gray-100">
              {/* Make drag indicator clickable */}
              <div 
                className="absolute left-1/2 transform -translate-x-1/2 -top-8 flex flex-col items-center cursor-pointer" 
                onClick={() => setShowParkingOptions(false)}
              >
                <div className="w-1 h-8 bg-black/10 rounded-t-full" />
              </div>
              
              {/* Make drag handle clickable */}
              <div 
                className="flex justify-center mb-4 cursor-pointer" 
                onClick={() => setShowParkingOptions(false)}
              >
                <div className="w-12 h-1 bg-gray-300 rounded-full" />
              </div>

              <div className="mb-4">
                <Dialog.Title className="text-xl">
                  Parking Options
                </Dialog.Title>
              </div>

              {getParkingOptions().map((option, index) => (
                <div key={index} className={index !== getParkingOptions().length - 1 ? 'mb-4' : ''}>
                  <div className="bg-[#02B7EA] text-white rounded-t-lg px-4 py-2">
                    <div className="flex justify-between items-center">
                      <span className="text-md font-bold">
                        {option.zone}
                      </span>
                      <span className="text-sm">
                        {option.walkType}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-b-lg p-4">
                    <div className="flex justify-between items-center">
                      <div className="text-xl font-bold">
                        {option.availableSpots} Spots Available
                        <span className="text-sm font-normal ml-2 opacity-80">
                          / {option.totalSpots}
                        </span>
                      </div>
                      <button
                        onClick={() => setShowParkingOptions(false)}
                        className="bg-black text-white rounded-full px-6 py-2 text-sm font-medium"
                      >
                        View Details
                      </button>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      {option.evStatus === 'available' ? (
                        <svg className="w-5 h-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
                        </svg>
                      )}
                      <span className={option.evStatus === 'available' ? 'text-green-600' : 'text-red-600'}>
                        EV Charging
                      </span>
                    </div>

                    <p className="text-gray-700 text-sm">{option.entryInfo}</p>
                    <p className="text-gray-700 text-sm">{option.walkInfo}</p>
                  </div>
                </div>
              ))}
            </Dialog.Panel>
          </div>
        </Dialog>
      </div>

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
