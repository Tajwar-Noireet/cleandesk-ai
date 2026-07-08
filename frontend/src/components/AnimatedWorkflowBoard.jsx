import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import MotionCard from './MotionCard';

const steps = [
  {
    label: 'Enquiry',
    title: 'Incoming Enquiry',
    desc: 'Customer sends request via widget',
    badge: 'badge-blue',
    content: (
      <div className="preview-card-body">
        <div className="card-badge badge-blue">Enquiry</div>
        <p className="card-body">"Looking for regular domestic cleaning weekly from Friday. Can you quote?"</p>
        <div className="card-meta">Web Chat • Just now</div>
      </div>
    )
  },
  {
    label: 'Knowledge Match',
    title: 'Service Matched',
    desc: 'Pricing catalog looked up automatically',
    badge: 'badge-gray',
    content: (
      <div className="preview-card-body">
        <div className="card-badge badge-gray">Knowledge Base</div>
        <div className="match-item">
          <span>Service: Domestic Clean</span>
          <strong>£16/hr</strong>
        </div>
        <div className="match-item">
          <span>Availability: Fridays</span>
          <strong>Available</strong>
        </div>
      </div>
    )
  },
  {
    label: 'Lead Capture',
    title: 'Lead Captured',
    desc: 'Checklist checklist attributes validated',
    badge: 'badge-green',
    content: (
      <div className="preview-card-body">
        <div className="card-badge badge-green">Lead Checklist</div>
        <div className="captured-slot" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="20 6 9 17 4 12"/></svg>
          Service: Weekly Domestic
        </div>
        <div className="captured-slot" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="20 6 9 17 4 12"/></svg>
          Day: Friday
        </div>
        <div className="captured-slot" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-gray-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>
          Details Requested
        </div>
      </div>
    )
  },
  {
    label: 'Takeover',
    title: 'Owner Review',
    desc: 'Sentiment flagged for custom rules',
    badge: 'badge-amber',
    content: (
      <div className="preview-card-body">
        <div className="card-badge badge-amber">Sentiment Flag</div>
        <p className="card-body">"Client requests custom stain details. Escalated to owner review."</p>
        <div className="escalation-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0 -3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          Flagged for Takeover
        </div>
      </div>
    )
  },
  {
    label: 'Booked',
    title: 'Job Created',
    desc: 'Confirmed ticket ready for sync',
    badge: 'badge-black',
    content: (
      <div className="preview-card-body">
        <div className="card-badge badge-black">Job Created</div>
        <div className="job-ticket">
          <strong>Weekly Clean</strong>
          <span>£16/hr • Friday 10:00</span>
        </div>
        <div className="ticket-status-pill">Pending Confirmation</div>
      </div>
    )
  }
];

const AnimatedWorkflowBoard = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="workflow-board-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="workflow-board-header">
        <h4>Customer Capture Pipeline</h4>
        <div className="pipeline-legend">
          <span className="dot pulse green"></span>
          <span>Click steps to preview workflow</span>
        </div>
      </div>

      {/* Steps Row (Interactive Buttons) */}
      <div className="workflow-steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
        {steps.map((step, i) => {
          const isActive = activeIndex === i;
          return (
            <MotionCard
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`workflow-step-btn ${isActive ? 'active-step-card' : ''}`}
              style={{
                padding: '1rem',
                border: '1px solid',
                borderColor: isActive ? '#2563EB' : 'var(--color-border)',
                borderRadius: '8px',
                background: isActive ? '#FFFFFF' : '#F1F1EF',
                cursor: 'pointer',
                textAlign: 'left',
                outline: 'none'
              }}
            >
              <span className={`card-badge ${step.badge}`} style={{ fontSize: '0.6rem' }}>{step.label}</span>
              <h5 style={{ margin: '0.5rem 0 0.25rem 0', fontSize: '0.85rem', fontWeight: 600, color: '#0A0A0A' }}>{step.title}</h5>
              <p style={{ margin: 0, fontSize: '0.7rem', color: '#6B7280', lineHeight: 1.3 }}>{step.desc}</p>
            </MotionCard>
          );
        })}
      </div>

      {/* Progress Line */}
      <div className="workflow-progress-line-wrapper" style={{ position: 'relative', height: '4px', background: 'var(--color-border)', borderRadius: '2px', margin: '0.5rem 0' }}>
        <motion.div
          className="workflow-progress-line-fill"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            background: '#2563EB',
            borderRadius: '2px'
          }}
          animate={{ width: `${(activeIndex / 4) * 100}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 18 }}
        />
      </div>

      {/* Preview Section */}
      <div
        className="workflow-preview-viewport"
        style={{
          background: '#FFFFFF',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          padding: '2.5rem',
          minHeight: '160px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.02)'
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{ width: '100%', maxWidth: '480px' }}
          >
            {steps[activeIndex].content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AnimatedWorkflowBoard;
