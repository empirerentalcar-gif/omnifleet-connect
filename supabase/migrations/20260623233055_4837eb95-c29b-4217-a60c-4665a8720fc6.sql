CREATE POLICY "Owners can update own agency" ON public.agencies
FOR UPDATE TO authenticated
USING (owner_user_id = auth.uid())
WITH CHECK (owner_user_id = auth.uid());