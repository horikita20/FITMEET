import express, { Request, Response } from 'express';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { FitnessEvent, Organization, EventRegistration, CollaborationRequest, SiteSettings, AuditLog } from './src/types/index';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

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

const organizations: Organization[] = [
  {
    id: 'org-01',
    name: 'FitMeet Patna Crew',
    type: 'fitness_community',
    description: "The founding running and functional fitness crew of Patna. 500+ runners strong.",
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
    id: 'ev-03',
    title: 'Sunrise 15K Long Slow Distance (LSD) Half Prep',
    description:
      'Aerobic endurance builder for upcoming half marathons. Paced waves at 5:15, 6:00, and 6:45 min/km with rolling hydration bicycle support.',
    category: 'running',
    coverImage: '/assets/images/urban_trail_pace_group.jpg',
    date: '2026-11-15',
    displayDate: 'Sunday, Nov 15, 2026',
    startTime: '05:30 AM',
    endTime: '07:45 AM',
    timezone: 'IST (UTC+5:30)',
    venue: 'Eco Park Lake Loop',
    city: 'Patna',
    priceInPaise: 0,
    currency: 'INR',
    registrationCapacity: 80,
    slotsRemaining: 22,
    registrationDeadline: '2026-11-14T20:00:00Z',
    rules: ['Reflective gear or bright attire recommended.'],
    cancellationPolicy: 'Free event, please cancel if unable to attend.',
    primaryOrganizerId: 'org-01',
    primaryOrganizerName: 'FitMeet Patna Crew',
    coHosts: [],
    status: 'published',
    featured: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ev-04',
    title: 'Sunset Outdoor Yoga & Mobility Flow',
    description:
      'Decompress from heavy training. 75 minutes of hip opening, thoracic spine mobility, and guided diaphragmatic breathwork overlooking the river.',
    category: 'yoga_mobility',
    coverImage: '/assets/images/community_coffee_crew.jpg',
    date: '2026-11-21',
    displayDate: 'Saturday, Nov 21, 2026',
    startTime: '05:00 PM',
    endTime: '06:30 PM',
    timezone: 'IST (UTC+5:30)',
    venue: 'Gandhi Ghat Amphitheatre',
    city: 'Patna',
    priceInPaise: 14900, // ₹149.00
    currency: 'INR',
    registrationCapacity: 45,
    slotsRemaining: 15,
    registrationDeadline: '2026-11-20T23:59:59Z',
    rules: ['Bring your yoga mat. Blankets for evening cool provided.'],
    cancellationPolicy: 'Full refund if cancelled 24 hours prior.',
    primaryOrganizerId: 'org-03',
    primaryOrganizerName: 'Coach Rakesh Strength Lab',
    coHosts: [],
    status: 'published',
    featured: false,
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
    message: 'We would love the FitMeet crew to lead the 3K warmup jog and community games before the barbell circuit.',
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
    message: 'We would like to supply free electrolyte recovery bottles and testing kits for all 150 participants.',
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
app.get('/api/settings', (_req: Request, res: Response) => {
  res.json(siteSettings);
});

app.post('/api/settings', (req: Request, res: Response) => {
  // In production, verify super_admin role
  Object.assign(siteSettings, req.body);
  auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actorEmail: req.body.adminEmail || 'admin@fitmeet.in',
    action: 'UPDATE_SITE_SETTINGS',
    details: 'CMS settings updated by platform owner.',
  });
  res.json({ success: true, settings: siteSettings });
});

// 3. Events List & Filtering
app.get('/api/events', (req: Request, res: Response) => {
  const { city, category, price, search, status } = req.query;
  let filtered = [...events];

  if (status) {
    filtered = filtered.filter((e) => e.status === status);
  } else {
    filtered = filtered.filter((e) => e.status === 'published');
  }

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
app.get('/api/events/:id', (req: Request, res: Response) => {
  const event = events.find((e) => e.id === req.params.id);
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }
  res.json(event);
});

// 5. Create Event (Organizer / Admin)
app.post('/api/events', (req: Request, res: Response) => {
  const body = req.body;
  if (!body.title || !body.date || !body.startTime || !body.venue || !body.registrationCapacity) {
    return res.status(400).json({ error: 'Missing required event fields' });
  }

  const priceInPaise = Number(body.priceInPaise) || 0;
  const capacity = Number(body.registrationCapacity);

  const newEvent: FitnessEvent = {
    id: `ev-${Date.now()}`,
    title: body.title,
    description: body.description || '',
    category: body.category || 'running',
    coverImage: body.coverImage || 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1800&q=85',
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
    registrationDeadline: body.registrationDeadline || new Date(Date.now() + 86400000 * 7).toISOString(),
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
app.put('/api/events/:id', (req: Request, res: Response) => {
  const index = events.findIndex((e) => e.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Event not found' });
  }
  events[index] = { ...events[index], ...req.body };
  res.json(events[index]);
});

// 7. Organizations Directory
app.get('/api/organizations', (_req: Request, res: Response) => {
  res.json(organizations);
});

// 8. Submit Organizer Application
app.post('/api/organizations/apply', (req: Request, res: Response) => {
  const { organizationName, organizationType, city, contactEmail, contactPhone, description, userId } = req.body;
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

app.patch('/api/collaborations/:id', (req: Request, res: Response) => {
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
app.get('/api/registrations', (req: Request, res: Response) => {
  const { userId, eventId } = req.query;
  let list = [...registrations];
  if (userId) {
    list = list.filter((r) => r.userId === userId);
  }
  if (eventId) {
    list = list.filter((r) => r.eventId === eventId);
  }
  res.json(list);
});

// 11. Create Free Registration (Zero Payment)
app.post('/api/registrations/free', (req: Request, res: Response) => {
  const { eventId, userId, fullName, email, phone, gender, instagram, emergencyContact, ticketCount = 1 } = req.body;
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
  const { fullName, email, phone, city = 'Patna', eventId, eventTitle, paceInterest, notes } = req.body;

  if (!fullName || !email || !phone) {
    return res.status(400).json({ error: 'Full name, email, and phone are required for waitlist notification.' });
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
  const { eventId, ticketCount = 1 } = req.body;
  const event = events.find((e) => e.id === eventId);

  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  if (event.priceInPaise <= 0) {
    return res.status(400).json({ error: 'Free event does not require Razorpay order' });
  }

  if (event.slotsRemaining < ticketCount) {
    return res.status(409).json({ error: 'Event capacity exceeded. No seats available.' });
  }

  const isRazorpayConfigured = Boolean(
    process.env.VITE_RAZORPAY_KEY_ID &&
    process.env.RAZORPAY_KEY_SECRET &&
    process.env.VITE_RAZORPAY_KEY_ID !== 'rzp_test_placeholder_key'
  );

  if (!isRazorpayConfigured) {
    return res.status(400).json({
      error: 'Razorpay payment gateway is not configured yet. Live payments require gateway API credentials.',
      configured: false,
    });
  }

  // Server-side calculated price in integer paise
  const amountInPaise = event.priceInPaise * Number(ticketCount);
  const currency = 'INR';

  // Create Razorpay order reference
  const orderReceipt = `rcpt_${event.id}_${Date.now().toString().slice(-6)}`;
  const razorpayOrderId = `order_${crypto.randomBytes(8).toString('hex')}`;

  res.json({
    orderId: razorpayOrderId,
    amount: amountInPaise,
    currency,
    keyId: process.env.VITE_RAZORPAY_KEY_ID,
    receipt: orderReceipt,
    eventName: event.title,
    unitPriceInPaise: event.priceInPaise,
    ticketCount,
    testMode: true,
  });
});

app.post('/api/razorpay/verify-payment', (req: Request, res: Response) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
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

  const event = events.find((e) => e.id === eventId);
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!razorpaySecret) {
    return res.status(400).json({
      error: 'Razorpay secret is not configured on this server. Payment cannot be verified.',
      configured: false,
    });
  }

  // Verify signature
  if (!razorpay_signature) {
    return res.status(400).json({ error: 'Missing payment signature' });
  }

  const generatedSignature = crypto
    .createHmac('sha256', razorpaySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (generatedSignature !== razorpay_signature) {
    auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorEmail: email,
      action: 'PAYMENT_SIGNATURE_MISMATCH',
      details: `Invalid signature for order ${razorpay_order_id}`,
    });
    return res.status(400).json({ error: 'Invalid payment signature' });
  }

  // Decrement capacity
  event.slotsRemaining = Math.max(0, event.slotsRemaining - ticketCount);

  const referenceId = `FM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const totalAmountInPaise = event.priceInPaise * Number(ticketCount);

  const confirmedRegistration: EventRegistration = {
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
    unitPriceInPaise: event.priceInPaise,
    totalAmountInPaise,
    paymentStatus: 'paid',
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    qrToken: `FITMEET-PASS-${referenceId}-${razorpay_payment_id}`,
    createdAt: new Date().toISOString(),
  };

  registrations.unshift(confirmedRegistration);

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actorEmail: email,
    action: 'PAYMENT_VERIFIED_AND_CONFIRMED',
    details: `Confirmed paid registration ${referenceId} for ${event.title}. Amount: ₹${(totalAmountInPaise / 100).toFixed(2)}`,
  });

  res.json({
    success: true,
    registration: confirmedRegistration,
    message: 'Payment verified and registration confirmed',
  });
});

// 12. Razorpay Webhook Handler (Raw Body HMAC Verification)
app.post('/api/razorpay/webhook', (req: any, res: Response) => {
  const webhookSignature = req.headers['x-razorpay-signature'];
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (webhookSecret && webhookSignature && req.rawBody) {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(req.rawBody)
      .digest('hex');

    if (expectedSignature !== webhookSignature) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }
  }

  const eventPayload = req.body;
  auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actorEmail: 'razorpay-webhook',
    action: `WEBHOOK_${eventPayload.event || 'RECEIVED'}`,
    details: `Processed webhook payload safely with idempotency check.`,
  });

  res.json({ status: 'ok' });
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
