"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Send,
  ArrowRight,
  Twitter,
  Instagram,
  Linkedin,
  Facebook,
  Github,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";

const productLinks = [
  { label: "Invitations", href: "/features/invitations-rsvp" },
  { label: "Ticketing", href: "/features/ticketing" },
  { label: "Check-In", href: "/features/check-in" },
  { label: "Registries", href: "/features/registries" },
  { label: "Analytics", href: "/features/analytics" },
];

const solutionsLinks = [
  { label: "Weddings", href: "#" },
  { label: "Birthdays", href: "#" },
  { label: "Corporate", href: "#" },
  { label: "Nonprofits", href: "#" },
  { label: "Pricing", href: "#pricing" },
];

const companyLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Events", href: "/dashboard/events" },
  { label: "Guests", href: "/dashboard/guests" },
  { label: "Security", href: "/features/security-center" },
  { label: "Settings", href: "/dashboard/settings" },
];

const socialLinks = [
  { name: "Twitter", href: "https://twitter.com", icon: Twitter },
  { name: "Instagram", href: "https://instagram.com", icon: Instagram },
  { name: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
  { name: "Facebook", href: "https://facebook.com", icon: Facebook },
  { name: "GitHub", href: "https://github.com", icon: Github },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  const handleCreateEventClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      router.push("/dashboard/events?create=true");
    } else {
      router.push("/login");
    }
  };

  return (
    <footer className="relative bg-slate-50/80 overflow-hidden border-t border-slate-200/70 pt-16 pb-12 font-sans text-slate-600">
      {/* Soft Ambient Pastel Radial Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft Pink Wash */}
        <div
          className="absolute -top-24 -left-20 w-[450px] h-[450px] rounded-full blur-3xl opacity-40 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(244,114,182,0.35) 0%, rgba(244,114,182,0) 70%)",
          }}
        />
        {/* Soft Sky Blue Wash */}
        <div
          className="absolute top-1/4 -right-24 w-[500px] h-[500px] rounded-full blur-3xl opacity-45 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(56,189,248,0.35) 0%, rgba(56,189,248,0) 70%)",
          }}
        />
        {/* Soft Pastel Yellow Wash */}
        <div
          className="absolute -bottom-24 left-1/3 w-[450px] h-[450px] rounded-full blur-3xl opacity-35 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(253,224,71,0.35) 0%, rgba(253,224,71,0) 70%)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Top Header Section (2-Column Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12 border-b border-slate-200/80 items-start">
          {/* Top-Left (Brand) */}
          <div className="lg:col-span-6 space-y-3">
            <Logo size="lg" />
            <p className="text-sm leading-relaxed text-[#64748b] max-w-md">
              The AI-powered event operating system. Create, invite, manage and grow any event — all in one beautiful place.
            </p>
          </div>

          {/* Top-Right (Newsletter Subscription) */}
          <div className="lg:col-span-6 lg:flex lg:flex-col lg:items-end">
            <div className="w-full max-w-md">
              <h3 className="text-base font-semibold text-slate-900 mb-1">
                Join the celebration
              </h3>
              <p className="text-sm text-[#64748b] mb-4">
                Get product updates, event tips and templates in your inbox.
              </p>

              {subscribed ? (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
                  <span>✓</span>
                  <span>Thank you! You&apos;re subscribed to the celebration.</span>
                </div>
              ) : (
                <form
                  onSubmit={handleSubscribe}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="flex-1 px-4 py-2.5 rounded-full bg-white text-slate-800 text-sm placeholder-slate-400 border border-slate-200/90 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400 transition-all"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-sky-400 text-white text-sm font-semibold hover:opacity-95 shadow-md shadow-sky-500/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <span>Subscribe</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Middle Section (Navigation Links & CTA Card) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 py-12 border-b border-slate-200/80 items-start">
          {/* Product Column */}
          <div className="lg:col-span-2 space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Product
            </p>
            <ul className="space-y-2.5 text-sm">
              {productLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-[#64748b] hover:text-blue-600 transition-colors font-medium"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions Column */}
          <div className="lg:col-span-2 space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Solutions
            </p>
            <ul className="space-y-2.5 text-sm">
              {solutionsLinks.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-[#64748b] hover:text-blue-600 transition-colors font-medium"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div className="lg:col-span-2 space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Company
            </p>
            <ul className="space-y-2.5 text-sm">
              {companyLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-[#64748b] hover:text-blue-600 transition-colors font-medium"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Spacer / Grid alignment helper */}
          <div className="hidden lg:block lg:col-span-1" />

          {/* Right CTA Card */}
          <div className="md:col-span-2 lg:col-span-5">
            <div className="rounded-2xl shadow-md p-6 sm:p-7 bg-white border border-slate-100/90 hover:shadow-lg transition-shadow">
              <h4 className="text-xl font-bold text-slate-900 mb-1">
                Ready to start?
              </h4>
              <p className="text-sm text-[#64748b] mb-6">
                Your first event is free.
              </p>
              <button
                onClick={handleCreateEventClick}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 text-white font-semibold text-sm hover:opacity-95 shadow-md shadow-pink-500/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>Create Event</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#64748b]">
          {/* Left copyright */}
          <div className="order-2 md:order-1 text-center md:text-left">
            <p>© 2026 Eventizers. Create, Invite, Manage.</p>
          </div>

          {/* Center Social Media Icons */}
          <div className="order-1 md:order-2 flex items-center gap-2.5">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="w-9 h-9 rounded-full bg-slate-100/90 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors shadow-xs"
                >
                  <Icon className="w-4 h-4" />
                </a>
              );
            })}
          </div>

          {/* Right Links */}
          <div className="order-3 flex items-center gap-6 text-sm">
            <Link
              href="/privacy"
              className="text-[#64748b] hover:text-slate-900 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-[#64748b] hover:text-slate-900 transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
