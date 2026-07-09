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

  // Compute unique cities and categories for filter dropdowns
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
      if (s.business_city) set.add(s.business_city.trim());
      else if (s.service_area) set.add(s.service_area.trim());
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
        (s) => s.business_city === selectedCity || s.service_area === selectedCity
      );
    }

    if (searchQuery.trim()) {
      const queryLower = searchQuery.toLowerCase().trim();
      results = results.filter(
        (s) =>
          s.service_name.toLowerCase().includes(queryLower) ||
          s.short_description.toLowerCase().includes(queryLower) ||
          s.description.toLowerCase().includes(queryLower) ||
          s.business_name.toLowerCase().includes(queryLower)
      );
    }

    return results;
  }, [services, searchQuery, selectedCategory, selectedCity]);

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
              <span className="marketplace-eyebrow">Discover Gigs</span>
              <h1>Find service gigs from local business owners</h1>
              <p>Search and request specific services published by trusted providers across the marketplace.</p>
              <div style={{ marginTop: '0.75rem' }}>
                <Link to="/businesses" className="marketplace-card-link" style={{ fontSize: '0.85rem' }}>
                  Or search business storefronts <ArrowRightIcon size={12} />
                </Link>
              </div>
            </div>

            <div className="marketplace-search-box" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: '420px' }}>
              <div>
                <label htmlFor="gig-search" className="form-label" style={{ display: 'none' }}>Search gigs</label>
                <input
                  id="gig-search"
                  className="form-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search gigs or business name..."
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select
                  id="category-select"
                  aria-label="Filter by Category"
                  className="form-input"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{ flex: 1, padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <select
                  id="city-select"
                  aria-label="Filter by Location"
                  className="form-input"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  style={{ flex: 1, padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
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
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {loading && <div className="marketplace-loading">Loading service gigs...</div>}
          {error && <div className="marketplace-error">{error}</div>}

          {!loading && !error && filteredServices.length === 0 && (
            <div className="marketplace-empty-state">
              <h2>No marketplace listings yet.</h2>
              <p>Business owners can publish their first service from the owner dashboard.</p>
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
                  Clear search filters
                </button>
              )}
            </div>
          )}

          {!loading && !error && filteredServices.length > 0 && (
            <div className="marketplace-business-grid">
              {filteredServices.map((gig) => (
                <article className="marketplace-business-card" key={gig.service_id}>
                  <div className="marketplace-card-topline">
                    <span>{gig.category || 'Service Gig'}</span>
                    {gig.rating ? <strong>{Number(gig.rating).toFixed(1)}</strong> : null}
                  </div>
                  <h2>{gig.service_name}</h2>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-primary)', display: 'block', margin: '0.2rem 0 0.5rem 0' }}>
                    by {gig.business_name}
                  </span>
                  <div style={{ fontSize: '0.65rem', color: '#9CA3AF', marginBottom: '0.5rem', fontFamily: 'monospace' }}>
                    [Dev] Slug: {gig.business_slug} | ID: {gig.service_id}
                  </div>
                  <p>{gig.short_description || gig.description || 'Service gig available on CleanDesk.'}</p>

                  <div className="marketplace-card-meta" style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                    <span>{gig.business_city || 'Local'}</span>
                    {gig.duration_estimate ? <span>{gig.duration_estimate}</span> : null}
                    {gig.base_price ? (
                      <span style={{ fontWeight: 'bold', color: '#10B981' }}>
                        {gig.base_price} {gig.price_unit || ''}
                      </span>
                    ) : null}
                  </div>

                  <div className="marketplace-card-actions" style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
                    <Link to={`/business/${gig.business_slug}`} className="btn-secondary marketplace-btn" style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', textAlign: 'center' }}>
                      View business
                    </Link>
                    <Link
                      to={`/business/${gig.business_slug}/book?service=${encodeURIComponent(gig.service_name)}&serviceId=${gig.service_id}`}
                      className="btn-primary marketplace-btn"
                      style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', textAlign: 'center' }}
                    >
                      Request gig
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
