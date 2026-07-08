import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Logo from '../components/Logo';
import LineSidebar from '../components/LineSidebar';
import MagicBento from '../components/MagicBento';

const Home = () => {
  const [activeSidebarIndex, setActiveSidebarIndex] = useState(0);

  const sectionIds = ['intro', 'workflow', 'inbox', 'automation', 'dashboard', 'case-study', 'demo'];

  const handleSidebarItemClick = (index, label) => {
    const id = sectionIds[index];
    const el = document.getElementById(id);
    if (el) {
      // Offset slightly to account for sticky navbar height
      const yOffset = -80;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleIntersect = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = sectionIds.indexOf(entry.target.id);
          if (index !== -1) {
            setActiveSidebarIndex(index);
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, {
      root: null,
      rootMargin: '-30% 0px -70% 0px',
      threshold: 0
    });

    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const inboxCards = [
    {
      label: 'Pipeline',
      title: 'Operations Lead Inbox',
      description: 'A structured feed of all incoming client enquiries, postcodes, and booking requests.',
      gridSpan: 'span 2',
      visual: (
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
      )
    },
    {
      label: 'Failsafe',
      title: 'Human Takeover',
      description: 'Alerts the business owner to step in if conversation sentiment shifts.',
      gridSpan: 'span 1',
      visual: (
        <div className="escalation-alert-indicator">
          <span className="pulse-alert-dot"></span>
          <span className="alert-text">Review Required</span>
        </div>
      )
    },
    {
      label: 'Audit Logs',
      title: 'Conversation History',
      description: 'Audit chat logs between customers and assistant in real time.',
      gridSpan: 'span 3',
      visual: (
        <div className="mini-kb-box" style={{ gap: '0.4rem', background: 'transparent', border: 'none', padding: 0 }}>
          <div className="kb-item" style={{ padding: '0.4rem 0.6rem' }}>
            <span style={{ fontSize: '0.6rem', color: '#6B7280', fontWeight: 'bold' }}>Customer</span>
            <span style={{ fontSize: '0.7rem', color: '#0A0A0A', marginTop: '0.15rem' }}>Do you steam clean carpets?</span>
          </div>
          <div className="kb-item" style={{ padding: '0.4rem 0.6rem', borderColor: '#2563EB' }}>
            <span style={{ fontSize: '0.6rem', color: '#2563EB', fontWeight: 'bold' }}>Assistant</span>
            <span style={{ fontSize: '0.7rem', color: '#0A0A0A', marginTop: '0.15rem' }}>Yes, we add steam clean for £45.</span>
          </div>
        </div>
      )
    }
  ];

  const automationCards = [
    {
      label: 'Validation',
      title: 'Qualification Checklist',
      description: 'Extract names, phone numbers, and job dates from conversations automatically.',
      gridSpan: 'span 1',
      visual: (
        <div className="mini-checklist-box">
          <div className="chk-row checked">✓ Name: Marcus Sterling</div>
          <div className="chk-row checked">✓ Service: End of Tenancy</div>
          <div className="chk-row checked">✓ Date: Next Friday</div>
          <div className="chk-row empty">☐ Address: Pending</div>
        </div>
      )
    },
    {
      label: 'Training',
      title: 'Service Knowledge Base',
      description: 'Define custom pricing structures, postcodes, and hours for the assistant.',
      gridSpan: 'span 1',
      visual: (
        <div className="mini-kb-box">
          <div className="kb-item">
            <strong>Standard Office Cleaning</strong>
            <span>£22/hr base rate • Monday - Friday</span>
          </div>
          <div className="kb-item">
            <strong>Domestic Deep Clean</strong>
            <span>£180 base rate • Multi-room catalog</span>
          </div>
        </div>
      )
    },
    {
      label: 'Analytics',
      title: 'Operational Outcomes',
      description: 'Monitor response speed, pipeline conversion, and booking values.',
      gridSpan: 'span 1',
      visual: (
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
      )
    }
  ];

  return (
    <div className="home-shell">
      <Navbar />

      <div className="home-layout-container">
        {/* Sticky Desktop Side Navigation (ReactBits LineSidebar) */}
        <aside className="sticky-sidebar-nav">
          <div className="sticky-nav-wrapper">
            <LineSidebar
              items={['Intro', 'Workflow', 'Inbox', 'Automation', 'Dashboard', 'Case Study', 'Demo']}
              accentColor="#2563EB"
              textColor="#6B7280"
              markerColor="#D1D5DB"
              showIndex={true}
              showMarker={true}
              proximityRadius={90}
              maxShift={14}
              falloff="smooth"
              markerLength={42}
              markerGap={8}
              tickScale={0.45}
              scaleTick={true}
              itemGap={18}
              fontSize={0.95}
              smoothing={90}
              defaultActive={activeSidebarIndex}
              onItemClick={handleSidebarItemClick}
            />
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="home-main-content">
          {/* SECTION 1: Intro / Hero */}
          <section id="intro" className="hero-section scroll-section">
            <div className="hero-copy">
              <div className="hero-announcement-pill">
                <span className="pill-dot"></span>
                <span>Operating System for Customer Operations</span>
              </div>
              
              {/* Giant Brand Presence in Hero */}
              <div className="hero-brand-logo-area">
                <Logo size={42} dark={false} className="hero-brand-logo" />
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
          </section>

          {/* SECTION 2: Workflow Pipeline */}
          <section id="workflow" className="workflow-board-section scroll-section">
            <div className="section-header">
              <span className="section-tag">Operations Pipeline</span>
              <h2>How CleanDesk captures booking requests</h2>
              <p>A unified capture pipeline that guides quote inquiries from raw chat logs directly into confirmed tickets.</p>
            </div>

            <div className="workflow-board-container">
              <div className="workflow-board-header">
                <h4>Customer Capture Pipeline</h4>
                <div className="pipeline-legend">
                  <span className="dot pulse green"></span>
                  <span>Active Capturing</span>
                </div>
              </div>
              
              <div className="workflow-board">
                <div className="workflow-card card-incoming">
                  <div className="card-badge badge-blue">Enquiry</div>
                  <p className="card-body">"Looking for regular domestic cleaning weekly from Friday. Can you quote?"</p>
                  <div className="card-meta">Web Chat • Just now</div>
                </div>

                <div className="workflow-card card-matched">
                  <div className="card-badge badge-gray">Knowledge Base</div>
                  <div className="match-item">
                    <span>Service: Domestic Clean</span>
                    <strong>£16/hr</strong>
                  </div>
                  <div className="match-item">
                    <span>Availability: Fridays</span>
                    <strong>Available</strong>
                  </div>
                </div>

                <div className="workflow-card card-captured">
                  <div className="card-badge badge-green">Lead Checklist</div>
                  <div className="captured-slot">✓ Service: Weekly Domestic</div>
                  <div className="captured-slot">✓ Day: Friday</div>
                  <div className="captured-slot">☐ Details Requested</div>
                </div>

                <div className="workflow-card card-review">
                  <div className="card-badge badge-amber">Sentiment Flag</div>
                  <p className="card-body">"Client requests custom stain details. Escalated to owner review."</p>
                  <div className="escalation-badge">⚠️ Flagged for Takeover</div>
                </div>

                <div className="workflow-card card-booked">
                  <div className="card-badge badge-black">Job Created</div>
                  <div className="job-ticket">
                    <strong>Weekly Clean</strong>
                    <span>£16/hr • Friday 10:00</span>
                  </div>
                  <div className="ticket-status-pill">Pending Confirmation</div>
                </div>
              </div>

              <div className="workflow-canvas-line">
                <svg width="100%" height="8" viewBox="0 0 1000 8" fill="none" preserveAspectRatio="none">
                  <path d="M 0 4 L 1000 4" stroke="#E5E7EB" strokeWidth="2" strokeDasharray="6 6" />
                  <path d="M 0 4 L 450 4" stroke="#2563EB" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </section>

          {/* SECTION 3: Inbox Grid */}
          <section id="inbox" className="inbox-showcase-section scroll-section bento-section">
            <div className="section-header">
              <span className="section-tag">Qualified Data</span>
              <h2>Operations Lead Inbox</h2>
              <p>Stop searching through messy email threads and text threads. CleanDesk structures raw conversations automatically.</p>
            </div>

            <MagicBento
              cards={inboxCards}
              textAutoHide={false}
              enableStars={false}
              enableSpotlight={true}
              enableBorderGlow={true}
              enableTilt={true}
              enableMagnetism={false}
              clickEffect={true}
              spotlightRadius={300}
              particleCount={6}
              glowColor="37, 99, 235"
              disableAnimations={false}
            />
          </section>

          {/* SECTION 4: Automation */}
          <section id="automation" className="automation-details-section scroll-section bento-section">
            <div className="section-header">
              <span className="section-tag">Failsafe Actions</span>
              <h2>Configured Knowledge & Validation</h2>
              <p>Keep responses consistent with your business policies. The assistant uses your exact pricing rules.</p>
            </div>

            <MagicBento
              cards={automationCards}
              textAutoHide={false}
              enableStars={false}
              enableSpotlight={true}
              enableBorderGlow={true}
              enableTilt={true}
              enableMagnetism={false}
              clickEffect={true}
              spotlightRadius={300}
              particleCount={6}
              glowColor="37, 99, 235"
              disableAnimations={false}
            />
          </section>

          {/* SECTION 5: Dashboard Workspace Showcase */}
          <section id="dashboard" className="dashboard-showcase-section scroll-section">
            <div className="section-header">
              <span className="section-tag">Mock Workspace</span>
              <h2>Unified Business Operations Dashboard</h2>
              <p>The workspace built for service operators. Audit active chats, verify customer info, and confirm schedules.</p>
            </div>

            <div className="dashboard-showcase">
              {/* Mock Sidebar */}
              <div className="showcase-sidebar">
                <div className="showcase-logo-area" style={{ padding: '0 0.5rem' }}>
                  <Logo size={18} dark={true} />
                </div>
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
                <div className="showcase-topbar">
                  <div className="topbar-left">
                    <h3>Customer Operations Dashboard</h3>
                    <span className="status-indicator-pill">
                      <span className="status-dot green"></span> Live capturing
                    </span>
                  </div>
                </div>

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
                        </div>
                      </div>
                      <div className="meta-section">
                        <h5>Actions</h5>
                        <button className="btn-primary btn-small btn-full">Confirm Booking</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 6: Case Study */}
          <section id="case-study" className="case-study-section-custom scroll-section">
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

          {/* SECTION 7: Demo / Call to Action */}
          <section id="demo" className="final-cta-banner scroll-section">
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
        </main>
      </div>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Logo size={16} dark={false} />
            <span>• Operating System for Service Businesses</span>
          </div>
          <span>&copy; {new Date().getFullYear()} CleanDesk. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};

export default Home;
