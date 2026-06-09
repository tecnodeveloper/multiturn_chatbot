"use client";

import { useState } from "react";
import Link from "next/link";
import { Brand } from "@/components/ui/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createBrowserSupabaseClient } from "@/lib/supabase";

export default function ResetPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createBrowserSupabaseClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      setIsSubmitting(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard`,
      });

      if (error) throw error;

      toast.success("Password reset link sent to your email");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset link");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-sm">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-12">
          <Brand size="xl" showText={false} className="mb-4" />
          <h1 className="text-2xl font-bold text-white mt-4">Reset Password</h1>
          <p className="text-gray-400 text-center mt-2">
            Enter your email to receive a password reset link
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleReset} className="space-y-6 mb-8">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white font-medium block">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
              className="h-12 bg-black border border-[#2A2A2A] text-white placeholder:text-gray-500 rounded-lg focus:border-blue-500 focus:ring-0"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            {isSubmitting ? "Sending link..." : "Send Reset Link"}
          </Button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 text-center text-sm">
          <Link
            href="/login"
            className="text-gray-300 hover:text-white underline"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
