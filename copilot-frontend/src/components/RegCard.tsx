import React from 'react';
import CarIcon from '../assets/icon/Car.png';

interface RegCardProps {
  CarPlate: string;
  User: string;
  Color: string;
  State: string;
  Date: string;
}

const formatEventTime = (timeString: string) => {
  const date = new Date(timeString);
  const endDate = new Date(date.getTime() + 90 * 60000);
  
  return `${date.toLocaleDateString('en-US', { 
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })}, ${date.getHours() % 12 || 12}${date.getMinutes() ? `:${date.getMinutes()}` : ''}${date.getHours() >= 12 ? 'pm' : 'am'}-${endDate.getHours() % 12 || 12}:${endDate.getMinutes()}${endDate.getHours() >= 12 ? 'pm' : 'am'} (PST)`;
};

export const RegCard: React.FC<RegCardProps> = ({ CarPlate, User, Color, State, Date }) => (
    <div className="bg-white rounded-[15px] p-6 shadow-md border border-gray-200 my-2 mb-10">
      <div className="space-y-2">
        {/* License Plate Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={CarIcon} alt="Car" className="w-4 h-4" />
            <span className="font-medium text-sm">#{CarPlate}</span>
          </div>
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-[12px] text-sm">
            Registered
          </span>
        </div>
  
        {/* Information Grid */}
        <div className="space-y-0 text-sm">
          <div className="grid grid-cols-3 py-2 border-b border-gray-200">
							<span className="text-gray-400">User</span>
							<span className="font-medium text-right col-span-2">{User}</span>
					</div>
					<div className="grid grid-cols-3 py-2 border-b border-gray-200">
						<span className="text-gray-400">Color/Make</span>
						<span className="font-medium text-right col-span-2">{Color}</span>
					</div>
					<div className="grid grid-cols-3 py-2 border-b border-gray-200">
						<span className="text-gray-400">State</span>
						<span className="font-medium text-right col-span-2">{State}</span>
					</div>
					<div className="grid grid-cols-3 py-2">
						<span className="text-gray-400">Date</span>
						<span className="font-medium text-right col-span-2">{formatEventTime(Date)}</span>
					</div>
        </div>
      </div>
    </div>
  );