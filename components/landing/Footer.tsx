"use client";

import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-background px-4 pb-28 pt-14 sm:px-6 lg:pb-14">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.4fr_2fr]">
        {/* Brand */}
        <div>
          <a href="#top" aria-label="Eventizers home" className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-[10px] bg-primary text-primary-foreground">
              <Sparkles className="size-4" aria-hidden="true" />
            </span>
            <span className="font-display text-xl font-extrabold tracking-tight text-white">
              eventizers
            </span>
          </a>
          <p className="mt-4 max-w-xs text-pretty text-[15px] leading-relaxed text-foreground/60">
            AI-powered invitations and event experiences — from the first idea to the final guest.
          </p>
        </div>

        {/* Links Navigation */}
        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-foreground/50">
              Create
            </h3>
            <ul className="mt-4 flex flex-col gap-1">
              <li>
                <a
                  href="#lab"
                  className="inline-flex min-h-9 items-center text-sm font-medium transition-colors text-white/70 hover:text-primary"
                >
                  AI Invitations
                </a>
              </li>
              <li>
                <a
                  href="#video"
                  className="inline-flex min-h-9 items-center text-sm font-medium transition-colors text-white/70 hover:text-primary"
                >
                  Video Invites
                </a>
              </li>
              <li>
                <a
                  href="#occasions"
                  className="inline-flex min-h-9 items-center text-sm font-medium transition-colors text-white/70 hover:text-primary"
                >
                  Events
                </a>
              </li>
              <li>
                <a
                  href="#organizers"
                  className="inline-flex min-h-9 items-center text-sm font-medium transition-colors text-white/70 hover:text-primary"
                >
                  Ticketing
                </a>
              </li>
              <li>
                <a
                  href="#organizers"
                  className="inline-flex min-h-9 items-center text-sm font-medium transition-colors text-white/70 hover:text-primary"
                >
                  For Organizers
                </a>
              </li>
              <li>
                <a
                  href="/pro"
                  className="inline-flex min-h-9 items-center text-sm font-medium transition-colors text-white/70 hover:text-primary"
                >
                  For Pros
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="inline-flex min-h-9 items-center text-sm font-medium transition-colors text-white/70 hover:text-primary"
                >
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-foreground/50">
              Platform
            </h3>
            <ul className="mt-4 flex flex-col gap-1">
              <li>
                <Link
                  href="/dashboard"
                  className="inline-flex min-h-9 items-center text-sm font-medium transition-colors text-white/70 hover:text-primary"
                >
                  Host Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="inline-flex min-h-9 items-center text-sm font-medium transition-colors text-white/70 hover:text-primary"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="inline-flex min-h-9 items-center text-sm font-medium transition-colors text-white/70 hover:text-primary"
                >
                  Register
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="inline-flex min-h-9 items-center text-sm font-medium transition-colors text-white/70 hover:text-primary"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="inline-flex min-h-9 items-center text-sm font-medium transition-colors text-white/70 hover:text-primary"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-foreground/50">
              Social
            </h3>
            <ul className="mt-4 flex flex-col gap-1">
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-9 items-center text-sm font-medium transition-colors text-white/70 hover:text-primary"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-9 items-center text-sm font-medium transition-colors text-white/70 hover:text-primary"
                >
                  TikTok
                </a>
              </li>
              <li>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-9 items-center text-sm font-medium transition-colors text-white/70 hover:text-primary"
                >
                  YouTube
                </a>
              </li>
              <li>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-9 items-center text-sm font-medium transition-colors text-white/70 hover:text-primary"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      <div className="mx-auto mt-12 flex max-w-6xl items-center justify-between border-t border-white/5 pt-6 text-xs text-foreground/40">
        <p>© 2026 Eventizers. All rights reserved.</p>
        <p>Crafted with AI &amp; Cinematic Motion</p>
      </div>
    </footer>
  );
}
