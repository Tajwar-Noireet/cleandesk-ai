import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { CheckIcon, ArrowRightIcon } from '../components/Icons';

const BookingConfirmation = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const service = searchParams.get('service') || 'Requested service';
  const business = searchParams.get('business') || 'Selected business';
  const businessSlug = searchParams.get('business_slug') || '';
  const loginTarget = `/customer/login${email ? `?email=${encodeURIComponent(email)}` : ''}`;

  return (
    <div className="marketplace-shell">
      <Navbar />
      <main className="marketplace-page">
        <section className="marketplace-container confirmation-layout">
          <div className="confirmation-card">
            <div className="confirmation-icon">
              <CheckIcon size={24} />
            </div>

            <span className="marketplace-eyebrow">Request sent</span>
            <h1>Your enquiry has been sent</h1>
            <p>
              CleanDesk sent your request to <strong>{business}</strong>. The business can now review your details
              and follow up with availability, pricing, or next steps.
            </p>

            <div className="confirmation-details">
              <div>
                <span>Business</span>
                <strong>{business}</strong>
              </div>
              <div>
                <span>Service</span>
                <strong>{service}</strong>
              </div>
              <div>
                <span>Customer email</span>
                <strong>{email || 'Not provided'}</strong>
              </div>
              <div>
                <span>Status</span>
                <strong>Pending review</strong>
              </div>
            </div>

            <div className="confirmation-next">
              <h2>What happens next</h2>
              <div>
                <CheckIcon size={14} />
                <span>The selected business reviews your enquiry.</span>
              </div>
              <div>
                <CheckIcon size={14} />
                <span>Log in with {email || 'the same email'} so this request appears in your customer dashboard.</span>
              </div>
              <div>
                <CheckIcon size={14} />
                <span>Your customer dashboard groups activity across businesses.</span>
              </div>
            </div>

            <div className="confirmation-actions">
              <Link to={loginTarget} className="btn-primary marketplace-btn">
                Create customer login with same email <ArrowRightIcon size={14} />
              </Link>
              <Link to="/businesses" className="btn-secondary marketplace-btn">
                Browse more businesses
              </Link>
            </div>

            {businessSlug ? (
              <Link to={`/business/${businessSlug}`} className="marketplace-card-link confirmation-profile-link">
                Return to {business}
              </Link>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
};

export default BookingConfirmation;
