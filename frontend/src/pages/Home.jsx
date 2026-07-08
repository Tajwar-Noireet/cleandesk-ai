import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Home = () => {
  return (
    <div className="home-shell">
      <Navbar />

      {/* SECTION 1: Premium Hero */}
      <section className="hero-section">
        <div className="hero-copy">
          <div className="hero-announcement-pill">
            <span className="pill-dot"></span>
            <span>Operations Console v1.4</span>
          </div>
          <h1 className="hero-mega-title">
            Turn missed enquiries<br />
            <span>into booked jobs.</span>
          </h1>
          <p className="hero-mega-subtitle">
            CleanDesk gives service businesses one calm workspace to respond faster, qualify leads, and keep every customer conversation under control.
          </p>
          <div className="hero-actions">
            <Link to="/demo" className="btn-primary btn-large font-semibold">
              Try the live demo <span>→</span>
            </Link>
            <Link to="/login" className="btn-secondary btn-large">
              Open owner dashboard
            </Link>
          </div>
        </div>

        {/* Hero Visual: High-Fidelity Workflow Board */}
        <div className="workflow-board-container">
          <div className="workflow-board-header">
            <h4>Customer Capture Pipeline</h4>
            <div className="pipeline-legend">
              <span className="dot pulse green"></span>
              <span>Active</span>
            </div>
          </div>
          
          <div className="workflow-board">
            {/* Step 1: Incoming */}
            <div className="workflow-card card-incoming">
              <div className="card-badge badge-blue">Enquiry</div>
              <p className="card-body">"Looking for regular domestic cleaning weekly from Friday. Can you quote?"</p>
              <div className="card-meta">Web Chat • Just now</div>
            </div>

            {/* Step 2: Matched */}
            <div className="workflow-card card-matched">
              <div className="card-badge badge-gray">Matched Knowledge</div>
              <div className="match-item">
                <span>Service: Domestic Clean</span>
                <strong>£16/hr</strong>
              </div>
              <div className="match-item">
                <span>Availability: Fridays</span>
                <strong>Available</strong>
              </div>
            </div>

            {/* Step 3: Captured */}
            <div className="workflow-card card-captured">
              <div className="card-badge badge-green">Structured Lead</div>
              <div className="captured-slot">✓ Service: Weekly Domestic</div>
              <div className="captured-slot">✓ Day: Friday</div>
              <div className="captured-slot">☐ Contact details requested</div>
            </div>

            {/* Step 4: Review */}
            <div className="workflow-card card-review">
              <div className="card-badge badge-amber">Owner Alert</div>
              <p className="card-body">"Client requests deep stain removal details. Flagged for review."</p>
              <div className="escalation-badge">⚠️ Escalated to Owner</div>
            </div>

            {/* Step 5: Booked */}
            <div className="workflow-card card-booked">
              <div className="card-badge badge-black">Job Created</div>
              <div className="job-ticket">
                <strong>Weekly Clean</strong>
                <span>£16/hr • Friday 10:00</span>
              </div>
              <div className="ticket-status-pill">Pending Confirmation</div>
            </div>
          </div>

          {/* Connected Flow Connector Canvas Line */}
          <div className="workflow-canvas-line">
            <svg width="100%" height="8" viewBox="0 0 1000 8" fill="none" preserveAspectRatio="none">
              <path d="M 0 4 L 1000 4" stroke="#E5E7EB" strokeWidth="2" strokeDasharray="6 6" />
              <path d="M 0 4 L 450 4" stroke="#2563EB" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </section>

      {/* SECTION 2: Trust Strip */}
      <section className="trust-strip-container">
        <div className="trust-strip">
          <p className="trust-sentence">
            Built for cleaning teams, repair services, salons, tutors, and local operators.
          </p>
          
          <div className="trust-metrics-grid">
            <div className="metric-card">
              <h3>100%</h3>
              <p>24/7 Enquiry Capture</p>
            </div>
            <div className="metric-card">
              <h3>2s</h3>
              <p>Average Response Time</p>
            </div>
            <div className="metric-card">
              <h3>85%</h3>
              <p>Structured Lead Profiles</p>
            </div>
            <div className="metric-card">
              <h3>0</h3>
              <p>Lost Opportunities</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Bento Grid */}
      <section className="bento-section">
        <div className="section-header">
          <span className="section-tag">Core Features</span>
          <h2 className="section-title">Built for Serious Service Operations</h2>
          <p className="section-subtitle">Everything you need to capture enquiries, filter leads, and coordinate bookings.</p>
        </div>

        <div className="bento-grid-custom">
          {/* Card 1: Lead Inbox (Large) */}
          <div className="bento-card-wrapper size-large">
            <div className="bento-card-visual">
              <div className="mini-lead-list">
                <div className="lead-row active">
                  <div className="lead-row-info">
                    <strong>Marcus Sterling</strong>
                    <span>Deep Clean • SW1A 1AA</span>
                  </div>
                  <span className="pill status-new">new</span>
                </div>
                <div className="lead-row">
                  <div className="lead-row-info">
                    <strong>Janet Vance</strong>
                    <span>Weekly Maid • W1B 2BC</span>
                  </div>
                  <span className="pill status-contacted">contacted</span>
                </div>
              </div>
            </div>
            <div className="bento-card-content">
              <h3>Operations Lead Inbox</h3>
              <p>A structured dashboard summarizing all customer enquiries, services requested, and contact information captured by the system.</p>
            </div>
          </div>

          {/* Card 2: Booking Checklist (Medium) */}
          <div className="bento-card-wrapper size-medium">
            <div className="bento-card-visual">
              <div className="mini-checklist-box">
                <div className="chk-row checked">✓ Name: Marcus Sterling</div>
                <div className="chk-row checked">✓ Service: End of Tenancy</div>
                <div className="chk-row checked">✓ Date: Next Friday</div>
                <div className="chk-row empty">☐ Address: Pending</div>
              </div>
            </div>
            <div className="bento-card-content">
              <h3>Qualification Checklist</h3>
              <p>Automatically filters chat logs to extract booking attributes into structured rows, flagging missing values for owner capture.</p>
            </div>
          </div>

          {/* Card 3: Human Review Controls (Small) */}
          <div className="bento-card-wrapper size-small">
            <div className="bento-card-visual">
              <div className="escalation-alert-indicator">
                <span className="pulse-alert-dot"></span>
                <span className="alert-text">Escalation Requested</span>
              </div>
            </div>
            <div className="bento-card-content">
              <h3>Human Takeover</h3>
              <p>Alerts owners instantly if conversation sentiment shifts, or if the client asks for custom requests requiring manual review.</p>
            </div>
          </div>

          {/* Card 4: Service Knowledge Base (Medium) */}
          <div className="bento-card-wrapper size-medium">
            <div className="bento-card-visual">
              <div className="mini-kb-box">
                <div className="kb-item">
                  <strong>Deep Cleaning Service</strong>
                  <span>£180 base rate • 4 hours cleaning</span>
                </div>
                <div className="kb-item">
                  <strong>End of Tenancy Service</strong>
                  <span>£240 base rate • Deposit guarantee</span>
                </div>
              </div>
            </div>
            <div className="bento-card-content">
              <h3>Service Knowledge Base</h3>
              <p>Input service guidelines, base pricing tables, and postcodes so that receptionist responses stay consistent with your policies.</p>
            </div>
          </div>

          {/* Card 5: Weekly Outcomes (Large) */}
          <div className="bento-card-wrapper size-large">
            <div className="bento-card-visual">
              <div className="mini-bar-chart">
                <div className="chart-bar-col">
                  <span>£420</span>
                  <div className="bar" style={{ height: '40px' }}></div>
                  <span className="day">Mon</span>
                </div>
                <div className="chart-bar-col">
                  <span>£780</span>
                  <div className="bar" style={{ height: '70px' }}></div>
                  <span className="day">Tue</span>
                </div>
                <div className="chart-bar-col">
                  <span>£1,120</span>
                  <div className="bar" style={{ height: '100px' }}></div>
                  <span className="day">Wed</span>
                </div>
                <div className="chart-bar-col active">
                  <span>£1,680</span>
                  <div className="bar" style={{ height: '120px' }}></div>
                  <span className="day">Thu</span>
                </div>
              </div>
            </div>
            <div className="bento-card-content">
              <h3>Operational Outcomes</h3>
              <p>Track captured booking values, weekly schedules, response rates, and customer conversions from a single dashboard screen.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Product Dashboard Showcase */}
      <section className="dashboard-showcase-section">
        <div className="section-header">
          <span className="section-tag">Mock Interface</span>
          <h2 className="section-title">The Unified Operations Interface</h2>
          <p className="section-subtitle">Designed to feel like serious operations software. No clutter, maximum visibility.</p>
        </div>

        <div className="dashboard-showcase">
          {/* Mock Sidebar */}
          <div className="showcase-sidebar">
            <div className="showcase-logo">✨ CleanDesk</div>
            <div className="showcase-nav">
              <div className="nav-item active">Overview</div>
              <div className="nav-item">Setup & postcodes</div>
              <div className="nav-item">Service catalog</div>
              <div className="nav-item">FAQ catalog</div>
              <div className="nav-item">CRM Leads</div>
              <div className="nav-item">Conversations</div>
            </div>
            <div className="showcase-sidebar-footer">
              <div className="showcase-user">
                <span className="avatar">OW</span>
                <span>owner@sparklehome.co.uk</span>
              </div>
            </div>
          </div>

          {/* Mock Main Console Workspace */}
          <div className="showcase-workspace">
            {/* Topbar */}
            <div className="showcase-topbar">
              <div className="topbar-left">
                <h3>Customer Operations Dashboard</h3>
                <span className="status-indicator-pill">
                  <span className="status-dot green"></span> Live capturing
                </span>
              </div>
            </div>

            {/* Mock Layout Grid */}
            <div className="showcase-layout-grid">
              {/* Left Column: Recent Leads Feed */}
              <div className="layout-column col-left">
                <div className="pane-header">
                  <h4>Recent Leads Feed</h4>
                </div>
                <div className="showcase-table">
                  <div className="table-row active">
                    <div className="row-user">
                      <strong>Thomas More</strong>
                      <span>07700 900142</span>
                    </div>
                    <span>End of Tenancy</span>
                    <span className="pill status-booked">booked</span>
                  </div>
                  <div className="table-row">
                    <div className="row-user">
                      <strong>Sarah Jenkins</strong>
                      <span>07700 900077</span>
                    </div>
                    <span>Deep Clean</span>
                    <span className="pill status-new">new</span>
                  </div>
                  <div className="table-row">
                    <div className="row-user">
                      <strong>Elena Rostova</strong>
                      <span>07700 900259</span>
                    </div>
                    <span>Regular Weekly</span>
                    <span className="pill status-contacted">contacted</span>
                  </div>
                </div>
              </div>

              {/* Middle Column: Chat Audit Transcript */}
              <div className="layout-column col-middle">
                <div className="pane-header">
                  <h4>Conversational Audit Logs</h4>
                  <span className="accuracy-pill">96% Confidence</span>
                </div>
                <div className="showcase-chat-log">
                  <div className="chat-msg customer">
                    <span className="avatar">C</span>
                    <div className="bubble">
                      <div className="sender">Customer</div>
                      <p>Do you clean carpets as part of end of tenancy?</p>
                    </div>
                  </div>
                  <div className="chat-msg assistant">
                    <span className="avatar">A</span>
                    <div className="bubble">
                      <div className="sender">Assistant</div>
                      <p>Yes, carpet steam cleaning can be added for £45 extra. Shall I add that to your quote?</p>
                    </div>
                  </div>
                  <div className="chat-msg customer">
                    <span className="avatar">C</span>
                    <div className="bubble">
                      <div className="sender">Customer</div>
                      <p>Yes please, book that for Thomas More.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Customer Details */}
              <div className="layout-column col-right">
                <div className="pane-header">
                  <h4>Lead Meta Attributes</h4>
                </div>
                <div className="meta-attribute-panel">
                  <div className="meta-section">
                    <h5>Extracted Data</h5>
                    <div className="meta-checklist">
                      <div className="check-item-span check-filled">✓ Name: Thomas More</div>
                      <div className="check-item-span check-filled">✓ Phone: 07700 900142</div>
                      <div className="check-item-span check-filled">✓ Service: End of Tenancy</div>
                      <div className="check-item-span check-filled">✓ Carpet Clean: Yes (+£45)</div>
                    </div>
                  </div>
                  <div className="meta-section">
                    <h5>Action Actions</h5>
                    <button className="btn-primary btn-small btn-full">Confirm Booking</button>
                    <button className="btn-secondary btn-small btn-full" style={{ marginTop: '0.4rem' }}>Decline</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: Use Case */}
      <section className="case-study-section-custom">
        <div className="case-study-container-custom">
          <div className="case-study-content">
            <span className="case-tag-custom">Operational Case Study</span>
            <h2>SparkleHome Cleaning Testimonial</h2>
            <p className="case-desc">
              SparkleHome covers London Zones 1-4 with 8 deep cleaners. They were losing 30% of incoming quotes because their team was busy in the field. Deploying CleanDesk resolved this instantly.
            </p>

            <div className="case-comparison-grid">
              <div className="comparison-card card-before">
                <h3>Before CleanDesk</h3>
                <ul>
                  <li>✗ Missed WhatsApp messages and quote requests</li>
                  <li>✗ 4-hour delay on price quotes</li>
                  <li>✗ Lost 12 leads per week to faster competitors</li>
                </ul>
              </div>
              <div className="comparison-card card-after">
                <h3>After CleanDesk</h3>
                <ul>
                  <li>✓ 100% of price queries answered in 2 seconds</li>
                  <li>✓ 14 fully qualified bookings captured in the first week</li>
                  <li>✓ Zero missed enquiries or scheduling gaps</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: Final CTA */}
      <section className="final-cta-banner">
        <div className="cta-banner-content">
          <h2>Give every enquiry a clear next step.</h2>
          <p>Deploy your widget in minutes, capture structured leads, and keep your calendar booked.</p>
          <div className="cta-buttons">
            <Link to="/demo" className="btn-primary btn-large font-semibold">
              Try the live demo <span>→</span>
            </Link>
            <Link to="/login" className="btn-secondary btn-large">
              Open owner dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <span>CleanDesk • Operating System for Service Businesses</span>
          <span>&copy; {new Date().getFullYear()} CleanDesk. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};

export default Home;
