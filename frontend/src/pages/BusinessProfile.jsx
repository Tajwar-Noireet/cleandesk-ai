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
      <main className="marketplace-page" style={{ padding: '4rem 0' }}>
        <div className="marketplace-container">
          {/* Back button */}
          <div style={{ marginBottom: '1.5rem' }}>
            <Link to="/businesses" className="marketplace-back-link" style={{ fontSize: '0.8rem', color: 'var(--color-gray-600)' }}>
              ← Back to businesses
            </Link>
          </div>

          <div className="premium-storefront-grid">
            <div className="business-profile-main">
              <span className="marketplace-eyebrow" style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 'bold' }}>
                {business.category || 'Service business'}
              </span>
              <h1 style={{ fontSize: '2.5rem', fontWeight: '700', letterSpacing: '-0.03em', margin: '0.5rem 0 1rem 0', color: 'var(--color-gray-900)' }}>
                {business.name}
              </h1>
              <p style={{ fontSize: '1rem', color: 'var(--color-gray-600)', lineHeight: '1.6', marginBottom: '2rem' }}>
                {business.public_description || business.description || 'Verified storefront business on CleanDesk.'}
              </p>

              {/* Service Gig Catalog */}
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '2rem', marginTop: '2rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '600', marginBottom: '1.25rem', color: 'var(--color-gray-900)' }}>
                  Service Gigs
                </h2>
                
                {services.length === 0 ? (
                  <div className="marketplace-empty-state compact" style={{ padding: '2rem', border: '1px dashed var(--border-light)', borderRadius: '6px' }}>
                    <p style={{ color: 'var(--color-gray-600)' }}>No published service listings available.</p>
                  </div>
                ) : (
                  <div className="service-list-grid">
                    {services.map((service) => (
                      <article className="service-request-card" key={service.id} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div>
                          <div className="marketplace-card-topline" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-gray-600)', marginBottom: '0.5rem' }}>
                            <span>{service.category || 'Service Gig'}</span>
                            {(service.estimated_duration || service.duration_estimate) ? (
                              <span>{service.estimated_duration || service.duration_estimate}</span>
                            ) : null}
                          </div>
                          
                          <h3 style={{ fontSize: '1.15rem', fontWeight: '600', margin: '0 0 0.5rem 0', color: 'var(--color-gray-900)' }}>
                            {service.name}
                          </h3>
                          
                          {service.short_description ? (
                            <p style={{ color: 'var(--color-gray-600)', fontSize: '0.8rem', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                              {service.short_description}
                            </p>
                          ) : null}
                          
                          <p style={{ fontSize: '0.85rem', color: 'var(--color-gray-600)', lineHeight: '1.45', marginBottom: '1.25rem' }}>
                            {service.description || service.long_description || 'Contact business for availability.'}
                          </p>
                        </div>

                        <div className="service-request-footer" style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            {service.base_price ? (
                              <strong style={{ fontSize: '1rem', color: 'var(--color-gray-900)' }}>
                                ${service.base_price} {service.price_unit || ''}
                              </strong>
                            ) : null}
                          </div>
                          
                          <Link
                            to={`/business/${business.slug}/book?service=${encodeURIComponent(service.name)}&serviceId=${service.id}`}
                            className="btn-primary marketplace-btn"
                            style={{ padding: '0.45rem 0.9rem', fontSize: '0.75rem', borderRadius: '4px' }}
                          >
                            Request Gig <ArrowRightIcon size={12} />
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>

              {/* FAQs section */}
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '2.5rem', marginTop: '2.5rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '600', marginBottom: '1.25rem', color: 'var(--color-gray-900)' }}>
                  Common FAQs
                </h2>
                {faqs.length === 0 ? (
                  <p className="marketplace-muted-text" style={{ color: 'var(--color-gray-600)' }}>No FAQs published.</p>
                ) : (
                  <div className="faq-stack" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {faqs.map((faq) => (
                      <article className="faq-card" key={faq.id} style={{ padding: '1.25rem', border: '1px solid var(--border-light)', borderRadius: '6px', backgroundColor: '#FAFAFA' }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: '600', margin: '0 0 0.5rem 0', color: 'var(--color-gray-900)' }}>
                          {faq.question}
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-gray-600)', margin: 0, lineHeight: '1.45' }}>
                          {faq.answer}
                        </p>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sticky Sidebar details */}
            <aside className="premium-storefront-aside">
              <h2 style={{ fontSize: '1rem', fontWeight: '600', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem', margin: 0, color: 'var(--color-gray-900)' }}>
                Storefront Info
              </h2>
              
              <ul className="storefront-meta-list">
                <li>
                  <strong>Location</strong>
                  <span>{business.city || 'Available by enquiry'}</span>
                </li>
                <li>
                  <strong>Service area</strong>
                  <span>{business.service_area || 'Contact business'}</span>
                </li>
                <li>
                  <strong>Hours</strong>
                  <span>{business.opening_hours || 'Mon - Fri'}</span>
                </li>
                {business.rating ? (
                  <li>
                    <strong>Rating</strong>
                    <span>{Number(business.rating).toFixed(1)} / 5</span>
                  </li>
                ) : null}
              </ul>

              <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--color-gray-900)' }}>
                  CleanDesk verified
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--color-gray-600)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <CheckIcon size={12} /> Direct routing to {business.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <CheckIcon size={12} /> Follow progress via Customer Portal
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <CheckIcon size={12} /> Secure data & communication
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BusinessProfile;
