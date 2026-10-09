"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProAuth } from "@/context/ProAuthContext";
import { ArrowRight, Lock, Mail, Eye, EyeOff, Sparkles } from "lucide-react";
import Link from "next/link";
import "@/app/eventizers.css";

export default function ProLoginPage() {
  const { proUser, proLogin, error, setError } = useProAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If user is already logged in to Pro, redirect to pro dashboard
  useEffect(() => {
    if (proUser) {
      router.push("/pro/dashboard");
    }
  }, [proUser, router]);

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
      const loggedUser = await proLogin(email, password);
      if (loggedUser) {
        router.push("/pro/dashboard");
      }
    } catch (err: any) {
      // Error is set in ProAuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="eventizers-root min-h-[100dvh] flex flex-col justify-center py-4 sm:py-6 pb-6 sm:pb-8 px-4 sm:px-6 lg:px-8 overflow-y-auto relative">
      {/* Ambient background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl"
          style={{ background: "rgba(254,186,8,0.06)" }}
        />
        <div
          className="absolute top-40 right-20 w-80 h-80 rounded-full blur-3xl"
          style={{ background: "rgba(254,186,8,0.04)", animationDelay: "2s" }}
        />
        <div
          className="absolute bottom-20 left-1/3 w-64 h-64 rounded-full blur-3xl"
          style={{ background: "rgba(255,58,93,0.05)" }}
        />
      </div>

      <div className="w-full max-w-md mx-auto my-auto relative z-10">
        {/* Branding Header */}
        <div className="text-center">
          <Link
            href="/pro"
            className="inline-flex items-center gap-2 mb-4 sm:mb-5 justify-center"
          >
            <span className="grid size-10 place-items-center rounded-[12px] bg-primary text-primary-foreground shadow-lg">
              <Sparkles className="size-5" aria-hidden="true" />
            </span>
            <span className="font-display text-2xl font-extrabold tracking-tight text-foreground">
              eventizers
            </span>
            <span className="rounded-full bg-primary/20 text-primary border border-primary/30 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
              Pro
            </span>
          </Link>
          <h2 className="text-2xl sm:text-[26px] font-display font-semibold text-foreground tracking-tight">
            Welcome to Pro
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-foreground/55 font-body">
            Sign in to access your organizer dashboard
          </p>
        </div>

        {/* Main Card */}
        <div className="mt-4 sm:mt-5">
          <div
            className="p-5 sm:p-6 sm:px-8 shadow-2xl rounded-2xl border"
            style={{
              background: "rgba(18, 24, 29, 0.85)",
              borderColor: "rgba(254,186,8,0.15)",
              backdropFilter: "blur(16px)",
            }}
          >
            <form className="space-y-3 sm:space-y-3.5" onSubmit={handleSubmit}>
              {/* Error Message */}
              {error && (
                <div
                  className="p-2.5 rounded-lg text-xs font-medium border"
                  style={{
                    background: "rgba(255,58,93,0.1)",
                    color: "#ff3a5d",
                    borderColor: "rgba(255,58,93,0.2)",
                  }}
                >
                  {error}
                </div>
              )}

              {/* Email Field */}
              <div>
                <label
                  htmlFor="pro-email"
                  className="block text-xs font-semibold uppercase tracking-wider mb-1.5 font-body"
                  style={{ color: "rgba(245,245,242,0.6)" }}
                >
                  Email Address
                </label>
                <div className="relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4" style={{ color: "rgba(245,245,242,0.35)" }} />
                  </div>
                  <input
                    id="pro-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    className="block w-full pl-10 pr-3 py-2.5 sm:py-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-2"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(254,186,8,0.2)",
                      color: "#f5f5f2",
                      caretColor: "#feba08",
                    }}
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="pro-password"
                  className="block text-xs font-semibold uppercase tracking-wider mb-1.5 font-body"
                  style={{ color: "rgba(245,245,242,0.6)" }}
                >
                  Password
                </label>
                <div className="relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4" style={{ color: "rgba(245,245,242,0.35)" }} />
                  </div>
                  <input
                    id="pro-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    className="block w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-2"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(254,186,8,0.2)",
                      color: "#f5f5f2",
                      caretColor: "#feba08",
                    }}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors cursor-pointer"
                    style={{ color: "rgba(245,245,242,0.35)" }}
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
              <div className="flex items-center justify-end -mt-0.5">
                <div className="text-sm">
                  <Link
                    href="/reset-password"
                    className="font-medium text-primary hover:text-primary/80 hover:underline text-xs transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>

              {/* Terms & Agreement Checkbox */}
              <div className="my-1 sm:my-1.5 flex items-start gap-2">
                <input
                  id="proAgreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-600 cursor-pointer accent-[#feba08]"
                />
                <label
                  htmlFor="proAgreeToTerms"
                  className="text-xs cursor-pointer select-none leading-snug sm:leading-relaxed"
                  style={{ color: "rgba(245,245,242,0.5)" }}
                >
                  By signing in, you agree to our{" "}
                  <Link
                    href="/terms"
                    onClick={(e) => e.stopPropagation()}
                    className="text-primary hover:text-primary/80 hover:underline font-medium transition-colors"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    onClick={(e) => e.stopPropagation()}
                    className="text-primary hover:text-primary/80 hover:underline font-medium transition-colors"
                  >
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>

              {/* Divider: OR CONTINUE WITH */}
              <div className="relative my-2.5 sm:my-3">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full" style={{ borderTop: "1px solid rgba(254,186,8,0.12)" }}></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span
                    className="px-2 font-semibold tracking-wider font-body text-[11px] sm:text-xs"
                    style={{ background: "rgba(18, 24, 29, 0.85)", color: "rgba(245,245,242,0.4)" }}
                  >
                    OR CONTINUE WITH
                  </span>
                </div>
              </div>

              {/* Google Sign In Button */}
              <div>
                <button
                  type="button"
                  onClick={() => {
                    // Set pro flag before redirecting to Google OAuth
                    localStorage.setItem("proOAuthPending", "true");
                    sessionStorage.setItem("proOAuthPending", "true");
                    let apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
                    apiUrl = apiUrl.trim();
                    if (apiUrl.endsWith("/")) {
                      apiUrl = apiUrl.slice(0, -1);
                    }
                    if (!apiUrl.endsWith("/api")) {
                      apiUrl = `${apiUrl}/api`;
                    }
                    window.location.assign(`${apiUrl}/auth/google?redirect=/pro/dashboard`);
                  }}
                  className="w-full flex justify-center items-center gap-3 py-2.5 px-4 rounded-xl text-sm font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer"
                  style={{
                    border: "1px solid rgba(254,186,8,0.2)",
                    background: "rgba(255,255,255,0.05)",
                    color: "#f5f5f2",
                  }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
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
                  className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{
                    background: "linear-gradient(135deg, #feba08 0%, #e0a800 100%)",
                    color: "#080d11",
                    boxShadow: "0 4px 20px -4px rgba(254,186,8,0.4)",
                  }}
                >
                  {isSubmitting ? (
                    <span className="w-5 h-5 border-2 border-[#080d11] border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <span>Sign In to Pro</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Create Account Footer Link */}
            <div
              className="mt-3.5 sm:mt-4 pt-3.5 sm:pt-4 text-center"
              style={{ borderTop: "1px solid rgba(254,186,8,0.12)" }}
            >
              <p className="text-xs font-body" style={{ color: "rgba(245,245,242,0.5)" }}>
                New to Eventizers Pro?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-primary hover:text-primary/80 ml-1 transition-colors"
                >
                  Create Account
                </Link>
              </p>
            </div>

            {/* Individual login link */}
            <div className="mt-2 text-center">
              <p className="text-xs font-body" style={{ color: "rgba(245,245,242,0.4)" }}>
                Looking for individual dashboard?{" "}
                <Link
                  href="/login"
                  className="font-semibold transition-colors hover:underline"
                  style={{ color: "rgba(245,245,242,0.7)" }}
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
