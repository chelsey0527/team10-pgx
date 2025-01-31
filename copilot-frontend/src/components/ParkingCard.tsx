import React from 'react';

interface ParkingCardProps {
  location: string;
  level: string;
  zone: string;
  className?: string;
}

export const ParkingCard: React.FC<ParkingCardProps> = ({ location, level, zone, className }) => (
  <div className={`bg-white rounded-lg p-4 shadow-md border border-gray-200 my-2 ${className || ''}`}>
    <h3 className="font-semibold text-md mb-2">Your Parking Recommendation</h3>
    <div className="space-y-2">
      <p><span className="font-medium">Location:</span> {location}</p>
      <p><span className="font-medium">Level:</span> {level}</p>
      <p><span className="font-medium">Zone:</span> {zone}</p>
    </div>
  </div>
); 