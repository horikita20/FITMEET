export type UserRole = 'customer' | 'organizer' | 'super_admin';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  role: UserRole;
  organizationId?: string;
  organizationName?: string;
  createdAt: string;
}

export type OrganizationType =
  | 'gym'
  | 'fitness_brand'
  | 'coach'
  | 'fitness_community'
  | 'independent_organizer'
  | 'other';

export type OrganizationStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  description: string;
  city: string;
  address?: string;
  contactEmail: string;
  contactPhone: string;
  website?: string;
  instagram?: string;
  logoUrl?: string;
  status: OrganizationStatus;
  verified: boolean;
  ownerUserId: string;
  createdAt: string;
}

export type EventCategory =
  | 'running'
  | 'gym_hiit'
  | 'bootcamp'
  | 'yoga_mobility'
  | 'hyrox_crossfit'
  | 'cycling';

export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed' | 'coming_soon';

export interface WaitlistEntry {
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

export interface EventCoHost {
  organizationId: string;
  organizationName: string;
  role: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface FitnessEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  coverImage: string;
  date: string; // e.g. "2026-11-08"
  displayDate: string; // e.g. "Sunday, Nov 8, 2026"
  startTime: string; // e.g. "06:30 AM"
  endTime: string; // e.g. "08:30 AM"
  timezone: string; // "IST (UTC+5:30)"
  venue: string;
  city: string;
  locationDetails?: string;
  priceInPaise: number; // 0 for free, e.g. 29900 for ₹299.00
  currency: string; // "INR"
  registrationCapacity: number;
  slotsRemaining: number;
  registrationDeadline: string;
  rules: string[];
  cancellationPolicy: string;
  primaryOrganizerId: string;
  primaryOrganizerName: string;
  coHosts: EventCoHost[];
  status: EventStatus;
  featured?: boolean;
  galleryImages?: string[];
  createdAt: string;
}

export type PaymentStatus =
  | 'free'
  | 'pending_payment'
  | 'paid'
  | 'failed'
  | 'refunded';

export interface EventRegistration {
  id: string;
  referenceId: string; // e.g. "FM-2026-8492"
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventVenue: string;
  eventCity: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  gender?: string;
  instagram?: string;
  emergencyContact?: string;
  ticketCount: number;
  unitPriceInPaise: number;
  totalAmountInPaise: number;
  paymentStatus: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  qrToken: string;
  createdAt: string;
}

export interface CollaborationRequest {
  id: string;
  proposerOrgId: string;
  proposerOrgName: string;
  proposerType: OrganizationType;
  recipientOrgId: string;
  recipientOrgName: string;
  eventId?: string;
  eventTitle?: string;
  proposedRole: string; // e.g. "Co-Host & Warmup Coach"
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  createdAt: string;
}

export interface SiteSettings {
  brandName: string;
  tagline: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroLead: string;
  primaryCity: string;
  accentColor: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  instagramUrl: string;
  youtubeUrl: string;
  twitterUrl: string;
  customDomain: string; // e.g. "fitmeet.in"
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorEmail: string;
  action: string;
  details: string;
}

// Backward compatibility aliases
export type RunEvent = FitnessEvent;
export type Registration = EventRegistration;
export interface PaceGroupInfo {
  name: string;
  paceRange: string;
  targetSplit: string;
  idealFor: string;
  color: string;
}
export interface RunnerStory {
  id: string;
  name: string;
  role: string;
  timeWithClub: string;
  avatarSeed: string;
  quote: string;
  stat: string;
  statLabel: string;
}
