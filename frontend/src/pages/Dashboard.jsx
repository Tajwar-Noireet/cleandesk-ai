import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import { api } from '../services/api';

const Dashboard = () => {
  const [leads, setLeads] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [business, setBusiness] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const bId = api.getDemoBusinessId();
        const [bData, lData, cData] = await Promise.all([
          api.getBusiness(bId),
          api.getLeads(bId),
          api.getConversations(bId)
        ]);
        setBusiness(bData);
        setLeads(lData);
        setConversations(cData);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  // Compute metrics
  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.status === 'new').length;
  const needsReview = conversations.filter(c => c.needs_human_review).length;
  
  const avgConfidence = conversations.length > 0
    ? conversations.reduce((acc, c) => acc + Number(c.ai_confidence), 0) / conversations.length
    : 1.0;

  if (isLoading) {
    return (
      <div className="dashboard-wrapper">
        <Sidebar />
        <div className="dashboard-content loading">Loading dashboard overview...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      
      <main className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <span className="dashboard-welcome">Welcome back, Owner</span>
            <h1 className="dashboard-title">{business?.name || 'CleanDesk AI'} Overview</h1>
          </div>
          <div className="dashboard-status-indicator">
            <span className="dot pulse green"></span> Mock Database Mode Active
          </div>
        </header>

        {/* Stats Grid */}
        <section className="stats-grid">
          <StatCard 
            title="Total Leads" 
            value={totalLeads} 
            icon="🎯" 
            badgeText="+14% this week" 
            badgeType="positive"
            description="Leads captured by AI"
          />
          <StatCard 
            title="New Leads" 
            value={newLeads} 
            icon="🆕" 
            badgeText={newLeads > 0 ? "Needs action" : "All clear"} 
            badgeType={newLeads > 0 ? "warning" : "positive"}
            description="Awaiting business review"
          />
          <StatCard 
            title="Human Review Required" 
            value={needsReview} 
            icon="⚠️" 
            badgeText={needsReview > 0 ? "Urgent" : "Healthy"} 
            badgeType={needsReview > 0 ? "danger" : "positive"}
            description="Conversations flagged for owner"
          />
          <StatCard 
            title="Avg AI Confidence" 
            value={`${Math.round(avgConfidence * 100)}%`} 
            icon="🤖" 
            badgeText="Stable" 
            badgeType="positive"
            description="NLP accuracy rating"
          />
        </section>

        {/* Recent Leads and Activity Preview */}
        <div className="dashboard-preview-grid">
          <div className="preview-card">
            <h3>Recent Captured Leads</h3>
            {leads.length === 0 ? (
              <p className="no-data">No leads captured yet.</p>
            ) : (
              <div className="preview-list">
                {leads.slice(0, 3).map(lead => (
                  <div key={lead.id} className="preview-item">
                    <div>
                      <strong>{lead.customer_name}</strong>
                      <p>{lead.service_type || 'General inquiry'} • {lead.customer_phone}</p>
                    </div>
                    <span className={`status-pill ${lead.status}`}>{lead.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="preview-card">
            <h3>Conversations Feed</h3>
            {conversations.length === 0 ? (
              <p className="no-data">No active conversations.</p>
            ) : (
              <div className="preview-list">
                {conversations.slice(0, 3).map(conv => (
                  <div key={conv.id} className="preview-item">
                    <div>
                      <strong>{conv.customer_name || 'Anonymous Customer'}</strong>
                      <p>Confidence: {Math.round(conv.ai_confidence * 100)}%</p>
                    </div>
                    {conv.needs_human_review ? (
                      <span className="status-pill danger">🚨 Flagged</span>
                    ) : (
                      <span className="status-pill success">🤖 Managed</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
