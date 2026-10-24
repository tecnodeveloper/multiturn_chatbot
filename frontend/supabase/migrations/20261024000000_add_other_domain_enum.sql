-- Migration: Add 'Other' value to domain_category_type enum
-- ADD VALUE must run in its own transaction/migration so the new value
-- is committed and visible before any subsequent INSERT references it.
ALTER TYPE domain_category_type ADD VALUE IF NOT EXISTS 'Other';
