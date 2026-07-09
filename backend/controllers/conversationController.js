const { mockStore } = require('../lib/mockStore');
const { isSupabaseConfigured, supabase } = require('../lib/supabaseClient');
const { buildAnalysis, generateReceptionistDraft } = require('../lib/aiReceptionist');

const safeBusinessFields = 'id, name, slug, category, city, service_area, user_id';

const mapById = (items = []) => {
  const map = new Map();
  items.forEach((item) => {
    if (item?.id) map.set(item.id, item);
  });
  return map;
};

const sortByUpdated = (items = []) =>
  [...items].sort((a, b) => new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0));

const getOwnerBusiness = async (userId) => {
  if (!userId) return null;

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('businesses')
      .select(safeBusinessFields)
      .eq('user_id', userId)
      .limit(1);
    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
  }

  return mockStore.businesses.find((business) => business.user_id === userId) || null;
};

const getBusinessById = async (businessId) => {
  if (!businessId) return null;

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('businesses')
      .select(safeBusinessFields)
      .eq('id', businessId)
      .limit(1);
    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
  }

  return mockStore.businesses.find((business) => business.id === businessId) || null;
};

const checkBusinessOwnership = async (userId, businessId) => {
  const business = await getBusinessById(businessId);
  return Boolean(business && business.user_id === userId);
};

const getConversationById = async (conversationId) => {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .limit(1);
    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
  }

  return mockStore.conversations.find((conversation) => conversation.id === conversationId) || null;
};

const checkConversationOwnership = async (userId, conversationId) => {
  const conversation = await getConversationById(conversationId);
  if (!conversation) return { allowed: false, conversation: null };
  const allowed = await checkBusinessOwnership(userId, conversation.business_id);
  return { allowed, conversation };
};

const getLeadsForConversations = async (conversationIds) => {
  const ids = [...new Set(conversationIds.filter(Boolean))];
  if (ids.length === 0) return [];

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .in('conversation_id', ids);
    if (error) throw error;
    return data || [];
  }

  return mockStore.leads.filter((lead) => ids.includes(lead.conversation_id));
};

const getMessagesForConversations = async (conversationIds) => {
  const ids = [...new Set(conversationIds.filter(Boolean))];
  if (ids.length === 0) return [];

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .in('conversation_id', ids)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  return mockStore.messages
    .filter((message) => ids.includes(message.conversation_id))
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
};

const getServicesForBusiness = async (businessId) => {
  if (!businessId) return [];

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('business_id', businessId);
    if (error) throw error;
    return data || [];
  }

  return mockStore.services.filter((service) => service.business_id === businessId);
};

const getFAQsForBusiness = async (businessId) => {
  if (!businessId) return [];

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('business_id', businessId);
    if (error) throw error;
    return data || [];
  }

  return mockStore.faqs.filter((faq) => faq.business_id === businessId);
};

const getThreadContext = async (conversation) => {
  const [business, leads, messages, services, faqs] = await Promise.all([
    getBusinessById(conversation.business_id),
    getLeadsForConversations([conversation.id]),
    getMessagesForConversations([conversation.id]),
    getServicesForBusiness(conversation.business_id),
    getFAQsForBusiness(conversation.business_id)
  ]);

  const lead = leads[0] || null;
  const service = lead?.service_id
    ? services.find((item) => item.id === lead.service_id) || null
    : services.find((item) => item.id === conversation.service_id) || null;

  return { conversation, business, lead, service, messages, services, faqs };
};

const getLastMessageMap = (messages = []) => {
  const map = new Map();
  messages.forEach((message) => {
    const current = map.get(message.conversation_id);
    if (!current || new Date(message.created_at) > new Date(current.created_at)) {
      map.set(message.conversation_id, message);
    }
  });
  return map;
};

const enrichConversation = (conversation, { business, lead, lastMessage }) => ({
  ...conversation,
  business_name: business?.name || null,
  business_slug: business?.slug || null,
  business_category: business?.category || null,
  service_type: lead?.service_type || null,
  service_id: lead?.service_id || conversation.service_id || null,
  lead_id: lead?.id || null,
  lead_status: lead?.status || null,
  customer_summary: [lead?.service_type, lead?.address, lead?.preferred_date].filter(Boolean).join(' - '),
  latest_message_preview: lastMessage?.content || null,
  latest_message_sender: lastMessage?.sender || null,
  latest_message_at: lastMessage?.created_at || conversation.updated_at || conversation.created_at,
  unread_or_review: Boolean(conversation.needs_human_review)
});

const updateConversation = async (conversationId, updates) => {
  const payload = {
    ...updates,
    updated_at: new Date().toISOString()
  };

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('conversations')
      .update(payload)
      .eq('id', conversationId)
      .select();

    if (!error) return data && data.length > 0 ? data[0] : null;

    if (error.message && error.message.includes('updated_at')) {
      const { data: retryData, error: retryError } = await supabase
        .from('conversations')
        .update(updates)
        .eq('id', conversationId)
        .select();
      if (retryError) throw retryError;
      return retryData && retryData.length > 0 ? retryData[0] : null;
    }

    throw error;
  }

  const index = mockStore.conversations.findIndex((conversation) => conversation.id === conversationId);
  if (index === -1) return null;
  mockStore.conversations[index] = { ...mockStore.conversations[index], ...payload };
  return mockStore.conversations[index];
};

const createMessage = async (conversationId, sender, content) => {
  const cleanContent = String(content || '').trim();
  if (!cleanContent) {
    const err = new Error('Message content is required.');
    err.status = 400;
    throw err;
  }

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender,
        content: cleanContent
      })
      .select();
    if (error) throw error;
    return data[0];
  }

  const message = {
    id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    conversation_id: conversationId,
    sender,
    content: cleanContent,
    created_at: new Date().toISOString()
  };
  mockStore.messages.push(message);
  return message;
};

exports.getOwnerConversations = async (req, res) => {
  try {
    const business = await getOwnerBusiness(req.user?.id);
    if (!business) return res.status(404).json({ error: 'No business profile found for this owner.' });

    const conversations = isSupabaseConfigured()
      ? await (async () => {
          const { data, error } = await supabase
            .from('conversations')
            .select('*')
            .eq('business_id', business.id)
            .order('created_at', { ascending: false });
          if (error) throw error;
          return data || [];
        })()
      : mockStore.conversations.filter((conversation) => conversation.business_id === business.id);

    const ids = conversations.map((conversation) => conversation.id);
    const [leads, messages] = await Promise.all([
      getLeadsForConversations(ids),
      getMessagesForConversations(ids)
    ]);
    const leadMap = new Map();
    leads.forEach((lead) => {
      if (lead.conversation_id && !leadMap.has(lead.conversation_id)) leadMap.set(lead.conversation_id, lead);
    });
    const lastMessageMap = getLastMessageMap(messages);

    const msgCountMap = new Map();
    messages.forEach((msg) => {
      const cId = msg.conversation_id;
      msgCountMap.set(cId, (msgCountMap.get(cId) || 0) + 1);
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log('⚡ [DEV LOG - getOwnerConversations]:', JSON.stringify({
        authenticated_owner_id: req.user?.id || null,
        resolved_business_id: business.id,
        conversation_count: conversations.length,
        message_counts: Object.fromEntries(msgCountMap)
      }, null, 2));
    }

    return res.json(sortByUpdated(conversations.map((conversation) =>
      enrichConversation(conversation, {
        business,
        lead: leadMap.get(conversation.id),
        lastMessage: lastMessageMap.get(conversation.id)
      })
    )));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getConversationsByBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;
    const isOwner = await checkBusinessOwnership(req.user?.id, businessId);
    if (!isOwner) return res.status(403).json({ error: 'Forbidden: You do not own this business profile' });

    req.params.businessId = businessId;
    const business = await getBusinessById(businessId);
    const conversations = isSupabaseConfigured()
      ? await (async () => {
          const { data, error } = await supabase
            .from('conversations')
            .select('*')
            .eq('business_id', businessId)
            .order('created_at', { ascending: false });
          if (error) throw error;
          return data || [];
        })()
      : mockStore.conversations.filter((conversation) => conversation.business_id === businessId);

    const ids = conversations.map((conversation) => conversation.id);
    const [leads, messages] = await Promise.all([
      getLeadsForConversations(ids),
      getMessagesForConversations(ids)
    ]);
    const leadMap = new Map(leads.map((lead) => [lead.conversation_id, lead]));
    const lastMessageMap = getLastMessageMap(messages);

    return res.json(sortByUpdated(conversations.map((conversation) =>
      enrichConversation(conversation, {
        business,
        lead: leadMap.get(conversation.id),
        lastMessage: lastMessageMap.get(conversation.id)
      })
    )));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getConversationDetail = async (req, res) => {
  try {
    const conversationId = req.params.conversationId || req.params.id;
    const { allowed, conversation } = await checkConversationOwnership(req.user?.id, conversationId);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
    if (!allowed) return res.status(403).json({ error: 'Forbidden: You do not own this conversation' });

    const context = await getThreadContext(conversation);
    const analysis = buildAnalysis(context);

    return res.json({
      ...enrichConversation(conversation, {
        business: context.business,
        lead: context.lead,
        lastMessage: context.messages[context.messages.length - 1]
      }),
      business: context.business,
      lead: context.lead,
      service: context.service,
      messages: context.messages,
      ai: {
        ...analysis,
        confidence: conversation.ai_confidence ?? 0.8,
        suggested_reply: null,
        fallback_mode: false
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.sendOwnerMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const { allowed, conversation } = await checkConversationOwnership(req.user?.id, id);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
    if (!allowed) return res.status(403).json({ error: 'Forbidden: You do not own this conversation' });

    const message = await createMessage(id, 'owner', content);
    await updateConversation(id, { needs_human_review: false });

    const detail = await getThreadContext({ ...conversation, needs_human_review: false });
    return res.status(201).json({
      success: true,
      message,
      thread: {
        ...conversation,
        messages: detail.messages,
        lead: detail.lead,
        business: detail.business,
        service: detail.service
      }
    });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
};

exports.generateAiDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const { prompt } = req.body || {};
    const { allowed, conversation } = await checkConversationOwnership(req.user?.id, id);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
    if (!allowed) return res.status(403).json({ error: 'Forbidden: You do not own this conversation' });

    const context = await getThreadContext(conversation);
    const draft = await generateReceptionistDraft(context, { prompt });
    return res.json(draft);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.generateAndSendAiReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { prompt, content } = req.body || {};
    const { allowed, conversation } = await checkConversationOwnership(req.user?.id, id);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
    if (!allowed) return res.status(403).json({ error: 'Forbidden: You do not own this conversation' });

    const context = await getThreadContext(conversation);
    const draft = content
      ? { suggested_reply: content, ...(buildAnalysis(context)), confidence: 1, fallback_mode: false }
      : await generateReceptionistDraft(context, { prompt });
    const message = await createMessage(id, 'ai', draft.suggested_reply);
    await updateConversation(id, {
      needs_human_review: Boolean(draft.needs_human_review),
      ai_confidence: draft.confidence
    });

    return res.status(201).json({ success: true, message, ai: draft });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
};

exports.markReviewed = async (req, res) => {
  try {
    const { id } = req.params;
    const { allowed, conversation } = await checkConversationOwnership(req.user?.id, id);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
    if (!allowed) return res.status(403).json({ error: 'Forbidden: You do not own this conversation' });

    const updated = await updateConversation(id, { needs_human_review: false });
    return res.json(updated || { success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
