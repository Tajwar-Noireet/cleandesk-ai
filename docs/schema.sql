-- Supabase PostgreSQL Schema for CleanDesk AI

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Businesses Table
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID, -- References auth.users(id) in Supabase
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  phone TEXT,
  email TEXT,
  service_area TEXT,
  opening_hours TEXT,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  category TEXT,
  city TEXT,
  postcode TEXT,
  public_description TEXT,
  rating NUMERIC DEFAULT 0,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS businesses_public_city_idx
  ON businesses (is_public, city);

CREATE INDEX IF NOT EXISTS businesses_public_category_idx
  ON businesses (is_public, category);

-- 2. Services Table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  short_description TEXT,
  long_description TEXT,
  description TEXT,
  base_price TEXT,
  price_unit TEXT,
  estimated_duration TEXT,
  duration_estimate TEXT,
  service_area TEXT,
  category TEXT,
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Unique constraint for business service slugs
CREATE UNIQUE INDEX IF NOT EXISTS services_business_slug_unique_idx
  ON services (business_id, slug)
  WHERE slug IS NOT NULL;

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
  service_id UUID,
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  customer_user_id UUID,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'snoozed')),
  ai_confidence NUMERIC DEFAULT 1.0,
  needs_human_review BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('customer', 'ai', 'owner', 'system')),
  content TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Leads Table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  service_id UUID,
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  customer_user_id UUID,
  address TEXT,
  service_type TEXT,
  preferred_date TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'booked', 'lost')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Marketplace seed businesses. SparkleHome is demo seed data, not a product default.
INSERT INTO businesses (
  id,
  name,
  slug,
  phone,
  email,
  service_area,
  opening_hours,
  description,
  is_public,
  category,
  city,
  postcode,
  public_description,
  rating,
  logo_url
)
VALUES
  (
    'd3b07384-d113-4ec5-a5d6-c6e7f8d9a101',
    'SparkleHome Cleaning',
    'sparklehome-cleaning',
    '+44 20 7946 0958',
    'info@sparklehome.co.uk',
    'Greater London, Zones 1-4',
    'Mon-Fri: 8:00 AM - 6:00 PM, Sat: 9:00 AM - 4:00 PM',
    'Professional, eco-friendly home cleaning service in London. Specialized in regular cleaning, deep cleans, and end of tenancy services.',
    TRUE,
    'Home cleaning',
    'London',
    'SW1',
    'Eco-friendly domestic and end-of-tenancy cleaning across central London.',
    4.8,
    NULL
  ),
  (
    'e4b07384-d113-4ec5-a5d6-c6e7f8d9a202',
    'FreshFix Repairs',
    'freshfix-repairs',
    '+44 20 7946 1200',
    'hello@freshfix.example',
    'North and East London',
    'Mon-Sat: 8:00 AM - 7:00 PM',
    'Local handyman and repair team handling plumbing, electrical, assembly, and urgent home maintenance jobs.',
    TRUE,
    'Home repairs',
    'London',
    'N1',
    'Reliable same-week repair visits for busy households and landlords.',
    4.7,
    NULL
  ),
  (
    'f5b07384-d113-4ec5-a5d6-c6e7f8d9a303',
    'BrightPath Tutors',
    'brightpath-tutors',
    '+44 20 7946 1300',
    'support@brightpath.example',
    'Online and Greater London',
    'Mon-Fri: 3:00 PM - 9:00 PM, Sat: 10:00 AM - 2:00 PM',
    'Private tutoring for primary, GCSE, A-Level, and exam preparation with online and in-home options.',
    TRUE,
    'Tutoring',
    'London',
    'E2',
    'Vetted tutors for maths, English, sciences, and exam confidence.',
    4.9,
    NULL
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  service_area = EXCLUDED.service_area,
  opening_hours = EXCLUDED.opening_hours,
  description = EXCLUDED.description,
  is_public = EXCLUDED.is_public,
  category = EXCLUDED.category,
  city = EXCLUDED.city,
  postcode = EXCLUDED.postcode,
  public_description = EXCLUDED.public_description,
  rating = EXCLUDED.rating,
  logo_url = EXCLUDED.logo_url;

-- Seed Services
INSERT INTO services (id, business_id, name, description, base_price, estimated_duration)
VALUES
  ('11111111-1111-4111-8111-111111111101', 'd3b07384-d113-4ec5-a5d6-c6e7f8d9a101', 'Regular home cleaning', 'Standard dusting, vacuuming, mopping, kitchen and bathroom sanitization.', 'GBP 40', '2 hours'),
  ('11111111-1111-4111-8111-111111111102', 'd3b07384-d113-4ec5-a5d6-c6e7f8d9a101', 'Deep cleaning', 'In-depth cleaning including behind appliances, baseboards, window sills, and heavy scrub.', 'GBP 90', '4 hours'),
  ('11111111-1111-4111-8111-111111111103', 'd3b07384-d113-4ec5-a5d6-c6e7f8d9a101', 'Move-out cleaning', 'Full end-of-tenancy clean to satisfy landlord checklists.', 'GBP 120', '5 hours'),
  ('22222222-2222-4222-8222-222222222201', 'e4b07384-d113-4ec5-a5d6-c6e7f8d9a202', 'General repair visit', 'Small household repairs, fixtures, fittings, and maintenance tasks.', 'GBP 65 callout', '1-2 hours'),
  ('22222222-2222-4222-8222-222222222202', 'e4b07384-d113-4ec5-a5d6-c6e7f8d9a202', 'Emergency plumbing support', 'Leak checks, blocked sinks, toilet repairs, and urgent plumbing triage.', 'From GBP 95', 'Same day'),
  ('22222222-2222-4222-8222-222222222203', 'e4b07384-d113-4ec5-a5d6-c6e7f8d9a202', 'Furniture assembly', 'Flat-pack assembly, shelving, curtain rails, and wall mounting.', 'From GBP 55', '2 hours'),
  ('33333333-3333-4333-8333-333333333301', 'f5b07384-d113-4ec5-a5d6-c6e7f8d9a303', 'GCSE maths tutoring', 'One-to-one maths support with weekly progress notes.', 'GBP 35/hour', '1 hour'),
  ('33333333-3333-4333-8333-333333333302', 'f5b07384-d113-4ec5-a5d6-c6e7f8d9a303', 'English exam preparation', 'Reading, writing, and exam technique coaching.', 'GBP 32/hour', '1 hour'),
  ('33333333-3333-4333-8333-333333333303', 'f5b07384-d113-4ec5-a5d6-c6e7f8d9a303', 'A-Level science tutoring', 'Biology, chemistry, and physics tutoring for sixth-form students.', 'GBP 45/hour', '1 hour')
ON CONFLICT (id) DO UPDATE SET
  business_id = EXCLUDED.business_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  base_price = EXCLUDED.base_price,
  estimated_duration = EXCLUDED.estimated_duration;

-- Seed FAQs
INSERT INTO faqs (id, business_id, question, answer)
VALUES
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01', 'd3b07384-d113-4ec5-a5d6-c6e7f8d9a101', 'Do you bring cleaning supplies?', 'Yes, the team brings standard eco-friendly cleaning supplies and equipment.'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02', 'd3b07384-d113-4ec5-a5d6-c6e7f8d9a101', 'Do you clean on weekends?', 'Saturday appointments are available from 9:00 AM to 4:00 PM.'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb01', 'e4b07384-d113-4ec5-a5d6-c6e7f8d9a202', 'Can I book urgent repairs?', 'Yes, same-day appointments are offered when there is engineer availability.'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb02', 'e4b07384-d113-4ec5-a5d6-c6e7f8d9a202', 'Do you bring parts?', 'Common fittings are carried, and specialist parts can be sourced after inspection.'),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccc01', 'f5b07384-d113-4ec5-a5d6-c6e7f8d9a303', 'Do you offer online tutoring?', 'Yes, all subjects can be delivered online or in person where coverage allows.'),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccc02', 'f5b07384-d113-4ec5-a5d6-c6e7f8d9a303', 'Can parents track progress?', 'Yes, tutors provide progress notes after each session.')
ON CONFLICT (id) DO UPDATE SET
  business_id = EXCLUDED.business_id,
  question = EXCLUDED.question,
  answer = EXCLUDED.answer;
