import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CustomerLayout from '../components/CustomerLayout';
import { api } from '../services/api';
import { ArrowRightIcon, CalendarIcon } from '../components/Icons';

const formatDate = (value) => {
  if (!value) return 'Not set';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const statusLabel = (status) => {
  const labels = {
    new: 'New request',
    contacted: 'Contacted',
    booked: 'Booked',
    lost: 'Closed'
  };
  return labels[status || 'new'] || status;
};

const CustomerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);
        const response = await api.customerGetBookings();
        setBookings(response || []);
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
        <div className="customer-loading">Loading your bookings...</div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="customer-portal-page">
        <header className="customer-page-header">
          <div>
            <span className="customer-eyebrow">Customer bookings</span>
            <h1>Enquiries and bookings</h1>
            <p>Every request you submit across CleanDesk businesses appears here.</p>
          </div>
        </header>

        {bookings.length === 0 ? (
          <section className="customer-empty-state">
            <CalendarIcon size={30} />
            <h2>No requests yet</h2>
            <p>Browse trusted businesses and submit an enquiry. Your bookings will appear here.</p>
            <Link to="/businesses" className="btn-primary marketplace-btn">
              Browse businesses <ArrowRightIcon size={14} />
            </Link>
          </section>
        ) : (
          <section className="customer-booking-grid">
            {bookings.map((booking) => (
              <article className="customer-booking-card" key={booking.id}>
                <div className="customer-booking-card-header">
                  <div>
                    <span>{booking.category || 'Service business'}</span>
                    <h2>{booking.business_name || 'Service business'}</h2>
                  </div>
                  <span className={`customer-status-pill status-${booking.status || 'new'}`}>
                    {statusLabel(booking.status)}
                  </span>
                </div>

                <dl className="customer-booking-details">
                  <div>
                    <dt>Service</dt>
                    <dd>{booking.service_type || 'General service request'}</dd>
                  </div>
                  <div>
                    <dt>Address</dt>
                    <dd>{booking.address || 'Not provided'}</dd>
                  </div>
                  <div>
                    <dt>Preferred date</dt>
                    <dd>{booking.preferred_date || 'Not set'}</dd>
                  </div>
                  <div>
                    <dt>Created</dt>
                    <dd>{formatDate(booking.created_at)}</dd>
                  </div>
                  <div>
                    <dt>Updated</dt>
                    <dd>{formatDate(booking.last_updated || booking.updated_at || booking.created_at)}</dd>
                  </div>
                </dl>

                <div className="customer-card-actions">
                  {booking.business_slug ? (
                    <Link to={`/business/${booking.business_slug}`} className="btn-secondary marketplace-btn">
                      View business
                    </Link>
                  ) : null}
                  <Link to="/customer/conversations" className="btn-primary marketplace-btn">
                    Continue conversation
                  </Link>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </CustomerLayout>
  );
};

export default CustomerBookings;
