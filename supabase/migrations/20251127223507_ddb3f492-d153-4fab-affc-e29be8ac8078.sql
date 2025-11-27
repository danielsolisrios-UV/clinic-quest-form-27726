-- Add password reset fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS reset_code TEXT,
ADD COLUMN IF NOT EXISTS reset_code_expires TIMESTAMP WITH TIME ZONE;