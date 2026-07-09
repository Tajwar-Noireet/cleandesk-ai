const axios = require('axios');
const { generateLocalResponse } = require('./localAIResponder');

const FIELD_LABELS = {
  customer_phone: 'Phone',
  address: 'Address',
  preferred_date: 'Preferred date',
  service_type: 'Service type',
  price_confirmation: 'Budget/price confirmation'
};

const getText = (value) => (value == null ? '' : String(value));

const getLatestCustomerMessage = (messages = []) => {
  const customerMessages = messages
    .filter((message) => message.sender === 'customer')
    .sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
  return customerMessages.length > 0 ? customerMessages[customerMessages.length - 1].content : '';
};

const getMissingDetails = (lead = {}) => {
  const missing = [];
  if (!lead.customer_phone) missing.push({ key: 'customer_phone', label: FIELD_LABELS.customer_phone });
  if (!lead.address) missing.push({ key: 'address', label: FIELD_LABELS.address });
  if (!lead.preferred_date) missing.push({ key: 'preferred_date', label: FIELD_LABELS.preferred_date });
  if (!lead.service_type) missing.push({ key: 'service_type', label: FIELD_LABELS.service_type });

  const notes = getText(lead.notes).toLowerCase();
  if (!/(price|quote|budget|cost|confirm)/.test(notes)) {
    missing.push({ key: 'price_confirmation', label: FIELD_LABELS.price_confirmation });
  }

  return missing;
};

const getIntent = (messages = [], lead = {}) => {
  const latest = getLatestCustomerMessage(messages).toLowerCase();
  if (/(complaint|refund|angry|unhappy|damage|terrible)/.test(latest)) return 'complaint';
  if (/(reschedule|cancel|change.*date|move.*booking)/.test(latest)) return 'reschedule';
  if (/(price|quote|cost|how much|budget)/.test(latest)) return 'pricing';
  if (lead.service_type || /(book|request|available|appointment|visit|session|repair|clean|tutor)/.test(latest)) {
    return 'booking_request';
  }
  return 'general_question';
};

const getNextAction = (lead = {}, conversation = {}, missing = []) => {
  if (conversation.needs_human_review) return 'reply';
  if (missing.length > 0) return 'request_missing_details';
  if (lead.status === 'new') return 'confirm_availability';
  if (lead.status === 'contacted') return 'reply';
  if (lead.status === 'booked') return 'mark_booked';
  return 'reply';
};

const buildSummary = ({ conversation = {}, lead = {}, business = {}, service = {}, messages = [] }) => {
  const latest = getLatestCustomerMessage(messages);
  const bits = [
    `${conversation.customer_name || lead.customer_name || 'Customer'} contacted ${business.name || 'the business'}`,
    `about ${lead.service_type || service.name || 'a service request'}`
  ];
  if (lead.preferred_date) bits.push(`for ${lead.preferred_date}`);
  if (lead.address) bits.push(`at ${lead.address}`);
  const summary = `${bits.join(' ')}.`;
  return latest ? `${summary} Latest customer message: "${latest}"` : summary;
};

const buildFallbackReply = ({ conversation = {}, lead = {}, business = {} }) => {
  const name = conversation.customer_name || lead.customer_name || 'there';
  const businessName = business.name || 'the business';
  const service = lead.service_type || 'your service request';

  return `Thanks, ${name} — your request for ${service} has been received by ${businessName}. I’ve shared your details with the team. They’ll review your preferred date and reply here with availability.`;
};

const buildAnalysis = (context) => {
  const missing = getMissingDetails(context.lead || {});
  const intent = getIntent(context.messages || [], context.lead || {});
  return {
    summary: buildSummary(context),
    missing_details: missing,
    next_action: getNextAction(context.lead || {}, context.conversation || {}, missing),
    intent
  };
};

const generateReceptionistDraft = async (context, options = {}) => {
  const analysis = buildAnalysis(context);
  const latestCustomerMessage = getLatestCustomerMessage(context.messages || []);
  const fallbackReply = buildFallbackReply({ ...context, missing: analysis.missing_details });
  const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

  try {
    const response = await axios.post(`${aiServiceUrl}/generate-response`, {
      message: options.prompt || latestCustomerMessage || analysis.summary,
      history: (context.messages || []).map((message) => ({
        sender: message.sender,
        content: message.content
      })),
      business_profile: context.business || {},
      services: context.services || [],
      faqs: context.faqs || [],
      conversation_id: context.conversation?.id,
      current_lead_state: context.lead || null
    }, { timeout: 3500 });

    return {
      suggested_reply: response.data?.reply || fallbackReply,
      confidence: response.data?.confidence ?? 0.8,
      needs_human_review: Boolean(response.data?.needs_human_review),
      fallback_mode: false,
      ...analysis,
      intent: response.data?.intent || analysis.intent
    };
  } catch (err) {
    const local = generateLocalResponse(
      latestCustomerMessage || analysis.summary,
      context.business || {},
      context.services || [],
      context.faqs || [],
      context.lead || null
    );

    return {
      suggested_reply: local.reply || fallbackReply,
      confidence: local.confidence ?? 0.65,
      needs_human_review: Boolean(local.needs_human_review),
      fallback_mode: true,
      ...analysis,
      intent: local.intent || analysis.intent
    };
  }
};

module.exports = {
  buildAnalysis,
  generateReceptionistDraft,
  getMissingDetails
};
