-- Update profiles table to match user's requested schema
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS phone_number text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS avatar_url text;

-- Migration: Copy existing data if needed (name -> full_name, image_url -> avatar_url)
UPDATE public.profiles SET full_name = name WHERE full_name IS NULL AND name IS NOT NULL;
UPDATE public.profiles SET avatar_url = image_url WHERE avatar_url IS NULL AND image_url IS NOT NULL;

-- Update the handle_new_user function to include email and full_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (new.id, new.raw_user_meta_data->>'name', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
