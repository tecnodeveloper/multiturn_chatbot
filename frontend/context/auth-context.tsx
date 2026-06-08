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
import { createContext, useContext, useEffect, useMemo, useState } from "react";

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const supabase = createBrowserSupabaseClient();

function mapUser(user: User | null): AuthUser | null {
  if (!user) {
    return null;
  }

  const metadata = user.user_metadata ?? {};

  return {
    id: user.id,
    email: user.email ?? "",
    name:
      (metadata.name as string | undefined) ||
      (metadata.full_name as string | undefined) ||
      user.email?.split("@")[0] ||
      "MultiTurn User",
    avatar:
      (metadata.avatar_url as string | undefined) ||
      (metadata.picture as string | undefined) ||
      undefined,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initialize = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(mapUser(data.session?.user ?? null));
      setIsLoading(false);
    };

    initialize();

    // Listen for auth state changes (e.g., after login from another tab or route)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(mapUser(session?.user ?? null));
      
      // If signed out, redirect to login
      if (event === 'SIGNED_OUT') {
        router.push('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const signIn = async (email: string, password: string) => {
    const userData = await signInWithEmail(email, password);
    setUser(mapUser(userData));
  };

  const signUp = async (email: string, password: string, name?: string) => {
    const userData = await signUpWithEmail(
      email,
      password,
      name || email.split("@")[0],
    );
    setUser(mapUser(userData));
  };

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
  };

  const handleLogout = async () => {
    try {
      await signOut(); // Server-side logout (clears cookies)
      await supabase.auth.signOut(); // Client-side logout (clears local storage)
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback
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
    }),
    [user, isLoading],
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
