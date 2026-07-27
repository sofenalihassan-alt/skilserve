CREATE TABLE public.client_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  client_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_reviews TO authenticated;
GRANT ALL ON public.client_reviews TO service_role;

ALTER TABLE public.client_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read client reviews"
  ON public.client_reviews FOR SELECT TO authenticated USING (true);

CREATE POLICY "Providers can create reviews for their own bookings"
  ON public.client_reviews FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bookings b
      JOIN public.service_providers sp ON sp.id = b.provider_id
      WHERE b.id = client_reviews.booking_id
        AND sp.id = client_reviews.provider_id
        AND sp.user_id = auth.uid()
        AND b.user_id = client_reviews.client_id
        AND b.status = 'completed'
    )
  );

CREATE POLICY "Providers can update their own client reviews"
  ON public.client_reviews FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.service_providers sp WHERE sp.id = client_reviews.provider_id AND sp.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.service_providers sp WHERE sp.id = client_reviews.provider_id AND sp.user_id = auth.uid()));

CREATE POLICY "Providers can delete their own client reviews"
  ON public.client_reviews FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.service_providers sp WHERE sp.id = client_reviews.provider_id AND sp.user_id = auth.uid()));

CREATE TRIGGER client_reviews_updated_at
  BEFORE UPDATE ON public.client_reviews
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.bookings
  ADD COLUMN reminder_sent_at TIMESTAMP WITH TIME ZONE;