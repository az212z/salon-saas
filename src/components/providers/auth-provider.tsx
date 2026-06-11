"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { demoOwner, salon } from "@/lib/demo-platform";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types";

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
  settings: Record<string, unknown>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const DEMO_STORAGE_KEY = "saloni-demo-user";

function normalizeDigits(value: string) {
  return value.replace(/[٠-٩]/g, (digit) => "٠١٢٣٤٥٦٧٨٩".indexOf(digit).toString());
}

function makeDemoUser(data: { email?: string; phone?: string } = {}) {
  return {
    id: "demo-ali-owner",
    app_metadata: {},
    user_metadata: { full_name: demoOwner.name },
    aud: "authenticated",
    created_at: new Date().toISOString(),
    email: data.email ?? demoOwner.email,
    phone: data.phone,
  } as User;
}

const demoProfile: UserProfile = {
  id: "demo-ali-owner",
  tenant_id: "demo-luxe-beauty",
  role: "salon_owner",
  email: demoOwner.email,
  phone: null,
  full_name: demoOwner.name,
  avatar_url: null,
  locale: "ar",
};

const demoTenant: TenantInfo = {
  id: "demo-luxe-beauty",
  slug: salon.slug,
  name: { ar: salon.name, en: "Luxe Beauty" },
  primary_color: "#211829",
  secondary_color: "#b76d77",
  logo_url: null,
  currency: "SAR",
  locale: "ar",
  settings: {
    whatsapp_enabled: false,
    deposit_percentage: 30,
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentTenant, setCurrentTenant] = useState<TenantInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = getSupabaseClient();

  useEffect(() => {
    const stored = window.localStorage.getItem(DEMO_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as { email?: string; phone?: string };
      setUser(makeDemoUser(parsed));
      setProfile(demoProfile);
      setCurrentTenant(demoTenant);
      setIsLoading(false);
      return;
    }

    if (!supabase) {
      setIsLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        void fetchProfile(session.user.id);
      }
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
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
  }, [supabase]);

  async function fetchProfile(userId: string) {
    if (!supabase) return;

    const { data } = await supabase.from("users").select("*").eq("id", userId).single();

    if (data) {
      setProfile(data as UserProfile);
      if (data.tenant_id) {
        await fetchTenant(data.tenant_id);
      }
    }
  }

  async function fetchTenant(tenantId: string) {
    if (!supabase) return;

    const { data } = await supabase.from("tenants").select("*").eq("id", tenantId).single();

    if (data) {
      setCurrentTenant(data as TenantInfo);
      document.documentElement.style.setProperty("--primary-tenant", data.primary_color);
      document.documentElement.style.setProperty("--secondary-tenant", data.secondary_color);
    }
  }

  function setDemoSession(data: { email?: string; phone?: string }) {
    window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(data));
    setUser(makeDemoUser(data));
    setProfile({ ...demoProfile, email: data.email ?? demoOwner.email, phone: data.phone ?? null });
    setCurrentTenant(demoTenant);
    setSession(null);
  }

  async function signInWithPhone(phone: string) {
    if (!phone.trim()) return { error: "رقم الجوال مطلوب" };
    if (!supabase) return {};
    const { error } = await supabase.auth.signInWithOtp({ phone });
    return { error: error?.message };
  }

  async function verifyOTP(phone: string, code: string) {
    if (normalizeDigits(code) === demoOwner.otp) {
      setDemoSession({ phone });
      return {};
    }
    if (!supabase) return { error: `رمز OTP التجريبي هو ${demoOwner.otp}` };
    const { error } = await supabase.auth.verifyOtp({ phone, token: code, type: "sms" });
    return { error: error?.message };
  }

  async function signInWithEmail(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail === demoOwner.email && normalizeDigits(password) === demoOwner.password) {
      setDemoSession({ email: demoOwner.email });
      return {};
    }

    if (!supabase) return { error: `بيانات الاختبار: ${demoOwner.email} / ${demoOwner.password}` };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message };
  }

  async function signUp(email: string, password: string, metadata: Record<string, string>) {
    if (!supabase) {
      setDemoSession({ email });
      return {};
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });
    return { error: error?.message };
  }

  async function signOut() {
    window.localStorage.removeItem(DEMO_STORAGE_KEY);
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setCurrentTenant(null);
  }

  return (
    <AuthContext.Provider
      value={{
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
