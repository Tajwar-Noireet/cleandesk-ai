import React, { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ArrowRightIcon } from '../components/Icons';

const toSlug = (value) =>
  (value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const CustomerBooking = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const businessContext =
      searchParams.get('business_slug') ||
      searchParams.get('slug') ||
      searchParams.get('business');
    const slug = toSlug(businessContext);
    const service = searchParams.get('service');

    if (slug) {
      const params = new URLSearchParams();
      if (service) params.set('service', service);
      navigate(`/business/${slug}/book${params.toString() ? `?${params.toString()}` : ''}`, { replace: true });
      return;
    }

    navigate('/businesses', { replace: true });
  }, [navigate, searchParams]);

  return (
    <div className="marketplace-shell">
      <Navbar />
      <main className="marketplace-page marketplace-container">
        <div className="marketplace-empty-state">
          <h1>Choose a business first</h1>
          <p>The marketplace booking flow starts from a public business profile so your request reaches the right team.</p>
          <Link to="/businesses" className="btn-primary marketplace-btn">
            Browse businesses <ArrowRightIcon size={14} />
          </Link>
        </div>
      </main>
    </div>
  );
};

export default CustomerBooking;
