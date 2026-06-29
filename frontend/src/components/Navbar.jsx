import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">✨</span>
          <span className="logo-text">CleanDesk<span className="logo-accent">.AI</span></span>
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
