"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { ArrowRight, Lock, Mail, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function LoginPage() {
  const { user, login, error, setError } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If user is already logged in, redirect to appropriate dashboard
  useEffect(() => {
    if (user) {
      if (user.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    }
  }, [user, router]);

  // Check for errors passed from OAuth callbacks
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlError = params.get("error");
      if (urlError) {
        setError(urlError);
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, [setError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);

    } catch (err: any) {
      // Error is set in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Branding Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Logo size="lg" className="mb-6" />
        <h2 className="text-3xl font-display font-semibold text-[#2D1B3D] tracking-tight">
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-[#2D1B3D]/60 font-body">
          Sign in to access your digital invitations and RSVPs
        </p>
      </div>

      {/* Main Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-[#E8C4B8]/30 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-xs font-medium border border-red-100">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-[#2D1B3D]/70 mb-2 font-body"
              >
                Email Address
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-[#2D1B3D]/40" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  className="block w-full pl-10 pr-3 py-2.5 bg-[#FAF8F5] border border-[#E8C4B8]/40 rounded-xl text-[#2D1B3D] placeholder-[#2D1B3D]/30 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C] text-sm transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-[#2D1B3D]/70 mb-2 font-body"
              >
                Password
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-[#2D1B3D]/40" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  className="block w-full pl-10 pr-10 py-2.5 bg-[#FAF8F5] border border-[#E8C4B8]/40 rounded-xl text-[#2D1B3D] placeholder-[#2D1B3D]/30 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C] text-sm transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#2D1B3D]/40 hover:text-[#2D1B3D]/70 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex items-center justify-end">
              <div className="text-sm">
                <Link
                  href="/reset-password"
                  className="font-medium text-[#C9A84C] hover:text-[#b08e3a] text-xs transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            {/* Divider: OR CONTINUE WITH */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-[#E8C4B8]/20"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-[#2D1B3D]/50 font-semibold tracking-wider font-body">
                  OR CONTINUE WITH
                </span>
              </div>
            </div>

            {/* Google Sign In Button */}
            <div>
              <button
                type="button"
                onClick={() => {
                  let apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
                  apiUrl = apiUrl.trim();
                  if (apiUrl.endsWith("/")) {
                    apiUrl = apiUrl.slice(0, -1);
                  }
                  if (!apiUrl.endsWith("/api")) {
                    apiUrl = `${apiUrl}/api`;
                  }
                  window.location.assign(`${apiUrl}/auth/google`);
                }}
                className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-[#E8C4B8]/40 rounded-xl bg-white hover:bg-[#FAF8F5] text-sm font-semibold text-[#2D1B3D] shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C9A84C]/50"
              >
                <svg className="w-5 h-5 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </button>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-[#2D1B3D] hover:bg-[#3d2a52] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2D1B3D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4 text-[#C9A84C]" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Create Account Footer Link */}
          <div className="mt-6 border-t border-[#E8C4B8]/20 pt-6 text-center">
            <p className="text-xs text-[#2D1B3D]/60 font-body">
              New to Eventizers?{" "}
              <Link
                href="/register"
                className="font-semibold text-[#2D1B3D] hover:text-[#C9A84C] ml-1 transition-colors"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
