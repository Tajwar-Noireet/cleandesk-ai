import React from 'react';
import { NavLink, Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Link to="/" className="sidebar-logo">
          <span className="logo-icon">✨</span>
          <span className="logo-text">CleanDesk<span className="logo-accent">.AI</span></span>
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
        <Link to="/" className="sidebar-logout">
          <span className="sidebar-item-icon">🚪</span>
          Sign Out
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
