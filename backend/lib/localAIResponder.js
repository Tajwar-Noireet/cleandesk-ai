// JavaScript Local Fallback for the AI Service
// This mimics the FastAPI python response if it's not running.

function generateLocalResponse(message, businessProfile, services, faqs, currentLeadState) {
  const text = message.lower ? message.toLowerCase() : String(message).toLowerCase();
  
  let intent = "general_question";
  let confidence = 0.95;
  let needsReview = false;
  
  const fields = {
    customer_name: currentLeadState ? currentLeadState.customer_name : null,
    customer_phone: currentLeadState ? currentLeadState.customer_phone : null,
    address: currentLeadState ? currentLeadState.address : null,
    service_type: currentLeadState ? currentLeadState.service_type : null,
    preferred_date: currentLeadState ? currentLeadState.preferred_date : null,
    notes: currentLeadState ? currentLeadState.notes : null
  };

  // Extract Phone Number
  const phoneMatch = message.match(/(\+?\d[\d\s-]{8,12}\d)/);
  if (phoneMatch) {
    fields.customer_phone = phoneMatch[1].trim();
  }

  // Extract Service
  if (text.includes("deep")) {
    fields.service_type = "Deep cleaning";
  } else if (text.includes("move-out") || text.includes("end of tenancy") || text.includes("move out")) {
    fields.service_type = "Move-out cleaning";
  } else if (text.includes("regular") || text.includes("weekly") || text.includes("standard")) {
    fields.service_type = "Regular home cleaning";
  } else if (text.includes("carpet")) {
    fields.service_type = "Carpet cleaning";
  } else if (text.includes("office") || text.includes("commercial")) {
    fields.service_type = "Office cleaning";
  }

  // Extract Date
  const dateMatch = text.match(/(tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{1,2}(st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)|july \d{1,2}|june \d{1,2})/);
  if (dateMatch) {
    fields.preferred_date = dateMatch[1].charAt(0).toUpperCase() + dateMatch[1].slice(1);
  }

  // Extract Name
  const nameMatch = text.match(/(?:my name is|i am|this is)\s+([a-z\s]+)/);
  if (nameMatch) {
    const parts = nameMatch[1].trim().split(/\s+/);
    if (parts.length > 0) {
      fields.customer_name = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    }
  }

  // Extract Address
  const addrMatch = text.match(/(\d+\s+[a-z\s]+(?:street|road|way|avenue|lane|drive|crescent|sw\d|e\d|w\d|n\d|se\d|nw\d))/);
  if (addrMatch) {
    fields.address = addrMatch[1].trim().replace(/\b\w/g, c => c.toUpperCase());
  }

  let reply = "";

  // Check for complaints
  const complaintWords = ["refund", "complaint", "angry", "terrible", "bad service", "sue", "damage", "stole"];
  if (complaintWords.some(w => text.includes(w))) {
    intent = "complaint";
    confidence = 0.90;
    needsReview = true;
    reply = `I'm very sorry to hear about this issue. I have flagged this conversation for human review, and the business owner of ${businessProfile.name || 'CleanDesk AI'} will contact you directly to resolve this as soon as possible.`;
  }
  // Check for rescheduling
  else if (text.includes("reschedule") || text.includes("change my booking") || text.includes("cancel booking")) {
    intent = "reschedule";
    confidence = 0.85;
    const rescheduleFaq = faqs.find(f => f.question.toLowerCase().includes("reschedule") || f.question.toLowerCase().includes("cancel"));
    if (rescheduleFaq) {
      reply = rescheduleFaq.answer;
    } else {
      reply = "You can reschedule your appointment for free up to 24 hours before your booking. Please let us know when you would like to move it to.";
    }
  }
  // Booking request
  else if (text.includes("book") || text.includes("quote") || text.includes("pricing for") || text.includes("get a clean") || text.includes("clean my")) {
    intent = "booking_request";
    confidence = 0.90;
    
    reply = "I would be happy to help you get a quote or book a cleaning! ";
    if (!fields.customer_name) {
      reply += "Could you please tell me your name?";
    } else if (!fields.service_type) {
      reply += `Great to meet you, ${fields.customer_name}! Which cleaning service do you need? (Regular, Deep, Move-out, Carpet, or Office?)`;
    } else if (!fields.customer_phone) {
      reply += "Awesome. What is the best phone number to reach you at?";
    } else if (!fields.address) {
      reply += "And what is the address of the property to be cleaned?";
    } else if (!fields.preferred_date) {
      reply += "What is your preferred date or day of the week for the cleaning?";
    } else {
      reply += "Perfect! I have collected all the details. The business owner will review this and contact you to confirm the booking.";
    }
  }
  // Pricing
  else if (text.includes("price") || text.includes("cost") || text.includes("how much")) {
    intent = "pricing";
    confidence = 0.90;
    const serviceList = services.map(s => `- ${s.name}: ${s.base_price} (approx. ${s.estimated_duration})`).join("\n");
    if (serviceList) {
      reply = `Here are our services and starting prices at ${businessProfile.name || 'SparkleHome Cleaning'}:\n${serviceList}\n\nWould you like to get a quote or book a cleaning?`;
    } else {
      reply = "Our prices depend on the size of your home and the type of cleaning needed. Would you like to get a customized quote?";
    }
  }
  // Generic Qs
  else {
    // Check FAQs
    const matchedFaq = faqs.find(f => {
      const qWords = f.question.toLowerCase().split(/\W+/);
      const overlap = qWords.filter(w => w.length > 2 && text.includes(w));
      return overlap.length >= 2;
    });

    if (matchedFaq) {
      reply = matchedFaq.answer;
    } else if (currentLeadState && (currentLeadState.customer_name || currentLeadState.customer_phone)) {
      intent = "booking_request";
      confidence = 0.85;
      reply = "I've noted that down. ";
      
      // Prompt for next field
      if (!fields.service_type) {
        reply += "Which cleaning service do you need?";
      } else if (!fields.customer_phone) {
        reply += "What is the best phone number to reach you at?";
      } else if (!fields.address) {
        reply += "What is the address?";
      } else if (!fields.preferred_date) {
        reply += "What date or day works best for you?";
      } else {
        reply += "Thanks! The owner will reach out shortly.";
      }
    } else {
      intent = "unknown";
      confidence = 0.50;
      needsReview = true;
      reply = `I'm not completely sure about that. I can ask the owner of ${businessProfile.name || 'CleanDesk AI'} to confirm. Would you like to leave your name and number so they can reach back?`;
    }
  }

  // Next field identifier
  let nextField = null;
  if (intent === "booking_request" || (currentLeadState && (currentLeadState.customer_name || currentLeadState.customer_phone))) {
    if (!fields.customer_name) nextField = "customer_name";
    else if (!fields.service_type) nextField = "service_type";
    else if (!fields.customer_phone) nextField = "customer_phone";
    else if (!fields.address) nextField = "address";
    else if (!fields.preferred_date) nextField = "preferred_date";
  }

  return {
    reply,
    intent,
    confidence,
    needs_human_review: needsReview,
    lead_fields_detected: fields,
    next_required_field: nextField
  };
}

module.exports = {
  generateLocalResponse
};
