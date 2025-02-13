import React, { useState, useEffect, useRef } from 'react';
import { MapMarker as MapMarkerType } from '../types/map';

interface Props {
  marker: MapMarkerType;
}

const MapMarker: React.FC<Props> = ({ marker }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const bubbleRef = useRef<HTMLDivElement>(null);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is on the expanded bubble or its children
      if (bubbleRef.current && 
          !bubbleRef.current.contains(event.target as Node) && 
          // Only check if click target is not the bubble trigger itself
          !(event.target as Element).closest('.bubble-trigger')) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [isExpanded]);

  return (
    <div
      className="absolute z-10"
      style={{
        left: `${marker.x}%`,
        top: `${marker.y}%`,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <div
        className="relative"
      >
        {marker.type === 'entrance' ? (
          <div className="relative">
            <div className="relative">
              <div className="w-[120px] h-10 bg-[#fbe7d7] rounded-lg flex items-center justify-center">
                <span className="text-black text-sm">{marker.tooltip}</span>
              </div>
              <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-[#fbe7d7]" />
            </div>
          </div>
        ) : (
          <div 
            className="relative clickable"
          >
            <div 
              className="absolute bottom-[30px] left-1/2 -translate-x-1/2 cursor-pointer bubble-trigger"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
                console.log('Bubble clicked, isExpanded:', !isExpanded);
              }}
            >
              <div className="w-[120px] h-10 bg-[#fbe7d7] rounded-lg flex items-center justify-center">
                <span 
                  className="text-black text-sm"
                >
                  {marker.tooltip}
                </span>
              </div>
              <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-[#fbe7d7]" />
            </div>
            <div 
              className="w-3 h-3 bg-[#fbe7d7] border border-white rounded-full animate-pulse cursor-pointer bubble-trigger"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
                console.log('Dot clicked, isExpanded:', !isExpanded);
              }}
            />
            {isExpanded && (
              <div 
                ref={bubbleRef}
                className="absolute bottom-[100%] left-1/2 transform -translate-x-1/2 mb-4 bg-[#fbe7d7] rounded-lg shadow-lg p-4 w-[200px] clickable z-50"
              >
                {/* Close button */}
                <button 
                  className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(false);
                  }}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M6 18L18 6M6 6l12 12" 
                    />
                  </svg>
                </button>

                <div className="flex flex-col gap-1">
                  <div className="text-md font-semibold">{marker.tooltip}</div>
                  <div className="text-xs">
                    Available spots: 45/100
                  </div>
                  {marker.image && (
                    <img 
                      src={marker.image} 
                      alt={`${marker.tooltip} parking`}
                      className="w-full h-20 object-cover"
                    />
                  )}
                </div>
                <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-[#fbe7d7]" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapMarker; 