import React from 'react';
import meetingImage from '../assets/msg-meeting.png';
import MapPinIcon from '../assets/icon/MapPin.png';
import UsersIcon from '../assets/icon/Users.png';

interface MeetingCardProps {
  EventName: string;
  EventTime: string;
  Location: string;
  EventHolder: string;
  className?: string;
}

const formatEventTime = (timeString: string) => {
  const date = new Date(timeString);
  const endDate = new Date(date.getTime() + 90 * 60000); // Adding 90 minutes
  
  return `${date.toLocaleDateString('en-US', { 
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })}, ${date.getHours() % 12 || 12}${date.getMinutes() ? `:${date.getMinutes()}` : ''}${date.getHours() >= 12 ? 'pm' : 'am'}-${endDate.getHours() % 12 || 12}:${endDate.getMinutes()}${endDate.getHours() >= 12 ? 'pm' : 'am'} (PST)`;
};

export const MeetingCard: React.FC<MeetingCardProps> = ({ EventName, EventTime, Location, EventHolder, className }) => (
  <div className={`bg-white rounded-[15px] p-4 shadow-md border border-gray-200 my-2 mb-10 ${className || ''}`}>
    <div className="space-y-1">
      <img src={meetingImage} alt="meeting" className="w-full h-18 rounded-xl mb-3" />
      <div className="space-y-0.5">
        <p><span className="font-semibold">{EventName}</span></p>
        <p><span className="text-gray-400">{formatEventTime(EventTime)}</span></p>
      </div>
      <p className="flex items-center gap-2">
        <img src={MapPinIcon} alt="location" className="h-4 w-4" />
        Building {Location}
      </p>
      <p className="flex items-center gap-2">
        <img src={UsersIcon} alt="users" className="h-4 w-4" />
        {EventHolder}
      </p>
    </div>
  </div>
); 