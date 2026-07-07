import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { api } from '../services/api';

const BusinessSetup = () => {
  const [businessId, setBusinessId] = useState('');
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
        const data = await api.getBusinessOfCurrentUser();
        setBusinessId(data.id || '');
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
      const isSupabaseConfigured = 
        import.meta.env.VITE_SUPABASE_URL && 
        import.meta.env.VITE_SUPABASE_URL !== 'https://your-project.supabase.co';

      const payload = {
        name,
        phone,
        email,
        service_area: serviceArea,
        opening_hours: openingHours,
        description
      };

      if (isSupabaseConfigured) {
        if (businessId) {
          await api.updateBusiness(businessId, payload);
          setMessage('✅ Business profile updated successfully!');
        } else {
          const newB = await api.createBusiness(payload);
          setBusinessId(newB.id);
          setMessage('✅ Business profile created successfully!');
        }
      } else {
        // Mock Mode: update the demo business
        await api.updateBusiness(api.getDemoBusinessId(), payload);
        setMessage('✅ Business profile updated successfully! (Mock Mode)');
      }
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

        {/* Copy Script Snippet Box */}
        {businessId && (
          <div className="card-container" style={{ marginTop: '2rem' }}>
            <div className="card-header">
              <h3>Embed Chat Widget</h3>
              <p>Copy and paste this script tag onto your Wix, WordPress, or HTML website right before the closing &lt;/body&gt; tag to deploy the receptionist widget.</p>
            </div>
            <div style={{ backgroundColor: '#0f172a', padding: '1.25rem', borderRadius: '8px', overflow: 'hidden' }}>
              <pre style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', overflowX: 'auto', textAlign: 'left', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
{`<script 
  src="${window.location.origin.replace('5173', '5000')}/widget.js" 
  data-business-id="${businessId}" 
  async>
</script>`}
              </pre>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default BusinessSetup;
