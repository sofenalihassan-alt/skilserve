-- Allow users to also delete messages they RECEIVED (not just sent)
DROP POLICY IF EXISTS "Users can delete their own sent messages" ON public.messages;
CREATE POLICY "Users can delete their own messages"
  ON public.messages FOR DELETE
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);