"use client";

import { useAuth } from "@/context/auth-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useAuth();

  // While loading, show a neutral state
  if (isLoading) {
    return <div className="min-h-screen bg-background" />;
  }

  return <div className="min-h-screen bg-background text-foreground">{children}</div>;
}
