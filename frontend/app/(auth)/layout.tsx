"use client";

import { useAuth } from "@/context/auth-context";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { isLoading } = useAuth();

  // While loading, don't show auth pages to avoid flicker
  if (isLoading) {
    return <div className="min-h-screen bg-black" />;
  }

  return <>{children}</>;
}
