import React from 'react';

const StatCard = ({ title, value, icon, description, badgeText, badgeType }) => {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        <span className="stat-card-icon">{icon}</span>
      </div>
      <div className="stat-card-body">
        <h2 className="stat-card-value">{value}</h2>
        <div className="stat-card-footer">
          {badgeText && (
            <span className={`stat-card-badge ${badgeType || ''}`}>
              {badgeText}
            </span>
          )}
          {description && <span className="stat-card-desc">{description}</span>}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
