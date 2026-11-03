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
        return { ...parsed, role: 'user' };
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

        const nextUser: UserProfile = {
          id: session.user.id,
          email,
          firstName,
          lastName,
          fullName,
          phone: meta.phone || undefined,
          role: 'user',
          createdAt: session.user.created_at,
        };
        setUser(nextUser);
        window.setTimeout(() => {
          void supabase
            ?.from('profiles')
            .select('role,is_active')
            .eq('id', session.user.id)
            .maybeSingle()
            .then(({ data, error }) => {
              if (error) {
                console.error('Unable to load account permissions:', error.message);
                return;
              }
              if (data?.is_active === false) {
                void supabase?.auth.signOut();
                setUser(null);
                return;
              }
              if (
                data?.role === 'user' ||
                data?.role === 'admin'
              ) {
                setUser((current) =>
                  current?.id === session.user.id ? { ...current, role: data.role } : current
                );
              }
            });
        }, 0);
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

  const login = async (email: string, password?: string) => {
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
    const assignedRole: UserRole = 'user';

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

  const signUp = async (email: string, fullName: string, phone: string, password?: string) => {
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
            role: 'user',
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

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'user',
        isAuthenticated: Boolean(user),
        login,
        signUp,
        loginWithGoogle,
        logout,
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
