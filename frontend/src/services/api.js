// Client API Services for CleanDesk AI
// Connects to the Express backend.
import { supabase } from '../supabaseClient';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const DEMO_BUSINESS_ID = 'd3b07384-d113-4ec5-a5d6-c6e7f8d9a101';

// Fallback mock data if the backend is offline
const frontendFallbackData = {
  business: {
    id: DEMO_BUSINESS_ID,
    name: 'SparkleHome Cleaning',
    phone: '+44 20 7946 0958',
    email: 'info@sparklehome.co.uk',
    service_area: 'Greater London, Zone 1-4',
    opening_hours: 'Mon-Fri: 8:00 AM - 6:00 PM, Sat: 9:00 AM - 4:00 PM',
    description: 'Professional, eco-friendly home cleaning service in London. Specialized in regular cleaning, deep cleans, and end of tenancy services.'
  },
  services: [
    { id: 's1', name: 'Regular home cleaning', description: 'Standard dusting, vacuuming, mopping.', base_price: '£40', estimated_duration: '2 hours' },
    { id: 's2', name: 'Deep cleaning', description: 'In-depth cleaning including baseboards and heavy scrub.', base_price: '£90', estimated_duration: '4 hours' },
    { id: 's3', name: 'Move-out cleaning', description: 'Full end of tenancy clean to satisfy landlords.', base_price: '£120', estimated_duration: '5 hours' },
    { id: 's4', name: 'Office cleaning', description: 'Commercial space sanitization.', base_price: 'custom quote', estimated_duration: 'variable' },
    { id: 's5', name: 'Carpet cleaning', description: 'Hot water extraction deep cleaning.', base_price: '£35 per room', estimated_duration: '1.5 hours' }
  ],
  faqs: [
    { id: 'f1', question: 'Do you bring cleaning supplies?', answer: 'Yes, our team brings all standard supplies and equipment at no extra cost.' },
    { id: 'f2', question: 'What areas do you cover?', answer: 'We cover Greater London area (Zones 1-4).' },
    { id: 'f3', question: 'Can I reschedule?', answer: 'Yes, for free up to 24 hours in advance.' }
  ],
  leads: [
    { id: 'l1', customer_name: 'Sarah Jenkins', customer_phone: '+44 7700 900077', address: '12 Wembley Park Dr', service_type: 'Deep cleaning', preferred_date: 'This Saturday', status: 'new', created_at: new Date().toISOString() }
  ],
  conversations: [
    { id: 'c1', customer_name: 'Sarah Jenkins', customer_phone: '+44 7700 900077', status: 'open', ai_confidence: 0.88, needs_human_review: false, created_at: new Date().toISOString() }
  ]
};

// Generic API caller with fallback
const apiCall = async (endpoint, options = {}) => {
  try {
    let token = 'mock-token';
    const isSupabaseConfigured = 
      import.meta.env.VITE_SUPABASE_URL && 
      import.meta.env.VITE_SUPABASE_URL !== 'https://your-project.supabase.co';

    if (isSupabaseConfigured) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.access_token) {
        token = session.access_token;
      }
    }

    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      }
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn(`API call failed for ${endpoint}: ${error.message}. Running in offline frontend mode.`);
    throw error;
  }
};

export const api = {
  getDemoBusinessId: () => DEMO_BUSINESS_ID,

  // Business
  getBusinessOfCurrentUser: async () => {
    return await apiCall('/api/business/me');
  },
  createBusiness: async (data) => {
    try {
      return await apiCall('/api/business', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch {
      frontendFallbackData.business = { id: `b-${Date.now()}`, ...data };
      return frontendFallbackData.business;
    }
  },
  getBusiness: async (id = DEMO_BUSINESS_ID) => {
    try {
      return await apiCall(`/api/business/${id}`);
    } catch {
      return frontendFallbackData.business;
    }
  },
  updateBusiness: async (id = DEMO_BUSINESS_ID, data) => {
    try {
      return await apiCall(`/api/business/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    } catch {
      frontendFallbackData.business = { ...frontendFallbackData.business, ...data };
      return frontendFallbackData.business;
    }
  },

  // Services
  getServices: async (businessId = DEMO_BUSINESS_ID) => {
    try {
      return await apiCall(`/api/services/${businessId}`);
    } catch {
      return frontendFallbackData.services;
    }
  },
  createService: async (serviceData) => {
    try {
      return await apiCall('/api/services', {
        method: 'POST',
        body: JSON.stringify({ business_id: DEMO_BUSINESS_ID, ...serviceData })
      });
    } catch {
      const newService = { id: `s-${Date.now()}`, ...serviceData };
      frontendFallbackData.services.push(newService);
      return newService;
    }
  },
  updateService: async (id, serviceData) => {
    try {
      return await apiCall(`/api/services/${id}`, {
        method: 'PUT',
        body: JSON.stringify(serviceData)
      });
    } catch {
      const idx = frontendFallbackData.services.findIndex(s => s.id === id);
      if (idx !== -1) {
        frontendFallbackData.services[idx] = { ...frontendFallbackData.services[idx], ...serviceData };
        return frontendFallbackData.services[idx];
      }
      return null;
    }
  },
  deleteService: async (id) => {
    try {
      return await apiCall(`/api/services/${id}`, { method: 'DELETE' });
    } catch {
      frontendFallbackData.services = frontendFallbackData.services.filter(s => s.id !== id);
      return { success: true };
    }
  },

  // FAQs
  getFAQs: async (businessId = DEMO_BUSINESS_ID) => {
    try {
      return await apiCall(`/api/faqs/${businessId}`);
    } catch {
      return frontendFallbackData.faqs;
    }
  },
  createFAQ: async (faqData) => {
    try {
      return await apiCall('/api/faqs', {
        method: 'POST',
        body: JSON.stringify({ business_id: DEMO_BUSINESS_ID, ...faqData })
      });
    } catch {
      const newFaq = { id: `f-${Date.now()}`, ...faqData };
      frontendFallbackData.faqs.push(newFaq);
      return newFaq;
    }
  },
  updateFAQ: async (id, faqData) => {
    try {
      return await apiCall(`/api/faqs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(faqData)
      });
    } catch {
      const idx = frontendFallbackData.faqs.findIndex(f => f.id === id);
      if (idx !== -1) {
        frontendFallbackData.faqs[idx] = { ...frontendFallbackData.faqs[idx], ...faqData };
        return frontendFallbackData.faqs[idx];
      }
      return null;
    }
  },
  deleteFAQ: async (id) => {
    try {
      return await apiCall(`/api/faqs/${id}`, { method: 'DELETE' });
    } catch {
      frontendFallbackData.faqs = frontendFallbackData.faqs.filter(f => f.id !== id);
      return { success: true };
    }
  },

  // Chat
  sendMessage: async (message, conversationId = null) => {
    try {
      return await apiCall('/api/chat/message', {
        method: 'POST',
        body: JSON.stringify({
          businessId: DEMO_BUSINESS_ID,
          conversationId,
          message
        })
      });
    } catch (error) {
      // Inline simple JS chatbot response if backend is fully offline
      const reply = `[Offline Mode] Thanks for your message: "${message}". Connect the backend server to enable real-time AI capabilities!`;
      return {
        conversationId: conversationId || `c-offline-${Date.now()}`,
        reply,
        intent: 'general_question',
        confidence: 0.90,
        needsHumanReview: false,
        leadCaptureStatus: 'none',
        leadFields: {}
      };
    }
  },

  // Leads
  getLeads: async (businessId = DEMO_BUSINESS_ID) => {
    try {
      return await apiCall(`/api/leads/${businessId}`);
    } catch {
      return frontendFallbackData.leads;
    }
  },
  updateLeadStatus: async (id, status) => {
    try {
      return await apiCall(`/api/leads/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
    } catch {
      const idx = frontendFallbackData.leads.findIndex(l => l.id === id);
      if (idx !== -1) {
        frontendFallbackData.leads[idx].status = status;
        return frontendFallbackData.leads[idx];
      }
      return null;
    }
  },

  // Conversations
  getConversations: async (businessId = DEMO_BUSINESS_ID) => {
    try {
      return await apiCall(`/api/conversations/${businessId}`);
    } catch {
      return frontendFallbackData.conversations;
    }
  },
  getConversationDetail: async (conversationId) => {
    try {
      return await apiCall(`/api/conversations/detail/${conversationId}`);
    } catch {
      // Simulate detailing
      const conversation = frontendFallbackData.conversations.find(c => c.id === conversationId) || {
        id: conversationId,
        customer_name: 'Sarah Jenkins',
        customer_phone: '+44 7700 900077',
        status: 'open',
        ai_confidence: 0.88,
        needs_human_review: false
      };
      return {
        ...conversation,
        messages: [
          { id: 'm1', sender: 'customer', content: 'Hi, I need a deep clean.', created_at: new Date().toISOString() },
          { id: 'm2', sender: 'ai', content: 'Hello! I can definitely help. Could you please share your name?', created_at: new Date().toISOString() }
        ]
      };
    }
  }
};
