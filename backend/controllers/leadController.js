const { mockStore } = require('../lib/mockStore');
const { isSupabaseConfigured, supabase } = require('../lib/supabaseClient');

// Get leads for a business
exports.getLeadsByBusiness = async (req, res) => {
  const { businessId } = req.params;

  // TODO: Add Supabase select query here in Phase 3

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // Mock Store filter sorted by date desc
  const leads = mockStore.leads
    .filter(l => l.business_id === businessId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
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

  // TODO: Add Supabase insert query here in Phase 3

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
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
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

  if (!['new', 'contacted', 'booked', 'lost'].includes(status)) {
    return res.status(400).json({ error: 'Invalid lead status' });
  }

  // TODO: Add Supabase update query here in Phase 3

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('leads')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return res.json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
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
