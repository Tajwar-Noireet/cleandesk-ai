import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { api } from '../services/api';
import { supabase } from '../supabaseClient';
import { ArrowRightIcon, CheckIcon } from '../components/Icons';

const initialForm = {
  service_type: '',
  customer_name: '',
  customer_email: '',
  customer_phone: '',
  address: '',
  preferred_date: '',
  notes: ''
};

const isSupabaseConfigured = () =>
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_URL !== 'https://your-project.supabase.co';

const BusinessBooking = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedService = searchParams.get('service') || '';
  const selectedServiceId = searchParams.get('serviceId') || '';

  useEffect(() => {
    if (!slug || !selectedServiceId) {
      alert('Error: Missing business slug or service ID. Returning to services marketplace.');
      navigate('/services', { replace: true });
    }
  }, [slug, selectedServiceId, navigate]);

  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({ ...initialForm, service_type: selectedService, service_id: selectedServiceId });
  const [authSession, setAuthSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    let active = true;

    const loadBookingContext = async () => {
      try {
        setLoading(true);
        setError('');
        const [businessData, serviceData] = await Promise.all([
          api.getPublicBusiness(slug),
          api.getPublicBusinessServices(slug)
        ]);

        if (!active) return;
        setBusiness(businessData);
        setServices(serviceData || []);
      } catch (err) {
        if (active) setError(err.message || 'This business could not be loaded.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadBookingContext();
    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    const loadSession = async () => {
      if (isSupabaseConfigured()) {
        const { data: { session } } = await supabase.auth.getSession();
        setAuthSession(session);
        if (session?.user?.email) {
          setForm((current) => ({ ...current, customer_email: session.user.email }));
        }
        return;
      }

      if (typeof localStorage !== 'undefined' && localStorage.getItem('sb-access-token') === 'mock-customer-token') {
        const mockSession = { user: { email: 'sarah@jenkins.com' } };
        setAuthSession(mockSession);
        setForm((current) => ({ ...current, customer_email: mockSession.user.email }));
      }
    };

    loadSession();
  }, []);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      service_type: selectedService || current.service_type,
      service_id: selectedServiceId || current.service_id
    }));
  }, [selectedService, selectedServiceId]);

  useEffect(() => {
    if (!form.service_type || services.length === 0) return;
    const matched = services.find(
      s => s.name?.toLowerCase().trim() === form.service_type?.toLowerCase().trim()
    );
    if (matched) {
      if (form.service_id !== matched.id) {
        setForm(current => ({ ...current, service_id: matched.id }));
      }
    } else {
      if (form.service_id) {
        setForm(current => ({ ...current, service_id: '' }));
      }
    }
  }, [form.service_type, services]);

  const serviceOptions = useMemo(() => {
    const names = services.map((service) => service.name).filter(Boolean);
    return selectedService && !names.includes(selectedService) ? [selectedService, ...names] : names;
  }, [services, selectedService]);

  const validate = () => {
    const nextErrors = {};
    if (!form.service_type.trim()) nextErrors.service_type = 'Choose or enter a service.';
    if (!form.customer_name.trim()) nextErrors.customer_name = 'Enter your full name.';
    if (!form.customer_email.trim() || !form.customer_email.includes('@')) {
      nextErrors.customer_email = 'Enter a valid email address.';
    }
    if (!form.address.trim()) nextErrors.address = 'Enter the service address.';
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!validate()) return;

    if (!slug || !(form.service_id || selectedServiceId)) {
      setError('Business slug or service gig ID is missing. Cannot submit.');
      return;
    }

    try {
      setSubmitting(true);
      const result = await api.customerCreateEnquiry({
        business_slug: slug,
        service_id: form.service_id || selectedServiceId,
        service_type: form.service_type || selectedService,
        customer_name: form.customer_name,
        customer_email: form.customer_email,
        customer_phone: form.customer_phone,
        address: form.address,
        preferred_date: form.preferred_date,
        notes: form.notes
      });

      if (result.authenticated || authSession) {
        navigate('/customer/dashboard');
        return;
      }

      const params = new URLSearchParams({
        email: form.customer_email,
        service: form.service_type,
        business: business?.name || result.business_name || 'Selected business'
      });
      if (business?.slug || result.business_slug) {
        params.set('business_slug', business?.slug || result.business_slug);
      }
      navigate(`/booking-confirmation?${params.toString()}`);
    } catch (err) {
      setError(err.message || 'Could not send this enquiry. Please check the details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="marketplace-shell">
        <Navbar />
        <div className="marketplace-page marketplace-container">
          <div className="marketplace-loading">Loading booking form...</div>
        </div>
      </div>
    );
  }

  if (error && !business) {
    return (
      <div className="marketplace-shell">
        <Navbar />
        <div className="marketplace-page marketplace-container">
          <div className="marketplace-empty-state">
            <h1>Business not found</h1>
            <p>{error}</p>
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
        <section className="marketplace-container booking-layout">
          <aside className="booking-context-panel">
            <Link to={`/business/${slug}`} className="marketplace-back-link">Back to business profile</Link>
            <span className="marketplace-eyebrow">Request service</span>
            <h1>{business?.name}</h1>
            <p>{business?.public_description || business?.description || 'Send your request to this CleanDesk business.'}</p>
            <div className="booking-context-list">
              <div>
                <span>Category</span>
                <strong>{business?.category || 'Service business'}</strong>
              </div>
              <div>
                <span>Service area</span>
                <strong>{business?.service_area || business?.city || 'Available by enquiry'}</strong>
              </div>
              <div>
                <span>Opening hours</span>
                <strong>{business?.opening_hours || 'Contact business for availability'}</strong>
              </div>
            </div>
            <div className="booking-trust-note">
              <CheckIcon size={15} />
              <span>Your enquiry is sent to this selected business and can be tracked from a customer login.</span>
            </div>

            <div className="booking-context-list" style={{ marginTop: '1.5rem', borderTop: '1px solid #E2E8F0', paddingTop: '1rem' }}>
              <span className="marketplace-eyebrow" style={{ color: '#E11D48' }}>⚡ Gig Booking Payload Trace</span>
              <div style={{ fontSize: '0.85rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div><strong>Business Name:</strong> {business?.name || 'Loading...'}</div>
                <div><strong>Business Slug:</strong> {slug}</div>
                <div><strong>Service Name:</strong> {form.service_type || 'N/A'}</div>
                <div><strong>Service ID:</strong> {form.service_id || 'N/A'}</div>
              </div>
            </div>
          </aside>

          <section className="booking-form-card">
            <div className="marketplace-section-heading compact">
              <span className="marketplace-eyebrow">Booking details</span>
              <h2>Tell {business?.name} what you need</h2>
              <p>No payment is taken here. The business will review your request and follow up.</p>
            </div>

            <form className="marketplace-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="service_type">Service type</label>
                <input
                  id="service_type"
                  className="form-input"
                  name="service_type"
                  value={form.service_type}
                  onChange={handleChange}
                  placeholder="Choose or enter a service"
                  list="business-services"
                  required
                />
                <datalist id="business-services">
                  {serviceOptions.map((name) => (
                    <option value={name} key={name} />
                  ))}
                </datalist>
                {fieldErrors.service_type ? <p className="form-field-error">{fieldErrors.service_type}</p> : null}
              </div>

              <div className="marketplace-form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="customer_name">Full name</label>
                  <input
                    id="customer_name"
                    className="form-input"
                    name="customer_name"
                    value={form.customer_name}
                    onChange={handleChange}
                    placeholder="Jane Smith"
                    required
                  />
                  {fieldErrors.customer_name ? <p className="form-field-error">{fieldErrors.customer_name}</p> : null}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="customer_email">Email address</label>
                  <input
                    id="customer_email"
                    className="form-input"
                    name="customer_email"
                    type="email"
                    value={form.customer_email}
                    onChange={handleChange}
                    placeholder="jane@email.com"
                    readOnly={Boolean(authSession?.user?.email)}
                    required
                  />
                  {fieldErrors.customer_email ? <p className="form-field-error">{fieldErrors.customer_email}</p> : null}
                </div>
              </div>

              <div className="marketplace-form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="customer_phone">Phone number</label>
                  <input
                    id="customer_phone"
                    className="form-input"
                    name="customer_phone"
                    value={form.customer_phone}
                    onChange={handleChange}
                    placeholder="+44 7700 900000"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="preferred_date">Preferred date</label>
                  <input
                    id="preferred_date"
                    className="form-input"
                    name="preferred_date"
                    type="date"
                    value={form.preferred_date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="address">Address</label>
                <input
                  id="address"
                  className="form-input"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Service address"
                  required
                />
                {fieldErrors.address ? <p className="form-field-error">{fieldErrors.address}</p> : null}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  className="form-input"
                  name="notes"
                  rows="4"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Add access notes, scope, timing, or anything the business should know."
                />
              </div>

              {error ? <div className="marketplace-error">{error}</div> : null}

              <div className="booking-form-actions">
                <Link to={`/business/${slug}`} className="btn-secondary marketplace-btn">Cancel</Link>
                <button type="submit" className="btn-primary marketplace-btn" disabled={submitting}>
                  {submitting ? 'Sending request...' : <>Send enquiry <ArrowRightIcon size={14} /></>}
                </button>
              </div>
            </form>
          </section>
        </section>
      </main>
    </div>
  );
};

export default BusinessBooking;
