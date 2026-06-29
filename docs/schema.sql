-- Supabase PostgreSQL Schema for CleanDesk AI

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Businesses Table
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID, -- References auth.users(id) in Supabase
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  service_area TEXT,
  opening_hours TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Services Table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  base_price TEXT, -- e.g. "£40" or "from £90"
  estimated_duration TEXT, -- e.g. "2 hours" or "1.5 hours"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. FAQs Table
CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Conversations Table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_name TEXT,
  customer_phone TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'snoozed')),
  ai_confidence NUMERIC DEFAULT 1.0,
  needs_human_review BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('customer', 'ai', 'owner')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Leads Table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_phone TEXT,
  address TEXT,
  service_type TEXT,
  preferred_date TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'booked', 'lost')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Seed Data for SparkleHome Cleaning Demo
-- Replace user_id with null or a dummy uuid for demo
INSERT INTO businesses (id, name, phone, email, service_area, opening_hours, description)
VALUES (
  'd3b07384-d113-4ec5-a5d6-c6e7f8d9a101',
  'SparkleHome Cleaning',
  '+44 20 7946 0958',
  'info@sparklehome.co.uk',
  'Greater London, Zone 1-4',
  'Mon-Fri: 8:00 AM - 6:00 PM, Sat: 9:00 AM - 4:00 PM',
  'Professional, eco-friendly home cleaning service in London. Specialized in regular cleaning, deep cleans, and end of tenancy services.'
) ON CONFLICT DO NOTHING;

-- Seed Services for SparkleHome Cleaning
INSERT INTO services (business_id, name, description, base_price, estimated_duration)
VALUES 
  ('d3b07384-d113-4ec5-a5d6-c6e7f8d9a101', 'Regular home cleaning', 'Standard dusting, vacuuming, mopping, kitchen and bathroom sanitization.', '£40', '2 hours'),
  ('d3b07384-d113-4ec5-a5d6-c6e7f8d9a101', 'Deep cleaning', 'In-depth cleaning including behind appliances, baseboards, window sills, and heavy scrub.', '£90', '4 hours'),
  ('d3b07384-d113-4ec5-a5d6-c6e7f8d9a101', 'Move-out cleaning', 'Full end of tenancy clean to satisfy landlord checklists. Deep clean plus appliances.', '£120', '5 hours'),
  ('d3b07384-d113-4ec5-a5d6-c6e7f8d9a101', 'Office cleaning', 'Commercial desk space, meeting rooms, and office kitchen sanitization.', 'custom quote', 'variable'),
  ('d3b07384-d113-4ec5-a5d6-c6e7f8d9a101', 'Carpet cleaning', 'Hot water extraction deep cleaning for carpets and rugs.', '£35 per room', '1.5 hours')
ON CONFLICT DO NOTHING;

-- Seed FAQs for SparkleHome Cleaning
INSERT INTO faqs (business_id, question, answer)
VALUES
  ('d3b07384-d113-4ec5-a5d6-c6e7f8d9a101', 'Do you bring cleaning supplies?', 'Yes, our team brings all standard eco-friendly cleaning supplies and equipment, including vacuums and mops, at no extra cost.'),
  ('d3b07384-d113-4ec5-a5d6-c6e7f8d9a101', 'What areas do you cover?', 'We cover the Greater London area, specifically Zones 1 through 4. If you live just outside, please contact us and we will see if we can accommodate.'),
  ('d3b07384-d113-4ec5-a5d6-c6e7f8d9a101', 'Can I reschedule?', 'Yes, you can reschedule for free up to 24 hours before your booking. Rescheduling within 24 hours may incur a small £15 fee.'),
  ('d3b07384-d113-4ec5-a5d6-c6e7f8d9a101', 'Do you clean on weekends?', 'Yes, we clean on Saturdays from 9:00 AM to 4:00 PM. We are closed on Sundays.'),
  ('d3b07384-d113-4ec5-a5d6-c6e7f8d9a101', 'How long does a deep clean take?', 'A deep clean typically takes between 3 to 5 hours, depending on the size and condition of the property.'),
  ('d3b07384-d113-4ec5-a5d6-c6e7f8d9a101', 'Do I need to be home?', 'No, you do not need to be home as long as we have a secure way to access the property (such as a lockbox or key drop). Many clients provide access and return when we are done.'),
  ('d3b07384-d113-4ec5-a5d6-c6e7f8d9a101', 'Do you offer same-day cleaning?', 'Same-day cleaning is subject to availability. Please request a quote as early as possible or call us directly to check same-day slots.')
ON CONFLICT DO NOTHING;
