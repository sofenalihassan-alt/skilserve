ALTER VIEW public.public_profiles SET (security_invoker = on);

CREATE POLICY "Users can view profiles of people they interact with"
ON public.profiles FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.bookings b
    LEFT JOIN public.service_providers sp ON sp.id = b.provider_id
    WHERE (b.user_id = auth.uid() AND sp.user_id = profiles.id)
       OR (sp.user_id = auth.uid() AND b.user_id = profiles.id)
  )
  OR EXISTS (
    SELECT 1 FROM public.messages m
    WHERE (m.sender_id = auth.uid() AND m.receiver_id = profiles.id)
       OR (m.receiver_id = auth.uid() AND m.sender_id = profiles.id)
  )
);