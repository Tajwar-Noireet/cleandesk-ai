// Centralized Mock Data Store for CleanDesk AI
// This will be replaced with direct Supabase PostgreSQL queries later.

const DEMO_BUSINESS_ID = 'd3b07384-d113-4ec5-a5d6-c6e7f8d9a101';

const mockStore = {
  businesses: [
    {
      id: DEMO_BUSINESS_ID,
      name: 'SparkleHome Cleaning',
      phone: '+44 20 7946 0958',
      email: 'info@sparklehome.co.uk',
      service_area: 'Greater London, Zone 1-4',
      opening_hours: 'Mon-Fri: 8:00 AM - 6:00 PM, Sat: 9:00 AM - 4:00 PM',
      description: 'Professional, eco-friendly home cleaning service in London. Specialized in regular cleaning, deep cleans, and end of tenancy services.'
    }
  ],
  services: [
    {
      id: 's1',
      business_id: DEMO_BUSINESS_ID,
      name: 'Regular home cleaning',
      description: 'Standard dusting, vacuuming, mopping, kitchen and bathroom sanitization.',
      base_price: '£40',
      estimated_duration: '2 hours'
    },
    {
      id: 's2',
      business_id: DEMO_BUSINESS_ID,
      name: 'Deep cleaning',
      description: 'In-depth cleaning including behind appliances, baseboards, window sills, and heavy scrub.',
      base_price: '£90',
      estimated_duration: '4 hours'
    },
    {
      id: 's3',
      business_id: DEMO_BUSINESS_ID,
      name: 'Move-out cleaning',
      description: 'Full end of tenancy clean to satisfy landlord checklists. Deep clean plus appliances.',
      base_price: '£120',
      estimated_duration: '5 hours'
    },
    {
      id: 's4',
      business_id: DEMO_BUSINESS_ID,
      name: 'Office cleaning',
      description: 'Commercial desk space, meeting rooms, and office kitchen sanitization.',
      base_price: 'custom quote',
      estimated_duration: 'variable'
    },
    {
      id: 's5',
      business_id: DEMO_BUSINESS_ID,
      name: 'Carpet cleaning',
      description: 'Hot water extraction deep cleaning for carpets and rugs.',
      base_price: '£35 per room',
      estimated_duration: '1.5 hours'
    }
  ],
  faqs: [
    {
      id: 'f1',
      business_id: DEMO_BUSINESS_ID,
      question: 'Do you bring cleaning supplies?',
      answer: 'Yes, our team brings all standard eco-friendly cleaning supplies and equipment, including vacuums and mops, at no extra cost.'
    },
    {
      id: 'f2',
      business_id: DEMO_BUSINESS_ID,
      question: 'What areas do you cover?',
      answer: 'We cover the Greater London area, specifically Zones 1 through 4. If you live just outside, please contact us and we will see if we can accommodate.'
    },
    {
      id: 'f3',
      business_id: DEMO_BUSINESS_ID,
      question: 'Can I reschedule?',
      answer: 'Yes, you can reschedule for free up to 24 hours before your booking. Rescheduling within 24 hours may incur a small £15 fee.'
    },
    {
      id: 'f4',
      business_id: DEMO_BUSINESS_ID,
      question: 'Do you clean on weekends?',
      answer: 'Yes, we clean on Saturdays from 9:00 AM to 4:00 PM. We are closed on Sundays.'
    },
    {
      id: 'f5',
      business_id: DEMO_BUSINESS_ID,
      question: 'How long does a deep clean take?',
      answer: 'A deep clean typically takes between 3 to 5 hours, depending on the size and condition of the property.'
    },
    {
      id: 'f6',
      business_id: DEMO_BUSINESS_ID,
      question: 'Do I need to be home?',
      answer: 'No, you do not need to be home as long as we have a secure way to access the property (such as a lockbox or key drop). Many clients provide access and return when we are done.'
    },
    {
      id: 'f7',
      business_id: DEMO_BUSINESS_ID,
      question: 'Do you offer same-day cleaning?',
      answer: 'Same-day cleaning is subject to availability. Please request a quote as early as possible or call us directly to check same-day slots.'
    }
  ],
  conversations: [
    {
      id: 'c1',
      business_id: DEMO_BUSINESS_ID,
      customer_name: 'Sarah Jenkins',
      customer_phone: '+44 7700 900077',
      status: 'open',
      ai_confidence: 0.88,
      needs_human_review: false,
      created_at: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
    },
    {
      id: 'c2',
      business_id: DEMO_BUSINESS_ID,
      customer_name: 'David Miller',
      customer_phone: '+44 7700 900099',
      status: 'open',
      ai_confidence: 0.45,
      needs_human_review: true,
      created_at: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
    }
  ],
  messages: [
    {
      id: 'm1',
      conversation_id: 'c1',
      sender: 'customer',
      content: 'Hi, do you cover Wembley area?',
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'm2',
      conversation_id: 'c1',
      sender: 'ai',
      content: 'Hello! Yes, we cover Greater London including Wembley. Would you like to get a quote or book a cleaning?',
      created_at: new Date(Date.now() - 3580000).toISOString()
    },
    {
      id: 'm3',
      conversation_id: 'c2',
      sender: 'customer',
      content: 'My cleaner did not clean under the couch and I am very unhappy.',
      created_at: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 'm4',
      conversation_id: 'c2',
      sender: 'ai',
      content: "I'm very sorry to hear about this issue. I have flagged this conversation for human review, and the business owner of SparkleHome Cleaning will contact you directly to resolve this as soon as possible.",
      created_at: new Date(Date.now() - 7180000).toISOString()
    }
  ],
  leads: [
    {
      id: 'l1',
      business_id: DEMO_BUSINESS_ID,
      conversation_id: 'c1',
      customer_name: 'Sarah Jenkins',
      customer_phone: '+44 7700 900077',
      address: '12 Wembley Park Dr, London',
      service_type: 'Deep cleaning',
      preferred_date: 'This Saturday',
      notes: 'Wembley area clean',
      status: 'new',
      created_at: new Date(Date.now() - 3580000).toISOString()
    }
  ]
};

module.exports = {
  DEMO_BUSINESS_ID,
  mockStore
};
