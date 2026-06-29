const axios = require('axios');
const { mockStore, DEMO_BUSINESS_ID } = require('../lib/mockStore');
const { isSupabaseConfigured, supabase } = require('../lib/supabaseClient');

// Helper to get or create conversation
const getOrCreateConversation = async (conversationId, businessId, customerName = 'Anonymous Customer') => {
  if (isSupabaseConfigured()) {
    try {
      if (conversationId) {
        const { data, error } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', conversationId);
        
        if (error) {
          console.error(`❌ Supabase error checking conversation ID ${conversationId}:`, error.message);
        } else if (data && data.length > 0) {
          return data[0];
        }
      }

      // Insert new conversation if not found or no ID provided
      const { data, error } = await supabase
        .from('conversations')
        .insert([{ business_id: businessId, customer_name: customerName }])
        .select();

      if (error) {
        console.error('❌ Supabase error inserting conversation:', error.message);
        throw error;
      }
      return data[0];
    } catch (err) {
      console.error('⚠️ Supabase getOrCreateConversation failed. Falling back to Mock Store:', err.message);
    }
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
  if (isSupabaseConfigured()) {
    try {
      // Avoid .single() here because 0 rows is normal for a conversation without a lead
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('conversation_id', conversationId);
      
      if (error) {
        console.error(`❌ Supabase error retrieving lead state for conversation ${conversationId}:`, error.message);
        return null;
      }
      return data && data.length > 0 ? data[0] : null;
    } catch (err) {
      console.error('⚠️ Supabase getCurrentLeadState failed. Falling back to Mock Store:', err.message);
    }
  }

  // Mock Store implementation
  const lead = mockStore.leads.find(l => l.conversation_id === conversationId);
  return lead || null;
};

// Helper to save a message
const saveMessage = async (conversationId, sender, content) => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{ conversation_id: conversationId, sender, content }])
        .select();

      if (error) {
        console.error(`❌ Supabase error saving message for conversation ${conversationId}:`, error.message);
        throw error;
      }
      return data[0];
    } catch (err) {
      console.error('⚠️ Supabase saveMessage failed. Falling back to Mock Store:', err.message);
    }
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
  if (isSupabaseConfigured()) {
    try {
      const updates = { ai_confidence: aiConfidence, needs_human_review: needsHumanReview };
      if (customerPhone) updates.customer_phone = customerPhone;
      
      const { error } = await supabase
        .from('conversations')
        .update(updates)
        .eq('id', conversationId);

      if (error) {
        console.error(`❌ Supabase error updating metadata for conversation ${conversationId}:`, error.message);
      }
      return;
    } catch (err) {
      console.error('⚠️ Supabase updateConversationMeta failed. Falling back to Mock Store:', err.message);
    }
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

  if (isSupabaseConfigured()) {
    try {
      // Avoid .single() because 0 rows (no lead exists yet) is normal
      const { data: existingLead, error: selectErr } = await supabase
        .from('leads')
        .select('id')
        .eq('conversation_id', conversationId);

      if (selectErr) {
        console.error('❌ Supabase error checking existing lead:', selectErr.message);
      }

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

      if (existingLead && existingLead.length > 0) {
        const { error: updateErr } = await supabase
          .from('leads')
          .update(leadPayload)
          .eq('id', existingLead[0].id);
        
        if (updateErr) {
          console.error(`❌ Supabase error updating lead ${existingLead[0].id}:`, updateErr.message);
          throw updateErr;
        }
      } else {
        const { error: insertErr } = await supabase
          .from('leads')
          .insert([leadPayload]);
        
        if (insertErr) {
          console.error('❌ Supabase error inserting new lead:', insertErr.message);
          throw insertErr;
        }
      }

      // If name has changed, update conversation customer_name
      if (detectedFields.customer_name) {
        await supabase
          .from('conversations')
          .update({ customer_name: detectedFields.customer_name })
          .eq('id', conversationId);
      }

      return 'captured';
    } catch (err) {
      console.error('⚠️ Supabase saveOrUpdateLead failed. Falling back to Mock Store:', err.message);
    }
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
    let businessProfile = {};
    let services = [];
    let faqs = [];

    if (isSupabaseConfigured()) {
      try {
        const { data: b, error: bErr } = await supabase
          .from('businesses')
          .select('*')
          .eq('id', businessId);
        
        if (bErr || !b || b.length === 0) {
          throw new Error(bErr ? bErr.message : `Business with ID ${businessId} not found`);
        }
        businessProfile = b[0];

        const { data: s, error: sErr } = await supabase
          .from('services')
          .select('*')
          .eq('business_id', businessId);
        if (sErr) console.error('❌ Supabase error loading services:', sErr.message);
        else services = s || [];

        const { data: f, error: fErr } = await supabase
          .from('faqs')
          .select('*')
          .eq('business_id', businessId);
        if (fErr) console.error('❌ Supabase error loading FAQs:', fErr.message);
        else faqs = f || [];

      } catch (err) {
        console.error('⚠️ Supabase knowledge load failed. Falling back to Mock Store values:', err.message);
        businessProfile = mockStore.businesses.find(b => b.id === businessId) || {};
        services = mockStore.services.filter(s => s.business_id === businessId);
        faqs = mockStore.faqs.filter(f => f.business_id === businessId);
      }
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
        history: [], 
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
