import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ChatWidget from '../components/ChatWidget';
import { api } from '../services/api';

const Demo = () => {
  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDemoData = async () => {
      try {
        const bId = api.getDemoBusinessId();
        const [bData, sData, fData] = await Promise.all([
          api.getBusiness(bId),
          api.getServices(bId),
          api.getFAQs(bId)
        ]);
        setBusiness(bData);
        setServices(sData);
        setFaqs(fData);
      } catch (err) {
        console.error("Error loading demo business data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDemoData();
  }, []);

  if (isLoading) {
    return (
      <div className="demo-page">
        <Navbar />
        <div className="loading-container">Loading interactive demo...</div>
      </div>
    );
  }

  return (
    <div className="demo-page">
      <Navbar />

      <main className="demo-content">
        <div className="demo-grid-container">
          {/* Business Info Column */}
          <div className="demo-business-info">
            <span className="demo-tag">🟢 LIVE DEMO ENVIRONMENT</span>
            <h1 className="demo-business-title">{business?.name}</h1>
            <p className="demo-business-description">{business?.description}</p>
            
            <div className="demo-details-list">
              <div className="demo-detail-item">
                <strong>📍 Service Area:</strong> {business?.service_area}
              </div>
              <div className="demo-detail-item">
                <strong>📞 Phone:</strong> {business?.phone}
              </div>
              <div className="demo-detail-item">
                <strong>🕒 Hours:</strong> {business?.opening_hours}
              </div>
            </div>

            <h3 className="demo-section-title">Available Services</h3>
            <div className="demo-services-list">
              {services.map(s => (
                <div key={s.id} className="demo-service-item">
                  <div>
                    <strong>{s.name}</strong>
                    <p>{s.description}</p>
                  </div>
                  <span className="demo-service-price">{s.base_price}</span>
                </div>
              ))}
            </div>

            <h3 className="demo-section-title">Ask the AI questions like:</h3>
            <div className="demo-suggestions">
              <button onClick={() => {}} className="demo-suggestion-chip">“Do you bring cleaning supplies?”</button>
              <button onClick={() => {}} className="demo-suggestion-chip">“How much is deep cleaning?”</button>
              <button onClick={() => {}} className="demo-suggestion-chip">“I want to book regular cleaning on Monday”</button>
              <button onClick={() => {}} className="demo-suggestion-chip">“Can I cancel for free?”</button>
            </div>
          </div>

          {/* Interactive Chat Widget Column */}
          <div className="demo-chat-column">
            <div className="demo-chat-wrapper">
              <div className="demo-chat-info">
                <h3>Try Out the Widget</h3>
                <p>This is the customer view. Test the lead extraction by telling the AI your name, phone number, address, and requesting a booking!</p>
              </div>
              <ChatWidget businessId={business?.id} demoMode={true} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Demo;
