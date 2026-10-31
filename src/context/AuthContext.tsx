import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, password?: string, role?: UserRole) => Promise<void>;
  signUp: (email: string, fullName: string, phone: string, password?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  switchRoleDemo: (role: UserRole) => void;
  isBackendConnected: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = 'fitmeet_active_user_v2';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      // Remove legacy auto-seeded mock user so default state is guest (Sign in & Register visible)
      localStorage.removeItem('fitmeet_active_user_v1');
      const stored = localStorage.getItem(LOCAL_USER_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.id === 'usr-customer-1') {
          localStorage.removeItem(LOCAL_USER_KEY);
          return null;
        }
        return parsed;
      }
    } catch {
      // fallback
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_USER_KEY);
    }
  }, [user]);

  // Listen to Supabase Auth state if configured
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const email = session.user.email || '';
        const meta = session.user.user_metadata || {};
        const fullName =
          meta.full_name ||
          `${meta.first_name || ''} ${meta.last_name || ''}`.trim() ||
          email.split('@')[0];
        const firstName = meta.first_name || fullName.split(' ')[0] || 'Member';
        const lastName = meta.last_name || fullName.split(' ').slice(1).join(' ') || '';

        setUser({
          id: session.user.id,
          email,
          firstName,
          lastName,
          fullName,
          phone: meta.phone || undefined,
          role: meta.role || (email.includes('admin') ? 'super_admin' : 'customer'),
          createdAt: session.user.created_at,
        });
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const loginWithGoogle = async () => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } else {
      throw new Error(
        'Google sign-in is not configured yet. Live Google OAuth requires Supabase backend credentials and Google OAuth provider setup.'
      );
    }
  };

  const login = async (email: string, password?: string, forcedRole?: UserRole) => {
    if (isSupabaseConfigured && supabase) {
      if (password) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) throw error;
      }
      return;
    }

    // Explicit demo fallback when Supabase is not configured
    let assignedRole: UserRole = forcedRole || 'customer';
    if (!forcedRole) {
      if (email.toLowerCase().includes('admin')) assignedRole = 'super_admin';
      else if (email.toLowerCase().includes('coach') || email.toLowerCase().includes('gym')) assignedRole = 'organizer';
    }

    const firstName = email.split('@')[0];
    const loggedInUser: UserProfile = {
      id: `usr-${Date.now().toString().slice(-5)}`,
      email,
      firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
      lastName: 'User',
      fullName: `${firstName.charAt(0).toUpperCase() + firstName.slice(1)} User`,
      role: assignedRole,
      createdAt: new Date().toISOString(),
    };
    setUser(loggedInUser);
  };

  const signUp = async (
    email: string,
    fullName: string,
    phone: string,
    password?: string
  ) => {
    if (isSupabaseConfigured && supabase && password) {
      const parts = fullName.trim().split(' ');
      const firstName = parts[0] || fullName;
      const lastName = parts.slice(1).join(' ') || '';

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            first_name: firstName,
            last_name: lastName,
            phone: phone.trim(),
            role: 'customer',
          },
        },
      });
      if (error) throw error;
    } else {
      throw new Error(
        'Authentication backend (Supabase) is not connected. User credentials cannot be stored without database setup.'
      );
    }
  };

  const logout = () => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.signOut();
    }
    setUser(null);
  };

  const switchRoleDemo = (role: UserRole) => {
    if (!user) return;
    setUser({
      ...user,
      role,
      organizationId: role === 'organizer' ? 'org-01' : undefined,
      organizationName: role === 'organizer' ? 'FitMeet Patna Crew' : undefined,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'customer',
        isAuthenticated: Boolean(user),
        login,
        signUp,
        loginWithGoogle,
        logout,
        switchRoleDemo,
        isBackendConnected: isSupabaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
