import React, { useState, useEffect } from 'react';

const FAQForm = ({ faq, onSubmit, onCancel }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  useEffect(() => {
    if (faq) {
      setQuestion(faq.question || '');
      setAnswer(faq.answer || '');
    } else {
      setQuestion('');
      setAnswer('');
    }
  }, [faq]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;
    onSubmit({ question, answer });
  };

  return (
    <form className="faq-form" onSubmit={handleSubmit}>
      <h3 className="form-title">{faq ? 'Edit FAQ' : 'Add New FAQ'}</h3>
      
      <div className="form-group">
        <label className="form-label">Question *</label>
        <input 
          type="text" 
          className="form-input" 
          value={question} 
          onChange={(e) => setQuestion(e.target.value)} 
          placeholder="e.g. Do you bring cleaning supplies?" 
          required 
        />
      </div>

      <div className="form-group">
        <label className="form-label">Answer *</label>
        <textarea 
          className="form-input text-area" 
          value={answer} 
          onChange={(e) => setAnswer(e.target.value)} 
          placeholder="Answer provided to customers by the AI..." 
          required 
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary">{faq ? 'Update' : 'Add FAQ'}</button>
      </div>
    </form>
  );
};

export default FAQForm;
