const { mockStore } = require('../lib/mockStore');
const { isSupabaseConfigured, supabase } = require('../lib/supabaseClient');

// Get business by ID
exports.getBusiness = async (req, res) => {
  const { id } = req.params;
  
  if (isSupabaseConfigured()) {
    try {
      // Use multi-row select to avoid PGRST116 single-row empty warnings
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', id);
      
      if (error) {
        console.error(`❌ Supabase error loading business ${id}:`, error.message);
        throw error;
      }
      
      if (data && data.length > 0) {
        return res.json(data[0]);
      } else {
        return res.status(404).json({ error: 'Business not found in Supabase' });
      }
    } catch (err) {
      return res.status(404).json({ error: 'Business search failed' });
    }
  }

  // Fallback to Mock Store
  const business = mockStore.businesses.find(b => b.id === id);
  if (!business) {
    return res.status(404).json({ error: 'Business not found (Mock Store)' });
  }
  res.json(business);
};

// Create a business profile
exports.createBusiness = async (req, res) => {
  const { name, phone, email, service_area, opening_hours, description } = req.body;
  
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .insert([{
          user_id: req.user ? req.user.id : null,
          name, phone, email, service_area, opening_hours, description
        }])
        .select();

      if (error) {
        console.error('❌ Supabase error creating business:', error.message);
        throw error;
      }
      return res.status(201).json(data[0]);
    } catch (err) {
      return res.status(500).json({ error: `Supabase create failed: ${err.message}` });
    }
  }

  // Mock Store insertion
  const newBusiness = {
    id: `b-${Date.now()}`,
    user_id: req.user ? req.user.id : 'mock-user-123',
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

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .update({ name, phone, email, service_area, opening_hours, description })
        .eq('id', id)
        .select();

      if (error) {
        console.error(`❌ Supabase error updating business ${id}:`, error.message);
        throw error;
      }
      
      if (data && data.length > 0) {
        return res.json(data[0]);
      } else {
        return res.status(404).json({ error: 'Business not found to update' });
      }
    } catch (err) {
      return res.status(500).json({ error: `Supabase update failed: ${err.message}` });
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
