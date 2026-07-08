"use client";

import { useState } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

const footerLinks = {
  Product: ["Invitations", "Ticketing", "Check-In", "Registries", "Analytics"],
  Solutions: ["Weddings", "Birthdays", "Corporate", "Nonprofits", "Pricing"],
  Company: ["About", "Blog", "Careers", "Security", "Settings"],
};

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <>
      {/* CTA banner */}
      <section className="py-24 bg-[#2D1B3D] relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 60% 50%, rgba(201,168,76,0.12) 0%, transparent 70%)",
          }}
        />
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 mb-8">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
            <span className="text-xs font-medium text-white/70">Your first event is free</span>
          </div>
          <h2
            className="font-display text-4xl md:text-5xl font-bold text-[#FAF8F5] mb-5 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Ready to create your{" "}
            <span className="italic text-[#E8C4B8]">first event?</span>
          </h2>
          <p className="text-[#FAF8F5]/60 text-lg mb-10">
            Join thousands of hosts creating unforgettable events with AI — in under 60 seconds.
          </p>
          <a
            href="#hero-form"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#C9A84C] text-[#2D1B3D] text-sm font-bold hover:bg-[#E8D08A] transition-all active:scale-95"
          >
            Create Event
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A1118] text-[#FAF8F5]/60 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
            {/* Brand */}
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-[#2D1B3D] flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
                </div>
                <span
                  className="font-display text-base font-semibold text-[#FAF8F5]"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Eventizers
                </span>
              </div>
              <p className="text-sm leading-relaxed mb-5 max-w-xs">
                The AI-powered event operating system. Create, invite, manage and grow any event — all in one beautiful place.
              </p>

              {/* Newsletter */}
              <p className="text-xs font-semibold uppercase tracking-wider text-[#FAF8F5]/40 mb-2">
                Join the celebration
              </p>
              <p className="text-xs mb-3">Get product updates, event tips and templates in your inbox.</p>
              {subscribed ? (
                <p className="text-xs text-[#7A9E7E]">✓ You&apos;re subscribed!</p>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="flex-1 px-3 py-2 rounded-lg bg-[#2D1B3D] text-[#FAF8F5] text-sm placeholder-[#FAF8F5]/30 border border-white/10 focus:outline-none focus:border-[#C9A84C]/50"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#C9A84C] text-[#2D1B3D] text-sm font-medium hover:bg-[#E8D08A] transition-colors"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>

            {/* Links */}
            {Object.entries(footerLinks).map(([group, links]) => (
              <div key={group}>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#FAF8F5]/40 mb-4">
                  {group}
                </p>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm hover:text-[#FAF8F5] transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-sm">© 2026 Eventizers. Create, Invite, Manage.</p>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className="hover:text-[#FAF8F5] transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-[#FAF8F5] transition-colors">Terms</Link>
              <Link href="/cookies" className="hover:text-[#FAF8F5] transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
