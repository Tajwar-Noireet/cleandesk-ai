const { mockStore } = require('../lib/mockStore');
const { isSupabaseConfigured, supabase } = require('../lib/supabaseClient');

// Helper to isolate customer data in Supabase queries
const getCustomerIsolationFilter = (user) => {
  return `customer_user_id.eq.${user.id},customer_email.eq.${user.email}`;
};

// Retrieve customer dashboard details (leads, conversations, checklist, and business contacts)
exports.getCustomerDashboard = async (req, res) => {
  try {
    const user = req.user; // populated by authMiddleware

    if (isSupabaseConfigured()) {
      // 1. Fetch customer's conversations
      const { data: conversations, error: convErr } = await supabase
        .from('conversations')
        .select('*')
        .or(getCustomerIsolationFilter(user));

      if (convErr) throw convErr;

      // 2. Fetch customer's leads
      const { data: leads, error: leadErr } = await supabase
        .from('leads')
        .select('*')
        .or(getCustomerIsolationFilter(user));

      if (leadErr) throw leadErr;

      // 3. Fetch first contacted business contact profile
      let business = null;
      if (leads.length > 0) {
        const { data: busData, error: busErr } = await supabase
          .from('businesses')
          .select('*')
          .eq('id', leads[0].business_id);
        if (!busErr && busData && busData.length > 0) {
          business = busData[0];
        }
      }
      if (!business) {
        // Seed default fallback business profile
        const { data: busData } = await supabase.from('businesses').select('*').limit(1);
        if (busData && busData.length > 0) {
          business = busData[0];
        }
      }

      // Attach customer_user_id to conversations/leads that match email but don't have user_id set yet
      const missingUserIdConvs = conversations.filter(c => !c.customer_user_id && c.customer_email === user.email);
      for (const conv of missingUserIdConvs) {
        await supabase
          .from('conversations')
          .update({ customer_user_id: user.id })
          .eq('id', conv.id);
      }

      const missingUserIdLeads = leads.filter(l => !l.customer_user_id && l.customer_email === user.email);
      for (const lead of missingUserIdLeads) {
        await supabase
          .from('leads')
          .update({ customer_user_id: user.id })
          .eq('id', lead.id);
      }

      return res.json({
        leads,
        conversations,
        business,
        user: { id: user.id, email: user.email }
      });
    }

    // Fallback to Mock Store
    const conversations = mockStore.conversations.filter(
      c => c.customer_user_id === user.id || (c.customer_email && c.customer_email.toLowerCase() === user.email.toLowerCase())
    );

    const leads = mockStore.leads.filter(
      l => l.customer_user_id === user.id || (l.customer_email && l.customer_email.toLowerCase() === user.email.toLowerCase())
    );

    const business = mockStore.businesses[0] || null;

    res.json({
      leads,
      conversations,
      business,
      user: { id: user.id, email: user.email }
    });
  } catch (err) {
    console.error('❌ getCustomerDashboard error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Retrieve conversations lists for a customer
exports.getCustomerConversations = async (req, res) => {
  try {
    const user = req.user;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(getCustomerIsolationFilter(user));
      if (error) throw error;
      return res.json(data);
    }

    const conversations = mockStore.conversations.filter(
      c => c.customer_user_id === user.id || (c.customer_email && c.customer_email.toLowerCase() === user.email.toLowerCase())
    );
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Retrieve a single conversation detail with transcripts
exports.getCustomerConversationDetail = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    if (isSupabaseConfigured()) {
      // Fetch conversation first to verify ownership
      const { data: conv, error: convErr } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', id)
        .single();

      if (convErr || !conv) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      // Check isolation
      if (conv.customer_user_id !== user.id && conv.customer_email !== user.email) {
        return res.status(403).json({ error: 'Forbidden: You do not own this conversation' });
      }

      // Fetch messages
      const { data: messages, error: msgErr } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true });

      if (msgErr) throw msgErr;

      return res.json({
        ...conv,
        messages
      });
    }

    // Mock mode
    const conv = mockStore.conversations.find(c => c.id === id);
    if (!conv) {
      return res.status(404).json({ error: 'Conversation not found (Mock)' });
    }

    if (conv.customer_user_id !== user.id && conv.customer_email?.toLowerCase() !== user.email.toLowerCase()) {
      return res.status(403).json({ error: 'Forbidden: Access denied (Mock)' });
    }

    const messages = mockStore.messages
      .filter(m => m.conversation_id === id)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    res.json({
      ...conv,
      messages
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Retrieve customer bookings list
exports.getCustomerBookings = async (req, res) => {
  try {
    const user = req.user;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .or(getCustomerIsolationFilter(user));
      if (error) throw error;
      return res.json(data);
    }

    const leads = mockStore.leads.filter(
      l => l.customer_user_id === user.id || (l.customer_email && l.customer_email.toLowerCase() === user.email.toLowerCase())
    );
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Request booking updates or reschedules
exports.requestUpdateOrReschedule = async (req, res) => {
  try {
    const user = req.user;
    const { leadId, notes } = req.body;

    if (!leadId || !notes) {
      return res.status(400).json({ error: 'leadId and notes are required' });
    }

    if (isSupabaseConfigured()) {
      // 1. Verify lead ownership
      const { data: lead, error: leadErr } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();

      if (leadErr || !lead) {
        return res.status(404).json({ error: 'Lead booking not found' });
      }

      if (lead.customer_user_id !== user.id && lead.customer_email !== user.email) {
        return res.status(403).json({ error: 'Forbidden: Access denied' });
      }

      // 2. Append reschedule request alert to lead notes
      const newNotes = `${lead.notes || ''}\n[Customer Reschedule Request]: ${notes}`.trim();
      const { data: updatedLead, error: updateErr } = await supabase
        .from('leads')
        .update({ notes: newNotes })
        .eq('id', leadId)
        .select()
        .single();

      if (updateErr) throw updateErr;

      // 3. Flag conversation for owner attention
      if (lead.conversation_id) {
        await supabase
          .from('conversations')
          .update({ needs_human_review: true })
          .eq('id', lead.conversation_id);
      }

      return res.json(updatedLead);
    }

    // Mock Mode
    const index = mockStore.leads.findIndex(l => l.id === leadId);
    if (index === -1) {
      return res.status(404).json({ error: 'Lead booking not found (Mock)' });
    }

    const lead = mockStore.leads[index];
    if (lead.customer_user_id !== user.id && lead.customer_email?.toLowerCase() !== user.email.toLowerCase()) {
      return res.status(403).json({ error: 'Forbidden: Access denied (Mock)' });
    }

    mockStore.leads[index].notes = `${lead.notes || ''}\n[Customer Reschedule Request]: ${notes}`.trim();

    // Flag mock conversation
    if (lead.conversation_id) {
      const convIndex = mockStore.conversations.findIndex(c => c.id === lead.conversation_id);
      if (convIndex !== -1) {
        mockStore.conversations[convIndex].needs_human_review = true;
      }
    }

    res.json(mockStore.leads[index]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update profile fields (email is read-only)
exports.updateCustomerProfile = async (req, res) => {
  try {
    const user = req.user;
    const { customer_name, customer_phone, address } = req.body;

    if (isSupabaseConfigured()) {
      // Update all leads matching customer_user_id or customer_email
      const { data, error } = await supabase
        .from('leads')
        .update({
          customer_name,
          customer_phone,
          address
        })
        .or(getCustomerIsolationFilter(user));

      if (error) throw error;

      // Also update conversations name/phone
      await supabase
        .from('conversations')
        .update({
          customer_name,
          customer_phone
        })
        .or(getCustomerIsolationFilter(user));

      return res.json({ success: true, customer_name, customer_phone, address });
    }

    // Mock mode
    mockStore.leads.forEach((lead, index) => {
      if (lead.customer_user_id === user.id || lead.customer_email?.toLowerCase() === user.email.toLowerCase()) {
        mockStore.leads[index].customer_name = customer_name;
        mockStore.leads[index].customer_phone = customer_phone;
        mockStore.leads[index].address = address;
      }
    });

    mockStore.conversations.forEach((conv, index) => {
      if (conv.customer_user_id === user.id || conv.customer_email?.toLowerCase() === user.email.toLowerCase()) {
        mockStore.conversations[index].customer_name = customer_name;
        mockStore.conversations[index].customer_phone = customer_phone;
      }
    });

    res.json({ success: true, customer_name, customer_phone, address });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Public endpoint: Submit a new cleaning enquiry/booking request (no auth required)
// Optionally resolves JWT if Authorization header is present.
exports.createEnquiry = async (req, res) => {
  try {
    const DEMO_BUSINESS_ID = 'd3b07384-d113-4ec5-a5d6-c6e7f8d9a101';

    // --- Input Validation ---
    const {
      service_type,
      customer_name,
      customer_email,
      customer_phone,
      address,
      preferred_date,
      notes
    } = req.body;

    if (!service_type || typeof service_type !== 'string') {
      return res.status(400).json({ error: 'service_type is required.' });
    }
    if (!customer_name || typeof customer_name !== 'string') {
      return res.status(400).json({ error: 'customer_name is required.' });
    }
    if (!customer_email || typeof customer_email !== 'string' || !customer_email.includes('@')) {
      return res.status(400).json({ error: 'A valid customer_email is required.' });
    }
    if (!address || typeof address !== 'string') {
      return res.status(400).json({ error: 'address is required.' });
    }

    // --- Sanitize ---
    const sanitize = (str, maxLen = 500) =>
      typeof str === 'string' ? str.trim().substring(0, maxLen) : null;

    const cleanServiceType   = sanitize(service_type, 100);
    const cleanName          = sanitize(customer_name, 150);
    const cleanEmail         = sanitize(customer_email, 200).toLowerCase();
    const cleanPhone         = sanitize(customer_phone, 30);
    const cleanAddress       = sanitize(address, 300);
    const cleanPreferredDate = sanitize(preferred_date, 100);
    const cleanNotes         = sanitize(notes, 1000);

    // --- Optionally resolve authenticated user from JWT header ---
    let customer_user_id = null;
    const authHeader = req.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ') && isSupabaseConfigured()) {
      const token = authHeader.replace('Bearer ', '').trim();
      if (token && token !== 'mock-token') {
        const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
        if (!authErr && user) {
          customer_user_id = user.id;
        }
      }
    }

    const firstMessage = `New ${cleanServiceType} request from ${cleanName} at ${cleanAddress}${cleanPreferredDate ? ` on ${cleanPreferredDate}` : ''}.${cleanNotes ? ` Notes: ${cleanNotes}` : ''}`;

    if (isSupabaseConfigured()) {
      // 1. Create conversation
      const { data: conv, error: convErr } = await supabase
        .from('conversations')
        .insert({
          business_id: DEMO_BUSINESS_ID,
          customer_name: cleanName,
          customer_email: cleanEmail,
          customer_phone: cleanPhone,
          customer_user_id,
          status: 'open',
          ai_confidence: null,
          needs_human_review: false
        })
        .select()
        .single();

      if (convErr) throw convErr;

      // 2. Create first message
      await supabase.from('messages').insert({
        conversation_id: conv.id,
        sender: 'customer',
        content: firstMessage
      });

      // 3. Create lead
      const { data: lead, error: leadErr } = await supabase
        .from('leads')
        .insert({
          business_id: DEMO_BUSINESS_ID,
          conversation_id: conv.id,
          customer_name: cleanName,
          customer_email: cleanEmail,
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

      return res.status(201).json({
        success: true,
        lead_id: lead.id,
        conversation_id: conv.id,
        customer_email: cleanEmail,
        authenticated: !!customer_user_id
      });
    }

    // --- Mock Store Mode ---
    const newConvId = `c-pub-${Date.now()}`;
    const newLeadId = `l-pub-${Date.now()}`;

    const newConversation = {
      id: newConvId,
      business_id: DEMO_BUSINESS_ID,
      customer_name: cleanName,
      customer_email: cleanEmail,
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
      business_id: DEMO_BUSINESS_ID,
      conversation_id: newConvId,
      customer_name: cleanName,
      customer_email: cleanEmail,
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

    return res.status(201).json({
      success: true,
      lead_id: newLeadId,
      conversation_id: newConvId,
      customer_email: cleanEmail,
      authenticated: !!customer_user_id
    });
  } catch (err) {
    console.error('❌ createEnquiry error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
