import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import CustomerLayout from '../components/CustomerLayout';
import { api } from '../services/api';
import { ArrowRightIcon, InboxIcon, MessageIcon } from '../components/Icons';

const statusLabels = {
  new: 'New request',
  contacted: 'Contacted',
  booked: 'Booked',
  lost: 'Closed',
  open: 'Open',
  pending: 'Pending'
};

const formatDate = (value) => {
  if (!value) return 'Not set';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const normalizeStatus = (status) => status || 'new';

const getNextAction = (lead) => {
  const status = normalizeStatus(lead.status);
  if (status === 'booked') return 'Booking is confirmed. Watch for service updates.';
  if (status === 'contacted') return 'Continue the conversation or review the business response.';
  if (status === 'lost') return 'This request is closed. Browse more businesses when ready.';
  return 'The owner is reviewing your enquiry.';
};

const groupByBusiness = (leads, conversations) => {
  const groups = new Map();

  const ensureGroup = (record) => {
    const key = record.business_id || 'unknown';
    if (!groups.has(key)) {
      groups.set(key, {
        business_id: record.business_id,
        business_name: record.business_name || 'Service business',
        business_slug: record.business_slug,
        category: record.category,
        city: record.city,
        service_area: record.service_area,
        leads: [],
        conversations: []
      });
    }
    return groups.get(key);
  };

  leads.forEach((lead) => ensureGroup(lead).leads.push(lead));
  conversations.forEach((conversation) => ensureGroup(conversation).conversations.push(conversation));
  return [...groups.values()].sort((a, b) => a.business_name.localeCompare(b.business_name));
};

const StatusTracker = ({ status }) => {
  const current = normalizeStatus(status);
  const steps = [
    { key: 'new', label: 'Owner review' },
    { key: 'contacted', label: 'Contacted' },
    { key: 'booked', label: 'Booked' }
  ];
  const activeIndex = current === 'booked' ? 2 : current === 'contacted' ? 1 : 0;

  return (
    <div className="customer-status-tracker" aria-label={`Request status: ${statusLabels[current] || current}`}>
      {steps.map((step, index) => (
        <div className={`customer-status-step ${index <= activeIndex ? 'active' : ''}`} key={step.key}>
          <span>{index + 1}</span>
          <strong>{step.label}</strong>
        </div>
      ))}
    </div>
  );
};

const CustomerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCustomerData = async () => {
      try {
        setLoading(true);
        const response = await api.customerGetDashboard();
        setData(response);
      } catch (err) {
        console.error('Failed to load customer dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCustomerData();
  }, []);

  const leads = data?.leads || [];
  const conversations = data?.conversations || [];
  const groups = useMemo(() => groupByBusiness(leads, conversations), [leads, conversations]);
  const businessesContacted = new Set(leads.map((lead) => lead.business_id).filter(Boolean)).size;
  const activeRequests = leads.filter((lead) => normalizeStatus(lead.status) !== 'lost').length;

  if (loading) {
    return (
      <CustomerLayout>
        <div className="customer-loading">Loading your marketplace requests...</div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="customer-portal-page">
        <header className="customer-page-header">
          <div>
            <span className="customer-eyebrow">Signed in as {data?.user?.email || 'customer'}</span>
            <h1>Marketplace request dashboard</h1>
            <p>Track enquiries, bookings, and conversations across every CleanDesk business you contact.</p>
          </div>
        </header>

        {leads.length === 0 ? (
          <section className="customer-empty-state">
            <InboxIcon size={30} />
            <h2>Start your first service request.</h2>
            <p>Browse trusted businesses and submit an enquiry. Your updates will appear here.</p>
            <Link to="/businesses" className="btn-primary marketplace-btn">
              Browse businesses <ArrowRightIcon size={14} />
            </Link>
          </section>
        ) : (
          <>
            <section className="customer-summary-grid" aria-label="Customer request summary">
              <article>
                <span>Active requests</span>
                <strong>{activeRequests}</strong>
              </article>
              <article>
                <span>Businesses contacted</span>
                <strong>{businessesContacted}</strong>
              </article>
              <article>
                <span>Messages and conversations</span>
                <strong>{conversations.length}</strong>
              </article>
            </section>

            <section className="customer-business-groups">
              {groups.map((group) => (
                <article className="customer-business-group" key={group.business_id || group.business_name}>
                  <div className="customer-business-group-header">
                    <div>
                      <span>{group.category || 'Service business'}</span>
                      <h2>{group.business_name}</h2>
                      <p>{[group.city, group.service_area].filter(Boolean).join(' - ') || 'Marketplace business'}</p>
                    </div>
                    {group.business_slug ? (
                      <Link to={`/business/${group.business_slug}`} className="marketplace-card-link">
                        View business
                      </Link>
                    ) : null}
                  </div>

                  <div className="customer-request-list">
                    {group.leads.map((lead) => {
                      const relatedConversation = group.conversations.find((conversation) => conversation.id === lead.conversation_id);
                      return (
                        <div className="customer-request-card" key={lead.id}>
                          <div className="customer-request-card-top">
                            <div>
                              <h3>{lead.service_type || 'General service request'}</h3>
                              <p>{lead.address || 'Address not provided'}</p>
                            </div>
                            <span className={`customer-status-pill status-${normalizeStatus(lead.status)}`}>
                              {statusLabels[normalizeStatus(lead.status)] || lead.status}
                            </span>
                          </div>

                          <StatusTracker status={lead.status} />

                          <dl className="customer-request-details">
                            <div>
                              <dt>Preferred date</dt>
                              <dd>{lead.preferred_date || 'Not set'}</dd>
                            </div>
                            <div>
                              <dt>Last updated</dt>
                              <dd>{formatDate(lead.last_updated || lead.updated_at || lead.created_at)}</dd>
                            </div>
                            <div>
                              <dt>Recent conversation</dt>
                              <dd>{relatedConversation?.last_message_preview || 'No recent message yet'}</dd>
                            </div>
                            <div>
                              <dt>Next action</dt>
                              <dd>{getNextAction(lead)}</dd>
                            </div>
                          </dl>

                          <div className="customer-request-actions">
                            {relatedConversation ? (
                              <Link to={`/customer/conversations?conversation=${relatedConversation.id}`} className="customer-conversation-link">
                                <MessageIcon size={14} />
                                Continue conversation
                              </Link>
                            ) : null}
                            {lead.business_slug ? (
                              <Link to={`/business/${lead.business_slug}`} className="marketplace-card-link">
                                View business
                              </Link>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </article>
              ))}
            </section>
          </>
        )}
      </div>
    </CustomerLayout>
  );
};

export default CustomerDashboard;
