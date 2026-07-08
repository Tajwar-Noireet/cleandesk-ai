import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import Navbar from '../components/Navbar';
import { api } from '../services/api';
import { supabase } from '../supabaseClient';
import {
  CalendarIcon,
  UserIcon,
  CheckIcon,
  ArrowRightIcon
} from '../components/Icons';
import { fadeUp, staggerContainer } from '../utils/motionPresets';

const SERVICES = [
  { id: 'regular', label: 'Regular home cleaning', price: '£40', duration: '2 hours' },
  { id: 'deep', label: 'Deep cleaning', price: '£90', duration: '4 hours' },
  { id: 'move-out', label: 'Move-out cleaning', price: '£120', duration: '5 hours' },
  { id: 'office', label: 'Office cleaning', price: 'Custom quote', duration: 'Variable' },
  { id: 'carpet', label: 'Carpet cleaning', price: '£35/room', duration: '1.5 hours' },
];

const CustomerBooking = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedService = searchParams.get('service') || '';

  const [form, setForm] = useState({
    service_type: preSelectedService,
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    address: '',
    preferred_date: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [authSession, setAuthSession] = useState(null);

  useEffect(() => {
    const isSupabaseConfigured =
      import.meta.env.VITE_SUPABASE_URL &&
      import.meta.env.VITE_SUPABASE_URL !== 'https://your-project.supabase.co';

    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setAuthSession(session);
        if (session?.user?.email) {
          setForm(f => ({ ...f, customer_email: session.user.email }));
        }
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.service_type) {
      setError('Please select a cleaning service.');
      return;
    }

    try {
      setSubmitting(true);
      const result = await api.customerCreateEnquiry(form);

      if (result.authenticated || authSession) {
        // Authenticated customer: go to dashboard
        navigate('/customer/dashboard');
      } else {
        // Unauthenticated: go to booking confirmation
        navigate(`/booking-confirmation?email=${encodeURIComponent(form.customer_email)}&service=${encodeURIComponent(form.service_type)}`);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '5rem 2rem 4rem' }}>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
        >
          {/* Header */}
          <motion.div variants={fadeUp}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#6B7280'
            }}>
              SparkleHome Cleaning
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#0A0A0A', margin: '0.5rem 0 0.5rem', letterSpacing: '-0.02em' }}>
              Request a cleaning service
            </h1>
            <p style={{ color: '#6B7280', fontSize: '0.9rem', margin: 0, lineHeight: '1.5' }}>
              Fill in the form below and we'll confirm your booking. No account needed.
            </p>
          </motion.div>

          {/* Form Card */}
          <motion.div variants={fadeUp} className="glass-auth-card" style={{ padding: '2rem' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Service Selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#0A0A0A' }}>
                  Cleaning service <span style={{ color: '#E53E3E' }}>*</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                  {SERVICES.map(svc => (
                    <button
                      key={svc.id}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, service_type: svc.label }))}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: form.service_type === svc.label ? '#0A0A0A' : 'var(--color-border)',
                        background: form.service_type === svc.label ? '#0A0A0A' : '#FFFFFF',
                        color: form.service_type === svc.label ? '#FFFFFF' : '#374151',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.15rem'
                      }}
                    >
                      <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>{svc.label}</span>
                      <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>{svc.price} · {svc.duration}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div style={{ borderTop: '1px solid var(--color-border)' }} />

              {/* Name + Email */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#0A0A0A' }}>
                    Full name <span style={{ color: '#E53E3E' }}>*</span>
                  </label>
                  <input
                    className="form-input"
                    name="customer_name"
                    value={form.customer_name}
                    onChange={handleChange}
                    placeholder="Jane Smith"
                    required
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#0A0A0A' }}>
                    Email address <span style={{ color: '#E53E3E' }}>*</span>
                  </label>
                  <input
                    className="form-input"
                    name="customer_email"
                    type="email"
                    value={form.customer_email}
                    onChange={handleChange}
                    placeholder="jane@email.com"
                    required
                    readOnly={!!authSession?.user?.email}
                    style={authSession?.user?.email ? { background: '#F9F9FA', color: '#6B7280' } : {}}
                  />
                </div>
              </div>

              {/* Phone + Address */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#0A0A0A' }}>
                    Phone number
                  </label>
                  <input
                    className="form-input"
                    name="customer_phone"
                    value={form.customer_phone}
                    onChange={handleChange}
                    placeholder="+44 7700 900000"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#0A0A0A' }}>
                    Preferred date
                  </label>
                  <input
                    className="form-input"
                    name="preferred_date"
                    type="date"
                    value={form.preferred_date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {/* Address */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#0A0A0A' }}>
                  Property address <span style={{ color: '#E53E3E' }}>*</span>
                </label>
                <input
                  className="form-input"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="12 Wembley Park Drive, London, HA9 8DA"
                  required
                />
              </div>

              {/* Notes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#0A0A0A' }}>
                  Additional notes
                </label>
                <textarea
                  className="form-input"
                  name="notes"
                  rows="3"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="E.g., 3-bedroom flat, please bring eco-friendly products..."
                  style={{ resize: 'vertical', minHeight: '72px' }}
                />
              </div>

              {error && (
                <p style={{ fontSize: '0.8rem', color: '#DC2626', margin: 0 }}>
                  {error}
                </p>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem' }}>
                <Link to="/" style={{ fontSize: '0.8rem', color: '#6B7280', textDecoration: 'none' }}>
                  ← Back to services
                </Link>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  {submitting ? 'Sending request...' : (
                    <>Send cleaning request <ArrowRightIcon size={14} /></>
                  )}
                </button>
              </div>

            </form>
          </motion.div>

          {/* Trust note */}
          <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9CA3AF', fontSize: '0.75rem' }}>
            <CheckIcon size={13} />
            <span>No payment required. Our team will confirm availability and pricing within 2 hours.</span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default CustomerBooking;
