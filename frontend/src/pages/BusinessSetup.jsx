import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { api } from '../services/api';

const BusinessSetup = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [serviceArea, setServiceArea] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [description, setDescription] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadBusiness = async () => {
      try {
        const data = await api.getBusiness();
        setName(data.name || '');
        setPhone(data.phone || '');
        setEmail(data.email || '');
        setServiceArea(data.service_area || '');
        setOpeningHours(data.opening_hours || '');
        setDescription(data.description || '');
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadBusiness();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    
    try {
      await api.updateBusiness(api.getDemoBusinessId(), {
        name,
        phone,
        email,
        service_area: serviceArea,
        opening_hours: openingHours,
        description
      });
      setMessage('✅ Business profile updated successfully!');
    } catch (err) {
      console.error(err);
      setMessage('❌ Failed to save profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-wrapper">
        <Sidebar />
        <div className="dashboard-content loading">Loading business profile...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <Sidebar />

      <main className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <span className="dashboard-welcome">Settings</span>
            <h1 className="dashboard-title">Business Profile Setup</h1>
          </div>
        </header>

        <div className="card-container">
          <div className="card-header">
            <h3>Knowledge Base Configuration</h3>
            <p>The AI Receptionist references these fields to answer user inquiries about coverage, availability, and business info.</p>
          </div>

          {message && <div className={`form-message-alert ${message.startsWith('✅') ? 'success' : 'error'}`}>{message}</div>}

          <form className="business-setup-form" onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Business Name *</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. SparkleHome Cleaning"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <input
                  type="text"
                  className="form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +44 20 7946 0958"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. info@sparklehome.co.uk"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Service Area Coverage</label>
                <input
                  type="text"
                  className="form-input"
                  value={serviceArea}
                  onChange={(e) => setServiceArea(e.target.value)}
                  placeholder="e.g. Greater London, Zones 1-4"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Opening Hours</label>
                <input
                  type="text"
                  className="form-input"
                  value={openingHours}
                  onChange={(e) => setOpeningHours(e.target.value)}
                  placeholder="e.g. Mon-Fri: 8AM-6PM, Sat: 9AM-4PM"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Business Description</label>
              <textarea
                className="form-input text-area"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a general overview of your cleaning service, specialties, or standard procedures."
              />
            </div>

            <button type="submit" className="btn-primary" disabled={isSaving}>
              {isSaving ? 'Saving Changes...' : 'Save Profile'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default BusinessSetup;
