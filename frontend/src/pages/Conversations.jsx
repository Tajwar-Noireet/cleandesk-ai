import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ConversationCard from '../components/ConversationCard';
import { api } from '../services/api';

const Conversations = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [activeTranscript, setActiveTranscript] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);
  const transcriptEndRef = useRef(null);
  const navigate = useNavigate();

  const loadConversations = async () => {
    try {
      const bData = await api.getBusinessOfCurrentUser();
      const targetId = bData.id;
      const data = await api.getConversations(targetId);
      setConversations(data);
      if (data.length > 0 && !activeConvId) {
        setActiveConvId(data[0].id);
      }
    } catch (err) {
      console.error(err);
      navigate('/dashboard/business');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    const loadActiveTranscript = async () => {
      if (!activeConvId) return;
      setIsLoadingTranscript(true);
      try {
        const detail = await api.getConversationDetail(activeConvId);
        setActiveTranscript(detail);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingTranscript(false);
      }
    };
    loadActiveTranscript();
  }, [activeConvId]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeTranscript]);

  if (isLoading) {
    return (
      <div className="dashboard-wrapper">
        <Sidebar />
        <div className="dashboard-content loading">Loading conversations feed...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <Sidebar />

      <main className="dashboard-content no-scroll">
        <header className="dashboard-header">
          <div>
            <span className="dashboard-welcome">NLP Logs</span>
            <h1 className="dashboard-title">Conversations Feed</h1>
          </div>
        </header>

        <div className="conversations-split-view">
          {/* Left Side: Conversation list */}
          <div className="conversations-sidebar-list">
            {conversations.length === 0 ? (
              <p className="no-conv-msg">No active conversations found.</p>
            ) : (
              conversations.map(conv => (
                <ConversationCard
                  key={conv.id}
                  conversation={conv}
                  isActive={conv.id === activeConvId}
                  onClick={() => setActiveConvId(conv.id)}
                />
              ))
            )}
          </div>

          {/* Right Side: Chat Transcript */}
          <div className="conversation-transcript-pane">
            {isLoadingTranscript ? (
              <div className="transcript-loading">Loading message transcript...</div>
            ) : activeTranscript ? (
              <div className="transcript-pane-inner">
                {/* Header */}
                <div className="transcript-header">
                  <div>
                    <h3>{activeTranscript.customer_name || 'Anonymous Customer'}</h3>
                    <p>Phone: {activeTranscript.customer_phone || 'None provided'}</p>
                  </div>
                  <div className="transcript-header-meta">
                    <span className="ai-confidence-pill">
                      Confidence: {Math.round(activeTranscript.ai_confidence * 100)}%
                    </span>
                    {activeTranscript.needs_human_review && (
                      <span className="escalation-alert-pill">⚠️ Escalated</span>
                    )}
                  </div>
                </div>

                {/* Lead Progress Panel */}
                {activeTranscript.lead && (
                  <div className="transcript-lead-progress-panel">
                    <div className="progress-panel-header">
                      <span>🎯 Lead Capture Checklist</span>
                      <span className={`status-pill ${activeTranscript.lead.status}`}>
                        {activeTranscript.lead.status}
                      </span>
                    </div>
                    <div className="progress-panel-slots">
                      <span className={`progress-slot ${activeTranscript.lead.customer_name ? 'filled' : 'empty'}`}>
                        👤 Name: {activeTranscript.lead.customer_name || 'Missing'}
                      </span>
                      <span className={`progress-slot ${activeTranscript.lead.customer_phone ? 'filled' : 'empty'}`}>
                        📞 Phone: {activeTranscript.lead.customer_phone || 'Missing'}
                      </span>
                      <span className={`progress-slot ${activeTranscript.lead.address ? 'filled' : 'empty'}`}>
                        📍 Address: {activeTranscript.lead.address || 'Missing'}
                      </span>
                      <span className={`progress-slot ${activeTranscript.lead.service_type ? 'filled' : 'empty'}`}>
                        🧹 Service: {activeTranscript.lead.service_type || 'Missing'}
                      </span>
                      <span className={`progress-slot ${activeTranscript.lead.preferred_date ? 'filled' : 'empty'}`}>
                        📅 Date: {activeTranscript.lead.preferred_date || 'Missing'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Messages Box */}
                <div className="transcript-messages-box">
                  {activeTranscript.messages && activeTranscript.messages.length === 0 ? (
                    <p className="no-msg-info">No messages recorded in this log.</p>
                  ) : (
                    activeTranscript.messages.map(msg => (
                      <div key={msg.id} className={`transcript-message-row ${msg.sender}`}>
                        <div className="transcript-avatar">
                          {msg.sender === 'customer' ? '👤' : msg.sender === 'ai' ? '🤖' : '🔑'}
                        </div>
                        <div className="transcript-bubble">
                          <div className="bubble-sender-name">
                            {msg.sender === 'customer' ? 'Customer' : msg.sender === 'ai' ? 'CleanDesk AI' : 'Business Owner'}
                          </div>
                          <div className="bubble-text">{msg.content}</div>
                          <span className="bubble-time">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={transcriptEndRef} />
                </div>
              </div>
            ) : (
              <div className="transcript-empty-state">
                <h3>Select a conversation</h3>
                <p>Choose a contact row on the left to see the message transcript history between the customer and Assistant.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Conversations;
