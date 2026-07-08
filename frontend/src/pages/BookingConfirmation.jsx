import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import Navbar from '../components/Navbar';
import { CheckIcon, CalendarIcon, ArrowRightIcon, UserIcon } from '../components/Icons';
import { fadeUp, staggerContainer } from '../utils/motionPresets';

const BookingConfirmation = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const service = searchParams.get('service') || 'Cleaning service';

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '6rem 2rem 4rem' }}>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
        >
          {/* Success Icon */}
          <motion.div
            variants={fadeUp}
            style={{ display: 'flex', justifyContent: 'center' }}
          >
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#F0FDF4',
              border: '1px solid #BBF7D0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckIcon size={24} style={{ color: '#16A34A' }} />
            </div>
          </motion.div>

          {/* Main content card */}
          <motion.div variants={fadeUp} className="glass-auth-card" style={{ padding: '2rem', textAlign: 'center' }}>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#0A0A0A',
              margin: '0 0 0.75rem',
              letterSpacing: '-0.02em'
            }}>
              Your cleaning request has been sent
            </h1>
            <p style={{ color: '#6B7280', fontSize: '0.875rem', lineHeight: '1.6', margin: '0 0 1.5rem' }}>
              We've received your request for <strong style={{ color: '#0A0A0A' }}>{service}</strong>.
              Our team will confirm availability and pricing within 2 hours during business hours.
            </p>

            {/* Details block */}
            <div style={{
              background: '#F9F9FA',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              padding: '1rem 1.25rem',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                <span style={{ color: '#6B7280' }}>Service requested</span>
                <strong style={{ color: '#0A0A0A' }}>{service}</strong>
              </div>
              {email && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                  <span style={{ color: '#6B7280' }}>Confirmation will be sent to</span>
                  <strong style={{ color: '#0A0A0A' }}>{email}</strong>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                <span style={{ color: '#6B7280' }}>Status</span>
                <span style={{
                  background: '#FEF9C3',
                  color: '#92400E',
                  borderRadius: '4px',
                  padding: '0.15rem 0.5rem',
                  fontSize: '0.7rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>Pending Review</span>
              </div>
            </div>

            {/* Next step explanation */}
            <div style={{ textAlign: 'left', marginBottom: '1.75rem' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: '600', color: '#0A0A0A', margin: '0 0 0.6rem' }}>
                What happens next
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  'Our team reviews your request and confirms availability.',
                  'You receive a confirmation message at your email address.',
                  'On the day of your clean, the assigned cleaner will contact you.'
                ].map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', fontSize: '0.8rem', color: '#374151' }}>
                    <span style={{
                      minWidth: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: '#0A0A0A',
                      color: '#FFFFFF',
                      fontSize: '0.65rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      marginTop: '1px',
                      flexShrink: 0
                    }}>{i + 1}</span>
                    <span style={{ lineHeight: '1.4' }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link
                to={`/customer/login${email ? `?email=${encodeURIComponent(email)}` : ''}`}
                className="btn-primary"
                style={{ textDecoration: 'none', textAlign: 'center', display: 'block', width: '100%', boxSizing: 'border-box' }}
              >
                Create a customer login to track this request
              </Link>
              <Link
                to="/"
                style={{
                  fontSize: '0.8rem',
                  color: '#6B7280',
                  textDecoration: 'none',
                  textAlign: 'center',
                  display: 'block'
                }}
              >
                ← Back to services
              </Link>
            </div>
          </motion.div>

          {/* Reassurance strip */}
          <motion.div
            variants={fadeUp}
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1.5rem',
              flexWrap: 'wrap'
            }}
          >
            {[
              { icon: <CheckIcon size={13} />, text: 'No payment now' },
              { icon: <CalendarIcon size={13} />, text: 'Free rescheduling 24h in advance' },
              { icon: <UserIcon size={13} />, text: 'Vetted cleaning professionals' }
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#9CA3AF' }}>
                {item.icon}
                {item.text}
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
