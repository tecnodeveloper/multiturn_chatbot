"use client";

import { createBrowserSupabaseClient } from "@/lib/supabase";
import {
  signInWithEmail,
  signInWithGoogle,
  signOut,
  signUpWithEmail,
} from "@/lib/auth";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const supabase = createBrowserSupabaseClient();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchUserProfile = useCallback(async (authUser: User | null) => {
    if (!authUser) {
      setUser(null);
      return;
    }

    // 1. Set initial user from metadata IMMEDIATELY
    const metadata = authUser.user_metadata ?? {};
    const initialUser: AuthUser = {
      id: authUser.id,
      email: authUser.email ?? "",
      name:
        (metadata.name as string | undefined) ||
        (metadata.full_name as string | undefined) ||
        authUser.email?.split("@")[0] ||
        "MultiTurn User",
      avatar:
        (metadata.avatar_url as string | undefined) ||
        (metadata.picture as string | undefined) ||
        undefined,
    };
    
    setUser(initialUser);

    try {
      // 2. Fetch from profiles table for extended info (most up-to-date)
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .maybeSingle();

      if (error) {
        console.error("Supabase profile fetch error:", error);
      }

      if (profile) {
        setUser({
          id: authUser.id,
          email: authUser.email ?? "",
          name: profile.full_name || profile.name || initialUser.name,
          avatar: profile.image_url || profile.avatar_url || initialUser.avatar,
        });
      }
    } catch (error) {
      console.error("Error fetching profile in AuthContext:", error);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      await fetchUserProfile(data.user);
    }
  }, [fetchUserProfile]);

  useEffect(() => {
    const initialize = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          await fetchUserProfile(data.session.user);
        }
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setUser(null);
      }

      if (event === "SIGNED_OUT") {
        router.push("/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, fetchUserProfile]);

  const signIn = async (email: string, password: string) => {
    const userData = await signInWithEmail(email, password);
    await fetchUserProfile(userData);
  };

  const signUp = async (email: string, password: string, name?: string) => {
    const userData = await signUpWithEmail(
      email,
      password,
      name || email.split("@")[0],
    );
    await fetchUserProfile(userData);
  };

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
  };

  const handleLogout = async () => {
    try {
      await signOut();
      await supabase.auth.signOut();
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/login";
    }
  };

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      signIn,
      signUp,
      signInWithGoogle: handleGoogleSignIn,
      logout: handleLogout,
      refreshUser,
    }),
    [user, isLoading, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
