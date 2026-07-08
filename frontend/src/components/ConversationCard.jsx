import React from 'react';
import { AlertIcon } from './Icons';

const ConversationCard = ({ conversation, isActive, onClick }) => {
  const getConfidenceColor = (score) => {
    if (score >= 0.8) return '#16A34A'; // Green
    if (score >= 0.6) return '#D97706'; // Yellow
    return '#DC2626'; // Red
  };

  return (
    <div 
      className={`conversation-card ${isActive ? 'active' : ''} ${conversation.needs_human_review ? 'needs-review' : ''}`}
      onClick={onClick}
    >
      <div className="conv-card-header">
        <h4 className="conv-customer-name">{conversation.customer_name || 'Anonymous Customer'}</h4>
        <span className="conv-time">
          {new Date(conversation.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {conversation.customer_phone && (
        <p className="conv-phone">{conversation.customer_phone}</p>
      )}

      <div className="conv-card-meta">
        <span className="conv-confidence">
          AI Confidence:{' '}
          <strong style={{ color: getConfidenceColor(conversation.ai_confidence) }}>
            {Math.round(conversation.ai_confidence * 100)}%
          </strong>
        </span>
        
        {conversation.needs_human_review && (
          <span className="review-badge animate-pulse" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
            <AlertIcon size={12} /> Needs Review
          </span>
        )}
      </div>
    </div>
  );
};

export default ConversationCard;
