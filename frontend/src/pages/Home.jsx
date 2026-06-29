import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Home = () => {
  return (
    <div className="landing-page">
      <Navbar />
      
      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-container">
          <div className="hero-badge">🚀 Empowering Cleaning Businesses</div>
          <h1 className="hero-title">
            The AI Receptionist for Local <span className="text-gradient">Cleaning Businesses</span>
          </h1>
          <p className="hero-subtitle">
            Capture booking leads, answer service questions, and manage client conversations 24/7. CleanDesk AI automates repetitive customer Q&A so you can focus on cleaning.
          </p>
          <div className="hero-ctas">
            <Link to="/demo" className="btn-primary btn-large">Try Live Demo</Link>
            <Link to="/login" className="btn-secondary btn-large">Open Owner Dashboard</Link>
          </div>
          <div className="hero-preview-tag">No credit card required • Instant setup</div>
        </div>
      </header>

      {/* Product Explanation / How it works */}
      <section className="how-it-works">
        <div className="section-container">
          <h2 className="section-title">How CleanDesk AI Works</h2>
          <p className="section-subtitle">A simple, automated workflow built specifically for cleaning business owners.</p>
          
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3 className="step-title">Create Profile</h3>
              <p className="step-desc">Enter your business information, services, pricing, and FAQ database in our easy dashboard.</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3 className="step-title">Deploy Chatbot</h3>
              <p className="step-desc">Embed the CleanDesk AI widget on your site or share a demo link for clients to interact with.</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3 className="step-title">Capture & Close</h3>
              <p className="step-desc">AI answers FAQs and automatically captures name, phone, address, and date to generate a structured booking lead.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Three Benefits */}
      <section className="benefits-section">
        <div className="section-container">
          <h2 className="section-title">Why Owners Choose CleanDesk AI</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <span className="benefit-icon">⏰</span>
              <h3 className="benefit-title">Never Miss a Lead</h3>
              <p className="benefit-desc">Most clients book the first cleaner who replies. CleanDesk AI responds instantly, day or night.</p>
            </div>
            <div className="benefit-card">
              <span className="benefit-icon">💬</span>
              <h3 className="benefit-title">Automate Repeated Qs</h3>
              <p className="benefit-desc">"Do you clean oven racks?", "Are supplies included?" Let AI handle the FAQs while you run your teams.</p>
            </div>
            <div className="benefit-card">
              <span className="benefit-icon">⚠️</span>
              <h3 className="benefit-title">Escalate When Needed</h3>
              <p className="benefit-desc">If a customer complains or asks a low-confidence question, AI flags the convo and notifies you to take over.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Example Cleaning Business Use Case */}
      <section className="use-case-section">
        <div className="section-container">
          <div className="use-case-box">
            <div className="use-case-content">
              <h4 className="use-case-tag">Success Story Case</h4>
              <h3 className="use-case-title">SparkleHome Cleaning</h3>
              <p className="use-case-text">
                SparkleHome Cleaning is a London-based business covering Zone 1-4. They were missing 30% of incoming quotes because their team was busy cleaning. By embedding the CleanDesk widget, they captured <strong>14 new leads in their first week</strong>. 
              </p>
              <ul className="use-case-list">
                <li>✨ Instant replies for deep & move-out clean pricing</li>
                <li>✨ Fully-qualified leads containing phone & address</li>
                <li>✨ Automatic flagging of complaints or rescheduling requests</li>
              </ul>
              <Link to="/demo" className="use-case-link">Try SparkleHome Demo &rarr;</Link>
            </div>
            <div className="use-case-visual">
              <div className="mock-chat-bubble customer">Do you clean oven racks as part of deep cleaning?</div>
              <div className="mock-chat-bubble ai">Yes, our deep cleaning service includes oven racks, baseboards, and scrubbing kitchens/bathrooms at no extra charge! Would you like to get a booking quote?</div>
              <div className="mock-chat-bubble customer">Yes please, my name is Sarah...</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="footer-cta">
        <div className="section-container">
          <h2>Ready to clean up your scheduling?</h2>
          <p>Get started with CleanDesk AI today and see how many leads you capture.</p>
          <div className="hero-ctas">
            <Link to="/demo" className="btn-primary btn-large">Try Demo</Link>
            <Link to="/login" className="btn-secondary btn-large">Open Dashboard</Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} CleanDesk AI. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
