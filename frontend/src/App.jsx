import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Demo from './pages/Demo';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BusinessSetup from './pages/BusinessSetup';
import ServicesManager from './pages/ServicesManager';
import FAQManager from './pages/FAQManager';
import Leads from './pages/Leads';
import Conversations from './pages/Conversations';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Marketing & Demo Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/login" element={<Login />} />

        {/* Dashboard Owner Portal Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/business" element={<BusinessSetup />} />
        <Route path="/dashboard/services" element={<ServicesManager />} />
        <Route path="/dashboard/faqs" element={<FAQManager />} />
        <Route path="/dashboard/leads" element={<Leads />} />
        <Route path="/dashboard/conversations" element={<Conversations />} />
      </Routes>
    </Router>
  );
}

export default App;
