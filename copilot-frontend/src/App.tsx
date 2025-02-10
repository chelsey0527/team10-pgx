import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Provider } from 'react-redux';
import { store } from './store/store';
import Registration from "./pages/Registration";
import Chatbot from "./pages/Chatbot";
import Map from "./pages/Map";
import Navigation from './components/Navigation';

// Create a wrapper component to use useLocation
const AppContent = () => {
  const location = useLocation();
  const showNavigation = location.pathname !== '/';

  return (
    <div className="h-screen ">
      <Routes>
        <Route path="/" element={<Registration />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/map" element={<Map />} />
      </Routes>
      {showNavigation && <Navigation />}
    </div>
  );
};

const App = () => {
  return (
    <Provider store={store}>
        <Router>
          <AppContent />
        </Router>
    </Provider>
  );
};

export default App;
