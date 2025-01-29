import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Registration from "./pages/Registration";
import Chatbot from "./pages/Chatbot";
import Map from "./pages/Map";
import { Provider } from 'react-redux';
import { store } from './store/store';

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<Registration />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/map" element={<Map />} />
        </Routes>
      </Router>
    </Provider>
  );
};

export default App;
