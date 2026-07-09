-- Phase 7: AI receptionist + owner/customer messaging
-- No new table is required. This migration extends the existing conversation
-- tables so marketplace threads can support owner replies, AI drafts, and
-- reliable "last updated" ordering.

ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL;

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL;

ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE messages
  DROP CONSTRAINT IF EXISTS messages_sender_check;

ALTER TABLE messages
  ADD CONSTRAINT messages_sender_check
  CHECK (sender IN ('customer', 'ai', 'owner', 'system'));

UPDATE conversations
SET updated_at = created_at
WHERE updated_at IS NULL;

UPDATE leads
SET updated_at = created_at
WHERE updated_at IS NULL;

UPDATE messages
SET metadata = '{}'::jsonb
WHERE metadata IS NULL;

DROP POLICY IF EXISTS "Customers can insert own messages" ON messages;

CREATE POLICY "Customers can insert own messages" ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender = 'customer'
    AND conversation_id IN (
      SELECT id FROM conversations WHERE customer_user_id = auth.uid() OR customer_email = auth.email()
    )
  );
