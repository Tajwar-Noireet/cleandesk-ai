const { mockStore } = require('../lib/mockStore');
const { isSupabaseConfigured, supabase } = require('../lib/supabaseClient');

// Get all conversations for a business
exports.getConversationsByBusiness = async (req, res) => {
  const { businessId } = req.params;

  // TODO: Add Supabase select query here in Phase 3

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
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

  // TODO: Add Supabase query for conversation + join messages here in Phase 3

  if (isSupabaseConfigured()) {
    try {
      const { data: conversation, error: cErr } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();
      if (cErr) throw cErr;

      const { data: messages, error: mErr } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      if (mErr) throw mErr;

      return res.json({
        ...conversation,
        messages
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
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

  res.json({
    ...conversation,
    messages
  });
};
