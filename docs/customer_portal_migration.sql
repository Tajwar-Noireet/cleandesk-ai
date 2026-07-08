-- SQL Migration: Add Customer Portal Security Fields
-- Execute this migration script in the Supabase SQL Editor.

ALTER TABLE conversations ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS customer_user_id UUID;

ALTER TABLE leads ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS customer_user_id UUID;
