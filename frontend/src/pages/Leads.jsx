import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import LeadCard from '../components/LeadCard';
import { api } from '../services/api';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const loadLeads = async () => {
    try {
      const bData = await api.getBusinessOfCurrentUser();
      const targetId = bData.id;
      const data = await api.getLeads(targetId);
      setLeads(data);
    } catch (err) {
      console.error(err);
      navigate('/dashboard/business');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.updateLeadStatus(id, newStatus);
      loadLeads();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredLeads = filterStatus === 'all'
    ? leads
    : leads.filter(l => l.status === filterStatus);

  if (isLoading) {
    return (
      <div className="dashboard-wrapper">
        <Sidebar />
        <div className="dashboard-content loading">Loading captured leads...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <Sidebar />

      <main className="dashboard-content">
        <header className="dashboard-header flex-header">
          <div>
            <span className="dashboard-welcome">CRM Feed</span>
            <h1 className="dashboard-title">Captured Leads</h1>
          </div>
          <div className="filter-group">
            <label className="filter-label">Filter by Status:</label>
            <select 
              className="filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">🔍 Show All</option>
              <option value="new">🆕 New</option>
              <option value="contacted">📞 Contacted</option>
              <option value="booked">✅ Booked</option>
              <option value="lost">❌ Lost</option>
            </select>
          </div>
        </header>

        {/* Temporary dev-only trace panel */}
        {import.meta.env.DEV ? (
          <div style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem',
            fontSize: '0.8rem',
            fontFamily: 'monospace',
            color: '#334155'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#0F172A', fontSize: '0.85rem' }}>⚡ CleanDesk Developer Trace Panel</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
              <div><strong>Owner Business ID:</strong> {leads.length > 0 ? leads[0].business_id : 'No leads loaded'}</div>
              <div><strong>Latest Lead ID:</strong> {leads.length > 0 ? leads[0].id : 'N/A'}</div>
              <div><strong>Latest Lead Business ID:</strong> {leads.length > 0 ? leads[0].business_id : 'N/A'}</div>
              <div><strong>Latest Lead Service ID:</strong> {leads.length > 0 ? (leads[0].service_id || 'N/A') : 'N/A'}</div>
              <div><strong>Latest Lead Service Name:</strong> {leads.length > 0 ? (leads[0].service_type || 'N/A') : 'N/A'}</div>
            </div>
          </div>
        ) : null}

        <div className="leads-container">
          {filteredLeads.length === 0 ? (
            <div className="empty-state">
              <h3>No leads found</h3>
              <p>Leads captured from the chatbot demo or client integrations will populate here.</p>
            </div>
          ) : (
            <div className="leads-grid-layout">
              {filteredLeads.map(lead => (
                <LeadCard 
                  key={lead.id} 
                  lead={lead} 
                  onStatusChange={handleStatusChange} 
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Leads;
