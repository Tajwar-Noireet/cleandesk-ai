import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from '../components/Navbar';
import Logo from '../components/Logo';
import { api } from '../services/api';
import { ArrowRightIcon, CheckIcon, InboxIcon, MessageIcon } from '../components/Icons';

const Home = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const stepsRef = useRef([]);

  useEffect(() => {
    let active = true;

    const loadBusinesses = async () => {
      try {
        const data = await api.getPublicBusinesses();
        if (active) setBusinesses((data || []).slice(0, 3));
      } catch (err) {
        console.error('Failed to load featured businesses:', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadBusinesses();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2.2;
      let closestIndex = 0;
      let minDistance = Infinity;

      stepsRef.current.forEach((el, idx) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const absoluteTop = rect.top + window.scrollY;
        const distance = Math.abs(scrollPosition - absoluteTop);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = idx;
        }
      });
      setActiveIndex(closestIndex);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToStep = (index) => {
    const el = stepsRef.current[index];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setActiveIndex(index);
    }
  };

  const workflowSteps = [
    {
      title: '1. Discover',
      body: 'Compare local service gigs published by verified business storefronts. Search by category, service area, and base pricing.'
    },
    {
      title: '2. Book',
      body: 'Submit a strict checkout payload including preferred dates, addresses, contact details, and requirements directly to the business.'
    },
    {
      title: '3. Acknowledge',
      body: 'CleanDesk AI receptionist processes the enquiry immediately, confirming key details and matching tone with fallback reliability.'
    },
    {
      title: '4. Capture',
      body: 'Leads arrive dynamically in the unified business owner dashboard workspace, automatically sorted and flagged for review.'
    },
    {
      title: '5. Respond',
      body: 'Owners generate and edit AI receptionist draft recommendations, or reply manually using a clean Intercom/Superhuman style workspace.'
    },
    {
      title: '6. Track',
      body: 'Customers log in to a minimal support portal to track request status, view owner responses, and continue conversations in real-time.'
    }
  ];

  return (
    <div className="marketplace-shell">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="marketplace-hero" style={{ padding: '6rem 0 4rem 0' }}>
          <div className="marketplace-container" style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
            <span className="marketplace-eyebrow" style={{ display: 'inline-block', marginBottom: '1rem' }}>
              Service Marketplace + Operations OS
            </span>
            <h1 style={{ fontSize: '3.2rem', fontWeight: '700', lineHeight: '1.15', letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>
              Local service gigs meet AI receptionist operations.
            </h1>
            <p style={{ fontSize: '1.15rem', color: 'var(--color-gray-600)', maxWidth: '680px', margin: '0 auto 2.5rem auto', lineHeight: '1.5' }}>
              Discover storefront services, book appointments instantly, and track conversations. CleanDesk gives customers a unified portal and business owners a premium workspace to manage leads.
            </p>
            <div className="marketplace-actions" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/services" className="btn-primary marketplace-btn">
                Browse services <ArrowRightIcon size={15} />
              </Link>
              <Link to="/businesses" className="btn-secondary marketplace-btn">
                Browse businesses
              </Link>
              <Link to="/login" className="btn-secondary marketplace-btn">
                Business login
              </Link>
            </div>
            <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--color-gray-600)' }}>
              Looking for your bookings? <Link to="/customer/login" style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}>Customer Portal</Link>
            </p>
          </div>
        </section>

        {/* Dynamic Scroll-Story Section */}
        <section className="marketplace-section" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '4rem' }}>
          <div className="marketplace-container">
            <div className="marketplace-section-heading" style={{ marginBottom: '3rem', textAlign: 'center' }}>
              <span className="marketplace-eyebrow">Interactive Workflow</span>
              <h2>From request to response</h2>
              <p>Experience how CleanDesk automates customer bookings and owner workflows from discovery to tracking.</p>
            </div>

            <div className="scroll-story-container">
              <div className="scroll-story-steps">
                {workflowSteps.map((step, idx) => (
                  <button
                    key={step.title}
                    type="button"
                    ref={(el) => (stepsRef.current[idx] = el)}
                    className={`scroll-story-step-card ${idx === activeIndex ? 'active' : ''}`}
                    onClick={() => scrollToStep(idx)}
                  >
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                  </button>
                ))}
              </div>

              <div className="scroll-story-sticky-pane">
                <div className="mockup-frame">
                  <div className="mockup-header-bar">
                    <span className="mockup-dot" />
                    <span className="mockup-dot" />
                    <span className="mockup-dot" />
                    <div className="mockup-address">
                      {activeIndex === 0 && 'cleandesk.ai/services'}
                      {activeIndex === 1 && 'cleandesk.ai/business/storefront/book'}
                      {activeIndex === 2 && 'cleandesk.ai/customer/receptionist-chat'}
                      {activeIndex === 3 && 'cleandesk.ai/dashboard/leads'}
                      {activeIndex === 4 && 'cleandesk.ai/dashboard/conversations'}
                      {activeIndex === 5 && 'cleandesk.ai/customer/conversations'}
                    </div>
                  </div>
                  
                  <div className="mockup-body-pane">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
                      >
                        {activeIndex === 0 && (
                          <div style={{ padding: '1rem', backgroundColor: '#FFFFFF', border: '1px solid var(--border-light)', borderRadius: '6px' }}>
                            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--color-accent)', fontWeight: 'bold' }}>Featured Gig</span>
                            <h4 style={{ margin: '0.25rem 0', fontSize: '1rem' }}>Premium Deep Cleaning</h4>
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-gray-600)' }}>Complete residential cleaning with premium eco-friendly supplies.</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
                              <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--color-success)' }}>$150</span>
                              <span style={{ fontSize: '0.75rem', backgroundColor: 'var(--color-primary)', color: '#FFFFFF', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>Request service</span>
                            </div>
                          </div>
                        )}

                        {activeIndex === 1 && (
                          <div style={{ padding: '0.85rem', backgroundColor: '#FFFFFF', border: '1px solid var(--border-light)', borderRadius: '6px', fontSize: '0.75rem' }}>
                            <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Request booking details</strong>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              <div><strong>Customer name:</strong> <span style={{ color: 'var(--color-gray-600)' }}>Jane Doe</span></div>
                              <div><strong>Email:</strong> <span style={{ color: 'var(--color-gray-600)' }}>jane.doe@example.com</span></div>
                              <div><strong>Preferred date:</strong> <span style={{ color: 'var(--color-gray-600)' }}>Next Saturday</span></div>
                              <div><strong>Notes:</strong> <span style={{ color: 'var(--color-gray-600)' }}>Please clean windows.</span></div>
                            </div>
                          </div>
                        )}

                        {activeIndex === 2 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem' }}>
                            <div style={{ alignSelf: 'flex-end', backgroundColor: 'var(--color-accent)', color: '#FFFFFF', padding: '0.5rem 0.75rem', borderRadius: '6px 6px 0 6px' }}>
                              I want to book the deep cleaning.
                            </div>
                            <div style={{ alignSelf: 'flex-start', backgroundColor: '#FFFFFF', border: '1px solid var(--border-light)', padding: '0.5rem 0.75rem', borderRadius: '6px 6px 6px 0', borderStyle: 'dashed', borderColor: 'var(--color-accent)' }}>
                              <span style={{ fontSize: '0.6rem', color: 'var(--color-accent)', fontWeight: 'bold', display: 'block' }}>AI Receptionist</span>
                              Thanks Jane — your request for Premium Deep Cleaning has been received. I've shared your details with the team.
                            </div>
                          </div>
                        )}

                        {activeIndex === 3 && (
                          <div style={{ padding: '0.85rem', backgroundColor: '#FFFFFF', border: '1px solid var(--border-light)', borderRadius: '6px', fontSize: '0.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                              <strong>Captured Lead</strong>
                              <span className="review-badge" style={{ fontSize: '0.6rem' }}>Needs Review</span>
                            </div>
                            <h4 style={{ margin: '0', fontSize: '0.85rem' }}>Jane Doe</h4>
                            <p style={{ margin: '0.2rem 0', color: 'var(--color-gray-600)' }}>Service: Premium Deep Cleaning</p>
                            <span style={{ color: 'var(--color-gray-400)', fontSize: '0.7rem' }}>Received: Just Now</span>
                          </div>
                        )}

                        {activeIndex === 4 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem' }}>
                            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-light)', padding: '0.75rem', borderRadius: '6px' }}>
                              <strong style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-accent)' }}>AI Assist Draft</strong>
                              <p style={{ margin: '0.25rem 0', fontSize: '0.75rem', fontStyle: 'italic' }}>"Hi Jane, I can confirm next Saturday works. We will send the crew."</p>
                              <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.5rem' }}>
                                <span style={{ backgroundColor: 'var(--color-primary)', color: '#FFFFFF', padding: '0.2rem 0.4rem', borderRadius: '3px', fontSize: '0.65rem' }}>Send Reply</span>
                                <span style={{ backgroundColor: '#F3F4F6', padding: '0.2rem 0.4rem', borderRadius: '3px', fontSize: '0.65rem' }}>Edit</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {activeIndex === 5 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem' }}>
                            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-light)', padding: '0.75rem', borderRadius: '6px' }}>
                              <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Booking status</strong>
                              <span className="ai-confidence-pill" style={{ fontSize: '0.65rem' }}>Active Request</span>
                              <div style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
                                <div><strong>Next action:</strong> Owner reviewed & confirmed date.</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Storefronts Section */}
        <section className="marketplace-section" style={{ borderTop: '1px solid var(--color-border)' }}>
          <div className="marketplace-container">
            <div className="marketplace-section-heading" style={{ marginBottom: '3rem', textAlign: 'center' }}>
              <span className="marketplace-eyebrow">Featured Businesses</span>
              <h2>Start with a trusted storefront</h2>
              <p>Browse public service providers and submit each request to the right business from the start.</p>
            </div>

            {loading ? (
              <div className="marketplace-loading">Loading storefronts...</div>
            ) : (
              <div className="marketplace-card-grid">
                {businesses.map((business) => (
                  <article className="marketplace-business-card" key={business.id}>
                    <div className="marketplace-card-topline">
                      <span>{business.category || 'Service business'}</span>
                      {business.rating ? <strong>{Number(business.rating).toFixed(1)}</strong> : null}
                    </div>
                    <h3>{business.name}</h3>
                    <p>{business.public_description || business.description || 'Verified storefront business on CleanDesk.'}</p>
                    <div className="marketplace-card-meta">
                      <span>{business.city || business.service_area || 'Local service area'}</span>
                    </div>
                    <Link to={`/business/${business.slug}`} className="marketplace-card-link">
                      View storefront <ArrowRightIcon size={14} />
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Operational OS Feature Band */}
        <section className="marketplace-section" style={{ borderTop: '1px solid var(--color-border)' }}>
          <div className="marketplace-container marketplace-os-band">
            <div>
              <span className="marketplace-eyebrow">CleanDesk workspace</span>
              <h2>Marketplace demand meets owner operations</h2>
              <p>
                Customers get a clear request trail. Owners get structured leads, AI receptionist conversations,
                custom service catalogs, and booking status updates without switching tools.
              </p>
            </div>
            <div className="marketplace-os-metrics">
              <div>
                <InboxIcon size={18} />
                <strong>Lead inbox</strong>
                <span>New requests routed by business storefront</span>
              </div>
              <div>
                <MessageIcon size={18} />
                <strong>Conversation history</strong>
                <span>AI receptionist replies + owner dashboard logs</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="marketplace-footer">
        <div className="marketplace-container">
          <Logo size={16} dark={false} showText={true} />
          <div>
            <Link to="/services">Browse services</Link>
            <Link to="/businesses">Browse businesses</Link>
            <Link to="/customer/login">Customer login</Link>
            <Link to="/login">Business owner</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
