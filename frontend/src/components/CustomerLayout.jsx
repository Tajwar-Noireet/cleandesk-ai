import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Logo from './Logo';
import { ShieldIcon } from './Icons';

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
    <div className="customer-portal-shell">
      <header className="customer-portal-header">
        <div className="customer-portal-header-inner">
          <Link to="/" className="customer-portal-logo">
            <Logo size={22} showText={true} />
          </Link>

          <nav className="customer-portal-nav" aria-label="Customer portal navigation">
            <NavLink to="/customer/dashboard" className={({ isActive }) => `customer-nav-item ${isActive ? 'active' : ''}`}>
              Requests
            </NavLink>
            <NavLink to="/customer/bookings" className={({ isActive }) => `customer-nav-item ${isActive ? 'active' : ''}`}>
              Bookings
            </NavLink>
            <NavLink to="/customer/conversations" className={({ isActive }) => `customer-nav-item ${isActive ? 'active' : ''}`}>
              Conversations
            </NavLink>
            <NavLink to="/customer/profile" className={({ isActive }) => `customer-nav-item ${isActive ? 'active' : ''}`}>
              Profile
            </NavLink>
          </nav>

          <div className="customer-portal-actions">
            <Link to="/businesses" className="customer-browse-link">Browse businesses</Link>
            <div className="customer-secure-label">
              <ShieldIcon size={12} />
              <span>Marketplace portal</span>
            </div>
            <button type="button" onClick={handleSignOut} className="btn-secondary customer-logout-btn">
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="customer-portal-main">
        {children}
      </main>
    </div>
  );
};

export default CustomerLayout;
