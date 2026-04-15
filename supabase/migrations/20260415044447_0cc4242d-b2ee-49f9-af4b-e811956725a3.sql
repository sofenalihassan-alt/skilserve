CREATE TABLE public.provider_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  day_of_week integer, -- 0=Sun..6=Sat, NULL if specific_date is set
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_available boolean NOT NULL DEFAULT true,
  specific_date date, -- NULL for recurring weekly, set for one-off overrides
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.provider_availability ENABLE ROW LEVEL SECURITY;

-- Anyone can view availability
CREATE POLICY "Anyone can view availability" ON public.provider_availability
FOR SELECT USING (true);

-- Providers can manage their own availability
CREATE POLICY "Providers can insert own availability" ON public.provider_availability
FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT user_id FROM public.service_providers WHERE id = provider_id)
);

CREATE POLICY "Providers can update own availability" ON public.provider_availability
FOR UPDATE USING (
  auth.uid() IN (SELECT user_id FROM public.service_providers WHERE id = provider_id)
);

CREATE POLICY "Providers can delete own availability" ON public.provider_availability
FOR DELETE USING (
  auth.uid() IN (SELECT user_id FROM public.service_providers WHERE id = provider_id)
);

-- Trigger for updated_at
CREATE TRIGGER update_provider_availability_updated_at
BEFORE UPDATE ON public.provider_availability
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();