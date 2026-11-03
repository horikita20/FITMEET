DROP POLICY IF EXISTS "Authenticated users can create registrations"
  ON public.event_registrations;

REVOKE INSERT ON TABLE public.event_registrations
  FROM PUBLIC, anon, authenticated;
