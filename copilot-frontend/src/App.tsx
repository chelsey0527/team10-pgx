import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from 'react-redux';
import { store } from './store/store';
import Activation from "./pages/Activation";
import Landing from "./pages/Landing";
import Chatbot from "./pages/Chatbot";
import Map from "./pages/Map";
import Menu from './pages/Menu';

// Create a wrapper component to use useLocation
const AppContent = () => {
  return (
    <div className="h-screen font-['ABC_Ginto']">
      <Routes>
        <Route path="/" element={<Activation />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/map" element={<Map />} />
        <Route path="/menu" element={<Menu />} />
      </Routes>
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
