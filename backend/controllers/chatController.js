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
const updateConversationMeta = async (conversationId, aiConfidence, needsHumanReview, customerPhone, customerName) => {
  if (isSupabaseConfigured()) {
    try {
      const updates = { ai_confidence: aiConfidence, needs_human_review: needsHumanReview };
      if (customerPhone) updates.customer_phone = customerPhone;
      if (customerName) updates.customer_name = customerName;
      
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
    if (customerName) {
      mockStore.conversations[idx].customer_name = customerName;
    }
  }
};

// Helper to save or update lead - merging new lead fields with existing fields
const saveOrUpdateLead = async (businessId, conversationId, detectedFields) => {
  if (!detectedFields) return 'none';

  // Get current state to merge
  const existingLead = await getCurrentLeadState(conversationId, businessId);
  
  const mergedFields = {
    customer_name: detectedFields.customer_name || (existingLead ? existingLead.customer_name : null),
    customer_phone: detectedFields.customer_phone || (existingLead ? existingLead.customer_phone : null),
    address: detectedFields.address || (existingLead ? existingLead.address : null),
    service_type: detectedFields.service_type || (existingLead ? existingLead.service_type : null),
    preferred_date: detectedFields.preferred_date || (existingLead ? existingLead.preferred_date : null),
    notes: detectedFields.notes || (existingLead ? existingLead.notes : null)
  };

  // Determine capture status
  let status = 'none';
  if (mergedFields.customer_name && mergedFields.customer_phone) {
    status = 'captured';
  } else if (
    mergedFields.customer_name || 
    mergedFields.customer_phone || 
    mergedFields.address || 
    mergedFields.service_type || 
    mergedFields.preferred_date
  ) {
    status = 'in_progress';
  }

  if (isSupabaseConfigured()) {
    try {
      const { data: checkLead, error: checkErr } = await supabase
        .from('leads')
        .select('id')
        .eq('conversation_id', conversationId);

      if (checkErr) {
        console.error('❌ Supabase error checking existing lead in saveOrUpdateLead:', checkErr.message);
      }

      const leadPayload = {
        business_id: businessId,
        conversation_id: conversationId,
        customer_name: mergedFields.customer_name,
        customer_phone: mergedFields.customer_phone,
        address: mergedFields.address,
        service_type: mergedFields.service_type,
        preferred_date: mergedFields.preferred_date,
        notes: mergedFields.notes
      };

      if (checkLead && checkLead.length > 0) {
        const { error: updateErr } = await supabase
          .from('leads')
          .update(leadPayload)
          .eq('id', checkLead[0].id);
        
        if (updateErr) {
          console.error(`❌ Supabase error updating lead ${checkLead[0].id}:`, updateErr.message);
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

      return status;
    } catch (err) {
      console.error('⚠️ Supabase saveOrUpdateLead failed. Falling back to Mock Store:', err.message);
    }
  }

  // Mock Store implementation
  const idx = mockStore.leads.findIndex(l => l.conversation_id === conversationId);
  const leadPayload = {
    business_id: businessId,
    conversation_id: conversationId,
    customer_name: mergedFields.customer_name,
    customer_phone: mergedFields.customer_phone,
    address: mergedFields.address,
    service_type: mergedFields.service_type,
    preferred_date: mergedFields.preferred_date,
    notes: mergedFields.notes,
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

  return status;
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

    // 3. Retrieve recent message history (last 10 messages) for AI context
    let history = [];
    if (isSupabaseConfigured()) {
      try {
        const { data: msgs, error: msgsErr } = await supabase
          .from('messages')
          .select('sender, content')
          .eq('conversation_id', conversation.id)
          .order('created_at', { ascending: true })
          .limit(10);
        if (msgsErr) throw msgsErr;
        history = msgs || [];
      } catch (historyErr) {
        console.error('❌ Supabase error loading message history:', historyErr.message);
      }
    } else {
      history = mockStore.messages
        .filter(m => m.conversation_id === conversation.id)
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        .slice(-10)
        .map(m => ({ sender: m.sender, content: m.content }));
    }

    // 4. Load business knowledge base
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

    // 5. Retrieve current lead status
    const currentLead = await getCurrentLeadState(conversation.id, businessId);

    // 6. Send message, history, and knowledge base to Python AI service
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    let aiResponse;

    try {
      const response = await axios.post(`${aiServiceUrl}/generate-response`, {
        message,
        history: history, 
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

    // 7. Save AI reply to the database
    await saveMessage(conversation.id, 'ai', aiResponse.reply);

    // 8. Capture / Update lead info in DB
    let leadCaptureStatus = 'none';
    if (aiResponse.lead_fields_detected) {
      leadCaptureStatus = await saveOrUpdateLead(
        businessId,
        conversation.id,
        aiResponse.lead_fields_detected
      );
    }

    // Retrieve final merged name/phone values to record in conversation
    const updatedLead = await getCurrentLeadState(conversation.id, businessId);
    const customerPhone = updatedLead ? updatedLead.customer_phone : (aiResponse.lead_fields_detected ? aiResponse.lead_fields_detected.customer_phone : null);
    const customerName = updatedLead ? updatedLead.customer_name : (aiResponse.lead_fields_detected ? aiResponse.lead_fields_detected.customer_name : null);

    // 9. Update conversation metadata (confidence, review, phone, name)
    await updateConversationMeta(
      conversation.id,
      aiResponse.confidence,
      aiResponse.needs_human_review,
      customerPhone,
      customerName
    );

    // 10. Return JSON payload to client
    res.json({
      conversationId: conversation.id,
      reply: aiResponse.reply,
      intent: aiResponse.intent,
      confidence: aiResponse.confidence,
      needsHumanReview: aiResponse.needs_human_review,
      leadCaptureStatus,
      leadFields: updatedLead || aiResponse.lead_fields_detected,
      nextRequiredField: aiResponse.next_required_field
    });

  } catch (error) {
    console.error('Error in chat controller:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
};
