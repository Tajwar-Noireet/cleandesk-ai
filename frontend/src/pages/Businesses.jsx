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
        if (active) setError(err.message || 'Unable to load marketplace data.');
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
      {isMockActive && (
        <div
          className="mock-banner"
          style={{
            backgroundColor: '#EFF6FF',
            color: '#1E40AF',
            textAlign: 'center',
            fontSize: '0.8rem',
            fontWeight: '600',
            padding: '0.5rem 1rem',
            borderBottom: '1px solid #BFDBFE'
          }}
        >
          Demo marketplace data active.
        </div>
      )}
      <Navbar />
      <main className="marketplace-page">
        <section className="marketplace-container">
          <div className="marketplace-listing-header">
            <div>
              <span className="marketplace-eyebrow">Browse Businesses</span>
              <h1>Find the right service team</h1>
              <p>Search public CleanDesk businesses by name, category, city, or service area.</p>
              <div style={{ marginTop: '0.75rem' }}>
                <Link to="/services" className="marketplace-card-link" style={{ fontSize: '0.85rem' }}>
                  Browse individual service gigs <ArrowRightIcon size={12} />
                </Link>
              </div>
            </div>
            <div className="marketplace-search-box">
              <label htmlFor="business-search">Search businesses</label>
              <input
                id="business-search"
                className="form-input"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name, category, or city"
              />
            </div>
          </div>

          {loading && <div className="marketplace-loading">Loading businesses...</div>}
          {error && <div className="marketplace-error">{error}</div>}

          {!loading && !error && filteredBusinesses.length === 0 && (
            <div className="marketplace-empty-state">
              <h2>No businesses found</h2>
              <p>Try a different search term or clear the filter to see every public business.</p>
              <button type="button" className="btn-secondary" onClick={() => setQuery('')}>
                Clear search
              </button>
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
                      <span>{business.category || 'Service business'}</span>
                      {business.rating ? <strong>{Number(business.rating).toFixed(1)}</strong> : null}
                    </div>
                    <h2>{business.name}</h2>
                    <p>{business.public_description || business.description || 'Public service team on CleanDesk.'}</p>

                    {count > 0 ? (
                      <div style={{ margin: '0.75rem 0', fontSize: '0.75rem', color: '#4B5563' }}>
                        <strong>{count} service gig{count > 1 ? 's' : ''} available</strong>:
                        <span style={{ fontStyle: 'italic', display: 'block', marginTop: '0.1rem' }}>
                          {sampleList}
                        </span>
                      </div>
                    ) : (
                      <div style={{ margin: '0.75rem 0', fontSize: '0.75rem', color: '#9CA3AF', fontStyle: 'italic' }}>
                        No published service gigs yet.
                      </div>
                    )}

                    <div className="marketplace-card-meta" style={{ marginTop: 'auto' }}>
                      <span>{business.city || 'Local'}</span>
                      {business.service_area ? <span>{business.service_area}</span> : null}
                    </div>

                    <div className="marketplace-card-actions" style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
                      <Link to={`/business/${business.slug}`} className="btn-secondary marketplace-btn" style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', textAlign: 'center' }}>
                        View profile
                      </Link>
                      <Link to="/services" className="btn-primary marketplace-btn" style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', textAlign: 'center' }}>
                        Browse services
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
