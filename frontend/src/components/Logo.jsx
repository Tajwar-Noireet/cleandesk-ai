import React from 'react';

const Logo = ({ size = 24, dark = false, className = '', showText = true }) => {
  const brandColor = dark ? "#FFFFFF" : "#1F2937";
  
  return (
    <div className={`logo-container ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem' }}>
      {/* SVG Icon: Abstract rounded-rect workflow nodes terminating in a check mark with a blue status dot */}
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        style={{ flexShrink: 0 }}
      >
        {/* Base rounded square */}
        <rect width="24" height="24" rx="6" fill={dark ? "#FFFFFF" : "#1F2937"} />
        
        {/* Connected sequence nodes representing workflow: enquiry -> qualified -> booked */}
        <path 
          d="M6 16L11 11M11 11L15 15" 
          stroke={brandColor} 
          strokeWidth="1.75" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          opacity="0.4"
        />
        
        {/* Flow nodes */}
        <circle cx="6" cy="16" r="1.5" fill={brandColor} opacity="0.6" />
        <circle cx="11" cy="11" r="1.5" fill={brandColor} opacity="0.8" />
        
        {/* Final Checkmark node representing booked job */}
        <path 
          d="M14 9L16.5 11.5L20 8" 
          stroke={brandColor} 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        
        {/* Single small blue active status dot */}
        <circle cx="19" cy="5" r="2.2" fill="#3B82F6" />
      </svg>

      {showText && (
        <span 
          className="logo-wordmark" 
          style={{ 
            fontFamily: 'var(--font-heading)', 
            fontWeight: '700', 
            fontSize: '1.25rem', 
            color: dark ? '#FFFFFF' : '#1F2937',
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
