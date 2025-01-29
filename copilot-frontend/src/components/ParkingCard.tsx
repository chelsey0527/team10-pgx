import React from 'react';

interface ParkingCardProps {
  location: string;
  level: string;
  zone: string;
}

export const ParkingCard: React.FC<ParkingCardProps> = ({ location, level, zone }) => (
  <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200 my-2">
    <h3 className="font-semibold text-lg mb-2">Parking Recommendation</h3>
    <div className="space-y-2">
      <p><span className="font-medium">Location:</span> {location}</p>
      <p><span className="font-medium">Level:</span> {level}</p>
      <p><span className="font-medium">Zone:</span> {zone}</p>
    </div>
  </div>
); 