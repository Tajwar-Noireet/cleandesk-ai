const { mockStore } = require('../lib/mockStore');
const { isSupabaseConfigured, supabase } = require('../lib/supabaseClient');

// Get all conversations for a business
exports.getConversationsByBusiness = async (req, res) => {
  const { businessId } = req.params;

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

      const { data: messages, error: mErr } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (mErr) {
        console.error(`❌ Supabase error loading messages for conversation ${conversationId}:`, mErr.message);
        throw mErr;
      }

      return res.json({
        ...conversation,
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

  res.json({
    ...conversation,
    messages
  });
};
