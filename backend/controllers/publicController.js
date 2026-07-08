const { mockStore, DEMO_BUSINESS_ID } = require('../lib/mockStore');
const { isSupabaseConfigured, supabase } = require('../lib/supabaseClient');

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Resolve a business from slug in Supabase
const resolveBusinessBySlug = async (slug) => {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .eq('is_public', true);
  if (error || !data || data.length === 0) return null;
  return data[0];
};

// Resolve a business from slug in mock store
const resolveMockBusinessBySlug = (slug) => {
  return mockStore.businesses.find(
    b => b.slug === slug && b.is_public === true
  ) || null;
};

// ─── GET /api/public/businesses ───────────────────────────────────────────────
exports.listPublicBusinesses = async (req, res) => {
  try {
    const { category, city } = req.query;

    if (isSupabaseConfigured()) {
      let query = supabase
        .from('businesses')
        .select('id, name, slug, category, city, postcode, service_area, public_description, opening_hours, rating, logo_url')
        .eq('is_public', true)
        .order('rating', { ascending: false });

      if (category) query = query.ilike('category', `%${category}%`);
      if (city)     query = query.ilike('city', `%${city}%`);

      const { data, error } = await query;
      if (error) throw error;
      return res.json(data || []);
    }

    // Mock Store fallback
    let businesses = mockStore.businesses.filter(b => b.is_public === true);
    if (category) {
      const cat = category.toLowerCase();
      businesses = businesses.filter(b => b.category?.toLowerCase().includes(cat));
    }
    if (city) {
      const c = city.toLowerCase();
      businesses = businesses.filter(b => b.city?.toLowerCase().includes(c));
    }

    // Return only public-safe fields
    const safe = businesses.map(({ id, name, slug, category, city, postcode, service_area, public_description, opening_hours, rating, logo_url }) =>
      ({ id, name, slug, category, city, postcode, service_area, public_description, opening_hours, rating, logo_url })
    );
    return res.json(safe);
  } catch (err) {
    console.error('❌ listPublicBusinesses error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ─── GET /api/public/businesses/:slug ─────────────────────────────────────────
exports.getPublicBusiness = async (req, res) => {
  try {
    const { slug } = req.params;

    if (isSupabaseConfigured()) {
      const business = await resolveBusinessBySlug(slug);
      if (!business) return res.status(404).json({ error: 'Business not found or not publicly listed.' });
      // Strip internal-only fields
      const { user_id, ...safe } = business;
      return res.json(safe);
    }

    const business = resolveMockBusinessBySlug(slug);
    if (!business) return res.status(404).json({ error: 'Business not found or not publicly listed (Mock).' });
    const { user_id, ...safe } = business;
    return res.json(safe);
  } catch (err) {
    console.error('❌ getPublicBusiness error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ─── GET /api/public/businesses/:slug/services ────────────────────────────────
exports.getPublicBusinessServices = async (req, res) => {
  try {
    const { slug } = req.params;

    if (isSupabaseConfigured()) {
      const business = await resolveBusinessBySlug(slug);
      if (!business) return res.status(404).json({ error: 'Business not found or not publicly listed.' });

      const { data, error } = await supabase
        .from('services')
        .select('id, name, description, base_price, estimated_duration')
        .eq('business_id', business.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return res.json(data || []);
    }

    const business = resolveMockBusinessBySlug(slug);
    if (!business) return res.status(404).json({ error: 'Business not found or not publicly listed (Mock).' });

    const services = mockStore.services
      .filter(s => s.business_id === business.id)
      .map(({ id, name, description, base_price, estimated_duration }) =>
        ({ id, name, description, base_price, estimated_duration })
      );
    return res.json(services);
  } catch (err) {
    console.error('❌ getPublicBusinessServices error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ─── GET /api/public/businesses/:slug/faqs ────────────────────────────────────
exports.getPublicBusinessFAQs = async (req, res) => {
  try {
    const { slug } = req.params;

    if (isSupabaseConfigured()) {
      const business = await resolveBusinessBySlug(slug);
      if (!business) return res.status(404).json({ error: 'Business not found or not publicly listed.' });

      const { data, error } = await supabase
        .from('faqs')
        .select('id, question, answer')
        .eq('business_id', business.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return res.json(data || []);
    }

    const business = resolveMockBusinessBySlug(slug);
    if (!business) return res.status(404).json({ error: 'Business not found or not publicly listed (Mock).' });

    const faqs = mockStore.faqs
      .filter(f => f.business_id === business.id)
      .map(({ id, question, answer }) => ({ id, question, answer }));
    return res.json(faqs);
  } catch (err) {
    console.error('❌ getPublicBusinessFAQs error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
