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
      console.error('❌ Supabase error checking business ownership for Conversations:', err.message);
      return false;
    }
  }

  // Fallback to Mock Store
  const business = mockStore.businesses.find(b => b.id === businessId);
  if (!business) return false;
  return business.user_id === userId;
};

// Helper to check conversation ownership by ID
const checkConversationOwnership = async (userId, conversationId) => {
  if (!userId || !conversationId) return false;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('business_id')
        .eq('id', conversationId);
      
      if (error || !data || data.length === 0) {
        return false;
      }
      return await checkBusinessOwnership(userId, data[0].business_id);
    } catch (err) {
      console.error('❌ Supabase error checking Conversation ownership:', err.message);
      return false;
    }
  }

  // Fallback to Mock Store
  const conversation = mockStore.conversations.find(c => c.id === conversationId);
  if (!conversation) return false;
  return await checkBusinessOwnership(userId, conversation.business_id);
};

// Get all conversations for a business
exports.getConversationsByBusiness = async (req, res) => {
  const { businessId } = req.params;
  const userId = req.user ? req.user.id : null;

  // Enforce ownership
  const isOwner = await checkBusinessOwnership(userId, businessId);
  if (!isOwner) {
    return res.status(403).json({ error: 'Forbidden: You do not own this business profile' });
  }

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error(`❌ Supabase error loading conversations for business ${businessId}:`, error.message);
        throw error;
      }
      return res.json(data || []);
    } catch (err) {
      return res.status(500).json({ error: `Supabase load conversations failed: ${err.message}` });
    }
  }

  // Mock Store filter
  const conversations = mockStore.conversations
    .filter(c => c.business_id === businessId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json(conversations);
};

// Get details of a single conversation (including messages)
exports.getConversationDetail = async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user ? req.user.id : null;

  // Enforce ownership
  const isOwner = await checkConversationOwnership(userId, conversationId);
  if (!isOwner) {
    return res.status(403).json({ error: 'Forbidden: You do not own this conversation' });
  }

  if (isSupabaseConfigured()) {
    try {
      // Avoid .single() here to cleanly handle 404s without PGRST116 warnings in logs
      const { data: convData, error: cErr } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId);
      
      if (cErr) {
        console.error(`❌ Supabase error loading conversation details for ${conversationId}:`, cErr.message);
        throw cErr;
      }

      if (!convData || convData.length === 0) {
        return res.status(404).json({ error: 'Conversation not found in Supabase' });
      }

      const conversation = convData[0];

      // Fetch messages
      const { data: messages, error: mErr } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (mErr) {
        console.error(`❌ Supabase error loading messages for conversation ${conversationId}:`, mErr.message);
        throw mErr;
      }

      // Fetch associated lead (if any exists yet)
      const { data: leadData, error: lErr } = await supabase
        .from('leads')
        .select('*')
        .eq('conversation_id', conversationId);

      if (lErr) {
        console.error(`❌ Supabase error loading lead for conversation ${conversationId}:`, lErr.message);
      }

      return res.json({
        ...conversation,
        lead: leadData && leadData.length > 0 ? leadData[0] : null,
        messages: messages || []
      });
    } catch (err) {
      return res.status(500).json({ error: `Supabase load conversation details failed: ${err.message}` });
    }
  }

  // Mock Store search
  const conversation = mockStore.conversations.find(c => c.id === conversationId);
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  const messages = mockStore.messages
    .filter(m => m.conversation_id === conversationId)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  // Find associated lead
  const lead = mockStore.leads.find(l => l.conversation_id === conversationId);

  res.json({
    ...conversation,
    lead: lead || null,
    messages
  });
};
