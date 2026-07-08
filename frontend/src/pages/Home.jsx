import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import OperationsFlowPreview from '../components/OperationsFlowPreview';
import ProductPreviewPanel from '../components/ProductPreviewPanel';

const Home = () => {
  return (
    <div className="landing-page">
      <Navbar />
      
      {/* 1. Radical Premium Hero Section */}
      <header className="hero-section text-center">
        <div className="hero-announcement-pill">
          <span className="pill-dot"></span>
          <span>The Operating System for Customer Operations</span>
        </div>
        <h1 className="hero-mega-title">
          Turn missed enquiries <br />
          <span className="text-glow-gradient">into booked jobs.</span>
        </h1>
        <p className="hero-mega-subtitle">
          CleanDesk gives service businesses one calm workspace to respond faster, qualify leads, and keep every customer conversation under control.
        </p>
        <div className="hero-button-row">
          <Link to="/demo" className="btn-primary btn-large font-semibold">
            Try the live demo <span>→</span>
          </Link>
          <Link to="/login" className="btn-secondary btn-large">
            Open owner dashboard
          </Link>
        </div>
        <div className="hero-trust-row">
          <span>✓ Instant setup</span>
          <span>•</span>
          <span>✓ Supabase secured</span>
          <span>•</span>
          <span>✓ No credit card required</span>
        </div>

        {/* Large Dominant Interactive Preview Panel */}
        <div className="hero-showcase-container">
          <div className="showcase-glowing-background"></div>
          <OperationsFlowPreview />
        </div>
      </header>

      {/* 2. Asymmetric Bento Grid Section */}
      <section className="bento-section">
        <div className="section-header">
          <span className="section-tag">Features & Capabilities</span>
          <h2 className="section-title">Built for Serious Service Operations</h2>
          <p className="section-subtitle">A highly polished bento workflow that qualifies leads and automates responses.</p>
        </div>

        <div className="bento-grid">
          {/* Card 1: Enquiry Capture (2/3 width) */}
          <div className="bento-card col-span-2">
            <div className="bento-card-visual bg-gradient-cyan">
              <div className="visual-preview-inbox">
                <div className="inbox-item-mini active">
                  <div className="inbox-hdr">
                    <span>💬 Enquiry from SW1A</span>
                    <span className="status-pill new">new</span>
                  </div>
                  <p>"Do you have availability for deep cleaning this Friday at 10 AM?"</p>
                </div>
                <div className="inbox-item-mini reply">
                  <div className="inbox-hdr">
                    <span style={{ color: '#2563EB' }}>✨ CleanDesk Response</span>
                    <span className="status-pill booked">sent</span>
                  </div>
                  <p>"Yes, we have standard deep cleaners available on Friday at 10 AM. Can I have your name and phone?"</p>
                </div>
              </div>
            </div>
            <div className="bento-card-content">
              <h3>Capture every incoming enquiry</h3>
              <p>Respond to quote requests, capability questions, and schedules instantly. Never let a client request go unanswered.</p>
            </div>
          </div>

          {/* Card 2: Qualification Checklist (1/3 width) */}
          <div className="bento-card">
            <div className="bento-card-visual bg-grid-lines">
              <div className="checklist-preview-widget">
                <div className="chk-line checked">✓ Name: Sarah Jenkins</div>
                <div className="chk-line checked">✓ Phone: 07700 900077</div>
                <div className="chk-line checked">✓ Address: SW1A 1AA</div>
                <div className="chk-line pending">☐ Confirmation Pending</div>
              </div>
            </div>
            <div className="bento-card-content">
              <h3>Qualify leads automatically</h3>
              <p>Extract client names, phone numbers, addresses, and service dates directly from text chats into structured rows.</p>
            </div>
          </div>

          {/* Card 3: Owner Escalation Banner (1/3 width) */}
          <div className="bento-card">
            <div className="bento-card-visual bg-center-icon">
              <div className="pulsing-escalation-preview" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span className="dot pulse" style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#DC2626', boxShadow: '0 0 10px #DC2626' }}></span>
                <span className="text" style={{ fontSize: '0.75rem', fontWeight: '700', color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Needs Human Review</span>
              </div>
            </div>
            <div className="bento-card-content">
              <h3>Keep owners in control</h3>
              <p>If client messages indicate rescheduling, complex claims, or negative sentiment, the AI flags the chat for takeover.</p>
            </div>
          </div>

          {/* Card 4: Outcomes Table Snippet (2/3 width) */}
          <div className="bento-card col-span-2">
            <div className="bento-card-visual bg-outcomes">
              <div className="outcomes-graph-mock">
                <div className="graph-bar-row">
                  <span>Mon</span>
                  <div className="bar" style={{ height: '40%' }}></div>
                  <strong>£340</strong>
                </div>
                <div className="graph-bar-row">
                  <span>Tue</span>
                  <div className="bar" style={{ height: '70%' }}></div>
                  <strong>£610</strong>
                </div>
                <div className="graph-bar-row">
                  <span>Wed</span>
                  <div className="bar" style={{ height: '90%' }}></div>
                  <strong>£980</strong>
                </div>
                <div className="graph-bar-row active">
                  <span>Thu</span>
                  <div className="bar" style={{ height: '95%' }}></div>
                  <strong>£1,450</strong>
                </div>
              </div>
            </div>
            <div className="bento-card-content">
              <h3>Real operational analytics</h3>
              <p>Monitor pipeline conversions, captured details, and transcript histories to optimize service performance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Product Workspace Preview Panel */}
      <section className="product-preview-section">
        <div className="section-header">
          <span className="section-tag">Software Interface</span>
          <h2 className="section-title">The Unified Operations Interface</h2>
          <p className="section-subtitle">A high-fidelity layout representing the dashboard workspace for business managers.</p>
        </div>
        
        <div className="product-visual-wrapper">
          <ProductPreviewPanel />
        </div>
      </section>

      {/* 4. Case Study comparison */}
      <section className="case-study-section">
        <div className="case-study-container">
          <div className="case-study-text">
            <span className="case-tag">Success Story</span>
            <h3>SparkleHome Cleaning Testimonial</h3>
            <p className="description">
              SparkleHome covers Zones 1-4 with 8 deep cleaners. They were losing 30% of incoming quotes because their team was in the field. Embedding CleanDesk let them qualify bookings instantly.
            </p>
            <div className="comparison-row">
              <div className="comparison-card before">
                <strong>Before CleanDesk</strong>
                <p>✗ Missed WhatsApp messages</p>
                <p>✗ 4-hour delay on price quotes</p>
                <p>✗ Lost 12 leads per week</p>
              </div>
              <div className="comparison-card after">
                <strong>After CleanDesk</strong>
                <p>✓ 100% of price queries answered in 2s</p>
                <p>✓ 14 fully qualified bookings captured</p>
                <p>✓ 0 missed enquiries in first week</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Final CTA */}
      <section className="final-cta-section">
        <div className="final-cta-container">
          <h2>Ready to transform your service operations?</h2>
          <p>Deploy your receptionist chatbot widget in minutes and keep your schedule booked.</p>
          <div className="hero-button-row centered">
            <Link to="/demo" className="btn-primary btn-large font-semibold">
              Try the live demo <span>→</span>
            </Link>
            <Link to="/login" className="btn-secondary btn-large">
              Open owner dashboard
            </Link>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-content">
          <span>CleanDesk • Operating System for Service Businesses</span>
          <span>&copy; {new Date().getFullYear()} CleanDesk. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};

export default Home;
