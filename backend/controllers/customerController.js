const { mockStore } = require('../lib/mockStore');
const { isSupabaseConfigured, supabase } = require('../lib/supabaseClient');

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
      .select('id, name, slug, is_public');

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

      await supabase.from('messages').insert({
        conversation_id: conv.id,
        sender: 'customer',
        content: firstMessage
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

      return res.status(201).json({
        success: true,
        lead_id: lead.id,
        conversation_id: conv.id,
        business_id: targetBusiness.id,
        business_slug: targetBusiness.slug,
        business_name: targetBusiness.name,
        customer_email: finalCustomerEmail,
        authenticated: !!customer_user_id
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
      created_at: new Date().toISOString()
    };

    const newMessage = {
      id: `m-pub-${Date.now()}`,
      conversation_id: newConvId,
      sender: 'customer',
      content: firstMessage,
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
      created_at: new Date().toISOString()
    };

    mockStore.conversations.push(newConversation);
    mockStore.messages.push(newMessage);
    mockStore.leads.push(newLead);

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

    return res.status(201).json({
      success: true,
      lead_id: newLeadId,
      conversation_id: newConvId,
      business_id: targetBusiness.id,
      business_slug: targetBusiness.slug,
      business_name: targetBusiness.name,
      customer_email: finalCustomerEmail,
      authenticated: !!customer_user_id
    });
  } catch (err) {
    console.error('createEnquiry error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
