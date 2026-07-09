// Client API Services for CleanDesk AI
// Connects to the Express backend.
import { supabase } from '../supabaseClient';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const DEMO_BUSINESS_ID = 'd3b07384-d113-4ec5-a5d6-c6e7f8d9a101';

// Fallback mock data if the backend is offline
const frontendFallbackData = {
  businesses: [
    {
      id: DEMO_BUSINESS_ID,
      name: 'SparkleHome Cleaning',
      slug: 'sparklehome-cleaning',
      phone: '+44 20 7946 0958',
      email: 'info@sparklehome.co.uk',
      service_area: 'Greater London, Zones 1-4',
      opening_hours: 'Mon-Fri: 8:00 AM - 6:00 PM, Sat: 9:00 AM - 4:00 PM',
      description: 'Professional, eco-friendly home cleaning service in London. Specialized in regular cleaning, deep cleans, and end of tenancy services.',
      is_public: true,
      category: 'Home cleaning',
      city: 'London',
      postcode: 'SW1',
      public_description: 'Eco-friendly domestic and end-of-tenancy cleaning across central London.',
      rating: 4.8,
      logo_url: null
    },
    {
      id: 'e4b07384-d113-4ec5-a5d6-c6e7f8d9a202',
      name: 'FreshFix Repairs',
      slug: 'freshfix-repairs',
      phone: '+44 20 7946 1200',
      email: 'hello@freshfix.example',
      service_area: 'North and East London',
      opening_hours: 'Mon-Sat: 8:00 AM - 7:00 PM',
      description: 'Local handyman and repair team handling plumbing, electrical, assembly, and urgent home maintenance jobs.',
      is_public: true,
      category: 'Home repairs',
      city: 'London',
      postcode: 'N1',
      public_description: 'Reliable same-week repair visits for busy households and landlords.',
      rating: 4.7,
      logo_url: null
    },
    {
      id: 'f5b07384-d113-4ec5-a5d6-c6e7f8d9a303',
      name: 'BrightPath Tutors',
      slug: 'brightpath-tutors',
      phone: '+44 20 7946 1300',
      email: 'support@brightpath.example',
      service_area: 'Online and Greater London',
      opening_hours: 'Mon-Fri: 3:00 PM - 9:00 PM, Sat: 10:00 AM - 2:00 PM',
      description: 'Private tutoring for primary, GCSE, A-Level, and exam preparation with online and in-home options.',
      is_public: true,
      category: 'Tutoring',
      city: 'London',
      postcode: 'E2',
      public_description: 'Vetted tutors for maths, English, sciences, and exam confidence.',
      rating: 4.9,
      logo_url: null
    }
  ],
  business: {
    id: DEMO_BUSINESS_ID,
    name: 'SparkleHome Cleaning',
    slug: 'sparklehome-cleaning',
    phone: '+44 20 7946 0958',
    email: 'info@sparklehome.co.uk',
    service_area: 'Greater London, Zones 1-4',
    opening_hours: 'Mon-Fri: 8:00 AM - 6:00 PM, Sat: 9:00 AM - 4:00 PM',
    description: 'Professional, eco-friendly home cleaning service in London. Specialized in regular cleaning, deep cleans, and end of tenancy services.',
    is_public: true,
    category: 'Home cleaning',
    city: 'London',
    postcode: 'SW1',
    public_description: 'Eco-friendly domestic and end-of-tenancy cleaning across central London.',
    rating: 4.8,
    logo_url: null
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
    { id: 'l1', business_id: DEMO_BUSINESS_ID, conversation_id: 'c1', customer_name: 'Sarah Jenkins', customer_phone: '+44 7700 900077', customer_email: 'sarah@jenkins.com', customer_user_id: null, address: '12 Wembley Park Dr', service_type: 'Deep cleaning', preferred_date: 'This Saturday', status: 'new', created_at: new Date().toISOString() },
    { id: 'l2', business_id: 'e4b07384-d113-4ec5-a5d6-c6e7f8d9a202', conversation_id: 'c2', customer_name: 'Sarah Jenkins', customer_phone: '+44 7700 900077', customer_email: 'sarah@jenkins.com', customer_user_id: null, address: '45 Camden High St, London', service_type: 'Boiler repair', preferred_date: 'Tomorrow afternoon', status: 'contacted', created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: 'l3', business_id: 'f5b07384-d113-4ec5-a5d6-c6e7f8d9a303', conversation_id: 'c3', customer_name: 'Sarah Jenkins', customer_phone: '+44 7700 900077', customer_email: 'sarah@jenkins.com', customer_user_id: null, address: 'Online session', service_type: 'Maths tutoring', preferred_date: 'Weekday evenings', status: 'new', created_at: new Date(Date.now() - 1800000).toISOString() },
    { id: 'l4', business_id: 'e4b07384-d113-4ec5-a5d6-c6e7f8d9a202', conversation_id: 'c4', customer_name: 'Alex Rivera', customer_phone: '+44 7700 900111', customer_email: 'alex@example.com', customer_user_id: null, address: '22 Hackney Road, London', service_type: 'Tap repair', preferred_date: 'Friday morning', status: 'new', created_at: new Date(Date.now() - 2400000).toISOString() }
  ],
  conversations: [
    { id: 'c1', business_id: DEMO_BUSINESS_ID, customer_name: 'Sarah Jenkins', customer_phone: '+44 7700 900077', customer_email: 'sarah@jenkins.com', customer_user_id: null, status: 'open', needs_human_review: false, created_at: new Date().toISOString() },
    { id: 'c2', business_id: 'e4b07384-d113-4ec5-a5d6-c6e7f8d9a202', customer_name: 'Sarah Jenkins', customer_phone: '+44 7700 900077', customer_email: 'sarah@jenkins.com', customer_user_id: null, status: 'open', needs_human_review: false, created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: 'c3', business_id: 'f5b07384-d113-4ec5-a5d6-c6e7f8d9a303', customer_name: 'Sarah Jenkins', customer_phone: '+44 7700 900077', customer_email: 'sarah@jenkins.com', customer_user_id: null, status: 'open', needs_human_review: false, created_at: new Date(Date.now() - 1800000).toISOString() },
    { id: 'c4', business_id: 'e4b07384-d113-4ec5-a5d6-c6e7f8d9a202', customer_name: 'Alex Rivera', customer_phone: '+44 7700 900111', customer_email: 'alex@example.com', customer_user_id: null, status: 'open', needs_human_review: false, created_at: new Date(Date.now() - 2400000).toISOString() }
  ],
  messages: [
    { id: 'm1', conversation_id: 'c1', sender: 'customer', content: 'Hi, I need a deep clean.', created_at: new Date().toISOString() },
    { id: 'm2', conversation_id: 'c1', sender: 'ai', content: 'SparkleHome Cleaning has received your request for a deep clean.', created_at: new Date(Date.now() + 1000).toISOString() },
    { id: 'm3', conversation_id: 'c2', sender: 'customer', content: 'The boiler is making a loud noise and needs a repair visit.', created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: 'm4', conversation_id: 'c2', sender: 'ai', content: 'FreshFix Repairs has received the boiler repair request.', created_at: new Date(Date.now() - 3500000).toISOString() },
    { id: 'm5', conversation_id: 'c3', sender: 'customer', content: 'I need maths tutoring for GCSE revision on weekday evenings.', created_at: new Date(Date.now() - 1800000).toISOString() },
    { id: 'm6', conversation_id: 'c3', sender: 'ai', content: 'BrightPath Tutors has received the maths tutoring enquiry.', created_at: new Date(Date.now() - 1700000).toISOString() },
    { id: 'm7', conversation_id: 'c4', sender: 'customer', content: 'Can someone repair a leaking tap this week?', created_at: new Date(Date.now() - 2400000).toISOString() }
  ]
};

frontendFallbackData.services.forEach((service) => {
  if (!service.business_id) service.business_id = DEMO_BUSINESS_ID;
});

frontendFallbackData.faqs.forEach((faq) => {
  if (!faq.business_id) faq.business_id = DEMO_BUSINESS_ID;
});

frontendFallbackData.services.push(
  { id: 'ff-s1', business_id: 'e4b07384-d113-4ec5-a5d6-c6e7f8d9a202', name: 'General repair visit', description: 'Small household repairs, fixtures, fittings, and maintenance tasks.', base_price: 'GBP 65 callout', estimated_duration: '1-2 hours' },
  { id: 'ff-s2', business_id: 'e4b07384-d113-4ec5-a5d6-c6e7f8d9a202', name: 'Emergency plumbing support', description: 'Leak checks, blocked sinks, toilet repairs, and urgent plumbing triage.', base_price: 'From GBP 95', estimated_duration: 'Same day' },
  { id: 'ff-s3', business_id: 'e4b07384-d113-4ec5-a5d6-c6e7f8d9a202', name: 'Furniture assembly', description: 'Flat-pack assembly, shelving, curtain rails, and wall mounting.', base_price: 'From GBP 55', estimated_duration: '2 hours' },
  { id: 'bp-s1', business_id: 'f5b07384-d113-4ec5-a5d6-c6e7f8d9a303', name: 'GCSE maths tutoring', description: 'One-to-one maths support with weekly progress notes.', base_price: 'GBP 35/hour', estimated_duration: '1 hour' },
  { id: 'bp-s2', business_id: 'f5b07384-d113-4ec5-a5d6-c6e7f8d9a303', name: 'English exam preparation', description: 'Reading, writing, and exam technique coaching.', base_price: 'GBP 32/hour', estimated_duration: '1 hour' },
  { id: 'bp-s3', business_id: 'f5b07384-d113-4ec5-a5d6-c6e7f8d9a303', name: 'A-Level science tutoring', description: 'Biology, chemistry, and physics tutoring for sixth-form students.', base_price: 'GBP 45/hour', estimated_duration: '1 hour' }
);

frontendFallbackData.faqs.push(
  { id: 'ff-f1', business_id: 'e4b07384-d113-4ec5-a5d6-c6e7f8d9a202', question: 'Can I book urgent repairs?', answer: 'Yes, same-day appointments are offered when there is engineer availability.' },
  { id: 'ff-f2', business_id: 'e4b07384-d113-4ec5-a5d6-c6e7f8d9a202', question: 'Do you bring parts?', answer: 'Common fittings are carried, and specialist parts can be sourced after inspection.' },
  { id: 'bp-f1', business_id: 'f5b07384-d113-4ec5-a5d6-c6e7f8d9a303', question: 'Do you offer online tutoring?', answer: 'Yes, all subjects can be delivered online or in person where coverage allows.' },
  { id: 'bp-f2', business_id: 'f5b07384-d113-4ec5-a5d6-c6e7f8d9a303', question: 'Can parents track progress?', answer: 'Yes, tutors provide progress notes after each session.' }
);

const normalizeFrontendSlug = (value) =>
  (value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const upsertFrontendBusiness = (business) => {
  const normalized = {
    ...business,
    slug: normalizeFrontendSlug(business.slug) || null,
    is_public: Boolean(business.is_public)
  };
  const index = frontendFallbackData.businesses.findIndex((item) => item.id === normalized.id);
  if (index === -1) {
    frontendFallbackData.businesses.push(normalized);
  } else {
    frontendFallbackData.businesses[index] = {
      ...frontendFallbackData.businesses[index],
      ...normalized
    };
  }
  frontendFallbackData.business = {
    ...frontendFallbackData.business,
    ...normalized
  };
  return frontendFallbackData.business;
};

const getCurrentCustomerEmail = () => {
  if (typeof localStorage === 'undefined') return 'sarah@jenkins.com';
  return (localStorage.getItem('cd-customer-email') || 'sarah@jenkins.com').trim().toLowerCase();
};

const getMockCustomerId = (email) => `mock-customer-${email.replace(/[^a-z0-9]/g, '-')}`;

const matchesFrontendCustomer = (record, email) => (
  record.customer_user_id === getMockCustomerId(email) || (record.customer_email || '').toLowerCase() === email
);

const getFrontendBusinessContext = (businessId) => {
  const business = frontendFallbackData.businesses.find((item) => item.id === businessId);
  if (!business) return {};
  return {
    business_id: business.id,
    business_name: business.name,
    business_slug: business.slug,
    category: business.category,
    city: business.city,
    service_area: business.service_area
  };
};

const getFrontendLeadByConversation = () => {
  const map = new Map();
  frontendFallbackData.leads.forEach((lead) => {
    if (lead.conversation_id && !map.has(lead.conversation_id)) {
      map.set(lead.conversation_id, lead);
    }
  });
  return map;
};

const getFrontendLastMessage = (conversationId) => {
  return frontendFallbackData.messages
    .filter((message) => message.conversation_id === conversationId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0] || null;
};

const enrichFrontendLead = (lead) => ({
  ...lead,
  ...getFrontendBusinessContext(lead.business_id),
  last_updated: lead.updated_at || lead.created_at
});

const enrichFrontendConversation = (conversation) => {
  const lead = getFrontendLeadByConversation().get(conversation.id);
  const lastMessage = getFrontendLastMessage(conversation.id);
  return {
    ...conversation,
    ...getFrontendBusinessContext(conversation.business_id),
    service_type: lead?.service_type || null,
    lead_id: lead?.id || null,
    last_message_preview: lastMessage?.content || null,
    last_message_at: lastMessage?.created_at || conversation.updated_at || conversation.created_at
  };
};

const getFrontendCustomerRecords = () => {
  const email = getCurrentCustomerEmail();
  const customerId = getMockCustomerId(email);
  const leads = frontendFallbackData.leads
    .filter((lead) => matchesFrontendCustomer(lead, email))
    .map((lead) => {
      if (!lead.customer_user_id && (lead.customer_email || '').toLowerCase() === email) {
        lead.customer_user_id = customerId;
      }
      return enrichFrontendLead(lead);
    });
  const conversations = frontendFallbackData.conversations
    .filter((conversation) => matchesFrontendCustomer(conversation, email))
    .map((conversation) => {
      if (!conversation.customer_user_id && (conversation.customer_email || '').toLowerCase() === email) {
        conversation.customer_user_id = customerId;
      }
      return enrichFrontendConversation(conversation);
    });
  return {
    leads,
    conversations,
    businesses: frontendFallbackData.businesses
      .filter((business) => leads.some((lead) => lead.business_id === business.id) || conversations.some((conversation) => conversation.business_id === business.id))
      .map((business) => getFrontendBusinessContext(business.id)),
    user: { id: customerId, email }
  };
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
    } else if (endpoint.startsWith('/api/customer') && typeof localStorage !== 'undefined') {
      token = localStorage.getItem('sb-access-token') || 'mock-token';
    }

    const customerEmailHeader = endpoint.startsWith('/api/customer') && typeof localStorage !== 'undefined'
      ? localStorage.getItem('cd-customer-email')
      : null;

    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...(customerEmailHeader ? { 'X-Customer-Email': customerEmailHeader } : {}),
        ...options.headers,
      }
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const apiError = new Error(errData.error || `HTTP error ${response.status}`);
      apiError.status = response.status;
      apiError.isHttpError = true;
      throw apiError;
    }
    return await response.json();
  } catch (error) {
    console.warn(`API call failed for ${endpoint}: ${error.message}. Running in offline frontend mode.`);
    throw error;
  }
};

export const api = {
  getDemoBusinessId: () => DEMO_BUSINESS_ID,

  // Public Marketplace
  getPublicBusinesses: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.set('category', filters.category);
    if (filters.city) params.set('city', filters.city);
    const query = params.toString() ? `?${params.toString()}` : '';

    try {
      return await apiCall(`/api/public/businesses${query}`);
    } catch {
      let businesses = frontendFallbackData.businesses.filter(b => b.is_public);
      if (filters.category) {
        const category = filters.category.toLowerCase();
        businesses = businesses.filter(b => b.category?.toLowerCase().includes(category));
      }
      if (filters.city) {
        const city = filters.city.toLowerCase();
        businesses = businesses.filter(b => b.city?.toLowerCase().includes(city));
      }
      return businesses;
    }
  },
  getPublicServices: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.set('category', filters.category);
    if (filters.city) params.set('city', filters.city);
    if (filters.query) params.set('query', filters.query);
    const queryString = params.toString() ? `?${params.toString()}` : '';

    try {
      return await apiCall(`/api/public/services${queryString}`);
    } catch {
      let publicBusinesses = frontendFallbackData.businesses.filter(b => b.is_public);
      if (filters.city) {
        const cityLower = filters.city.toLowerCase();
        publicBusinesses = publicBusinesses.filter(b => b.city?.toLowerCase().includes(cityLower));
      }
      const bIds = publicBusinesses.map(b => b.id);
      const bMap = new Map(publicBusinesses.map(b => [b.id, b]));

      let services = frontendFallbackData.services.filter(s => s.business_id && bIds.includes(s.business_id) && s.is_public !== false);

      let results = services.map(s => {
        const b = bMap.get(s.business_id);
        return {
          service_id: s.id,
          service_name: s.name,
          service_slug: s.slug || normalizeFrontendSlug(s.name),
          short_description: s.short_description || s.description || '',
          description: s.description || '',
          base_price: s.base_price,
          price_unit: s.price_unit,
          duration_estimate: s.duration_estimate || s.estimated_duration || '',
          service_area: s.service_area || b.service_area || '',
          category: s.category || b.category || '',
          business_id: b.id,
          business_name: b.name,
          business_slug: b.slug,
          business_city: b.city,
          business_service_area: b.service_area,
          rating: b.rating
        };
      });

      if (filters.category) {
        const catLower = filters.category.toLowerCase();
        results = results.filter(r => r.category?.toLowerCase().includes(catLower));
      }
      if (filters.query) {
        const qLower = filters.query.toLowerCase();
        results = results.filter(r =>
          r.service_name.toLowerCase().includes(qLower) ||
          r.short_description.toLowerCase().includes(qLower) ||
          r.description.toLowerCase().includes(qLower) ||
          r.business_name.toLowerCase().includes(qLower)
        );
      }
      return results;
    }
  },
  getPublicService: async (businessSlug, serviceSlug) => {
    try {
      return await apiCall(`/api/public/services/${encodeURIComponent(businessSlug)}/${encodeURIComponent(serviceSlug)}`);
    } catch {
      const b = frontendFallbackData.businesses.find(item => item.slug === businessSlug && item.is_public);
      if (!b) throw new Error('Business not found or not public');
      const s = frontendFallbackData.services.find(item => item.business_id === b.id && (item.slug === serviceSlug || normalizeFrontendSlug(item.name) === serviceSlug) && item.is_public !== false);
      if (!s) throw new Error('Service gig not found or not public');
      return {
        service_id: s.id,
        service_name: s.name,
        service_slug: s.slug || normalizeFrontendSlug(s.name),
        short_description: s.short_description || s.description || '',
        description: s.description || '',
        base_price: s.base_price,
        price_unit: s.price_unit,
        duration_estimate: s.duration_estimate || s.estimated_duration || '',
        service_area: s.service_area || b.service_area || '',
        category: s.category || b.category || '',
        business_id: b.id,
        business_name: b.name,
        business_slug: b.slug,
        business_city: b.city,
        business_service_area: b.service_area,
        rating: b.rating
      };
    }
  },
  isSupabaseConfigured: () => {
    return Boolean(
      import.meta.env.VITE_SUPABASE_URL &&
      import.meta.env.VITE_SUPABASE_URL !== 'https://your-project.supabase.co'
    );
  },
  getPublicBusiness: async (slug) => {
    try {
      return await apiCall(`/api/public/businesses/${encodeURIComponent(slug)}`);
    } catch {
      const business = frontendFallbackData.businesses.find(b => b.slug === slug && b.is_public);
      if (!business) throw new Error('Business not found');
      return business;
    }
  },
  getPublicBusinessServices: async (slug) => {
    try {
      return await apiCall(`/api/public/businesses/${encodeURIComponent(slug)}/services`);
    } catch {
      const business = frontendFallbackData.businesses.find(b => b.slug === slug && b.is_public);
      if (!business) return [];
      return frontendFallbackData.services.filter(s => s.business_id === business.id);
    }
  },
  getPublicBusinessFAQs: async (slug) => {
    try {
      return await apiCall(`/api/public/businesses/${encodeURIComponent(slug)}/faqs`);
    } catch {
      const business = frontendFallbackData.businesses.find(b => b.slug === slug && b.is_public);
      if (!business) return [];
      return frontendFallbackData.faqs.filter(f => f.business_id === business.id);
    }
  },

  // Business
  getBusinessOfCurrentUser: async () => {
    try {
      return await apiCall('/api/business/me');
    } catch (err) {
      if (err.isHttpError) throw err;
      return frontendFallbackData.business;
    }
  },
  createBusiness: async (data) => {
    try {
      return await apiCall('/api/business', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch (err) {
      if (err.isHttpError) throw err;
      const newBusiness = {
        id: `b-${Date.now()}`,
        user_id: 'mock-user-123',
        created_at: new Date().toISOString(),
        ...data,
        slug: normalizeFrontendSlug(data.slug)
      };
      return upsertFrontendBusiness(newBusiness);
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
    } catch (err) {
      if (err.isHttpError) throw err;
      const existing = frontendFallbackData.businesses.find((business) => business.id === id) || frontendFallbackData.business;
      const nextBusiness = {
        ...existing,
        ...data,
        id
      };
      if (data.slug !== undefined) {
        nextBusiness.slug = normalizeFrontendSlug(data.slug);
      }
      return upsertFrontendBusiness(nextBusiness);
    }
  },

  // Services
  getServices: async (businessId = DEMO_BUSINESS_ID) => {
    try {
      return await apiCall(`/api/services/${businessId}`);
    } catch {
      return frontendFallbackData.services.filter(service => service.business_id === businessId);
    }
  },
  createService: async (serviceData) => {
    try {
      return await apiCall('/api/services', {
        method: 'POST',
        body: JSON.stringify({ business_id: serviceData.business_id || DEMO_BUSINESS_ID, ...serviceData })
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
        body: JSON.stringify({ business_id: faqData.business_id || DEMO_BUSINESS_ID, ...faqData })
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
  sendMessage: async (businessId, message, conversationId = null) => {
    try {
      return await apiCall('/api/chat/message', {
        method: 'POST',
        body: JSON.stringify({
          businessId: businessId || DEMO_BUSINESS_ID,
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
      return frontendFallbackData.leads.filter(l => l.business_id === businessId);
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
      return frontendFallbackData.conversations.filter(c => c.business_id === businessId);
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
  },

  // Customer Portal Endpoints
  customerGetDashboard: async () => {
    try {
      return await apiCall('/api/customer/dashboard');
    } catch {
      return getFrontendCustomerRecords();
    }
  },
  customerGetConversations: async () => {
    try {
      return await apiCall('/api/customer/conversations');
    } catch {
      return getFrontendCustomerRecords().conversations;
    }
  },
  customerGetConversationDetail: async (id) => {
    try {
      return await apiCall(`/api/customer/conversations/${id}`);
    } catch {
      const records = getFrontendCustomerRecords();
      const conversation = records.conversations.find((item) => item.id === id);
      if (!conversation) throw new Error('Conversation not found');
      const lead = records.leads.find((item) => item.conversation_id === id) || null;
      return {
        ...conversation,
        lead,
        messages: frontendFallbackData.messages
          .filter((message) => message.conversation_id === id)
          .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      };
    }
  },
  customerGetBookings: async () => {
    try {
      return await apiCall('/api/customer/bookings');
    } catch {
      return getFrontendCustomerRecords().leads;
    }
  },
  customerUpdateProfile: async (profileData) => {
    try {
      return await apiCall('/api/customer/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });
    } catch {
      const { customer_name, customer_phone, address } = profileData;
      frontendFallbackData.leads.forEach((l, i) => {
        if (matchesFrontendCustomer(l, getCurrentCustomerEmail())) {
          frontendFallbackData.leads[i].customer_name = customer_name;
          frontendFallbackData.leads[i].customer_phone = customer_phone;
          frontendFallbackData.leads[i].address = address;
        }
      });
      frontendFallbackData.conversations.forEach((c, i) => {
        if (matchesFrontendCustomer(c, getCurrentCustomerEmail())) {
          frontendFallbackData.conversations[i].customer_name = customer_name;
          frontendFallbackData.conversations[i].customer_phone = customer_phone;
        }
      });
      return { success: true, ...profileData };
    }
  },
  customerRequestReschedule: async (leadId, notes) => {
    try {
      return await apiCall('/api/customer/request-update', {
        method: 'PUT',
        body: JSON.stringify({ leadId, notes })
      });
    } catch {
      const idx = frontendFallbackData.leads.findIndex(l => l.id === leadId);
      if (idx !== -1 && matchesFrontendCustomer(frontendFallbackData.leads[idx], getCurrentCustomerEmail())) {
        frontendFallbackData.leads[idx].notes = `${frontendFallbackData.leads[idx].notes || ''}\n[Customer Reschedule Request]: ${notes}`.trim();
        return enrichFrontendLead(frontendFallbackData.leads[idx]);
      }
      return null;
    }
  },

  // Public booking submission - no auth required; token sent if present for uplift
  customerCreateEnquiry: async (enquiryData) => {
    if (!enquiryData.business_slug && !enquiryData.business_id) {
      throw new Error('Business context (slug or ID) is required to submit a booking enquiry.');
    }
    const payload = { ...enquiryData };
    delete payload.demo_fallback;

    try {
      return await apiCall('/api/customer/enquiries', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch {
      // Offline mock fallback: simulate a successful submission
      const fallbackBusiness = frontendFallbackData.businesses.find(b => b.slug === payload.business_slug);
      const conversationId = `c-mock-${Date.now()}`;
      const mockLead = {
        id: `l-mock-${Date.now()}`,
        ...payload,
        conversation_id: conversationId,
        business_id: payload.business_id || fallbackBusiness?.id || DEMO_BUSINESS_ID,
        status: 'new',
        created_at: new Date().toISOString()
      };
      const mockConversation = {
        id: conversationId,
        business_id: mockLead.business_id,
        customer_name: payload.customer_name,
        customer_email: payload.customer_email,
        customer_phone: payload.customer_phone,
        customer_user_id: null,
        status: 'open',
        needs_human_review: false,
        created_at: mockLead.created_at
      };
      frontendFallbackData.conversations.unshift(mockConversation);
      frontendFallbackData.messages.push({
        id: `m-mock-${Date.now()}`,
        conversation_id: conversationId,
        sender: 'customer',
        content: `New ${payload.service_type} request for ${fallbackBusiness?.name || 'selected business'}.`,
        created_at: mockLead.created_at
      });
      frontendFallbackData.leads.unshift(mockLead);
      return {
        success: true,
        lead_id: mockLead.id,
        conversation_id: conversationId,
        business_id: mockLead.business_id,
        business_slug: fallbackBusiness?.slug,
        business_name: fallbackBusiness?.name,
        customer_email: payload.customer_email,
        authenticated: false
      };
    }
  }
};
