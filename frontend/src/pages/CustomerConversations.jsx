import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import CustomerLayout from '../components/CustomerLayout';
import { api } from '../services/api';
import { ArrowRightIcon, MessageIcon } from '../components/Icons';

const formatDate = (value) => {
  if (!value) return 'Not set';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
};

const messageLabel = (sender) => {
  const clean = String(sender || '').toLowerCase().trim();
  if (clean === 'customer') return 'You';
  if (clean === 'ai') return 'AI receptionist';
  if (clean === 'owner') return 'Business owner';
  return 'System';
};

const getMessageSender = (msg) => {
  if (!msg) return 'system';
  const val = msg.sender || msg.sender_type || msg.role || msg.message_type || 'system';
  const clean = String(val).toLowerCase().trim();
  if (clean === 'customer' || clean === 'ai' || clean === 'owner' || clean === 'system') {
    return clean;
  }
  return 'system';
};

const getMessageContent = (msg) => {
  if (!msg) return '';
  return msg.content || msg.body || msg.text || '';
};

const groupByBusiness = (conversations) => {
  const groups = new Map();
  conversations.forEach((conversation) => {
    const key = conversation.business_id || 'unknown';
    if (!groups.has(key)) {
      groups.set(key, {
        business_id: conversation.business_id,
        business_name: conversation.business_name || 'Service business',
        business_slug: conversation.business_slug,
        category: conversation.category,
        city: conversation.city,
        service_area: conversation.service_area,
        conversations: []
      });
    }
    groups.get(key).conversations.push(conversation);
  });
  return [...groups.values()].sort((a, b) => a.business_name.localeCompare(b.business_name));
};

const CustomerConversations = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(searchParams.get('conversation'));
  const [activeDetail, setActiveDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [composer, setComposer] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const threadEndRef = useRef(null);

  const loadConversations = async (preferredId = activeConversationId) => {
    try {
      setLoading(true);
      const response = await api.customerGetConversations();
      setConversations(response || []);
      const queryConversation = searchParams.get('conversation');
      const nextId = queryConversation || preferredId || response?.[0]?.id || null;
      if (nextId) {
        setActiveConversationId(nextId);
        setSearchParams({ conversation: nextId }, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Failed to load conversations.');
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async () => {
    if (!activeConversationId) {
      setActiveDetail(null);
      return;
    }

    try {
      setDetailLoading(true);
      const response = await api.customerGetConversationDetail(activeConversationId);
      setActiveDetail(response);
    } catch (err) {
      setError(err.message || 'Failed to load conversation details.');
      setActiveDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const queryConversation = searchParams.get('conversation');
    if (queryConversation && queryConversation !== activeConversationId) {
      setActiveConversationId(queryConversation);
    }
  }, [searchParams, activeConversationId]);

  useEffect(() => {
    loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversationId]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeDetail]);

  const groupedConversations = useMemo(() => groupByBusiness(conversations), [conversations]);

  const chooseConversation = (conversationId) => {
    setActiveConversationId(conversationId);
    setSearchParams({ conversation: conversationId });
    setComposer('');
    setError('');
  };

  const sendMessage = async () => {
    if (!activeConversationId || !composer.trim()) return;

    try {
      setSending(true);
      setError('');
      await api.customerSendConversationMessage(activeConversationId, composer);
      setComposer('');
      await Promise.all([
        loadConversations(activeConversationId),
        loadDetail()
      ]);
    } catch (err) {
      setError(err.message || 'Could not send your message.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <CustomerLayout>
        <div className="customer-loading">Loading your conversations...</div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="customer-portal-page">
        <header className="customer-page-header">
          <div>
            <span className="customer-eyebrow">Customer conversations</span>
            <h1>Conversations by business</h1>
            <p>Message each business from the same portal where you track enquiries and bookings.</p>
          </div>
        </header>

        {error ? <div className="customer-inline-error">{error}</div> : null}

        {conversations.length === 0 ? (
          <section className="customer-empty-state">
            <MessageIcon size={30} />
            <h2>No conversations yet</h2>
            <p>Submit an enquiry to a business and the conversation trail will appear here.</p>
            <Link to="/businesses" className="btn-primary marketplace-btn">
              Browse businesses <ArrowRightIcon size={14} />
            </Link>
          </section>
        ) : (
          <section className="customer-conversation-layout">
            <div className="customer-conversation-list">
              {groupedConversations.map((group) => (
                <article className="customer-conversation-group" key={group.business_id || group.business_name}>
                  <div className="customer-conversation-group-header">
                    <div>
                      <span>{group.category || 'Service business'}</span>
                      <h2>{group.business_name}</h2>
                    </div>
                    {group.business_slug ? (
                      <Link to={`/business/${group.business_slug}`} className="marketplace-card-link">
                        View business
                      </Link>
                    ) : null}
                  </div>

                  {group.conversations.map((conversation) => (
                    <button
                      type="button"
                      className={`customer-conversation-item ${conversation.id === activeConversationId ? 'active' : ''}`}
                      key={conversation.id}
                      onClick={() => chooseConversation(conversation.id)}
                    >
                      <div>
                        <strong>{conversation.service_type || 'General service request'}</strong>
                        <span>{conversation.last_message_preview || 'No message preview yet'}</span>
                      </div>
                      <dl>
                        <div>
                          <dt>Status</dt>
                          <dd>{conversation.status || 'open'}</dd>
                        </div>
                        <div>
                          <dt>Updated</dt>
                          <dd>{formatDate(conversation.last_message_at || conversation.updated_at || conversation.created_at)}</dd>
                        </div>
                      </dl>
                    </button>
                  ))}
                </article>
              ))}
            </div>

            <aside className="customer-conversation-detail">
              {detailLoading ? (
                <div className="customer-loading compact">Loading conversation...</div>
              ) : activeDetail ? (
                <>
                  <div className="customer-conversation-detail-header">
                    <span>{activeDetail.business_name || 'Service business'}</span>
                    <h2>{activeDetail.service_type || 'Conversation'}</h2>
                    <p>Status: {activeDetail.status || 'open'}</p>
                  </div>

                  {activeDetail.lead ? (
                    <dl className="customer-thread-context">
                      <div>
                        <dt>Address</dt>
                        <dd>{activeDetail.lead.address || 'Not provided'}</dd>
                      </div>
                      <div>
                        <dt>Preferred date</dt>
                        <dd>{activeDetail.lead.preferred_date || 'Not set'}</dd>
                      </div>
                    </dl>
                  ) : null}

                  <div className="customer-message-stack">
                    {(activeDetail.messages || []).length === 0 ? (
                      <p className="customer-muted-text">No messages recorded yet.</p>
                    ) : (
                      activeDetail.messages.map((message) => {
                        if (!message) return null;
                        const normalizedSender = getMessageSender(message);
                        const normalizedContent = getMessageContent(message);
                        return (
                          <div className={`customer-message ${normalizedSender === 'customer' ? 'customer' : 'business'}`} key={message.id || Math.random().toString()}>
                            <span>{messageLabel(normalizedSender)}</span>
                            <p>{normalizedContent}</p>
                            <time>{formatDate(message.created_at)}</time>
                          </div>
                        );
                      })
                    )}
                    <div ref={threadEndRef} />
                  </div>

                  <div className="customer-thread-composer">
                    <textarea
                      value={composer}
                      onChange={(event) => setComposer(event.target.value)}
                      placeholder="Reply to this business..."
                      rows={3}
                    />
                    <button type="button" className="btn-primary marketplace-btn" onClick={sendMessage} disabled={sending || !composer.trim()}>
                      {sending ? 'Sending...' : 'Send message'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="customer-empty-state compact">
                  <h2>Select a conversation</h2>
                  <p>Choose a conversation to view its message history.</p>
                </div>
              )}
            </aside>
          </section>
        )}
      </div>
    </CustomerLayout>
  );
};

export default CustomerConversations;
