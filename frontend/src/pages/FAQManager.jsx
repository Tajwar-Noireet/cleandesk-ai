import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import FAQForm from '../components/FAQForm';
import { api } from '../services/api';

const FAQManager = () => {
  const [faqs, setFaqs] = useState([]);
  const [editingFaq, setEditingFaq] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadFAQs = async () => {
    try {
      const data = await api.getFAQs();
      setFaqs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFAQs();
  }, []);

  const handleAddSubmit = async (formData) => {
    try {
      await api.createFAQ(formData);
      setMessage('✅ FAQ added successfully!');
      setIsAdding(false);
      loadFAQs();
    } catch (err) {
      console.error(err);
      setMessage('❌ Failed to add FAQ.');
    }
  };

  const handleEditSubmit = async (formData) => {
    try {
      await api.updateFAQ(editingFaq.id, formData);
      setMessage('✅ FAQ updated successfully!');
      setEditingFaq(null);
      loadFAQs();
    } catch (err) {
      console.error(err);
      setMessage('❌ Failed to update FAQ.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      await api.deleteFAQ(id);
      setMessage('✅ FAQ deleted successfully!');
      loadFAQs();
    } catch (err) {
      console.error(err);
      setMessage('❌ Failed to delete FAQ.');
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-wrapper">
        <Sidebar />
        <div className="dashboard-content loading">Loading FAQs...</div>
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
            <h1 className="dashboard-title">FAQ Manager</h1>
          </div>
          {!isAdding && !editingFaq && (
            <button className="btn-primary" onClick={() => setIsAdding(true)}>
              ➕ Add FAQ
            </button>
          )}
        </header>

        {message && <div className="form-message-alert success">{message}</div>}

        <div className="manager-layout">
          {/* Form Side */}
          {(isAdding || editingFaq) && (
            <div className="form-side-container">
              <FAQForm
                faq={editingFaq}
                onSubmit={isAdding ? handleAddSubmit : handleEditSubmit}
                onCancel={() => {
                  setIsAdding(false);
                  setEditingFaq(null);
                }}
              />
            </div>
          )}

          {/* List Side */}
          <div className="list-side-container">
            <div className="faqs-grid-list">
              {faqs.length === 0 ? (
                <p className="no-data-msg">No FAQs loaded. AI receptionist will use defaults for general questions.</p>
              ) : (
                faqs.map(faq => (
                  <div key={faq.id} className="manager-item-card faq">
                    <div className="item-card-details">
                      <div className="faq-question-header">
                        <h4>❓ {faq.question}</h4>
                      </div>
                      <p className="faq-answer-content">{faq.answer}</p>
                    </div>
                    <div className="item-card-actions faq">
                      <button 
                        className="btn-item-action edit" 
                        onClick={() => {
                          setIsAdding(false);
                          setEditingFaq(faq);
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        className="btn-item-action delete" 
                        onClick={() => handleDelete(faq.id)}
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

export default FAQManager;
