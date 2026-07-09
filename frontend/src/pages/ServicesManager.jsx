import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ServiceForm from '../components/ServiceForm';
import { api } from '../services/api';

const ServicesManager = () => {
  const [services, setServices] = useState([]);
  const [editingService, setEditingService] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [businessId, setBusinessId] = useState('');
  const [business, setBusiness] = useState(null);
  const navigate = useNavigate();

  const loadServices = async () => {
    try {
      const bData = await api.getBusinessOfCurrentUser();
      const targetId = bData.id;
      setBusinessId(targetId);
      setBusiness(bData);
      const data = await api.getServices(targetId);
      setServices(data);
    } catch (err) {
      console.error(err);
      navigate('/dashboard/business');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleAddSubmit = async (formData) => {
    try {
      await api.createService({ business_id: businessId, ...formData });
      setMessage('Service added successfully.');
      setIsAdding(false);
      loadServices();
    } catch (err) {
      console.error(err);
      setMessage('Failed to add service.');
    }
  };

  const handleEditSubmit = async (formData) => {
    try {
      await api.updateService(editingService.id, formData);
      setMessage('Service updated successfully.');
      setEditingService(null);
      loadServices();
    } catch (err) {
      console.error(err);
      setMessage('Failed to update service.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await api.deleteService(id);
      setMessage('Service deleted successfully.');
      loadServices();
    } catch (err) {
      console.error(err);
      setMessage('Failed to delete service.');
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-wrapper">
        <Sidebar />
        <div className="dashboard-content loading">Loading service gigs...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <Sidebar />

      <main className="dashboard-content">
        <header className="dashboard-header flex-header">
          <div>
            <span className="dashboard-welcome">Settings</span>
            <h1 className="dashboard-title">Service Gigs Manager</h1>
          </div>
          {!isAdding && !editingService && (
            <button className="btn-primary" onClick={() => setIsAdding(true)}>
              Create gig
            </button>
          )}
        </header>

        {message && <div className="form-message-alert success">{message}</div>}

        {!business?.is_public && (
          <div className="form-message-alert error" style={{ marginBottom: '1.5rem', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#B91C1C' }}>
            Publish your business profile before customers can discover your services.
          </div>
        )}

        <div className="service-publication-note">
          <div>
            <span className={`listing-status-pill ${business?.is_public ? 'published' : 'draft'}`}>
              Business Profile: {business?.is_public ? 'Published' : 'Draft'}
            </span>
            <h3>Marketplace status</h3>
            <p>
              {business?.is_public && business?.slug
                ? 'Your business profile is active. Any public gigs below can be discovered by customers.'
                : 'Your storefront is set to draft. Customers cannot discover any of your services until you publish.'}
            </p>
          </div>
          {business?.is_public && business?.slug ? (
            <Link className="marketplace-card-link" to={`/business/${business.slug}`}>
              View business storefront
            </Link>
          ) : (
            <Link className="marketplace-card-link" to="/dashboard/business">
              Publish your storefront profile
            </Link>
          )}
        </div>

        <div className="manager-layout">
          {(isAdding || editingService) && (
            <div className="form-side-container">
              <ServiceForm
                service={editingService}
                onSubmit={isAdding ? handleAddSubmit : handleEditSubmit}
                onCancel={() => {
                  setIsAdding(false);
                  setEditingService(null);
                }}
              />
            </div>
          )}

          <div className="list-side-container">
            <div className="services-grid-list">
              {services.length === 0 ? (
                <div className="empty-state" style={{ padding: '3.5rem 2rem', textAlign: 'center', width: '100%' }}>
                  <h3>No service gigs configured</h3>
                  <p style={{ color: 'var(--text-light-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    Create service gigs so customers can discover and book specific offers from the marketplace.
                  </p>
                  <button className="btn-primary" onClick={() => setIsAdding(true)}>
                    Create your first service gig
                  </button>
                </div>
              ) : (
                services.map(service => {
                  const gigSlug = service.slug || (service.name ? service.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '');
                  const previewUrl = business?.slug ? `/business/${business.slug}/book?service=${encodeURIComponent(service.name)}&serviceId=${service.id}` : null;
                  return (
                    <div key={service.id} className="manager-item-card">
                      <div className="item-card-details">
                        <div className="item-card-headline">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <h4>{service.name}</h4>
                            <span className={`listing-status-pill ${service.is_public !== false ? 'published' : 'draft'}`}>
                              {service.is_public !== false ? 'Published gig' : 'Private draft'}
                            </span>
                          </div>
                          <span className="item-price-tag">
                            {service.base_price || '0'} {service.price_unit || ''}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-light-secondary)', display: 'flex', gap: '1rem', margin: '0.2rem 0 0.5rem 0' }}>
                          {service.category ? <span>Category: {service.category}</span> : null}
                          {service.estimated_duration || service.duration_estimate ? (
                            <span>Duration: {service.estimated_duration || service.duration_estimate}</span>
                          ) : null}
                          {service.service_area ? <span>Area: {service.service_area}</span> : null}
                        </div>
                        {service.short_description ? (
                          <p className="item-card-description" style={{ fontStyle: 'italic', marginBottom: '0.25rem', fontSize: '0.8rem', color: '#6B7280' }}>
                            {service.short_description}
                          </p>
                        ) : null}
                        <p className="item-card-description">{service.description || service.long_description}</p>

                        {business?.is_public && service.is_public !== false && previewUrl ? (
                          <div style={{ marginTop: '0.75rem', fontSize: '0.8rem' }}>
                            <Link to={previewUrl} className="marketplace-card-link" style={{ fontSize: '0.8rem' }}>
                              Preview public booking page
                            </Link>
                          </div>
                        ) : null}
                      </div>
                      <div className="item-card-actions">
                        <button
                          className="btn-item-action edit"
                          onClick={() => {
                            setIsAdding(false);
                            setEditingService(service);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-item-action delete"
                          onClick={() => handleDelete(service.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ServicesManager;
