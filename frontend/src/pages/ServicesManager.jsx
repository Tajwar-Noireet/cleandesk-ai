import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ServiceForm from '../components/ServiceForm';
import { api } from '../services/api';

const ServicesManager = () => {
  const [services, setServices] = useState([]);
  const [editingService, setEditingService] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadServices = async () => {
    try {
      const data = await api.getServices();
      setServices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleAddSubmit = async (formData) => {
    try {
      await api.createService(formData);
      setMessage('✅ Service added successfully!');
      setIsAdding(false);
      loadServices();
    } catch (err) {
      console.error(err);
      setMessage('❌ Failed to add service.');
    }
  };

  const handleEditSubmit = async (formData) => {
    try {
      await api.updateService(editingService.id, formData);
      setMessage('✅ Service updated successfully!');
      setEditingService(null);
      loadServices();
    } catch (err) {
      console.error(err);
      setMessage('❌ Failed to update service.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await api.deleteService(id);
      setMessage('✅ Service deleted successfully!');
      loadServices();
    } catch (err) {
      console.error(err);
      setMessage('❌ Failed to delete service.');
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-wrapper">
        <Sidebar />
        <div className="dashboard-content loading">Loading services...</div>
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
            <h1 className="dashboard-title">Services Manager</h1>
          </div>
          {!isAdding && !editingService && (
            <button className="btn-primary" onClick={() => setIsAdding(true)}>
              ➕ Add Service
            </button>
          )}
        </header>

        {message && <div className="form-message-alert success">{message}</div>}

        <div className="manager-layout">
          {/* Form Side */}
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

          {/* List Side */}
          <div className="list-side-container">
            <div className="services-grid-list">
              {services.length === 0 ? (
                <p className="no-data-msg">No services configured. The AI will not be able to answer pricing questions.</p>
              ) : (
                services.map(service => (
                  <div key={service.id} className="manager-item-card">
                    <div className="item-card-details">
                      <div className="item-card-headline">
                        <h4>{service.name}</h4>
                        <span className="item-price-tag">{service.base_price}</span>
                      </div>
                      <p className="item-duration-tag">⏱️ Estimated duration: {service.estimated_duration}</p>
                      <p className="item-card-description">{service.description}</p>
                    </div>
                    <div className="item-card-actions">
                      <button 
                        className="btn-item-action edit" 
                        onClick={() => {
                          setIsAdding(false);
                          setEditingService(service);
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        className="btn-item-action delete" 
                        onClick={() => handleDelete(service.id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ServicesManager;
