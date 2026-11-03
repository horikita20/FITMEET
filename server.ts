import express, { NextFunction, Request, Response } from 'express';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  FitnessEvent,
  Organization,
  EventRegistration,
  CollaborationRequest,
  SiteSettings,
  AuditLog,
} from './src/types/index';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const FITMEET_ADMIN_USER_ID = 'b00526d3-4760-4426-997a-d6792338619b';
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin: SupabaseClient | null =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;

const requireRole =
  (allowedRoles: string[]) => async (req: Request, res: Response, next: NextFunction) => {
    if (!supabaseAdmin) {
      return res
        .status(503)
        .json({ error: 'Secure account services require server-side Supabase credentials.' });
    }

    const tokenMatch = (req.header('authorization') || '').match(/^Bearer\s+(.+)$/i);
    if (!tokenMatch)
      return res.status(401).json({ error: 'A valid signed-in session is required.' });

    try {
      const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(tokenMatch[1]);
      if (authError || !authData.user) {
        return res.status(401).json({ error: 'Your session is invalid or expired.' });
      }

      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('role,is_active')
        .eq('id', authData.user.id)
        .maybeSingle();
      if (profileError) {
        console.error('Role lookup failed:', profileError.message);
        return res.status(503).json({ error: 'Unable to verify account permissions.' });
      }
      if (
        !profile ||
        profile.is_active !== true ||
        !allowedRoles.includes(profile.role) ||
        (allowedRoles.includes('admin') && authData.user.id !== FITMEET_ADMIN_USER_ID)
      ) {
        return res
          .status(403)
          .json({ error: 'Your account is not authorized to perform this action.' });
      }
      next();
    } catch (error) {
      console.error('Authorization failed:', error);
      return res.status(503).json({ error: 'Unable to verify account permissions.' });
    }
  };

const requireAdmin = requireRole(['admin']);

const databaseEventToEvent = (row: any): FitnessEvent => ({
  id: row.id,
  title: row.title,
  description: row.description,
  category: row.category,
  coverImage: row.cover_image,
  date: row.event_date,
  displayDate: new Date(`${row.event_date}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }),
  startTime: row.start_time,
  endTime: row.end_time,
  timezone: row.timezone,
  venue: row.venue,
  city: row.city,
  locationDetails: row.location_details || undefined,
  priceInPaise: row.price_in_paise,
  currency: row.currency,
  registrationCapacity: row.registration_capacity,
  slotsRemaining: row.slots_remaining,
  registrationDeadline: row.registration_deadline || '',
  rules: row.rules || [],
  cancellationPolicy: row.cancellation_policy || '',
  primaryOrganizerId: row.primary_organizer_id,
  primaryOrganizerName: row.organizer?.name || '',
  coHosts: [],
  status: row.status,
  featured: row.featured,
  createdAt: row.created_at,
});
// Use express.json with verify callback to capture raw body for secure webhook verification
app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

// ============================================================================
// IN-MEMORY PERSISTENCE / DATABASE STORE (SAMPLE DATA & SEEDS)
// Allows complete live functionality in development while Supabase PostgreSQL
// migrations (/supabase/migrations/20261023000000_fitmeet_schema.sql) are deployed.
// ============================================================================

const siteSettings: SiteSettings = {
  brandName: 'FITMEET',
  tagline: 'Run Together. Grow Together.',
  heroHeadline: 'Challenge Yourself. Expand Your Circle.',
  heroSubheadline: "Patna & India's Fitness Community",
  heroLead:
    'Fitness challenges, gym visits, expert coaches, new friendships and real experiences — all in one community. Every Sunday.',
  primaryCity: 'Patna',
  accentColor: '#FC5300',
  contactEmail: 'contact@fitmeet.in',
  contactPhone: '+91 98350 12345',
  contactAddress: 'Ganga Pathway (Marine Drive), Digha, Patna, Bihar 800011',
  instagramUrl: 'https://instagram.com/fitmeet.in',
  youtubeUrl: 'https://youtube.com/@fitmeet',
  twitterUrl: 'https://x.com/fitmeet',
  customDomain: process.env.CLIENT_DOMAIN || 'fitmeet.in',
};

const SITE_SETTINGS_KEY = 'public';
const siteSettingFields = Object.keys(siteSettings) as Array<keyof SiteSettings>;

const parseSiteSettingsPatch = (body: unknown): Partial<SiteSettings> => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return {};
  const patch: Partial<SiteSettings> = {};
  for (const field of siteSettingFields) {
    const value = (body as Record<string, unknown>)[field];
    if (typeof value === 'string') patch[field] = value;
  }
  return patch;
};

const saveSiteSettings = async (patch: Partial<SiteSettings>) => {
  const nextSettings = { ...siteSettings, ...patch };
  if (supabaseAdmin) {
    const { error } = await supabaseAdmin.from('site_settings').upsert(
      {
        key: SITE_SETTINGS_KEY,
        value: nextSettings,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    );
    if (error) return { error };
  }
  Object.assign(siteSettings, nextSettings);
  return { settings: nextSettings };
};

const loadSiteSettings = async () => {
  if (!supabaseAdmin) return { settings: siteSettings };
  const { data, error } = await supabaseAdmin
    .from('site_settings')
    .select('value')
    .eq('key', SITE_SETTINGS_KEY)
    .maybeSingle();
  if (error) return { error };
  const storedValue = data?.value;
  const storedSettings =
    storedValue && typeof storedValue === 'object' && !Array.isArray(storedValue)
      ? parseSiteSettingsPatch(storedValue)
      : {};
  return {
    settings: { ...siteSettings, ...storedSettings },
  };
};

const organizations: Organization[] = [
  {
    id: 'org-01',
    name: 'FitMeet Patna Crew',
    type: 'fitness_community',
    description: 'The founding running and functional fitness crew of Patna. 500+ runners strong.',
    city: 'Patna',
    address: 'Ganga Pathway, Marine Drive, Patna',
    contactEmail: 'crew@fitmeet.in',
    contactPhone: '+91 98350 12345',
    instagram: '@fitmeet.patna',
    status: 'approved',
    verified: true,
    ownerUserId: 'user-admin',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'org-02',
    name: 'IronCore Fitness Arena',
    type: 'gym',
    description: 'Premier strength, conditioning, and HIIT gym with Olympic barbell platforms.',
    city: 'Patna',
    address: 'Boring Road, Patna, Bihar',
    contactEmail: 'contact@ironcore.in',
    contactPhone: '+91 91234 56789',
    instagram: '@ironcore.patna',
    status: 'approved',
    verified: true,
    ownerUserId: 'user-organizer-1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'org-03',
    name: 'Coach Rakesh Strength Lab',
    type: 'coach',
    description: 'Certified RRCA Running Coach & CSCS Strength Specialist.',
    city: 'Patna',
    contactEmail: 'coachrakesh@gmail.com',
    contactPhone: '+91 98765 43210',
    instagram: '@coachrakesh_run',
    status: 'approved',
    verified: true,
    ownerUserId: 'user-coach-1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'org-04',
    name: 'WildCraft Active & Electrolytes',
    type: 'fitness_brand',
    description: 'High performance hydration, running gear, and recovery supplements.',
    city: 'Bengaluru',
    contactEmail: 'partnerships@wildcraftactive.in',
    contactPhone: '+91 80 4455 6677',
    status: 'approved',
    verified: true,
    ownerUserId: 'user-brand-1',
    createdAt: new Date().toISOString(),
  },
];

let events: FitnessEvent[] = [
  {
    id: 'ev-01',
    title: 'FitMeet Sunday Run & Community Workout',
    description:
      'The flagship Sunday morning session. 5K/10K pacing waves along Ganga Pathway followed by a functional core & mobility challenge on the open deck with fresh coconut water and bananas.',
    category: 'running',
    coverImage: '/assets/images/hero_runners_dawn.jpg',
    date: '2026-11-01',
    displayDate: 'Sunday, Nov 1, 2026',
    startTime: '06:00 AM',
    endTime: '08:00 AM',
    timezone: 'IST (UTC+5:30)',
    venue: 'Ganga Pathway (Marine Drive Promenade)',
    city: 'Patna',
    locationDetails: 'Meet at Digha Ghat Roundabout Pin',
    priceInPaise: 0, // Free community event
    currency: 'INR',
    registrationCapacity: 150,
    slotsRemaining: 34,
    registrationDeadline: '2026-10-31T23:59:59Z',
    rules: [
      'Arrive 15 minutes early for dynamic warmup.',
      'Hydration bottles recommended; water refills provided.',
      'Zero drop policy: sweep pacers run with the last participant.',
    ],
    cancellationPolicy: 'Free cancellation up to 12 hours before event start.',
    primaryOrganizerId: 'org-01',
    primaryOrganizerName: 'FitMeet Patna Crew',
    coHosts: [
      {
        organizationId: 'org-03',
        organizationName: 'Coach Rakesh Strength Lab',
        role: 'Warmup & Pacing Lead',
        status: 'accepted',
      },
    ],
    status: 'published',
    featured: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ev-02',
    title: 'IronCore Barbells & Calisthenics Throwdown',
    description:
      'Co-hosted strength meet. Stations for kettlebell swings, box jumps, sled pushes, and pull-up relays. Tailored for all fitness levels with scaled options.',
    category: 'gym_hiit',
    coverImage: '/assets/images/track_night_intervals.jpg',
    date: '2026-11-08',
    displayDate: 'Sunday, Nov 8, 2026',
    startTime: '07:30 AM',
    endTime: '09:30 AM',
    timezone: 'IST (UTC+5:30)',
    venue: 'IronCore Fitness Arena',
    city: 'Patna',
    locationDetails: 'Floor 3, Boring Road Commercial Complex',
    priceInPaise: 29900, // ₹299.00
    currency: 'INR',
    registrationCapacity: 60,
    slotsRemaining: 18,
    registrationDeadline: '2026-11-07T18:00:00Z',
    rules: [
      'Gym shoes mandatory; chalk provided on site.',
      'Towel and personal water bottle required.',
      'Finishers receive energy shakes and custom event badge.',
    ],
    cancellationPolicy: 'Refunds available up to 48 hours before session.',
    primaryOrganizerId: 'org-02',
    primaryOrganizerName: 'IronCore Fitness Arena',
    coHosts: [
      {
        organizationId: 'org-01',
        organizationName: 'FitMeet Patna Crew',
        role: 'Community Co-Host',
        status: 'accepted',
      },
      {
        organizationId: 'org-04',
        organizationName: 'WildCraft Active & Electrolytes',
        role: 'Hydration & Nutrition Sponsor',
        status: 'accepted',
      },
    ],
    status: 'published',
    featured: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ev-coming-soon-01',
    title: 'The Next Run Is Coming Soon',
    description:
      "We just wrapped up an incredible run, and we're already working on the next experience. Event details, date, location, and registrations will be announced soon.",
    category: 'running',
    coverImage: '/assets/images/hero_runners_dawn.jpg',
    date: '2026-11-29',
    displayDate: 'Details dropping soon',
    startTime: 'To be announced',
    endTime: 'To be announced',
    timezone: 'IST (UTC+5:30)',
    venue: 'To be announced',
    city: 'Patna',
    locationDetails: 'New routes, new themes, same energy. All paces welcome.',
    priceInPaise: 0,
    currency: 'INR',
    registrationCapacity: 250,
    slotsRemaining: 0,
    registrationDeadline: '2026-11-28T23:59:59Z',
    rules: ['All paces welcome.', 'Priority notification sent to waitlist members.'],
    cancellationPolicy: 'Free cancellation.',
    primaryOrganizerId: 'org-01',
    primaryOrganizerName: 'FitMeet Patna Crew',
    coHosts: [],
    status: 'coming_soon',
    featured: true,
    createdAt: new Date().toISOString(),
  },
];

let registrations: EventRegistration[] = [
  {
    id: 'reg-01',
    referenceId: 'FM-2026-1001',
    eventId: 'ev-01',
    eventTitle: 'FitMeet Sunday Run & Community Workout',
    eventDate: 'Sunday, Nov 1, 2026',
    eventTime: '06:00 AM',
    eventVenue: 'Ganga Pathway (Marine Drive Promenade)',
    eventCity: 'Patna',
    userId: 'user-demo',
    fullName: 'Aditya Raj',
    email: 'aditya.runner@gmail.com',
    phone: '+91 98351 99999',
    emergencyContact: 'Sunil Raj (+91 98351 88888)',
    ticketCount: 1,
    unitPriceInPaise: 0,
    totalAmountInPaise: 0,
    paymentStatus: 'free',
    qrToken: 'FITMEET-TOKEN-EV01-REG01-CONFIRMED',
    createdAt: new Date().toISOString(),
  },
];

let collaborationRequests: CollaborationRequest[] = [
  {
    id: 'collab-01',
    proposerOrgId: 'org-02',
    proposerOrgName: 'IronCore Fitness Arena',
    proposerType: 'gym',
    recipientOrgId: 'org-01',
    recipientOrgName: 'FitMeet Patna Crew',
    eventId: 'ev-02',
    eventTitle: 'IronCore Barbells & Calisthenics Throwdown',
    proposedRole: 'Lead Running & Pacing Cohort',
    message:
      'We would love the FitMeet crew to lead the 3K warmup jog and community games before the barbell circuit.',
    status: 'accepted',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'collab-02',
    proposerOrgId: 'org-04',
    proposerOrgName: 'WildCraft Active & Electrolytes',
    proposerType: 'fitness_brand',
    recipientOrgId: 'org-01',
    recipientOrgName: 'FitMeet Patna Crew',
    eventId: 'ev-01',
    eventTitle: 'FitMeet Sunday Run & Community Workout',
    proposedRole: 'Hydration & Nutrition Sponsor',
    message:
      'We would like to supply free electrolyte recovery bottles and testing kits for all 150 participants.',
    status: 'accepted',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

let organizerApplications: any[] = [
  {
    id: 'app-01',
    userId: 'user-organizer-new',
    organizationName: 'Pulse Crossfit Kankarbagh',
    organizationType: 'gym',
    city: 'Patna',
    contactEmail: 'pulsecrossfit@gmail.com',
    contactPhone: '+91 98350 44332',
    description: 'Affiliated CrossFit box with certified Level 2 trainers and 2000 sqft turf area.',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
];

let auditLogs: AuditLog[] = [
  {
    id: 'log-01',
    timestamp: new Date().toISOString(),
    actorEmail: 'system@fitmeet.in',
    action: 'SYSTEM_BOOTSTRAP',
    details: 'FitMeet production engine initialized with database seeds and security policies.',
  },
];

// ============================================================================
// API ENDPOINTS
// ============================================================================

// 1. Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    platform: 'FitMeet Event Platform',
    domain: siteSettings.customDomain,
    currency: 'INR',
    timestamp: new Date().toISOString(),
  });
});

// 2. Settings (CMS)
app.get('/api/settings', async (_req: Request, res: Response) => {
  const { settings, error } = await loadSiteSettings();
  if (error) {
    console.error('Site settings query failed:', error.message);
    return res.status(503).json({ error: 'Unable to load site settings.' });
  }
  res.json(settings);
});

app.post('/api/settings', requireAdmin, async (req: Request, res: Response) => {
  const { settings, error } = await saveSiteSettings(parseSiteSettingsPatch(req.body));
  if (error) {
    console.error('Site settings update failed:', error.message);
    return res.status(500).json({ error: 'Unable to save site settings.' });
  }
  auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actorEmail: 'admin@fitmeet.in',
    action: 'UPDATE_SITE_SETTINGS',
    details: 'CMS settings updated by platform owner.',
  });
  res.json({ success: true, settings });
});

// 3. Events List & Filtering
app.get('/api/events', async (req: Request, res: Response) => {
  const { city, category, price, search } = req.query;
  let filtered: FitnessEvent[];
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('events')
      .select('*,organizer:organizations(name)')
      .eq('status', 'published')
      .order('event_date', { ascending: true });
    if (error) {
      console.error('Event database query failed:', error.message);
      return res.status(503).json({ error: 'Unable to load events from the database.' });
    }
    filtered = (data || []).map(databaseEventToEvent);
  } else {
    filtered = [...events];
  }

  filtered = filtered.filter((e) => e.status === 'published');

  if (city && city !== 'all') {
    filtered = filtered.filter((e) => e.city.toLowerCase() === String(city).toLowerCase());
  }

  if (category && category !== 'all') {
    filtered = filtered.filter((e) => e.category === category);
  }

  if (price === 'free') {
    filtered = filtered.filter((e) => e.priceInPaise === 0);
  } else if (price === 'paid') {
    filtered = filtered.filter((e) => e.priceInPaise > 0);
  }

  if (search) {
    const q = String(search).toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        e.city.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q)
    );
  }

  res.json(filtered);
});

// 4. Single Event Details
app.get('/api/events/:id', async (req: Request, res: Response) => {
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('events')
      .select('*,organizer:organizations(name)')
      .eq('id', req.params.id)
      .eq('status', 'published')
      .maybeSingle();
    if (error) {
      console.error('Event database query failed:', error.message);
      return res.status(503).json({ error: 'Unable to load event details.' });
    }
    if (!data) return res.status(404).json({ error: 'Event not found' });
    return res.json(databaseEventToEvent(data));
  }
  const event = events.find((e) => e.id === req.params.id && e.status === 'published');
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }
  res.json(event);
});

// 5. Create Event (Organizer / Admin)
app.post('/api/events', requireAdmin, async (req: Request, res: Response) => {
  const body = req.body;
  if (!body.title || !body.date || !body.startTime || !body.venue || !body.registrationCapacity) {
    return res.status(400).json({ error: 'Missing required event fields' });
  }
  if (supabaseAdmin) {
    const eventData = normalizeEventPayload(body);
    if (
      !Number.isInteger(eventData.registration_capacity) ||
      eventData.registration_capacity < 1 ||
      !Number.isInteger(eventData.price_in_paise) ||
      eventData.price_in_paise < 0 ||
      !['running', 'gym_hiit', 'bootcamp', 'yoga_mobility', 'hyrox_crossfit', 'cycling'].includes(
        eventData.category
      ) ||
      !['draft', 'published', 'cancelled', 'completed'].includes(eventData.status)
    ) {
      return res.status(400).json({ error: 'Invalid event details.' });
    }
    const { data, error } = await supabaseAdmin
      .from('events')
      .insert({ ...eventData, slots_remaining: eventData.registration_capacity })
      .select('*,organizer:organizations(name)')
      .single();
    if (error) {
      console.error('Event creation failed:', error.message);
      return res
        .status(400)
        .json({ error: 'Unable to create event. Check organizer and event details.' });
    }
    return res.status(201).json(databaseEventToEvent(data));
  }

  const priceInPaise = Number(body.priceInPaise) || 0;
  const capacity = Number(body.registrationCapacity);

  const newEvent: FitnessEvent = {
    id: `ev-${Date.now()}`,
    title: body.title,
    description: body.description || '',
    category: body.category || 'running',
    coverImage:
      body.coverImage ||
      'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1800&q=85',
    date: body.date,
    displayDate: body.displayDate || body.date,
    startTime: body.startTime,
    endTime: body.endTime || '08:00 AM',
    timezone: 'IST (UTC+5:30)',
    venue: body.venue,
    city: body.city || siteSettings.primaryCity,
    locationDetails: body.locationDetails,
    priceInPaise,
    currency: 'INR',
    registrationCapacity: capacity,
    slotsRemaining: capacity,
    registrationDeadline:
      body.registrationDeadline || new Date(Date.now() + 86400000 * 7).toISOString(),
    rules: body.rules || ['Follow organizer safety instructions.'],
    cancellationPolicy: body.cancellationPolicy || 'Standard 24-hour notice required.',
    primaryOrganizerId: body.primaryOrganizerId || 'org-01',
    primaryOrganizerName: body.primaryOrganizerName || 'FitMeet Organizer',
    coHosts: body.coHosts || [],
    status: body.status || 'published',
    featured: Boolean(body.featured),
    createdAt: new Date().toISOString(),
  };

  events.unshift(newEvent);

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actorEmail: body.userEmail || 'organizer@fitmeet.in',
    action: 'CREATE_EVENT',
    details: `Created event: ${newEvent.title} (Price: ₹${(priceInPaise / 100).toFixed(2)})`,
  });

  res.status(201).json(newEvent);
});

// 6. Update Event
app.put('/api/events/:id', requireAdmin, async (req: Request, res: Response) => {
  if (supabaseAdmin) {
    const { data: existingEvent, error: existingError } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();
    if (existingError) {
      console.error('Event lookup failed:', existingError.message);
      return res.status(500).json({ error: 'Unable to load event.' });
    }
    if (!existingEvent) return res.status(404).json({ error: 'Event not found.' });
    const input = normalizeEventPayload(req.body);
    if (
      !Number.isInteger(input.registration_capacity) ||
      input.registration_capacity < 1 ||
      !Number.isInteger(input.price_in_paise) ||
      input.price_in_paise < 0 ||
      !['running', 'gym_hiit', 'bootcamp', 'yoga_mobility', 'hyrox_crossfit', 'cycling'].includes(
        input.category
      ) ||
      !['draft', 'published', 'cancelled', 'completed'].includes(input.status)
    ) {
      return res.status(400).json({ error: 'Invalid event details.' });
    }
    const { data: registrationsForEvent, error: registrationsError } = await supabaseAdmin
      .from('event_registrations')
      .select('ticket_count')
      .eq('event_id', req.params.id);
    if (registrationsError) {
      console.error('Event capacity lookup failed:', registrationsError.message);
      return res.status(500).json({ error: 'Unable to verify event capacity.' });
    }
    const occupied = (registrationsForEvent || []).reduce(
      (total, row) => total + row.ticket_count,
      0
    );
    const { data, error } = await supabaseAdmin
      .from('events')
      .update({ ...input, slots_remaining: Math.max(0, input.registration_capacity - occupied) })
      .eq('id', req.params.id)
      .select('*,organizer:organizations(name)')
      .single();
    if (error) {
      console.error('Event update failed:', error.message);
      return res.status(400).json({ error: 'Unable to update event.' });
    }
    return res.json(databaseEventToEvent(data));
  }
  const index = events.findIndex((e) => e.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Event not found' });
  events[index] = { ...events[index], ...req.body };
  res.json(events[index]);
});

// 7. Organizations Directory
app.get('/api/organizations', async (_req: Request, res: Response) => {
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('organizations')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Organization database query failed:', error.message);
      return res.status(503).json({ error: 'Unable to load organizations.' });
    }
    return res.json(
      (data || []).map((row) => ({
        id: row.id,
        name: row.name,
        type: row.type,
        description: row.description || '',
        city: row.city,
        address: row.address || undefined,
        contactEmail: row.contact_email,
        contactPhone: row.contact_phone,
        website: row.website || undefined,
        instagram: row.instagram || undefined,
        logoUrl: row.logo_url || undefined,
        status: row.status,
        verified: row.verified,
        ownerUserId: row.owner_user_id,
        createdAt: row.created_at,
      }))
    );
  }
  res.json(organizations.filter((organization) => organization.status === 'approved'));
});

// 8. Submit Organizer Application
app.post('/api/organizations/apply', (req: Request, res: Response) => {
  const {
    organizationName,
    organizationType,
    city,
    contactEmail,
    contactPhone,
    description,
    userId,
  } = req.body;
  if (!organizationName || !contactEmail || !contactPhone) {
    return res.status(400).json({ error: 'Missing contact or organization name' });
  }

  const newApp = {
    id: `app-${Date.now()}`,
    userId: userId || 'user-applicant',
    organizationName,
    organizationType: organizationType || 'gym',
    city: city || 'Patna',
    contactEmail,
    contactPhone,
    description: description || '',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  organizerApplications.unshift(newApp);

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actorEmail: contactEmail,
    action: 'ORGANIZER_APPLICATION',
    details: `New application received for organization: ${organizationName}`,
  });

  res.status(201).json({ success: true, application: newApp });
});

// 9. Collaboration Requests (Send & Review)
app.get('/api/collaborations', (_req: Request, res: Response) => {
  res.json(collaborationRequests);
});

app.post('/api/collaborations', (req: Request, res: Response) => {
  const { proposerOrgId, recipientOrgId, eventId, proposedRole, message } = req.body;
  const proposer = organizations.find((o) => o.id === proposerOrgId);
  const recipient = organizations.find((o) => o.id === recipientOrgId);
  const event = events.find((e) => e.id === eventId);

  if (!proposer || !recipient) {
    return res.status(400).json({ error: 'Invalid organization references' });
  }

  const newCollab: CollaborationRequest = {
    id: `collab-${Date.now()}`,
    proposerOrgId,
    proposerOrgName: proposer.name,
    proposerType: proposer.type,
    recipientOrgId,
    recipientOrgName: recipient.name,
    eventId,
    eventTitle: event?.title,
    proposedRole: proposedRole || 'Co-Host Partner',
    message: message || '',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  collaborationRequests.unshift(newCollab);
  res.status(201).json(newCollab);
});

app.post('/api/collaboration-enquiries', async (req: Request, res: Response) => {
  if (!supabaseAdmin) {
    return res
      .status(503)
      .json({ error: 'Collaboration submissions require server-side Supabase configuration.' });
  }
  const { name, organizationType, phone, city, supportOptions, message } = req.body;
  if (
    typeof name !== 'string' ||
    !name.trim() ||
    typeof organizationType !== 'string' ||
    !organizationType.trim() ||
    typeof phone !== 'string' ||
    !phone.trim() ||
    typeof city !== 'string' ||
    !city.trim() ||
    !Array.isArray(supportOptions) ||
    supportOptions.some((option: unknown) => typeof option !== 'string')
  ) {
    return res.status(400).json({
      error: 'Please provide valid collaboration details and at least one support option.',
    });
  }
  const { data, error } = await supabaseAdmin
    .from('collaboration_enquiries')
    .insert({
      name: name.trim().slice(0, 160),
      organization_type: organizationType.trim().slice(0, 100),
      phone: phone.trim().slice(0, 40),
      city: city.trim().slice(0, 120),
      support_options: supportOptions.slice(0, 12).map((option: string) => option.slice(0, 120)),
      message: typeof message === 'string' ? message.trim().slice(0, 2000) : null,
    })
    .select('id')
    .single();
  if (error) {
    console.error('Collaboration enquiry persistence failed:', error.message);
    return res
      .status(500)
      .json({ error: 'Unable to save collaboration enquiry. Please try again.' });
  }
  res.status(201).json({ success: true, id: data.id });
});

app.post('/api/contact-enquiries', async (req: Request, res: Response) => {
  if (!supabaseAdmin) {
    return res
      .status(503)
      .json({ error: 'Contact submissions require server-side Supabase configuration.' });
  }
  const { name, email, phone, interest, message } = req.body;
  if (
    typeof name !== 'string' ||
    !name.trim() ||
    typeof email !== 'string' ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    typeof interest !== 'string' ||
    !interest.trim() ||
    (phone !== undefined && typeof phone !== 'string') ||
    (message !== undefined && typeof message !== 'string')
  ) {
    return res.status(400).json({ error: 'Please provide valid contact details.' });
  }
  const messageParts = [];
  if (typeof phone === 'string' && phone.trim())
    messageParts.push(`Phone: ${phone.trim().slice(0, 40)}`);
  if (typeof message === 'string' && message.trim())
    messageParts.push(message.trim().slice(0, 2000));

  const { data, error } = await supabaseAdmin
    .from('contact_enquiries')
    .insert({
      name: name.trim().slice(0, 160),
      email: email.trim().toLowerCase().slice(0, 320),
      interest: interest.trim().slice(0, 160),
      message: messageParts.join('\n\n') || null,
    })
    .select('id')
    .single();
  if (error) {
    console.error('Contact enquiry persistence failed:', error.message);
    return res.status(500).json({ error: 'Unable to save contact enquiry. Please try again.' });
  }
  res.status(201).json({ success: true, id: data.id });
});

app.patch('/api/collaborations/:id', requireAdmin, (req: Request, res: Response) => {
  const { status } = req.body;
  const collab = collaborationRequests.find((c) => c.id === req.params.id);
  if (!collab) {
    return res.status(404).json({ error: 'Collaboration request not found' });
  }

  collab.status = status;

  // If accepted and tied to an event, attach to event co-hosts list
  if (status === 'accepted' && collab.eventId) {
    const event = events.find((e) => e.id === collab.eventId);
    if (event) {
      const existing = event.coHosts.find((ch) => ch.organizationId === collab.proposerOrgId);
      if (!existing) {
        event.coHosts.push({
          organizationId: collab.proposerOrgId,
          organizationName: collab.proposerOrgName,
          role: collab.proposedRole,
          status: 'accepted',
        });
      }
    }
  }

  res.json(collab);
});

// 10. Registrations List (User or Event)
app.get('/api/registrations', async (req: Request, res: Response) => {
  const { userId, eventId } = req.query;
  if (!supabaseAdmin) {
    return res
      .status(503)
      .json({ error: 'Registration access requires the configured Supabase database.' });
  }
  const token = (req.header('authorization') || '').match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return res.status(401).json({ error: 'Sign in to view your registrations.' });
  const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !authData.user)
    return res.status(401).json({ error: 'Your session is invalid or expired.' });
  if (userId && userId !== authData.user.id)
    return res.status(403).json({ error: 'You may only view your own registrations.' });
  let query = supabaseAdmin
    .from('event_registrations')
    .select('*,event:events(title,event_date,start_time,end_time,venue,city)')
    .eq('user_id', authData.user.id)
    .order('created_at', { ascending: false });
  if (eventId) query = query.eq('event_id', String(eventId));
  const { data, error } = await query;
  if (error) {
    console.error('Registration database query failed:', error.message);
    return res.status(500).json({ error: 'Unable to load registrations.' });
  }
  return res.json(
    (data || []).map((row) => ({
      id: row.id,
      referenceId: row.reference_id,
      eventId: row.event_id,
      eventTitle: row.event?.title || '',
      eventDate: row.event?.event_date || '',
      eventTime: row.event?.start_time || '',
      eventVenue: row.event?.venue || '',
      eventCity: row.event?.city || '',
      userId: row.user_id || '',
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      gender: row.gender || undefined,
      instagram: row.instagram || undefined,
      emergencyContact: row.emergency_contact || undefined,
      ticketCount: row.ticket_count,
      unitPriceInPaise: row.unit_price_in_paise,
      totalAmountInPaise: row.total_amount_in_paise,
      paymentStatus: row.payment_status,
      razorpayOrderId: row.razorpay_order_id || undefined,
      razorpayPaymentId: row.razorpay_payment_id || undefined,
      qrToken: row.qr_token,
      createdAt: row.created_at,
    }))
  );
});

// 11. Create Free Registration (Zero Payment)
app.post('/api/registrations/free', async (req: Request, res: Response) => {
  const {
    eventId,
    userId,
    fullName,
    email,
    phone,
    gender,
    instagram,
    emergencyContact,
    ticketCount = 1,
  } = req.body;
  if (supabaseAdmin) {
    const count = Number(ticketCount);
    if (!Number.isInteger(count) || count < 1 || count > 10 || !fullName || !email || !phone) {
      return res
        .status(400)
        .json({ error: 'Please provide valid participant and ticket details.' });
    }
    const token = (req.header('authorization') || '').match(/^Bearer\s+(.+)$/i)?.[1];
    let authenticatedUserId: string | null = null;
    if (token) {
      const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);
      if (authError || !authData.user)
        return res.status(401).json({ error: 'Your session is invalid or expired.' });
      authenticatedUserId = authData.user.id;
    }
    const { data, error } = await supabaseAdmin.rpc('register_free_event', {
      p_event_id: eventId,
      p_ticket_count: count,
      p_user_id: authenticatedUserId,
      p_full_name: String(fullName).trim(),
      p_email: String(email).trim().toLowerCase(),
      p_phone: String(phone).trim(),
      p_gender: gender || null,
      p_instagram: instagram || null,
      p_emergency_contact: emergencyContact || null,
    });
    if (error || !data?.[0]) {
      if (error) console.warn('Free registration was not completed:', error.message);
      return res
        .status(409)
        .json({ error: 'Registration failed. The event may be unavailable or full.' });
    }
    const [row] = data;
    const { data: eventRow } = await supabaseAdmin
      .from('events')
      .select('title,event_date,start_time,venue,city')
      .eq('id', row.event_id)
      .maybeSingle();
    const registration: EventRegistration = {
      id: row.id,
      referenceId: row.reference_id,
      eventId: row.event_id,
      eventTitle: eventRow?.title || '',
      eventDate: eventRow?.event_date || '',
      eventTime: eventRow?.start_time || '',
      eventVenue: eventRow?.venue || '',
      eventCity: eventRow?.city || '',
      userId: row.user_id || '',
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      gender: row.gender || undefined,
      instagram: row.instagram || undefined,
      emergencyContact: row.emergency_contact || undefined,
      ticketCount: row.ticket_count,
      unitPriceInPaise: row.unit_price_in_paise,
      totalAmountInPaise: row.total_amount_in_paise,
      paymentStatus: row.payment_status,
      razorpayOrderId: row.razorpay_order_id || undefined,
      razorpayPaymentId: row.razorpay_payment_id || undefined,
      qrToken: row.qr_token,
      createdAt: row.created_at,
    };
    return res.status(201).json({ success: true, registration });
  }
  const event = events.find((e) => e.id === eventId);

  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  if (event.priceInPaise !== 0) {
    return res.status(400).json({ error: 'Event requires payment. Please use Razorpay checkout.' });
  }

  if (event.slotsRemaining < ticketCount) {
    return res.status(409).json({ error: 'Event is fully booked or insufficient slots remain.' });
  }

  // Decrement capacity transactionally
  event.slotsRemaining -= ticketCount;

  const referenceId = `FM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const qrToken = `FITMEET-PASS-${referenceId}-${event.id}`;

  const newReg: EventRegistration = {
    id: `reg-${Date.now()}`,
    referenceId,
    eventId: event.id,
    eventTitle: event.title,
    eventDate: event.displayDate,
    eventTime: event.startTime,
    eventVenue: event.venue,
    eventCity: event.city,
    userId: userId || 'user-guest',
    fullName,
    email,
    phone,
    gender: gender || '',
    instagram: instagram || '',
    emergencyContact: emergencyContact || '',
    ticketCount,
    unitPriceInPaise: 0,
    totalAmountInPaise: 0,
    paymentStatus: 'free',
    qrToken,
    createdAt: new Date().toISOString(),
  };

  registrations.unshift(newReg);

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actorEmail: email,
    action: 'FREE_REGISTRATION_CONFIRMED',
    details: `Confirmed free registration ${referenceId} for ${event.title}`,
  });

  res.status(201).json({ success: true, registration: newReg });
});

// 12. Priority Waitlist
interface WaitlistRecord {
  id: string;
  referenceId: string;
  eventId?: string;
  eventTitle?: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  paceInterest?: string;
  notes?: string;
  createdAt: string;
}

let waitlistEntries: WaitlistRecord[] = [
  {
    id: 'wl-01',
    referenceId: 'WL-PATNA-1001',
    eventId: 'ev-coming-soon-01',
    eventTitle: 'The Next Run Is Coming Soon',
    fullName: 'Priya Verma',
    email: 'priya@example.com',
    phone: '+91 98350 44321',
    city: 'Patna',
    paceInterest: '5K Runner',
    createdAt: new Date().toISOString(),
  },
];

app.get('/api/waitlist', (_req: Request, res: Response) => {
  res.json(waitlistEntries);
});

app.post('/api/waitlist', (req: Request, res: Response) => {
  const {
    fullName,
    email,
    phone,
    city = 'Patna',
    eventId,
    eventTitle,
    paceInterest,
    notes,
  } = req.body;

  if (!fullName || !email || !phone) {
    return res
      .status(400)
      .json({ error: 'Full name, email, and phone are required for waitlist notification.' });
  }

  const referenceId = `WL-${(city || 'PATNA').toUpperCase().slice(0, 5)}-${Math.floor(1000 + Math.random() * 9000)}`;
  const newEntry: WaitlistRecord = {
    id: `wl-${Date.now()}`,
    referenceId,
    eventId: eventId || 'ev-coming-soon-01',
    eventTitle: eventTitle || 'The Next Run Is Coming Soon',
    fullName,
    email,
    phone,
    city,
    paceInterest: paceInterest || 'All Paces Welcome',
    notes,
    createdAt: new Date().toISOString(),
  };

  waitlistEntries.unshift(newEntry);

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actorEmail: email,
    action: 'WAITLIST_JOINED',
    details: `${fullName} joined priority waitlist (${referenceId}) for ${newEntry.eventTitle}`,
  });

  res.status(201).json({
    success: true,
    waitlist: newEntry,
    whatsappChannelUrl: 'https://whatsapp.com/channel/0029VbE5yl8Likg2G1r0I83R',
  });
});

// ============================================================================
// RAZORPAY INTEGRATION (SERVER-SIDE ORDER CREATION & SIGNATURE VERIFICATION)
// Calculates price from trusted DB records in integer paise.
// Never trusts client-supplied amounts. Never exposes Razorpay Key Secret.
// ============================================================================

app.post('/api/razorpay/create-order', async (req: Request, res: Response) => {
  const { eventId } = req.body;
  const ticketCount = Number(req.body.ticketCount ?? 1);
  const razorpayKeyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
  const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!razorpayKeyId || !razorpaySecret || razorpayKeyId.includes('YourKeyIdHere')) {
    return res.status(400).json({
      error:
        'Razorpay payment gateway is not configured yet. Live payments require gateway API credentials.',
      configured: false,
    });
  }
  if (!Number.isInteger(ticketCount) || ticketCount < 1 || ticketCount > 10) {
    return res.status(400).json({ error: 'Ticket count must be between 1 and 10.' });
  }

  let event: FitnessEvent | null = null;
  let reservedRegistration: any = null;
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('events')
      .select('*,organizer:organizations(name)')
      .eq('id', eventId)
      .maybeSingle();
    if (error) {
      console.error('Payment event lookup failed:', error.message);
      return res.status(503).json({ error: 'Unable to verify event pricing.' });
    }
    if (!data) return res.status(404).json({ error: 'Event not found.' });
    event = databaseEventToEvent(data);
  } else {
    event = events.find((item) => item.id === eventId) || null;
  }
  if (!event) return res.status(404).json({ error: 'Event not found.' });
  if (event.status !== 'published')
    return res.status(400).json({ error: 'This event is not open for registration.' });
  if (event.priceInPaise <= 0)
    return res.status(400).json({ error: 'Free event does not require a Razorpay order.' });

  let authenticatedUserId: string | null = null;
  const sessionToken = (req.header('authorization') || '').match(/^Bearer\s+(.+)$/i)?.[1];
  if (sessionToken && supabaseAdmin) {
    const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(sessionToken);
    if (authError || !authData.user)
      return res.status(401).json({ error: 'Your session is invalid or expired.' });
    authenticatedUserId = authData.user.id;
  }

  const amountInPaise = event.priceInPaise * ticketCount;
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin.rpc('reserve_paid_registration', {
      p_event_id: event.id,
      p_ticket_count: ticketCount,
      p_user_id: authenticatedUserId,
      p_full_name: String(req.body.userName || req.body.userEmail || 'FitMeet participant').trim(),
      p_email: String(req.body.userEmail || '')
        .trim()
        .toLowerCase(),
      p_phone: String(req.body.userPhone || '').trim(),
      p_gender: null,
      p_instagram: null,
      p_emergency_contact: null,
    });
    if (error || !data?.[0]) {
      if (error) console.warn('Paid registration reservation failed:', error.message);
      return res.status(409).json({ error: 'The event is full or no longer available.' });
    }
    reservedRegistration = data[0];
  } else {
    const memoryEvent = events.find((item) => item.id === event!.id)!;
    if (memoryEvent.slotsRemaining < ticketCount) {
      return res.status(409).json({ error: 'Event capacity exceeded. No seats available.' });
    }
    memoryEvent.slotsRemaining -= ticketCount;
  }

  const receipt = `fitmeet_${Date.now().toString(36)}`.slice(0, 40);
  let razorpayResponse: globalThis.Response;
  let razorpayOrder: any;
  try {
    razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${razorpayKeyId}:${razorpaySecret}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt,
        notes: { event_id: event.id, ticket_count: String(ticketCount) },
      }),
    });
    razorpayOrder = await razorpayResponse.json();
  } catch (error) {
    console.error('Razorpay order creation request failed:', error);
    if (reservedRegistration && supabaseAdmin) {
      await supabaseAdmin.rpc('cancel_pending_event_registration', {
        p_registration_id: reservedRegistration.id,
      });
    } else if (!supabaseAdmin) {
      const memoryEvent = events.find((item) => item.id === event!.id);
      if (memoryEvent) memoryEvent.slotsRemaining += ticketCount;
    }
    return res
      .status(502)
      .json({ error: 'Payment provider could not be reached. Please try again.' });
  }
  if (!razorpayResponse.ok || !razorpayOrder?.id || razorpayOrder.amount !== amountInPaise) {
    console.error('Razorpay rejected order creation:', razorpayOrder);
    if (reservedRegistration && supabaseAdmin) {
      await supabaseAdmin.rpc('cancel_pending_event_registration', {
        p_registration_id: reservedRegistration.id,
      });
    } else if (!supabaseAdmin) {
      const memoryEvent = events.find((item) => item.id === event!.id);
      if (memoryEvent) memoryEvent.slotsRemaining += ticketCount;
    }
    return res.status(502).json({ error: 'Payment provider could not create the order.' });
  }

  if (reservedRegistration && supabaseAdmin) {
    const { error: registrationError } = await supabaseAdmin
      .from('event_registrations')
      .update({ razorpay_order_id: razorpayOrder.id })
      .eq('id', reservedRegistration.id);
    const { error: paymentError } = await supabaseAdmin.from('payments').insert({
      registration_id: reservedRegistration.id,
      razorpay_order_id: razorpayOrder.id,
      amount_in_paise: amountInPaise,
      currency: 'INR',
      status: 'created',
    });
    if (registrationError || paymentError) {
      console.error(
        'Unable to persist payment order:',
        registrationError?.message || paymentError?.message
      );
      await supabaseAdmin.rpc('cancel_pending_event_registration', {
        p_registration_id: reservedRegistration.id,
      });
      return res
        .status(500)
        .json({ error: 'Unable to save the payment order. Please contact FitMeet support.' });
    }
  }

  res.json({
    orderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    keyId: razorpayKeyId,
    receipt: razorpayOrder.receipt,
    eventName: event.title,
    unitPriceInPaise: event.priceInPaise,
    ticketCount,
    testMode: razorpayKeyId.startsWith('rzp_test_'),
  });
});

app.post('/api/razorpay/verify-payment', async (req: Request, res: Response) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, eventId } = req.body;
  const razorpayKeyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
  const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!razorpayKeyId || !razorpaySecret) {
    return res.status(503).json({ error: 'Razorpay server credentials are not configured.' });
  }
  if (
    typeof razorpay_order_id !== 'string' ||
    typeof razorpay_payment_id !== 'string' ||
    typeof razorpay_signature !== 'string'
  ) {
    return res
      .status(400)
      .json({ error: 'Payment order, transaction, and signature are required.' });
  }

  const expectedSignature = crypto
    .createHmac('sha256', razorpaySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest();
  let submittedSignature: Buffer;
  try {
    submittedSignature = Buffer.from(razorpay_signature, 'hex');
  } catch {
    return res.status(400).json({ error: 'Invalid payment signature.' });
  }
  if (
    submittedSignature.length !== expectedSignature.length ||
    !crypto.timingSafeEqual(expectedSignature, submittedSignature)
  ) {
    return res.status(400).json({ error: 'Invalid payment signature.' });
  }

  let registrationRow: any = null;
  let event: FitnessEvent | null = null;
  let expectedAmount = 0;
  let verifiedTicketCount = 0;
  if (supabaseAdmin) {
    const { data: payment, error } = await supabaseAdmin
      .from('payments')
      .select('*,registration:event_registrations(*)')
      .eq('razorpay_order_id', razorpay_order_id)
      .maybeSingle();
    if (error) {
      console.error('Payment record lookup failed:', error.message);
      return res.status(500).json({ error: 'Unable to verify this payment record.' });
    }
    if (!payment || !payment.registration) {
      return res
        .status(404)
        .json({ error: 'The payment order is not associated with a FitMeet registration.' });
    }
    registrationRow = payment.registration;
    verifiedTicketCount = registrationRow.ticket_count;
    if (registrationRow.event_id !== eventId) {
      return res.status(400).json({ error: 'The payment order does not match this event.' });
    }
    if (payment.status === 'captured' && payment.razorpay_payment_id === razorpay_payment_id) {
      const { data: eventRow } = await supabaseAdmin
        .from('events')
        .select('*,organizer:organizations(name)')
        .eq('id', registrationRow.event_id)
        .maybeSingle();
      if (!eventRow) return res.status(404).json({ error: 'Registered event not found.' });
      return res.json({
        success: true,
        registration: databaseRegistrationToResponse(registrationRow, eventRow),
        message: 'Payment was already verified.',
      });
    }
    if (payment.status !== 'created') {
      return res.status(409).json({ error: 'This payment order cannot be confirmed.' });
    }
    expectedAmount = registrationRow.total_amount_in_paise;
    const { data: eventRow, error: eventError } = await supabaseAdmin
      .from('events')
      .select('*,organizer:organizations(name)')
      .eq('id', registrationRow.event_id)
      .maybeSingle();
    if (eventError || !eventRow) {
      return res.status(404).json({ error: 'Registered event not found.' });
    }
    event = databaseEventToEvent(eventRow);
  } else {
    event = events.find((item) => item.id === eventId) || null;
    if (!event) return res.status(404).json({ error: 'Event not found.' });
    const orderResponse = await fetch(
      `https://api.razorpay.com/v1/orders/${encodeURIComponent(razorpay_order_id)}`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${razorpayKeyId}:${razorpaySecret}`).toString('base64')}`,
        },
      }
    );
    const order = await orderResponse.json();
    verifiedTicketCount = Number(order.notes?.ticket_count);
    if (
      !orderResponse.ok ||
      order.notes?.event_id !== event.id ||
      !Number.isInteger(verifiedTicketCount) ||
      verifiedTicketCount < 1 ||
      verifiedTicketCount > 10 ||
      order.amount !== event.priceInPaise * verifiedTicketCount
    ) {
      return res.status(400).json({ error: 'Payment order does not match this event.' });
    }
    expectedAmount = order.amount;
  }

  let paymentResponse: globalThis.Response;
  let providerPayment: any;
  try {
    paymentResponse = await fetch(
      `https://api.razorpay.com/v1/payments/${encodeURIComponent(razorpay_payment_id)}`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${razorpayKeyId}:${razorpaySecret}`).toString('base64')}`,
        },
      }
    );
    providerPayment = await paymentResponse.json();
  } catch (error) {
    console.error('Razorpay payment lookup failed:', error);
    return res.status(502).json({ error: 'Unable to verify payment with Razorpay right now.' });
  }
  if (!paymentResponse.ok || providerPayment.order_id !== razorpay_order_id) {
    return res.status(400).json({ error: 'Razorpay payment does not match the supplied order.' });
  }
  if (providerPayment.status === 'authorized') {
    try {
      paymentResponse = await fetch(
        `https://api.razorpay.com/v1/payments/${encodeURIComponent(razorpay_payment_id)}/capture`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(`${razorpayKeyId}:${razorpaySecret}`).toString('base64')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ amount: expectedAmount, currency: 'INR' }),
        }
      );
      providerPayment = await paymentResponse.json();
    } catch (error) {
      console.error('Razorpay payment capture failed:', error);
      return res.status(502).json({ error: 'Unable to capture payment with Razorpay right now.' });
    }
  }
  if (
    !paymentResponse.ok ||
    providerPayment.status !== 'captured' ||
    providerPayment.order_id !== razorpay_order_id ||
    providerPayment.amount !== expectedAmount ||
    providerPayment.currency !== 'INR'
  ) {
    return res
      .status(400)
      .json({ error: 'Razorpay has not confirmed a captured payment for the expected amount.' });
  }

  if (supabaseAdmin && registrationRow) {
    const { data: paymentUpdate, error: paymentUpdateError } = await supabaseAdmin
      .from('payments')
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status: 'captured',
      })
      .eq('razorpay_order_id', razorpay_order_id)
      .eq('status', 'created')
      .select('id')
      .maybeSingle();
    if (paymentUpdateError || !paymentUpdate) {
      console.error(
        'Captured payment record update failed:',
        paymentUpdateError?.message || 'Payment was already processed.'
      );
      return res.status(409).json({
        error:
          'Payment was captured, but its registration could not be finalized. Contact FitMeet support.',
      });
    }
    const { data: updatedRegistration, error: registrationUpdateError } = await supabaseAdmin
      .from('event_registrations')
      .update({
        payment_status: 'paid',
        razorpay_payment_id,
        qr_token: `FITMEET-PASS-${registrationRow.reference_id}-${razorpay_payment_id}`,
      })
      .eq('id', registrationRow.id)
      .eq('payment_status', 'pending_payment')
      .select('*')
      .maybeSingle();
    if (registrationUpdateError || !updatedRegistration) {
      console.error(
        'Captured payment registration update failed:',
        registrationUpdateError?.message || 'Registration was already finalized.'
      );
      return res.status(500).json({
        error:
          'Payment was captured but registration finalization failed. Contact FitMeet support.',
      });
    }
    const { data: eventRow } = await supabaseAdmin
      .from('events')
      .select('*,organizer:organizations(name)')
      .eq('id', updatedRegistration.event_id)
      .maybeSingle();
    if (!eventRow)
      return res
        .status(500)
        .json({ error: 'Payment was captured but event details could not be loaded.' });
    return res.json({
      success: true,
      registration: databaseRegistrationToResponse(updatedRegistration, eventRow),
      message: 'Payment verified and registration confirmed.',
    });
  }

  if (!event) return res.status(404).json({ error: 'Event not found.' });
  const referenceId = `FM-${new Date().getFullYear()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  const registration: EventRegistration = {
    id: `reg-${crypto.randomUUID()}`,
    referenceId,
    eventId: event.id,
    eventTitle: event.title,
    eventDate: event.displayDate,
    eventTime: event.startTime,
    eventVenue: event.venue,
    eventCity: event.city,
    userId: '',
    fullName: req.body.fullName,
    email: req.body.email,
    phone: req.body.phone,
    gender: req.body.gender || '',
    instagram: req.body.instagram || '',
    emergencyContact: req.body.emergencyContact || '',
    ticketCount: verifiedTicketCount,
    unitPriceInPaise: event.priceInPaise,
    totalAmountInPaise: expectedAmount,
    paymentStatus: 'paid',
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    qrToken: `FITMEET-PASS-${referenceId}-${razorpay_payment_id}`,
    createdAt: new Date().toISOString(),
  };
  registrations.unshift(registration);
  auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actorEmail: registration.email,
    action: 'PAYMENT_VERIFIED_AND_CONFIRMED',
    details: `Razorpay captured payment ${razorpay_payment_id} for ${event.title}.`,
  });
  res.json({
    success: true,
    registration,
    message: 'Payment verified and registration confirmed.',
  });
});

// 12. Razorpay Webhook Handler (Raw Body HMAC Verification)
app.post('/api/razorpay/webhook', async (req: any, res: Response) => {
  const webhookSignature = req.headers['x-razorpay-signature'];
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return res.status(503).json({ error: 'Razorpay webhook verification is not configured.' });
  }
  if (typeof webhookSignature !== 'string' || !req.rawBody) {
    return res.status(400).json({ error: 'Missing webhook signature or raw request body.' });
  }
  const expectedSignature = crypto.createHmac('sha256', webhookSecret).update(req.rawBody).digest();
  const submittedSignature = Buffer.from(webhookSignature, 'hex');
  if (
    submittedSignature.length !== expectedSignature.length ||
    !crypto.timingSafeEqual(expectedSignature, submittedSignature)
  ) {
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  const eventPayload = req.body;
  if (eventPayload.event === 'payment.captured') {
    const capturedPayment = eventPayload.payload?.payment?.entity;
    if (
      typeof capturedPayment?.id !== 'string' ||
      typeof capturedPayment.order_id !== 'string' ||
      capturedPayment.status !== 'captured' ||
      !Number.isInteger(capturedPayment.amount) ||
      capturedPayment.currency !== 'INR'
    ) {
      return res.status(400).json({ error: 'Invalid captured-payment webhook payload.' });
    }
    if (!supabaseAdmin) {
      return res
        .status(503)
        .json({ error: 'Payment reconciliation requires server-side Supabase credentials.' });
    }

    const { data: linkedPayment, error: paymentLookupError } = await supabaseAdmin
      .from('payments')
      .select('id,registration_id,amount_in_paise,status,razorpay_payment_id')
      .eq('razorpay_order_id', capturedPayment.order_id)
      .maybeSingle();
    if (paymentLookupError) {
      console.error('Webhook payment lookup failed:', paymentLookupError.message);
      return res.status(503).json({ error: 'Unable to reconcile the payment event.' });
    }
    if (!linkedPayment) return res.json({ status: 'ignored' });
    if (linkedPayment.amount_in_paise !== capturedPayment.amount) {
      return res
        .status(400)
        .json({ error: 'Captured-payment amount does not match the stored order.' });
    }
    if (
      linkedPayment.status === 'captured' &&
      linkedPayment.razorpay_payment_id !== capturedPayment.id
    ) {
      return res
        .status(409)
        .json({ error: 'The order is already associated with another captured payment.' });
    }
    if (linkedPayment.status !== 'captured') {
      if (!['created', 'authorized'].includes(linkedPayment.status)) {
        return res
          .status(409)
          .json({ error: 'The stored order is no longer eligible for capture.' });
      }
      const { error: paymentUpdateError } = await supabaseAdmin
        .from('payments')
        .update({ razorpay_payment_id: capturedPayment.id, status: 'captured' })
        .eq('id', linkedPayment.id)
        .in('status', ['created', 'authorized']);
      if (paymentUpdateError) {
        console.error('Webhook payment update failed:', paymentUpdateError.message);
        return res.status(503).json({ error: 'Unable to reconcile the payment event.' });
      }
    }

    const { data: registration, error: registrationLookupError } = await supabaseAdmin
      .from('event_registrations')
      .select('id,payment_status,razorpay_payment_id')
      .eq('id', linkedPayment.registration_id)
      .maybeSingle();
    if (registrationLookupError || !registration) {
      console.error(
        'Webhook registration lookup failed:',
        registrationLookupError?.message || 'Registration not found.'
      );
      return res.status(503).json({ error: 'Unable to reconcile the registration.' });
    }
    if (registration.payment_status === 'pending_payment') {
      const { error: registrationUpdateError } = await supabaseAdmin
        .from('event_registrations')
        .update({ razorpay_payment_id: capturedPayment.id, payment_status: 'paid' })
        .eq('id', registration.id)
        .eq('payment_status', 'pending_payment');
      if (registrationUpdateError) {
        console.error('Webhook registration update failed:', registrationUpdateError.message);
        return res.status(503).json({ error: 'Unable to reconcile the registration.' });
      }
    } else if (
      registration.payment_status !== 'paid' ||
      registration.razorpay_payment_id !== capturedPayment.id
    ) {
      return res
        .status(409)
        .json({ error: 'The registration is no longer eligible for this payment.' });
    }
  }

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actorEmail: 'razorpay-webhook',
    action: `WEBHOOK_${eventPayload.event || 'RECEIVED'}`,
    details: `Processed webhook payload safely with idempotency check.`,
  });

  res.json({ status: 'ok' });
});

const GALLERY_STORAGE_BUCKET = 'fitmeet-gallery';
const GALLERY_MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const GALLERY_IMAGE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const isValidGalleryImage = (image: Buffer, contentType: string) => {
  if (contentType === 'image/jpeg') {
    return image.length >= 3 && image[0] === 0xff && image[1] === 0xd8 && image[2] === 0xff;
  }
  if (contentType === 'image/png') {
    return (
      image.length >= 8 &&
      image.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    );
  }
  if (contentType === 'image/webp') {
    return (
      image.length >= 12 &&
      image.toString('ascii', 0, 4) === 'RIFF' &&
      image.toString('ascii', 8, 12) === 'WEBP'
    );
  }
  return false;
};

app.get('/api/gallery', async (_req: Request, res: Response) => {
  if (!supabaseAdmin) {
    return res
      .status(503)
      .json({ error: 'Gallery services require server-side Supabase credentials.' });
  }
  try {
    const { data, error } = await supabaseAdmin
      .from('gallery_images')
      .select('id,image_url,caption,created_at')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Public gallery query failed:', error.message);
      return res.status(500).json({ error: 'Unable to load gallery images.' });
    }
    return res.json(data || []);
  } catch (error) {
    console.error('Public gallery request failed:', error);
    return res.status(500).json({ error: 'Unable to load gallery images.' });
  }
});

app.use('/api/admin', requireAdmin);

app.get('/api/admin/portal/gallery', async (_req: Request, res: Response) => {
  const db = supabaseAdmin;
  if (!db) {
    return res
      .status(503)
      .json({ error: 'Gallery services require server-side Supabase credentials.' });
  }
  const { data, error } = await db
    .from('gallery_images')
    .select('id,image_url,caption,created_at')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Admin gallery query failed:', error.message);
    return res.status(500).json({ error: 'Unable to load gallery images.' });
  }
  return res.json(data || []);
});

app.post(
  '/api/admin/portal/gallery',
  express.raw({ type: 'image/*', limit: GALLERY_MAX_IMAGE_BYTES }),
  async (req: Request, res: Response) => {
    const db = supabaseAdmin;
    if (!db) {
      return res
        .status(503)
        .json({ error: 'Gallery services require server-side Supabase credentials.' });
    }

    const contentType = (req.header('content-type') || '').split(';')[0].trim().toLowerCase();
    const image = Buffer.isBuffer(req.body) ? req.body : null;
    let caption: string;
    try {
      caption = decodeURIComponent(req.header('x-image-caption') || '');
    } catch {
      return res.status(400).json({ error: 'The image caption is invalid.' });
    }
    if (!image || image.length === 0 || image.length > GALLERY_MAX_IMAGE_BYTES) {
      return res.status(400).json({ error: 'Choose an image no larger than 10 MB.' });
    }
    if (!GALLERY_IMAGE_EXTENSIONS[contentType] || !isValidGalleryImage(image, contentType)) {
      return res.status(415).json({ error: 'Upload a valid JPEG, PNG or WebP image.' });
    }
    if (caption.length > 500) {
      return res.status(400).json({ error: 'Captions must be 500 characters or fewer.' });
    }

    const storagePath = `${crypto.randomUUID()}.${GALLERY_IMAGE_EXTENSIONS[contentType]}`;
    try {
      const { error: storageError } = await db.storage
        .from(GALLERY_STORAGE_BUCKET)
        .upload(storagePath, image, {
          cacheControl: '31536000',
          contentType,
          upsert: false,
        });
      if (storageError) {
        console.error('Gallery image upload failed:', storageError.message);
        return res.status(500).json({ error: 'Unable to store this gallery image.' });
      }

      const { data: publicUrl } = db.storage.from(GALLERY_STORAGE_BUCKET).getPublicUrl(storagePath);
      const { data, error } = await db
        .from('gallery_images')
        .insert({
          image_url: publicUrl.publicUrl,
          storage_path: storagePath,
          caption: caption.trim(),
        })
        .select('id,image_url,caption,created_at')
        .single();
      if (error) {
        const { error: cleanupError } = await db.storage
          .from(GALLERY_STORAGE_BUCKET)
          .remove([storagePath]);
        if (cleanupError) {
          console.error('Unable to clean up an unlisted gallery image:', cleanupError.message);
        }
        console.error('Gallery image record creation failed:', error.message);
        return res.status(500).json({ error: 'Unable to add this image to the gallery.' });
      }
      return res.status(201).json(data);
    } catch (error) {
      console.error('Gallery image upload request failed:', error);
      return res.status(500).json({ error: 'Unable to upload this gallery image.' });
    }
  },
  (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const status = (error as { status?: number }).status;
    if (status === 413) {
      return res.status(413).json({ error: 'Each gallery image must be 10 MB or smaller.' });
    }
    console.error('Gallery upload body parsing failed:', error);
    return res.status(400).json({ error: 'Unable to read the uploaded image.' });
  }
);

app.patch('/api/admin/portal/gallery/:id', async (req: Request, res: Response) => {
  const db = supabaseAdmin;
  if (!db) {
    return res
      .status(503)
      .json({ error: 'Gallery services require server-side Supabase credentials.' });
  }
  if (!req.body || typeof req.body.caption !== 'string' || req.body.caption.length > 500) {
    return res.status(400).json({ error: 'Provide a caption with 500 characters or fewer.' });
  }
  const { data, error } = await db
    .from('gallery_images')
    .update({ caption: req.body.caption.trim() })
    .eq('id', req.params.id)
    .select('id,image_url,caption,created_at')
    .maybeSingle();
  if (error) {
    console.error('Gallery caption update failed:', error.message);
    return res.status(500).json({ error: 'Unable to update the gallery caption.' });
  }
  if (!data) return res.status(404).json({ error: 'Gallery image not found.' });
  return res.json(data);
});

app.delete('/api/admin/portal/gallery/:id', async (req: Request, res: Response) => {
  const db = supabaseAdmin;
  if (!db) {
    return res
      .status(503)
      .json({ error: 'Gallery services require server-side Supabase credentials.' });
  }
  const { data: image, error: lookupError } = await db
    .from('gallery_images')
    .select('id,storage_path')
    .eq('id', req.params.id)
    .maybeSingle();
  if (lookupError) {
    console.error('Gallery image lookup failed during delete:', lookupError.message);
    return res.status(500).json({ error: 'Unable to delete this gallery image.' });
  }
  if (!image) return res.status(404).json({ error: 'Gallery image not found.' });

  const { error: deleteError } = await db.from('gallery_images').delete().eq('id', image.id);
  if (deleteError) {
    console.error('Gallery image record deletion failed:', deleteError.message);
    return res.status(500).json({ error: 'Unable to delete this gallery image.' });
  }
  const { error: storageError } = await db.storage
    .from(GALLERY_STORAGE_BUCKET)
    .remove([image.storage_path]);
  if (storageError) {
    console.error('Gallery image storage cleanup failed:', storageError.message);
    return res.json({
      storageCleanupWarning:
        'The photo is no longer public, but its stored file could not be removed.',
    });
  }
  return res.json({ deleted: true });
});

app.get('/api/admin/portal/settings', async (_req: Request, res: Response) => {
  const { settings, error } = await loadSiteSettings();
  if (error) {
    console.error('Admin site settings query failed:', error.message);
    return res.status(500).json({ error: 'Unable to load site settings.' });
  }
  res.json(settings);
});

app.put('/api/admin/portal/settings', async (req: Request, res: Response) => {
  const patch = parseSiteSettingsPatch(req.body);
  if (!Object.keys(patch).length) {
    return res.status(400).json({ error: 'Provide at least one valid site setting.' });
  }
  const { settings, error } = await saveSiteSettings(patch);
  if (error) {
    console.error('Admin site settings update failed:', error.message);
    return res.status(500).json({ error: 'Unable to save site settings.' });
  }
  auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actorEmail: 'admin@fitmeet.in',
    action: 'UPDATE_SITE_SETTINGS',
    details: 'CMS settings updated by platform owner.',
  });
  res.json(settings);
});

const adminEventFromRow = (row: any): FitnessEvent => ({
  id: row.id,
  title: row.title,
  description: row.description,
  category: row.category,
  coverImage: row.cover_image,
  date: row.event_date,
  displayDate: new Date(`${row.event_date}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }),
  startTime: row.start_time,
  endTime: row.end_time,
  timezone: row.timezone,
  venue: row.venue,
  city: row.city,
  locationDetails: row.location_details || undefined,
  priceInPaise: row.price_in_paise,
  currency: row.currency,
  registrationCapacity: row.registration_capacity,
  slotsRemaining: row.slots_remaining,
  registrationDeadline: row.registration_deadline || '',
  rules: row.rules || [],
  cancellationPolicy: row.cancellation_policy || '',
  primaryOrganizerId: row.primary_organizer_id,
  primaryOrganizerName: row.organizer?.name || '',
  coHosts: [],
  status: row.status,
  featured: row.featured,
  createdAt: row.created_at,
});

const databaseRegistrationToResponse = (row: any, eventRow: any): EventRegistration => ({
  id: row.id,
  referenceId: row.reference_id,
  eventId: row.event_id,
  eventTitle: eventRow.title,
  eventDate: eventRow.event_date,
  eventTime: eventRow.start_time,
  eventVenue: eventRow.venue,
  eventCity: eventRow.city,
  userId: row.user_id || '',
  fullName: row.full_name,
  email: row.email,
  phone: row.phone,
  gender: row.gender || undefined,
  instagram: row.instagram || undefined,
  emergencyContact: row.emergency_contact || undefined,
  ticketCount: row.ticket_count,
  unitPriceInPaise: row.unit_price_in_paise,
  totalAmountInPaise: row.total_amount_in_paise,
  paymentStatus: row.payment_status,
  razorpayOrderId: row.razorpay_order_id || undefined,
  razorpayPaymentId: row.razorpay_payment_id || undefined,
  qrToken: row.qr_token,
  createdAt: row.created_at,
});
const normalizeEventPayload = (body: any) => {
  const startTime = String(body.startTime || '');
  const endTime = String(body.endTime || '');
  const toDatabaseTime = (time: string) => {
    const match = time.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
    if (!match) return time;
    let hours = Number(match[1]);
    if (match[3]) {
      hours %= 12;
      if (match[3].toUpperCase() === 'PM') hours += 12;
    }
    return `${String(hours).padStart(2, '0')}:${match[2]}:00`;
  };
  return {
    title: body.title,
    description: body.description || '',
    category: body.category || 'running',
    cover_image: body.coverImage || '/assets/images/hero_runners_dawn.jpg',
    event_date: body.date,
    start_time: toDatabaseTime(startTime),
    end_time: toDatabaseTime(endTime || startTime),
    timezone: body.timezone || 'IST (UTC+5:30)',
    venue: body.venue,
    city: body.city,
    location_details: body.locationDetails || null,
    price_in_paise: Number(body.priceInPaise),
    currency: 'INR',
    registration_capacity: Number(body.registrationCapacity),
    registration_deadline: body.registrationDeadline || null,
    rules: Array.isArray(body.rules) ? body.rules : [],
    cancellation_policy: body.cancellationPolicy || '',
    primary_organizer_id: body.primaryOrganizerId,
    status: body.status || 'draft',
    featured: Boolean(body.featured),
  };
};

app.get('/api/admin/portal/overview', async (_req: Request, res: Response) => {
  const db = supabaseAdmin;
  if (!db)
    return res
      .status(503)
      .json({ error: 'Admin services require server-side Supabase credentials.' });
  const [users, eventsCount, registrations, payments] = await Promise.all([
    db.from('profiles').select('id', { count: 'exact', head: true }),
    db.from('events').select('id', { count: 'exact', head: true }),
    db.from('event_registrations').select('id', { count: 'exact', head: true }),
    db.from('payments').select('amount_in_paise').eq('status', 'captured'),
  ]);
  const failed = users.error || eventsCount.error || registrations.error || payments.error;
  if (failed) {
    console.error('Admin overview query failed:', failed.message);
    return res.status(500).json({ error: 'Unable to load dashboard records.' });
  }
  res.json({
    totalUsers: users.count || 0,
    totalEvents: eventsCount.count || 0,
    totalRegistrations: registrations.count || 0,
    totalRevenuePaise: (payments.data || []).reduce(
      (total, payment) => total + payment.amount_in_paise,
      0
    ),
  });
});

app.get('/api/admin/portal/events', async (_req: Request, res: Response) => {
  const db = supabaseAdmin;
  if (!db)
    return res
      .status(503)
      .json({ error: 'Admin services require server-side Supabase credentials.' });
  const { data, error } = await db
    .from('events')
    .select('*,organizer:organizations(name)')
    .order('event_date', { ascending: false });
  if (error) {
    console.error('Admin event query failed:', error.message);
    return res.status(500).json({ error: 'Unable to load events.' });
  }
  res.json((data || []).map(adminEventFromRow));
});

app.get('/api/admin/portal/organizations', async (_req: Request, res: Response) => {
  const db = supabaseAdmin;
  if (!db)
    return res
      .status(503)
      .json({ error: 'Admin services require server-side Supabase credentials.' });
  const { data, error } = await db
    .from('organizations')
    .select('id,name')
    .eq('status', 'approved')
    .order('name');
  if (error) {
    console.error('Admin organization query failed:', error.message);
    return res.status(500).json({ error: 'Unable to load organizations.' });
  }
  res.json(data || []);
});

app.post('/api/admin/portal/events', async (req: Request, res: Response) => {
  const db = supabaseAdmin;
  if (!db)
    return res
      .status(503)
      .json({ error: 'Admin services require server-side Supabase credentials.' });
  const input = normalizeEventPayload(req.body);
  if (
    !input.title ||
    !input.event_date ||
    !input.start_time ||
    !input.end_time ||
    !input.venue ||
    !input.city ||
    !input.primary_organizer_id ||
    !Number.isInteger(input.registration_capacity) ||
    input.registration_capacity < 1 ||
    !Number.isInteger(input.price_in_paise) ||
    input.price_in_paise < 0 ||
    !['running', 'gym_hiit', 'bootcamp', 'yoga_mobility', 'hyrox_crossfit', 'cycling'].includes(
      input.category
    ) ||
    !['draft', 'published', 'cancelled', 'completed'].includes(input.status)
  ) {
    return res.status(400).json({ error: 'Please provide valid event details.' });
  }
  const { data, error } = await db
    .from('events')
    .insert({ ...input, slots_remaining: input.registration_capacity })
    .select('*,organizer:organizations(name)')
    .single();
  if (error) {
    console.error('Admin event creation failed:', error.message);
    return res
      .status(400)
      .json({ error: 'Could not create event. Check the organizer and event details.' });
  }
  res.status(201).json(adminEventFromRow(data));
});

app.put('/api/admin/portal/events/:id', async (req: Request, res: Response) => {
  const db = supabaseAdmin;
  if (!db)
    return res
      .status(503)
      .json({ error: 'Admin services require server-side Supabase credentials.' });
  const input = normalizeEventPayload(req.body);
  if (
    !input.title ||
    !input.event_date ||
    !input.start_time ||
    !input.end_time ||
    !input.venue ||
    !input.city ||
    !input.primary_organizer_id ||
    !Number.isInteger(input.registration_capacity) ||
    input.registration_capacity < 1 ||
    !Number.isInteger(input.price_in_paise) ||
    input.price_in_paise < 0 ||
    !['running', 'gym_hiit', 'bootcamp', 'yoga_mobility', 'hyrox_crossfit', 'cycling'].includes(
      input.category
    ) ||
    !['draft', 'published', 'cancelled', 'completed'].includes(input.status)
  ) {
    return res.status(400).json({ error: 'Please provide valid event details.' });
  }
  const { data: registrations, error: countError } = await db
    .from('event_registrations')
    .select('ticket_count')
    .eq('event_id', req.params.id);
  if (countError) {
    console.error('Admin event registration lookup failed:', countError.message);
    return res.status(500).json({ error: 'Unable to verify event capacity.' });
  }
  const usedSlots = (registrations || []).reduce((sum, row) => sum + row.ticket_count, 0);
  const { data, error } = await db
    .from('events')
    .update({ ...input, slots_remaining: Math.max(0, input.registration_capacity - usedSlots) })
    .eq('id', req.params.id)
    .select('*,organizer:organizations(name)')
    .maybeSingle();
  if (error) {
    console.error('Admin event update failed:', error.message);
    return res.status(400).json({ error: 'Could not update event.' });
  }
  if (!data) return res.status(404).json({ error: 'Event not found.' });
  res.json(adminEventFromRow(data));
});

app.delete('/api/admin/portal/events/:id', async (req: Request, res: Response) => {
  const db = supabaseAdmin;
  if (!db)
    return res
      .status(503)
      .json({ error: 'Admin services require server-side Supabase credentials.' });
  const { error } = await db.from('events').delete().eq('id', req.params.id);
  if (error) {
    console.error('Admin event deletion failed:', error.message);
    return res
      .status(409)
      .json({ error: 'Event could not be deleted; it may have registrations or related records.' });
  }
  res.json({ success: true });
});

app.get('/api/admin/portal/users', async (_req: Request, res: Response) => {
  const db = supabaseAdmin;
  if (!db)
    return res
      .status(503)
      .json({ error: 'Admin services require server-side Supabase credentials.' });
  const { data, error } = await db
    .from('profiles')
    .select('id,email,first_name,last_name,phone,role,is_active,created_at')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Admin user query failed:', error.message);
    return res.status(500).json({ error: 'Unable to load users.' });
  }
  res.json(data || []);
});

app.patch('/api/admin/portal/users/:id', async (req: Request, res: Response) => {
  const db = supabaseAdmin;
  if (!db)
    return res
      .status(503)
      .json({ error: 'Admin services require server-side Supabase credentials.' });
  if (typeof req.body.isActive !== 'boolean') {
    return res.status(400).json({ error: 'A valid account status is required.' });
  }
  const authorization = req.header('authorization') || '';
  const token = authorization.replace(/^Bearer\s+/i, '');
  const { data: currentAuth } = await db.auth.getUser(token);
  if (!currentAuth.user || currentAuth.user.id === req.params.id) {
    return res.status(400).json({ error: 'You cannot change your own account status.' });
  }
  const { data, error } = await db
    .from('profiles')
    .update({ is_active: req.body.isActive })
    .eq('id', req.params.id)
    .neq('role', 'admin')
    .select('id,is_active')
    .maybeSingle();
  if (error) {
    console.error('Admin user update failed:', error.message);
    return res.status(500).json({ error: 'Unable to update user.' });
  }
  if (!data) return res.status(404).json({ error: 'User not found or protected admin account.' });
  const { error: authUpdateError } = await db.auth.admin.updateUserById(req.params.id, {
    ban_duration: req.body.isActive ? 'none' : '876000h',
  });
  if (authUpdateError) {
    console.error('Admin auth status update failed:', authUpdateError.message);
    const { error: rollbackError } = await db
      .from('profiles')
      .update({ is_active: !req.body.isActive })
      .eq('id', req.params.id);
    if (rollbackError) console.error('Profile status rollback failed:', rollbackError.message);
    return res.status(502).json({ error: 'Unable to update the user authentication status.' });
  }
  res.json(data);
});

app.get('/api/admin/portal/registrations', async (_req: Request, res: Response) => {
  const db = supabaseAdmin;
  if (!db)
    return res
      .status(503)
      .json({ error: 'Admin services require server-side Supabase credentials.' });
  const { data, error } = await db
    .from('event_registrations')
    .select(
      'id,reference_id,event_id,user_id,full_name,email,phone,emergency_contact,ticket_count,unit_price_in_paise,total_amount_in_paise,payment_status,razorpay_order_id,razorpay_payment_id,created_at,event:events(title)'
    )
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Admin registration query failed:', error.message);
    return res.status(500).json({ error: 'Unable to load registrations.' });
  }
  res.json(data || []);
});

app.get('/api/admin/portal/payments', async (_req: Request, res: Response) => {
  const db = supabaseAdmin;
  if (!db)
    return res
      .status(503)
      .json({ error: 'Admin services require server-side Supabase credentials.' });
  const { data, error } = await db
    .from('payments')
    .select(
      'id,registration_id,razorpay_order_id,razorpay_payment_id,amount_in_paise,currency,status,error_code,error_description,created_at,registration:event_registrations(reference_id,full_name,email,event_id)'
    )
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Admin payment query failed:', error.message);
    return res.status(500).json({ error: 'Unable to load payment transactions.' });
  }
  res.json(data || []);
});

app.get('/api/admin/portal/enquiries', async (_req: Request, res: Response) => {
  const db = supabaseAdmin;
  if (!db)
    return res
      .status(503)
      .json({ error: 'Admin services require server-side Supabase credentials.' });
  const [collaboration, contact] = await Promise.all([
    db.from('collaboration_enquiries').select('*').order('created_at', { ascending: false }),
    db.from('contact_enquiries').select('*').order('created_at', { ascending: false }),
  ]);
  if (collaboration.error || contact.error) {
    console.error(
      'Admin enquiry query failed:',
      collaboration.error?.message || contact.error?.message
    );
    return res.status(500).json({ error: 'Unable to load contact and collaboration enquiries.' });
  }
  res.json(
    [
      ...(contact.data || []).map((row) => ({ ...row, kind: 'contact' })),
      ...(collaboration.data || []).map((row) => ({ ...row, kind: 'collaboration' })),
    ].sort((a, b) => b.created_at.localeCompare(a.created_at))
  );
});

app.patch('/api/admin/portal/enquiries/:kind/:id', async (req: Request, res: Response) => {
  const db = supabaseAdmin;
  if (!db)
    return res
      .status(503)
      .json({ error: 'Admin services require server-side Supabase credentials.' });
  const isContact = req.params.kind === 'contact';
  const isCollaboration = req.params.kind === 'collaboration';
  const allowedStatuses = isContact
    ? ['unread', 'responded', 'archived']
    : ['new', 'contacted', 'archived'];
  if ((!isContact && !isCollaboration) || !allowedStatuses.includes(req.body.status)) {
    return res.status(400).json({ error: 'Invalid enquiry status.' });
  }
  const { data, error } = await db
    .from(isContact ? 'contact_enquiries' : 'collaboration_enquiries')
    .update({ status: req.body.status })
    .eq('id', req.params.id)
    .select('*')
    .maybeSingle();
  if (error) {
    console.error('Admin enquiry update failed:', error.message);
    return res.status(500).json({ error: 'Unable to update enquiry.' });
  }
  if (!data) return res.status(404).json({ error: 'Enquiry not found.' });
  res.json({ ...data, kind: isContact ? 'contact' : 'collaboration' });
});

// 13. Admin Oversight & Moderation
app.get('/api/admin/overview', (_req: Request, res: Response) => {
  const totalRevenuePaise = registrations
    .filter((r) => r.paymentStatus === 'paid')
    .reduce((acc, curr) => acc + curr.totalAmountInPaise, 0);

  res.json({
    totalEvents: events.length,
    totalRegistrations: registrations.length,
    totalOrganizations: organizations.length,
    pendingApplications: organizerApplications.filter((a) => a.status === 'pending'),
    totalRevenuePaise,
    auditLogs: auditLogs.slice(0, 20),
  });
});

app.post('/api/admin/applications/:id/review', (req: Request, res: Response) => {
  const { decision, reviewNotes } = req.body; // 'approved' or 'rejected'
  const appIndex = organizerApplications.findIndex((a) => a.id === req.params.id);

  if (appIndex === -1) {
    return res.status(404).json({ error: 'Application not found' });
  }

  const application = organizerApplications[appIndex];
  application.status = decision;
  application.reviewNotes = reviewNotes;

  if (decision === 'approved') {
    // Create or approve organization
    const newOrg: Organization = {
      id: `org-${Date.now()}`,
      name: application.organizationName,
      type: application.organizationType,
      description: application.description,
      city: application.city,
      contactEmail: application.contactEmail,
      contactPhone: application.contactPhone,
      status: 'approved',
      verified: true,
      ownerUserId: application.userId,
      createdAt: new Date().toISOString(),
    };
    organizations.push(newOrg);
  }

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actorEmail: 'admin@fitmeet.in',
    action: `ORGANIZER_APPLICATION_${decision.toUpperCase()}`,
    details: `Application for ${application.organizationName} was ${decision}`,
  });

  res.json({ success: true, application });
});

// ============================================================================
// VITE DEV SERVER MOUNT & STATIC ASSETS
// ============================================================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[FitMeet] Server running at http://localhost:${PORT}`);
  });
}

startServer();
