import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { api } from '../services/api';
import { ArrowRightIcon, CheckIcon } from '../components/Icons';

const BusinessProfile = () => {
  const { slug } = useParams();
  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError('');
        const [businessData, serviceData, faqData] = await Promise.all([
          api.getPublicBusiness(slug),
          api.getPublicBusinessServices(slug),
          api.getPublicBusinessFAQs(slug)
        ]);

        if (!active) return;
        setBusiness(businessData);
        setServices(serviceData || []);
        setFaqs(faqData || []);
      } catch (err) {
        if (active) setError(err.message || 'Business profile could not be loaded.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProfile();
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="marketplace-shell">
        <Navbar />
        <div className="marketplace-page marketplace-container">
          <div className="marketplace-loading">Loading business profile...</div>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="marketplace-shell">
        <Navbar />
        <div className="marketplace-page marketplace-container">
          <div className="marketplace-empty-state">
            <h1>Business not found</h1>
            <p>{error || 'This business is not publicly listed.'}</p>
            <Link to="/businesses" className="btn-primary marketplace-btn">Browse businesses</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="marketplace-shell">
      <Navbar />
      <main className="marketplace-page">
        <section className="marketplace-container business-profile-hero">
          <div className="business-profile-main">
            <Link to="/businesses" className="marketplace-back-link">Back to businesses</Link>
            <span className="marketplace-eyebrow">{business.category || 'Service business'}</span>
            <h1>{business.name}</h1>
            <p>{business.public_description || business.description || 'Public service team on CleanDesk.'}</p>
            <div className="business-profile-meta">
              {business.city ? <span>{business.city}</span> : null}
              {business.service_area ? <span>{business.service_area}</span> : null}
              {business.rating ? <span>{Number(business.rating).toFixed(1)} rating</span> : null}
            </div>
          </div>

          <aside className="business-profile-side">
            <h2>Business details</h2>
            <dl>
              <div>
                <dt>Category</dt>
                <dd>{business.category || 'Service business'}</dd>
              </div>
              <div>
                <dt>Service area</dt>
                <dd>{business.service_area || business.city || 'Available by enquiry'}</dd>
              </div>
              <div>
                <dt>Opening hours</dt>
                <dd>{business.opening_hours || 'Contact business for availability'}</dd>
              </div>
            </dl>
          </aside>
        </section>

        <section className="marketplace-section">
          <div className="marketplace-container">
            <div className="marketplace-section-heading compact">
              <span className="marketplace-eyebrow">Services</span>
              <h2>Request a service from {business.name}</h2>
            </div>

            {services.length === 0 ? (
              <div className="marketplace-empty-state compact">
                <h3>No published service gigs yet</h3>
                <p>This business has not published a service catalog.</p>
              </div>
            ) : (
              <div className="service-list-grid">
                {services.map((service) => (
                  <article className="service-request-card" key={service.id}>
                    <div>
                      <div className="marketplace-card-topline" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.25rem' }}>
                        <span>{service.category || 'Service Gig'}</span>
                        {service.service_area ? <span>Area: {service.service_area}</span> : null}
                      </div>
                      <h3>{service.name}</h3>
                      {service.short_description ? (
                        <p style={{ fontStyle: 'italic', color: '#4B5563', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                          {service.short_description}
                        </p>
                      ) : null}
                      <p>{service.description || service.long_description || 'Contact the business for service details.'}</p>
                    </div>
                    <div className="service-request-footer" style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        {service.base_price ? (
                          <strong style={{ display: 'block', fontSize: '1rem', color: '#10B981' }}>
                            {service.base_price} {service.price_unit || ''}
                          </strong>
                        ) : null}
                        {(service.estimated_duration || service.duration_estimate) ? (
                          <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                            {service.estimated_duration || service.duration_estimate}
                          </span>
                        ) : null}
                      </div>
                      <Link
                        to={`/business/${business.slug}/book?service=${encodeURIComponent(service.name)}&serviceId=${service.id}`}
                        className="btn-primary marketplace-btn"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                      >
                        Request gig <ArrowRightIcon size={12} />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="marketplace-section marketplace-section-muted">
          <div className="marketplace-container business-profile-lower-grid">
            <div>
              <div className="marketplace-section-heading compact">
                <span className="marketplace-eyebrow">FAQs</span>
                <h2>Common questions</h2>
              </div>
              {faqs.length === 0 ? (
                <p className="marketplace-muted-text">This business has not published FAQs yet.</p>
              ) : (
                <div className="faq-stack">
                  {faqs.map((faq) => (
                    <article className="faq-card" key={faq.id}>
                      <h3>{faq.question}</h3>
                      <p>{faq.answer}</p>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <aside className="business-trust-card">
              <h2>Why request through CleanDesk?</h2>
              <div>
                <CheckIcon size={15} />
                <span>Your enquiry is routed to this business, not a generic inbox.</span>
              </div>
              <div>
                <CheckIcon size={15} />
                <span>You can create a customer login and track requests across businesses.</span>
              </div>
              <div>
                <CheckIcon size={15} />
                <span>Owners manage leads, conversations, and booking updates in one workspace.</span>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
};

export default BusinessProfile;
