import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';

const ChatWidget = ({ businessId, demoMode = false }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState([
    {
      id: 'm-init',
      sender: 'ai',
      content: 'Hello! I am your AI Receptionist. How can I help you today? You can ask about our pricing, services, or request a booking quote!',
      created_at: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  
  // Lead state tracking for display inside demo
  const [leadFields, setLeadFields] = useState({
    customer_name: null,
    customer_phone: null,
    address: null,
    service_type: null,
    preferred_date: null
  });

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage;
    setInputMessage('');

    // Append user message
    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'customer',
      content: userText,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const response = await api.sendMessage(userText, conversationId);
      
      // Update states
      if (response.conversationId) {
        setConversationId(response.conversationId);
      }
      
      setIsTyping(false);
      
      // Append AI message
      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`,
        sender: 'ai',
        content: response.reply,
        created_at: new Date().toISOString()
      }]);

      if (response.leadFields) {
        setLeadFields(prev => ({
          ...prev,
          ...response.leadFields
        }));
      }

    } catch (err) {
      console.error(err);
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        sender: 'ai',
        content: 'Sorry, I encountered an error. Please try again.',
        created_at: new Date().toISOString()
      }]);
    }
  };

  return (
    <div className={`chat-widget-container ${isOpen ? 'open' : 'closed'}`}>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button className="chat-widget-toggle" onClick={() => setIsOpen(true)}>
          💬 Ask AI Receptionist
        </button>
      )}

      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-header-info">
              <span className="chat-avatar">🤖</span>
              <div>
                <h4 className="chat-title">AI Receptionist</h4>
                <p className="chat-subtitle">SparkleHome Cleaning</p>
              </div>
            </div>
            <button className="chat-close-btn" onClick={() => setIsOpen(false)}>×</button>
          </div>

          <div className="chat-body">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-message ${msg.sender}`}>
                <div className="message-bubble">
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="chat-message ai">
                <div className="message-bubble typing">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-footer" onSubmit={handleSendMessage}>
            <input
              type="text"
              className="chat-input"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask a question or book a clean..."
              disabled={isTyping}
            />
            <button type="submit" className="chat-send-btn" disabled={isTyping}>
              Send
            </button>
          </form>

          {/* Special Demo Status Inspector (Visible on Demo Page) */}
          {demoMode && (
            <div className="demo-inspector">
              <h5>🔍 Lead Capture Inspector</h5>
              <div className="inspector-fields">
                <div className="inspector-field">
                  <span className="field-label">Name:</span> 
                  <span className={`field-value ${leadFields.customer_name ? 'detected' : ''}`}>
                    {leadFields.customer_name || 'Not detected'}
                  </span>
                </div>
                <div className="inspector-field">
                  <span className="field-label">Phone:</span> 
                  <span className={`field-value ${leadFields.customer_phone ? 'detected' : ''}`}>
                    {leadFields.customer_phone || 'Not detected'}
                  </span>
                </div>
                <div className="inspector-field">
                  <span className="field-label">Service:</span> 
                  <span className={`field-value ${leadFields.service_type ? 'detected' : ''}`}>
                    {leadFields.service_type || 'Not detected'}
                  </span>
                </div>
                <div className="inspector-field">
                  <span className="field-label">Address:</span> 
                  <span className={`field-value ${leadFields.address ? 'detected' : ''}`}>
                    {leadFields.address || 'Not detected'}
                  </span>
                </div>
                <div className="inspector-field">
                  <span className="field-label">Date:</span> 
                  <span className={`field-value ${leadFields.preferred_date ? 'detected' : ''}`}>
                    {leadFields.preferred_date || 'Not detected'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
