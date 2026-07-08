import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import { api } from '../services/api';
import { supabase } from '../supabaseClient';
import { fadeUp, staggerContainer } from '../utils/motionPresets';
import { InboxIcon, ClockIcon, AlertIcon, MessageIcon, CheckIcon } from '../components/Icons';

const Dashboard = () => {
  const [leads, setLeads] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [business, setBusiness] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const handleSignOut = async (e) => {
    e.preventDefault();
    const isSupabaseConfigured = 
      import.meta.env.VITE_SUPABASE_URL && 
      import.meta.env.VITE_SUPABASE_URL !== 'https://your-project.supabase.co';

    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Sign out error:', err);
      }
    }
    navigate('/login');
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const isSupabaseConfigured = 
          import.meta.env.VITE_SUPABASE_URL && 
          import.meta.env.VITE_SUPABASE_URL !== 'https://your-project.supabase.co';

        if (isSupabaseConfigured) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            setUserEmail(user.email);
          }
        } else {
          setUserEmail('owner@sparklehome.co.uk');
        }

        const bData = await api.getBusinessOfCurrentUser();
        setBusiness(bData);
        
        const targetId = bData.id;
        const [lData, cData] = await Promise.all([
          api.getLeads(targetId),
          api.getConversations(targetId)
        ]);
        setLeads(lData);
        setConversations(cData);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        // Redirect to Business profile setup if no business exists
        navigate('/dashboard/business');
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboardData();
  }, [navigate]);

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
      
      <motion.main 
        className="dashboard-content"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.header className="dashboard-header" variants={fadeUp}>
          <div>
            <span className="dashboard-welcome">Welcome back, {userEmail}</span>
            <h1 className="dashboard-title">{business?.name || 'CleanDesk'} Overview</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="dashboard-status-indicator" style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
              <span className="dot pulse" style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL !== 'https://your-project.supabase.co') ? '#16A34A' : '#D97706', boxShadow: (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL !== 'https://your-project.supabase.co') ? '0 0 8px #16A34A' : '0 0 8px #D97706', marginRight: '0.4rem' }}></span> 
              {(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL !== 'https://your-project.supabase.co') ? 'Supabase Live' : 'Offline Mock'}
            </div>
            <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', cursor: 'pointer' }} onClick={handleSignOut}>
              Logout
            </button>
          </div>
        </motion.header>

        {/* Stats Grid */}
        <motion.section className="stats-grid" variants={fadeUp}>
          <StatCard 
            title="Total Leads" 
            value={totalLeads} 
            icon={<InboxIcon size={20} />} 
            badgeText="+14% this week" 
            badgeType="positive"
            description="Leads captured by AI"
          />
          <StatCard 
            title="New Leads" 
            value={newLeads} 
            icon={<ClockIcon size={20} />} 
            badgeText={newLeads > 0 ? "Needs action" : "All clear"} 
            badgeType={newLeads > 0 ? "warning" : "positive"}
            description="Awaiting business review"
          />
          <StatCard 
            title="Human Review Required" 
            value={needsReview} 
            icon={<AlertIcon size={20} />} 
            badgeText={needsReview > 0 ? "Urgent" : "Healthy"} 
            badgeType={needsReview > 0 ? "danger" : "positive"}
            description="Conversations flagged for owner"
          />
          <StatCard 
            title="Avg AI Confidence" 
            value={`${Math.round(avgConfidence * 100)}%`} 
            icon={<MessageIcon size={20} />} 
            badgeText="Stable" 
            badgeType="positive"
            description="NLP accuracy rating"
          />
        </motion.section>

        {/* Recent Leads and Activity Preview */}
        <motion.div className="dashboard-preview-grid" variants={fadeUp}>
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
                      <span className="status-pill danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                        <AlertIcon size={12} /> Flagged
                      </span>
                    ) : (
                      <span className="status-pill success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                        <CheckIcon size={12} /> Managed
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.main>
    </div>
  );
};

export default Dashboard;
