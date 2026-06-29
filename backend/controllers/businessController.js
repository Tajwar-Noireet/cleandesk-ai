const { mockStore } = require('../lib/mockStore');
const { isSupabaseConfigured, supabase } = require('../lib/supabaseClient');

// Get business by ID
exports.getBusiness = async (req, res) => {
  const { id } = req.params;
  
  // TODO: Add Supabase select query here in Phase 3
  // const { data, error } = await supabase.from('businesses').select('*').eq('id', id).single();
  
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return res.json(data);
    } catch (err) {
      return res.status(404).json({ error: 'Business not found in Supabase' });
    }
  }

  // Fallback to Mock Store
  const business = mockStore.businesses.find(b => b.id === id);
  if (!business) {
    return res.status(404).json({ error: 'Business not found' });
  }
  res.json(business);
};

// Create a business profile
exports.createBusiness = async (req, res) => {
  const { name, phone, email, service_area, opening_hours, description } = req.body;
  
  // TODO: Add Supabase insert query here in Phase 3
  
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .insert([{
          user_id: req.user.id,
          name, phone, email, service_area, opening_hours, description
        }])
        .select()
        .single();
      if (error) throw error;
      return res.status(211).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // Mock Store insertion
  const newBusiness = {
    id: `b-${Date.now()}`,
    user_id: req.user.id,
    name,
    phone,
    email,
    service_area,
    opening_hours,
    description
  };
  mockStore.businesses.push(newBusiness);
  res.status(201).json(newBusiness);
};

// Update business profile
exports.updateBusiness = async (req, res) => {
  const { id } = req.params;
  const { name, phone, email, service_area, opening_hours, description } = req.body;

  // TODO: Add Supabase update query here in Phase 3

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .update({ name, phone, email, service_area, opening_hours, description })
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
  const index = mockStore.businesses.findIndex(b => b.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Business not found' });
  }

  const updated = {
    ...mockStore.businesses[index],
    name: name !== undefined ? name : mockStore.businesses[index].name,
    phone: phone !== undefined ? phone : mockStore.businesses[index].phone,
    email: email !== undefined ? email : mockStore.businesses[index].email,
    service_area: service_area !== undefined ? service_area : mockStore.businesses[index].service_area,
    opening_hours: opening_hours !== undefined ? opening_hours : mockStore.businesses[index].opening_hours,
    description: description !== undefined ? description : mockStore.businesses[index].description,
  };

  mockStore.businesses[index] = updated;
  res.json(updated);
};
