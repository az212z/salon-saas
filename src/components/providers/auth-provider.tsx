'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { User, Session } from '@supabase/supabase-js';
import type { UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  currentTenant: TenantInfo | null;
  isLoading: boolean;
  signInWithPhone: (phone: string) => Promise<{ error?: string }>;
  verifyOTP: (phone: string, code: string) => Promise<{ error?: string }>;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, metadata: Record<string, string>) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

interface UserProfile {
  id: string;
  tenant_id: string | null;
  role: UserRole;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  avatar_url: string | null;
  locale: string;
}

interface TenantInfo {
  id: string;
  slug: string;
  name: Record<string, string>;
  primary_color: string;
  secondary_color: string;
  logo_url: string | null;
  currency: string;
  locale: string;
  settings: Record<string, any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentTenant, setCurrentTenant] = useState<TenantInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setCurrentTenant(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) {
      setProfile(data as UserProfile);
      if (data.tenant_id) {
        await fetchTenant(data.tenant_id);
      }
    }
  }

  async function fetchTenant(tenantId: string) {
    const { data } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .single();

    if (data) {
      setCurrentTenant(data as TenantInfo);
      // Apply tenant theme colors
      document.documentElement.style.setProperty('--primary-tenant', data.primary_color);
      document.documentElement.style.setProperty('--secondary-tenant', data.secondary_color);
    }
  }

  async function signInWithPhone(phone: string) {
    const { error } = await supabase.auth.signInWithOtp({ phone });
    return { error: error?.message };
  }

  async function verifyOTP(phone: string, code: string) {
    const { error } = await supabase.auth.verifyOtp({ phone, token: code, type: 'sms' });
    return { error: error?.message };
  }

  async function signInWithEmail(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message };
  }

  async function signUp(email: string, password: string, metadata: Record<string, string>) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });
    return { error: error?.message };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setCurrentTenant(null);
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      currentTenant,
      isLoading,
      signInWithPhone,
      verifyOTP,
      signInWithEmail,
      signUp,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}