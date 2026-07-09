import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Logo from '../components/Logo';
import { api } from '../services/api';
import { ArrowRightIcon, CheckIcon, InboxIcon, MessageIcon } from '../components/Icons';

const customerJourney = [
  {
    title: 'Browse',
    body: 'Compare public service businesses by category, coverage, rating, and profile details.'
  },
  {
    title: 'Choose service',
    body: 'Open a provider profile and pick the specific service that matches the request.'
  },
  {
    title: 'Submit request',
    body: 'Send contact details, address, preferred date, and notes directly to the chosen business.'
  },
  {
    title: 'Track updates',
    body: 'Create a customer login to follow requests, conversations, and booking status.'
  }
];

const ownerJourney = [
  {
    title: 'Publish profile',
    body: 'Create a public business listing with services, coverage, hours, and FAQs.'
  },
  {
    title: 'Receive leads',
    body: 'Every customer enquiry lands in the correct owner workspace with full context.'
  },
  {
    title: 'Manage conversations',
    body: 'Review conversations, update lead status, and keep booking operations in one place.'
  }
];

const Home = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="marketplace-shell">
      <Navbar />

      <main>
        <section className="marketplace-hero">
          <div className="marketplace-container marketplace-hero-grid">
            <div className="marketplace-hero-copy">
              <span className="marketplace-eyebrow">Service marketplace and operations OS</span>
              <h1>Find a trusted service business and track every request.</h1>
              <p>
                CleanDesk connects customers with local service teams through direct service gig discovery or complete business directory listings, while giving owners one workspace to manage enquiries, conversations, and bookings.
              </p>
              <div className="marketplace-actions" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Link to="/services" className="btn-primary marketplace-btn">
                  Browse services <ArrowRightIcon size={15} />
                </Link>
                <Link to="/businesses" className="btn-secondary marketplace-btn">
                  Browse businesses
                </Link>
                <Link to="/customer/login" className="btn-secondary marketplace-btn">
                  Customer login
                </Link>
              </div>
              <p className="marketplace-owner-link" style={{ marginTop: '1rem' }}>
                Business owner? <Link to="/login">Sign in to your workspace</Link>
              </p>
            </div>

            <div className="marketplace-preview-panel" aria-label="Marketplace workflow preview">
              <div className="marketplace-preview-header">
                <span>Live marketplace flow</span>
                <strong>{businesses.length || 3} public teams</strong>
              </div>
              <div className="marketplace-preview-list">
                {(businesses.length ? businesses : [
                  { name: 'Cleaning team', category: 'Home cleaning', city: 'London', rating: 4.8 },
                  { name: 'Repair team', category: 'Home repairs', city: 'London', rating: 4.7 },
                  { name: 'Tutor team', category: 'Tutoring', city: 'Online', rating: 4.9 }
                ]).map((business) => (
                  <div className="marketplace-preview-row" key={business.slug || business.name}>
                    <div>
                      <strong>{business.name}</strong>
                      <span>{business.category} - {business.city || business.service_area}</span>
                    </div>
                    {business.rating ? <em>{Number(business.rating).toFixed(1)}</em> : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="marketplace-section">
          <div className="marketplace-container">
            <div className="marketplace-section-heading">
              <span className="marketplace-eyebrow">Featured businesses</span>
              <h2>Start with a trusted local team</h2>
              <p>Browse public service providers and submit each request to the right business from the start.</p>
            </div>

            {loading ? (
              <div className="marketplace-loading">Loading public businesses...</div>
            ) : (
              <div className="marketplace-card-grid">
                {businesses.map((business) => (
                  <article className="marketplace-business-card" key={business.id}>
                    <div className="marketplace-card-topline">
                      <span>{business.category || 'Service business'}</span>
                      {business.rating ? <strong>{Number(business.rating).toFixed(1)}</strong> : null}
                    </div>
                    <h3>{business.name}</h3>
                    <p>{business.public_description || business.description || 'Public service team on CleanDesk.'}</p>
                    <div className="marketplace-card-meta">
                      <span>{business.city || business.service_area || 'Local service area'}</span>
                    </div>
                    <Link to={`/business/${business.slug}`} className="marketplace-card-link">
                      View business <ArrowRightIcon size={14} />
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="marketplace-section marketplace-section-muted">
          <div className="marketplace-container marketplace-journey-grid">
            <div>
              <div className="marketplace-section-heading compact">
                <span className="marketplace-eyebrow">For customers</span>
                <h2>From search to status tracking</h2>
              </div>
              <div className="marketplace-steps">
                {customerJourney.map((step, index) => (
                  <div className="marketplace-step" key={step.title}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <div>
                      <h3>{step.title}</h3>
                      <p>{step.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="marketplace-section-heading compact">
                <span className="marketplace-eyebrow">For owners</span>
                <h2>One workspace for service operations</h2>
              </div>
              <div className="marketplace-owner-stack">
                {ownerJourney.map((item) => (
                  <div className="marketplace-owner-item" key={item.title}>
                    <CheckIcon size={15} />
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="marketplace-section">
          <div className="marketplace-container marketplace-os-band">
            <div>
              <span className="marketplace-eyebrow">CleanDesk workspace</span>
              <h2>Marketplace demand meets owner operations.</h2>
              <p>
                Customers get a clear request trail. Owners get structured leads, conversation context,
                service catalogs, and booking status without switching tools.
              </p>
            </div>
            <div className="marketplace-os-metrics">
              <div>
                <InboxIcon size={18} />
                <strong>Lead inbox</strong>
                <span>New requests by business</span>
              </div>
              <div>
                <MessageIcon size={18} />
                <strong>Conversation history</strong>
                <span>Customer context in one place</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="marketplace-footer">
        <div className="marketplace-container">
          <Logo size={16} dark={false} showText={true} />
          <div>
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
