import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const Menu = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.user);

  const menuItems = [
    {
      icon: "📝",
      title: "Registered Vehicle",
      path: "/registered-vehicle"
    },
    {
      icon: "🅿️",
      title: "Record My Parking Spot",
      path: "/record-spot"
    },
    {
      icon: "🔍",
      title: "Find My Car",
      path: "/find-car"
    },
    {
      icon: "❓",
      title: "Help Center",
      path: "/help"
    }
  ];

  return (
    <div className="h-screen bg-white">
      {/* Header with X button aligned right */}
      <div className="fixed top-0 left-0 right-0 h-16 flex items-center justify-end px-4 py-3 bg-white z-10">
        <button 
          className="p-2 hover:bg-gray-100 rounded-full"
          onClick={() => navigate(-1)}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6" 
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
      </div>

      {/* Profile Section */}
      <div className="pt-16 px-4">
        <div className="flex items-center p-4 bg-gray-100 rounded-lg my-6">
          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-xl">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="ml-4">
            <h2 className="text-lg font-semibold">{`${user?.firstName} ${user?.lastName}`}</h2>
          </div>
          <button 
            className="ml-auto bg-gray-200 px-4 py-2 rounded-full"
            onClick={() => navigate('/profile')}
          >
            View Profile
          </button>
        </div>

        {/* Menu Items */}
        <div className="space-y-2">
          {menuItems.map((item, index) => (
            <button
              key={index}
              className="w-full flex items-center p-4 hover:bg-gray-50 rounded-lg"
              onClick={() => navigate(item.path)}
              disabled
            >
              <span className="text-2xl mr-4">{item.icon}</span>
              <span className="text-lg">{item.title}</span>
              <span className="ml-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Menu; 