import React, { FormEvent, useCallback, useEffect, useState } from 'react';
import {
  Activity,
  CalendarDays,
  CreditCard,
  Download,
  ImagePlus,
  LogOut,
  LoaderCircle,
  Mail,
  Plus,
  RefreshCw,
  Save,
  Settings,
  ShieldCheck,
  Ticket,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { FitnessEvent, SiteSettings } from '../../types';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { GalleryImage, parseGalleryImages } from '../../lib/gallery';
import { getPublicAssetUrl } from '../../lib/brandAssets';

type AdminTab =
  | 'overview'
  | 'events'
  | 'users'
  | 'registrations'
  | 'payments'
  | 'enquiries'
  | 'gallery'
  | 'settings';
type PortalScreen = 'checking' | 'login' | 'dashboard';

interface Overview {
  totalUsers: number;
  totalEvents: number;
  totalRegistrations: number;
  totalRevenuePaise: number;
}

interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface AdminRegistration {
  id: string;
  reference_id: string;
  event_id: string;
  full_name: string;
  email: string;
  phone: string;
  ticket_count: number;
  total_amount_in_paise: number;
  payment_status: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  created_at: string;
  event: { title: string } | null;
}

interface AdminPayment {
  id: string;
  registration_id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  amount_in_paise: number;
  currency: string;
  status: string;
  error_code: string | null;
  error_description: string | null;
  created_at: string;
  registration: { reference_id: string; full_name: string; email: string; event_id: string } | null;
}

interface ContactEnquiry {
  id: string;
  kind: 'contact';
  email: string;
  interest: string;
  name: string;
  message: string | null;
  status: 'unread' | 'responded' | 'archived';
  created_at: string;
}

interface CollaborationEnquiry {
  id: string;
  kind: 'collaboration';
  name: string;
  organization_type: string;
  phone: string;
  city: string;
  support_options: string[];
  message: string | null;
  status: 'new' | 'contacted' | 'archived';
  created_at: string;
}

type AdminEnquiry = ContactEnquiry | CollaborationEnquiry;

interface AdminOrganization {
  id: string;
  name: string;
}

interface GalleryUploadDraft {
  key: string;
  file: File;
  caption: string;
}

interface EventDraft {
  title: string;
  description: string;
  category: string;
  coverImage: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  city: string;
  locationDetails: string;
  priceInPaise: string;
  registrationCapacity: string;
  registrationDeadline: string;
  rules: string;
  cancellationPolicy: string;
  primaryOrganizerId: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  featured: boolean;
}

const emptyDraft: EventDraft = {
  title: '',
  description: '',
  category: 'running',
  coverImage: getPublicAssetUrl('assets/images/hero_runners_dawn.jpg'),
  date: '',
  startTime: '06:00',
  endTime: '08:00',
  venue: '',
  city: 'Patna',
  locationDetails: '',
  priceInPaise: '0',
  registrationCapacity: '50',
  registrationDeadline: '',
  rules: '',
  cancellationPolicy: '',
  primaryOrganizerId: '',
  status: 'draft',
  featured: false,
};

const FITMEET_ADMIN_USER_ID = 'b00526d3-4760-4426-997a-d6792338619b';
const GALLERY_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
const GALLERY_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

async function adminRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!supabase) throw new Error('Supabase authentication is not configured.');
  const { data, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  const accessToken = data.session?.access_token;
  if (!accessToken) throw new Error('Your session expired. Please sign in again.');

  const response = await fetch(`/api/admin/portal${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'The Admin Portal request failed.');
  return result as T;
}

async function uploadGalleryImage(file: File, caption: string): Promise<GalleryImage> {
  if (!supabase) throw new Error('Supabase authentication is not configured.');
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  const accessToken = data.session?.access_token;
  if (!accessToken) throw new Error('Your session expired. Please sign in again.');

  const response = await fetch('/api/admin/portal/gallery', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': file.type,
      'X-Image-Caption': encodeURIComponent(caption),
    },
    body: file,
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'Unable to upload this image.');
  return result as GalleryImage;
}

function downloadCsv(filename: string, records: object[]) {
  if (records.length === 0) throw new Error('There are no records to export.');
  const rows = records.map((record) => new Map(Object.entries(record)));
  const headers = Array.from(new Set(rows.flatMap((row) => Array.from(row.keys()))));
  const escape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const csv = [
    headers.map(escape).join(','),
    ...rows.map((row) => headers.map((header) => escape(row.get(header))).join(',')),
  ].join('\r\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

const formatMoney = (paise: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(paise / 100);

const buttonClass =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-[#303139] bg-[#191a1f] px-4 py-2.5 text-sm font-semibold text-[#f5f2ee] transition-colors hover:border-[#fc5300] hover:text-white disabled:cursor-not-allowed disabled:opacity-50';

const adminPath = (path: '/admin' | '/admin/login') => {
  const prefix = window.location.pathname.startsWith('/FITMEET/') ? '/FITMEET' : '';
  return `${prefix}${path}`;
};

export const AdminPortal: React.FC = () => {
  const [screen, setScreen] = useState<PortalScreen>('checking');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [overview, setOverview] = useState<Overview | null>(null);
  const [events, setEvents] = useState<FitnessEvent[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [registrations, setRegistrations] = useState<AdminRegistration[]>([]);
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [enquiries, setEnquiries] = useState<AdminEnquiry[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryLoadError, setGalleryLoadError] = useState<string | null>(null);
  const [galleryCaptionDrafts, setGalleryCaptionDrafts] = useState<Record<string, string>>({});
  const [galleryUploadDrafts, setGalleryUploadDrafts] = useState<GalleryUploadDraft[]>([]);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [galleryUpdatingId, setGalleryUpdatingId] = useState<string | null>(null);
  const [galleryDeletingId, setGalleryDeletingId] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<AdminOrganization[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [eventDraft, setEventDraft] = useState<EventDraft>(emptyDraft);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const refreshOverview = useCallback(async () => {
    const data = await adminRequest<Overview>('/overview');
    setOverview(data);
  }, []);

  const verifyAdminSession = useCallback(async (accessToken: string) => {
    if (!supabase) throw new Error('Supabase authentication is not configured.');
    const { data: authData, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !authData.user) throw new Error('Your session is invalid or expired.');
    if (authData.user.id !== FITMEET_ADMIN_USER_ID) {
      throw new Error('This account is not authorized to access the Admin Portal.');
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role,is_active')
      .eq('id', authData.user.id)
      .maybeSingle();
    if (profileError) throw profileError;
    if (profile?.role !== 'admin' || profile.is_active !== true) {
      throw new Error('This account is not authorized to access the Admin Portal.');
    }
  }, []);

  const handleRefresh = async () => {
    setBusy(true);
    setErrorMessage(null);
    try {
      await refreshOverview();
    } catch (requestError) {
      setErrorMessage(
        requestError instanceof Error ? requestError.message : 'Unable to refresh dashboard.'
      );
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setErrorMessage(
        'Admin login requires the public Supabase URL and publishable key in the site configuration.'
      );
      setScreen('login');
      return;
    }

    const authClient = supabase;
    let active = true;
    let checkVersion = 0;
    const showLogin = (message?: string) => {
      setOverview(null);
      setScreen('login');
      if (window.location.pathname.replace(/\/+$/, '').endsWith('/admin')) {
        window.history.replaceState(null, '', adminPath('/admin/login'));
      }
      if (message) setErrorMessage(message);
    };
    const checkSession = async (session: { access_token: string } | null) => {
      const version = ++checkVersion;
      if (!session) {
        showLogin();
        return;
      }
      setScreen('checking');
      try {
        await verifyAdminSession(session.access_token);
        await refreshOverview();
        if (active && version === checkVersion) {
          if (window.location.pathname.replace(/\/+$/, '').endsWith('/admin/login')) {
            window.history.replaceState(null, '', adminPath('/admin'));
          }
          setErrorMessage(null);
          setScreen('dashboard');
        }
      } catch (requestError) {
        if (active && version === checkVersion) {
          await authClient.auth.signOut();
          if (active && version === checkVersion) {
            showLogin(
              requestError instanceof Error ? requestError.message : 'Admin access was denied.'
            );
          }
        }
      }
    };

    const { data: authListener } = authClient.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        checkVersion += 1;
        showLogin();
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        window.setTimeout(() => {
          if (active) void checkSession(session);
        }, 0);
      }
    });

    void authClient.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        showLogin(error.message);
        return;
      }
      void checkSession(data.session);
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, [refreshOverview, verifyAdminSession]);

  useEffect(() => {
    if (screen !== 'dashboard') return;
    let active = true;
    void (async () => {
      setBusy(true);
      setErrorMessage(null);
      try {
        if (activeTab === 'overview') await refreshOverview();
        if (activeTab === 'events') {
          const [eventRows, orgRows] = await Promise.all([
            adminRequest<FitnessEvent[]>('/events'),
            adminRequest<AdminOrganization[]>('/organizations'),
          ]);
          if (active) {
            setEvents(eventRows);
            setOrganizations(orgRows);
          }
        }
        if (activeTab === 'users') setUsers(await adminRequest<AdminUser[]>('/users'));
        if (activeTab === 'registrations')
          setRegistrations(await adminRequest<AdminRegistration[]>('/registrations'));
        if (activeTab === 'payments') setPayments(await adminRequest<AdminPayment[]>('/payments'));
        if (activeTab === 'enquiries')
          setEnquiries(await adminRequest<AdminEnquiry[]>('/enquiries'));
        if (activeTab === 'gallery') {
          setGalleryLoading(true);
          setGalleryLoadError(null);
          const images = parseGalleryImages(await adminRequest<unknown>('/gallery'));
          if (active) {
            setGalleryImages(images);
            setGalleryCaptionDrafts(
              Object.fromEntries(images.map((image) => [image.id, image.caption || '']))
            );
          }
          setGalleryLoading(false);
        }
        if (activeTab === 'settings')
          setSiteSettings(await adminRequest<SiteSettings>('/settings'));
      } catch (requestError) {
        if (active && activeTab === 'gallery') {
          setGalleryImages([]);
          setGalleryLoading(false);
          setGalleryLoadError(
            requestError instanceof Error ? requestError.message : 'Unable to load gallery images.'
          );
        }
        if (active)
          setErrorMessage(
            requestError instanceof Error ? requestError.message : 'Unable to load records.'
          );
      } finally {
        if (active) setBusy(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [activeTab, refreshOverview, screen]);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase || busy) return;
    setBusy(true);
    setErrorMessage(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!sessionData.session) throw new Error('Sign-in did not create an active session.');
      await verifyAdminSession(sessionData.session.access_token);
      await refreshOverview();
      window.history.replaceState(null, '', adminPath('/admin'));
      setPassword('');
      setScreen('dashboard');
    } catch (loginError) {
      console.error('Admin Portal sign-in failed:', loginError);
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError)
        console.error('Unable to clear rejected admin session:', signOutError.message);
      const errorMessage =
        loginError instanceof Error
          ? loginError.message
          : typeof loginError === 'string'
            ? loginError
            : typeof loginError === 'object' &&
                loginError !== null &&
                'message' in loginError &&
                typeof loginError.message === 'string'
              ? loginError.message
              : 'Unable to sign in to the Admin Portal.';
      setErrorMessage(errorMessage);
    } finally {
      setBusy(false);
    }
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    window.setTimeout(() => setSuccessMessage(null), 3500);
  };

  const addGalleryFiles = (files: FileList | null) => {
    if (!files) return;
    setErrorMessage(null);
    const accepted: GalleryUploadDraft[] = [];
    const rejected: string[] = [];
    Array.from(files).forEach((file) => {
      if (!GALLERY_IMAGE_TYPES.includes(file.type)) {
        rejected.push(`${file.name}: use a JPEG, PNG or WebP image.`);
      } else if (file.size === 0 || file.size > GALLERY_IMAGE_MAX_BYTES) {
        rejected.push(`${file.name}: image size must be between 1 byte and 10 MB.`);
      } else {
        accepted.push({
          key: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          file,
          caption: '',
        });
      }
    });
    if (accepted.length) {
      setGalleryUploadDrafts((current) => [...current, ...accepted]);
    }
    if (rejected.length) setErrorMessage(rejected.join(' '));
  };

  const uploadGalleryFiles = async (event: FormEvent) => {
    event.preventDefault();
    if (!galleryUploadDrafts.length || galleryUploading) return;
    setGalleryUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    const uploadedKeys = new Set<string>();
    const failures: string[] = [];
    for (const draft of galleryUploadDrafts) {
      try {
        await uploadGalleryImage(draft.file, draft.caption.trim());
        uploadedKeys.add(draft.key);
      } catch (uploadError) {
        failures.push(
          `${draft.file.name}: ${
            uploadError instanceof Error ? uploadError.message : 'Unable to upload this image.'
          }`
        );
      }
    }
    const messages = [...failures];
    if (uploadedKeys.size) {
      setGalleryUploadDrafts((current) => current.filter((draft) => !uploadedKeys.has(draft.key)));
      showSuccess(`${uploadedKeys.size} ${uploadedKeys.size === 1 ? 'image' : 'images'} uploaded.`);
      try {
        const images = parseGalleryImages(await adminRequest<unknown>('/gallery'));
        setGalleryImages(images);
        setGalleryLoadError(null);
        setGalleryCaptionDrafts(
          Object.fromEntries(images.map((image) => [image.id, image.caption || '']))
        );
      } catch (requestError) {
        messages.push(
          `Images uploaded, but the list could not be refreshed: ${
            requestError instanceof Error ? requestError.message : 'Please refresh the page.'
          }`
        );
      }
    }
    if (messages.length) setErrorMessage(messages.join(' '));
    if (!uploadedKeys.size && !messages.length) {
      setErrorMessage('Select at least one valid image before uploading.');
    }
    setGalleryUploading(false);
  };

  const updateGalleryCaption = async (image: GalleryImage) => {
    const caption = galleryCaptionDrafts[image.id] || '';
    setGalleryUpdatingId(image.id);
    setErrorMessage(null);
    try {
      const updated = await adminRequest<GalleryImage>(`/gallery/${image.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ caption }),
      });
      setGalleryImages((current) => current.map((item) => (item.id === image.id ? updated : item)));
      setGalleryCaptionDrafts((current) => ({ ...current, [image.id]: updated.caption }));
      showSuccess('Gallery caption updated.');
    } catch (requestError) {
      setErrorMessage(
        requestError instanceof Error ? requestError.message : 'Unable to update caption.'
      );
    } finally {
      setGalleryUpdatingId(null);
    }
  };

  const deleteGalleryImage = async (image: GalleryImage) => {
    if (!window.confirm('Delete this gallery image? This cannot be undone.')) return;
    setGalleryDeletingId(image.id);
    setErrorMessage(null);
    try {
      const result = await adminRequest<{ storageCleanupWarning?: string }>(
        `/gallery/${image.id}`,
        { method: 'DELETE' }
      );
      setGalleryImages((current) => current.filter((item) => item.id !== image.id));
      setGalleryCaptionDrafts((current) => {
        const next = { ...current };
        delete next[image.id];
        return next;
      });
      showSuccess(
        result.storageCleanupWarning
          ? `Image removed from the gallery. ${result.storageCleanupWarning}`
          : 'Gallery image deleted.'
      );
    } catch (requestError) {
      setErrorMessage(
        requestError instanceof Error ? requestError.message : 'Unable to delete gallery image.'
      );
    } finally {
      setGalleryDeletingId(null);
    }
  };

  const openNewEvent = () => {
    setEventDraft({ ...emptyDraft, primaryOrganizerId: organizations[0]?.id || '' });
    setEditingEventId(null);
    setEventDialogOpen(true);
  };

  const openEditEvent = (event: FitnessEvent) => {
    setEditingEventId(event.id);
    setEventDraft({
      ...emptyDraft,
      title: event.title,
      description: event.description,
      category: event.category,
      coverImage: event.coverImage,
      date: event.date,
      startTime: event.startTime.slice(0, 5),
      endTime: event.endTime.slice(0, 5),
      venue: event.venue,
      city: event.city,
      locationDetails: event.locationDetails || '',
      priceInPaise: String(event.priceInPaise),
      registrationCapacity: String(event.registrationCapacity),
      registrationDeadline: event.registrationDeadline?.slice(0, 16) || '',
      rules: event.rules.join('\n'),
      cancellationPolicy: event.cancellationPolicy,
      primaryOrganizerId: event.primaryOrganizerId,
      status: event.status as EventDraft['status'],
      featured: Boolean(event.featured),
    });
    setEventDialogOpen(true);
  };

  const saveEvent = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setErrorMessage(null);
    try {
      const payload = {
        ...eventDraft,
        priceInPaise: Number(eventDraft.priceInPaise),
        registrationCapacity: Number(eventDraft.registrationCapacity),
        rules: eventDraft.rules
          .split('\n')
          .map((rule) => rule.trim())
          .filter(Boolean),
        registrationDeadline: eventDraft.registrationDeadline
          ? new Date(eventDraft.registrationDeadline).toISOString()
          : null,
      };
      await adminRequest(editingEventId ? `/events/${editingEventId}` : '/events', {
        method: editingEventId ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });
      setEventDialogOpen(false);
      setActiveTab('overview');
      await refreshOverview();
      setActiveTab('events');
      showSuccess(editingEventId ? 'Event updated.' : 'Event created.');
    } catch (requestError) {
      setErrorMessage(
        requestError instanceof Error ? requestError.message : 'Unable to save event.'
      );
    } finally {
      setBusy(false);
    }
  };

  const updateEventStatus = async (event: FitnessEvent) => {
    const nextStatus = event.status === 'published' ? 'draft' : 'published';
    setBusy(true);
    try {
      await adminRequest(`/events/${event.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...event,
          status: nextStatus,
          registrationCapacity: event.registrationCapacity,
          priceInPaise: event.priceInPaise,
        }),
      });
      setEvents((current) =>
        current.map((item) => (item.id === event.id ? { ...item, status: nextStatus } : item))
      );
      showSuccess(nextStatus === 'published' ? 'Event published.' : 'Event unpublished.');
    } catch (requestError) {
      setErrorMessage(
        requestError instanceof Error ? requestError.message : 'Unable to update event status.'
      );
    } finally {
      setBusy(false);
    }
  };

  const deleteEvent = async (event: FitnessEvent) => {
    if (!window.confirm(`Delete "${event.title}"? Events with registrations cannot be deleted.`))
      return;
    setBusy(true);
    try {
      await adminRequest(`/events/${event.id}`, { method: 'DELETE' });
      setEvents((current) => current.filter((item) => item.id !== event.id));
      await refreshOverview();
      showSuccess('Event deleted.');
    } catch (requestError) {
      setErrorMessage(
        requestError instanceof Error ? requestError.message : 'Unable to delete event.'
      );
    } finally {
      setBusy(false);
    }
  };

  const updateUserStatus = async (user: AdminUser) => {
    setBusy(true);
    try {
      await adminRequest(`/users/${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !user.is_active }),
      });
      setUsers((current) =>
        current.map((item) =>
          item.id === user.id ? { ...item, is_active: !item.is_active } : item
        )
      );
      showSuccess(user.is_active ? 'Account deactivated.' : 'Account activated.');
    } catch (requestError) {
      setErrorMessage(
        requestError instanceof Error ? requestError.message : 'Unable to update user.'
      );
    } finally {
      setBusy(false);
    }
  };

  const updateEnquiryStatus = async (enquiry: AdminEnquiry, status: AdminEnquiry['status']) => {
    setBusy(true);
    try {
      const updated = await adminRequest<AdminEnquiry>(`/enquiries/${enquiry.kind}/${enquiry.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setEnquiries((current) =>
        current.map((item) =>
          item.id === enquiry.id && item.kind === enquiry.kind ? updated : item
        )
      );
    } catch (requestError) {
      setErrorMessage(
        requestError instanceof Error ? requestError.message : 'Unable to update enquiry.'
      );
    } finally {
      setBusy(false);
    }
  };

  const saveSiteSettings = async (event: FormEvent) => {
    event.preventDefault();
    if (!siteSettings) return;
    setBusy(true);
    setErrorMessage(null);
    try {
      const saved = await adminRequest<SiteSettings>('/settings', {
        method: 'PUT',
        body: JSON.stringify(siteSettings),
      });
      setSiteSettings(saved);
      showSuccess('Site settings saved.');
    } catch (requestError) {
      setErrorMessage(
        requestError instanceof Error ? requestError.message : 'Unable to save site settings.'
      );
    } finally {
      setBusy(false);
    }
  };

  const exportRecords = async (kind: 'registrations' | 'payments') => {
    try {
      if (kind === 'registrations') {
        const rows = await adminRequest<AdminRegistration[]>('/registrations');
        downloadCsv(
          'fitmeet-registrations.csv',
          rows.map((row) => ({
            id: row.id,
            reference_id: row.reference_id,
            event_id: row.event_id,
            event_title: row.event?.title || '',
            full_name: row.full_name,
            email: row.email,
            phone: row.phone,
            ticket_count: row.ticket_count,
            total_amount_in_paise: row.total_amount_in_paise,
            payment_status: row.payment_status,
            razorpay_order_id: row.razorpay_order_id || '',
            razorpay_payment_id: row.razorpay_payment_id || '',
            created_at: row.created_at,
          }))
        );
      } else {
        const rows = await adminRequest<AdminPayment[]>('/payments');
        downloadCsv(
          'fitmeet-payments.csv',
          rows.map((row) => ({
            id: row.id,
            registration_id: row.registration_id,
            registration_reference: row.registration?.reference_id || '',
            participant_name: row.registration?.full_name || '',
            participant_email: row.registration?.email || '',
            event_id: row.registration?.event_id || '',
            razorpay_order_id: row.razorpay_order_id,
            razorpay_payment_id: row.razorpay_payment_id || '',
            amount_in_paise: row.amount_in_paise,
            currency: row.currency,
            status: row.status,
            error_code: row.error_code || '',
            error_description: row.error_description || '',
            created_at: row.created_at,
          }))
        );
      }
    } catch (requestError) {
      setErrorMessage(
        requestError instanceof Error ? requestError.message : 'Unable to export records.'
      );
    }
  };

  const logout = async () => {
    await supabase?.auth.signOut();
    window.history.replaceState(null, '', adminPath('/admin/login'));
    setScreen('login');
    setOverview(null);
    setErrorMessage(null);
  };

  const tabs: Array<{ id: AdminTab; title: string; icon: React.ReactNode }> = [
    { id: 'overview', title: 'Overview', icon: <Activity size={17} /> },
    { id: 'events', title: 'Event Management', icon: <CalendarDays size={17} /> },
    { id: 'registrations', title: 'Registration Management', icon: <Ticket size={17} /> },
    { id: 'users', title: 'User Management', icon: <Users size={17} /> },
    { id: 'payments', title: 'Payment Management', icon: <CreditCard size={17} /> },
    { id: 'enquiries', title: 'Contact & Collaboration Enquiries', icon: <Mail size={17} /> },
    { id: 'gallery', title: 'Gallery Management', icon: <ImagePlus size={17} /> },
    { id: 'settings', title: 'Site Settings', icon: <Settings size={17} /> },
  ];

  if (screen === 'checking') {
    return (
      <div className="grid min-h-screen place-items-center bg-[#0a0a0c] text-[#c9c9cf]">
        Checking admin access…
      </div>
    );
  }

  if (screen === 'login') {
    return (
      <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_50%_10%,rgba(252,83,0,.14),transparent_35%),#0a0a0c] px-4 py-10 text-[#f5f2ee]">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md rounded-2xl border border-[#292a30] bg-[#111215] p-7 shadow-2xl sm:p-9"
        >
          <div className="mb-7 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#fc5300]/15 text-[#fc5300]">
              <ShieldCheck />
            </div>
            <div>
              <p className="font-head text-xs font-bold uppercase tracking-[.16em] text-[#fc5300]">
                FITMEET OWNER ACCESS
              </p>
              <h1 className="font-head text-3xl font-black uppercase text-white">Admin Login</h1>
            </div>
          </div>
          <p className="mb-6 text-sm leading-6 text-[#aaa8a5]">
            Sign in with the authorized FitMeet administrator account. Admin privileges are checked
            by the server.
          </p>
          {errorMessage && (
            <p
              role="alert"
              className="mb-4 rounded-lg border border-red-900 bg-red-950/40 p-3 text-sm text-red-200"
            >
              {errorMessage}
            </p>
          )}
          <label className="mb-4 block text-sm font-semibold text-[#d9d7d4]">
            Email
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-lg border border-[#303139] bg-[#0a0a0c] px-3.5 py-3 text-white outline-none focus:border-[#fc5300]"
            />
          </label>
          <label className="mb-6 block text-sm font-semibold text-[#d9d7d4]">
            Password
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-lg border border-[#303139] bg-[#0a0a0c] px-3.5 py-3 text-white outline-none focus:border-[#fc5300]"
            />
          </label>
          <button
            type="submit"
            disabled={busy || !isSupabaseConfigured}
            className="w-full rounded-lg bg-[#fc5300] px-4 py-3 font-bold text-white transition-colors hover:bg-[#ff7130] disabled:opacity-50"
          >
            {busy ? 'Verifying…' : 'Sign in securely'}
          </button>
          <a
            href={window.location.pathname.startsWith('/FITMEET/') ? '/FITMEET/' : '/'}
            className="mt-5 block text-center text-sm text-[#aaa8a5] hover:text-white"
          >
            Return to FitMeet
          </a>
        </form>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#f5f2ee]">
      <header className="sticky top-0 z-30 border-b border-[#25272c] bg-[#0d0e10]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-4 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#fc5300]/15 text-[#fc5300]">
              <ShieldCheck />
            </div>
            <div>
              <p className="font-head text-xs font-bold uppercase tracking-[.16em] text-[#fc5300]">
                FITMEET
              </p>
              <h1 className="font-head text-xl font-black uppercase text-white sm:text-2xl">
                Admin Portal
              </h1>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className={buttonClass}
              onClick={() => void handleRefresh()}
              aria-label="Refresh dashboard"
              disabled={busy}
            >
              <RefreshCw size={17} />
            </button>
            <button className={buttonClass} onClick={() => void logout()}>
              <LogOut size={17} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-7 sm:py-9">
        <nav className="mb-7 flex gap-2 overflow-x-auto pb-2" aria-label="Admin sections">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setErrorMessage(null);
                setActiveTab(tab.id);
              }}
              className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#fc5300] text-white'
                  : 'border border-[#292a30] bg-[#111215] text-[#b4b0aa] hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.title}
            </button>
          ))}
        </nav>

        {errorMessage && (
          <div
            role="alert"
            className="mb-5 flex items-start justify-between gap-4 rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm text-red-200"
          >
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} aria-label="Dismiss error">
              <X size={17} />
            </button>
          </div>
        )}
        {successMessage && (
          <div
            role="status"
            className="mb-5 rounded-lg border border-emerald-900 bg-emerald-950/40 p-4 text-sm text-emerald-200"
          >
            {successMessage}
          </div>
        )}

        {activeTab === 'overview' && (
          <>
            <div className="mb-6">
              <p className="font-head text-xs font-bold uppercase tracking-[.16em] text-[#fc5300]">
                Platform overview
              </p>
              <h2 className="mt-1 font-head text-3xl font-black uppercase text-white sm:text-4xl">
                Your community at a glance
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ['Total users', overview?.totalUsers, <Users />],
                ['Events', overview?.totalEvents, <CalendarDays />],
                ['Registrations', overview?.totalRegistrations, <Ticket />],
                ['Captured revenue', formatMoney(overview?.totalRevenuePaise || 0), <CreditCard />],
              ].map(([label, value, icon]) => (
                <article
                  key={String(label)}
                  className="rounded-2xl border border-[#292a30] bg-[#111215] p-5 sm:p-6"
                >
                  <div className="flex items-center justify-between text-sm font-semibold text-[#aaa8a5]">
                    {label}
                    <span className="text-[#fc5300]">{icon}</span>
                  </div>
                  <p className="mt-4 font-head text-4xl font-black text-white">
                    {value ?? (busy ? '…' : 0)}
                  </p>
                </article>
              ))}
            </div>
            <p className="mt-6 text-sm text-[#85838a]">
              Counts and revenue are queried from Supabase records. Revenue includes only captured
              payment transactions.
            </p>
          </>
        )}

        {activeTab === 'events' && (
          <section>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="font-head text-xs font-bold uppercase tracking-[.16em] text-[#fc5300]">
                  Event operations
                </p>
                <h2 className="mt-1 font-head text-3xl font-black uppercase text-white">
                  Manage events
                </h2>
              </div>
              <button
                onClick={openNewEvent}
                disabled={!organizations.length}
                className={`${buttonClass} border-[#fc5300] bg-[#fc5300] text-white hover:bg-[#ff7130]`}
              >
                <Plus size={17} />
                Create event
              </button>
            </div>
            {!organizations.length && !busy && (
              <p className="mb-4 rounded-lg border border-amber-900 bg-amber-950/30 p-3 text-sm text-amber-200">
                An approved organization record is required before creating events.
              </p>
            )}
            <div className="overflow-x-auto rounded-xl border border-[#292a30] bg-[#111215]">
              <table className="w-full min-w-[840px] text-left text-sm">
                <thead className="border-b border-[#292a30] text-xs uppercase text-[#aaa8a5]">
                  <tr>
                    <th className="p-4">Event</th>
                    <th className="p-4">Date / City</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Capacity</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#24252b]">
                  {events.map((event) => (
                    <tr key={event.id}>
                      <td className="p-4">
                        <div className="font-semibold text-white">{event.title}</div>
                        <div className="mt-1 text-xs text-[#8e8d93]">{event.venue}</div>
                      </td>
                      <td className="p-4 text-[#c9c9cf]">
                        {event.date}
                        <div className="text-xs text-[#8e8d93]">{event.city}</div>
                      </td>
                      <td className="p-4">
                        <span className="rounded-full bg-[#fc5300]/15 px-2.5 py-1 text-xs font-semibold capitalize text-[#ff844e]">
                          {event.status}
                        </span>
                      </td>
                      <td className="p-4 text-[#c9c9cf]">
                        {event.slotsRemaining} / {event.registrationCapacity}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button className={buttonClass} onClick={() => openEditEvent(event)}>
                            Edit
                          </button>
                          <button
                            className={buttonClass}
                            onClick={() => void updateEventStatus(event)}
                          >
                            {event.status === 'published' ? 'Unpublish' : 'Publish'}
                          </button>
                          <button
                            className="rounded-lg border border-red-900 px-3 py-2 text-sm text-red-300 hover:bg-red-950"
                            onClick={() => void deleteEvent(event)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!events.length && !busy && (
                <p className="p-8 text-center text-sm text-[#aaa8a5]">No event records found.</p>
              )}
            </div>
          </section>
        )}

        {activeTab === 'users' && (
          <section>
            <div className="mb-5">
              <p className="font-head text-xs font-bold uppercase tracking-[.16em] text-[#fc5300]">
                Account administration
              </p>
              <h2 className="mt-1 font-head text-3xl font-black uppercase text-white">
                Registered users
              </h2>
            </div>
            <div className="overflow-x-auto rounded-xl border border-[#292a30] bg-[#111215]">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-[#292a30] text-xs uppercase text-[#aaa8a5]">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Joined</th>
                    <th className="p-4">Account</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#24252b]">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="p-4">
                        <div className="font-semibold text-white">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-xs text-[#8e8d93]">{user.email}</div>
                      </td>
                      <td className="p-4 text-[#c9c9cf]">{user.phone || '—'}</td>
                      <td className="p-4 capitalize text-[#c9c9cf]">
                        {user.role.replace('_', ' ')}
                      </td>
                      <td className="p-4 text-[#c9c9cf]">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span className={user.is_active ? 'text-emerald-300' : 'text-red-300'}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          className={buttonClass}
                          disabled={busy || user.role === 'admin'}
                          onClick={() => void updateUserStatus(user)}
                        >
                          {user.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!users.length && !busy && (
                <p className="p-8 text-center text-sm text-[#aaa8a5]">No registered users found.</p>
              )}
            </div>
          </section>
        )}

        {activeTab === 'registrations' && (
          <section>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="font-head text-xs font-bold uppercase tracking-[.16em] text-[#fc5300]">
                  Attendance records
                </p>
                <h2 className="mt-1 font-head text-3xl font-black uppercase text-white">
                  Registrations
                </h2>
              </div>
              <button className={buttonClass} onClick={() => void exportRecords('registrations')}>
                <Download size={17} />
                Export CSV
              </button>
            </div>
            <div className="overflow-x-auto rounded-xl border border-[#292a30] bg-[#111215]">
              <table className="w-full min-w-[920px] text-left text-sm">
                <thead className="border-b border-[#292a30] text-xs uppercase text-[#aaa8a5]">
                  <tr>
                    <th className="p-4">Participant</th>
                    <th className="p-4">Event</th>
                    <th className="p-4">Reference</th>
                    <th className="p-4">Tickets / Amount</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#24252b]">
                  {registrations.map((row) => (
                    <tr key={row.id}>
                      <td className="p-4">
                        <div className="font-semibold text-white">{row.full_name}</div>
                        <div className="text-xs text-[#8e8d93]">{row.email}</div>
                      </td>
                      <td className="p-4 text-[#c9c9cf]">{row.event?.title || row.event_id}</td>
                      <td className="p-4 font-mono text-[#c9c9cf]">{row.reference_id}</td>
                      <td className="p-4 text-[#c9c9cf]">
                        {row.ticket_count} · {formatMoney(row.total_amount_in_paise)}
                      </td>
                      <td className="p-4 capitalize text-[#c9c9cf]">{row.payment_status}</td>
                      <td className="p-4 text-[#c9c9cf]">{row.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!registrations.length && !busy && (
                <p className="p-8 text-center text-sm text-[#aaa8a5]">
                  No registration records found.
                </p>
              )}
            </div>
          </section>
        )}

        {activeTab === 'payments' && (
          <section>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="font-head text-xs font-bold uppercase tracking-[.16em] text-[#fc5300]">
                  Transaction ledger
                </p>
                <h2 className="mt-1 font-head text-3xl font-black uppercase text-white">
                  Payments
                </h2>
              </div>
              <button className={buttonClass} onClick={() => void exportRecords('payments')}>
                <Download size={17} />
                Export CSV
              </button>
            </div>
            <div className="overflow-x-auto rounded-xl border border-[#292a30] bg-[#111215]">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b border-[#292a30] text-xs uppercase text-[#aaa8a5]">
                  <tr>
                    <th className="p-4">Participant</th>
                    <th className="p-4">Transaction</th>
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#24252b]">
                  {payments.map((row) => (
                    <tr key={row.id}>
                      <td className="p-4">
                        <div className="font-semibold text-white">
                          {row.registration?.full_name || '—'}
                        </div>
                        <div className="text-xs text-[#8e8d93]">{row.registration?.email}</div>
                      </td>
                      <td className="p-4 font-mono text-xs text-[#c9c9cf]">
                        {row.razorpay_payment_id || row.registration?.reference_id || '—'}
                      </td>
                      <td className="p-4 font-mono text-xs text-[#c9c9cf]">
                        {row.razorpay_order_id}
                      </td>
                      <td className="p-4 text-[#c9c9cf]">{formatMoney(row.amount_in_paise)}</td>
                      <td className="p-4 capitalize text-[#c9c9cf]">{row.status}</td>
                      <td className="p-4 text-[#c9c9cf]">
                        {new Date(row.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!payments.length && !busy && (
                <p className="p-8 text-center text-sm text-[#aaa8a5]">
                  No payment transaction records found.
                </p>
              )}
            </div>
          </section>
        )}

        {activeTab === 'enquiries' && (
          <section>
            <div className="mb-5">
              <p className="font-head text-xs font-bold uppercase tracking-[.16em] text-[#fc5300]">
                Incoming messages
              </p>
              <h2 className="mt-1 font-head text-3xl font-black uppercase text-white">
                Contact & Collaboration Enquiries
              </h2>
            </div>
            <div className="space-y-3">
              {enquiries.map((row) => (
                <article
                  key={`${row.kind}-${row.id}`}
                  className="rounded-xl border border-[#292a30] bg-[#111215] p-4 sm:p-5"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                      {row.kind === 'contact' ? (
                        <>
                          <h3 className="font-semibold text-white">
                            {row.name} <span className="font-normal text-[#aaa8a5]">· Contact</span>
                          </h3>
                          <p className="mt-1 text-sm text-[#b4b0aa]">
                            {row.email} · {row.interest} ·{' '}
                            {new Date(row.created_at).toLocaleString()}
                          </p>
                        </>
                      ) : (
                        <>
                          <h3 className="font-semibold text-white">
                            {row.name}{' '}
                            <span className="font-normal text-[#aaa8a5]">
                              · {row.organization_type}
                            </span>
                          </h3>
                          <p className="mt-1 text-sm text-[#b4b0aa]">
                            {row.city} · {row.phone} · {new Date(row.created_at).toLocaleString()}
                          </p>
                          <p className="mt-3 text-sm text-[#ddd]">
                            {row.support_options.join(', ')}
                          </p>
                        </>
                      )}
                      {row.message && <p className="mt-2 text-sm text-[#aaa8a5]">{row.message}</p>}
                    </div>
                    <select
                      aria-label={`Enquiry status for ${row.name}`}
                      value={row.status}
                      disabled={busy}
                      onChange={(event) =>
                        void updateEnquiryStatus(row, event.target.value as AdminEnquiry['status'])
                      }
                      className="rounded-lg border border-[#303139] bg-[#0a0a0c] px-3 py-2 text-sm text-white"
                    >
                      {row.kind === 'contact' ? (
                        <>
                          <option value="unread">Unread</option>
                          <option value="responded">Responded</option>
                        </>
                      ) : (
                        <>
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                        </>
                      )}
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </article>
              ))}
              {!enquiries.length && !busy && (
                <p className="rounded-xl border border-[#292a30] bg-[#111215] p-8 text-center text-sm text-[#aaa8a5]">
                  No contact or collaboration enquiries found.
                </p>
              )}
            </div>
          </section>
        )}

        {activeTab === 'gallery' && (
          <section>
            <div className="mb-5">
              <p className="font-head text-xs font-bold uppercase tracking-[.16em] text-[#fc5300]">
                Public website content
              </p>
              <h2 className="mt-1 font-head text-3xl font-black uppercase text-white">
                Gallery Management
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-[#aaa8a5]">
                Upload JPEG, PNG or WebP images up to 10 MB each. Captions are optional and appear
                with each photo on the public Gallery.
              </p>
            </div>

            <form
              onSubmit={uploadGalleryFiles}
              className="mb-7 rounded-xl border border-[#292a30] bg-[#111215] p-5 sm:p-7"
            >
              <label className="block text-sm font-semibold text-[#d9d7d4]">
                Add images
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  disabled={galleryUploading}
                  onChange={(event) => {
                    addGalleryFiles(event.currentTarget.files);
                    event.currentTarget.value = '';
                  }}
                  className="mt-2 block w-full cursor-pointer rounded-lg border border-[#303139] bg-[#0a0a0c] text-sm text-[#c9c9cf] file:mr-4 file:border-0 file:bg-[#25272c] file:px-4 file:py-3 file:font-semibold file:text-white hover:file:bg-[#303139] disabled:opacity-50"
                />
              </label>

              {galleryUploadDrafts.length > 0 && (
                <div className="mt-5 space-y-3">
                  {galleryUploadDrafts.map((draft) => (
                    <div
                      key={draft.key}
                      className="flex flex-col gap-3 rounded-lg border border-[#25272c] bg-[#0d0e10] p-3 sm:flex-row sm:items-center"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">
                          {draft.file.name}
                        </p>
                        <p className="text-xs text-[#8b8882]">
                          {(draft.file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                      <input
                        value={draft.caption}
                        maxLength={500}
                        disabled={galleryUploading}
                        onChange={(event) =>
                          setGalleryUploadDrafts((current) =>
                            current.map((item) =>
                              item.key === draft.key
                                ? { ...item, caption: event.target.value }
                                : item
                            )
                          )
                        }
                        placeholder="Caption (optional)"
                        aria-label={`Caption for ${draft.file.name}`}
                        className="w-full rounded-lg border border-[#303139] bg-[#0a0a0c] px-3 py-2.5 text-sm text-white outline-none focus:border-[#fc5300] sm:max-w-sm"
                      />
                      <button
                        type="button"
                        disabled={galleryUploading}
                        onClick={() =>
                          setGalleryUploadDrafts((current) =>
                            current.filter((item) => item.key !== draft.key)
                          )
                        }
                        className="self-end rounded-lg p-2 text-[#aaa8a5] hover:bg-red-950/40 hover:text-red-200 disabled:opacity-50 sm:self-auto"
                        aria-label={`Remove ${draft.file.name} from upload`}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                type="submit"
                disabled={!galleryUploadDrafts.length || galleryUploading}
                className={`${buttonClass} mt-5 border-[#fc5300] bg-[#fc5300] text-white hover:bg-[#ff7130]`}
              >
                {galleryUploading ? (
                  <LoaderCircle className="animate-spin" size={17} />
                ) : (
                  <ImagePlus size={17} />
                )}
                {galleryUploading
                  ? 'Uploading…'
                  : `Upload${galleryUploadDrafts.length ? ` ${galleryUploadDrafts.length}` : ''} ${
                      galleryUploadDrafts.length === 1 ? 'image' : 'images'
                    }`}
              </button>
            </form>

            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="font-head text-xl font-bold uppercase text-white">
                Published photos ({galleryImages.length})
              </h3>
              {galleryLoading && <LoaderCircle className="animate-spin text-[#fc5300]" size={18} />}
            </div>
            {galleryLoading ? (
              <p
                role="status"
                className="rounded-xl border border-[#292a30] bg-[#111215] p-8 text-center text-sm text-[#aaa8a5]"
              >
                Loading gallery images…
              </p>
            ) : galleryLoadError ? (
              <p
                role="alert"
                className="rounded-xl border border-red-900 bg-red-950/30 p-8 text-center text-sm text-red-200"
              >
                {galleryLoadError}
              </p>
            ) : Array.isArray(galleryImages) && galleryImages.length ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {(Array.isArray(galleryImages) ? galleryImages : []).map((image) => (
                  <article
                    key={image.id}
                    className="overflow-hidden rounded-xl border border-[#292a30] bg-[#111215]"
                  >
                    <img
                      src={image.image_url}
                      alt={image.caption || 'FitMeet gallery image'}
                      loading="lazy"
                      className="aspect-[4/3] w-full bg-[#0a0a0c] object-cover"
                    />
                    <div className="space-y-3 p-4">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#aaa8a5]">
                        Caption
                        <input
                          value={galleryCaptionDrafts[image.id] ?? image.caption ?? ''}
                          maxLength={500}
                          disabled={
                            galleryUpdatingId === image.id || galleryDeletingId === image.id
                          }
                          onChange={(event) =>
                            setGalleryCaptionDrafts((current) => ({
                              ...current,
                              [image.id]: event.target.value,
                            }))
                          }
                          className="mt-1.5 w-full rounded-lg border border-[#303139] bg-[#0a0a0c] px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-white outline-none focus:border-[#fc5300]"
                        />
                      </label>
                      <p className="text-xs text-[#77756f]">
                        Added {new Date(image.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <button
                          type="button"
                          disabled={
                            galleryUpdatingId === image.id || galleryDeletingId === image.id
                          }
                          onClick={() => void updateGalleryCaption(image)}
                          className={`${buttonClass} flex-1`}
                        >
                          {galleryUpdatingId === image.id ? (
                            <LoaderCircle className="animate-spin" size={16} />
                          ) : (
                            <Save size={16} />
                          )}
                          Update caption
                        </button>
                        <button
                          type="button"
                          disabled={
                            galleryUpdatingId === image.id || galleryDeletingId === image.id
                          }
                          onClick={() => void deleteGalleryImage(image)}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-900/70 bg-red-950/30 px-4 py-2.5 text-sm font-semibold text-red-200 transition-colors hover:bg-red-950/60 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {galleryDeletingId === image.id ? (
                            <LoaderCircle className="animate-spin" size={16} />
                          ) : (
                            <Trash2 size={16} />
                          )}
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-[#292a30] bg-[#111215] p-8 text-center text-sm text-[#aaa8a5]">
                No gallery images have been uploaded yet.
              </p>
            )}
          </section>
        )}

        {activeTab === 'settings' && (
          <section>
            <div className="mb-5">
              <p className="font-head text-xs font-bold uppercase tracking-[.16em] text-[#fc5300]">
                Website configuration
              </p>
              <h2 className="mt-1 font-head text-3xl font-black uppercase text-white">
                Site Settings
              </h2>
            </div>
            {siteSettings ? (
              <form
                onSubmit={saveSiteSettings}
                className="rounded-xl border border-[#292a30] bg-[#111215] p-5 sm:p-7"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {(
                    [
                      ['brandName', 'Brand name'],
                      ['tagline', 'Tagline'],
                      ['heroHeadline', 'Hero headline'],
                      ['heroSubheadline', 'Hero subheadline'],
                      ['primaryCity', 'Primary city'],
                      ['accentColor', 'Accent color'],
                      ['contactEmail', 'Contact email'],
                      ['contactPhone', 'Contact phone'],
                      ['instagramUrl', 'Instagram URL'],
                      ['youtubeUrl', 'YouTube URL'],
                      ['twitterUrl', 'Twitter / X URL'],
                      ['customDomain', 'Custom domain'],
                    ] as Array<[keyof SiteSettings, string]>
                  ).map(([field, label]) => (
                    <label key={field} className="text-sm font-semibold text-[#c9c9cf]">
                      {label}
                      <input
                        value={siteSettings[field]}
                        onChange={(event) =>
                          setSiteSettings((current) =>
                            current ? { ...current, [field]: event.target.value } : current
                          )
                        }
                        className="mt-1.5 w-full rounded-lg border border-[#303139] bg-[#0a0a0c] px-3 py-2.5 text-white outline-none focus:border-[#fc5300]"
                      />
                    </label>
                  ))}
                  {(
                    [
                      ['heroLead', 'Hero description'],
                      ['contactAddress', 'Contact address'],
                    ] as Array<[keyof SiteSettings, string]>
                  ).map(([field, label]) => (
                    <label
                      key={field}
                      className="text-sm font-semibold text-[#c9c9cf] sm:col-span-2"
                    >
                      {label}
                      <textarea
                        rows={3}
                        value={siteSettings[field]}
                        onChange={(event) =>
                          setSiteSettings((current) =>
                            current ? { ...current, [field]: event.target.value } : current
                          )
                        }
                        className="mt-1.5 w-full rounded-lg border border-[#303139] bg-[#0a0a0c] px-3 py-2.5 text-white outline-none focus:border-[#fc5300]"
                      />
                    </label>
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={busy}
                  className={`${buttonClass} mt-5 border-[#fc5300] bg-[#fc5300] text-white hover:bg-[#ff7130]`}
                >
                  <Save size={17} />
                  Save settings
                </button>
              </form>
            ) : (
              <p className="rounded-xl border border-[#292a30] bg-[#111215] p-8 text-center text-sm text-[#aaa8a5]">
                {busy ? 'Loading site settings…' : 'Site settings are not available.'}
              </p>
            )}
          </section>
        )}
      </main>

      {eventDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-3 sm:p-6">
          <form
            onSubmit={saveEvent}
            className="my-auto max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[#303139] bg-[#111215] p-5 sm:p-7"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-head text-2xl font-black uppercase text-white">
                {editingEventId ? 'Edit event' : 'Create event'}
              </h2>
              <button
                type="button"
                onClick={() => setEventDialogOpen(false)}
                aria-label="Close event form"
                className="text-[#aaa8a5] hover:text-white"
              >
                <X />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {(
                [
                  ['title', 'Event title', 'text'],
                  ['date', 'Date', 'date'],
                  ['startTime', 'Start time', 'time'],
                  ['endTime', 'End time', 'time'],
                  ['venue', 'Venue', 'text'],
                  ['city', 'City', 'text'],
                  ['priceInPaise', 'Price (paise)', 'number'],
                  ['registrationCapacity', 'Capacity', 'number'],
                  ['coverImage', 'Cover image URL', 'text'],
                  ['registrationDeadline', 'Registration deadline', 'datetime-local'],
                ] as Array<[keyof EventDraft, string, string]>
              ).map(([field, label, type]) => (
                <label key={field} className="text-sm font-semibold text-[#c9c9cf]">
                  {label}
                  <input
                    required={[
                      'title',
                      'date',
                      'startTime',
                      'endTime',
                      'venue',
                      'city',
                      'priceInPaise',
                      'registrationCapacity',
                    ].includes(field)}
                    type={type}
                    min={type === 'number' ? '0' : undefined}
                    value={eventDraft[field] as string}
                    onChange={(event) =>
                      setEventDraft((draft) => ({ ...draft, [field]: event.target.value }))
                    }
                    className="mt-1.5 w-full rounded-lg border border-[#303139] bg-[#0a0a0c] px-3 py-2.5 text-white outline-none focus:border-[#fc5300]"
                  />
                </label>
              ))}
              <label className="text-sm font-semibold text-[#c9c9cf]">
                Category
                <select
                  value={eventDraft.category}
                  onChange={(event) =>
                    setEventDraft((draft) => ({ ...draft, category: event.target.value }))
                  }
                  className="mt-1.5 w-full rounded-lg border border-[#303139] bg-[#0a0a0c] px-3 py-2.5 text-white"
                >
                  <option value="running">Running</option>
                  <option value="gym_hiit">Gym / HIIT</option>
                  <option value="bootcamp">Bootcamp</option>
                  <option value="yoga_mobility">Yoga / Mobility</option>
                  <option value="hyrox_crossfit">Hyrox / CrossFit</option>
                  <option value="cycling">Cycling</option>
                </select>
              </label>
              <label className="text-sm font-semibold text-[#c9c9cf]">
                Organizer
                <select
                  required
                  value={eventDraft.primaryOrganizerId}
                  onChange={(event) =>
                    setEventDraft((draft) => ({ ...draft, primaryOrganizerId: event.target.value }))
                  }
                  className="mt-1.5 w-full rounded-lg border border-[#303139] bg-[#0a0a0c] px-3 py-2.5 text-white"
                >
                  <option value="">Select organizer</option>
                  {organizations.map((organization) => (
                    <option key={organization.id} value={organization.id}>
                      {organization.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-semibold text-[#c9c9cf]">
                Status
                <select
                  value={eventDraft.status}
                  onChange={(event) =>
                    setEventDraft((draft) => ({
                      ...draft,
                      status: event.target.value as EventDraft['status'],
                    }))
                  }
                  className="mt-1.5 w-full rounded-lg border border-[#303139] bg-[#0a0a0c] px-3 py-2.5 text-white"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm text-[#c9c9cf]">
                <input
                  type="checkbox"
                  checked={eventDraft.featured}
                  onChange={(event) =>
                    setEventDraft((draft) => ({ ...draft, featured: event.target.checked }))
                  }
                />
                Featured event
              </label>
              <label className="text-sm font-semibold text-[#c9c9cf] sm:col-span-2">
                Description
                <textarea
                  rows={3}
                  value={eventDraft.description}
                  onChange={(event) =>
                    setEventDraft((draft) => ({ ...draft, description: event.target.value }))
                  }
                  className="mt-1.5 w-full rounded-lg border border-[#303139] bg-[#0a0a0c] px-3 py-2.5 text-white outline-none focus:border-[#fc5300]"
                />
              </label>
              <label className="text-sm font-semibold text-[#c9c9cf]">
                Location details
                <input
                  value={eventDraft.locationDetails}
                  onChange={(event) =>
                    setEventDraft((draft) => ({ ...draft, locationDetails: event.target.value }))
                  }
                  className="mt-1.5 w-full rounded-lg border border-[#303139] bg-[#0a0a0c] px-3 py-2.5 text-white outline-none focus:border-[#fc5300]"
                />
              </label>
              <label className="text-sm font-semibold text-[#c9c9cf]">
                Cancellation policy
                <input
                  value={eventDraft.cancellationPolicy}
                  onChange={(event) =>
                    setEventDraft((draft) => ({ ...draft, cancellationPolicy: event.target.value }))
                  }
                  className="mt-1.5 w-full rounded-lg border border-[#303139] bg-[#0a0a0c] px-3 py-2.5 text-white outline-none focus:border-[#fc5300]"
                />
              </label>
              <label className="text-sm font-semibold text-[#c9c9cf] sm:col-span-2">
                Rules (one per line)
                <textarea
                  rows={3}
                  value={eventDraft.rules}
                  onChange={(event) =>
                    setEventDraft((draft) => ({ ...draft, rules: event.target.value }))
                  }
                  className="mt-1.5 w-full rounded-lg border border-[#303139] bg-[#0a0a0c] px-3 py-2.5 text-white outline-none focus:border-[#fc5300]"
                />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className={buttonClass}
                onClick={() => setEventDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="rounded-lg bg-[#fc5300] px-5 py-2.5 font-bold text-white hover:bg-[#ff7130] disabled:opacity-50"
              >
                {busy ? 'Saving…' : 'Save event'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
