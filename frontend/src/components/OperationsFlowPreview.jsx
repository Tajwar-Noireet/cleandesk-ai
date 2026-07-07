import React from 'react';

const OperationsFlowPreview = () => {
  return (
    <div className="ops-flow-preview">
      {/* Workflow Line Canvas */}
      <div className="ops-flow-line-connector">
        <svg width="100%" height="100%" viewBox="0 0 400 320" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 70 65 L 140 145 M 260 145 L 330 65 M 200 215 L 200 270" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M 200 175 L 200 215" stroke="url(#active-flow-grad)" strokeWidth="2">
            <animate attributeName="stroke-dashoffset" values="20;0" dur="2s" repeatCount="indefinite" />
          </path>
          <defs>
            <linearGradient id="active-flow-grad" x1="200" y1="175" x2="200" y2="215" gradientUnits="userSpaceOnUse">
              <stop stopColor="#2563eb" />
              <stop offset="1" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Card 1: Incoming message */}
      <div className="ops-card card-incoming animate-float-1">
        <div className="ops-card-badge text-cyan">💬 Incoming Enquiry</div>
        <div className="ops-card-msg">"Do you have availability for a deep house cleaning this Friday at 10 AM?"</div>
        <div className="ops-card-time">Just now • Web Chat</div>
      </div>

      {/* Card 2: Knowledge matched */}
      <div className="ops-card card-matched animate-float-2">
        <div className="ops-card-badge text-blue">⚙️ Matching Capabilities</div>
        <div className="ops-card-match-item">
          <span>✓ Deep Cleaning service matched</span>
          <strong>£140 base</strong>
        </div>
        <div className="ops-card-match-item">
          <span>✓ Coverage Zone 1-4 verified</span>
          <strong>SW1A matched</strong>
        </div>
      </div>

      {/* Card 3: Structured Lead */}
      <div className="ops-card card-lead animate-float-3">
        <div className="ops-card-badge text-emerald">🎯 Structured Lead Captured</div>
        <div className="ops-card-lead-row">👤 Name: <span>Sarah Jenkins</span></div>
        <div className="ops-card-lead-row">📞 Phone: <span>07700 900077</span></div>
        <div className="ops-card-lead-row">📍 Service: <span>Deep Clean</span></div>
        <div className="ops-card-lead-row">⏱️ Slot: <span>Friday, 10:00 AM</span></div>
      </div>

      {/* Card 4: Operations outcome */}
      <div className="ops-card card-outcome animate-float-1">
        <div className="ops-card-badge text-amber">📋 Operations Review</div>
        <div className="ops-card-status">
          <span className="dot pulse orange"></span>
          <span>Lead capturing complete. Pending confirmation.</span>
        </div>
        <div className="ops-card-actions">
          <span className="mini-btn-badge accept">Confirm Booking</span>
          <span className="mini-btn-badge decline">Decline</span>
        </div>
      </div>
    </div>
  );
};

export default OperationsFlowPreview;
