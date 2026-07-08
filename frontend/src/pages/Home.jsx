import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from '../components/Navbar';
import Logo from '../components/Logo';
import AnimatedSection from '../components/AnimatedSection';
import AnimatedWorkflowBoard from '../components/AnimatedWorkflowBoard';
import AnimatedBentoGrid from '../components/AnimatedBentoGrid';
import { fadeUp, scaleIn, staggerContainer } from '../utils/motionPresets';

const Home = () => {
  const [mockActiveLead, setMockActiveLead] = useState('thomas');

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
        {/* Main Content Area */}
        <main className="home-main-content">
          {/* SECTION 1: Intro / Hero */}
          <AnimatedSection id="intro" className="hero-section scroll-section">
            <motion.div className="hero-copy" variants={staggerContainer} initial="hidden" animate="visible">
              <motion.div className="hero-announcement-pill" variants={fadeUp}>
                <span className="pill-dot"></span>
                <span>Operating System for Customer Operations</span>
              </motion.div>
              
              {/* Giant Brand Presence in Hero */}
              <motion.div className="hero-brand-logo-area" variants={fadeUp}>
                <Logo size={42} dark={false} className="hero-brand-logo" />
              </motion.div>

              <motion.h1 className="hero-mega-title" variants={fadeUp}>
                Turn missed enquiries<br />
                <span>into booked jobs.</span>
              </motion.h1>
              
              <motion.p className="hero-mega-subtitle" variants={fadeUp}>
                CleanDesk gives service businesses one calm workspace to respond faster, qualify leads, and keep every customer conversation under control.
              </motion.p>
              
              <motion.div className="hero-actions" variants={fadeUp}>
                <Link to="/demo" className="btn-primary btn-large font-semibold">
                  Try the live demo <span>→</span>
                </Link>
                <Link to="/login" className="btn-secondary btn-large">
                  Open owner dashboard
                </Link>
              </motion.div>
            </motion.div>
          </AnimatedSection>

          {/* SECTION 2: Workflow Pipeline */}
          <AnimatedSection id="workflow" className="workflow-board-section scroll-section">
            <div className="section-header">
              <span className="section-tag">Operations Pipeline</span>
              <h2>How CleanDesk captures booking requests</h2>
              <p>A unified capture pipeline that guides quote inquiries from raw chat logs directly into confirmed tickets.</p>
            </div>

            {/* Clickable Workflow Board Component */}
            <AnimatedWorkflowBoard />
          </AnimatedSection>

          {/* SECTION 3: Inbox Grid */}
          <section id="inbox" className="inbox-showcase-section scroll-section bento-section">
            <AnimatedSection className="section-header-wrapper" viewportMargin="-120px">
              <div className="section-header">
                <span className="section-tag">Qualified Data</span>
                <h2>Operations Lead Inbox</h2>
                <p>Stop searching through messy email threads and text threads. CleanDesk structures raw conversations automatically.</p>
              </div>
            </AnimatedSection>

            {/* Animated Bento Grid using Stagger and Spotlight */}
            <AnimatedBentoGrid cards={inboxCards} />
          </section>

          {/* SECTION 4: Automation */}
          <section id="automation" className="automation-details-section scroll-section bento-section">
            <AnimatedSection className="section-header-wrapper" viewportMargin="-120px">
              <div className="section-header">
                <span className="section-tag">Failsafe Actions</span>
                <h2>Configured Knowledge & Validation</h2>
                <p>Keep responses consistent with your business policies. The assistant uses your exact pricing rules.</p>
              </div>
            </AnimatedSection>

            {/* Animated Bento Grid */}
            <AnimatedBentoGrid cards={automationCards} />
          </section>

          {/* SECTION 5: Dashboard Workspace Showcase */}
          <AnimatedSection id="dashboard" className="dashboard-showcase-section scroll-section">
            <div className="section-header">
              <span className="section-tag">Mock Workspace</span>
              <h2>Unified Business Operations Dashboard</h2>
              <p>The workspace built for service operators. Click recent leads below to test live tab audit transitions.</p>
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
                      <div 
                        className={`table-row ${mockActiveLead === 'thomas' ? 'active' : ''}`}
                        onClick={() => setMockActiveLead('thomas')}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setMockActiveLead('thomas'); }}
                        style={{ cursor: 'pointer', outline: 'none' }}
                      >
                        <div className="row-user">
                          <strong>Thomas More</strong>
                          <span>07700 900142</span>
                        </div>
                        <span>End of Tenancy</span>
                        <span className="pill status-booked">booked</span>
                      </div>
                      <div 
                        className={`table-row ${mockActiveLead === 'sarah' ? 'active' : ''}`}
                        onClick={() => setMockActiveLead('sarah')}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setMockActiveLead('sarah'); }}
                        style={{ cursor: 'pointer', outline: 'none' }}
                      >
                        <div className="row-user">
                          <strong>Sarah Jenkins</strong>
                          <span>07700 900077</span>
                        </div>
                        <span>Deep Clean</span>
                        <span className="pill status-new">new</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Column: Chat Audit Transcript (Animated with AnimatePresence) */}
                  <div className="layout-column col-middle">
                    <div className="pane-header">
                      <h4>Conversational Audit Logs</h4>
                      <span className="accuracy-pill">96% Confidence</span>
                    </div>
                    <div className="showcase-chat-log" style={{ position: 'relative', overflow: 'hidden' }}>
                      <AnimatePresence mode="wait">
                        {mockActiveLead === 'thomas' ? (
                          <motion.div
                            key="thomas-chat"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                            style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}
                          >
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
                          </motion.div>
                        ) : (
                          <motion.div
                            key="sarah-chat"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                            style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}
                          >
                            <div className="chat-msg customer">
                              <span className="avatar">C</span>
                              <div className="bubble">
                                <div className="sender">Customer</div>
                                <p>Need a deep clean of a 3 bed house this Wednesday.</p>
                              </div>
                            </div>
                            <div className="chat-msg assistant">
                              <span className="avatar">A</span>
                              <div className="bubble">
                                <div className="sender">Assistant</div>
                                <p>I've checked our database and we have slots available this Wednesday. The deep clean base rate is £180. Should I confirm?</p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Right Column: Customer Details (Animated) */}
                  <div className="layout-column col-right">
                    <div className="pane-header">
                      <h4>Lead Meta Attributes</h4>
                    </div>
                    <div className="meta-attribute-panel">
                      <AnimatePresence mode="wait">
                        {mockActiveLead === 'thomas' ? (
                          <motion.div
                            key="thomas-meta"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="meta-section"
                            style={{ width: '100%' }}
                          >
                            <h5>Extracted Data</h5>
                            <div className="meta-checklist">
                              <div className="check-item-span check-filled">✓ Name: Thomas More</div>
                              <div className="check-item-span check-filled">✓ Phone: 07700 900142</div>
                              <div className="check-item-span check-filled">✓ Service: End of Tenancy</div>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="sarah-meta"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="meta-section"
                            style={{ width: '100%' }}
                          >
                            <h5>Extracted Data</h5>
                            <div className="meta-checklist">
                              <div className="check-item-span check-filled">✓ Name: Sarah Jenkins</div>
                              <div className="check-item-span check-filled">✓ Phone: 07700 900077</div>
                              <div className="check-item-span check-filled">✓ Service: Deep Clean</div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <div className="meta-section" style={{ marginTop: 'auto', width: '100%' }}>
                        <h5>Actions</h5>
                        <button className="btn-primary btn-small btn-full">Confirm Booking</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* SECTION 6: Case Study */}
          <AnimatedSection id="case-study" className="case-study-section-custom scroll-section">
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
          </AnimatedSection>

          {/* SECTION 7: Demo / Call to Action */}
          <AnimatedSection id="demo" className="final-cta-banner scroll-section">
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
          </AnimatedSection>
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
