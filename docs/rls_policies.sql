-- row level security (RLS) policies for CleanDesk AI PostgreSQL database

-- 1. Enable RLS on all tables
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- 2. Define policies for businesses
-- Only authenticated users can manage their own business profile
CREATE POLICY "Users can CRUD own business" ON businesses
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 3. Define policies for services
-- Business owners can manage their own services
CREATE POLICY "Owners can CRUD own services" ON services
  FOR ALL
  TO authenticated
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

-- 4. Define policies for FAQs
-- Business owners can manage their own FAQs
CREATE POLICY "Owners can CRUD own faqs" ON faqs
  FOR ALL
  TO authenticated
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

-- 5. Define policies for leads
-- Business owners can read/update their own leads. Direct insertion from public web is disabled (goes through backend).
CREATE POLICY "Owners can CRUD own leads" ON leads
  FOR ALL
  TO authenticated
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

-- 6. Define policies for conversations
-- Only owners can inspect conversation records
CREATE POLICY "Owners can CRUD own conversations" ON conversations
  FOR ALL
  TO authenticated
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

-- 7. Define policies for messages
-- Only owners can read/write historical message transcripts directly
CREATE POLICY "Owners can CRUD own messages" ON messages
  FOR ALL
  TO authenticated
  USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE business_id IN (
        SELECT id FROM businesses WHERE user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM conversations WHERE business_id IN (
        SELECT id FROM businesses WHERE user_id = auth.uid()
      )
    )
  );

-- 8. Customer isolation policies (for retail clients)
CREATE POLICY "Customers can select own leads" ON leads
  FOR SELECT
  TO authenticated
  USING (customer_user_id = auth.uid() OR customer_email = auth.email());

CREATE POLICY "Customers can update own leads" ON leads
  FOR UPDATE
  TO authenticated
  USING (customer_user_id = auth.uid() OR customer_email = auth.email())
  WITH CHECK (customer_user_id = auth.uid() OR customer_email = auth.email());

CREATE POLICY "Customers can select own conversations" ON conversations
  FOR SELECT
  TO authenticated
  USING (customer_user_id = auth.uid() OR customer_email = auth.email());

CREATE POLICY "Customers can update own conversations" ON conversations
  FOR UPDATE
  TO authenticated
  USING (customer_user_id = auth.uid() OR customer_email = auth.email())
  WITH CHECK (customer_user_id = auth.uid() OR customer_email = auth.email());

CREATE POLICY "Customers can select own messages" ON messages
  FOR SELECT
  TO authenticated
  USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE customer_user_id = auth.uid() OR customer_email = auth.email()
    )
  );

CREATE POLICY "Customers can insert own messages" ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM conversations WHERE customer_user_id = auth.uid() OR customer_email = auth.email()
    )
  );
