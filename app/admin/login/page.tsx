"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../invitehub/context/AuthContext";
import { Sparkles, ArrowRight, Lock, Mail, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const { user, adminLogin, error, setError } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If admin is already logged in, redirect to admin dashboard
  useEffect(() => {
    if (user && user.role === "ADMIN") {
      router.push("/admin/dashboard");
    } else if (user) {
      // If regular user is logged in, redirect to user dashboard
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      await adminLogin(email, password);
      router.push("/admin/dashboard");
    } catch (err: any) {
      // Error is set in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Branding Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center flex flex-col items-center">
        <div className="flex items-center justify-center gap-4 flex-wrap mb-6">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-[#2D1B3D] flex items-center justify-center transition-transform group-hover:scale-105">
              <Sparkles className="w-5 h-5 text-[#C9A84C]" />
            </div>
            <span
              className="font-display text-2xl font-bold text-[#2D1B3D]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Eventizers
            </span>
          </Link>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/20 whitespace-nowrap">
            Admin Portal
          </span>
        </div>
        <h2 className="text-3xl font-display font-semibold text-[#2D1B3D] tracking-tight">
          Admin Sign In
        </h2>
        <p className="mt-2 text-sm text-[#2D1B3D]/60 font-body">
          Enter admin credentials to manage events across all users
        </p>
      </div>

      {/* Main Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-[#E8C4B8]/30 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-xs font-medium border border-red-100 animate-shake">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-[#2D1B3D]/70 mb-2 font-body"
              >
                Admin Email Address
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
                  placeholder="admin@eventizers.com"
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

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-[#2D1B3D] hover:bg-[#3d2a52] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2D1B3D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    Sign In as Admin
                    <ArrowRight className="w-4 h-4 text-[#C9A84C]" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* User Sign In Return Link */}
          <div className="mt-6 border-t border-[#E8C4B8]/20 pt-6 text-center">
            <p className="text-xs text-[#2D1B3D]/60 font-body">
              Are you an Event Organizer?{" "}
              <Link
                href="/login"
                className="font-semibold text-[#2D1B3D] hover:text-[#C9A84C] ml-1 transition-colors"
              >
                Sign In Here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
