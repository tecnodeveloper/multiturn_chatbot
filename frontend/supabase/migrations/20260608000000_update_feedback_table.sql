-- Update feedback table to include correctness and length_type
ALTER TABLE feedback 
ADD COLUMN IF NOT EXISTS correctness TEXT,
ADD COLUMN IF NOT EXISTS length_type TEXT;
