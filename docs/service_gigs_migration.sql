-- Migration to support owner-created service gigs and public discovery in CleanDesk
-- Run this in your Supabase SQL Editor.

ALTER TABLE services ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE services ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS long_description TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS price_unit TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS duration_estimate TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS service_area TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

-- Unique constraint for business service slugs
CREATE UNIQUE INDEX IF NOT EXISTS services_business_slug_unique_idx
  ON services (business_id, slug)
  WHERE slug IS NOT NULL;

-- Enable UUID tracking for requested services on leads and conversations if not present
ALTER TABLE leads ADD COLUMN IF NOT EXISTS service_id UUID;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS service_id UUID;
