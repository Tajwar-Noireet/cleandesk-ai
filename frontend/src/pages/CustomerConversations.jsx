import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import CustomerLayout from '../components/CustomerLayout';
import { api } from '../services/api';
import { MessageIcon, ClockIcon } from '../components/Icons';
import { fadeUp, staggerContainer } from '../utils/motionPresets';

const CustomerConversations = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [activeDetail, setActiveDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const res = await api.customerGetConversations();
      setConversations(res);
      if (res && res.length > 0) {
        setActiveConvId(res[0].id);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (id) => {
    try {
      setDetailLoading(true);
      const res = await api.customerGetConversationDetail(id);
      setActiveDetail(res);
    } catch (err) {
      console.error('Failed to load conversation details:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (activeConvId) {
      loadDetail(activeConvId);
    }
  }, [activeConvId]);

  if (loading) {
    return (
      <CustomerLayout>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0', color: '#6B7280', fontSize: '0.9rem' }}>
          Loading your conversation logs...
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
        style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
      >
        <motion.div variants={fadeUp} style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0, color: '#0A0A0A' }}>
            Chat Audit Logs
          </h1>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#6B7280' }}>
            Review historical transcripts of your conversations with the CleanDesk automated assistant.
          </p>
        </motion.div>

        {conversations.length === 0 ? (
          <motion.div variants={fadeUp} className="glass-auth-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <MessageIcon size={32} style={{ color: '#9CA3AF', marginBottom: '1rem' }} />
            <h3 style={{ margin: 0, color: '#0A0A0A' }}>No chat history available</h3>
            <p style={{ color: '#6B7280', fontSize: '0.85rem', marginTop: '0.5rem' }}>
              We could not find any conversation logs linked to your customer session.
            </p>
          </motion.div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', height: 'calc(100vh - 220px)', minHeight: '450px' }}>
            {/* Left Column: Conversations List */}
            <motion.div 
              variants={fadeUp} 
              className="glass-auth-card" 
              style={{ padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
            >
              {conversations.map(conv => {
                const isActive = conv.id === activeConvId;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '6px',
                      border: '1px solid',
                      borderColor: isActive ? '#2563EB' : 'var(--color-border)',
                      background: isActive ? 'rgba(37, 99, 235, 0.02)' : '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.2rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.8rem', color: '#0A0A0A' }}>
                        {conv.customer_name || 'Anonymous Session'}
                      </strong>
                      <span className={`pill status-${conv.status}`} style={{ fontSize: '0.55rem', padding: '0.1rem 0.3rem' }}>
                        {conv.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: '#6B7280' }}>
                      <ClockIcon size={10} />
                      <span>{new Date(conv.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </motion.div>

            {/* Right Column: Chat Messages Transcripts */}
            <motion.div 
              variants={fadeUp} 
              className="glass-auth-card" 
              style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            >
              <AnimatePresence mode="wait">
                {detailLoading ? (
                  <div key="loading" style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: '#6B7280', fontSize: '0.85rem' }}>
                    Loading message history...
                  </div>
                ) : activeDetail ? (
                  <motion.div 
                    key={activeConvId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
                  >
                    {/* Header */}
                    <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#0A0A0A' }}>
                          Session Details: {activeDetail.customer_name || 'Anonymous'}
                        </h4>
                        <span style={{ fontSize: '0.7rem', color: '#6B7280' }}>ID: {activeDetail.id}</span>
                      </div>
                      {activeDetail.needs_human_review && (
                        <span className="pill status-new" style={{ fontSize: '0.65rem', backgroundColor: '#FEF3C7', color: '#D97706', borderColor: '#F59E0B' }}>
                          ⚠️ Flagged for Takeover
                        </span>
                      )}
                    </div>

                    {/* Messages Body */}
                    <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {activeDetail.messages && activeDetail.messages.length === 0 ? (
                        <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '0.8rem' }}>
                          No messages recorded in this chat.
                        </div>
                      ) : (
                        activeDetail.messages?.map(msg => {
                          const isCustomer = msg.sender === 'customer';
                          return (
                            <div 
                              key={msg.id}
                              style={{
                                display: 'flex',
                                justifyContent: isCustomer ? 'flex-end' : 'flex-start',
                                width: '100%'
                              }}
                            >
                              <div 
                                style={{
                                  maxWidth: '80%',
                                  padding: '0.6rem 0.9rem',
                                  borderRadius: '12px',
                                  border: '1px solid',
                                  borderColor: isCustomer ? 'rgba(37, 99, 235, 0.15)' : 'var(--color-border)',
                                  backgroundColor: isCustomer ? 'rgba(37, 99, 235, 0.03)' : '#FFFFFF',
                                  color: '#0A0A0A',
                                  fontSize: '0.85rem',
                                  lineHeight: 1.45
                                }}
                              >
                                <div style={{ fontSize: '0.65rem', color: '#6B7280', fontWeight: 'bold', marginBottom: '0.15rem' }}>
                                  {isCustomer ? 'You (Customer)' : msg.sender === 'ai' ? 'Assistant' : 'Business Operator'}
                                </div>
                                <p style={{ margin: 0 }}>{msg.content}</p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <div key="select" style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: '#6B7280', fontSize: '0.85rem' }}>
                    Select a conversation log to view.
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </motion.div>
    </CustomerLayout>
  );
};

export default CustomerConversations;
