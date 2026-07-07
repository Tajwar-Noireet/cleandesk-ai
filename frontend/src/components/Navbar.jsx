import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon" style={{ color: '#C87941', marginRight: '0.2rem' }}>✨</span>
          <span className="logo-text" style={{ fontFamily: 'var(--font-heading)', fontWeight: '700' }}>CleanDesk</span>
        </Link>
        <div className="navbar-links">
          <Link to="/demo" className="navbar-link">Interactive Demo</Link>
          <Link to="/login" className="navbar-btn-login">Open Dashboard</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
