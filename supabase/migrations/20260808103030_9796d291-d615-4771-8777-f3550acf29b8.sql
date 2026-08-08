CREATE POLICY "Users upload their own chat images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'chat-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users delete their own chat images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'chat-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Chat participants read chat images"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'chat-images' AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.messages m
      WHERE (m.sender_id = auth.uid() OR m.receiver_id = auth.uid())
        AND m.attachments @> to_jsonb(ARRAY[storage.objects.name])
    )
  )
);