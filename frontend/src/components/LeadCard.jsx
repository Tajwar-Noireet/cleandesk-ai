import React from 'react';
import { Link } from 'react-router-dom';
import { UserIcon, ShieldIcon, CheckIcon, CalendarIcon } from './Icons';

const LeadCard = ({ lead, onStatusChange }) => {
  const getStatusClass = (status) => {
    switch (status) {
      case 'new': return 'status-badge new';
      case 'contacted': return 'status-badge contacted';
      case 'booked': return 'status-badge booked';
      case 'lost': return 'status-badge lost';
      default: return 'status-badge';
    }
  };

  return (
    <div className="lead-card">
      <div className="lead-card-header">
        <div>
          <h3 className="lead-customer-name">{lead.customer_name || 'Anonymous'}</h3>
          <p className="lead-date">Captured: {new Date(lead.created_at).toLocaleDateString()}</p>
        </div>
        <select 
          className={getStatusClass(lead.status)}
          value={lead.status}
          onChange={(e) => onStatusChange(lead.id, e.target.value)}
        >
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="booked">Booked</option>
          <option value="lost">Lost</option>
        </select>
      </div>

      <div className="lead-card-details">
        <div className="lead-detail-item">
          <span className="lead-icon"><UserIcon size={14} /></span>
          <span>{lead.customer_phone || 'No phone captured'}</span>
        </div>
        {lead.address && (
          <div className="lead-detail-item">
            <span className="lead-icon"><ShieldIcon size={14} /></span>
            <span>{lead.address}</span>
          </div>
        )}
        {lead.service_type && (
          <div className="lead-detail-item">
            <span className="lead-icon"><CheckIcon size={14} /></span>
            <span><strong>Service:</strong> {lead.service_type}</span>
          </div>
        )}
        {lead.preferred_date && (
          <div className="lead-detail-item">
            <span className="lead-icon"><CalendarIcon size={14} /></span>
            <span><strong>Date:</strong> {lead.preferred_date}</span>
          </div>
        )}
        {lead.notes && (
          <div className="lead-detail-notes">
            <strong>Notes:</strong> {lead.notes}
          </div>
        )}

        {lead.latest_message_preview ? (
          <div className="lead-message-preview">
            <strong>Latest message</strong>
            <span>{lead.latest_message_sender ? `${lead.latest_message_sender}: ` : ''}{lead.latest_message_preview}</span>
          </div>
        ) : null}

        {lead.conversation_id ? (
          <div className="lead-card-actions">
            <Link to={`/dashboard/conversations?conversation=${lead.conversation_id}`} className="btn-secondary small-action">
              Open conversation
            </Link>
            {lead.conversation_needs_human_review ? (
              <span className="review-badge">Needs review</span>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default LeadCard;
