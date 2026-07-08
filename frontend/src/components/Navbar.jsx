import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

const Navbar = () => {
  return (
    <nav className="navbar" style={{ borderBottom: '1px solid var(--color-border)', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' }}>
      <div className="navbar-container" style={{ width: '100%', maxWidth: '1200px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 2rem', boxSizing: 'border-box' }}>
        {/* Left: CleanDesk Logo & Wordmark */}
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
          <Logo size={28} dark={false} showText={true} />
        </Link>

        {/* Right: navigation links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <a href="#workflow" className="nav-text-link" style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6B7280', textDecoration: 'none', transition: 'color 0.15s ease' }}>
            Product
          </a>
          <Link to="/demo" className="nav-text-link" style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6B7280', textDecoration: 'none', transition: 'color 0.15s ease' }}>
            Demo
          </Link>
          <Link to="/dashboard" className="nav-text-link" style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6B7280', textDecoration: 'none', transition: 'color 0.15s ease' }}>
            Owner
          </Link>
          <Link to="/customer/login" className="nav-text-link" style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6B7280', textDecoration: 'none', transition: 'color 0.15s ease' }}>
            Customer
          </Link>
          <Link to="/login" className="nav-signin-link" style={{ 
            fontSize: '0.875rem', 
            fontWeight: '600', 
            color: '#1F2937', 
            textDecoration: 'none',
            padding: '0.4rem 0.85rem',
            borderRadius: '6px',
            backgroundColor: '#F3F4F6',
            transition: 'background-color 0.15s ease'
          }}>
            Sign in
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
