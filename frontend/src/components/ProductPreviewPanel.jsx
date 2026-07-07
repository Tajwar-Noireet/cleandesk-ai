import React from 'react';

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
        <div className="mock-logo">✨ CleanDesk</div>
        <div className="mock-nav-item active">📊 Overview</div>
        <div className="mock-nav-item">🏢 Setup</div>
        <div className="mock-nav-item">🛠️ Services</div>
        <div className="mock-nav-item">💬 Chats</div>
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
              <span className="live-tag"><span className="dot pulse green"></span> Live Feed</span>
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
              <h4>AI Receptionist Audit</h4>
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
                <span className="slot checked">👤 Name: Thomas More</span>
                <span className="slot checked">📞 Phone: 07700 900142</span>
                <span className="slot checked">📍 Carpet: Added (£45)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPreviewPanel;
