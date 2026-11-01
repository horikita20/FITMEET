-- Secure admin access and data sources for the FitMeet owner portal.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Remove any roles that could have been assigned through the former self-update policy.
UPDATE public.profiles
SET role = 'customer'
WHERE role = 'super_admin';

ALTER TABLE public.event_registrations
  ALTER COLUMN user_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS instagram TEXT;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'super_admin'
      AND is_active = true
  );
$$;

DROP POLICY IF EXISTS "Public profiles can be viewed by anyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users and admins can view profiles"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Users can update own non-role profile fields"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (first_name, last_name, phone, avatar_url) ON public.profiles TO authenticated;

CREATE POLICY "Admins manage organizations"
  ON public.organizations FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins manage organizer applications"
  ON public.organizer_applications FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins manage events"
  ON public.events FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins manage registrations"
  ON public.event_registrations FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins manage payments"
  ON public.payments FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins manage collaboration requests"
  ON public.collaboration_requests FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins manage contact enquiries"
  ON public.contact_enquiries FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins read audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.is_admin());

CREATE TABLE IF NOT EXISTS public.collaboration_enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  organization_type TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  support_options JSONB NOT NULL DEFAULT '[]'::jsonb,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'contacted', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.collaboration_enquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can submit collaboration enquiries"
  ON public.collaboration_enquiries FOR INSERT
  WITH CHECK (true);
CREATE POLICY "Admins manage collaboration enquiries"
  ON public.collaboration_enquiries FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE OR REPLACE FUNCTION public.create_customer_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), ' ', 1), 'Member'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.raw_user_meta_data->>'phone',
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_fitmeet ON auth.users;
CREATE TRIGGER on_auth_user_created_fitmeet
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_customer_profile();

CREATE OR REPLACE FUNCTION public.register_free_event(
  p_event_id UUID,
  p_ticket_count INTEGER,
  p_user_id UUID,
  p_full_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_gender TEXT DEFAULT NULL,
  p_instagram TEXT DEFAULT NULL,
  p_emergency_contact TEXT DEFAULT NULL
)
RETURNS SETOF public.event_registrations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  selected_event public.events%ROWTYPE;
  new_registration public.event_registrations%ROWTYPE;
  new_reference TEXT;
BEGIN
  IF p_ticket_count < 1 OR p_ticket_count > 10 THEN
    RAISE EXCEPTION 'Invalid ticket count';
  END IF;

  UPDATE public.events
  SET slots_remaining = slots_remaining - p_ticket_count,
      updated_at = timezone('utc'::text, now())
  WHERE id = p_event_id
    AND status = 'published'
    AND price_in_paise = 0
    AND slots_remaining >= p_ticket_count
  RETURNING * INTO selected_event;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event unavailable or insufficient capacity';
  END IF;

  new_reference := 'FM-' || EXTRACT(YEAR FROM now())::TEXT || '-' ||
    upper(substr(replace(gen_random_uuid()::TEXT, '-', ''), 1, 8));

  INSERT INTO public.event_registrations (
    reference_id, event_id, user_id, full_name, email, phone, emergency_contact,
    ticket_count, unit_price_in_paise, total_amount_in_paise, payment_status, qr_token,
    gender, instagram
  )
  VALUES (
    new_reference, p_event_id, p_user_id, p_full_name, p_email, p_phone,
    COALESCE(p_emergency_contact, ''), p_ticket_count, 0, 0, 'free',
    'FITMEET-PASS-' || new_reference || '-' || p_event_id::TEXT, p_gender, p_instagram
  )
  RETURNING * INTO new_registration;

  RETURN NEXT new_registration;
END;
$$;

CREATE OR REPLACE FUNCTION public.reserve_paid_registration(
  p_event_id UUID,
  p_ticket_count INTEGER,
  p_user_id UUID,
  p_full_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_gender TEXT DEFAULT NULL,
  p_instagram TEXT DEFAULT NULL,
  p_emergency_contact TEXT DEFAULT NULL
)
RETURNS SETOF public.event_registrations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  selected_event public.events%ROWTYPE;
  new_registration public.event_registrations%ROWTYPE;
  new_reference TEXT;
BEGIN
  IF p_ticket_count < 1 OR p_ticket_count > 10 THEN
    RAISE EXCEPTION 'Invalid ticket count';
  END IF;

  UPDATE public.events
  SET slots_remaining = slots_remaining - p_ticket_count,
      updated_at = timezone('utc'::text, now())
  WHERE id = p_event_id
    AND status = 'published'
    AND price_in_paise > 0
    AND slots_remaining >= p_ticket_count
  RETURNING * INTO selected_event;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event unavailable or insufficient capacity';
  END IF;

  new_reference := 'FM-' || EXTRACT(YEAR FROM now())::TEXT || '-' ||
    upper(substr(replace(gen_random_uuid()::TEXT, '-', ''), 1, 8));

  INSERT INTO public.event_registrations (
    reference_id, event_id, user_id, full_name, email, phone, emergency_contact,
    ticket_count, unit_price_in_paise, total_amount_in_paise, payment_status, qr_token,
    gender, instagram
  )
  VALUES (
    new_reference, p_event_id, p_user_id, p_full_name, p_email, p_phone,
    COALESCE(p_emergency_contact, ''), p_ticket_count, selected_event.price_in_paise,
    selected_event.price_in_paise * p_ticket_count, 'pending_payment',
    'FITMEET-PENDING-' || new_reference, p_gender, p_instagram
  )
  RETURNING * INTO new_registration;

  RETURN NEXT new_registration;
END;
$$;

CREATE OR REPLACE FUNCTION public.cancel_pending_event_registration(p_registration_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  selected_registration public.event_registrations%ROWTYPE;
BEGIN
  UPDATE public.event_registrations
  SET payment_status = 'failed',
      updated_at = timezone('utc'::text, now())
  WHERE id = p_registration_id
    AND payment_status = 'pending_payment'
  RETURNING * INTO selected_registration;

  IF FOUND THEN
    UPDATE public.events
    SET slots_remaining = LEAST(registration_capacity, slots_remaining + selected_registration.ticket_count),
        updated_at = timezone('utc'::text, now())
    WHERE id = selected_registration.event_id;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.register_free_event(UUID, INTEGER, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.reserve_paid_registration(UUID, INTEGER, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.cancel_pending_event_registration(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.register_free_event(UUID, INTEGER, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.reserve_paid_registration(UUID, INTEGER, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.cancel_pending_event_registration(UUID) TO service_role;
