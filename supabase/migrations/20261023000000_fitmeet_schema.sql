-- ============================================================================
-- FITMEET DATABASE SCHEMA & ROW LEVEL SECURITY MIGRATION
-- Production-Ready Schema for Supabase PostgreSQL
-- Monetary values in Integer Paise (1 INR = 100 paise)
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'organizer', 'super_admin')),
    organization_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. ORGANIZATIONS (Gyms, Brands, Coaches, Communities)
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('gym', 'fitness_brand', 'coach', 'fitness_community', 'independent_organizer', 'other')),
    description TEXT,
    city TEXT NOT NULL,
    address TEXT,
    contact_email TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    website TEXT,
    instagram TEXT,
    logo_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
    verified BOOLEAN NOT NULL DEFAULT false,
    owner_user_id UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Link profile organization foreign key
ALTER TABLE public.profiles
ADD CONSTRAINT fk_profile_organization FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE SET NULL;

-- 3. ORGANIZER APPLICATIONS
CREATE TABLE IF NOT EXISTS public.organizer_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    organization_name TEXT NOT NULL,
    organization_type TEXT NOT NULL,
    description TEXT NOT NULL,
    city TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    verification_document_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    review_notes TEXT,
    reviewed_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. EVENTS
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('running', 'gym_hiit', 'bootcamp', 'yoga_mobility', 'hyrox_crossfit', 'cycling')),
    cover_image TEXT NOT NULL,
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'IST (UTC+5:30)',
    venue TEXT NOT NULL,
    city TEXT NOT NULL,
    location_details TEXT,
    price_in_paise INTEGER NOT NULL DEFAULT 0 CHECK (price_in_paise >= 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    registration_capacity INTEGER NOT NULL CHECK (registration_capacity > 0),
    slots_remaining INTEGER NOT NULL CHECK (slots_remaining >= 0),
    registration_deadline TIMESTAMPTZ,
    rules JSONB DEFAULT '[]'::jsonb,
    cancellation_policy TEXT,
    primary_organizer_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
    featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. EVENT CO-HOSTS (Collaborations)
CREATE TABLE IF NOT EXISTS public.event_cohosts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    role_description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(event_id, organization_id)
);

-- 6. EVENT REGISTRATIONS
CREATE TABLE IF NOT EXISTS public.event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_id TEXT NOT NULL UNIQUE,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    emergency_contact TEXT NOT NULL,
    ticket_count INTEGER NOT NULL DEFAULT 1 CHECK (ticket_count > 0),
    unit_price_in_paise INTEGER NOT NULL DEFAULT 0,
    total_amount_in_paise INTEGER NOT NULL DEFAULT 0,
    payment_status TEXT NOT NULL DEFAULT 'free' CHECK (payment_status IN ('free', 'pending_payment', 'paid', 'failed', 'refunded')),
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    qr_token TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. SEAT RESERVATIONS (Concurrency & Overbooking Protection)
CREATE TABLE IF NOT EXISTS public.seat_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    seats_reserved INTEGER NOT NULL DEFAULT 1,
    expires_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired', 'released')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. PAYMENTS (Audit & Razorpay Verification)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL REFERENCES public.event_registrations(id) ON DELETE RESTRICT,
    razorpay_order_id TEXT NOT NULL UNIQUE,
    razorpay_payment_id TEXT UNIQUE,
    razorpay_signature TEXT,
    amount_in_paise INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL CHECK (status IN ('created', 'authorized', 'captured', 'failed', 'refunded')),
    error_code TEXT,
    error_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. COLLABORATION REQUESTS
CREATE TABLE IF NOT EXISTS public.collaboration_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposer_org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    recipient_org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    proposed_role TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. SITE SETTINGS (CMS)
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. CONTACT ENQUIRIES
CREATE TABLE IF NOT EXISTS public.contact_enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    interest TEXT NOT NULL,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'responded', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 12. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_email TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- INDEXES FOR FAST QUERY PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_city ON public.events(city);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_registrations_user ON public.event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_event ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_collab_recipient ON public.collaboration_requests(recipient_org_id);
CREATE INDEX IF NOT EXISTS idx_collab_proposer ON public.collaboration_requests(proposer_org_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizer_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_cohosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seat_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: Is user super_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Public profiles can be viewed by anyone"
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Organizations Policies
CREATE POLICY "Approved organizations are public"
ON public.organizations FOR SELECT USING (status = 'approved' OR owner_user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Owners can update own organization"
ON public.organizations FOR UPDATE USING (owner_user_id = auth.uid() OR public.is_admin());

-- Events Policies
CREATE POLICY "Published events are publicly readable"
ON public.events FOR SELECT USING (status = 'published' OR public.is_admin() OR primary_organizer_id IN (
    SELECT id FROM public.organizations WHERE owner_user_id = auth.uid()
));

CREATE POLICY "Organizers can insert events"
ON public.events FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.organizations
        WHERE id = primary_organizer_id AND owner_user_id = auth.uid() AND status = 'approved'
    ) OR public.is_admin()
);

CREATE POLICY "Organizers can update own events"
ON public.events FOR UPDATE USING (
    primary_organizer_id IN (SELECT id FROM public.organizations WHERE owner_user_id = auth.uid()) OR public.is_admin()
);

-- Registrations Policies
CREATE POLICY "Users view their own registrations"
ON public.event_registrations FOR SELECT USING (
    user_id = auth.uid() OR public.is_admin() OR event_id IN (
        SELECT e.id FROM public.events e
        JOIN public.organizations o ON e.primary_organizer_id = o.id
        WHERE o.owner_user_id = auth.uid()
    )
);

CREATE POLICY "Authenticated users can create registrations"
ON public.event_registrations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Site Settings Policies
CREATE POLICY "Site settings are readable by anyone"
ON public.site_settings FOR SELECT USING (true);

CREATE POLICY "Only super admins can modify site settings"
ON public.site_settings FOR ALL USING (public.is_admin());
