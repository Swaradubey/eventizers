import React from "react";

export default function AiIllustration() {
  return (
    <div className="hiw-illustration-wrapper">
      <svg
        viewBox="0 0 340 195"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-sm select-none"
      >
        <defs>
          {/* Main Gold Ambient Background Gradient */}
          <linearGradient id="ai-bg-grad" x1="0" y1="0" x2="340" y2="195" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFDF7" />
            <stop offset="50%" stopColor="#FDF6E3" />
            <stop offset="100%" stopColor="#F5EA92" stopOpacity="0.3" />
          </linearGradient>

          {/* Glass Card Fill */}
          <linearGradient id="ai-glass-card" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FFFBF0" stopOpacity="0.75" />
          </linearGradient>

          {/* AI Gold Accent Gradient */}
          <linearGradient id="ai-gold-accent" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#E5C158" />
            <stop offset="50%" stopColor="#C9A84C" />
            <stop offset="100%" stopColor="#9A7B2C" />
          </linearGradient>

          {/* Glowing Line Gradient */}
          <linearGradient id="ai-glow-line" x1="0" y1="0" x2="340" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#E5C158" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#C9A84C" stopOpacity="0.2" />
          </linearGradient>

          {/* Soft Card Shadow */}
          <filter id="ai-shadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#C9A84C" floodOpacity="0.12" />
          </filter>

          <filter id="ai-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Viewport Box / Canvas */}
        <rect width="340" height="195" rx="16" fill="url(#ai-bg-grad)" stroke="rgba(201, 168, 76, 0.25)" strokeWidth="1" />

        {/* Ambient Glowing Orbs */}
        <circle cx="170" cy="35" r="45" fill="#E5C158" fillOpacity="0.15" filter="url(#ai-glow)" />
        <circle cx="50" cy="140" r="35" fill="#C9A84C" fillOpacity="0.08" filter="url(#ai-glow)" />

        {/* ─── AI Workflow Flow Lines ─── */}
        <path d="M 170 46 L 85 76" stroke="url(#ai-glow-line)" strokeWidth="1.5" strokeDasharray="3 3" className="animate-pulse" />
        <path d="M 170 46 L 250 76" stroke="url(#ai-glow-line)" strokeWidth="1.5" strokeDasharray="3 3" className="animate-pulse" />
        <path d="M 250 116 L 250 134" stroke="url(#ai-glow-line)" strokeWidth="1.5" strokeDasharray="2 2" />

        {/* ─── TOP AI PROMPT BAR ─── */}
        <g filter="url(#ai-shadow)">
          <rect x="18" y="14" width="304" height="32" rx="16" fill="url(#ai-glass-card)" stroke="rgba(201, 168, 76, 0.4)" strokeWidth="1" />
          
          {/* Sparkle Icon */}
          <path d="M 32 30 L 33.5 25.5 L 38 24 L 33.5 22.5 L 32 18 L 30.5 22.5 L 26 24 L 30.5 25.5 Z" fill="url(#ai-gold-accent)" />
          <path d="M 40 21 L 40.8 18.5 L 43 17.7 L 40.8 16.9 L 40 14.5 L 39.2 16.9 L 37 17.7 L 39.2 18.5 Z" fill="#E5C158" opacity="0.8" />

          {/* Prompt Text */}
          <text x="48" y="34" fill="#2D1B3D" fontSize="10.5" fontWeight="600" fontFamily="sans-serif">
            "Create a luxury gala invitation page & RSVP..."
          </text>

          {/* Generating Badge */}
          <rect x="242" y="20" width="72" height="20" rx="10" fill="url(#ai-gold-accent)" />
          <text x="278" y="33" fill="#FFFFFF" fontSize="8.5" fontWeight="700" textAnchor="middle" fontFamily="sans-serif" letterSpacing="0.4">
            ✨ AI BUILDS
          </text>
        </g>

        {/* ─── CARD 1 (LEFT): FLOATING INVITATION CARD ─── */}
        <g filter="url(#ai-shadow)" className="transition-transform duration-300 hover:translate-y-[-2px]">
          <rect x="18" y="58" width="134" height="122" rx="12" fill="url(#ai-glass-card)" stroke="rgba(201, 168, 76, 0.35)" strokeWidth="1" />
          
          {/* Card Top Image Header */}
          <rect x="24" y="64" width="122" height="42" rx="8" fill="linear-gradient(135deg, #2D1B3D 0%, #4A2E63 100%)" />
          <rect x="24" y="64" width="122" height="42" rx="8" fill="url(#ai-gold-accent)" opacity="0.15" />
          
          {/* Card Title & Accents inside top header */}
          <circle cx="85" cy="79" r="10" fill="#E5C158" opacity="0.25" />
          <path d="M 85 73 L 87 77 L 91 78 L 88 81 L 89 85 L 85 83 L 81 85 L 82 81 L 79 78 L 83 77 Z" fill="#E5C158" />
          <text x="85" y="98" fill="#FFFFFF" fontSize="8" fontWeight="700" textAnchor="middle" fontFamily="serif" letterSpacing="0.5">
            GRAND GALA 2026
          </text>

          {/* Event Details lines */}
          <text x="28" y="119" fill="#2D1B3D" fontSize="8" fontWeight="600" fontFamily="sans-serif">
            Saturday, Oct 24 • 7 PM
          </text>
          <text x="28" y="130" fill="rgba(45, 27, 61, 0.55)" fontSize="7" fontFamily="sans-serif">
            The Crystal Ballroom, NY
          </text>

          {/* One-click RSVP CTA preview */}
          <rect x="28" y="140" width="114" height="18" rx="6" fill="url(#ai-gold-accent)" />
          <text x="85" y="152" fill="#FFFFFF" fontSize="7.5" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">
            RSVP NOW →
          </text>
        </g>

        {/* ─── CARD 2 (RIGHT TOP): RSVP FORM PREVIEW ─── */}
        <g filter="url(#ai-shadow)">
          <rect x="162" y="58" width="160" height="64" rx="12" fill="url(#ai-glass-card)" stroke="rgba(201, 168, 76, 0.3)" strokeWidth="1" />
          
          <text x="172" y="73" fill="#C9A84C" fontSize="8" fontWeight="700" fontFamily="sans-serif" letterSpacing="0.5">
            ✓ RSVP FORM CREATED
          </text>

          {/* Form field item 1 */}
          <rect x="172" y="79" width="140" height="16" rx="5" fill="#FFFFFF" stroke="rgba(201, 168, 76, 0.25)" strokeWidth="1" />
          <circle cx="180" cy="87" r="4" fill="#C9A84C" />
          <text x="189" y="90" fill="#2D1B3D" fontSize="7" fontStyle="italic" fontFamily="sans-serif">
            Will attend? Yes (2 Guests)
          </text>

          {/* Form field item 2 */}
          <rect x="172" y="99" width="140" height="16" rx="5" fill="#FFFFFF" stroke="rgba(201, 168, 76, 0.25)" strokeWidth="1" />
          <rect x="177" y="103" width="8" height="8" rx="2" fill="#E5C158" />
          <text x="189" y="110" fill="#2D1B3D" fontSize="7" fontFamily="sans-serif">
            Dietary: Vegetarian Preference
          </text>
        </g>

        {/* ─── CARD 3 (RIGHT BOTTOM): REMINDER & CALENDAR SCHEDULE ─── */}
        <g filter="url(#ai-shadow)">
          <rect x="162" y="128" width="160" height="52" rx="12" fill="url(#ai-glass-card)" stroke="rgba(201, 168, 76, 0.3)" strokeWidth="1" />
          
          {/* Calendar/Clock Icon */}
          <rect x="172" y="136" width="24" height="24" rx="6" fill="#FDF6E3" stroke="#C9A84C" strokeWidth="1" />
          <path d="M 179 143 H 189 M 179 147 H 187 M 184 140 V 143 M 180 140 V 143" stroke="#C9A84C" strokeWidth="1.2" strokeLinecap="round" />

          <text x="202" y="146" fill="#2D1B3D" fontSize="8" fontWeight="700" fontFamily="sans-serif">
            Automated Reminders
          </text>
          <text x="202" y="156" fill="rgba(45, 27, 61, 0.6)" fontSize="7" fontFamily="sans-serif">
            Scheduled: 3 Days & 1 Day Prior
          </text>

          {/* Active indicator dot */}
          <rect x="296" y="136" width="18" height="12" rx="6" fill="rgba(122, 158, 126, 0.2)" />
          <circle cx="305" cy="142" r="3" fill="#5A8A5E" />
        </g>

        {/* Floating Sparkle Accents */}
        <g opacity="0.9">
          <path d="M 12 100 L 13 96 L 17 95 L 13 94 L 12 90 L 11 94 L 7 95 L 11 96 Z" fill="#E5C158" />
          <path d="M 326 100 L 327 97 L 330 96 L 327 95 L 326 92 L 325 95 L 322 96 L 325 97 Z" fill="#C9A84C" />
        </g>
      </svg>
    </div>
  );
}
