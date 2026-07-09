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
      console.error('❌ Supabase error checking business ownership:', err.message);
      return false;
    }
  }

  // Fallback to Mock Store
  const business = mockStore.businesses.find(b => b.id === businessId);
  if (!business) return false;
  return business.user_id === userId;
};

// Helper to check service ownership by ID
const checkServiceOwnership = async (userId, serviceId) => {
  if (!userId || !serviceId) return false;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('business_id')
        .eq('id', serviceId);

      if (error || !data || data.length === 0) {
        return false;
      }
      return await checkBusinessOwnership(userId, data[0].business_id);
    } catch (err) {
      console.error('❌ Supabase error checking service ownership:', err.message);
      return false;
    }
  }

  // Fallback to Mock Store
  const service = mockStore.services.find(s => s.id === serviceId);
  if (!service) return false;
  return await checkBusinessOwnership(userId, service.business_id);
};

const normalizeServiceSlug = (value) =>
  (value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const ensureServiceSlugIsAvailable = async (businessId, slug, currentServiceId = null) => {
  if (!slug) return true;

  if (isSupabaseConfigured()) {
    let query = supabase
      .from('services')
      .select('id')
      .eq('business_id', businessId)
      .eq('slug', slug)
      .limit(1);

    if (currentServiceId) {
      query = query.neq('id', currentServiceId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return !data || data.length === 0;
  }

  const conflict = mockStore.services.find(
    s => s.business_id === businessId && s.slug === slug && s.id !== currentServiceId
  );
  return !conflict;
};

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
  const {
    business_id,
    name,
    slug,
    is_public,
    short_description,
    long_description,
    description,
    base_price,
    price_unit,
    estimated_duration,
    duration_estimate,
    service_area,
    category,
    image_url,
    sort_order
  } = req.body;

  const userId = req.user ? req.user.id : null;

  // Enforce ownership
  const isOwner = await checkBusinessOwnership(userId, business_id);
  if (!isOwner) {
    return res.status(403).json({ error: 'Forbidden: You do not own this business profile' });
  }

  const finalSlug = slug ? normalizeServiceSlug(slug) : normalizeServiceSlug(name);
  const isSlugValid = await ensureServiceSlugIsAvailable(business_id, finalSlug);
  if (!isSlugValid) {
    return res.status(409).json({ error: `The service slug "${finalSlug}" is already in use by this business.` });
  }

  const payload = {
    business_id,
    name,
    slug: finalSlug || null,
    is_public: is_public !== false,
    short_description: short_description || null,
    long_description: long_description || description || null,
    description: description || short_description || null,
    base_price: base_price || null,
    price_unit: price_unit || null,
    estimated_duration: estimated_duration || duration_estimate || null,
    duration_estimate: duration_estimate || estimated_duration || null,
    service_area: service_area || null,
    category: category || null,
    image_url: image_url || null,
    sort_order: parseInt(sort_order, 10) || 0
  };

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('services')
        .insert([payload])
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
    ...payload,
    created_at: new Date().toISOString()
  };
  mockStore.services.push(newService);
  res.status(201).json(newService);
};

// Update a service
exports.updateService = async (req, res) => {
  const { id } = req.params;
  const {
    business_id,
    name,
    slug,
    is_public,
    short_description,
    long_description,
    description,
    base_price,
    price_unit,
    estimated_duration,
    duration_estimate,
    service_area,
    category,
    image_url,
    sort_order
  } = req.body;

  const userId = req.user ? req.user.id : null;

  // Enforce ownership
  const isOwner = await checkServiceOwnership(userId, id);
  if (!isOwner) {
    return res.status(403).json({ error: 'Forbidden: You do not own this service' });
  }

  // Find business_id if not passed in req.body
  let resolvedBusinessId = business_id;
  if (!resolvedBusinessId) {
    if (isSupabaseConfigured()) {
      const { data } = await supabase.from('services').select('business_id').eq('id', id).limit(1);
      resolvedBusinessId = data?.[0]?.business_id;
    } else {
      const s = mockStore.services.find(item => item.id === id);
      resolvedBusinessId = s?.business_id;
    }
  }

  const finalSlug = slug ? normalizeServiceSlug(slug) : (name ? normalizeServiceSlug(name) : undefined);
  if (finalSlug !== undefined && resolvedBusinessId) {
    const isSlugValid = await ensureServiceSlugIsAvailable(resolvedBusinessId, finalSlug, id);
    if (!isSlugValid) {
      return res.status(409).json({ error: `The service slug "${finalSlug}" is already in use by this business.` });
    }
  }

  const payload = {};
  if (name !== undefined) payload.name = name;
  if (finalSlug !== undefined) payload.slug = finalSlug || null;
  if (is_public !== undefined) payload.is_public = is_public !== false;
  if (short_description !== undefined) payload.short_description = short_description;
  if (long_description !== undefined) payload.long_description = long_description;
  if (description !== undefined) payload.description = description;
  if (base_price !== undefined) payload.base_price = base_price;
  if (price_unit !== undefined) payload.price_unit = price_unit;
  if (estimated_duration !== undefined) payload.estimated_duration = estimated_duration;
  if (duration_estimate !== undefined) payload.duration_estimate = duration_estimate;
  if (service_area !== undefined) payload.service_area = service_area;
  if (category !== undefined) payload.category = category;
  if (image_url !== undefined) payload.image_url = image_url;
  if (sort_order !== undefined) payload.sort_order = parseInt(sort_order, 10) || 0;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('services')
        .update(payload)
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
    ...payload,
    updated_at: new Date().toISOString()
  };

  mockStore.services[index] = updated;
  res.json(updated);
};

// Delete a service
exports.deleteService = async (req, res) => {
  const { id } = req.params;
  const userId = req.user ? req.user.id : null;

  // Enforce ownership
  const isOwner = await checkServiceOwnership(userId, id);
  if (!isOwner) {
    return res.status(403).json({ error: 'Forbidden: You do not own this service' });
  }

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
