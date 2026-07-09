import React, { useState, useEffect } from 'react';

const ServiceForm = ({ service, onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [priceUnit, setPriceUnit] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [serviceArea, setServiceArea] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);

  useEffect(() => {
    if (service) {
      setName(service.name || '');
      setSlug(service.slug || '');
      setCategory(service.category || '');
      setShortDescription(service.short_description || '');
      setDescription(service.description || service.long_description || '');
      setBasePrice(service.base_price || '');
      setPriceUnit(service.price_unit || '');
      setEstimatedDuration(service.estimated_duration || service.duration_estimate || '');
      setServiceArea(service.service_area || '');
      setIsPublic(service.is_public !== false);
      setSortOrder(service.sort_order || 0);
    } else {
      setName('');
      setSlug('');
      setCategory('');
      setShortDescription('');
      setDescription('');
      setBasePrice('');
      setPriceUnit('');
      setEstimatedDuration('');
      setServiceArea('');
      setIsPublic(true);
      setSortOrder(0);
    }
  }, [service]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      slug: slug.trim() || null,
      category: category.trim() || null,
      short_description: shortDescription.trim() || null,
      description: description.trim() || null,
      base_price: basePrice.trim() || null,
      price_unit: priceUnit.trim() || null,
      estimated_duration: estimatedDuration.trim() || null,
      service_area: serviceArea.trim() || null,
      is_public: isPublic,
      sort_order: parseInt(sortOrder, 10) || 0
    });
  };

  return (
    <form className="service-form" onSubmit={handleSubmit}>
      <h3 className="form-title">{service ? 'Edit Service Gig' : 'Add New Service Gig'}</h3>

      <div className="form-group">
        <label className="form-label" htmlFor="gig-name">Service Name *</label>
        <input
          id="gig-name"
          type="text"
          className="form-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Deep kitchen cleaning"
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="gig-slug">Slug (Optional)</label>
          <input
            id="gig-slug"
            type="text"
            className="form-input"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            placeholder="e.g. deep-kitchen-cleaning"
          />
          <p className="form-help-text">Leave blank to auto-generate from name.</p>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="gig-category">Category</label>
          <input
            id="gig-category"
            type="text"
            className="form-input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Kitchen, Handyman, Maths"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="gig-short-desc">Short Description</label>
        <input
          id="gig-short-desc"
          type="text"
          className="form-input"
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          placeholder="Brief one-line summary for listing search results"
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="gig-long-desc">Detailed Description</label>
        <textarea
          id="gig-long-desc"
          className="form-input text-area"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What does this service gig include? Specify deliverables, exclusions, etc."
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="gig-price">Base Price</label>
          <input
            id="gig-price"
            type="text"
            className="form-input"
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
            placeholder="e.g. 40 or 95"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="gig-price-unit">Price Unit</label>
          <input
            id="gig-price-unit"
            type="text"
            className="form-input"
            value={priceUnit}
            onChange={(e) => setPriceUnit(e.target.value)}
            placeholder="e.g. GBP, USD, per hour, flat rate"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="gig-duration">Duration Estimate</label>
          <input
            id="gig-duration"
            type="text"
            className="form-input"
            value={estimatedDuration}
            onChange={(e) => setEstimatedDuration(e.target.value)}
            placeholder="e.g. 2 hours"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="gig-area">Service Area</label>
          <input
            id="gig-area"
            type="text"
            className="form-input"
            value={serviceArea}
            onChange={(e) => setServiceArea(e.target.value)}
            placeholder="e.g. Camden, Online only"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="gig-sort">Sort Order</label>
          <input
            id="gig-sort"
            type="number"
            className="form-input"
            value={sortOrder}
            onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
            placeholder="0"
          />
        </div>

        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.8rem' }}>
          <input
            id="gig-is-public"
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <label htmlFor="gig-is-public" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>
            Publish Gig on Marketplace
          </label>
        </div>
      </div>

      <div className="form-actions" style={{ marginTop: '1.5rem' }}>
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary">{service ? 'Update Gig' : 'Create Gig'}</button>
      </div>
    </form>
  );
};

export default ServiceForm;
