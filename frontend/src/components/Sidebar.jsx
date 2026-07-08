import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Logo from './Logo';

const Sidebar = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const isSupabaseConfigured = 
        import.meta.env.VITE_SUPABASE_URL && 
        import.meta.env.VITE_SUPABASE_URL !== 'https://your-project.supabase.co';

      if (isSupabaseConfigured) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) setEmail(user.email);
        } catch (err) {
          console.error('Error fetching user email in sidebar:', err);
        }
      } else {
        setEmail('owner@sparklehome.co.uk');
      }
    };
    fetchUser();
  }, []);

  const handleSignOut = async (e) => {
    const isSupabaseConfigured = 
      import.meta.env.VITE_SUPABASE_URL && 
      import.meta.env.VITE_SUPABASE_URL !== 'https://your-project.supabase.co';

    if (isSupabaseConfigured) {
      e.preventDefault();
      try {
        await supabase.auth.signOut();
        navigate('/login');
      } catch (err) {
        console.error('❌ Signout failed:', err.message);
      }
    } else {
      navigate('/login');
    }
  };

  const initials = email ? email.substring(0, 2).toUpperCase() : 'OW';

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Link to="/" className="sidebar-logo" style={{ display: 'inline-flex', alignItems: 'center' }}>
          <Logo size={22} dark={true} />
        </Link>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" end className={({ isActive }) => isActive ? "sidebar-item active" : "sidebar-item"}>
          <span className="sidebar-item-icon">📊</span>
          Overview
        </NavLink>
        <NavLink to="/dashboard/business" className={({ isActive }) => isActive ? "sidebar-item active" : "sidebar-item"}>
          <span className="sidebar-item-icon">🏢</span>
          Business Setup
        </NavLink>
        <NavLink to="/dashboard/services" className={({ isActive }) => isActive ? "sidebar-item active" : "sidebar-item"}>
          <span className="sidebar-item-icon">🛠️</span>
          Services Manager
        </NavLink>
        <NavLink to="/dashboard/faqs" className={({ isActive }) => isActive ? "sidebar-item active" : "sidebar-item"}>
          <span className="sidebar-item-icon">❓</span>
          FAQ Manager
        </NavLink>
        <NavLink to="/dashboard/leads" className={({ isActive }) => isActive ? "sidebar-item active" : "sidebar-item"}>
          <span className="sidebar-item-icon">🎯</span>
          Leads Feed
        </NavLink>
        <NavLink to="/dashboard/conversations" className={({ isActive }) => isActive ? "sidebar-item active" : "sidebar-item"}>
          <span className="sidebar-item-icon">💬</span>
          Conversations
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        {email && (
          <div className="sidebar-profile-box">
            <div className="profile-avatar">{initials}</div>
            <div className="profile-details">
              <span className="profile-role">Owner</span>
              <span className="profile-email" title={email}>{email}</span>
            </div>
          </div>
        )}
        <Link to="/" className="sidebar-logout" onClick={handleSignOut}>
          <span className="sidebar-item-icon">🚪</span>
          Sign Out
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
