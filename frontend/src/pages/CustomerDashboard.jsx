import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import CustomerLayout from '../components/CustomerLayout';
import { api } from '../services/api';
import { 
  CheckIcon, 
  InboxIcon, 
  AlertIcon, 
  ClockIcon, 
  CalendarIcon, 
  UserIcon, 
  StatusDotIcon,
  MessageIcon
} from '../components/Icons';
import { fadeUp, staggerContainer } from '../utils/motionPresets';

const CustomerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rescheduleNotes, setRescheduleNotes] = useState('');
  const [activeLeadId, setActiveLeadId] = useState(null);
  const [rescheduleSuccess, setRescheduleSuccess] = useState('');
  const [submittingReschedule, setSubmittingReschedule] = useState(false);

  // Missing details state
  const [addressVal, setAddressVal] = useState('');
  const [phoneVal, setPhoneVal] = useState('');
  const [nameVal, setNameVal] = useState('');
  const [updatingChecklist, setUpdatingChecklist] = useState(false);
  const [checklistSuccess, setChecklistSuccess] = useState('');

  const loadCustomerData = async () => {
    try {
      setLoading(true);
      const res = await api.customerGetDashboard();
      setData(res);
      if (res.leads && res.leads.length > 0) {
        const activeLead = res.leads[0];
        setActiveLeadId(activeLead.id);
        setAddressVal(activeLead.address || '');
        setPhoneVal(activeLead.customer_phone || '');
        setNameVal(activeLead.customer_name || '');
      }
    } catch (err) {
      console.error('Failed to load customer dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomerData();
  }, []);

  const handleRequestReschedule = async (e) => {
    e.preventDefault();
    if (!activeLeadId || rescheduleNotes.trim() === '') return;
    try {
      setSubmittingReschedule(true);
      await api.customerRequestReschedule(activeLeadId, rescheduleNotes);
      setRescheduleSuccess('Reschedule request sent to business operations.');
      setRescheduleNotes('');
      setTimeout(() => setRescheduleSuccess(''), 4000);
      loadCustomerData();
    } catch (err) {
      console.error('Reschedule request failed:', err);
    } finally {
      setSubmittingReschedule(false);
    }
  };

  const handleUpdateChecklist = async (e) => {
    e.preventDefault();
    try {
      setUpdatingChecklist(true);
      await api.customerUpdateProfile({
        customer_name: nameVal,
        customer_phone: phoneVal,
        address: addressVal
      });
      setChecklistSuccess('Details successfully updated and synced.');
      setTimeout(() => setChecklistSuccess(''), 3000);
      loadCustomerData();
    } catch (err) {
      console.error('Checklist update failed:', err);
    } finally {
      setUpdatingChecklist(false);
    }
  };

  if (loading) {
    return (
      <CustomerLayout>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0', color: '#6B7280', fontSize: '0.9rem' }}>
          Loading your customer portal...
        </div>
      </CustomerLayout>
    );
  }

  const leads = data?.leads || [];
  const conversations = data?.conversations || [];
  const business = data?.business || { name: 'CleanDesk Service' };
  const user = data?.user || {};

  const activeLead = leads.find(l => l.id === activeLeadId) || leads[0];

  // Dynamic missing fields check
  const isMissingName = !activeLead?.customer_name;
  const isMissingPhone = !activeLead?.customer_phone;
  const isMissingAddress = !activeLead?.address;
  const hasMissingInfo = isMissingName || isMissingPhone || isMissingAddress;

  return (
    <CustomerLayout>
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
      >
        {/* Header Block */}
        <motion.div variants={fadeUp} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--color-border)', paddingBottom: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: '500' }}>Active Customer Session: {user.email}</span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '700', margin: '0.25rem 0 0 0', color: '#0A0A0A', letterSpacing: '-0.02em' }}>
              Your Booking Workspace
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#FFFFFF', padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.8rem', color: '#0A0A0A', fontWeight: '500' }}>
            <StatusDotIcon size={8} color="#2563EB" pulse={true} />
            Connected to {business.name}
          </div>
        </motion.div>

        {leads.length === 0 ? (
          <motion.div variants={fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Active empty state: invite to book */}
            <div className="glass-auth-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
              <CalendarIcon size={32} style={{ color: '#D1D5DB', marginBottom: '1rem' }} />
              <h3 style={{ margin: '0 0 0.5rem', color: '#0A0A0A', fontSize: '1.1rem', fontWeight: '600' }}>
                No bookings found yet
              </h3>
              <p style={{ color: '#6B7280', fontSize: '0.85rem', margin: '0 0 1.75rem', lineHeight: '1.5', maxWidth: '360px', marginLeft: 'auto', marginRight: 'auto' }}>
                We couldn't find any cleaning requests linked to <strong>{user.email}</strong>.
                Start by requesting your first clean below.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a
                  href="/book"
                  className="btn-primary"
                  style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <CalendarIcon size={14} /> Book a cleaning service
                </a>
                <a
                  href="/"
                  className="btn-secondary"
                  style={{ textDecoration: 'none', fontSize: '0.85rem' }}
                >
                  View all services
                </a>
              </div>
            </div>

            {/* Contact info even on empty */}
            {business && (
              <div className="glass-auth-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: '600' }}>Service provider</span>
                  <p style={{ margin: '0.15rem 0 0', fontSize: '0.9rem', fontWeight: '600', color: '#0A0A0A' }}>{business.name}</p>
                </div>
                {business.phone && (
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: '600' }}>Phone</span>
                    <p style={{ margin: '0.15rem 0 0', fontSize: '0.85rem', color: '#0A0A0A' }}>{business.phone}</p>
                  </div>
                )}
                {business.opening_hours && (
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: '600' }}>Opening hours</span>
                    <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: '#6B7280', lineHeight: '1.3' }}>{business.opening_hours}</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
            {/* Left Column: Booking Pipeline & Operations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Active Booking Details */}
              <motion.section variants={fadeUp} className="glass-auth-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#0A0A0A' }}>
                    Active Enquiry Status
                  </h3>
                  <span className={`pill status-${activeLead.status}`} style={{ textTransform: 'uppercase', fontSize: '0.65rem' }}>
                    {activeLead.status}
                  </span>
                </div>

                {/* Status Stepper */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '2rem 0', position: 'relative' }}>
                  {/* Stepper progress line */}
                  <div style={{ position: 'absolute', top: '15px', left: '10%', right: '10%', height: '2px', background: 'var(--color-border)', zIndex: 1 }} />
                  <div 
                    style={{ 
                      position: 'absolute', 
                      top: '15px', 
                      left: '10%', 
                      width: activeLead.status === 'booked' ? '80%' : activeLead.status === 'contacted' ? '40%' : '0%', 
                      height: '2px', 
                      background: '#2563EB', 
                      zIndex: 2,
                      transition: 'width 0.4s ease'
                    }} 
                  />

                  {/* Steps */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, width: '20%' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#2563EB', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      1
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#0A0A0A', fontWeight: '600', marginTop: '0.5rem' }}>Enquiry Recieved</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, width: '20%' }}>
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '50%', 
                      backgroundColor: (activeLead.status === 'contacted' || activeLead.status === 'booked') ? '#2563EB' : '#FFFFFF', 
                      color: (activeLead.status === 'contacted' || activeLead.status === 'booked') ? '#FFFFFF' : '#6B7280', 
                      border: '1px solid var(--color-border)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '0.8rem', 
                      fontWeight: 'bold' 
                    }}>
                      2
                    </div>
                    <span style={{ fontSize: '0.7rem', color: (activeLead.status === 'contacted' || activeLead.status === 'booked') ? '#0A0A0A' : '#6B7280', fontWeight: '600', marginTop: '0.5rem' }}>Review / Contacted</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, width: '20%' }}>
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '50%', 
                      backgroundColor: activeLead.status === 'booked' ? '#16A34A' : '#FFFFFF', 
                      color: activeLead.status === 'booked' ? '#FFFFFF' : '#6B7280', 
                      border: '1px solid var(--color-border)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '0.8rem', 
                      fontWeight: 'bold' 
                    }}>
                      3
                    </div>
                    <span style={{ fontSize: '0.7rem', color: activeLead.status === 'booked' ? '#0A0A0A' : '#6B7280', fontWeight: '600', marginTop: '0.5rem' }}>Job Booked</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#6B7280', textTransform: 'uppercase' }}>Service Requested</span>
                    <h4 style={{ margin: '0.15rem 0', color: '#0A0A0A', fontSize: '0.9rem' }}>{activeLead.service_type || 'General Cleaning Inquiry'}</h4>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#6B7280', textTransform: 'uppercase' }}>Target / Booking Date</span>
                    <h4 style={{ margin: '0.15rem 0', color: '#0A0A0A', fontSize: '0.9rem' }}>{activeLead.preferred_date || 'Pending Schedule'}</h4>
                  </div>
                  <div style={{ gridColumn: 'span 2', marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.7rem', color: '#6B7280', textTransform: 'uppercase' }}>Extracted Address</span>
                    <p style={{ margin: '0.15rem 0', color: '#0A0A0A', fontSize: '0.85rem' }}>{activeLead.address || 'No address specified yet. Please update using the checklist.'}</p>
                  </div>
                </div>
              </motion.section>

              {/* Missing details checklist card */}
              <AnimatePresence mode="wait">
                {hasMissingInfo && (
                  <motion.section 
                    key="checklist-sec"
                    variants={fadeUp} 
                    className="glass-auth-card" 
                    style={{ padding: '1.5rem', borderColor: '#D97706', backgroundColor: 'rgba(217, 119, 6, 0.01)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.8rem', color: '#D97706' }}>
                      <AlertIcon size={16} />
                      <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600' }}>Missing Booking Details Checklist</h3>
                    </div>
                    <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', color: '#6B7280' }}>
                      We need a few details to complete your schedule. Submit them below to sync automatically with our CRM:
                    </p>

                    <form onSubmit={handleUpdateChecklist} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      {isMissingName && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#0A0A0A' }}>Your Full Name</label>
                          <input 
                            className="form-input" 
                            value={nameVal} 
                            onChange={(e) => setNameVal(e.target.value)} 
                            placeholder="Enter name"
                            required
                          />
                        </div>
                      )}
                      
                      {isMissingPhone && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#0A0A0A' }}>Your Contact Number</label>
                          <input 
                            className="form-input" 
                            value={phoneVal} 
                            onChange={(e) => setPhoneVal(e.target.value)} 
                            placeholder="Enter phone number" 
                            required
                          />
                        </div>
                      )}

                      {isMissingAddress && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#0A0A0A' }}>Property Address</label>
                          <input 
                            className="form-input" 
                            value={addressVal} 
                            onChange={(e) => setAddressVal(e.target.value)} 
                            placeholder="Enter full cleaning address"
                            required
                          />
                        </div>
                      )}

                      <button 
                        type="submit" 
                        className="btn-primary" 
                        disabled={updatingChecklist}
                        style={{ alignSelf: 'flex-start', marginTop: '0.4rem', fontSize: '0.8rem', padding: '0.4rem 1rem' }}
                      >
                        {updatingChecklist ? 'Syncing...' : 'Sync Information'}
                      </button>

                      {checklistSuccess && (
                        <span style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: '500' }}>
                          ✓ {checklistSuccess}
                        </span>
                      )}
                    </form>
                  </motion.section>
                )}
              </AnimatePresence>

              {/* Request updates / reschedule action panel */}
              <motion.section variants={fadeUp} className="glass-auth-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: '600', color: '#0A0A0A' }}>
                  Request Booking Reschedule / Cancellation
                </h3>
                <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', color: '#6B7280' }}>
                  Need to change dates, edit your details, or cancel your booking request? Describe your update request below and our team will flag it for action:
                </p>

                <form onSubmit={handleRequestReschedule} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <textarea
                    className="form-input"
                    rows="3"
                    value={rescheduleNotes}
                    onChange={(e) => setRescheduleNotes(e.target.value)}
                    placeholder="E.g., I would like to change my regular clean date from Friday afternoon to Saturday morning..."
                    style={{ width: '100%', resize: 'vertical', minHeight: '80px', boxSizing: 'border-box' }}
                    required
                  />
                  
                  <button 
                    type="submit" 
                    className="btn-secondary"
                    disabled={submittingReschedule || rescheduleNotes.trim() === ''}
                    style={{ alignSelf: 'flex-start', padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                  >
                    {submittingReschedule ? 'Sending Request...' : 'Submit Change Request'}
                  </button>

                  {rescheduleSuccess && (
                    <span style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: '500' }}>
                      ✓ {rescheduleSuccess}
                    </span>
                  )}
                </form>
              </motion.section>

            </div>

            {/* Right Column: Contact Cards and Navigation links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Business Contact Profile Card */}
              <motion.section variants={fadeUp} className="glass-auth-card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', fontWeight: '600', color: '#0A0A0A', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                  Business Contact Profile
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: '#6B7280', textTransform: 'uppercase' }}>Provider</span>
                    <h5 style={{ margin: '0.1rem 0', color: '#0A0A0A', fontSize: '0.85rem' }}>{business.name}</h5>
                  </div>
                  {business.phone && (
                    <div>
                      <span style={{ fontSize: '0.65rem', color: '#6B7280', textTransform: 'uppercase' }}>Phone Number</span>
                      <p style={{ margin: '0.1rem 0', color: '#0A0A0A', fontSize: '0.8rem' }}>{business.phone}</p>
                    </div>
                  )}
                  {business.email && (
                    <div>
                      <span style={{ fontSize: '0.65rem', color: '#6B7280', textTransform: 'uppercase' }}>Email Address</span>
                      <p style={{ margin: '0.1rem 0', color: '#2563EB', fontSize: '0.8rem' }}>{business.email}</p>
                    </div>
                  )}
                  {business.opening_hours && (
                    <div>
                      <span style={{ fontSize: '0.65rem', color: '#6B7280', textTransform: 'uppercase' }}>Opening Hours</span>
                      <p style={{ margin: '0.1rem 0', color: '#0A0A0A', fontSize: '0.8rem', lineHeight: '1.3' }}>{business.opening_hours}</p>
                    </div>
                  )}
                </div>
              </motion.section>

              {/* CRM Leads history quick link list */}
              <motion.section variants={fadeUp} className="glass-auth-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ margin: '0 0 0.8rem 0', fontSize: '0.9rem', fontWeight: '600', color: '#0A0A0A' }}>
                  Your Booking Enquiries
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {leads.map(lead => (
                    <div 
                      key={lead.id}
                      onClick={() => {
                        setActiveLeadId(lead.id);
                        setAddressVal(lead.address || '');
                        setPhoneVal(lead.customer_phone || '');
                        setNameVal(lead.customer_name || '');
                      }}
                      style={{
                        padding: '0.6rem',
                        borderRadius: '6px',
                        border: '1px solid',
                        borderColor: activeLeadId === lead.id ? '#2563EB' : 'var(--color-border)',
                        background: activeLeadId === lead.id ? 'rgba(37, 99, 235, 0.02)' : '#FFFFFF',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.2rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '0.8rem', color: '#0A0A0A' }}>{lead.service_type || 'General Clean'}</strong>
                        <span className={`pill status-${lead.status}`} style={{ fontSize: '0.55rem', padding: '0.1rem 0.3rem' }}>
                          {lead.status}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: '#6B7280' }}>
                        Requested: {lead.preferred_date || 'Unscheduled'}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.section>

            </div>
          </div>
        )}
      </motion.div>
    </CustomerLayout>
  );
};

export default CustomerDashboard;
