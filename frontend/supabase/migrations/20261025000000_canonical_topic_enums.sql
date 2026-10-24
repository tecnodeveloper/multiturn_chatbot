-- Migration A: Update domain_category_type to canonical codes and set default
-- Timestamp: 20261025000000

-- Rename existing values (preserves existing rows automatically)
ALTER TYPE domain_category_type RENAME VALUE 'Machine Learning' TO 'MachineLearning';
ALTER TYPE domain_category_type RENAME VALUE 'Deep Learning' TO 'DeepLearning';
ALTER TYPE domain_category_type RENAME VALUE 'Healthcare AI' TO 'HealthcareAI';
ALTER TYPE domain_category_type RENAME VALUE 'Power Systems' TO 'PowerSystems';
ALTER TYPE domain_category_type RENAME VALUE 'E-commerce AI' TO 'E-commerceAI';

-- Add 'Other' value if not exists (cannot be used in the same transaction)
ALTER TYPE domain_category_type ADD VALUE IF NOT EXISTS 'Other';

-- Set default to 'MachineLearning'
ALTER TABLE public.domains ALTER COLUMN category SET DEFAULT 'MachineLearning';
