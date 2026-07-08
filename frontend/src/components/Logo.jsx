import React from 'react';

const Logo = ({ size = 24, dark = false, className = '', showText = true }) => {
  return (
    <div className={`logo-container ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
      {/* SVG Icon: Abstract rounded-rect workflow grid with one blue status dot */}
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        <rect width="24" height="24" rx="6" fill={dark ? "#FFFFFF" : "#0A0A0A"} />
        {/* Three horizontal pipeline stages */}
        <line x1="6" y1="7" x2="18" y2="7" stroke={dark ? "#0A0A0A" : "#FFFFFF"} strokeWidth="2" strokeLinecap="round" opacity="0.3" />
        <line x1="6" y1="12" x2="18" y2="12" stroke={dark ? "#0A0A0A" : "#FFFFFF"} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        <line x1="6" y1="17" x2="14" y2="17" stroke={dark ? "#0A0A0A" : "#FFFFFF"} strokeWidth="2" strokeLinecap="round" />
        {/* Blue active status dot on the middle pipeline track */}
        <circle cx="14" cy="12" r="2.5" fill="#2563EB" />
      </svg>

      {showText && (
        <span 
          className="logo-wordmark" 
          style={{ 
            fontFamily: 'var(--font-heading)', 
            fontWeight: '700', 
            fontSize: '1.15rem', 
            color: dark ? '#FFFFFF' : '#0A0A0A',
            letterSpacing: '-0.02em'
          }}
        >
          CleanDesk
        </span>
      )}
    </div>
  );
};

export default Logo;
