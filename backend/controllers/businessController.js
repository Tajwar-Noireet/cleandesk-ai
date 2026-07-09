const { mockStore } = require('../lib/mockStore');
const { isSupabaseConfigured, supabase } = require('../lib/supabaseClient');

const sanitizeString = (value, maxLen = 500) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return String(value).trim().substring(0, maxLen);
};

const normalizeSlug = (value) => {
  const cleaned = sanitizeString(value, 120);
  if (!cleaned) return null;
  return cleaned
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || null;
};

const coerceBoolean = (value) => {
  if (value === undefined) return undefined;
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  return Boolean(value);
};

const buildBusinessPayload = (body) => {
  const payload = {};
  const stringFields = {
    name: 150,
    phone: 40,
    email: 200,
    service_area: 250,
    opening_hours: 250,
    description: 1000,
    category: 120,
    city: 120,
    postcode: 40,
    public_description: 1000,
    logo_url: 500
  };

  Object.entries(stringFields).forEach(([field, maxLen]) => {
    if (body[field] !== undefined) {
      payload[field] = sanitizeString(body[field], maxLen);
    }
  });

  if (body.slug !== undefined) {
    payload.slug = normalizeSlug(body.slug);
  }

  const nextIsPublic = coerceBoolean(body.is_public);
  if (nextIsPublic !== undefined) {
    payload.is_public = nextIsPublic;
  }

  return payload;
};

const getPublishValidationIssues = (business) => {
  if (business.is_public !== true) return [];

  const issues = [];
  if (!business.name) issues.push('Public business name is required before publishing.');
  if (!business.slug) issues.push('Slug is required before publishing.');
  if (!business.category) issues.push('Category is required before publishing.');
  if (!business.city && !business.service_area) {
    issues.push('City or service area is required before publishing.');
  }
  if (!business.public_description) {
    issues.push('Public description is required before publishing.');
  }
  return issues;
};

const ensureSlugIsAvailable = async (slug, currentBusinessId = null) => {
  if (!slug) return null;

  if (isSupabaseConfigured()) {
    let query = supabase
      .from('businesses')
      .select('id')
      .eq('slug', slug)
      .limit(1);

    if (currentBusinessId) {
      query = query.neq('id', currentBusinessId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
  }

  return mockStore.businesses.find(
    (business) => business.slug === slug && business.id !== currentBusinessId
  ) || null;
};

// Get business by ID
exports.getBusiness = async (req, res) => {
  const { id } = req.params;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', id);

      if (error) {
        console.error(`Supabase error loading business ${id}:`, error.message);
        throw error;
      }

      if (data && data.length > 0) {
        return res.json(data[0]);
      }
      return res.status(404).json({ error: 'Business not found in Supabase' });
    } catch (err) {
      return res.status(404).json({ error: 'Business search failed' });
    }
  }

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
        console.error(`Supabase error loading business for user ${userId}:`, error.message);
        throw error;
      }

      if (data && data.length > 0) {
        return res.json(data[0]);
      }
      return res.status(404).json({ error: 'No business profile found for this user' });
    } catch (err) {
      return res.status(500).json({ error: `Supabase query failed: ${err.message}` });
    }
  }

  const business = mockStore.businesses.find(b => b.user_id === userId);
  if (!business) {
    return res.status(404).json({ error: 'No business profile found for this user (Mock Store)' });
  }
  res.json(business);
};

// Create a business profile
exports.createBusiness = async (req, res) => {
  const userId = req.user ? req.user.id : null;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized to create business profile' });
  }

  const payload = buildBusinessPayload(req.body);
  const nextBusiness = {
    ...payload,
    user_id: userId,
    is_public: payload.is_public === true
  };

  const validationIssues = getPublishValidationIssues(nextBusiness);
  if (validationIssues.length > 0) {
    return res.status(400).json({ error: validationIssues.join(' ') });
  }

  try {
    const slugConflict = await ensureSlugIsAvailable(nextBusiness.slug);
    if (slugConflict) {
      return res.status(409).json({ error: `Slug "${nextBusiness.slug}" is already taken.` });
    }
  } catch (err) {
    return res.status(500).json({ error: `Slug availability check failed: ${err.message}` });
  }

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .insert([nextBusiness])
        .select();

      if (error) {
        console.error('Supabase error creating business:', error.message);
        throw error;
      }
      return res.status(201).json(data[0]);
    } catch (err) {
      return res.status(500).json({ error: `Supabase create failed: ${err.message}` });
    }
  }

  const newBusiness = {
    id: `b-${Date.now()}`,
    ...nextBusiness,
    created_at: new Date().toISOString()
  };
  mockStore.businesses.push(newBusiness);
  res.status(201).json(newBusiness);
};

// Update business profile
exports.updateBusiness = async (req, res) => {
  const { id } = req.params;
  const userId = req.user ? req.user.id : null;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized to update business profile' });
  }

  const payload = buildBusinessPayload(req.body);

  if (isSupabaseConfigured()) {
    try {
      const { data: current, error: fetchErr } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', id);

      if (fetchErr || !current || current.length === 0) {
        return res.status(404).json({ error: 'Business not found to verify ownership' });
      }

      if (current[0].user_id !== userId) {
        return res.status(403).json({ error: 'Forbidden: You do not own this business' });
      }

      const nextBusiness = { ...current[0], ...payload };
      const validationIssues = getPublishValidationIssues(nextBusiness);
      if (validationIssues.length > 0) {
        return res.status(400).json({ error: validationIssues.join(' ') });
      }

      const slugConflict = await ensureSlugIsAvailable(nextBusiness.slug, id);
      if (slugConflict) {
        return res.status(409).json({ error: `Slug "${nextBusiness.slug}" is already taken.` });
      }

      const { data, error } = await supabase
        .from('businesses')
        .update(payload)
        .eq('id', id)
        .select();

      if (error) {
        console.error(`Supabase error updating business ${id}:`, error.message);
        throw error;
      }

      if (data && data.length > 0) {
        return res.json(data[0]);
      }
      return res.status(404).json({ error: 'Business not found to update' });
    } catch (err) {
      return res.status(500).json({ error: `Supabase update failed: ${err.message}` });
    }
  }

  const index = mockStore.businesses.findIndex(b => b.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Business not found' });
  }

  if (mockStore.businesses[index].user_id !== userId) {
    return res.status(403).json({ error: 'Forbidden: You do not own this business' });
  }

  try {
    const nextBusiness = { ...mockStore.businesses[index], ...payload };
    const validationIssues = getPublishValidationIssues(nextBusiness);
    if (validationIssues.length > 0) {
      return res.status(400).json({ error: validationIssues.join(' ') });
    }

    const slugConflict = await ensureSlugIsAvailable(nextBusiness.slug, id);
    if (slugConflict) {
      return res.status(409).json({ error: `Slug "${nextBusiness.slug}" is already taken.` });
    }

    mockStore.businesses[index] = nextBusiness;
    return res.json(nextBusiness);
  } catch (err) {
    return res.status(500).json({ error: `Mock update failed: ${err.message}` });
  }
};
