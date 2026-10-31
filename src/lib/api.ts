import {
  FitnessEvent,
  Organization,
  EventRegistration,
  CollaborationRequest,
  SiteSettings,
} from '../types';

const API_BASE = '/api';

export async function fetchSiteSettings(): Promise<SiteSettings> {
  try {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error('Failed to fetch settings');
    return await res.json();
  } catch (err) {
    console.warn('Using default site settings fallback', err);
    return {
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
      customDomain: 'fitmeet.in',
    };
  }
}

export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<boolean> {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  return res.ok;
}

export async function fetchEvents(filters?: {
  city?: string;
  category?: string;
  price?: string;
  search?: string;
  status?: string;
}): Promise<FitnessEvent[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.city) params.set('city', filters.city);
    if (filters?.category) params.set('category', filters.category);
    if (filters?.price) params.set('price', filters.price);
    if (filters?.search) params.set('search', filters.search);
    if (filters?.status) params.set('status', filters.status);

    const res = await fetch(`${API_BASE}/events?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch events');
    return await res.json();
  } catch (err) {
    console.error('fetchEvents error:', err);
    return [];
  }
}

export async function fetchEventById(id: string): Promise<FitnessEvent | null> {
  try {
    const res = await fetch(`${API_BASE}/events/${id}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function createEvent(eventData: Partial<FitnessEvent>): Promise<FitnessEvent> {
  const res = await fetch(`${API_BASE}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create event');
  }
  return await res.json();
}

export async function fetchOrganizations(): Promise<Organization[]> {
  try {
    const res = await fetch(`${API_BASE}/organizations`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function submitOrganizerApplication(data: {
  organizationName: string;
  organizationType: string;
  city: string;
  contactEmail: string;
  contactPhone: string;
  description: string;
  userId?: string;
}) {
  const res = await fetch(`${API_BASE}/organizations/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Application failed');
  }
  return await res.json();
}

export async function fetchCollaborations(): Promise<CollaborationRequest[]> {
  try {
    const res = await fetch(`${API_BASE}/collaborations`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function sendCollaborationRequest(data: {
  proposerOrgId: string;
  recipientOrgId: string;
  eventId?: string;
  proposedRole: string;
  message: string;
}): Promise<CollaborationRequest> {
  const res = await fetch(`${API_BASE}/collaborations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to send collaboration');
  }
  return await res.json();
}

export async function updateCollaborationStatus(id: string, status: 'accepted' | 'rejected') {
  const res = await fetch(`${API_BASE}/collaborations/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return res.ok;
}

export async function registerFreeEvent(data: {
  eventId: string;
  userId?: string;
  fullName: string;
  email: string;
  phone: string;
  gender?: string;
  instagram?: string;
  emergencyContact?: string;
  ticketCount: number;
}): Promise<EventRegistration> {
  const res = await fetch(`${API_BASE}/registrations/free`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Registration failed');
  }
  const result = await res.json();
  return result.registration;
}

export async function createRazorpayOrder(data: {
  eventId: string;
  ticketCount: number;
  userId?: string;
  userEmail: string;
  userPhone: string;
}) {
  const res = await fetch(`${API_BASE}/razorpay/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create payment order');
  }
  return await res.json();
}

export async function verifyRazorpayPayment(data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  eventId: string;
  userId?: string;
  fullName: string;
  email: string;
  phone: string;
  gender?: string;
  instagram?: string;
  emergencyContact?: string;
  ticketCount: number;
}): Promise<EventRegistration> {
  const res = await fetch(`${API_BASE}/razorpay/verify-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Payment verification failed');
  }
  const result = await res.json();
  return result.registration;
}

export async function fetchUserRegistrations(userId?: string): Promise<EventRegistration[]> {
  try {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    const res = await fetch(`${API_BASE}/registrations${query}`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchAdminOverview() {
  const res = await fetch(`${API_BASE}/admin/overview`);
  if (!res.ok) throw new Error('Unauthorized or failed to fetch admin data');
  return await res.json();
}

export async function reviewOrganizerApp(id: string, decision: 'approved' | 'rejected', notes?: string) {
  const res = await fetch(`${API_BASE}/admin/applications/${id}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ decision, reviewNotes: notes }),
  });
  return res.ok;
}

export async function submitWaitlist(data: {
  fullName: string;
  email: string;
  phone: string;
  city?: string;
  eventId?: string;
  eventTitle?: string;
  paceInterest?: string;
  notes?: string;
}) {
  const res = await fetch(`${API_BASE}/waitlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to join waitlist');
  }
  return await res.json();
}

export async function fetchWaitlist() {
  try {
    const res = await fetch(`${API_BASE}/waitlist`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

