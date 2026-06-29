import React, { useState, useEffect } from 'react';

const ServiceForm = ({ service, onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');

  useEffect(() => {
    if (service) {
      setName(service.name || '');
      setDescription(service.description || '');
      setBasePrice(service.base_price || '');
      setEstimatedDuration(service.estimated_duration || '');
    } else {
      setName('');
      setDescription('');
      setBasePrice('');
      setEstimatedDuration('');
    }
  }, [service]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name,
      description,
      base_price: basePrice,
      estimated_duration: estimatedDuration
    });
  };

  return (
    <form className="service-form" onSubmit={handleSubmit}>
      <h3 className="form-title">{service ? '✏️ Edit Service' : '➕ Add New Service'}</h3>
      
      <div className="form-group">
        <label className="form-label">Service Name *</label>
        <input 
          type="text" 
          className="form-input" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="e.g. Regular home cleaning" 
          required 
        />
      </div>

      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea 
          className="form-input text-area" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          placeholder="What does this service include?" 
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Base Price</label>
          <input 
            type="text" 
            className="form-input" 
            value={basePrice} 
            onChange={(e) => setBasePrice(e.target.value)} 
            placeholder="e.g. £40 or from £90" 
          />
        </div>

        <div className="form-group">
          <label className="form-label">Estimated Duration</label>
          <input 
            type="text" 
            className="form-input" 
            value={estimatedDuration} 
            onChange={(e) => setEstimatedDuration(e.target.value)} 
            placeholder="e.g. 2 hours" 
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary">{service ? 'Update' : 'Add Service'}</button>
      </div>
    </form>
  );
};

export default ServiceForm;
