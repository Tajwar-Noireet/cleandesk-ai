import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import OperationsFlowPreview from '../components/OperationsFlowPreview';
import ProductPreviewPanel from '../components/ProductPreviewPanel';

const Home = () => {
  return (
    <div className="landing-page">
      <Navbar />
      
      {/* 1. Hero Section */}
      <header className="hero-section">
        <div className="hero-grid-container">
          <div className="hero-text-block">
            <span className="hero-announcement">✨ The operating system for service operations</span>
            <h1 className="hero-title">
              Turn missed enquiries into booked jobs.
            </h1>
            <p className="hero-subtitle">
              CleanDesk helps local service businesses respond faster, capture leads, and manage customer conversations from one polished workspace.
            </p>
            <div className="hero-ctas">
              <Link to="/demo" className="btn-primary btn-large">Try the live demo</Link>
              <Link to="/login" className="btn-secondary btn-large">Open owner dashboard</Link>
            </div>
            <div className="hero-security-notes">
              <span>✓ No credit card required</span>
              <span>•</span>
              <span>✓ Set up in minutes</span>
            </div>
          </div>

          <div className="hero-visual-block">
            <OperationsFlowPreview />
          </div>
        </div>
      </header>

      {/* 2. Bento Grid Section */}
      <section className="bento-section">
        <div className="section-header">
          <span className="section-tag">Capabilities</span>
          <h2 className="section-title">Engineered for Local Service Growth</h2>
          <p className="section-subtitle">A quiet, powerful receptionist workflow designed to keep business owners in control.</p>
        </div>

        <div className="bento-grid">
          {/* Bento Card 1 */}
          <div className="bento-card col-span-2">
            <div className="bento-card-visual bg-gradient-cyan">
              <div className="visual-chat-row">
                <span className="chat-avatar">👤</span>
                <div className="chat-bubble-mini">"Do you clean gutters on commercial properties?"</div>
              </div>
              <div className="visual-chat-row reply">
                <div className="chat-bubble-mini reply">"Yes, we cover commercial gutters. Let me get details..."</div>
                <span className="chat-avatar ai">🤖</span>
              </div>
            </div>
            <div className="bento-card-content">
              <h3>Capture every enquiry</h3>
              <p>Instantly respond to incoming website quotes or general questions 24/7. Never lose a lead to slow response times.</p>
            </div>
          </div>

          {/* Bento Card 2 */}
          <div className="bento-card">
            <div className="bento-card-visual bg-grid-lines">
              <div className="slot-pill-group">
                <span className="slot-pill checked">✓ Name</span>
                <span className="slot-pill checked">✓ Phone</span>
                <span className="slot-pill checked">✓ Zone</span>
              </div>
            </div>
            <div className="bento-card-content">
              <h3>Qualify leads automatically</h3>
              <p>Extract client names, phone numbers, addresses, and service dates into structured booking parameters.</p>
            </div>
          </div>

          {/* Bento Card 3 */}
          <div className="bento-card">
            <div className="bento-card-visual bg-center-icon">
              <span className="center-icon">🚨</span>
            </div>
            <div className="bento-card-content">
              <h3>Keep owners in control</h3>
              <p>If a customer asks a low-confidence question, the AI receptionist pauses and flags the chat for human review.</p>
            </div>
          </div>

          {/* Bento Card 4 */}
          <div className="bento-card col-span-2">
            <div className="bento-card-visual bg-outcomes">
              <div className="outcome-mini-card">
                <div className="hdr">📈 Analytics</div>
                <div className="stat">14 leads captured this week</div>
              </div>
            </div>
            <div className="bento-card-content">
              <h3>See conversations & outcomes</h3>
              <p>View transcripts, status trackers, and response analytics in a secure owner interface.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Product Workspace Preview */}
      <section className="product-preview-section">
        <div className="section-header">
          <span className="section-tag">Workspace Preview</span>
          <h2 className="section-title">The Customer Operations Workspace</h2>
          <p className="section-subtitle">Real product surfaces built to streamline leads, transcripts, and business settings.</p>
        </div>
        
        <div className="product-visual-wrapper">
          <ProductPreviewPanel />
        </div>
      </section>

      {/* 4. Use Case / Case Study */}
      <section className="case-study-section">
        <div className="case-study-container">
          <div className="case-study-text">
            <span className="case-tag">Case Study</span>
            <h3>SparkleHome Cleaning</h3>
            <p className="description">
              SparkleHome Cleaning operates a team of 8 cleaners across London Zones 1-4. They were losing 30% of quotes because teams were in the field. By setting up CleanDesk, they automated initial responses and captured qualified leads.
            </p>
            <div className="comparison-row">
              <div className="comparison-card before">
                <strong>Before CleanDesk</strong>
                <p>✗ Missed WhatsApp messages</p>
                <p>✗ 4-hour delay on email quotes</p>
                <p>✗ Manual phone qualifying</p>
              </div>
              <div className="comparison-card after">
                <strong>After CleanDesk</strong>
                <p>✓ Instant replies to deep cleaning FAQs</p>
                <p>✓ 14 verified lead bookings captured</p>
                <p>✓ Flagged escalation notifications</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Final CTA */}
      <section className="final-cta-section">
        <div className="final-cta-container">
          <h2>Ready to automate your operations?</h2>
          <p>Deploy a virtual receptionist on your site and manage booking leads effortlessly.</p>
          <div className="hero-ctas">
            <Link to="/demo" className="btn-primary btn-large">Try the live demo</Link>
            <Link to="/login" className="btn-secondary btn-large">Open owner dashboard</Link>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-content">
          <span>CleanDesk AI • Operating System for Service Businesses</span>
          <span>&copy; {new Date().getFullYear()} CleanDesk AI. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};

export default Home;
