import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { useLocation, Link } from 'react-router-dom';
import { setShowMapNotification } from '../store/navigationSlice';

const Navigation = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const showMapNotification = useSelector((state: RootState) => state.navigation.showMapNotification);

  const handleMapClick = () => {
    dispatch(setShowMapNotification(false));
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-around items-center h-20 bg-[#FCF9F6]">
      <Link to="/chatbot" className={`flex flex-col items-center ${location.pathname === '/chatbot' ? 'text-blue-500' : 'text-gray-500'}`}>
        <img 
          src="/copilot-logo-colored.png" 
          alt="Copilot" 
          className="w-6 h-6"
        />
        <span className="text-xs">Copilot</span>
      </Link>
      
      <Link 
        to="/map" 
        className={`flex flex-col items-center relative ${location.pathname === '/map' ? 'text-blue-500' : 'text-gray-500'}`}
        onClick={handleMapClick}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6-3l-6-3m6 3l6 3m6-3a1 1 0 01.447.894v10.764a1 1 0 01-1.447.894L15 17m-6-3l6-3" />
        </svg>
        <span className="text-xs">Map</span>
        {showMapNotification && (
          <>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <div className="absolute bottom-[100%]  transform -translate-x-1/2 mb-2 h-10 bg-black/80 text-white text-xs rounded-lg whitespace-nowrap flex items-center px-3 animate-bounce">
              Get Interaction Guide
              <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-black/80" />
            </div>
          </>
        )}
      </Link>
    </div>
  );
};

export default Navigation; 