import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" style={{ display: 'inline-flex', alignItems: 'center' }}>
          <Logo size={24} dark={false} />
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
