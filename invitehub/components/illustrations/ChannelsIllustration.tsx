import React from "react";

export default function ChannelsIllustration() {
  return (
    <div className="hiw-illustration-wrapper">
      <svg
        viewBox="0 0 340 195"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-sm select-none"
      >
        <defs>
          {/* Main Emerald Background Gradient */}
          <linearGradient id="ch-bg-grad" x1="0" y1="0" x2="340" y2="195" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F9FCF9" />
            <stop offset="50%" stopColor="#EEF5EE" />
            <stop offset="100%" stopColor="#D4E8D4" stopOpacity="0.35" />
          </linearGradient>

          {/* Glass Card Fill */}
          <linearGradient id="ch-glass-card" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#F2F8F2" stopOpacity="0.8" />
          </linearGradient>

          {/* Emerald Gradient */}
          <linearGradient id="ch-emerald-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8EAF92" />
            <stop offset="50%" stopColor="#7A9E7E" />
            <stop offset="100%" stopColor="#5A7D5E" />
          </linearGradient>

          {/* WhatsApp Green Gradient */}
          <linearGradient id="ch-wa-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#25D366" />
            <stop offset="100%" stopColor="#128C7E" />
          </linearGradient>

          {/* Connected Flow Line Gradient */}
          <linearGradient id="ch-flow-line" x1="0" y1="0" x2="340" y2="195" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7A9E7E" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#5A8A5E" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#7A9E7E" stopOpacity="0.2" />
          </linearGradient>

          {/* Soft Shadow */}
          <filter id="ch-shadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="6" stdDeviation="7" floodColor="#7A9E7E" floodOpacity="0.14" />
          </filter>

          <filter id="ch-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Viewport Canvas */}
        <rect width="340" height="195" rx="16" fill="url(#ch-bg-grad)" stroke="rgba(122, 158, 126, 0.25)" strokeWidth="1" />

        {/* Glow ambient circles */}
        <circle cx="170" cy="98" r="50" fill="#7A9E7E" fillOpacity="0.12" filter="url(#ch-glow)" />

        {/* ─── CONNECTED CHANNEL FLOW LINES ─── */}
        <g stroke="url(#ch-flow-line)" strokeWidth="1.5" strokeDasharray="3 3">
          <path d="M 170 98 L 75 44" />
          <path d="M 170 98 L 265 44" />
          <path d="M 170 98 L 75 152" />
          <path d="M 170 98 L 265 152" />
        </g>

        {/* Animated pulse dots on lines */}
        <circle cx="122" cy="71" r="3" fill="#5A8A5E" />
        <circle cx="218" cy="71" r="3" fill="#5A8A5E" />
        <circle cx="122" cy="125" r="3" fill="#5A8A5E" />
        <circle cx="218" cy="125" r="3" fill="#5A8A5E" />

        {/* ─── CENTRAL COMMUNICATION HUB ─── */}
        <g filter="url(#ch-shadow)">
          {/* Hub outer glass ring */}
          <circle cx="170" cy="98" r="32" fill="url(#ch-glass-card)" stroke="rgba(122, 158, 126, 0.4)" strokeWidth="1.5" />
          <circle cx="170" cy="98" r="24" fill="url(#ch-emerald-grad)" />

          {/* Signal / Broadcast Paper Plane Icon */}
          <path d="M 163 98 L 178 89 L 172 107 L 168 100 L 163 98 Z" fill="#FFFFFF" />
          <path d="M 168 100 L 178 89 L 172 101 Z" fill="rgba(255, 255, 255, 0.7)" />

          {/* Hub Label Badge */}
          <rect x="130" y="134" width="80" height="18" rx="9" fill="url(#ch-glass-card)" stroke="rgba(122, 158, 126, 0.3)" />
          <text x="170" y="146" fill="#4E7A52" fontSize="7.5" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">
            SMART DISPATCH
          </text>
        </g>

        {/* ─── CHANNEL CARD 1 (TOP LEFT): EMAIL ─── */}
        <g filter="url(#ch-shadow)" className="transition-transform duration-300 hover:translate-y-[-2px]">
          <rect x="18" y="18" width="118" height="52" rx="10" fill="url(#ch-glass-card)" stroke="rgba(122, 158, 126, 0.3)" strokeWidth="1" />
          
          {/* Envelope Icon */}
          <rect x="26" y="26" width="24" height="24" rx="6" fill="#EEF4EE" stroke="#7A9E7E" strokeWidth="1" />
          <path d="M 31 33 L 38 38 L 45 33 M 31 43 H 45 V 33 H 31 V 43 Z" stroke="#5A8A5E" strokeWidth="1.2" strokeLinejoin="round" fill="none" />

          <text x="56" y="36" fill="#2D1B3D" fontSize="8" fontWeight="700" fontFamily="sans-serif">
            Email Invites
          </text>
          <text x="56" y="47" fill="#5A8A5E" fontSize="7" fontWeight="600" fontFamily="sans-serif">
            ✓ 100% Delivered
          </text>
          
          {/* Status Badge */}
          <circle cx="123" cy="24" r="5" fill="#5A8A5E" stroke="#FFFFFF" strokeWidth="1.5" />
        </g>

        {/* ─── CHANNEL CARD 2 (TOP RIGHT): WHATSAPP ─── */}
        <g filter="url(#ch-shadow)" className="transition-transform duration-300 hover:translate-y-[-2px]">
          <rect x="204" y="18" width="118" height="52" rx="10" fill="url(#ch-glass-card)" stroke="rgba(122, 158, 126, 0.3)" strokeWidth="1" />
          
          {/* WhatsApp Icon */}
          <rect x="212" y="26" width="24" height="24" rx="6" fill="url(#ch-wa-grad)" />
          <path d="M 224 32 C 220.7 32 218 34.7 218 38 C 218 39.1 218.3 40.1 218.8 41 L 218 44 L 221.1 43.2 C 222 43.7 223 44 224 44 C 227.3 44 230 41.3 230 38 C 230 34.7 227.3 32 224 32 Z" fill="#FFFFFF" />

          <text x="242" y="36" fill="#2D1B3D" fontSize="8" fontWeight="700" fontFamily="sans-serif">
            WhatsApp
          </text>
          <text x="242" y="47" fill="#128C7E" fontSize="7" fontWeight="600" fontFamily="sans-serif">
            ✓ Read Receipts
          </text>

          {/* Double tick icon */}
          <path d="M 307 24 L 310 27 L 315 22 M 311 27 L 316 22" stroke="#128C7E" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* ─── CHANNEL CARD 3 (BOTTOM LEFT): SMS ─── */}
        <g filter="url(#ch-shadow)" className="transition-transform duration-300 hover:translate-y-[-2px]">
          <rect x="18" y="125" width="118" height="52" rx="10" fill="url(#ch-glass-card)" stroke="rgba(122, 158, 126, 0.3)" strokeWidth="1" />
          
          {/* SMS / Mobile Icon */}
          <rect x="26" y="133" width="24" height="24" rx="6" fill="#EEF4EE" stroke="#7A9E7E" strokeWidth="1" />
          <rect x="33" y="137" width="10" height="16" rx="2" stroke="#5A8A5E" strokeWidth="1.2" fill="none" />
          <circle cx="38" cy="149" r="1" fill="#5A8A5E" />

          <text x="56" y="143" fill="#2D1B3D" fontSize="8" fontWeight="700" fontFamily="sans-serif">
            SMS Alerts
          </text>
          <text x="56" y="154" fill="#5A8A5E" fontSize="7" fontWeight="600" fontFamily="sans-serif">
            ⚡ Instant Blast
          </text>
        </g>

        {/* ─── CHANNEL CARD 4 (BOTTOM RIGHT): PUSH & SOCIAL ─── */}
        <g filter="url(#ch-shadow)" className="transition-transform duration-300 hover:translate-y-[-2px]">
          <rect x="204" y="125" width="118" height="52" rx="10" fill="url(#ch-glass-card)" stroke="rgba(122, 158, 126, 0.3)" strokeWidth="1" />
          
          {/* Bell Push Notification Icon */}
          <rect x="212" y="133" width="24" height="24" rx="6" fill="#EEF4EE" stroke="#7A9E7E" strokeWidth="1" />
          <path d="M 224 138 C 221.8 138 220 139.8 220 142 V 146 L 218 148 H 230 L 228 146 V 142 C 228 139.8 226.2 138 224 138 Z M 222.5 149 C 222.5 149.8 223.2 150.5 224 150.5 C 224.8 150.5 225.5 149.8 225.5 149 Z" fill="#5A8A5E" />

          <text x="242" y="143" fill="#2D1B3D" fontSize="8" fontWeight="700" fontFamily="sans-serif">
            Push & Social
          </text>
          <text x="242" y="154" fill="#5A8A5E" fontSize="7" fontWeight="600" fontFamily="sans-serif">
            🌐 Live Sync
          </text>
        </g>

        {/* ─── FLOATING PERSONALIZED MESSAGE BUBBLE (BOTTOM CENTER) ─── */}
        <g filter="url(#ch-shadow)">
          <rect x="55" y="166" width="230" height="22" rx="11" fill="url(#ch-glass-card)" stroke="rgba(122, 158, 126, 0.4)" strokeWidth="1" />
          
          {/* Avatar icon */}
          <circle cx="68" cy="177" r="6" fill="#7A9E7E" />
          <text x="68" y="179.5" fill="#FFFFFF" fontSize="6.5" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">
            A
          </text>

          <text x="80" y="180" fill="#2D1B3D" fontSize="7.5" fontWeight="600" fontFamily="sans-serif">
            "Hi Alex! You're invited to Sarah's Birthday"
          </text>

          {/* 1-Click RSVP Button Badge */}
          <rect x="228" y="169" width="50" height="16" rx="8" fill="url(#ch-emerald-grad)" />
          <text x="253" y="180" fill="#FFFFFF" fontSize="7" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">
            1-Click RSVP
          </text>
        </g>
      </svg>
    </div>
  );
}
