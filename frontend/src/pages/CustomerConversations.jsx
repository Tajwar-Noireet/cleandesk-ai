import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import CustomerLayout from '../components/CustomerLayout';
import { api } from '../services/api';
import { ArrowRightIcon, MessageIcon } from '../components/Icons';

const formatDate = (value) => {
  if (!value) return 'Not set';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
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
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [activeDetail, setActiveDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true);
        const response = await api.customerGetConversations();
        setConversations(response || []);
        if (response?.length > 0) {
          setActiveConversationId(response[0].id);
        }
      } catch (err) {
        console.error('Failed to load conversations:', err);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, []);

  useEffect(() => {
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
        console.error('Failed to load conversation details:', err);
        setActiveDetail(null);
      } finally {
        setDetailLoading(false);
      }
    };

    loadDetail();
  }, [activeConversationId]);

  const groupedConversations = useMemo(() => groupByBusiness(conversations), [conversations]);

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
            <p>Review messages and request context across the businesses you contacted.</p>
          </div>
        </header>

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
                      onClick={() => setActiveConversationId(conversation.id)}
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

                  <div className="customer-message-stack">
                    {(activeDetail.messages || []).length === 0 ? (
                      <p className="customer-muted-text">No messages recorded yet.</p>
                    ) : (
                      activeDetail.messages.map((message) => (
                        <div className={`customer-message ${message.sender === 'customer' ? 'customer' : 'business'}`} key={message.id}>
                          <span>{message.sender === 'customer' ? 'You' : 'Business'}</span>
                          <p>{message.content}</p>
                          <time>{formatDate(message.created_at)}</time>
                        </div>
                      ))
                    )}
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
