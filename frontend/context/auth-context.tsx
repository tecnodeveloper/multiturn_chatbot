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
import logger from "@/lib/logger";

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
      logger.info("fetchUserProfile: No authUser, setting user to null");
      setUser(null);
      return;
    }

    logger.info({ userId: authUser.id }, "fetchUserProfile: Starting profile fetch");

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
        logger.error({ error, userId: authUser.id }, "Supabase profile fetch error");
      }

      if (profile) {
        logger.info({ userId: authUser.id }, "Profile fetched successfully");
        setUser({
          id: authUser.id,
          email: authUser.email ?? "",
          name: profile.full_name || profile.name || initialUser.name,
          avatar: profile.image_url || profile.avatar_url || initialUser.avatar,
        });
      } else {
        logger.warn({ userId: authUser.id }, "No profile found in profiles table");
      }
    } catch (error) {
      logger.error({ error, userId: authUser.id }, "Error fetching profile in AuthContext");
    }
  }, []);

  const refreshUser = useCallback(async () => {
    logger.info("refreshUser called");
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      await fetchUserProfile(data.user);
    }
  }, [fetchUserProfile]);

  useEffect(() => {
    const initialize = async () => {
      try {
        logger.info("Auth initialization starting");
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          logger.info({ userId: data.session.user.id }, "Active session found");
          await fetchUserProfile(data.session.user);
        } else {
          logger.info("No active session found during initialization");
        }
      } catch (error) {
        logger.error({ error }, "Auth initialization error");
      } finally {
        setIsLoading(false);
        logger.info("Auth initialization complete, isLoading=false");
      }
    };

    initialize();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      logger.info({ event, userId: session?.user?.id }, "Auth state change event");
      if (session?.user) {
        // Don't await here to prevent blocking the auth flow if profile fetch is slow
        fetchUserProfile(session.user);
      } else {
        setUser(null);
      }

      if (event === "SIGNED_OUT") {
        logger.info("User signed out, redirecting to login");
        router.push("/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, fetchUserProfile]);

  const signIn = async (email: string, password: string) => {
    logger.info({ email }, "signIn context method called");
    const userData = await signInWithEmail(email, password);
    logger.info({ userId: userData.id }, "signIn context method successful");
    // Don't wait for the full profile fetch to complete before returning
    // This prevents the UI from getting stuck if the profile fetch is slow
    fetchUserProfile(userData);
  };

  const signUp = async (email: string, password: string, name?: string) => {
    logger.info({ email, name }, "signUp context method called");
    const userData = await signUpWithEmail(
      email,
      password,
      name || email.split("@")[0],
    );
    logger.info({ userId: userData.id }, "signUp context method successful");
    // Trigger profile fetch without awaiting
    fetchUserProfile(userData);
  };

  const handleGoogleSignIn = async () => {
    logger.info("handleGoogleSignIn context method called");
    await signInWithGoogle();
  };

  const handleLogout = async () => {
    logger.info("handleLogout context method called");
    try {
      await signOut();
      await supabase.auth.signOut();
      setUser(null);
      logger.info("Logout successful, redirecting to login");
      router.push("/login");
    } catch (error) {
      logger.error({ error }, "Logout error");
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
