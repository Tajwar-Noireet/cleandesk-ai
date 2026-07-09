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
        .select('*')
        .eq('business_id', business.id)
        .eq('is_public', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;
      return res.json(data || []);
    }

    const business = resolveMockBusinessBySlug(slug);
    if (!business) return res.status(404).json({ error: 'Business not found or not publicly listed (Mock).' });

    const services = mockStore.services
      .filter(s => s.business_id === business.id && s.is_public !== false)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
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

// ─── GET /api/public/services ──────────────────────────────────────────────────
exports.listPublicServices = async (req, res) => {
  try {
    const { category, city, query } = req.query;

    if (isSupabaseConfigured()) {
      let bQuery = supabase
        .from('businesses')
        .select('id, name, slug, category, city, postcode, service_area, rating, logo_url')
        .eq('is_public', true);

      if (city) {
        bQuery = bQuery.ilike('city', `%${city}%`);
      }

      const { data: businesses, error: bErr } = await bQuery;
      if (bErr) throw bErr;

      if (!businesses || businesses.length === 0) {
        return res.json([]);
      }

      const businessIds = businesses.map(b => b.id);
      const businessMap = new Map(businesses.map(b => [b.id, b]));

      let sQuery = supabase
        .from('services')
        .select('*')
        .eq('is_public', true)
        .in('business_id', businessIds);

      const { data: services, error: sErr } = await sQuery;
      if (sErr) throw sErr;

      let results = (services || []).map(s => {
        const b = businessMap.get(s.business_id);
        return {
          service_id: s.id,
          service_name: s.name,
          service_slug: s.slug,
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

      if (category) {
        const catLower = category.toLowerCase();
        results = results.filter(r => r.category?.toLowerCase().includes(catLower));
      }
      if (query) {
        const qLower = query.toLowerCase();
        results = results.filter(r =>
          r.service_name.toLowerCase().includes(qLower) ||
          r.short_description.toLowerCase().includes(qLower) ||
          r.description.toLowerCase().includes(qLower) ||
          r.business_name.toLowerCase().includes(qLower)
        );
      }

      return res.json(results);
    }

    // Mock store fallback
    let publicBusinesses = mockStore.businesses.filter(b => b.is_public === true);
    if (city) {
      const cityLower = city.toLowerCase();
      publicBusinesses = publicBusinesses.filter(b => b.city?.toLowerCase().includes(cityLower));
    }
    const businessIds = publicBusinesses.map(b => b.id);
    const businessMap = new Map(publicBusinesses.map(b => [b.id, b]));

    let publicServices = mockStore.services.filter(s => s.business_id && businessIds.includes(s.business_id) && s.is_public !== false);

    let results = publicServices.map(s => {
      const b = businessMap.get(s.business_id);
      return {
        service_id: s.id,
        service_name: s.name,
        service_slug: s.slug,
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

    if (category) {
      const catLower = category.toLowerCase();
      results = results.filter(r => r.category?.toLowerCase().includes(catLower));
    }
    if (query) {
      const qLower = query.toLowerCase();
      results = results.filter(r =>
        r.service_name.toLowerCase().includes(qLower) ||
        r.short_description.toLowerCase().includes(qLower) ||
        r.description.toLowerCase().includes(qLower) ||
        r.business_name.toLowerCase().includes(qLower)
      );
    }

    return res.json(results);
  } catch (err) {
    console.error('❌ listPublicServices error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ─── GET /api/public/services/:businessSlug/:serviceSlug ──────────────────────
exports.getPublicService = async (req, res) => {
  try {
    const { businessSlug, serviceSlug } = req.params;

    if (isSupabaseConfigured()) {
      const business = await resolveBusinessBySlug(businessSlug);
      if (!business) return res.status(404).json({ error: 'Business not found or not public.' });

      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', business.id)
        .eq('slug', serviceSlug)
        .eq('is_public', true)
        .limit(1);

      if (error) throw error;
      const service = data && data.length > 0 ? data[0] : null;
      if (!service) return res.status(404).json({ error: 'Service gig not found or not public.' });

      return res.json({
        service_id: service.id,
        service_name: service.name,
        service_slug: service.slug,
        short_description: service.short_description || service.description || '',
        description: service.description || '',
        base_price: service.base_price,
        price_unit: service.price_unit,
        duration_estimate: service.duration_estimate || service.estimated_duration || '',
        service_area: service.service_area || business.service_area || '',
        category: service.category || business.category || '',
        business_id: business.id,
        business_name: business.name,
        business_slug: business.slug,
        business_city: business.city,
        business_service_area: business.service_area,
        rating: business.rating
      });
    }

    const business = resolveMockBusinessBySlug(businessSlug);
    if (!business) return res.status(404).json({ error: 'Business not found or not public (Mock).' });

    const service = mockStore.services.find(s => s.business_id === business.id && s.slug === serviceSlug && s.is_public !== false);
    if (!service) return res.status(404).json({ error: 'Service gig not found or not public (Mock).' });

    return res.json({
      service_id: service.id,
      service_name: service.name,
      service_slug: service.slug,
      short_description: service.short_description || service.description || '',
      description: service.description || '',
      base_price: service.base_price,
      price_unit: service.price_unit,
      duration_estimate: service.duration_estimate || service.estimated_duration || '',
      service_area: service.service_area || business.service_area || '',
      category: service.category || business.category || '',
      business_id: business.id,
      business_name: business.name,
      business_slug: business.slug,
      business_city: business.city,
      business_service_area: business.service_area,
      rating: business.rating
    });
  } catch (err) {
    console.error('❌ getPublicService error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
