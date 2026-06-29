const { isSupabaseConfigured, supabase } = require('../lib/supabaseClient');

/**
 * Middleware to check authentication via Supabase JWT or fallback mock auth.
 * 
 * TODO: Fully implement JWT token validation with Supabase Auth in Phase 3.
 */
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    // If running in Mock Mode, assign a dummy user
    if (!isSupabaseConfigured()) {
      req.user = { id: 'mock-user-123', email: 'owner@sparklehome.co.uk' };
      return next();
    }
    return res.status(401).json({ error: 'No authorization header provided' });
  }

  const token = authHeader.split(' ')[1];

  if (!isSupabaseConfigured()) {
    // Mock validation
    if (token === 'mock-token') {
      req.user = { id: 'mock-user-123', email: 'owner@sparklehome.co.uk' };
      return next();
    }
    return res.status(401).json({ error: 'Invalid token (Mock Mode)' });
  }

  // Supabase Auth Integration
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid Supabase token' });
    }
    
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ error: 'Internal server authentication error' });
  }
};

module.exports = authMiddleware;
