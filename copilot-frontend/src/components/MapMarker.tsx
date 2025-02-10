import React, { useState } from 'react';
import { MapMarker as MapMarkerType } from '../types/map';

interface Props {
  marker: MapMarkerType;
}

const MapMarker: React.FC<Props> = ({ marker }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="absolute"
      style={{
        left: `${marker.x}%`,
        top: `${marker.y}%`,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <div
        className="relative"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {marker.type === 'entrance' ? (
          <div className="w-8 h-8 flex items-center justify-center">
            <div className="animate-bounce">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 3a1 1 0 011 1v10.586l3.293-3.293a1 1 0 011.414 1.414l-5 5a1 1 0 01-1.414 0l-5-5a1 1 0 111.414-1.414L9 14.586V4a1 1 0 011-1z" />
              </svg>
            </div>
          </div>
        ) : (
          <div className="w-6 h-6 bg-red-500 rounded-full animate-pulse" />
        )}
        
        {showTooltip && (
          <div className="absolute z-10 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm tooltip dark:bg-gray-700"
               style={{
                 bottom: '100%',
                 left: '50%',
                 transform: 'translateX(-50%)',
                 marginBottom: '8px',
                 whiteSpace: 'nowrap'
               }}>
            {marker.tooltip}
            <div className="tooltip-arrow" />
          </div>
        )}
      </div>
    </div>
  );
};

export default MapMarker; 