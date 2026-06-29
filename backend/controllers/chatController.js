const axios = require('axios');
const { mockStore, DEMO_BUSINESS_ID } = require('../lib/mockStore');
const { isSupabaseConfigured, supabase } = require('../lib/supabaseClient');

// Helper to get or create conversation
const getOrCreateConversation = async (conversationId, businessId, customerName = 'Anonymous Customer') => {
  // TODO: Add Supabase get/create conversation logic in Phase 3
  
  if (isSupabaseConfigured()) {
    if (conversationId) {
      const { data } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();
      if (data) return data;
    }
    const { data, error } = await supabase
      .from('conversations')
      .insert([{ business_id: businessId, customer_name: customerName }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Mock Store implementation
  let conversation = null;
  if (conversationId) {
    conversation = mockStore.conversations.find(c => c.id === conversationId);
  }
  
  if (!conversation) {
    conversation = {
      id: `c-${Date.now()}`,
      business_id: businessId,
      customer_name: customerName,
      customer_phone: null,
      status: 'open',
      ai_confidence: 1.0,
      needs_human_review: false,
      created_at: new Date().toISOString()
    };
    mockStore.conversations.push(conversation);
  }
  
  return conversation;
};

// Helper to get current lead state for a conversation
const getCurrentLeadState = async (conversationId, businessId) => {
  // TODO: Add Supabase query for lead associated with conversation
  
  if (isSupabaseConfigured()) {
    const { data } = await supabase
      .from('leads')
      .select('*')
      .eq('conversation_id', conversationId)
      .single();
    return data || null;
  }

  // Mock Store implementation
  const lead = mockStore.leads.find(l => l.conversation_id === conversationId);
  return lead || null;
};

// Helper to save a message
const saveMessage = async (conversationId, sender, content) => {
  // TODO: Add Supabase insert message query in Phase 3
  
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('messages')
      .insert([{ conversation_id: conversationId, sender, content }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Mock Store implementation
  const newMessage = {
    id: `m-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    conversation_id: conversationId,
    sender,
    content,
    created_at: new Date().toISOString()
  };
  mockStore.messages.push(newMessage);
  return newMessage;
};

// Helper to update conversation metadata
const updateConversationMeta = async (conversationId, aiConfidence, needsHumanReview, customerPhone) => {
  // TODO: Add Supabase update conversation query in Phase 3
  
  if (isSupabaseConfigured()) {
    const updates = { ai_confidence: aiConfidence, needs_human_review: needsHumanReview };
    if (customerPhone) updates.customer_phone = customerPhone;
    
    await supabase
      .from('conversations')
      .update(updates)
      .eq('id', conversationId);
    return;
  }

  // Mock Store implementation
  const idx = mockStore.conversations.findIndex(c => c.id === conversationId);
  if (idx !== -1) {
    mockStore.conversations[idx].ai_confidence = aiConfidence;
    mockStore.conversations[idx].needs_human_review = needsHumanReview;
    if (customerPhone) {
      mockStore.conversations[idx].customer_phone = customerPhone;
    }
  }
};

// Helper to save or update lead
const saveOrUpdateLead = async (businessId, conversationId, detectedFields) => {
  // We need enough fields to create a valid lead. Minimal: name and phone
  if (!detectedFields.customer_name || !detectedFields.customer_phone) {
    return 'in_progress';
  }

  // TODO: Add Supabase upsert lead query in Phase 3
  
  if (isSupabaseConfigured()) {
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id')
      .eq('conversation_id', conversationId)
      .single();

    const leadPayload = {
      business_id: businessId,
      conversation_id: conversationId,
      customer_name: detectedFields.customer_name,
      customer_phone: detectedFields.customer_phone,
      address: detectedFields.address,
      service_type: detectedFields.service_type,
      preferred_date: detectedFields.preferred_date,
      notes: detectedFields.notes
    };

    if (existingLead) {
      await supabase
        .from('leads')
        .update(leadPayload)
        .eq('id', existingLead.id);
    } else {
      await supabase
        .from('leads')
        .insert([leadPayload]);
    }
    return 'captured';
  }

  // Mock Store implementation
  const idx = mockStore.leads.findIndex(l => l.conversation_id === conversationId);
  const leadPayload = {
    business_id: businessId,
    conversation_id: conversationId,
    customer_name: detectedFields.customer_name,
    customer_phone: detectedFields.customer_phone,
    address: detectedFields.address,
    service_type: detectedFields.service_type,
    preferred_date: detectedFields.preferred_date,
    notes: detectedFields.notes,
    status: 'new'
  };

  if (idx !== -1) {
    mockStore.leads[idx] = {
      ...mockStore.leads[idx],
      ...leadPayload
    };
  } else {
    mockStore.leads.push({
      id: `l-${Date.now()}`,
      created_at: new Date().toISOString(),
      ...leadPayload
    });
  }

  // If name has changed, update conversation customer_name
  const cIdx = mockStore.conversations.findIndex(c => c.id === conversationId);
  if (cIdx !== -1 && detectedFields.customer_name) {
    mockStore.conversations[cIdx].customer_name = detectedFields.customer_name;
  }

  return 'captured';
};

// Handle incoming chat message
exports.handleMessage = async (req, res) => {
  const { businessId, conversationId, message } = req.body;

  if (!businessId || !message) {
    return res.status(400).json({ error: 'businessId and message are required' });
  }

  try {
    // 1. Get or create the conversation record
    const conversation = await getOrCreateConversation(conversationId, businessId);
    
    // 2. Save the incoming customer message
    await saveMessage(conversation.id, 'customer', message);

    // 3. Load business knowledge base
    let businessProfile, services, faqs;
    if (isSupabaseConfigured()) {
      const { data: b } = await supabase.from('businesses').select('*').eq('id', businessId).single();
      const { data: s } = await supabase.from('services').select('*').eq('business_id', businessId);
      const { data: f } = await supabase.from('faqs').select('*').eq('business_id', businessId);
      businessProfile = b;
      services = s || [];
      faqs = f || [];
    } else {
      businessProfile = mockStore.businesses.find(b => b.id === businessId) || {};
      services = mockStore.services.filter(s => s.business_id === businessId);
      faqs = mockStore.faqs.filter(f => f.business_id === businessId);
    }

    // 4. Retrieve current lead status
    const currentLead = await getCurrentLeadState(conversation.id, businessId);

    // 5. Send message and knowledge base to Python AI service
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    let aiResponse;

    try {
      const response = await axios.post(`${aiServiceUrl}/generate-response`, {
        message,
        history: [], // We could pass conversation history if needed
        business_profile: businessProfile,
        services,
        faqs,
        conversation_id: conversation.id,
        current_lead_state: currentLead ? {
          customer_name: currentLead.customer_name,
          customer_phone: currentLead.customer_phone,
          address: currentLead.address,
          service_type: currentLead.service_type,
          preferred_date: currentLead.preferred_date,
          notes: currentLead.notes
        } : null
      });
      aiResponse = response.data;
    } catch (apiErr) {
      console.warn('FastAPI AI Service call failed, using backend local fallback: ', apiErr.message);
      
      // Local fallback responder simulating the AI microservice if it is not running
      aiResponse = require('../lib/localAIResponder').generateLocalResponse(
        message,
        businessProfile,
        services,
        faqs,
        currentLead
      );
    }

    // 6. Save AI reply to the database
    await saveMessage(conversation.id, 'ai', aiResponse.reply);

    // 7. Update conversation metadata
    await updateConversationMeta(
      conversation.id,
      aiResponse.confidence,
      aiResponse.needs_human_review,
      aiResponse.lead_fields_detected ? aiResponse.lead_fields_detected.customer_phone : null
    );

    // 8. Capture lead info if booking intent
    let leadCaptureStatus = 'none';
    if (aiResponse.intent === 'booking_request' || (currentLead && aiResponse.lead_fields_detected)) {
      leadCaptureStatus = await saveOrUpdateLead(
        businessId,
        conversation.id,
        aiResponse.lead_fields_detected
      );
    }

    // 9. Return JSON payload to client
    res.json({
      conversationId: conversation.id,
      reply: aiResponse.reply,
      intent: aiResponse.intent,
      confidence: aiResponse.confidence,
      needsHumanReview: aiResponse.needs_human_review,
      leadCaptureStatus,
      leadFields: aiResponse.lead_fields_detected,
      nextRequiredField: aiResponse.next_required_field
    });

  } catch (error) {
    console.error('Error in chat controller:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
};
