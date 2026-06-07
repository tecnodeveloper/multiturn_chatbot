"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import { Brand } from "@/components/ui/brand";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signInWithGoogle, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setIsSigningIn(true);
      await signIn(email, password);
      // Use window.location.href for a hard redirect to ensure cookies are sent and middleware runs correctly
      window.location.href = "/dashboard";
    } catch (error: any) {
      toast.error(error.message || "Invalid email or password");
      setIsSigningIn(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signInWithGoogle();
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in with Google");
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-sm">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-12">
          <Brand size="xl" showText={false} className="mb-4" />
        </div>

        {/* Form Section */}
        <form onSubmit={handleEmailSignIn} className="space-y-6 mb-8">
          {/* Email Field */}
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
              disabled={isSigningIn || isLoading}
              className="h-12 bg-black border border-[#2A2A2A] text-white placeholder:text-gray-500 rounded-lg focus:border-blue-500 focus:ring-0"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white font-medium block">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isSigningIn || isLoading}
              className="h-12 bg-black border border-[#2A2A2A] text-white placeholder:text-gray-500 rounded-lg focus:border-blue-500 focus:ring-0"
            />
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            disabled={isSigningIn || isLoading}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            {isSigningIn ? "Signing in..." : "Login"}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-black text-gray-500">OR</span>
          </div>
        </div>

        {/* Google Button */}
        <Button
          onClick={handleGoogleSignIn}
          disabled={isSigningIn || isLoading}
          variant="outline"
          className="w-full h-12 bg-white hover:bg-blue-600 hover:text-white text-slate-900 border border-slate-300 font-medium rounded-lg flex items-center justify-center gap-2 transition-all duration-200 group"
        >
          <svg
            className="w-5 h-5 transition-colors duration-200"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              className="group-hover:fill-white"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              className="group-hover:fill-white"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              className="group-hover:fill-white"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              className="group-hover:fill-white"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>

        {/* Footer Links */}
        <div className="mt-6 flex flex-col items-center gap-2 text-sm">
          <div className="text-gray-500">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-blue-500 hover:text-blue-400 font-medium"
            >
              Sign Up
            </Link>
          </div>
          <div className="text-gray-500">
            Forgot your password?{" "}
            <Link
              href="/reset"
              className="text-gray-300 hover:text-white underline"
            >
              Reset
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
