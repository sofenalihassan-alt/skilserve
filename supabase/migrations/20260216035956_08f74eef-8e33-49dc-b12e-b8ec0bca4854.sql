
-- Add country column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country text;

-- Create call_history table
CREATE TABLE public.call_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  caller_id uuid NOT NULL,
  receiver_id uuid NOT NULL,
  call_type text NOT NULL DEFAULT 'whatsapp',
  phone_number text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.call_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own call history"
ON public.call_history FOR SELECT
USING (auth.uid() = caller_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create call records"
ON public.call_history FOR INSERT
WITH CHECK (auth.uid() = caller_id);

-- Auto-generate license numbers for providers
CREATE OR REPLACE FUNCTION public.generate_license_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.license_number IS NULL OR NEW.license_number = '' THEN
    NEW.license_number := 'SP-' || UPPER(SUBSTRING(NEW.category::text FROM 1 FOR 3)) || '-' || LPAD(FLOOR(RANDOM() * 999999)::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER auto_generate_license
BEFORE INSERT ON public.service_providers
FOR EACH ROW
EXECUTE FUNCTION public.generate_license_number();
