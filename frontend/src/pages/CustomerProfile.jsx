import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import CustomerLayout from '../components/CustomerLayout';
import { api } from '../services/api';
import { UserIcon } from '../components/Icons';
import { fadeUp, staggerContainer } from '../utils/motionPresets';

const CustomerProfile = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setLoading(true);
        const res = await api.customerGetDashboard();
        setEmail(res.user?.email || '');
        if (res.leads && res.leads.length > 0) {
          const mainLead = res.leads[0];
          setName(mainLead.customer_name || '');
          setPhone(mainLead.customer_phone || '');
          setAddress(mainLead.address || '');
        }
      } catch (err) {
        console.error('Failed to load profile data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProfileData();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setUpdating(true);

    try {
      await api.customerUpdateProfile({
        customer_name: name,
        customer_phone: phone,
        address
      });
      setSuccess('Profile updated successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Profile update failed:', err);
      setError('Failed to save profile updates.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <CustomerLayout>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0', color: '#6B7280', fontSize: '0.9rem' }}>
          Loading your profile...
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
        style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '600px', margin: '0 auto' }}
      >
        <motion.div variants={fadeUp} style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0, color: '#0A0A0A' }}>
            Customer Profile
          </h1>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#6B7280' }}>
            Manage your personal profile details. All booking logs will use these details.
          </p>
        </motion.div>

        <motion.form 
          variants={fadeUp} 
          onSubmit={handleUpdateProfile} 
          className="glass-auth-card" 
          style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
        >
          {success && (
            <div className="form-message-alert success" style={{ fontSize: '0.85rem' }}>
              ✓ {success}
            </div>
          )}

          {error && (
            <div className="login-error-alert" style={{ fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          {/* Email (Read Only) */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: '600' }}>Email Address (Read Only)</label>
            <input
              type="email"
              className="form-input"
              value={email}
              disabled
              style={{ backgroundColor: '#F1F1EF', cursor: 'not-allowed', color: '#6B7280' }}
            />
            <span style={{ fontSize: '0.7rem', color: '#6B7280', marginTop: '0.25rem', display: 'block' }}>
              Authentication emails are verified and cannot be changed.
            </span>
          </div>

          {/* Full Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="prof-name" style={{ fontWeight: '600' }}>Full Name</label>
            <input
              id="prof-name"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="E.g., Sarah Jenkins"
              required
              disabled={updating}
            />
          </div>

          {/* Contact Phone */}
          <div className="form-group">
            <label className="form-label" htmlFor="prof-phone" style={{ fontWeight: '600' }}>Contact Phone</label>
            <input
              id="prof-phone"
              type="tel"
              className="form-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="E.g., +44 7700 900077"
              required
              disabled={updating}
            />
          </div>

          {/* Default Cleaning Address */}
          <div className="form-group">
            <label className="form-label" htmlFor="prof-address" style={{ fontWeight: '600' }}>Default Address</label>
            <input
              id="prof-address"
              type="text"
              className="form-input"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="E.g., 12 Wembley Park Dr, London"
              required
              disabled={updating}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={updating}
            style={{ alignSelf: 'flex-start', marginTop: '0.5rem', padding: '0.5rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <UserIcon size={14} />
            {updating ? 'Saving Profile...' : 'Save Profile Changes'}
          </button>
        </motion.form>
      </motion.div>
    </CustomerLayout>
  );
};

export default CustomerProfile;
