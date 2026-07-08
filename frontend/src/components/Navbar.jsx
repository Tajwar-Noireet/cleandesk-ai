import React from 'react';
import { useLocation } from 'react-router-dom';
import Logo from './Logo';
import PillNav from './PillNav';

const Navbar = () => {
  const { pathname } = useLocation();

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Demo', href: '/demo' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Login', href: '/login' }
  ];

  return (
    <nav className="navbar" style={{ padding: '0.5rem 1rem', height: 'auto', display: 'flex', justifyContent: 'center' }}>
      <div className="navbar-container" style={{ width: '100%', maxWidth: '1200px', display: 'flex', justifyContent: 'center' }}>
        <PillNav
          logo={<Logo size={22} dark={true} showText={false} />}
          logoAlt="CleanDesk"
          items={navItems}
          activeHref={pathname}
          baseColor="#111111"
          pillColor="#ffffff"
          pillTextColor="#111111"
          hoveredPillTextColor="#ffffff"
          initialLoadAnimation={true}
        />
      </div>
    </nav>
  );
};

export default Navbar;
