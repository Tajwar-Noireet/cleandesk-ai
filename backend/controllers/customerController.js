const { mockStore } = require('../lib/mockStore');
const { isSupabaseConfigured, supabase } = require('../lib/supabaseClient');
const { generateReceptionistDraft } = require('../lib/aiReceptionist');

const getUserEmail = (user) => (user?.email || '').trim().toLowerCase();

const getCustomerIsolationFilter = (user) => {
  const email = getUserEmail(user);
  return `customer_user_id.eq.${user.id},customer_email.eq.${email}`;
};

const safeBusinessFields = 'id, name, slug, category, city, service_area';

const toSafeBusiness = (business) => {
  if (!business) return null;
  return {
    business_id: business.id,
    business_name: business.name,
    business_slug: business.slug,
    category: business.category,
    city: business.city,
    service_area: business.service_area
  };
};

const mapById = (items) => {
  const map = new Map();
  items.forEach((item) => {
    if (item?.id) map.set(item.id, item);
  });
  return map;
};

const matchesCustomer = (record, user) => {
  const email = getUserEmail(user);
  return record.customer_user_id === user.id || (record.customer_email || '').toLowerCase() === email;
};

const attachMissingCustomerUserIds = async (user, leads, conversations) => {
  const email = getUserEmail(user);

  const missingLeadIds = leads
    .filter((lead) => !lead.customer_user_id && (lead.customer_email || '').toLowerCase() === email)
    .map((lead) => lead.id);

  const missingConversationIds = conversations
    .filter((conversation) => !conversation.customer_user_id && (conversation.customer_email || '').toLowerCase() === email)
    .map((conversation) => conversation.id);

  if (isSupabaseConfigured()) {
    if (missingLeadIds.length > 0) {
      await supabase
        .from('leads')
        .update({ customer_user_id: user.id })
        .in('id', missingLeadIds)
        .eq('customer_email', email);
    }

    if (missingConversationIds.length > 0) {
      await supabase
        .from('conversations')
        .update({ customer_user_id: user.id })
        .in('id', missingConversationIds)
        .eq('customer_email', email);
    }
  } else {
    mockStore.leads.forEach((lead) => {
      if (missingLeadIds.includes(lead.id)) lead.customer_user_id = user.id;
    });
    mockStore.conversations.forEach((conversation) => {
      if (missingConversationIds.includes(conversation.id)) conversation.customer_user_id = user.id;
    });
  }

  leads.forEach((lead) => {
    if (missingLeadIds.includes(lead.id)) lead.customer_user_id = user.id;
  });
  conversations.forEach((conversation) => {
    if (missingConversationIds.includes(conversation.id)) conversation.customer_user_id = user.id;
  });
};

const getBusinessMapForRecords = async (records) => {
  const ids = [...new Set(records.map((record) => record.business_id).filter(Boolean))];
  if (ids.length === 0) return new Map();

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('businesses')
      .select(safeBusinessFields)
      .in('id', ids);
    if (error) throw error;
    return mapById(data || []);
  }

  return mapById(mockStore.businesses.filter((business) => ids.includes(business.id)));
};

const getLastMessageMap = async (conversationIds) => {
  const ids = [...new Set(conversationIds.filter(Boolean))];
  if (ids.length === 0) return new Map();

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('messages')
      .select('id, conversation_id, sender, content, created_at')
      .in('conversation_id', ids)
      .order('created_at', { ascending: false });
    if (error) throw error;

    const map = new Map();
    (data || []).forEach((message) => {
      if (!map.has(message.conversation_id)) {
        map.set(message.conversation_id, message);
      }
    });
    return map;
  }

  const map = new Map();
  mockStore.messages
    .filter((message) => ids.includes(message.conversation_id))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .forEach((message) => {
      if (!map.has(message.conversation_id)) {
        map.set(message.conversation_id, message);
      }
  });
  return map;
};

const safeUpdateConversationRecord = async (conversationId, updates) => {
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

const safeUpdateLeadRecord = async (leadId, updates) => {
  const payload = {
    ...updates,
    updated_at: new Date().toISOString()
  };

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('leads')
      .update(payload)
      .eq('id', leadId)
      .select();

    if (!error) return data && data.length > 0 ? data[0] : null;

    if (error.message && error.message.includes('updated_at')) {
      const { data: retryData, error: retryError } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', leadId)
        .select();
      if (retryError) throw retryError;
      return retryData && retryData.length > 0 ? retryData[0] : null;
    }

    throw error;
  }

  const index = mockStore.leads.findIndex((lead) => lead.id === leadId);
  if (index === -1) return null;
  mockStore.leads[index] = { ...mockStore.leads[index], ...payload };
  return mockStore.leads[index];
};

const createConversationMessage = async (conversationId, sender, content, metadata = null) => {
  const cleanContent = String(content || '').trim();
  if (!cleanContent) {
    const err = new Error('Message content is required.');
    err.status = 400;
    throw err;
  }

  if (isSupabaseConfigured()) {
    const payload = {
      conversation_id: conversationId,
      sender,
      content: cleanContent,
      ...(metadata ? { metadata } : {})
    };

    const { data, error } = await supabase
      .from('messages')
      .insert(payload)
      .select()
      .single();

    if (!error) return data;

    if (error.message && error.message.includes('metadata')) {
      const { data: retryData, error: retryError } = await supabase
        .from('messages')
        .insert({ conversation_id: conversationId, sender, content: cleanContent })
        .select()
        .single();
      if (retryError) throw retryError;
      return retryData;
    }

    throw error;
  }

  const message = {
    id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    conversation_id: conversationId,
    sender,
    content: cleanContent,
    metadata: metadata || {},
    created_at: new Date().toISOString()
  };
  mockStore.messages.push(message);
  return message;
};

const enrichLead = (lead, businessMap) => {
  const business = businessMap.get(lead.business_id);
  return {
    ...lead,
    ...toSafeBusiness(business),
    last_updated: lead.updated_at || lead.created_at
  };
};

const enrichConversation = (conversation, businessMap, leadByConversationId, lastMessageMap) => {
  const business = businessMap.get(conversation.business_id);
  const lead = leadByConversationId.get(conversation.id);
  const lastMessage = lastMessageMap.get(conversation.id);
  return {
    id: conversation.id,
    business_id: conversation.business_id,
    customer_name: conversation.customer_name,
    customer_email: conversation.customer_email,
    customer_phone: conversation.customer_phone,
    customer_user_id: conversation.customer_user_id,
    status: conversation.status,
    needs_human_review: conversation.needs_human_review,
    created_at: conversation.created_at,
    updated_at: conversation.updated_at,
    service_type: lead?.service_type || conversation.service_type || null,
    lead_id: lead?.id || null,
    last_message_preview: lastMessage?.content || null,
    last_message_at: lastMessage?.created_at || conversation.updated_at || conversation.created_at,
    ...toSafeBusiness(business)
  };
};

const loadCustomerRecords = async (user) => {
  if (!user?.id || !user?.email) {
    const err = new Error('Unauthorized: Customer session missing');
    err.status = 401;
    throw err;
  }

  let leads = [];
  let conversations = [];

  if (isSupabaseConfigured()) {
    const { data: leadData, error: leadErr } = await supabase
      .from('leads')
      .select('*')
      .or(getCustomerIsolationFilter(user))
      .order('created_at', { ascending: false });
    if (leadErr) throw leadErr;

    const { data: conversationData, error: conversationErr } = await supabase
      .from('conversations')
      .select('*')
      .or(getCustomerIsolationFilter(user))
      .order('created_at', { ascending: false });
    if (conversationErr) throw conversationErr;

    leads = leadData || [];
    conversations = conversationData || [];
  } else {
    leads = mockStore.leads
      .filter((lead) => matchesCustomer(lead, user))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    conversations = mockStore.conversations
      .filter((conversation) => matchesCustomer(conversation, user))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  await attachMissingCustomerUserIds(user, leads, conversations);

  const businessMap = await getBusinessMapForRecords([...leads, ...conversations]);
  const leadByConversationId = new Map();
  leads.forEach((lead) => {
    if (lead.conversation_id && !leadByConversationId.has(lead.conversation_id)) {
      leadByConversationId.set(lead.conversation_id, lead);
    }
  });
  const lastMessageMap = await getLastMessageMap(conversations.map((conversation) => conversation.id));

  const enrichedLeads = leads.map((lead) => enrichLead(lead, businessMap));
  const enrichedConversations = conversations.map((conversation) =>
    enrichConversation(conversation, businessMap, leadByConversationId, lastMessageMap)
  );

  const businesses = [...businessMap.values()].map((business) => toSafeBusiness(business));

  return {
    leads: enrichedLeads,
    conversations: enrichedConversations,
    businesses
  };
};

exports.getCustomerDashboard = async (req, res) => {
  try {
    const records = await loadCustomerRecords(req.user);
    return res.json({
      ...records,
      user: { id: req.user.id, email: req.user.email }
    });
  } catch (err) {
    console.error('getCustomerDashboard error:', err.message);
    return res.status(err.status || 500).json({ error: err.message });
  }
};

exports.getCustomerConversations = async (req, res) => {
  try {
    const records = await loadCustomerRecords(req.user);
    
    const convIds = records.conversations.map(c => c.id);
    let totalMessages = 0;
    if (convIds.length > 0) {
      if (isSupabaseConfigured()) {
        try {
          const { count, error } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .in('conversation_id', convIds);
          if (!error) totalMessages = count || 0;
        } catch (e) {}
      } else {
        totalMessages = mockStore.messages.filter(m => convIds.includes(m.conversation_id)).length;
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('⚡ [DEV LOG - getCustomerConversations]:', JSON.stringify({
        authenticated_customer_email: req.user?.email || null,
        conversation_count: records.conversations.length,
        message_count: totalMessages
      }, null, 2));
    }

    return res.json(records.conversations);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
};

exports.getCustomerConversationDetail = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    let conversation = null;
    let messages = [];
    let lead = null;

    if (isSupabaseConfigured()) {
      const { data: conversations, error: convErr } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', id);
      if (convErr) throw convErr;
      conversation = conversations && conversations.length > 0 ? conversations[0] : null;

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      if (!matchesCustomer(conversation, user)) {
        return res.status(403).json({ error: 'Forbidden: You do not own this conversation' });
      }

      if (!conversation.customer_user_id && (conversation.customer_email || '').toLowerCase() === getUserEmail(user)) {
        await supabase
          .from('conversations')
          .update({ customer_user_id: user.id })
          .eq('id', conversation.id)
          .eq('customer_email', getUserEmail(user));
        conversation.customer_user_id = user.id;
      }

      const { data: messageData, error: msgErr } = await supabase
        .from('messages')
        .select('id, conversation_id, sender, content, created_at')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true });
      if (msgErr) throw msgErr;
      messages = messageData || [];

      const { data: leadData, error: leadErr } = await supabase
        .from('leads')
        .select('*')
        .eq('conversation_id', id)
        .or(getCustomerIsolationFilter(user));
      if (leadErr) throw leadErr;

      lead = leadData && leadData.length > 0 ? leadData[0] : null;
    } else {
      conversation = mockStore.conversations.find((item) => item.id === id) || null;
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found (Mock)' });
      }
      if (!matchesCustomer(conversation, user)) {
        return res.status(403).json({ error: 'Forbidden: Access denied (Mock)' });
      }
      if (!conversation.customer_user_id && (conversation.customer_email || '').toLowerCase() === getUserEmail(user)) {
        conversation.customer_user_id = user.id;
      }
      messages = mockStore.messages
        .filter((message) => message.conversation_id === id)
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      lead = mockStore.leads.find((item) => item.conversation_id === id && matchesCustomer(item, user)) || null;
    }

    const businessMap = await getBusinessMapForRecords([conversation]);
    const business = businessMap.get(conversation.business_id);

    return res.json({
      id: conversation.id,
      business_id: conversation.business_id,
      customer_name: conversation.customer_name,
      customer_email: conversation.customer_email,
      customer_phone: conversation.customer_phone,
      customer_user_id: conversation.customer_user_id,
      status: conversation.status,
      needs_human_review: conversation.needs_human_review,
      created_at: conversation.created_at,
      updated_at: conversation.updated_at,
      service_type: lead?.service_type || null,
      lead_id: lead?.id || null,
      lead: lead ? enrichLead(lead, businessMap) : null,
      messages,
      ...toSafeBusiness(business)
    });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
};


// ---------------------------------------------------------------------------
// AI follow-up helper — triggered after every customer message in an existing
// conversation. Never triggered by owner or AI sender (loop guard).
// ---------------------------------------------------------------------------
const maybeCreateAiFollowUpReply = async ({ conversationId, conversation, lead, newCustomerMessage }) => {
  const enabled = process.env.AUTO_AI_REPLY_ON_ENQUIRY !== 'false';
  if (!enabled) return { auto_replied: false, reason: 'disabled' };

  try {
    // Fetch business record for this conversation
    let business = null;
    if (isSupabaseConfigured()) {
      const { data: bizData } = await supabase
        .from('businesses')
        .select('id, name, slug, category, city, service_area, public_description, opening_hours')
        .eq('id', conversation.business_id)
        .limit(1);
      business = bizData && bizData.length > 0 ? bizData[0] : null;
    } else {
      business = mockStore.businesses.find((b) => b.id === conversation.business_id) || null;
    }

    if (!business) return { auto_replied: false, reason: 'business_not_found' };

    // Fetch recent message history (last 20 messages) — includes the new customer message
    let recentMessages = [];
    if (isSupabaseConfigured()) {
      const { data: msgData } = await supabase
        .from('messages')
        .select('id, conversation_id, sender, content, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(20);
      recentMessages = msgData || [];
    } else {
      recentMessages = mockStore.messages
        .filter((m) => m.conversation_id === conversationId)
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        .slice(-20);
    }

    // If the most recent message is NOT from the customer, skip (prevents loops)
    const lastMsg = recentMessages[recentMessages.length - 1];
    if (lastMsg && lastMsg.sender !== 'customer') {
      return { auto_replied: false, reason: 'last_message_not_customer' };
    }

    // ---------------------------------------------------------------------------
    // Safety limiter: prevent AI from becoming an uncontrolled chatbot.
    // Count how many consecutive AI messages appeared immediately BEFORE the
    // current customer message (i.e. tail of the thread before this send).
    // If >= MAX, mark needs_human_review and stop auto-sending.
    // Owner can still generate drafts manually from the dashboard.
    // Configurable via AI_MAX_CONSECUTIVE_REPLIES env var (default: 2).
    // ---------------------------------------------------------------------------
    const MAX_CONSECUTIVE_AI_REPLIES = Math.max(1, parseInt(process.env.AI_MAX_CONSECUTIVE_REPLIES || '2', 10));
    const messagesBeforeCurrent = recentMessages.slice(0, -1); // exclude the new customer message
    let consecutiveAiCount = 0;
    for (let i = messagesBeforeCurrent.length - 1; i >= 0; i--) {
      if (messagesBeforeCurrent[i].sender === 'ai') {
        consecutiveAiCount++;
      } else {
        break; // stop as soon as we hit a non-AI message
      }
    }
    if (consecutiveAiCount >= MAX_CONSECUTIVE_AI_REPLIES) {
      await safeUpdateConversationRecord(conversationId, { needs_human_review: true });
      return {
        auto_replied: false,
        needs_human_review: true,
        reason: 'consecutive_ai_limit_reached',
        consecutive_ai_count: consecutiveAiCount,
        limit: MAX_CONSECUTIVE_AI_REPLIES
      };
    }

    const [services, faqs] = await Promise.all([
      getBusinessServicesForAi(business.id),
      getBusinessFaqsForAi(business.id)
    ]);


    const draft = await generateReceptionistDraft(
      {
        conversation,
        business,
        lead: lead || {},
        service: null,
        messages: recentMessages,
        services,
        faqs
      },
      {
        prompt: newCustomerMessage
      }
    );

    if (!draft?.suggested_reply) {
      return { auto_replied: false, reason: 'empty_draft' };
    }

    // If needs human review, mark conversation but do NOT auto-send the message
    if (draft.needs_human_review) {
      await safeUpdateConversationRecord(conversationId, {
        needs_human_review: true,
        ai_confidence: draft.confidence ?? null
      });
      return {
        auto_replied: false,
        needs_human_review: true,
        reason: 'needs_human_review',
        draft_preview: draft.suggested_reply,
        confidence: draft.confidence ?? null,
        intent: draft.intent || null
      };
    }

    // Confident — save the AI message
    const aiMessage = await createConversationMessage(
      conversationId,
      'ai',
      draft.suggested_reply,
      {
        source: 'ai_receptionist',
        trigger: 'customer_follow_up',
        mode: draft.fallback_mode ? 'fallback' : 'openai',
        confidence: draft.confidence ?? null,
        intent: draft.intent || null,
        needs_human_review: false
      }
    );

    await safeUpdateConversationRecord(conversationId, {
      ai_confidence: draft.confidence ?? null,
      needs_human_review: false
    });

    return {
      auto_replied: true,
      message_id: aiMessage.id,
      message: aiMessage,
      confidence: draft.confidence ?? null,
      fallback_mode: Boolean(draft.fallback_mode),
      needs_human_review: false,
      intent: draft.intent || null,
      missing_details: draft.missing_details || []
    };
  } catch (err) {
    // AI failure must never block the customer message — log and continue
    console.warn('[AI follow-up] Skipped:', err.message);
    return { auto_replied: false, error: err.message };
  }
};

exports.sendCustomerConversationMessage = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { content } = req.body || {};

    if (!user?.id || !user?.email) {
      return res.status(401).json({ error: 'Unauthorized: Customer session missing' });
    }

    let conversation = null;
    let lead = null;

    if (isSupabaseConfigured()) {
      const { data: conversations, error: convErr } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', id);
      if (convErr) throw convErr;
      conversation = conversations && conversations.length > 0 ? conversations[0] : null;

      if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
      if (!matchesCustomer(conversation, user)) {
        return res.status(403).json({ error: 'Forbidden: You do not own this conversation' });
      }

      const { data: leads, error: leadErr } = await supabase
        .from('leads')
        .select('*')
        .eq('conversation_id', id)
        .or(getCustomerIsolationFilter(user));
      if (leadErr) throw leadErr;
      lead = leads && leads.length > 0 ? leads[0] : null;

      if (!conversation.customer_user_id && (conversation.customer_email || '').toLowerCase() === getUserEmail(user)) {
        conversation = await safeUpdateConversationRecord(conversation.id, { customer_user_id: user.id }) || {
          ...conversation,
          customer_user_id: user.id
        };
      }

      if (lead && !lead.customer_user_id && (lead.customer_email || '').toLowerCase() === getUserEmail(user)) {
        lead = await safeUpdateLeadRecord(lead.id, { customer_user_id: user.id }) || {
          ...lead,
          customer_user_id: user.id
        };
      }
    } else {
      conversation = mockStore.conversations.find((item) => item.id === id) || null;
      if (!conversation) return res.status(404).json({ error: 'Conversation not found (Mock)' });
      if (!matchesCustomer(conversation, user)) {
        return res.status(403).json({ error: 'Forbidden: Access denied (Mock)' });
      }

      if (!conversation.customer_user_id && (conversation.customer_email || '').toLowerCase() === getUserEmail(user)) {
        conversation.customer_user_id = user.id;
      }

      lead = mockStore.leads.find((item) => item.conversation_id === id && matchesCustomer(item, user)) || null;
      if (lead && !lead.customer_user_id && (lead.customer_email || '').toLowerCase() === getUserEmail(user)) {
        lead.customer_user_id = user.id;
      }
    }

    // 1. Save the customer message
    const message = await createConversationMessage(id, 'customer', content);

    // 2. Trigger AI follow-up (non-blocking — failure cannot reject the response)
    const aiResult = await maybeCreateAiFollowUpReply({
      conversationId: id,
      conversation,
      lead,
      newCustomerMessage: content
    });

    // 3. Update conversation status
    const conversationUpdates = { status: 'open' };
    if (!aiResult.auto_replied) {
      // AI did not reply — flag for owner human review
      conversationUpdates.needs_human_review = true;
    }
    const updatedConversation = await safeUpdateConversationRecord(id, conversationUpdates);

    return res.status(201).json({
      success: true,
      message,
      ai_reply: aiResult.auto_replied ? aiResult.message : null,
      ai_result: {
        auto_replied: aiResult.auto_replied,
        needs_human_review: aiResult.needs_human_review || false,
        confidence: aiResult.confidence ?? null,
        intent: aiResult.intent || null,
        fallback_mode: aiResult.fallback_mode || false,
        reason: aiResult.reason || null
      },
      conversation: updatedConversation || conversation,
      lead
    });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
};



exports.getCustomerBookings = async (req, res) => {
  try {
    const records = await loadCustomerRecords(req.user);
    return res.json(records.leads);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
};

exports.requestUpdateOrReschedule = async (req, res) => {
  try {
    const user = req.user;
    const { leadId, notes } = req.body;

    if (!leadId || !notes) {
      return res.status(400).json({ error: 'leadId and notes are required' });
    }

    let updatedLead = null;

    if (isSupabaseConfigured()) {
      const { data: leads, error: leadErr } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId);
      if (leadErr) throw leadErr;

      const lead = leads && leads.length > 0 ? leads[0] : null;
      if (!lead) return res.status(404).json({ error: 'Lead booking not found' });
      if (!matchesCustomer(lead, user)) return res.status(403).json({ error: 'Forbidden: Access denied' });

      const newNotes = `${lead.notes || ''}\n[Customer Update Request]: ${notes}`.trim();
      const updatePayload = {
        notes: newNotes
      };
      if (!lead.customer_user_id && (lead.customer_email || '').toLowerCase() === getUserEmail(user)) {
        updatePayload.customer_user_id = user.id;
      }

      const { data: leadData, error: updateErr } = await supabase
        .from('leads')
        .update(updatePayload)
        .eq('id', leadId)
        .select();
      if (updateErr) throw updateErr;
      updatedLead = leadData && leadData.length > 0 ? leadData[0] : null;

      if (lead.conversation_id) {
        await supabase
          .from('conversations')
          .update({ needs_human_review: true })
          .eq('id', lead.conversation_id);
      }
    } else {
      const index = mockStore.leads.findIndex((lead) => lead.id === leadId);
      if (index === -1) return res.status(404).json({ error: 'Lead booking not found (Mock)' });

      const lead = mockStore.leads[index];
      if (!matchesCustomer(lead, user)) return res.status(403).json({ error: 'Forbidden: Access denied (Mock)' });

      mockStore.leads[index].notes = `${lead.notes || ''}\n[Customer Update Request]: ${notes}`.trim();
      if (!mockStore.leads[index].customer_user_id && (mockStore.leads[index].customer_email || '').toLowerCase() === getUserEmail(user)) {
        mockStore.leads[index].customer_user_id = user.id;
      }

      if (lead.conversation_id) {
        const convIndex = mockStore.conversations.findIndex((conversation) => conversation.id === lead.conversation_id);
        if (convIndex !== -1) {
          mockStore.conversations[convIndex].needs_human_review = true;
        }
      }
      updatedLead = mockStore.leads[index];
    }

    const businessMap = await getBusinessMapForRecords(updatedLead ? [updatedLead] : []);
    return res.json(updatedLead ? enrichLead(updatedLead, businessMap) : { success: true });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
};

exports.updateCustomerProfile = async (req, res) => {
  try {
    const user = req.user;
    const { customer_name, customer_phone, address } = req.body;

    if (isSupabaseConfigured()) {
      const { error: leadErr } = await supabase
        .from('leads')
        .update({ customer_name, customer_phone, address })
        .or(getCustomerIsolationFilter(user));
      if (leadErr) throw leadErr;

      const { error: convErr } = await supabase
        .from('conversations')
        .update({ customer_name, customer_phone })
        .or(getCustomerIsolationFilter(user));
      if (convErr) throw convErr;

      return res.json({ success: true, customer_name, customer_phone, address });
    }

    mockStore.leads.forEach((lead, index) => {
      if (matchesCustomer(lead, user)) {
        mockStore.leads[index].customer_name = customer_name;
        mockStore.leads[index].customer_phone = customer_phone;
        mockStore.leads[index].address = address;
      }
    });

    mockStore.conversations.forEach((conversation, index) => {
      if (matchesCustomer(conversation, user)) {
        mockStore.conversations[index].customer_name = customer_name;
        mockStore.conversations[index].customer_phone = customer_phone;
      }
    });

    return res.json({ success: true, customer_name, customer_phone, address });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
};

const sanitizeString = (str, maxLen = 500) =>
  typeof str === 'string' ? str.trim().substring(0, maxLen) : null;

const normalizeSlug = (slug) =>
  sanitizeString(slug, 120)?.toLowerCase().replace(/[^a-z0-9-]/g, '') || null;

const normalizeServiceSlug = (value) =>
  typeof value === 'string'
    ? value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
    : null;

const resolveBusinessForPublicEnquiry = async ({ businessId, businessSlug, allowDemoFallback }) => {
  const cleanBusinessId = sanitizeString(businessId, 80);
  const cleanBusinessSlug = normalizeSlug(businessSlug) || (allowDemoFallback ? 'sparklehome-cleaning' : null);

  if (!cleanBusinessId && !cleanBusinessSlug) {
    return {
      status: 400,
      error: 'business_id or business_slug is required.'
    };
  }

  if (isSupabaseConfigured()) {
    let query = supabase
      .from('businesses')
      .select('id, name, slug, category, city, service_area, public_description, opening_hours, is_public');

    query = cleanBusinessId
      ? query.eq('id', cleanBusinessId)
      : query.eq('slug', cleanBusinessSlug);

    const { data, error } = await query.limit(1);
    if (error) throw error;

    const business = data && data.length > 0 ? data[0] : null;
    if (!business) {
      return { status: 404, error: 'Business not found.' };
    }
    if (business.is_public !== true) {
      return { status: 403, error: 'Business is not accepting public enquiries.' };
    }

    return { business };
  }

  const business = mockStore.businesses.find((item) => (
    cleanBusinessId ? item.id === cleanBusinessId : item.slug === cleanBusinessSlug
  ));

  if (!business) {
    return { status: 404, error: 'Business not found (Mock).' };
  }
  if (business.is_public !== true) {
    return { status: 403, error: 'Business is not accepting public enquiries (Mock).' };
  }

  return { business };
};

const resolveOptionalCustomerUser = async (req) => {
  const authHeader = req.headers?.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return null;

  if (isSupabaseConfigured()) {
    if (token === 'mock-token') return null;
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    return user;
  }

  if (token === 'mock-customer-token') {
    const rawEmail = typeof req.headers['x-customer-email'] === 'string'
      ? req.headers['x-customer-email']
      : 'sarah@jenkins.com';
    const email = rawEmail.trim().toLowerCase() || 'sarah@jenkins.com';
    const id = `mock-customer-${email.replace(/[^a-z0-9]/g, '-')}`;
    return { id, email };
  }

  return null;
};

const getBusinessServicesForAi = async (businessId) => {
  if (!businessId) return [];

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_public', true)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  return mockStore.services.filter((service) => service.business_id === businessId && service.is_public !== false);
};

const getBusinessFaqsForAi = async (businessId) => {
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

const maybeCreateAiReceptionistReply = async ({ conversation, business, lead, service, firstMessage }) => {
  const enabled = process.env.AUTO_AI_REPLY_ON_ENQUIRY !== 'false';
  if (!enabled) {
    return { auto_replied: false, reason: 'disabled' };
  }

  try {
    const [services, faqs] = await Promise.all([
      getBusinessServicesForAi(business.id),
      getBusinessFaqsForAi(business.id)
    ]);

    const draft = await generateReceptionistDraft(
      {
        conversation,
        business,
        lead,
        service,
        messages: [firstMessage].filter(Boolean),
        services,
        faqs
      },
      {
        prompt: 'Acknowledge the request professionally and concisely. Mention that the request for the selected service has been received by the business. Confirm receipt, and state that the details have been shared with the team who will review and reply with availability. Keep the tone professional, welcoming, and short.'
      }
    );

    if (!draft?.suggested_reply) {
      return { auto_replied: false, reason: 'empty_draft' };
    }

    const aiMessage = await createConversationMessage(
      conversation.id,
      'ai',
      draft.suggested_reply,
      {
        source: 'ai_receptionist',
        mode: draft.fallback_mode ? 'fallback' : 'openai',
        confidence: draft.confidence ?? null,
        intent: draft.intent || null,
        needs_human_review: Boolean(draft.needs_human_review)
      }
    );

    await safeUpdateConversationRecord(conversation.id, {
      ai_confidence: draft.confidence ?? null,
      needs_human_review: Boolean(draft.needs_human_review)
    });

    return {
      auto_replied: true,
      message_id: aiMessage.id,
      confidence: draft.confidence ?? null,
      fallback_mode: Boolean(draft.fallback_mode),
      needs_human_review: Boolean(draft.needs_human_review),
      intent: draft.intent || null,
      missing_details: draft.missing_details || []
    };
  } catch (err) {
    console.warn('AI receptionist auto-reply skipped:', err.message);
    return { auto_replied: false, error: err.message };
  }
};

exports.createEnquiry = async (req, res) => {
  try {
    const {
      business_id,
      business_slug,
      service_id,
      service_slug,
      service_type,
      customer_name,
      customer_email,
      customer_phone,
      address,
      preferred_date,
      notes,
      demo_fallback
    } = req.body;

    if (!customer_name || typeof customer_name !== 'string') {
      return res.status(400).json({ error: 'customer_name is required.' });
    }
    if (!customer_email || typeof customer_email !== 'string' || !customer_email.includes('@')) {
      return res.status(400).json({ error: 'A valid customer_email is required.' });
    }
    if (!address || typeof address !== 'string') {
      return res.status(400).json({ error: 'address is required.' });
    }

    const businessResult = await resolveBusinessForPublicEnquiry({
      businessId: business_id,
      businessSlug: business_slug,
      allowDemoFallback: demo_fallback === true
    });

    if (!businessResult.business) {
      return res.status(businessResult.status).json({ error: businessResult.error });
    }

    const targetBusiness = businessResult.business;

    // Validate service gig if provided
    let resolvedService = null;
    const cleanServiceId = sanitizeString(service_id, 80);
    const cleanServiceSlug = normalizeServiceSlug(service_slug);

    if (cleanServiceId || cleanServiceSlug) {
      if (isSupabaseConfigured()) {
        let sQuery = supabase
          .from('services')
          .select('*')
          .eq('business_id', targetBusiness.id);

        if (cleanServiceId) {
          sQuery = sQuery.eq('id', cleanServiceId);
        } else {
          sQuery = sQuery.eq('slug', cleanServiceSlug);
        }

        const { data: sData, error: sErr } = await sQuery.limit(1);
        if (sErr) throw sErr;
        resolvedService = sData && sData.length > 0 ? sData[0] : null;
      } else {
        resolvedService = mockStore.services.find(s =>
          s.business_id === targetBusiness.id &&
          (cleanServiceId ? s.id === cleanServiceId : s.slug === cleanServiceSlug)
        );
      }

      if (!resolvedService) {
        return res.status(404).json({ error: 'Selected service gig was not found for this business.' });
      }

      if (resolvedService.is_public === false) {
        return res.status(403).json({ error: 'This service gig is not publicly available.' });
      }
    }

    const cleanServiceType = resolvedService ? resolvedService.name : sanitizeString(service_type, 100);
    const finalServiceId = resolvedService ? resolvedService.id : null;

    if (!cleanServiceType) {
      return res.status(400).json({ error: 'service_type or a valid service gig is required.' });
    }

    const cleanName = sanitizeString(customer_name, 150);
    const cleanEmail = sanitizeString(customer_email, 200).toLowerCase();
    let finalCustomerEmail = cleanEmail;
    const cleanPhone = sanitizeString(customer_phone, 30);
    const cleanAddress = sanitizeString(address, 300);
    const cleanPreferredDate = sanitizeString(preferred_date, 100);
    const cleanNotes = sanitizeString(notes, 1000);

    let customer_user_id = null;
    const authUser = await resolveOptionalCustomerUser(req);
    if (authUser) {
      customer_user_id = authUser.id;
      if (authUser.email) {
        finalCustomerEmail = sanitizeString(authUser.email, 200).toLowerCase();
      }
    }

    const firstMessage = `New ${cleanServiceType} request for ${targetBusiness.name} from ${cleanName} at ${cleanAddress}${cleanPreferredDate ? ` on ${cleanPreferredDate}` : ''}.${cleanNotes ? ` Notes: ${cleanNotes}` : ''}`;

    if (isSupabaseConfigured()) {
      const { data: conv, error: convErr } = await supabase
        .from('conversations')
        .insert({
          business_id: targetBusiness.id,
          service_id: finalServiceId,
          customer_name: cleanName,
          customer_email: finalCustomerEmail,
          customer_phone: cleanPhone,
          customer_user_id,
          status: 'open',
          ai_confidence: null,
          needs_human_review: false
        })
        .select()
        .single();

      if (convErr) throw convErr;

      const initialMessage = await createConversationMessage(conv.id, 'customer', firstMessage, {
        source: 'marketplace_booking'
      });

      const { data: lead, error: leadErr } = await supabase
        .from('leads')
        .insert({
          business_id: targetBusiness.id,
          conversation_id: conv.id,
          service_id: finalServiceId,
          customer_name: cleanName,
          customer_email: finalCustomerEmail,
          customer_phone: cleanPhone,
          customer_user_id,
          address: cleanAddress,
          service_type: cleanServiceType,
          preferred_date: cleanPreferredDate,
          notes: cleanNotes,
          status: 'new'
        })
        .select()
        .single();

      if (leadErr) throw leadErr;

      const aiReceptionist = await maybeCreateAiReceptionistReply({
        conversation: conv,
        business: targetBusiness,
        lead,
        service: resolvedService,
        firstMessage: initialMessage
      });

      if (process.env.NODE_ENV !== 'production') {
        console.log('⚡ [DEV TRACE] createEnquiry:', JSON.stringify({
          received_business_slug: business_slug || null,
          received_business_id: business_id || null,
          received_service_id: service_id || null,
          received_service_slug: service_slug || null,
          received_service_type: service_type || null,
          resolved_business_id: targetBusiness.id,
          resolved_service_id: finalServiceId,
          created_lead_id: lead.id,
          created_lead_business_id: lead.business_id,
          created_lead_service_id: lead.service_id
        }, null, 2));

        console.log('⚡ [DEV LOG - createEnquiry (Supabase)]:', JSON.stringify({
          created_conversation_id: conv.id,
          created_customer_message_id: initialMessage?.id || null,
          ai_auto_reply_attempted: aiReceptionist ? true : false,
          ai_mode: aiReceptionist?.fallback_mode ? 'fallback' : (aiReceptionist?.error ? 'error' : 'openai'),
          created_ai_message_id: aiReceptionist?.message_id || null
        }, null, 2));
      }

      return res.status(201).json({
        success: true,
        lead_id: lead.id,
        conversation_id: conv.id,
        business_id: targetBusiness.id,
        business_slug: targetBusiness.slug,
        business_name: targetBusiness.name,
        customer_email: finalCustomerEmail,
        authenticated: !!customer_user_id,
        ai_receptionist: aiReceptionist
      });
    }

    const newConvId = `c-pub-${Date.now()}`;
    const newLeadId = `l-pub-${Date.now()}`;

    const newConversation = {
      id: newConvId,
      business_id: targetBusiness.id,
      service_id: finalServiceId,
      customer_name: cleanName,
      customer_email: finalCustomerEmail,
      customer_phone: cleanPhone,
      customer_user_id,
      status: 'open',
      ai_confidence: null,
      needs_human_review: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const newMessage = {
      id: `m-pub-${Date.now()}`,
      conversation_id: newConvId,
      sender: 'customer',
      content: firstMessage,
      metadata: { source: 'marketplace_booking' },
      created_at: new Date().toISOString()
    };

    const newLead = {
      id: newLeadId,
      business_id: targetBusiness.id,
      conversation_id: newConvId,
      service_id: finalServiceId,
      customer_name: cleanName,
      customer_email: finalCustomerEmail,
      customer_phone: cleanPhone,
      customer_user_id,
      address: cleanAddress,
      service_type: cleanServiceType,
      preferred_date: cleanPreferredDate,
      notes: cleanNotes,
      status: 'new',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    mockStore.conversations.push(newConversation);
    mockStore.messages.push(newMessage);
    mockStore.leads.push(newLead);

    const aiReceptionist = await maybeCreateAiReceptionistReply({
      conversation: newConversation,
      business: targetBusiness,
      lead: newLead,
      service: resolvedService,
      firstMessage: newMessage
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log('⚡ [DEV TRACE] createEnquiry (Mock):', JSON.stringify({
        received_business_slug: business_slug || null,
        received_business_id: business_id || null,
        received_service_id: service_id || null,
        received_service_slug: service_slug || null,
        received_service_type: service_type || null,
        resolved_business_id: targetBusiness.id,
        resolved_service_id: finalServiceId,
        created_lead_id: newLeadId,
        created_lead_business_id: newLead.business_id,
        created_lead_service_id: newLead.service_id
      }, null, 2));

      console.log('⚡ [DEV LOG - createEnquiry (Mock)]:', JSON.stringify({
        created_conversation_id: newConvId,
        created_customer_message_id: newMessage?.id || null,
        ai_auto_reply_attempted: aiReceptionist ? true : false,
        ai_mode: aiReceptionist?.fallback_mode ? 'fallback' : (aiReceptionist?.error ? 'error' : 'openai'),
        created_ai_message_id: aiReceptionist?.message_id || null
      }, null, 2));
    }

    return res.status(201).json({
      success: true,
      lead_id: newLeadId,
      conversation_id: newConvId,
      business_id: targetBusiness.id,
      business_slug: targetBusiness.slug,
      business_name: targetBusiness.name,
      customer_email: finalCustomerEmail,
      authenticated: !!customer_user_id,
      ai_receptionist: aiReceptionist
    });
  } catch (err) {
    console.error('createEnquiry error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
