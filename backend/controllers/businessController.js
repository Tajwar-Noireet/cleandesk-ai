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

// Get business profile associated with the authenticated user
exports.getBusinessOfCurrentUser = async (req, res) => {
  const userId = req.user ? req.user.id : null;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: User session missing' });
  }

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error(`❌ Supabase error loading business for user ${userId}:`, error.message);
        throw error;
      }

      if (data && data.length > 0) {
        return res.json(data[0]);
      } else {
        return res.status(404).json({ error: 'No business profile found for this user' });
      }
    } catch (err) {
      return res.status(500).json({ error: `Supabase query failed: ${err.message}` });
    }
  }

  // Fallback to Mock Store
  const business = mockStore.businesses.find(b => b.user_id === userId);
  if (!business) {
    // Return first seed business in mock mode if user_id doesn't match yet
    return res.json(mockStore.businesses[0]);
  }
  res.json(business);
};

// Create a business profile
exports.createBusiness = async (req, res) => {
  const { name, phone, email, service_area, opening_hours, description } = req.body;
  const userId = req.user ? req.user.id : null;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized to create business profile' });
  }
  
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .insert([{
          user_id: userId,
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
    user_id: userId,
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
  const userId = req.user ? req.user.id : null;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized to update business profile' });
  }

  if (isSupabaseConfigured()) {
    try {
      // First, get the business to check ownership
      const { data: current, error: fetchErr } = await supabase
        .from('businesses')
        .select('user_id')
        .eq('id', id);

      if (fetchErr || !current || current.length === 0) {
        return res.status(404).json({ error: 'Business not found to verify ownership' });
      }

      if (current[0].user_id !== userId) {
        return res.status(403).json({ error: 'Forbidden: You do not own this business' });
      }

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

  // Verify mock ownership
  if (mockStore.businesses[index].user_id !== userId) {
    return res.status(403).json({ error: 'Forbidden: You do not own this business' });
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
