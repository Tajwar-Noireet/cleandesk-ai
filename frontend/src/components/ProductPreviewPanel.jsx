import React from 'react';
import { ClockIcon, ShieldIcon, CheckIcon, MessageIcon, UserIcon } from './Icons';

const ProductPreviewPanel = () => {
  const mockLeads = [
    { name: 'Sarah Jenkins', service: 'Deep Clean', phone: '07700 900077', status: 'new', time: '2m ago' },
    { name: 'Thomas More', service: 'End of Tenancy', phone: '07700 900142', status: 'booked', time: '1h ago' },
    { name: 'Elena Rostova', service: 'Regular Weekly', phone: '07700 900259', status: 'contacted', time: '3h ago' }
  ];

  return (
    <div className="product-preview-panel">
      {/* Sidebar Mock */}
      <div className="mock-sidebar">
        <div className="mock-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          CleanDesk
        </div>
        <div className="mock-nav-item active">
          <ClockIcon size={12} /> Overview
        </div>
        <div className="mock-nav-item">
          <ShieldIcon size={12} /> Setup
        </div>
        <div className="mock-nav-item">
          <CheckIcon size={12} /> Services
        </div>
        <div className="mock-nav-item">
          <MessageIcon size={12} /> Chats
        </div>
      </div>

      {/* Main Workspace Mock */}
      <div className="mock-main">
        {/* Topbar */}
        <div className="mock-topbar">
          <span className="mock-title">Operations Console</span>
          <div className="mock-user">
            <span className="avatar">OW</span>
            <span className="email">owner@sparklehome.co.uk</span>
          </div>
        </div>

        {/* Lead Grid Layout */}
        <div className="mock-grid">
          {/* Table section */}
          <div className="mock-card">
            <div className="card-header-row">
              <h4>Recent Customer Operations</h4>
              <span className="live-tag"><span className="dot pulse" style={{ backgroundColor: '#16A34A', boxShadow: '0 0 8px #16A34A' }}></span> Live Feed</span>
            </div>
            <div className="mock-table">
              <div className="table-hdr">
                <span>Customer</span>
                <span>Requested Service</span>
                <span>Time</span>
                <span>Status</span>
              </div>
              {mockLeads.map((l, i) => (
                <div className="table-row" key={i}>
                  <div className="cell-user">
                    <strong>{l.name}</strong>
                    <span className="sub">{l.phone}</span>
                  </div>
                  <span>{l.service}</span>
                  <span className="text-muted">{l.time}</span>
                  <span className={`status-pill ${l.status}`}>{l.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Transcript review */}
          <div className="mock-card card-transcript">
            <div className="card-header-row">
              <h4>Conversational Audit</h4>
              <span className="badge-confidence">96% Accuracy</span>
            </div>
            <div className="transcript-chat-history">
              <div className="chat-bubble customer">Do you clean carpets as part of end of tenancy?</div>
              <div className="chat-bubble ai">Yes, carpet steam cleaning can be added for £45 extra. Shall I add that to your quote?</div>
              <div className="chat-bubble customer">Yes please, book that for Thomas More.</div>
            </div>
            <div className="extracted-fields-box">
              <div className="extracted-hdr">Captured Attributes</div>
              <div className="slots-grid-mini">
                <span className="slot checked" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                  <UserIcon size={12} /> Name: Thomas More
                </span>
                <span className="slot checked" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                  <UserIcon size={12} /> Phone: 07700 900142
                </span>
                <span className="slot checked" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                  <ShieldIcon size={12} /> Carpet: Added (£45)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPreviewPanel;
