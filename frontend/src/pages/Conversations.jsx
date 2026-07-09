import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { api } from '../services/api';
import { AlertIcon, CalendarIcon, CheckIcon, InboxIcon, MessageIcon, ShieldIcon, UserIcon } from '../components/Icons';

const formatDateTime = (value) => {
  if (!value) return 'Not set';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
};

const senderLabel = (sender) => {
  const clean = String(sender || '').toLowerCase().trim();
  if (clean === 'customer') return 'Customer';
  if (clean === 'ai') return 'AI receptionist';
  if (clean === 'owner') return 'Owner/Team';
  return 'System';
};

const getMessageSender = (msg) => {
  if (!msg) return 'system';
  // Schema uses msg.sender — read it first, fall back to legacy field names
  const val = msg.sender ?? msg.sender_type ?? msg.role ?? msg.message_type ?? 'system';
  const clean = String(val).toLowerCase().trim();
  if (clean === 'customer' || clean === 'ai' || clean === 'owner' || clean === 'system') {
    return clean;
  }
  return 'system';
};

const getMessageContent = (msg) => {
  if (!msg) return '';
  // Schema uses msg.content — read it first, fall back to legacy field names
  return msg.content ?? msg.body ?? msg.text ?? '';
};

const normalizeConfidence = (value) => {
  const confidence = Number(value);
  if (Number.isNaN(confidence)) return null;
  return confidence > 1 ? confidence : Math.round(confidence * 100);
};

const Conversations = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(searchParams.get('conversation'));
  const [activeTranscript, setActiveTranscript] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);
  const [composer, setComposer] = useState('');
  const [draftPrompt, setDraftPrompt] = useState('');
  const [aiDraft, setAiDraft] = useState(null);
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const transcriptEndRef = useRef(null);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConvId) || null,
    [conversations, activeConvId]
  );

  const loadConversations = async (preferredId = activeConvId) => {
    try {
      const data = await api.getConversations();
      setConversations(data || []);
      const queryConversation = searchParams.get('conversation');
      const nextId = queryConversation || preferredId || data?.[0]?.id || null;
      if (nextId) {
        setActiveConvId(nextId);
        setSearchParams({ conversation: nextId }, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Could not load conversations.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadActiveTranscript = async () => {
    if (!activeConvId) {
      setActiveTranscript(null);
      return;
    }

    try {
      setIsLoadingTranscript(true);
      const detail = await api.getConversationDetail(activeConvId);
      setActiveTranscript(detail);
      setAiDraft(detail.ai || null);
    } catch (err) {
      setError(err.message || 'Could not load this conversation.');
      setActiveTranscript(null);
    } finally {
      setIsLoadingTranscript(false);
    }
  };

  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const queryConversation = searchParams.get('conversation');
    if (queryConversation && queryConversation !== activeConvId) {
      setActiveConvId(queryConversation);
    }
  }, [searchParams, activeConvId]);

  useEffect(() => {
    loadActiveTranscript();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConvId]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeTranscript]);

  const chooseConversation = (conversationId) => {
    setActiveConvId(conversationId);
    setSearchParams({ conversation: conversationId });
    setComposer('');
    setError('');
  };

  const refreshThread = async () => {
    await Promise.all([
      loadConversations(activeConvId),
      loadActiveTranscript()
    ]);
  };

  const sendOwnerMessage = async () => {
    if (!activeConvId || !composer.trim()) return;
    try {
      setIsSending(true);
      setError('');
      await api.sendOwnerConversationMessage(activeConvId, composer);
      setComposer('');
      await refreshThread();
    } catch (err) {
      setError(err.message || 'Could not send the owner reply.');
    } finally {
      setIsSending(false);
    }
  };

  const generateDraft = async () => {
    if (!activeConvId) return;
    try {
      setIsGeneratingDraft(true);
      setError('');
      const draft = await api.generateOwnerAiDraft(activeConvId, draftPrompt);
      setAiDraft(draft);
    } catch (err) {
      setError(err.message || 'Could not generate an AI draft.');
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  const sendAiReply = async () => {
    if (!activeConvId || !aiDraft?.suggested_reply) return;
    try {
      setIsSending(true);
      setError('');
      await api.sendOwnerAiReply(activeConvId, aiDraft.suggested_reply, draftPrompt);
      setComposer('');
      await refreshThread();
    } catch (err) {
      setError(err.message || 'Could not send the AI reply.');
    } finally {
      setIsSending(false);
    }
  };

  const markReviewed = async () => {
    if (!activeConvId) return;
    try {
      setError('');
      await api.markConversationReviewed(activeConvId);
      await refreshThread();
    } catch (err) {
      setError(err.message || 'Could not mark the conversation reviewed.');
    }
  };

  const updateLeadStatus = async (status) => {
    if (!activeTranscript?.lead?.id) return;
    try {
      setError('');
      await api.updateLeadStatus(activeTranscript.lead.id, status);
      await refreshThread();
    } catch (err) {
      setError(err.message || 'Could not update the lead status.');
    }
  };

  const missingDetails = aiDraft?.missing_details || activeTranscript?.ai?.missing_details || [];
  const confidence = normalizeConfidence(aiDraft?.confidence ?? activeTranscript?.ai_confidence ?? activeTranscript?.ai?.confidence);

  if (isLoading) {
    return (
      <div className="dashboard-wrapper">
        <Sidebar />
        <div className="dashboard-content loading">Loading conversation inbox...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <Sidebar />

      <main className="dashboard-content no-scroll">
        <header className="dashboard-header">
          <div>
            <span className="dashboard-welcome">Owner inbox</span>
            <h1 className="dashboard-title">AI receptionist conversations</h1>
          </div>
        </header>

        {error ? <div className="dashboard-alert">{error}</div> : null}

        <section className="conversation-command-center">
          <aside className="conversation-inbox-panel" aria-label="Conversation inbox">
            <div className="conversation-panel-header">
              <div>
                <span>Inbox</span>
                <h2>Customer threads</h2>
              </div>
              <strong>{conversations.length}</strong>
            </div>

            <div className="owner-conversation-list">
              {conversations.length === 0 ? (
                <p className="no-conv-msg">No active conversations yet.</p>
              ) : (
                conversations.map((conversation) => {
                  if (!conversation) return null;
                  return (
                    <button
                      type="button"
                      className={`owner-conversation-item ${conversation.id === activeConvId ? 'active' : ''}`}
                      key={conversation.id}
                      onClick={() => chooseConversation(conversation.id)}
                    >
                      <div className="owner-conversation-item-top">
                        <strong>{conversation.customer_name || 'Anonymous customer'}</strong>
                        {conversation.needs_human_review ? (
                          <span className="review-badge"><AlertIcon size={12} /> Review</span>
                        ) : null}
                      </div>
                      <span>{conversation.service_type || 'General enquiry'}</span>
                      <p>{conversation.latest_message_preview || 'No messages yet'}</p>
                      <time>{formatDateTime(conversation.latest_message_at || conversation.updated_at || conversation.created_at)}</time>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          <section className="conversation-thread-panel">
            {isLoadingTranscript ? (
              <div className="transcript-loading">Loading message thread...</div>
            ) : activeTranscript ? (
              <>
                <div className="conversation-thread-header">
                  <div>
                    <span>{activeConversation?.business_name || activeTranscript.business?.name || 'Your business'}</span>
                    <h2>{activeTranscript.customer_name || 'Anonymous customer'}</h2>
                    <p>{activeTranscript.customer_email || 'No email'} {activeTranscript.customer_phone ? `- ${activeTranscript.customer_phone}` : ''}</p>
                  </div>
                  <div className="thread-header-actions">
                    {confidence !== null ? <span className="ai-confidence-pill">AI confidence {confidence}%</span> : null}
                    {activeTranscript.needs_human_review ? (
                      <button type="button" className="btn-secondary small-action" onClick={markReviewed}>
                        Mark reviewed
                      </button>
                    ) : null}
                  </div>
                </div>

                {activeTranscript.lead ? (
                  <div className="conversation-lead-summary">
                    <div className="lead-summary-row">
                      <span><InboxIcon size={13} /> {activeTranscript.lead.service_type || 'Service request'}</span>
                      <strong className={`status-pill ${activeTranscript.lead.status || 'new'}`}>{activeTranscript.lead.status || 'new'}</strong>
                    </div>
                    <div className="lead-summary-grid">
                      <span><ShieldIcon size={13} /> {activeTranscript.lead.address || 'Address missing'}</span>
                      <span><CalendarIcon size={13} /> {activeTranscript.lead.preferred_date || 'Date missing'}</span>
                      <span><UserIcon size={13} /> {activeTranscript.lead.customer_phone || 'Phone missing'}</span>
                      <span><CheckIcon size={13} /> {activeTranscript.lead.notes || 'No notes'}</span>
                    </div>
                    <div className="lead-status-actions">
                      <button type="button" className="btn-secondary small-action" onClick={() => updateLeadStatus('contacted')}>Mark contacted</button>
                      <button type="button" className="btn-secondary small-action" onClick={() => updateLeadStatus('booked')}>Mark booked</button>
                      <button type="button" className="btn-secondary small-action" onClick={() => updateLeadStatus('lost')}>Close request</button>
                    </div>
                  </div>
                ) : null}

                <div className="message-thread-scroll">
                  {(activeTranscript.messages || []).length === 0 ? (
                    <p className="no-msg-info">No messages recorded in this thread.</p>
                  ) : (
                    activeTranscript.messages.map((message) => {
                      if (!message) return null;
                      const normalizedSender = getMessageSender(message);
                      const normalizedContent = getMessageContent(message);
                      return (
                        <div className={`thread-message ${normalizedSender}`} key={message.id || Math.random().toString()}>
                          <div className="thread-message-bubble">
                            <span>{senderLabel(normalizedSender)}</span>
                            <p>{normalizedContent}</p>
                            <time>{formatDateTime(message.created_at)}</time>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={transcriptEndRef} />
                </div>

                <div className="message-composer">
                  <textarea
                    value={composer}
                    onChange={(event) => setComposer(event.target.value)}
                    placeholder="Write a response as the business owner..."
                    rows={3}
                  />
                  <div className="message-composer-actions">
                    <button type="button" className="btn-secondary marketplace-btn" onClick={() => setComposer(aiDraft?.suggested_reply || '')} disabled={!aiDraft?.suggested_reply}>
                      Use AI draft
                    </button>
                    <button type="button" className="btn-primary marketplace-btn" onClick={sendOwnerMessage} disabled={isSending || !composer.trim()}>
                      {isSending ? 'Sending...' : 'Send owner reply'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="transcript-empty-state">
                <h3>Select a conversation</h3>
                <p>Choose a customer thread to see messages and AI receptionist notes.</p>
              </div>
            )}
          </section>

          <aside className="conversation-ai-panel" aria-label="AI receptionist panel">
            <div className="conversation-panel-header">
              <div>
                <span>Receptionist</span>
                <h2>AI assist</h2>
              </div>
              <MessageIcon size={18} />
            </div>

            {activeTranscript ? (
              <>
                <section className="ai-panel-section">
                  <h3>Summary</h3>
                  <p>{aiDraft?.summary || activeTranscript.ai?.summary || 'No summary available yet.'}</p>
                </section>

                <section className="ai-panel-section">
                  <h3>Analysis</h3>
                  <p style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span><strong>Intent:</strong> {aiDraft?.intent || activeTranscript.ai?.intent || 'booking_request'}</span>
                    {confidence !== null ? <span><strong>Confidence:</strong> {confidence}%</span> : null}
                  </p>
                </section>

                <section className="ai-panel-section">
                  <h3>Missing details</h3>
                  {missingDetails.length > 0 ? (
                    <ul className="ai-missing-list">
                      {missingDetails.map((detail) => {
                        if (!detail) return null;
                        const label = typeof detail === 'string'
                          ? detail
                          : (detail.label || detail.key || '');
                        const key = typeof detail === 'string'
                          ? detail
                          : (detail.key || label || Math.random().toString());
                        return (
                          <li key={key}>{String(label).replace(/_/g, ' ')}</li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p>All core booking details have been captured.</p>
                  )}
                </section>

                <section className="ai-panel-section">
                  <h3>Next action</h3>
                  <p>{aiDraft?.next_action || activeTranscript.ai?.next_action || 'Review request details and confirm availability.'}</p>
                </section>

                <section className="ai-panel-section">
                  <label htmlFor="aiDraftPrompt">Draft guidance</label>
                  <textarea
                    id="aiDraftPrompt"
                    value={draftPrompt}
                    onChange={(event) => setDraftPrompt(event.target.value)}
                    placeholder="E.g., ask to clarify pricing, be shorter, or offer custom times..."
                    rows={3}
                    style={{ marginBottom: '0.5rem' }}
                  />
                  <button type="button" className="btn-secondary marketplace-btn full-width" onClick={generateDraft} disabled={isGeneratingDraft}>
                    {isGeneratingDraft ? 'Generating draft...' : 'Generate reply'}
                  </button>
                </section>

                {aiDraft?.suggested_reply ? (
                  <section className="ai-panel-section">
                    <h3>Generated Draft</h3>
                    <div className="ai-draft-box" style={{ marginBottom: '0.75rem' }}>{aiDraft.suggested_reply}</div>
                    <div className="ai-action-row">
                      <button type="button" className="btn-secondary marketplace-btn" onClick={() => setComposer(aiDraft.suggested_reply)}>
                        Insert draft
                      </button>
                      <button type="button" className="btn-primary marketplace-btn" onClick={sendAiReply} disabled={isSending}>
                        Send draft
                      </button>
                    </div>
                    {aiDraft.fallback_mode ? <p className="ai-fallback-note">Using local fallback while the AI service is offline.</p> : null}
                  </section>
                ) : null}

                {activeTranscript.lead ? (
                  <section className="ai-panel-section">
                    <h3>Request status</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                      <button type="button" className="btn-secondary marketplace-btn full-width" style={{ textAlign: 'center' }} onClick={() => updateLeadStatus('contacted')}>
                        Mark contacted
                      </button>
                      <button type="button" className="btn-secondary marketplace-btn full-width" style={{ textAlign: 'center' }} onClick={() => updateLeadStatus('booked')}>
                        Mark booked
                      </button>
                    </div>
                  </section>
                ) : null}
              </>
            ) : (
              <div className="ai-panel-section" style={{ borderBottom: 'none' }}>
                <p className="customer-muted-text">Select a thread to see receptionist analysis.</p>
              </div>
            )}
          </aside>
        </section>
      </main>
    </div>
  );
};

export default Conversations;
