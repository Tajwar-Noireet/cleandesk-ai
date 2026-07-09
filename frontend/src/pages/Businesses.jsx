import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { api } from '../services/api';
import { ArrowRightIcon } from '../components/Icons';

const Businesses = () => {
  const [businesses, setBusinesses] = useState([]);
  const [services, setServices] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isMockActive = !api.isSupabaseConfigured();

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const [businessesData, servicesData] = await Promise.all([
          api.getPublicBusinesses(),
          api.getPublicServices()
        ]);
        if (active) {
          setBusinesses(businessesData || []);
          setServices(servicesData || []);
        }
      } catch (err) {
        if (active) setError(err.message || 'Unable to load storefront database.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();
    return () => {
      active = false;
    };
  }, []);

  const filteredBusinesses = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return businesses;

    return businesses.filter((business) => {
      const searchable = [
        business.name,
        business.category,
        business.city,
        business.service_area,
        business.public_description,
        business.description
      ].filter(Boolean).join(' ').toLowerCase();

      return searchable.includes(value);
    });
  }, [businesses, query]);

  return (
    <div className="marketplace-shell">
      {isMockActive && import.meta.env.DEV && (
        <div
          className="mock-banner"
          style={{
            backgroundColor: '#FAFAFA',
            color: 'var(--color-gray-600)',
            textAlign: 'center',
            fontSize: '0.75rem',
            fontWeight: '500',
            padding: '0.4rem 1rem',
            borderBottom: '1px solid var(--border-light)'
          }}
        >
          Demo marketplace data active.
        </div>
      )}
      <Navbar />
      <main className="marketplace-page" style={{ padding: '4rem 0' }}>
        <section className="marketplace-container">
          <div className="marketplace-listing-header" style={{ marginBottom: '2.5rem' }}>
            <div>
              <span className="marketplace-eyebrow">Directory</span>
              <h1 style={{ fontSize: '2.4rem', fontWeight: '700', letterSpacing: '-0.02em', margin: '0.5rem 0' }}>
                Service Storefronts
              </h1>
              <p style={{ color: 'var(--color-gray-600)' }}>Browse local businesses and view their dynamic service catalogs.</p>
              <div style={{ marginTop: '0.5rem' }}>
                <Link to="/services" className="marketplace-card-link" style={{ fontSize: '0.8rem', color: 'var(--color-accent)' }}>
                  Browse individual service gigs <ArrowRightIcon size={12} />
                </Link>
              </div>
            </div>
          </div>

          {/* Premium Filter Search */}
          <div className="premium-marketplace-filter">
            <input
              type="text"
              className="premium-filter-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search storefronts by name, category, or city..."
              style={{ flex: '1' }}
            />
            {query && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setQuery('')}
                style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', borderRadius: '4px' }}
              >
                Clear Search
              </button>
            )}
          </div>

          {loading && <div className="marketplace-loading">Loading directory listings...</div>}
          {error && <div className="marketplace-error">{error}</div>}

          {!loading && !error && filteredBusinesses.length === 0 && (
            <div className="marketplace-empty-state" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
              <h3>No storefronts found</h3>
              <p>No business profiles match your search criteria. Try clearing search terms.</p>
            </div>
          )}

          {!loading && !error && filteredBusinesses.length > 0 && (
            <div className="marketplace-business-grid">
              {filteredBusinesses.map((business) => {
                const businessServices = services.filter((s) => s.business_id === business.id);
                const count = businessServices.length;
                const sampleList = businessServices.slice(0, 3).map(s => s.service_name).join(', ');

                return (
                  <article className="marketplace-business-card" key={business.id}>
                    <div className="marketplace-card-topline">
                      <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-gray-600)', fontWeight: '600' }}>
                        {business.category || 'Service business'}
                      </span>
                      {business.rating ? <strong style={{ fontSize: '0.85rem' }}>{Number(business.rating).toFixed(1)}</strong> : null}
                    </div>

                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: '0.5rem 0', color: 'var(--color-gray-900)' }}>
                      {business.name}
                    </h2>
                    
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-gray-600)', marginBottom: '1.25rem', lineHeight: '1.45' }}>
                      {business.public_description || business.description || 'Public service storefront on CleanDesk.'}
                    </p>

                    {count > 0 ? (
                      <div style={{ margin: '1rem 0', fontSize: '0.8rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
                        <strong style={{ color: 'var(--color-gray-900)' }}>{count} service gig{count > 1 ? 's' : ''}</strong>
                        <span style={{ fontStyle: 'italic', display: 'block', marginTop: '0.15rem', color: 'var(--color-gray-600)' }}>
                          {sampleList}
                        </span>
                      </div>
                    ) : (
                      <div style={{ margin: '1rem 0', fontSize: '0.8rem', color: 'var(--color-gray-400)', fontStyle: 'italic', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
                        No published service gigs.
                      </div>
                    )}

                    <div className="marketplace-card-meta" style={{ marginTop: 'auto', paddingTop: '0.5rem', display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--color-gray-600)' }}>
                      <span>{business.city || 'Local'}</span>
                      {business.service_area ? <span>• {business.service_area}</span> : null}
                    </div>

                    <div className="marketplace-card-actions" style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
                      <Link to={`/business/${business.slug}`} className="btn-secondary marketplace-btn" style={{ flex: 1, padding: '0.45rem', fontSize: '0.75rem', textAlign: 'center', borderRadius: '4px' }}>
                        View Profile
                      </Link>
                      <Link to="/services" className="btn-primary marketplace-btn" style={{ flex: 1, padding: '0.45rem', fontSize: '0.75rem', textAlign: 'center', borderRadius: '4px' }}>
                        Browse Services
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Businesses;
