import React from "react";

export default function AnalyticsIllustration() {
  return (
    <div className="hiw-illustration-wrapper">
      <svg
        viewBox="0 0 340 195"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-full h-auto drop-shadow-sm select-none block"
        style={{ maxWidth: "100%", width: "100%", height: "auto" }}
      >
        <defs>
          {/* Main Purple Background Gradient */}
          <linearGradient id="an-bg-grad" x1="0" y1="0" x2="340" y2="195" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FAF8FE" />
            <stop offset="50%" stopColor="#F2EEF9" />
            <stop offset="100%" stopColor="#E0D5F0" stopOpacity="0.35" />
          </linearGradient>

          {/* Glass Card Fill */}
          <linearGradient id="an-glass-card" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#F5F0FC" stopOpacity="0.8" />
          </linearGradient>

          {/* Purple Gradient */}
          <linearGradient id="an-purple-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#A88AD4" />
            <stop offset="50%" stopColor="#9070C0" />
            <stop offset="100%" stopColor="#6A499C" />
          </linearGradient>

          {/* Area Chart Gradient */}
          <linearGradient id="an-chart-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9070C0" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#9070C0" stopOpacity="0.0" />
          </linearGradient>

          {/* Soft Shadow */}
          <filter id="an-shadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="6" stdDeviation="7" floodColor="#9070C0" floodOpacity="0.14" />
          </filter>

          <filter id="an-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Viewport Canvas */}
        <rect width="340" height="195" rx="16" fill="url(#an-bg-grad)" stroke="rgba(144, 112, 192, 0.25)" strokeWidth="1" />

        {/* Glow ambient background orbs */}
        <circle cx="90" cy="120" r="50" fill="#9070C0" fillOpacity="0.1" filter="url(#an-glow)" />
        <circle cx="260" cy="50" r="40" fill="#A88AD4" fillOpacity="0.1" filter="url(#an-glow)" />

        {/* ─── TOP DASHBOARD HEADER & KPI WIDGETS ─── */}
        <g filter="url(#an-shadow)">
          {/* KPI Widget 1: Total RSVPs */}
          <rect x="18" y="16" width="148" height="40" rx="10" fill="url(#an-glass-card)" stroke="rgba(144, 112, 192, 0.3)" strokeWidth="1" />
          <text x="28" y="30" fill="rgba(45, 27, 61, 0.6)" fontSize="7" fontWeight="700" fontFamily="sans-serif" letterSpacing="0.4">
            CONFIRMED RSVPS
          </text>
          <text x="28" y="48" fill="#2D1B3D" fontSize="13" fontWeight="800" fontFamily="sans-serif">
            184 / 200
          </text>
          {/* Badge: +24% */}
          <rect x="114" y="27" width="44" height="16" rx="8" fill="rgba(122, 158, 126, 0.2)" />
          <text x="136" y="38" fill="#4E7A52" fontSize="7" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">
            ↑ 92%
          </text>

          {/* KPI Widget 2: Event Check-in & Budget */}
          <rect x="174" y="16" width="148" height="40" rx="10" fill="url(#an-glass-card)" stroke="rgba(144, 112, 192, 0.3)" strokeWidth="1" />
          <text x="184" y="30" fill="rgba(45, 27, 61, 0.6)" fontSize="7" fontWeight="700" fontFamily="sans-serif" letterSpacing="0.4">
            LIVE QR CHECK-INS
          </text>
          <text x="184" y="48" fill="#2D1B3D" fontSize="13" fontWeight="800" fontFamily="sans-serif">
            142 Arrived
          </text>
          <circle cx="304" cy="36" r="4" fill="#5A8A5E" />
        </g>

        {/* ─── MIDDLE LEFT: RSVP ANALYTICS CHART ─── */}
        <g filter="url(#an-shadow)" className="transition-transform duration-300 hover:translate-y-[-2px]">
          <rect x="18" y="64" width="180" height="114" rx="12" fill="url(#an-glass-card)" stroke="rgba(144, 112, 192, 0.3)" strokeWidth="1" />
          
          <text x="28" y="79" fill="#2D1B3D" fontSize="8.5" fontWeight="700" fontFamily="sans-serif">
            RSVP Velocity
          </text>
          <text x="145" y="79" fill="#9070C0" fontSize="7" fontWeight="700" fontFamily="sans-serif">
            Live Analytics
          </text>

          {/* Grid lines */}
          <line x1="28" y1="95" x2="188" y2="95" stroke="rgba(144, 112, 192, 0.12)" strokeDasharray="2 2" />
          <line x1="28" y1="120" x2="188" y2="120" stroke="rgba(144, 112, 192, 0.12)" strokeDasharray="2 2" />
          <line x1="28" y1="145" x2="188" y2="145" stroke="rgba(144, 112, 192, 0.12)" strokeDasharray="2 2" />

          {/* Area under chart */}
          <path
            d="M 28 150 L 28 140 C 45 135, 60 145, 80 125 C 100 105, 120 120, 140 98 C 160 76, 175 88, 188 82 L 188 150 Z"
            fill="url(#an-chart-area)"
          />

          {/* Chart smooth line */}
          <path
            d="M 28 140 C 45 135, 60 145, 80 125 C 100 105, 120 120, 140 98 C 160 76, 175 88, 188 82"
            stroke="url(#an-purple-grad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Data point dots with pulsing glow */}
          <circle cx="80" cy="125" r="3.5" fill="#FFFFFF" stroke="#9070C0" strokeWidth="2" />
          <circle cx="140" cy="98" r="3.5" fill="#FFFFFF" stroke="#9070C0" strokeWidth="2" />
          <circle cx="188" cy="82" r="4" fill="#9070C0" />

          {/* Peak Tooltip Pill */}
          <rect x="110" y="80" width="60" height="15" rx="4" fill="#2D1B3D" />
          <text x="140" y="90" fill="#FFFFFF" fontSize="6.5" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">
            +48 RSVPs
          </text>
        </g>

        {/* ─── MIDDLE RIGHT PANEL 1: QR CHECK-IN SCANNER ─── */}
        <g filter="url(#an-shadow)">
          <rect x="206" y="64" width="116" height="54" rx="10" fill="url(#an-glass-card)" stroke="rgba(144, 112, 192, 0.3)" strokeWidth="1" />
          
          {/* QR Code vector illustration */}
          <rect x="214" y="72" width="38" height="38" rx="6" fill="#FFFFFF" stroke="rgba(144, 112, 192, 0.3)" strokeWidth="1" />
          
          {/* QR finder patterns */}
          <rect x="218" y="76" width="10" height="10" fill="#2D1B3D" />
          <rect x="220" y="78" width="6" height="6" fill="#FFFFFF" />
          <rect x="221.5" y="79.5" width="3" height="3" fill="#2D1B3D" />

          <rect x="238" y="76" width="10" height="10" fill="#2D1B3D" />
          <rect x="240" y="78" width="6" height="6" fill="#FFFFFF" />
          <rect x="241.5" y="79.5" width="3" height="3" fill="#2D1B3D" />

          <rect x="218" y="96" width="10" height="10" fill="#2D1B3D" />
          <rect x="220" y="98" width="6" height="6" fill="#FFFFFF" />
          <rect x="221.5" y="99.5" width="3" height="3" fill="#2D1B3D" />

          {/* QR data bits */}
          <rect x="234" y="90" width="4" height="4" fill="#9070C0" />
          <rect x="242" y="94" width="4" height="4" fill="#2D1B3D" />
          <rect x="230" y="98" width="4" height="4" fill="#9070C0" />

          {/* Scan Line */}
          <line x1="214" y1="91" x2="252" y2="91" stroke="#5A8A5E" strokeWidth="1.5" strokeDasharray="1 1" />

          <text x="258" y="84" fill="#2D1B3D" fontSize="8" fontWeight="700" fontFamily="sans-serif">
            QR Check-In
          </text>
          
          <rect x="258" y="90" width="58" height="15" rx="4" fill="rgba(122, 158, 126, 0.2)" />
          <text x="287" y="100" fill="#4E7A52" fontSize="6.5" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">
            ✓ Verified
          </text>
        </g>

        {/* ─── MIDDLE RIGHT PANEL 2: SEATING & GUEST LIST ─── */}
        <g filter="url(#an-shadow)">
          <rect x="206" y="124" width="116" height="54" rx="10" fill="url(#an-glass-card)" stroke="rgba(144, 112, 192, 0.3)" strokeWidth="1" />
          
          <text x="216" y="138" fill="#2D1B3D" fontSize="7.5" fontWeight="700" fontFamily="sans-serif">
            Seating & Guests
          </text>

          {/* Guest 1 */}
          <circle cx="221" cy="149" r="5" fill="#9070C0" />
          <text x="221" y="151.5" fill="#FFFFFF" fontSize="5.5" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">
            M
          </text>
          <text x="230" y="151" fill="#2D1B3D" fontSize="7" fontWeight="600" fontFamily="sans-serif">
            Marcus V. (Table 4)
          </text>

          {/* Guest 2 */}
          <circle cx="221" cy="164" r="5" fill="#5A8A5E" />
          <text x="221" y="166.5" fill="#FFFFFF" fontSize="5.5" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">
            E
          </text>
          <text x="230" y="166" fill="#2D1B3D" fontSize="7" fontWeight="600" fontFamily="sans-serif">
            Emma R. (VIP)
          </text>
        </g>

        {/* Floating Sparkles */}
        <g opacity="0.8">
          <path d="M 12 50 L 13 46 L 17 45 L 13 44 L 12 40 L 11 44 L 7 45 L 11 46 Z" fill="#9070C0" />
          <path d="M 326 140 L 327 137 L 330 136 L 327 135 L 326 132 L 325 135 L 322 136 L 325 137 Z" fill="#A88AD4" />
        </g>
      </svg>
    </div>
  );
}
