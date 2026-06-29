const { mockStore } = require('../lib/mockStore');
const { isSupabaseConfigured, supabase } = require('../lib/supabaseClient');

// Get services for a business
exports.getServicesByBusiness = async (req, res) => {
  const { businessId } = req.params;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', businessId);
      
      if (error) {
        console.error(`❌ Supabase error loading services for business ${businessId}:`, error.message);
        throw error;
      }
      return res.json(data || []);
    } catch (err) {
      return res.status(500).json({ error: `Supabase load services failed: ${err.message}` });
    }
  }

  // Mock Store filter
  const services = mockStore.services.filter(s => s.business_id === businessId);
  res.json(services);
};

// Create a service
exports.createService = async (req, res) => {
  const { business_id, name, description, base_price, estimated_duration } = req.body;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('services')
        .insert([{ business_id, name, description, base_price, estimated_duration }])
        .select();

      if (error) {
        console.error('❌ Supabase error inserting service:', error.message);
        throw error;
      }
      return res.status(201).json(data[0]);
    } catch (err) {
      return res.status(500).json({ error: `Supabase create service failed: ${err.message}` });
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

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('services')
        .update({ name, description, base_price, estimated_duration })
        .eq('id', id)
        .select();

      if (error) {
        console.error(`❌ Supabase error updating service ${id}:`, error.message);
        throw error;
      }

      if (data && data.length > 0) {
        return res.json(data[0]);
      } else {
        return res.status(404).json({ error: 'Service not found to update' });
      }
    } catch (err) {
      return res.status(500).json({ error: `Supabase update service failed: ${err.message}` });
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

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error(`❌ Supabase error deleting service ${id}:`, error.message);
        throw error;
      }
      return res.json({ success: true, message: 'Service deleted successfully' });
    } catch (err) {
      return res.status(500).json({ error: `Supabase delete service failed: ${err.message}` });
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
