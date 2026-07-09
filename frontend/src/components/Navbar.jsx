import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

const Navbar = () => {
  return (
    <nav className="navbar public-navbar">
      <div className="navbar-container public-navbar-container">
        <Link to="/" className="public-navbar-brand">
          <Logo size={28} dark={false} showText={true} />
        </Link>

        <div className="public-navbar-links">
          <Link to="/services" className="nav-text-link">
            Browse services
          </Link>
          <Link to="/businesses" className="nav-text-link">
            Browse businesses
          </Link>
          <Link to="/" className="nav-text-link">
            How it works
          </Link>
          <Link to="/customer/login" className="nav-text-link">
            Customer login
          </Link>
          <Link to="/login" className="nav-signin-link">
            Business owner
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
