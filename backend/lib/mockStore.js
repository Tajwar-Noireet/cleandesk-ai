// Centralized Mock Data Store for CleanDesk AI.
// Mirrors the Supabase schema closely enough for offline development.

const DEMO_BUSINESS_ID = 'd3b07384-d113-4ec5-a5d6-c6e7f8d9a101';
const FRESHFIX_BUSINESS_ID = 'e4b07384-d113-4ec5-a5d6-c6e7f8d9a202';
const BRIGHTPATH_BUSINESS_ID = 'f5b07384-d113-4ec5-a5d6-c6e7f8d9a303';

const mockStore = {
  businesses: [
    {
      id: DEMO_BUSINESS_ID,
      user_id: 'mock-user-123',
      name: 'SparkleHome Cleaning',
      slug: 'sparklehome-cleaning',
      phone: '+44 20 7946 0958',
      email: 'info@sparklehome.co.uk',
      service_area: 'Greater London, Zones 1-4',
      opening_hours: 'Mon-Fri: 8:00 AM - 6:00 PM, Sat: 9:00 AM - 4:00 PM',
      description: 'Professional, eco-friendly home cleaning service in London. Specialized in regular cleaning, deep cleans, and end of tenancy services.',
      is_public: true,
      category: 'Home cleaning',
      city: 'London',
      postcode: 'SW1',
      public_description: 'Eco-friendly domestic and end-of-tenancy cleaning across central London.',
      rating: 4.8,
      logo_url: null,
      created_at: new Date(Date.now() - 86400000 * 12).toISOString()
    },
    {
      id: FRESHFIX_BUSINESS_ID,
      user_id: 'mock-owner-freshfix',
      name: 'FreshFix Repairs',
      slug: 'freshfix-repairs',
      phone: '+44 20 7946 1200',
      email: 'hello@freshfix.example',
      service_area: 'North and East London',
      opening_hours: 'Mon-Sat: 8:00 AM - 7:00 PM',
      description: 'Local handyman and repair team handling plumbing, electrical, assembly, and urgent home maintenance jobs.',
      is_public: true,
      category: 'Home repairs',
      city: 'London',
      postcode: 'N1',
      public_description: 'Reliable same-week repair visits for busy households and landlords.',
      rating: 4.7,
      logo_url: null,
      created_at: new Date(Date.now() - 86400000 * 10).toISOString()
    },
    {
      id: BRIGHTPATH_BUSINESS_ID,
      user_id: 'mock-owner-brightpath',
      name: 'BrightPath Tutors',
      slug: 'brightpath-tutors',
      phone: '+44 20 7946 1300',
      email: 'support@brightpath.example',
      service_area: 'Online and Greater London',
      opening_hours: 'Mon-Fri: 3:00 PM - 9:00 PM, Sat: 10:00 AM - 2:00 PM',
      description: 'Private tutoring for primary, GCSE, A-Level, and exam preparation with online and in-home options.',
      is_public: true,
      category: 'Tutoring',
      city: 'London',
      postcode: 'E2',
      public_description: 'Vetted tutors for maths, English, sciences, and exam confidence.',
      rating: 4.9,
      logo_url: null,
      created_at: new Date(Date.now() - 86400000 * 8).toISOString()
    }
  ],
  services: [
    {
      id: 's1',
      business_id: DEMO_BUSINESS_ID,
      name: 'Regular home cleaning',
      slug: 'regular-home-cleaning',
      is_public: true,
      category: 'Home cleaning',
      short_description: 'Standard dusting, vacuuming, mopping, kitchen and bathroom sanitization.',
      description: 'Standard dusting, vacuuming, mopping, kitchen and bathroom sanitization.',
      base_price: '40',
      price_unit: 'GBP',
      estimated_duration: '2 hours',
      duration_estimate: '2 hours',
      sort_order: 1
    },
    {
      id: 's2',
      business_id: DEMO_BUSINESS_ID,
      name: 'Deep cleaning',
      slug: 'deep-cleaning',
      is_public: true,
      category: 'Home cleaning',
      short_description: 'In-depth cleaning including behind appliances, baseboards, window sills.',
      description: 'In-depth cleaning including behind appliances, baseboards, window sills, and heavy scrub.',
      base_price: '90',
      price_unit: 'GBP',
      estimated_duration: '4 hours',
      duration_estimate: '4 hours',
      sort_order: 2
    },
    {
      id: 's3',
      business_id: DEMO_BUSINESS_ID,
      name: 'Move-out cleaning',
      slug: 'move-out-cleaning',
      is_public: true,
      category: 'Home cleaning',
      short_description: 'Full end-of-tenancy clean to satisfy landlord checklists.',
      description: 'Full end-of-tenancy clean to satisfy landlord checklists.',
      base_price: '120',
      price_unit: 'GBP',
      estimated_duration: '5 hours',
      duration_estimate: '5 hours',
      sort_order: 3
    },
    {
      id: 's4',
      business_id: DEMO_BUSINESS_ID,
      name: 'Office cleaning',
      slug: 'office-cleaning',
      is_public: true,
      category: 'Home cleaning',
      short_description: 'Commercial desk space, meeting rooms, and office kitchen sanitization.',
      description: 'Commercial desk space, meeting rooms, and office kitchen sanitization.',
      base_price: 'Quote required',
      price_unit: '',
      estimated_duration: 'Variable',
      duration_estimate: 'Variable',
      sort_order: 4
    },
    {
      id: 's5',
      business_id: DEMO_BUSINESS_ID,
      name: 'Carpet cleaning',
      slug: 'carpet-cleaning',
      is_public: true,
      category: 'Home cleaning',
      short_description: 'Hot water extraction deep cleaning for carpets and rugs.',
      description: 'Hot water extraction deep cleaning for carpets and rugs.',
      base_price: '35 per room',
      price_unit: 'GBP',
      estimated_duration: '1.5 hours',
      duration_estimate: '1.5 hours',
      sort_order: 5
    },
    {
      id: 'ff-s1',
      business_id: FRESHFIX_BUSINESS_ID,
      name: 'General repair visit',
      slug: 'general-repair-visit',
      is_public: true,
      category: 'Home repairs',
      short_description: 'Small household repairs, fixtures, fittings, and maintenance tasks.',
      description: 'Small household repairs, fixtures, fittings, and maintenance tasks.',
      base_price: '65 callout',
      price_unit: 'GBP',
      estimated_duration: '1-2 hours',
      duration_estimate: '1-2 hours',
      sort_order: 1
    },
    {
      id: 'ff-s2',
      business_id: FRESHFIX_BUSINESS_ID,
      name: 'Emergency plumbing support',
      slug: 'emergency-plumbing-support',
      is_public: true,
      category: 'Home repairs',
      short_description: 'Leak checks, blocked sinks, toilet repairs, and urgent plumbing triage.',
      description: 'Leak checks, blocked sinks, toilet repairs, and urgent plumbing triage.',
      base_price: 'From 95',
      price_unit: 'GBP',
      estimated_duration: 'Same day',
      duration_estimate: 'Same day',
      sort_order: 2
    },
    {
      id: 'ff-s3',
      business_id: FRESHFIX_BUSINESS_ID,
      name: 'Furniture assembly',
      slug: 'furniture-assembly',
      is_public: true,
      category: 'Home repairs',
      short_description: 'Flat-pack assembly, shelving, curtain rails, and wall mounting.',
      description: 'Flat-pack assembly, shelving, curtain rails, and wall mounting.',
      base_price: 'From 55',
      price_unit: 'GBP',
      estimated_duration: '2 hours',
      duration_estimate: '2 hours',
      sort_order: 3
    },
    {
      id: 'bp-s1',
      business_id: BRIGHTPATH_BUSINESS_ID,
      name: 'GCSE maths tutoring',
      slug: 'gcse-maths-tutoring',
      is_public: true,
      category: 'Tutoring',
      short_description: 'One-to-one maths support with weekly progress notes.',
      description: 'One-to-one maths support with weekly progress notes.',
      base_price: '35',
      price_unit: 'GBP/hour',
      estimated_duration: '1 hour',
      duration_estimate: '1 hour',
      sort_order: 1
    },
    {
      id: 'bp-s2',
      business_id: BRIGHTPATH_BUSINESS_ID,
      name: 'English exam preparation',
      slug: 'english-exam-preparation',
      is_public: true,
      category: 'Tutoring',
      short_description: 'Reading, writing, and exam technique coaching.',
      description: 'Reading, writing, and exam technique coaching.',
      base_price: '32',
      price_unit: 'GBP/hour',
      estimated_duration: '1 hour',
      duration_estimate: '1 hour',
      sort_order: 2
    },
    {
      id: 'bp-s3',
      business_id: BRIGHTPATH_BUSINESS_ID,
      name: 'A-Level science tutoring',
      slug: 'a-level-science-tutoring',
      is_public: true,
      category: 'Tutoring',
      short_description: 'Biology, chemistry, and physics tutoring for sixth-form students.',
      description: 'Biology, chemistry, and physics tutoring for sixth-form students.',
      base_price: '45',
      price_unit: 'GBP/hour',
      estimated_duration: '1 hour',
      duration_estimate: '1 hour',
      sort_order: 3
    }
  ],
  faqs: [
    {
      id: 'f1',
      business_id: DEMO_BUSINESS_ID,
      question: 'Do you bring cleaning supplies?',
      answer: 'Yes, the team brings standard eco-friendly cleaning supplies and equipment.'
    },
    {
      id: 'f2',
      business_id: DEMO_BUSINESS_ID,
      question: 'What areas do you cover?',
      answer: 'SparkleHome covers Greater London, specifically Zones 1 through 4.'
    },
    {
      id: 'f3',
      business_id: DEMO_BUSINESS_ID,
      question: 'Can I reschedule?',
      answer: 'Yes, you can reschedule for free up to 24 hours before your booking.'
    },
    {
      id: 'f4',
      business_id: DEMO_BUSINESS_ID,
      question: 'Do you clean on weekends?',
      answer: 'Saturday appointments are available from 9:00 AM to 4:00 PM.'
    },
    {
      id: 'ff-f1',
      business_id: FRESHFIX_BUSINESS_ID,
      question: 'Can I book urgent repairs?',
      answer: 'Yes, same-day appointments are offered when there is engineer availability.'
    },
    {
      id: 'ff-f2',
      business_id: FRESHFIX_BUSINESS_ID,
      question: 'Do you bring parts?',
      answer: 'Common fittings are carried, and specialist parts can be sourced after inspection.'
    },
    {
      id: 'bp-f1',
      business_id: BRIGHTPATH_BUSINESS_ID,
      question: 'Do you offer online tutoring?',
      answer: 'Yes, all subjects can be delivered online or in person where coverage allows.'
    },
    {
      id: 'bp-f2',
      business_id: BRIGHTPATH_BUSINESS_ID,
      question: 'Can parents track progress?',
      answer: 'Yes, tutors provide progress notes after each session.'
    }
  ],
  conversations: [
    {
      id: 'c1',
      business_id: DEMO_BUSINESS_ID,
      customer_name: 'Sarah Jenkins',
      customer_phone: '+44 7700 900077',
      customer_email: 'sarah@jenkins.com',
      customer_user_id: 'mock-customer-sarah-uuid',
      status: 'open',
      ai_confidence: 0.88,
      needs_human_review: false,
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'c2',
      business_id: DEMO_BUSINESS_ID,
      customer_name: 'David Miller',
      customer_phone: '+44 7700 900099',
      customer_email: 'david@miller.com',
      customer_user_id: 'mock-customer-david-uuid',
      status: 'open',
      ai_confidence: 0.45,
      needs_human_review: true,
      created_at: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 'c3',
      business_id: FRESHFIX_BUSINESS_ID,
      customer_name: 'Sarah Jenkins',
      customer_phone: '+44 7700 900077',
      customer_email: 'sarah@jenkins.com',
      customer_user_id: null,
      status: 'open',
      ai_confidence: 0.82,
      needs_human_review: false,
      created_at: new Date(Date.now() - 5400000).toISOString()
    },
    {
      id: 'c4',
      business_id: BRIGHTPATH_BUSINESS_ID,
      customer_name: 'Sarah Jenkins',
      customer_phone: '+44 7700 900077',
      customer_email: 'sarah@jenkins.com',
      customer_user_id: null,
      status: 'open',
      ai_confidence: 0.91,
      needs_human_review: false,
      created_at: new Date(Date.now() - 1800000).toISOString()
    },
    {
      id: 'c5',
      business_id: FRESHFIX_BUSINESS_ID,
      customer_name: 'Alex Rivera',
      customer_phone: '+44 7700 900111',
      customer_email: 'alex@example.com',
      customer_user_id: null,
      status: 'open',
      ai_confidence: 0.76,
      needs_human_review: false,
      created_at: new Date(Date.now() - 2600000).toISOString()
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
      content: 'Hello! Yes, SparkleHome covers Greater London including Wembley. Would you like to get a quote or book a cleaning?',
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
      content: "I'm very sorry to hear about this issue. I have flagged this conversation for human review, and the business owner will contact you directly to resolve this as soon as possible.",
      created_at: new Date(Date.now() - 7180000).toISOString()
    },
    {
      id: 'm5',
      conversation_id: 'c3',
      sender: 'customer',
      content: 'The boiler is making a loud noise and needs a repair visit.',
      created_at: new Date(Date.now() - 5400000).toISOString()
    },
    {
      id: 'm6',
      conversation_id: 'c3',
      sender: 'ai',
      content: 'FreshFix Repairs has received the boiler repair request and will review engineer availability.',
      created_at: new Date(Date.now() - 5360000).toISOString()
    },
    {
      id: 'm7',
      conversation_id: 'c4',
      sender: 'customer',
      content: 'I need maths tutoring for GCSE revision on weekday evenings.',
      created_at: new Date(Date.now() - 1800000).toISOString()
    },
    {
      id: 'm8',
      conversation_id: 'c4',
      sender: 'ai',
      content: 'BrightPath Tutors has received the maths tutoring enquiry and will suggest available tutors.',
      created_at: new Date(Date.now() - 1760000).toISOString()
    },
    {
      id: 'm9',
      conversation_id: 'c5',
      sender: 'customer',
      content: 'Can someone repair a leaking tap this week?',
      created_at: new Date(Date.now() - 2600000).toISOString()
    }
  ],
  leads: [
    {
      id: 'l1',
      business_id: DEMO_BUSINESS_ID,
      conversation_id: 'c1',
      customer_name: 'Sarah Jenkins',
      customer_phone: '+44 7700 900077',
      customer_email: 'sarah@jenkins.com',
      customer_user_id: 'mock-customer-sarah-uuid',
      address: '12 Wembley Park Dr, London',
      service_type: 'Deep cleaning',
      preferred_date: 'This Saturday',
      notes: 'Wembley area clean',
      status: 'new',
      created_at: new Date(Date.now() - 3580000).toISOString()
    },
    {
      id: 'l2',
      business_id: FRESHFIX_BUSINESS_ID,
      conversation_id: 'c3',
      customer_name: 'Sarah Jenkins',
      customer_phone: '+44 7700 900077',
      customer_email: 'sarah@jenkins.com',
      customer_user_id: null,
      address: '45 Camden High St, London',
      service_type: 'Boiler repair',
      preferred_date: 'Tomorrow afternoon',
      notes: 'Boiler noise and pressure issue',
      status: 'contacted',
      created_at: new Date(Date.now() - 5360000).toISOString()
    },
    {
      id: 'l3',
      business_id: BRIGHTPATH_BUSINESS_ID,
      conversation_id: 'c4',
      customer_name: 'Sarah Jenkins',
      customer_phone: '+44 7700 900077',
      customer_email: 'sarah@jenkins.com',
      customer_user_id: null,
      address: 'Online session',
      service_type: 'Maths tutoring',
      preferred_date: 'Weekday evenings',
      notes: 'GCSE revision support',
      status: 'new',
      created_at: new Date(Date.now() - 1760000).toISOString()
    },
    {
      id: 'l4',
      business_id: FRESHFIX_BUSINESS_ID,
      conversation_id: 'c5',
      customer_name: 'Alex Rivera',
      customer_phone: '+44 7700 900111',
      customer_email: 'alex@example.com',
      customer_user_id: null,
      address: '22 Hackney Road, London',
      service_type: 'Tap repair',
      preferred_date: 'Friday morning',
      notes: 'Kitchen tap leak',
      status: 'new',
      created_at: new Date(Date.now() - 2580000).toISOString()
    }
  ]
};

module.exports = {
  DEMO_BUSINESS_ID,
  FRESHFIX_BUSINESS_ID,
  BRIGHTPATH_BUSINESS_ID,
  mockStore
};
