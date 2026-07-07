import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import LeadCard from '../components/LeadCard';
import { api } from '../services/api';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const loadLeads = async () => {
    try {
      const bData = await api.getBusinessOfCurrentUser();
      const targetId = bData.id || api.getDemoBusinessId();
      const data = await api.getLeads(targetId);
      setLeads(data);
    } catch (err) {
      console.error(err);
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

        <div className="leads-container">
          {filteredLeads.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-icon">🎯</span>
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
