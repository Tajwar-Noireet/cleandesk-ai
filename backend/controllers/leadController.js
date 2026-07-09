const { mockStore } = require('../lib/mockStore');
const { isSupabaseConfigured, supabase } = require('../lib/supabaseClient');

// Helper to check business ownership
const checkBusinessOwnership = async (userId, businessId) => {
  if (!userId || !businessId) return false;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('user_id')
        .eq('id', businessId);
      
      if (error || !data || data.length === 0) {
        return false;
      }
      return data[0].user_id === userId;
    } catch (err) {
      console.error('❌ Supabase error checking business ownership for Leads:', err.message);
      return false;
    }
  }

  // Fallback to Mock Store
  const business = mockStore.businesses.find(b => b.id === businessId);
  if (!business) return false;
  return business.user_id === userId;
};

// Helper to check Lead ownership by ID
const checkLeadOwnership = async (userId, leadId) => {
  if (!userId || !leadId) return false;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('business_id')
        .eq('id', leadId);
      
      if (error || !data || data.length === 0) {
        return false;
      }
      return await checkBusinessOwnership(userId, data[0].business_id);
    } catch (err) {
      console.error('❌ Supabase error checking Lead ownership:', err.message);
      return false;
    }
  }

  // Fallback to Mock Store
  const lead = mockStore.leads.find(l => l.id === leadId);
  if (!lead) return false;
  return await checkBusinessOwnership(userId, lead.business_id);
};

// Get leads for a business
exports.getLeadsByBusiness = async (req, res) => {
  const { businessId } = req.params;
  const userId = req.user ? req.user.id : null;

  // Enforce ownership
  const isOwner = await checkBusinessOwnership(userId, businessId);
  if (!isOwner) {
    return res.status(403).json({ error: 'Forbidden: You do not own this business profile' });
  }

  let businessSlug = null;
  if (isSupabaseConfigured()) {
    try {
      const { data } = await supabase.from('businesses').select('slug').eq('id', businessId).limit(1);
      businessSlug = data?.[0]?.slug;
    } catch (e) {}
  } else {
    const b = mockStore.businesses.find(item => item.id === businessId);
    businessSlug = b?.slug;
  }

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error(`❌ Supabase error loading leads for business ${businessId}:`, error.message);
        throw error;
      }

      console.log('⚡ [DEV LOG] GET /api/leads/:businessId (Supabase):', JSON.stringify({
        authenticated_owner_user_id: userId,
        resolved_owner_business_id: businessId,
        owner_business_slug: businessSlug,
        number_of_leads_found: data ? data.length : 0,
        returned_lead_ids: data ? data.map(l => l.id) : [],
        returned_lead_business_ids: data ? data.map(l => l.business_id) : []
      }, null, 2));

      return res.json(data || []);
    } catch (err) {
      return res.status(500).json({ error: `Supabase load leads failed: ${err.message}` });
    }
  }

  // Mock Store filter sorted by date desc
  const leads = mockStore.leads
    .filter(l => l.business_id === businessId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  console.log('⚡ [DEV LOG] GET /api/leads/:businessId (Mock):', JSON.stringify({
    authenticated_owner_user_id: userId,
    resolved_owner_business_id: businessId,
    owner_business_slug: businessSlug,
    number_of_leads_found: leads.length,
    returned_lead_ids: leads.map(l => l.id),
    returned_lead_business_ids: leads.map(l => l.business_id)
  }, null, 2));

  res.json(leads);
};

// Create a lead
exports.createLead = async (req, res) => {
  const {
    business_id,
    conversation_id,
    customer_name,
    customer_phone,
    address,
    service_type,
    preferred_date,
    notes
  } = req.body;
  const userId = req.user ? req.user.id : null;

  // Enforce ownership
  const isOwner = await checkBusinessOwnership(userId, business_id);
  if (!isOwner) {
    return res.status(403).json({ error: 'Forbidden: You do not own this business profile' });
  }

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert([{
          business_id,
          conversation_id,
          customer_name,
          customer_phone,
          address,
          service_type,
          preferred_date,
          notes,
          status: 'new'
        }])
        .select();

      if (error) {
        console.error('❌ Supabase error inserting lead:', error.message);
        throw error;
      }
      return res.status(201).json(data[0]);
    } catch (err) {
      return res.status(500).json({ error: `Supabase create lead failed: ${err.message}` });
    }
  }

  // Mock Store insertion
  const newLead = {
    id: `l-${Date.now()}`,
    business_id,
    conversation_id,
    customer_name,
    customer_phone,
    address,
    service_type,
    preferred_date,
    notes,
    status: 'new',
    created_at: new Date().toISOString()
  };
  mockStore.leads.push(newLead);
  res.status(201).json(newLead);
};

// Update lead status
exports.updateLeadStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user ? req.user.id : null;

  // Enforce ownership
  const isOwner = await checkLeadOwnership(userId, id);
  if (!isOwner) {
    return res.status(403).json({ error: 'Forbidden: You do not own this lead' });
  }

  if (!['new', 'contacted', 'booked', 'lost'].includes(status)) {
    return res.status(400).json({ error: 'Invalid lead status' });
  }

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('leads')
        .update({ status })
        .eq('id', id)
        .select();

      if (error) {
        console.error(`❌ Supabase error updating lead status for lead ${id}:`, error.message);
        throw error;
      }

      if (data && data.length > 0) {
        return res.json(data[0]);
      } else {
        return res.status(404).json({ error: 'Lead not found to update status' });
      }
    } catch (err) {
      return res.status(500).json({ error: `Supabase update lead status failed: ${err.message}` });
    }
  }

  // Mock Store update
  const index = mockStore.leads.findIndex(l => l.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Lead not found' });
  }

  mockStore.leads[index].status = status;
  res.json(mockStore.leads[index]);
};
