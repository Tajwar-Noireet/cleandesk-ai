import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Demo from './pages/Demo';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BusinessSetup from './pages/BusinessSetup';
import ServicesManager from './pages/ServicesManager';
import FAQManager from './pages/FAQManager';
import Leads from './pages/Leads';
import Conversations from './pages/Conversations';
import { supabase } from './supabaseClient';

const ProtectedRoute = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isSupabaseConfigured = 
      import.meta.env.VITE_SUPABASE_URL && 
      import.meta.env.VITE_SUPABASE_URL !== 'https://your-project.supabase.co';

    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        fontFamily: 'sans-serif',
        color: '#64748b' 
      }}>
        Verifying secure owner session...
      </div>
    );
  }

  const isSupabaseConfigured = 
    import.meta.env.VITE_SUPABASE_URL && 
    import.meta.env.VITE_SUPABASE_URL !== 'https://your-project.supabase.co';

  if (isSupabaseConfigured && !session) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Marketing & Demo Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/login" element={<Login />} />

        {/* Dashboard Owner Portal Routes (Protected) */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/business" element={
          <ProtectedRoute>
            <BusinessSetup />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/services" element={
          <ProtectedRoute>
            <ServicesManager />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/faqs" element={
          <ProtectedRoute>
            <FAQManager />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/leads" element={
          <ProtectedRoute>
            <Leads />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/conversations" element={
          <ProtectedRoute>
            <Conversations />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
