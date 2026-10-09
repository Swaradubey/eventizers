import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function ProFooter() {
  return (
    <footer className="border-t border-white/10 bg-background px-4 pb-28 pt-14 sm:px-6 lg:pb-14">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.4fr_2fr]">
        <div>
          <Link href="/" aria-label="Eventizers home" className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-[10px] bg-primary text-primary-foreground">
              <Sparkles className="size-4" aria-hidden="true" />
            </span>
            <span className="font-display text-xl font-extrabold tracking-tight text-white">
              eventizers
            </span>
            <span className="rounded-full bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
              Pro
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-pretty text-[15px] leading-relaxed text-foreground/60">
            AI-powered invitations and event experiences — from the first idea to the final guest.
          </p>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-foreground/50">
              Create
            </h3>
            <ul className="mt-4 flex flex-col">
              <li>
                <Link
                  href="/#lab"
                  className="inline-flex min-h-11 items-center text-[15px] font-medium transition-colors hover:text-primary"
                >
                  AI Invitations
                </Link>
              </li>
              <li>
                <Link
                  href="/#video"
                  className="inline-flex min-h-11 items-center text-[15px] font-medium transition-colors hover:text-primary"
                >
                  Video Invites
                </Link>
              </li>
              <li>
                <Link
                  href="/#occasions"
                  className="inline-flex min-h-11 items-center text-[15px] font-medium transition-colors hover:text-primary"
                >
                  Events
                </Link>
              </li>
              <li>
                <Link
                  href="/#organizers"
                  className="inline-flex min-h-11 items-center text-[15px] font-medium transition-colors hover:text-primary"
                >
                  Ticketing
                </Link>
              </li>
              <li>
                <Link
                  href="/#organizers"
                  className="inline-flex min-h-11 items-center text-[15px] font-medium transition-colors hover:text-primary"
                >
                  For Organizers
                </Link>
              </li>
              <li>
                <Link
                  href="/pro"
                  className="inline-flex min-h-11 items-center text-[15px] font-medium transition-colors hover:text-primary text-primary"
                >
                  For Pros
                </Link>
              </li>
              <li>
                <Link
                  href="/pro/dashboard"
                  className="inline-flex min-h-11 items-center text-[15px] font-medium transition-colors hover:text-primary"
                >
                  Pro Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/#pricing"
                  className="inline-flex min-h-11 items-center text-[15px] font-medium transition-colors hover:text-primary"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-foreground/50">
              Company
            </h3>
            <ul className="mt-4 flex flex-col">
              <li>
                <Link
                  href="/privacy"
                  className="inline-flex min-h-11 items-center text-[15px] font-medium transition-colors hover:text-primary"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="inline-flex min-h-11 items-center text-[15px] font-medium transition-colors hover:text-primary"
                >
                  Terms
                </Link>
              </li>
              <li>
                <Link
                  href="/security"
                  className="inline-flex min-h-11 items-center text-[15px] font-medium transition-colors hover:text-primary"
                >
                  Security
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-foreground/50">
              Social
            </h3>
            <ul className="mt-4 flex flex-col">
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center text-[15px] font-medium transition-colors hover:text-primary"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center text-[15px] font-medium transition-colors hover:text-primary"
                >
                  TikTok
                </a>
              </li>
              <li>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center text-[15px] font-medium transition-colors hover:text-primary"
                >
                  YouTube
                </a>
              </li>
              <li>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center text-[15px] font-medium transition-colors hover:text-primary"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      <p className="mx-auto mt-12 max-w-6xl text-xs text-foreground/40">
        © 2026 Eventizers
      </p>
    </footer>
  );
}
