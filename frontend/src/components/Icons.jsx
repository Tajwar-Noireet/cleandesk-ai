import React from 'react';

const IconWrapper = ({ children, size = 16, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`cd-icon ${className}`}
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    {children}
  </svg>
);

export const CheckIcon = (props) => (
  <IconWrapper {...props}>
    <polyline points="20 6 9 17 4 12" />
  </IconWrapper>
);

export const InboxIcon = (props) => (
  <IconWrapper {...props}>
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0 -1.79 1.11z" />
  </IconWrapper>
);

export const AlertIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0 -3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </IconWrapper>
);

export const ClockIcon = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </IconWrapper>
);

export const UserIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M20 21v-2a4 4 0 0 0 -4-4H8a4 4 0 0 0 -4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </IconWrapper>
);

export const MessageIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M21 15a2 2 0 0 1 -2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </IconWrapper>
);

export const CalendarIcon = (props) => (
  <IconWrapper {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </IconWrapper>
);

export const ShieldIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </IconWrapper>
);

export const ArrowRightIcon = (props) => (
  <IconWrapper {...props}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </IconWrapper>
);

export const StatusDotIcon = ({ size = 8, color = '#16A34A', className = '', pulse = true }) => (
  <span
    className={`status-dot-wrapper ${pulse ? 'pulse' : ''} ${className}`}
    style={{
      display: 'inline-block',
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      backgroundColor: color,
      boxShadow: `0 0 6px ${color}`,
      flexShrink: 0
    }}
  />
);
