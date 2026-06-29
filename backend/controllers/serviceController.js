const { mockStore } = require('../lib/mockStore');
const { isSupabaseConfigured, supabase } = require('../lib/supabaseClient');

// Get services for a business
exports.getServicesByBusiness = async (req, res) => {
  const { businessId } = req.params;

  // TODO: Add Supabase select query here in Phase 3

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', businessId);
      if (error) throw error;
      return res.json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // Mock Store filter
  const services = mockStore.services.filter(s => s.business_id === businessId);
  res.json(services);
};

// Create a service
exports.createService = async (req, res) => {
  const { business_id, name, description, base_price, estimated_duration } = req.body;

  // TODO: Add Supabase insert query here in Phase 3

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('services')
        .insert([{ business_id, name, description, base_price, estimated_duration }])
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // Mock Store insertion
  const newService = {
    id: `s-${Date.now()}`,
    business_id,
    name,
    description,
    base_price,
    estimated_duration
  };
  mockStore.services.push(newService);
  res.status(201).json(newService);
};

// Update a service
exports.updateService = async (req, res) => {
  const { id } = req.params;
  const { name, description, base_price, estimated_duration } = req.body;

  // TODO: Add Supabase update query here in Phase 3

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('services')
        .update({ name, description, base_price, estimated_duration })
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
  const index = mockStore.services.findIndex(s => s.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Service not found' });
  }

  const updated = {
    ...mockStore.services[index],
    name: name !== undefined ? name : mockStore.services[index].name,
    description: description !== undefined ? description : mockStore.services[index].description,
    base_price: base_price !== undefined ? base_price : mockStore.services[index].base_price,
    estimated_duration: estimated_duration !== undefined ? estimated_duration : mockStore.services[index].estimated_duration,
  };

  mockStore.services[index] = updated;
  res.json(updated);
};

// Delete a service
exports.deleteService = async (req, res) => {
  const { id } = req.params;

  // TODO: Add Supabase delete query here in Phase 3

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return res.json({ success: true, message: 'Service deleted successfully' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // Mock Store delete
  const index = mockStore.services.findIndex(s => s.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Service not found' });
  }

  mockStore.services.splice(index, 1);
  res.json({ success: true, message: 'Service deleted successfully' });
};
