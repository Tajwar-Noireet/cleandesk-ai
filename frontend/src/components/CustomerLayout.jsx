import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Logo from './Logo';
import { UserIcon, ShieldIcon } from './Icons';

const CustomerLayout = ({ children }) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const isSupabaseConfigured = 
      import.meta.env.VITE_SUPABASE_URL && 
      import.meta.env.VITE_SUPABASE_URL !== 'https://your-project.supabase.co';

    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem('sb-access-token');
      localStorage.removeItem('cd-customer-email');
    }
    localStorage.removeItem('cd-user-role');
    navigate('/customer/login');
  };

  return (
    <div className="dashboard-wrapper customer-portal-shell" style={{ minHeight: '100vh', backgroundColor: '#F8F8F7', display: 'flex', flexDirection: 'column' }}>
      {/* Customer Header navbar */}
      <header 
        style={{
          height: '64px',
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'between',
          padding: '0 2rem',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', width: '100%', justifyContent: 'space-between' }}>
          {/* Logo */}
          <Logo size={22} showText={true} />

          {/* Navigation links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <NavLink 
              to="/customer/dashboard" 
              className={({ isActive }) => `customer-nav-item ${isActive ? 'active' : ''}`}
              style={({ isActive }) => ({
                fontSize: '0.85rem',
                color: isActive ? '#0A0A0A' : '#6B7280',
                fontWeight: isActive ? '600' : '500',
                textDecoration: 'none',
                padding: '0.4rem 0.6rem',
                borderRadius: '4px'
              })}
            >
              Overview
            </NavLink>
            <NavLink 
              to="/customer/conversations" 
              className={({ isActive }) => `customer-nav-item ${isActive ? 'active' : ''}`}
              style={({ isActive }) => ({
                fontSize: '0.85rem',
                color: isActive ? '#0A0A0A' : '#6B7280',
                fontWeight: isActive ? '600' : '500',
                textDecoration: 'none',
                padding: '0.4rem 0.6rem',
                borderRadius: '4px'
              })}
            >
              Chat Logs
            </NavLink>
            <NavLink 
              to="/customer/bookings" 
              className={({ isActive }) => `customer-nav-item ${isActive ? 'active' : ''}`}
              style={({ isActive }) => ({
                fontSize: '0.85rem',
                color: isActive ? '#0A0A0A' : '#6B7280',
                fontWeight: isActive ? '600' : '500',
                textDecoration: 'none',
                padding: '0.4rem 0.6rem',
                borderRadius: '4px'
              })}
            >
              My Bookings
            </NavLink>
            <NavLink 
              to="/customer/profile" 
              className={({ isActive }) => `customer-nav-item ${isActive ? 'active' : ''}`}
              style={({ isActive }) => ({
                fontSize: '0.85rem',
                color: isActive ? '#0A0A0A' : '#6B7280',
                fontWeight: isActive ? '600' : '500',
                textDecoration: 'none',
                padding: '0.4rem 0.6rem',
                borderRadius: '4px'
              })}
            >
              Profile
            </NavLink>
          </nav>

          {/* Right side logout and info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: '#6B7280' }}>
              <ShieldIcon size={12} />
              <span>Customer Portal</span>
            </div>
            <button 
              onClick={handleSignOut}
              className="btn-secondary" 
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: '500',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '2.5rem 2rem', maxWidth: '1100px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        {children}
      </main>
    </div>
  );
};

export default CustomerLayout;
