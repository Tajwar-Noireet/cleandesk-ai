import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import CustomerLayout from '../components/CustomerLayout';
import { api } from '../services/api';
import { CalendarIcon, InboxIcon } from '../components/Icons';
import { fadeUp, staggerContainer } from '../utils/motionPresets';

const CustomerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);
        const res = await api.customerGetBookings();
        setBookings(res);
      } catch (err) {
        console.error('Failed to load bookings:', err);
      } finally {
        setLoading(false);
      }
    };
    loadBookings();
  }, []);

  if (loading) {
    return (
      <CustomerLayout>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0', color: '#6B7280', fontSize: '0.9rem' }}>
          Loading your bookings...
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
      >
        <motion.div variants={fadeUp} style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0, color: '#0A0A0A' }}>
            My Booking History
          </h1>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#6B7280' }}>
            View all confirmed bookings, pending quotes, and historical job requests.
          </p>
        </motion.div>

        {bookings.length === 0 ? (
          <motion.div variants={fadeUp} className="glass-auth-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <CalendarIcon size={32} style={{ color: '#D1D5DB', marginBottom: '1rem' }} />
            <h3 style={{ margin: '0 0 0.5rem', color: '#0A0A0A', fontSize: '1.1rem', fontWeight: '600' }}>No booking records yet</h3>
            <p style={{ color: '#6B7280', fontSize: '0.85rem', margin: '0 0 1.75rem', lineHeight: '1.5', maxWidth: '360px', marginLeft: 'auto', marginRight: 'auto' }}>
              No confirmed or pending cleaning jobs are linked to your account. Get started by requesting a clean.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a
                href="/book"
                className="btn-primary"
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <CalendarIcon size={14} /> Book a cleaning service
              </a>
              <a href="/" className="btn-secondary" style={{ textDecoration: 'none', fontSize: '0.85rem' }}>
                Browse services
              </a>
            </div>
          </motion.div>
        ) : (
          <motion.div variants={fadeUp} className="glass-auth-card" style={{ overflow: 'hidden', padding: 0 }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: '#FFFFFF' }}>
                    <th style={{ padding: '1rem', color: '#6B7280', fontWeight: '600' }}>Service Type</th>
                    <th style={{ padding: '1rem', color: '#6B7280', fontWeight: '600' }}>Target Date</th>
                    <th style={{ padding: '1rem', color: '#6B7280', fontWeight: '600' }}>Address</th>
                    <th style={{ padding: '1rem', color: '#6B7280', fontWeight: '600' }}>Status</th>
                    <th style={{ padding: '1rem', color: '#6B7280', fontWeight: '600' }}>Logged At</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(booking => (
                    <tr 
                      key={booking.id} 
                      style={{ 
                        borderBottom: '1px solid var(--color-border)', 
                        backgroundColor: '#FFFFFF',
                        transition: 'background-color 0.15s ease'
                      }}
                      className="table-row-hover"
                    >
                      <td style={{ padding: '1rem', fontWeight: '600', color: '#0A0A0A' }}>
                        {booking.service_type || 'General Clean'}
                      </td>
                      <td style={{ padding: '1rem', color: '#0A0A0A' }}>
                        {booking.preferred_date || 'Unscheduled'}
                      </td>
                      <td style={{ padding: '1rem', color: '#0A0A0A', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {booking.address || 'Not provided'}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span className={`pill status-${booking.status}`} style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', textTransform: 'uppercase' }}>
                          {booking.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: '#6B7280' }}>
                        {new Date(booking.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </motion.div>
    </CustomerLayout>
  );
};

export default CustomerBookings;
