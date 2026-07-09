import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { api } from '../services/api';
import { ArrowRightIcon } from '../components/Icons';

const ServicesMarketplace = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const isMockActive = !api.isSupabaseConfigured();

  useEffect(() => {
    let active = true;

    const loadServices = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await api.getPublicServices();
        if (active) setServices(data || []);
      } catch (err) {
        if (active) setError(err.message || 'Unable to load services.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadServices();
    return () => {
      active = false;
    };
  }, []);

  // Compute unique categories and locations
  const categories = useMemo(() => {
    const set = new Set();
    services.forEach((s) => {
      if (s.category) set.add(s.category.trim());
    });
    return [...set].sort();
  }, [services]);

  const cities = useMemo(() => {
    const set = new Set();
    services.forEach((s) => {
      const cityVal = s.business_city || s.city || s.service_area;
      if (cityVal) set.add(cityVal.trim());
    });
    return [...set].sort();
  }, [services]);

  const filteredServices = useMemo(() => {
    let results = services;

    if (selectedCategory) {
      results = results.filter((s) => s.category === selectedCategory);
    }

    if (selectedCity) {
      results = results.filter(
        (s) => (s.business_city || s.city || s.service_area || '').trim() === selectedCity.trim()
      );
    }

    if (searchQuery.trim()) {
      const queryLower = searchQuery.toLowerCase().trim();
      results = results.filter(
        (s) =>
          s.service_name.toLowerCase().includes(queryLower) ||
          (s.short_description || '').toLowerCase().includes(queryLower) ||
          (s.description || '').toLowerCase().includes(queryLower) ||
          s.business_name.toLowerCase().includes(queryLower)
      );
    }

    return results;
  }, [services, searchQuery, selectedCategory, selectedCity]);

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
              <span className="marketplace-eyebrow">Discover Gigs</span>
              <h1 style={{ fontSize: '2.4rem', fontWeight: '700', letterSpacing: '-0.02em', margin: '0.5rem 0' }}>
                Service Gigs Directory
              </h1>
              <p style={{ color: 'var(--color-gray-600)' }}>Browse public service listings and submit appointment enquiries instantly.</p>
              <div style={{ marginTop: '0.5rem' }}>
                <Link to="/businesses" className="marketplace-card-link" style={{ fontSize: '0.8rem', color: 'var(--color-accent)' }}>
                  Or browse business storefronts <ArrowRightIcon size={12} />
                </Link>
              </div>
            </div>
          </div>

          {/* Premium Filter Controls */}
          <div className="premium-marketplace-filter">
            <input
              type="text"
              className="premium-filter-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services or business..."
              style={{ flex: '1 1 240px' }}
            />

            <select
              aria-label="Filter by Category"
              className="premium-filter-input"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              aria-label="Filter by Location"
              className="premium-filter-input"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              <option value="">All Locations</option>
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            {(searchQuery || selectedCategory || selectedCity) && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('');
                  setSelectedCity('');
                }}
                style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', borderRadius: '4px' }}
              >
                Clear Filters
              </button>
            )}
          </div>

          {loading && <div className="marketplace-loading">Loading service listings...</div>}
          {error && <div className="marketplace-error">{error}</div>}

          {!loading && !error && filteredServices.length === 0 && (
            <div className="marketplace-empty-state" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
              <h3>No services found</h3>
              <p>No gigs match your active filters. Try clearing filters or search terms.</p>
              {(searchQuery || selectedCategory || selectedCity) && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('');
                    setSelectedCity('');
                  }}
                  style={{ marginTop: '1rem' }}
                >
                  Reset filters
                </button>
              )}
            </div>
          )}

          {!loading && !error && filteredServices.length > 0 && (
            <div className="marketplace-business-grid">
              {filteredServices.map((gig) => (
                <article className="marketplace-business-card" key={gig.service_id || gig.id}>
                  <div className="marketplace-card-topline">
                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-gray-600)', fontWeight: '600' }}>
                      {gig.category || 'Service Gig'}
                    </span>
                    {gig.rating ? <strong style={{ fontSize: '0.85rem' }}>{Number(gig.rating).toFixed(1)}</strong> : null}
                  </div>
                  
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: '0.5rem 0 0.15rem 0', color: 'var(--color-gray-900)' }}>
                    {gig.service_name}
                  </h2>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-gray-600)', display: 'block', marginBottom: '0.75rem' }}>
                    by {gig.business_name}
                  </span>

                  {import.meta.env.DEV && (
                    <div style={{ fontSize: '0.65rem', color: 'var(--color-gray-400)', fontFamily: 'monospace', marginBottom: '0.75rem' }}>
                      [Dev] Slug: {gig.business_slug} | ID: {gig.service_id || gig.id}
                    </div>
                  )}

                  <p style={{ fontSize: '0.85rem', color: 'var(--color-gray-600)', marginBottom: '1.5rem', lineHeight: '1.45' }}>
                    {gig.short_description || gig.description || 'Public service listing on CleanDesk.'}
                  </p>

                  <div className="marketplace-card-meta" style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--color-gray-600)' }}>
                      <span>{gig.business_city || gig.city || gig.service_area || 'Local'}</span>
                      {gig.duration_estimate ? <span>• {gig.duration_estimate}</span> : null}
                    </div>
                    {gig.base_price ? (
                      <span style={{ fontWeight: '600', fontSize: '1rem', color: 'var(--color-gray-900)' }}>
                        ${gig.base_price}
                      </span>
                    ) : null}
                  </div>

                  <div className="marketplace-card-actions" style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <Link to={`/business/${gig.business_slug}`} className="btn-secondary marketplace-btn" style={{ flex: 1, padding: '0.45rem', fontSize: '0.75rem', textAlign: 'center', borderRadius: '4px' }}>
                      View Storefront
                    </Link>
                    <Link
                      to={`/business/${gig.business_slug}/book?service=${encodeURIComponent(gig.service_name)}&serviceId=${gig.service_id || gig.id}`}
                      className="btn-primary marketplace-btn"
                      style={{ flex: 1, padding: '0.45rem', fontSize: '0.75rem', textAlign: 'center', borderRadius: '4px' }}
                    >
                      Request Gig
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ServicesMarketplace;
