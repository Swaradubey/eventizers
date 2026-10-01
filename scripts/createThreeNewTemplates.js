const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const templatesAssetDir = path.join(publicDir, 'assets', 'templates');
const invitehubTemplatesAssetDir = path.join(__dirname, '..', 'invitehub', 'public', 'assets', 'templates');

// Helper to generate pine needle paths
function generatePineBranch(cx, cy, scale = 1, angle = 0, color = "#2B472E") {
  return `<g transform="translate(${cx}, ${cy}) rotate(${angle}) scale(${scale})">
    <path d="M 0,0 Q 20,40 10,90 Q 0,130 15,180" stroke="#4A3423" stroke-width="3" fill="none" stroke-linecap="round"/>
    <!-- needles left -->
    <path d="M 2,20 L -25,10 M 4,35 L -30,22 M 6,55 L -32,40 M 8,75 L -34,60 M 10,95 L -30,82 M 10,115 L -26,105 M 12,135 L -22,128 M 14,155 L -18,150" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
    <!-- needles right -->
    <path d="M 2,15 L 28,8 M 5,30 L 32,20 M 7,50 L 34,38 M 9,70 L 32,58 M 10,90 L 30,78 M 11,110 L 28,100 M 13,130 L 24,122 M 14,150 L 20,145" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
  </g>`;
}

// -----------------------------------------------------------------------------
// 1. O TANNENBAUM
// -----------------------------------------------------------------------------
const oTannenbaumMockupSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="100%" height="100%">
  <defs>
    <!-- Warm Flatlay Backdrop -->
    <linearGradient id="ot-backdrop-base" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FAF7F2"/>
      <stop offset="50%" stop-color="#F4EFE6"/>
      <stop offset="100%" stop-color="#EAE3D6"/>
    </linearGradient>

    <!-- Linen Texture for envelope -->
    <linearGradient id="ot-env-body" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#EBE3D3"/>
      <stop offset="50%" stop-color="#DFD5C2"/>
      <stop offset="100%" stop-color="#D2C7B3"/>
    </linearGradient>

    <linearGradient id="ot-env-flap" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E5DC Flora"/>
      <stop offset="50%" stop-color="#D8CD Flor"/>
      <stop offset="100%" stop-color="#C8BCA6"/>
    </linearGradient>

    <!-- Metallic Gold Foil Gradient -->
    <linearGradient id="ot-gold-foil" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#A67C1E"/>
      <stop offset="18%" stop-color="#D4AF37"/>
      <stop offset="36%" stop-color="#FFF2A1"/>
      <stop offset="54%" stop-color="#D4AF37"/>
      <stop offset="72%" stop-color="#AA771C"/>
      <stop offset="88%" stop-color="#FDF4B8"/>
      <stop offset="100%" stop-color="#8E6516"/>
    </linearGradient>

    <!-- Satin Ornament Ball Gradient -->
    <radialGradient id="ot-ornament-grad" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="35%" stop-color="#F7EFE3"/>
      <stop offset="70%" stop-color="#E5D6C1"/>
      <stop offset="100%" stop-color="#CBB9A0"/>
    </radialGradient>

    <!-- Fairy Light Glow -->
    <filter id="ot-light-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="glow"/>
      <feMerge>
        <feMergeNode in="glow"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- Shadows -->
    <filter id="ot-env-shadow" x="-30%" y="-20%" width="160%" height="150%">
      <feDropShadow dx="-6" dy="16" stdDeviation="16" flood-color="#000000" flood-opacity="0.28"/>
      <feDropShadow dx="-1" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.14"/>
    </filter>

    <filter id="ot-card-shadow" x="-30%" y="-20%" width="160%" height="150%">
      <feDropShadow dx="2" dy="18" stdDeviation="18" flood-color="#000000" flood-opacity="0.38"/>
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.18"/>
    </filter>

    <clipPath id="ot-card-clip">
      <rect x="150" y="140" width="370" height="520" rx="14"/>
    </clipPath>
  </defs>

  <!-- 1. BACKDROP: Elegant festive flatlay surface -->
  <rect width="600" height="800" fill="url(#ot-backdrop-base)"/>

  <!-- Flatlay Decor: Silk champagne ribbon flowing on left -->
  <g fill="none" stroke="#DECBC0" opacity="0.85">
    <path d="M 20,-20 Q 90,80 50,180 Q 20,260 65,340" stroke-width="38" stroke-linecap="round"/>
    <path d="M 18,-20 Q 88,80 48,180 Q 18,260 63,340" stroke="#F1E6DF" stroke-width="32" stroke-linecap="round"/>
  </g>

  <!-- Flatlay Decor: Natural Pine Branch Top Right -->
  <g transform="translate(460, -20) rotate(55)">
    <path d="M 0,0 Q 40,60 70,140 Q 90,200 110,260" stroke="#5C3E28" stroke-width="4" fill="none"/>
    <path d="M 20,40 L -15,25 M 35,65 L -2,45 M 50,90 L 15,70 M 65,120 L 30,95 M 80,150 L 45,125 M 95,185 L 60,160 M 105,220 L 75,195" stroke="#2D4C31" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M 20,35 L 55,20 M 35,55 L 72,40 M 50,80 L 88,62 M 65,110 L 105,90 M 80,140 L 118,120 M 95,175 L 132,152 M 105,210 L 140,188" stroke="#3A5F3E" stroke-width="2.5" stroke-linecap="round"/>
  </g>

  <!-- Flatlay Decor: Pearlescent Champagne Ornament Ball Bottom Left -->
  <g transform="translate(70, 740)">
    <circle cx="0" cy="0" r="76" fill="url(#ot-ornament-grad)"/>
    <ellipse cx="-20" cy="-22" rx="14" ry="7" fill="#FFFFFF" opacity="0.6" transform="rotate(-30, -20, -22)"/>
    <!-- Metal cap -->
    <rect x="-10" y="-84" width="20" height="12" rx="2" fill="#D4AF37"/>
  </g>

  <!-- 2. ENVELOPE: Sand / Beige Textured Envelope with Open Gold Foil Liner behind on Left -->
  <g filter="url(#ot-env-shadow)">
    <!-- Envelope Pocket Body (Behind Card on the left) -->
    <rect x="70" y="210" width="410" height="470" rx="16" fill="url(#ot-env-body)"/>

    <!-- Open Triangular Flap Pointing UP-LEFT -->
    <path d="M 70,290 L 135,115 L 360,290 Z" fill="url(#ot-env-body)"/>

    <!-- Inner Throat Metallic Gold Foil Lining -->
    <path d="M 90,285 L 142,135 L 338,285 Z" fill="url(#ot-gold-foil)"/>

    <!-- Foil Specular Highlight -->
    <path d="M 90,285 L 142,135 L 338,285 Z" fill="url(#ot-gold-foil)" opacity="0.9"/>
    <line x1="70" y1="290" x2="360" y2="290" stroke="#000000" stroke-width="2" opacity="0.25"/>
  </g>

  <!-- 3. INVITATION CARD: Dark Charcoal (#181B1A) + Illustrated Pine Tree with Fairy Lights -->
  <g filter="url(#ot-card-shadow)">
    <g clip-path="url(#ot-card-clip)">
      <!-- Card background: Deep rich charcoal -->
      <rect x="150" y="140" width="370" height="520" rx="14" fill="#1C1F1E"/>
      <!-- Soft vignette / paper grain -->
      <radialGradient id="ot-card-vig" cx="50%" cy="50%" r="70%">
        <stop offset="40%" stop-color="#252A28" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#121413" stop-opacity="0.75"/>
      </radialGradient>
      <rect x="150" y="140" width="370" height="520" fill="url(#ot-card-vig)"/>

      <!-- ILLUSTRATED PINE CHRISTMAS TREE ON THE LEFT -->
      <g id="pine-tree-illustration">
        <!-- Tree Trunk -->
        <path d="M 238,620 L 244,480 L 248,620 Z" fill="#2E1F14"/>

        <!-- Tier 5 (Base) -->
        <path d="M 180,590 Q 242,560 305,590 Q 285,550 290,520 Q 242,500 195,520 Q 198,555 180,590 Z" fill="#1E3322"/>
        <path d="M 185,585 Q 242,555 300,585 Q 275,545 285,525 Q 242,505 200,525 Z" fill="#28442D"/>

        <!-- Tier 4 -->
        <path d="M 190,525 Q 242,495 295,525 Q 275,485 280,455 Q 242,435 202,455 Q 206,490 190,525 Z" fill="#203824"/>
        <path d="M 195,520 Q 242,490 290,520 Q 268,480 275,460 Q 242,440 208,460 Z" fill="#2B4931"/>

        <!-- Tier 3 -->
        <path d="M 200,460 Q 242,435 285,460 Q 268,425 272,395 Q 242,375 210,395 Q 214,430 200,460 Z" fill="#243F29"/>
        <path d="M 205,455 Q 242,430 280,455 Q 260,420 268,400 Q 242,380 215,400 Z" fill="#325638"/>

        <!-- Tier 2 -->
        <path d="M 212,400 Q 242,380 274,400 Q 260,365 264,340 Q 242,320 220,340 Q 222,370 212,400 Z" fill="#28462E"/>
        <path d="M 216,395 Q 242,375 270,395 Q 254,360 260,345 Q 242,325 224,345 Z" fill="#38603F"/>

        <!-- Tier 1 (Top Tip) -->
        <path d="M 224,345 Q 242,325 262,345 Q 252,300 243,260 Q 234,300 224,345 Z" fill="#2C4E33"/>
        <path d="M 228,340 Q 242,320 258,340 Q 250,295 243,262 Q 236,295 228,340 Z" fill="#3E6B46"/>

        <!-- Detailed Pine Needle Tufts on Tree -->
        <g stroke="#487850" stroke-width="1.3" stroke-linecap="round" fill="none">
          <path d="M 235,275 L 228,285 M 245,278 L 253,288 M 240,290 L 232,302 M 248,295 L 258,306"/>
          <path d="M 225,320 L 214,332 M 242,325 L 243,338 M 260,322 L 272,335 M 234,335 L 224,348"/>
          <path d="M 215,370 L 202,385 M 235,375 L 234,390 M 255,372 L 268,388 M 275,375 L 288,392"/>
          <path d="M 205,425 L 190,442 M 228,430 L 226,448 M 255,428 L 265,446 M 282,430 L 296,448"/>
          <path d="M 195,485 L 178,505 M 220,490 L 216,510 M 250,488 L 258,508 M 285,490 L 302,510"/>
          <path d="M 185,550 L 168,572 M 215,555 L 210,578 M 248,552 L 254,575 M 288,554 L 308,576"/>
        </g>

        <!-- WARM FAIRY LIGHTS STRING & GLOWING BULBS -->
        <!-- Subtle warm string path winding down tree -->
        <path d="M 242,268 Q 230,295 252,320 Q 220,350 265,385 Q 210,420 275,465 Q 200,505 285,555 Q 190,580 295,600" fill="none" stroke="#B38E46" stroke-width="0.8" opacity="0.65"/>

        <!-- Warm Glowing Fairy Light Bulbs -->
        <g filter="url(#ot-light-glow)">
          <circle cx="242" cy="270" r="3.2" fill="#FFF9E6"/>
          <circle cx="232" cy="295" r="2.8" fill="#FFEAA8"/>
          <circle cx="250" cy="318" r="3.4" fill="#FFFBEB"/>
          <circle cx="228" cy="342" r="3" fill="#FFEAA8"/>
          <circle cx="260" cy="365" r="3.5" fill="#FFF5C2"/>
          <circle cx="240" cy="375" r="2.6" fill="#FFFBEB"/>
          <circle cx="220" cy="405" r="3.2" fill="#FFEAA8"/>
          <circle cx="252" cy="415" r="3.6" fill="#FFF9E6"/>
          <circle cx="268" cy="435" r="2.8" fill="#FFEAA8"/>
          <circle cx="212" cy="445" r="3.4" fill="#FFF5C2"/>
          <circle cx="238" cy="460" r="3" fill="#FFFBEB"/>
          <circle cx="274" cy="468" r="3.5" fill="#FFEAA8"/>
          <circle cx="205" cy="495" r="3.4" fill="#FFF9E6"/>
          <circle cx="230" cy="510" r="3.2" fill="#FFEAA8"/>
          <circle cx="258" cy="520" r="3.8" fill="#FFFBEB"/>
          <circle cx="282" cy="535" r="3" fill="#FFEAA8"/>
          <circle cx="198" cy="550" r="3.6" fill="#FFF5C2"/>
          <circle cx="225" cy="565" r="3" fill="#FFFBEB"/>
          <circle cx="252" cy="572" r="3.8" fill="#FFF9E6"/>
          <circle cx="288" cy="580" r="3.2" fill="#FFEAA8"/>
          <circle cx="208" cy="595" r="3" fill="#FFEAA8"/>
          <circle cx="240" cy="605" r="3.4" fill="#FFFBEB"/>
          <circle cx="270" cy="608" r="3.6" fill="#FFF9E6"/>
        </g>
      </g>

      <!-- TYPOGRAPHY ON THE RIGHT HALF -->
      <g text-anchor="middle">
        <!-- Title: "Holiday Party" in flowing script / calligraphy -->
        <text x="390" y="315" font-family="'Great Vibes', 'Playfair Display', cursive, serif" font-size="44" font-weight="400" fill="#F7F4EB" letter-spacing="0.5">Holiday</text>
        <text x="390" y="365" font-family="'Great Vibes', 'Playfair Display', cursive, serif" font-size="44" font-weight="400" fill="#F7F4EB" letter-spacing="0.5">Party</text>

        <!-- Subtext: "Join us for light bites & good times" -->
        <text x="390" y="440" font-family="'Montserrat', 'Inter', sans-serif" font-size="11" font-weight="400" fill="#CDC9BC" letter-spacing="0.4">Join us for light bites</text>
        <text x="390" y="458" font-family="'Montserrat', 'Inter', sans-serif" font-size="11" font-weight="400" fill="#CDC9BC" letter-spacing="0.4">&amp; good times</text>

        <!-- Date & Time: "Saturday, December 16 at 7 PM" -->
        <text x="390" y="515" font-family="'Montserrat', 'Inter', sans-serif" font-size="11.5" font-weight="500" fill="#E2DDD2" letter-spacing="0.3">Saturday, December 16</text>
        <text x="390" y="534" font-family="'Montserrat', 'Inter', sans-serif" font-size="11.5" font-weight="500" fill="#E2DDD2" letter-spacing="0.3">at 7 PM</text>

        <!-- Location: "The Smith Home | 5555 Willow Brook St." -->
        <text x="390" y="585" font-family="'Montserrat', 'Inter', sans-serif" font-size="10.5" font-weight="400" fill="#B3ADA0" letter-spacing="0.2">The Smith Home</text>
        <text x="390" y="602" font-family="'Montserrat', 'Inter', sans-serif" font-size="10.5" font-weight="400" fill="#B3ADA0" letter-spacing="0.2">5555 Willow Brook St.</text>
      </g>
    </g>
    <!-- Card Subtle Outer Border -->
    <rect x="150" y="140" width="370" height="520" rx="14" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
  </g>
</svg>`;

// Clean Card Background for O Tannenbaum (WITHOUT typography for live interactive editing)
const oTannenbaumBgSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 700" width="100%" height="100%">
  <defs>
    <radialGradient id="ot-card-vig-bg" cx="50%" cy="50%" r="70%">
      <stop offset="40%" stop-color="#252A28" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#121413" stop-opacity="0.75"/>
    </radialGradient>
    <filter id="ot-light-glow-bg" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="glow"/>
      <feMerge>
        <feMergeNode in="glow"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Card background: Deep rich charcoal -->
  <rect width="500" height="700" rx="14" fill="#1C1F1E"/>
  <rect width="500" height="700" rx="14" fill="url(#ot-card-vig-bg)"/>

  <!-- Illustrated Pine Christmas Tree on Left -->
  <g id="pine-tree-bg" transform="translate(-50, 40) scale(1.15)">
    <!-- Tree Trunk -->
    <path d="M 238,580 L 244,450 L 248,580 Z" fill="#2E1F14"/>

    <!-- Tier 5 (Base) -->
    <path d="M 175,560 Q 242,525 310,560 Q 285,520 292,490 Q 242,470 192,490 Q 195,525 175,560 Z" fill="#1E3322"/>
    <path d="M 180,555 Q 242,520 305,555 Q 275,515 285,495 Q 242,475 198,495 Z" fill="#28442D"/>

    <!-- Tier 4 -->
    <path d="M 188,495 Q 242,465 298,495 Q 275,455 282,425 Q 242,405 200,425 Q 204,460 188,495 Z" fill="#203824"/>
    <path d="M 193,490 Q 242,460 292,490 Q 268,450 276,430 Q 242,410 206,430 Z" fill="#2B4931"/>

    <!-- Tier 3 -->
    <path d="M 198,430 Q 242,405 288,430 Q 268,395 274,365 Q 242,345 208,365 Q 212,400 198,430 Z" fill="#243F29"/>
    <path d="M 203,425 Q 242,400 282,425 Q 260,390 270,370 Q 242,350 214,370 Z" fill="#325638"/>

    <!-- Tier 2 -->
    <path d="M 210,370 Q 242,350 276,370 Q 260,335 266,310 Q 242,290 218,310 Q 220,340 210,370 Z" fill="#28462E"/>
    <path d="M 214,365 Q 242,345 272,365 Q 254,330 262,315 Q 242,295 222,315 Z" fill="#38603F"/>

    <!-- Tier 1 (Top Tip) -->
    <path d="M 222,315 Q 242,295 264,315 Q 252,270 243,230 Q 234,270 222,315 Z" fill="#2C4E33"/>
    <path d="M 226,310 Q 242,290 260,310 Q 250,265 243,232 Q 236,265 226,310 Z" fill="#3E6B46"/>

    <!-- Detailed Pine Needle Tufts on Tree -->
    <g stroke="#487850" stroke-width="1.3" stroke-linecap="round" fill="none">
      <path d="M 235,245 L 228,255 M 245,248 L 253,258 M 240,260 L 232,272 M 248,265 L 258,276"/>
      <path d="M 225,290 L 214,302 M 242,295 L 243,308 M 260,292 L 272,305 M 234,305 L 224,318"/>
      <path d="M 215,340 L 202,355 M 235,345 L 234,360 M 255,342 L 268,358 M 275,345 L 288,362"/>
      <path d="M 205,395 L 190,412 M 228,400 L 226,418 M 255,398 L 265,416 M 282,400 L 296,418"/>
      <path d="M 195,455 L 178,475 M 220,460 L 216,480 M 250,458 L 258,478 M 285,460 L 302,480"/>
      <path d="M 185,520 L 168,542 M 215,525 L 210,548 M 248,522 L 254,545 M 288,524 L 308,546"/>
    </g>

    <!-- Warm Fairy Lights Winding Path -->
    <path d="M 242,238 Q 230,265 252,290 Q 220,320 265,355 Q 210,390 275,435 Q 200,475 285,525 Q 190,550 295,570" fill="none" stroke="#B38E46" stroke-width="0.8" opacity="0.65"/>

    <!-- Glowing Fairy Light Bulbs -->
    <g filter="url(#ot-light-glow-bg)">
      <circle cx="242" cy="240" r="3.2" fill="#FFF9E6"/>
      <circle cx="232" cy="265" r="2.8" fill="#FFEAA8"/>
      <circle cx="250" cy="288" r="3.4" fill="#FFFBEB"/>
      <circle cx="228" cy="312" r="3" fill="#FFEAA8"/>
      <circle cx="260" cy="335" r="3.5" fill="#FFF5C2"/>
      <circle cx="240" cy="345" r="2.6" fill="#FFFBEB"/>
      <circle cx="220" cy="375" r="3.2" fill="#FFEAA8"/>
      <circle cx="252" cy="385" r="3.6" fill="#FFF9E6"/>
      <circle cx="268" cy="405" r="2.8" fill="#FFEAA8"/>
      <circle cx="212" cy="415" r="3.4" fill="#FFF5C2"/>
      <circle cx="238" cy="430" r="3" fill="#FFFBEB"/>
      <circle cx="274" cy="438" r="3.5" fill="#FFEAA8"/>
      <circle cx="205" cy="465" r="3.4" fill="#FFF9E6"/>
      <circle cx="230" cy="480" r="3.2" fill="#FFEAA8"/>
      <circle cx="258" cy="490" r="3.8" fill="#FFFBEB"/>
      <circle cx="282" cy="505" r="3" fill="#FFEAA8"/>
      <circle cx="198" cy="520" r="3.6" fill="#FFF5C2"/>
      <circle cx="225" cy="535" r="3" fill="#FFFBEB"/>
      <circle cx="252" cy="542" r="3.8" fill="#FFF9E6"/>
      <circle cx="288" cy="550" r="3.2" fill="#FFEAA8"/>
      <circle cx="208" cy="565" r="3" fill="#FFEAA8"/>
      <circle cx="240" cy="575" r="3.4" fill="#FFFBEB"/>
      <circle cx="270" cy="578" r="3.6" fill="#FFF9E6"/>
    </g>
  </g>

  <!-- Card Outer Border -->
  <rect width="500" height="700" rx="14" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
</svg>`;

// -----------------------------------------------------------------------------
// 2. METALLIC PAINT SPLATTER
// -----------------------------------------------------------------------------
const metallicPaintSplatterMockupSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="100%" height="100%">
  <defs>
    <!-- Warm Linen Textured Surface Backdrop -->
    <linearGradient id="mps-backdrop" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F2EEE7"/>
      <stop offset="50%" stop-color="#EBE5DC"/>
      <stop offset="100%" stop-color="#DFD7CB"/>
    </linearGradient>

    <!-- Linen Fabric Weave Pattern -->
    <pattern id="mps-linen-weave" width="8" height="8" patternUnits="userSpaceOnUse">
      <path d="M 0,0 L 8,8 M 8,0 L 0,8" stroke="#D3C9BC" stroke-width="0.75" opacity="0.35"/>
    </pattern>

    <!-- Metallic Gold Foil Splatter Gradients -->
    <linearGradient id="mps-gold-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#B8860B"/>
      <stop offset="25%" stop-color="#D4AF37"/>
      <stop offset="50%" stop-color="#FFF3A8"/>
      <stop offset="75%" stop-color="#C59A27"/>
      <stop offset="100%" stop-color="#996E14"/>
    </linearGradient>

    <radialGradient id="mps-gold-radial" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#FFF8D1"/>
      <stop offset="40%" stop-color="#E5C158"/>
      <stop offset="75%" stop-color="#C2932E"/>
      <stop offset="100%" stop-color="#8C6314"/>
    </radialGradient>

    <!-- Jet Black Envelope Gradient -->
    <linearGradient id="mps-black-env" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#242424"/>
      <stop offset="50%" stop-color="#181818"/>
      <stop offset="100%" stop-color="#0E0E0E"/>
    </linearGradient>

    <!-- Shadows -->
    <filter id="mps-env-shadow" x="-30%" y="-20%" width="160%" height="150%">
      <feDropShadow dx="-6" dy="16" stdDeviation="16" flood-color="#000000" flood-opacity="0.32"/>
      <feDropShadow dx="-1" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.16"/>
    </filter>

    <filter id="mps-card-shadow" x="-30%" y="-20%" width="160%" height="150%">
      <feDropShadow dx="2" dy="16" stdDeviation="18" flood-color="#000000" flood-opacity="0.32"/>
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#000000" flood-opacity="0.14"/>
    </filter>

    <clipPath id="mps-card-clip">
      <rect x="150" y="140" width="370" height="520" rx="14"/>
    </clipPath>
  </defs>

  <!-- 1. BACKDROP: Warm linen textured surface -->
  <rect width="600" height="800" fill="url(#mps-backdrop)"/>
  <rect width="600" height="800" fill="url(#mps-linen-weave)"/>

  <!-- 2. ENVELOPE: Matte Jet Black Envelope with open triangular flap on Left -->
  <g filter="url(#mps-env-shadow)">
    <!-- Pocket Body -->
    <rect x="70" y="210" width="410" height="470" rx="16" fill="url(#mps-black-env)"/>
    <!-- Open Triangular Flap Pointing UP-LEFT -->
    <path d="M 70,290 L 135,115 L 360,290 Z" fill="url(#mps-black-env)"/>
    <!-- Inner Throat / Crease -->
    <path d="M 85,285 L 140,135 L 340,285 Z" fill="#111111"/>
    <line x1="70" y1="290" x2="360" y2="290" stroke="#000000" stroke-width="2.5" opacity="0.4"/>
  </g>

  <!-- 3. INVITATION CARD: Soft Off-White with Gold Splatter & Central Beige Block -->
  <g filter="url(#mps-card-shadow)">
    <g clip-path="url(#mps-card-clip)">
      <!-- Card surface -->
      <rect x="150" y="140" width="370" height="520" rx="14" fill="#FAF8F5"/>

      <!-- Splatter Elements: Scattered Metallic Gold Dots, Droplets & Splotches -->
      <g fill="url(#mps-gold-radial)">
        <!-- Top border splatters -->
        <circle cx="180" cy="165" r="7"/>
        <circle cx="168" cy="180" r="3.5"/>
        <circle cx="195" cy="155" r="4"/>
        <circle cx="215" cy="175" r="8.5"/>
        <circle cx="230" cy="160" r="3"/>
        <circle cx="265" cy="170" r="10"/>
        <circle cx="285" cy="155" r="5"/>
        <circle cx="310" cy="175" r="6"/>
        <circle cx="340" cy="160" r="9"/>
        <circle cx="370" cy="175" r="4.5"/>
        <circle cx="400" cy="165" r="11"/>
        <circle cx="420" cy="150" r="4"/>
        <circle cx="445" cy="170" r="8"/>
        <circle cx="475" cy="160" r="5.5"/>
        <circle cx="495" cy="180" r="9"/>
        <circle cx="505" cy="165" r="3.5"/>

        <!-- Left border splatters -->
        <circle cx="165" cy="220" r="8"/>
        <circle cx="178" cy="240" r="4"/>
        <circle cx="160" cy="270" r="10.5"/>
        <circle cx="172" cy="305" r="5"/>
        <circle cx="165" cy="345" r="7.5"/>
        <circle cx="175" cy="380" r="3.8"/>
        <circle cx="160" cy="420" r="9"/>
        <circle cx="170" cy="455" r="5.5"/>
        <circle cx="162" cy="495" r="11"/>
        <circle cx="175" cy="535" r="4"/>
        <circle cx="165" cy="575" r="8.5"/>
        <circle cx="178" cy="610" r="6"/>

        <!-- Right border splatters -->
        <circle cx="505" cy="215" r="9"/>
        <circle cx="490" cy="250" r="5"/>
        <circle cx="508" cy="285" r="11"/>
        <circle cx="495" cy="325" r="4.5"/>
        <circle cx="505" cy="365" r="8"/>
        <circle cx="492" cy="405" r="6"/>
        <circle cx="506" cy="445" r="10"/>
        <circle cx="490" cy="485" r="4.5"/>
        <circle cx="505" cy="525" r="7.5"/>
        <circle cx="492" cy="565" r="9"/>
        <circle cx="508" cy="605" r="5.5"/>

        <!-- Bottom border splatters -->
        <circle cx="185" cy="635" r="7.5"/>
        <circle cx="215" cy="645" r="9"/>
        <circle cx="245" cy="630" r="5"/>
        <circle cx="280" cy="648" r="11"/>
        <circle cx="315" cy="635" r="6.5"/>
        <circle cx="355" cy="645" r="10"/>
        <circle cx="390" cy="630" r="4.5"/>
        <circle cx="430" cy="648" r="8.5"/>
        <circle cx="465" cy="635" r="6"/>
        <circle cx="490" cy="645" r="9"/>

        <!-- Organic Droplet Shapes -->
        <path d="M 240,185 Q 248,175 252,188 Q 248,198 240,185 Z"/>
        <path d="M 430,195 Q 436,182 444,196 Q 438,206 430,195 Z"/>
        <path d="M 185,290 Q 192,280 198,294 Q 190,302 185,290 Z"/>
        <path d="M 480,310 Q 488,298 495,312 Q 487,322 480,310 Z"/>
        <path d="M 188,440 Q 196,428 202,442 Q 194,452 188,440 Z"/>
        <path d="M 482,470 Q 490,458 498,472 Q 490,482 482,470 Z"/>
        <path d="M 230,625 Q 238,612 246,628 Q 237,638 230,625 Z"/>
        <path d="M 370,620 Q 378,608 386,622 Q 378,632 370,620 Z"/>

        <!-- Fine speckles / mist -->
        <circle cx="205" cy="210" r="1.5"/><circle cx="225" cy="225" r="2.2"/><circle cx="250" cy="215" r="1.2"/>
        <circle cx="420" cy="220" r="2"/><circle cx="445" cy="235" r="1.4"/><circle cx="465" cy="215" r="2.5"/>
        <circle cx="200" cy="360" r="1.8"/><circle cx="215" cy="385" r="2.4"/><circle cx="195" cy="410" r="1.5"/>
        <circle cx="470" cy="370" r="2"/><circle cx="455" cy="395" r="1.4"/><circle cx="475" cy="420" r="2.2"/>
        <circle cx="210" cy="580" r="2"/><circle cx="235" cy="595" r="1.5"/><circle cx="260" cy="585" r="2.4"/>
        <circle cx="410" cy="585" r="1.6"/><circle cx="435" cy="595" r="2.2"/><circle cx="460" cy="580" r="1.8"/>
      </g>

      <!-- Central Subtle Warm Beige Inset Block -->
      <rect x="210" y="225" width="250" height="350" rx="3" fill="#F7F1E7" opacity="0.95"/>

      <!-- Typography Centered Inside Inset Block -->
      <g text-anchor="middle">
        <!-- Header: "JOIN US" in clean serif uppercase spaced -->
        <text x="335" y="325" font-family="'Cinzel', 'Playfair Display', Georgia, serif" font-size="28" font-weight="600" fill="#1C1C1C" letter-spacing="4.5">JOIN US</text>

        <!-- Subtext: "Come raise a glass... we've got so much to celebrate!" (italic serif) -->
        <text x="335" y="390" font-family="'Playfair Display', Georgia, serif" font-style="italic" font-size="12" font-weight="400" fill="#4A4A4A">Come raise a glass... we&apos;ve got so</text>
        <text x="335" y="412" font-family="'Playfair Display', Georgia, serif" font-style="italic" font-size="12" font-weight="400" fill="#4A4A4A">much to celebrate!</text>

        <!-- Details: "Friday, February 3 at 7 PM | 835 South Hill St." -->
        <text x="335" y="480" font-family="'Montserrat', 'Inter', sans-serif" font-size="11" font-weight="400" fill="#5A5A5A" letter-spacing="0.3">Friday, February 3 at 7 PM</text>
        <text x="335" y="500" font-family="'Montserrat', 'Inter', sans-serif" font-size="11" font-weight="400" fill="#5A5A5A" letter-spacing="0.3">835 South Hill St.</text>
      </g>
    </g>
    <rect x="150" y="140" width="370" height="520" rx="14" fill="none" stroke="rgba(0,0,0,0.06)" stroke-width="1"/>
  </g>
</svg>`;

// Clean Card Background for Metallic Paint Splatter
const metallicPaintSplatterBgSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 700" width="100%" height="100%">
  <defs>
    <radialGradient id="mps-gold-radial-bg" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#FFF8D1"/>
      <stop offset="40%" stop-color="#E5C158"/>
      <stop offset="75%" stop-color="#C2932E"/>
      <stop offset="100%" stop-color="#8C6314"/>
    </radialGradient>
  </defs>

  <!-- Card Base -->
  <rect width="500" height="700" rx="14" fill="#FAF8F5"/>

  <!-- Splatter Elements: Scattered Metallic Gold Dots, Droplets & Splotches -->
  <g fill="url(#mps-gold-radial-bg)">
    <!-- Top border splatters -->
    <circle cx="40" cy="35" r="9"/>
    <circle cx="25" cy="55" r="4.5"/>
    <circle cx="60" cy="22" r="5"/>
    <circle cx="85" cy="48" r="11"/>
    <circle cx="105" cy="30" r="4"/>
    <circle cx="150" cy="42" r="13"/>
    <circle cx="178" cy="22" r="6.5"/>
    <circle cx="210" cy="50" r="8"/>
    <circle cx="250" cy="30" r="12"/>
    <circle cx="290" cy="50" r="6"/>
    <circle cx="330" cy="36" r="14"/>
    <circle cx="360" cy="18" r="5.5"/>
    <circle cx="395" cy="44" r="10.5"/>
    <circle cx="435" cy="30" r="7"/>
    <circle cx="465" cy="55" r="12"/>
    <circle cx="480" cy="35" r="4.5"/>

    <!-- Left border splatters -->
    <circle cx="22" cy="110" r="10.5"/>
    <circle cx="38" cy="135" r="5"/>
    <circle cx="15" cy="175" r="13.5"/>
    <circle cx="30" cy="220" r="6.5"/>
    <circle cx="22" cy="275" r="10"/>
    <circle cx="35" cy="320" r="5"/>
    <circle cx="15" cy="370" r="12"/>
    <circle cx="28" cy="415" r="7"/>
    <circle cx="18" cy="470" r="14"/>
    <circle cx="35" cy="520" r="5.5"/>
    <circle cx="22" cy="575" r="11"/>
    <circle cx="38" cy="620" r="8"/>

    <!-- Right border splatters -->
    <circle cx="478" cy="105" r="12"/>
    <circle cx="460" cy="148" r="6.5"/>
    <circle cx="482" cy="195" r="14"/>
    <circle cx="465" cy="245" r="6"/>
    <circle cx="478" cy="300" r="10.5"/>
    <circle cx="462" cy="350" r="8"/>
    <circle cx="480" cy="405" r="13"/>
    <circle cx="460" cy="455" r="6"/>
    <circle cx="478" cy="510" r="10"/>
    <circle cx="462" cy="560" r="12"/>
    <circle cx="482" cy="615" r="7.5"/>

    <!-- Bottom border splatters -->
    <circle cx="45" cy="655" r="10"/>
    <circle cx="85" cy="668" r="12"/>
    <circle cx="125" cy="648" r="6.5"/>
    <circle cx="170" cy="670" r="14"/>
    <circle cx="218" cy="655" r="8.5"/>
    <circle cx="270" cy="668" r="13"/>
    <circle cx="315" cy="648" r="6"/>
    <circle cx="370" cy="670" r="11"/>
    <circle cx="415" cy="655" r="8"/>
    <circle cx="450" cy="668" r="12"/>

    <!-- Organic Droplets -->
    <path d="M 120,62 Q 130,48 135,66 Q 130,78 120,62 Z"/>
    <path d="M 370,75 Q 378,58 388,76 Q 380,90 370,75 Z"/>
    <path d="M 45,200 Q 54,186 62,204 Q 52,216 45,200 Z"/>
    <path d="M 445,225 Q 455,210 464,228 Q 454,242 445,225 Z"/>
    <path d="M 50,400 Q 60,384 68,402 Q 58,416 50,400 Z"/>
    <path d="M 448,435 Q 458,420 468,438 Q 458,452 448,435 Z"/>
    <path d="M 105,640 Q 115,624 125,644 Q 114,658 105,640 Z"/>
    <path d="M 290,635 Q 300,620 310,638 Q 300,652 290,635 Z"/>

    <!-- Fine speckles -->
    <circle cx="70" cy="95" r="2"/><circle cx="95" cy="115" r="2.8"/><circle cx="130" cy="100" r="1.6"/>
    <circle cx="360" cy="108" r="2.5"/><circle cx="395" cy="128" r="1.8"/><circle cx="420" cy="102" r="3.2"/>
    <circle cx="65" cy="290" r="2.2"/><circle cx="85" cy="325" r="3"/><circle cx="60" cy="355" r="2"/>
    <circle cx="435" cy="305" r="2.6"/><circle cx="415" cy="335" r="1.8"/><circle cx="440" cy="370" r="2.8"/>
    <circle cx="75" cy="580" r="2.5"/><circle cx="108" cy="600" r="2"/><circle cx="140" cy="588" r="3"/>
    <circle cx="355" cy="590" r="2.2"/><circle cx="388" cy="602" r="2.8"/><circle cx="420" cy="582" r="2.4"/>
  </g>

  <!-- Central Subtle Warm Beige Inset Block -->
  <rect x="80" y="115" width="340" height="470" rx="4" fill="#F7F1E7" opacity="0.95"/>

  <!-- Card Subtle Border -->
  <rect width="500" height="700" rx="14" fill="none" stroke="rgba(0,0,0,0.06)" stroke-width="1"/>
</svg>`;

// -----------------------------------------------------------------------------
// 3. GOLDEN FOLIAGE HOLIDAY
// -----------------------------------------------------------------------------
const goldenFoliageHolidayMockupSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="100%" height="100%">
  <defs>
    <!-- Warm Flatlay Backdrop -->
    <linearGradient id="gfh-backdrop" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FAF7F2"/>
      <stop offset="50%" stop-color="#F3ECE2"/>
      <stop offset="100%" stop-color="#E8DFCFA"/>
    </linearGradient>

    <!-- Metallic Gold Foil Gradient -->
    <linearGradient id="gfh-gold" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#9E7318"/>
      <stop offset="20%" stop-color="#D4AF37"/>
      <stop offset="40%" stop-color="#FFF4B3"/>
      <stop offset="60%" stop-color="#D4AF37"/>
      <stop offset="80%" stop-color="#AA771C"/>
      <stop offset="100%" stop-color="#7C540C"/>
    </linearGradient>

    <!-- Envelope Sand Gradient -->
    <linearGradient id="gfh-env-body" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E5DBCA"/>
      <stop offset="50%" stop-color="#D9CEBC"/>
      <stop offset="100%" stop-color="#C9BCA8"/>
    </linearGradient>

    <!-- Satin Ornament Ball Gradient -->
    <radialGradient id="gfh-ornament" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="35%" stop-color="#F5EFE3"/>
      <stop offset="70%" stop-color="#E2D4BE"/>
      <stop offset="100%" stop-color="#C6B49A"/>
    </radialGradient>

    <!-- Shadows -->
    <filter id="gfh-env-shadow" x="-30%" y="-20%" width="160%" height="150%">
      <feDropShadow dx="-6" dy="16" stdDeviation="16" flood-color="#000000" flood-opacity="0.28"/>
      <feDropShadow dx="-1" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.14"/>
    </filter>

    <filter id="gfh-card-shadow" x="-30%" y="-20%" width="160%" height="150%">
      <feDropShadow dx="2" dy="18" stdDeviation="18" flood-color="#000000" flood-opacity="0.38"/>
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.18"/>
    </filter>

    <clipPath id="gfh-card-clip">
      <rect x="150" y="140" width="370" height="520" rx="14"/>
    </clipPath>
  </defs>

  <!-- 1. BACKDROP: Warm Flatlay Surface with Festive Decor -->
  <rect width="600" height="800" fill="url(#gfh-backdrop)"/>

  <!-- Champagne Silk Ribbon on Left -->
  <g fill="none" stroke="#E2D1C3" opacity="0.85">
    <path d="M 25,-20 Q 95,80 55,180 Q 25,260 70,340" stroke-width="36" stroke-linecap="round"/>
    <path d="M 23,-20 Q 93,80 53,180 Q 23,260 68,340" stroke="#F4EAE3" stroke-width="30" stroke-linecap="round"/>
  </g>

  <!-- Pine Branch on Top Right -->
  <g transform="translate(465, -20) rotate(55)">
    <path d="M 0,0 Q 40,60 70,140 Q 90,200 110,260" stroke="#5C3E28" stroke-width="4" fill="none"/>
    <path d="M 20,40 L -15,25 M 35,65 L -2,45 M 50,90 L 15,70 M 65,120 L 30,95 M 80,150 L 45,125 M 95,185 L 60,160 M 105,220 L 75,195" stroke="#2D4C31" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M 20,35 L 55,20 M 35,55 L 72,40 M 50,80 L 88,62 M 65,110 L 105,90 M 80,140 L 118,120 M 95,175 L 132,152 M 105,210 L 140,188" stroke="#3A5F3E" stroke-width="2.5" stroke-linecap="round"/>
  </g>

  <!-- Satin Ornament Ball on Bottom Left -->
  <g transform="translate(70, 740)">
    <circle cx="0" cy="0" r="76" fill="url(#gfh-ornament)"/>
    <ellipse cx="-20" cy="-22" rx="14" ry="7" fill="#FFFFFF" opacity="0.6" transform="rotate(-30, -20, -22)"/>
    <rect x="-10" y="-84" width="20" height="12" rx="2" fill="#D4AF37"/>
  </g>

  <!-- 2. ENVELOPE: Warm Sand Linen with Open Gleaming Gold Foil Flap on Left -->
  <g filter="url(#gfh-env-shadow)">
    <!-- Pocket Body behind card -->
    <rect x="70" y="210" width="410" height="470" rx="16" fill="url(#gfh-env-body)"/>

    <!-- Open Triangular Flap Pointing UP-LEFT -->
    <path d="M 70,290 L 135,115 L 360,290 Z" fill="url(#gfh-env-body)"/>

    <!-- Inner Throat Metallic Gold Foil Lining -->
    <path d="M 90,285 L 142,135 L 338,285 Z" fill="url(#gfh-gold)"/>

    <line x1="70" y1="290" x2="360" y2="290" stroke="#000000" stroke-width="2" opacity="0.25"/>
  </g>

  <!-- 3. INVITATION CARD: Deep Hunter Green + Gold Foil Branches + White Box -->
  <g filter="url(#gfh-card-shadow)">
    <g clip-path="url(#gfh-card-clip)">
      <!-- Deep Hunter Green Card Base (#223326) -->
      <rect x="150" y="140" width="370" height="520" rx="14" fill="#223326"/>

      <!-- Golden Pine Needles, Cones & Confetti Sprinkles framing the background -->
      <g stroke="url(#gfh-gold)" fill="none" stroke-linecap="round">
        <!-- Top Left Branch Cluster -->
        <g transform="translate(155, 145)">
          <path d="M 0,0 Q 50,40 40,110 Q 30,160 50,220" stroke-width="2"/>
          <path d="M 12,20 L -8,12 M 22,35 L 2,24 M 32,55 L 8,42 M 38,78 L 12,65 M 36,105 L 8,95 M 32,135 L 4,128 M 38,168 L 10,162 M 45,198 L 18,195" stroke-width="1.6"/>
          <path d="M 12,18 L 32,6 M 22,32 L 44,18 M 32,50 L 58,35 M 38,72 L 68,54 M 36,98 L 68,82 M 32,128 L 62,112 M 38,160 L 68,145 M 45,190 L 72,178" stroke-width="1.6"/>
          <!-- Pinecone -->
          <g transform="translate(42, 115) rotate(25)" fill="url(#gfh-gold)" stroke="#8A6414" stroke-width="0.8">
            <ellipse cx="0" cy="0" rx="9" ry="16"/>
            <path d="M -8,-6 Q 0,-12 8,-6 M -9,0 Q 0,-6 9,0 M -8,6 Q 0,0 8,6 M -5,12 Q 0,6 5,12"/>
          </g>
        </g>

        <!-- Top Right Golden Branch Cluster -->
        <g transform="translate(515, 145) scale(-1, 1)">
          <path d="M 0,0 Q 55,45 45,115 Q 35,165 55,225" stroke-width="2"/>
          <path d="M 12,20 L -8,12 M 22,35 L 2,24 M 32,55 L 8,42 M 38,78 L 12,65 M 36,105 L 8,95 M 32,135 L 4,128 M 38,168 L 10,162 M 45,198 L 18,195" stroke-width="1.6"/>
          <path d="M 12,18 L 32,6 M 22,32 L 44,18 M 32,50 L 58,35 M 38,72 L 68,54 M 36,98 L 68,82 M 32,128 L 62,112 M 38,160 L 68,145 M 45,190 L 72,178" stroke-width="1.6"/>
          <!-- Pinecone -->
          <g transform="translate(42, 115) rotate(25)" fill="url(#gfh-gold)" stroke="#8A6414" stroke-width="0.8">
            <ellipse cx="0" cy="0" rx="9" ry="16"/>
            <path d="M -8,-6 Q 0,-12 8,-6 M -9,0 Q 0,-6 9,0 M -8,6 Q 0,0 8,6 M -5,12 Q 0,6 5,12"/>
          </g>
        </g>

        <!-- Bottom Left Branch Cluster -->
        <g transform="translate(155, 655) scale(1, -1)">
          <path d="M 0,0 Q 50,40 40,110 Q 30,160 50,220" stroke-width="2"/>
          <path d="M 12,20 L -8,12 M 22,35 L 2,24 M 32,55 L 8,42 M 38,78 L 12,65 M 36,105 L 8,95 M 32,135 L 4,128 M 38,168 L 10,162" stroke-width="1.6"/>
          <path d="M 12,18 L 32,6 M 22,32 L 44,18 M 32,50 L 58,35 M 38,72 L 68,54 M 36,98 L 68,82 M 32,128 L 62,112 M 38,160 L 68,145" stroke-width="1.6"/>
          <!-- Pinecone -->
          <g transform="translate(42, 115) rotate(25)" fill="url(#gfh-gold)" stroke="#8A6414" stroke-width="0.8">
            <ellipse cx="0" cy="0" rx="9" ry="16"/>
            <path d="M -8,-6 Q 0,-12 8,-6 M -9,0 Q 0,-6 9,0 M -8,6 Q 0,0 8,6 M -5,12 Q 0,6 5,12"/>
          </g>
        </g>

        <!-- Bottom Right Branch Cluster -->
        <g transform="translate(515, 655) scale(-1, -1)">
          <path d="M 0,0 Q 55,45 45,115 Q 35,165 55,225" stroke-width="2"/>
          <path d="M 12,20 L -8,12 M 22,35 L 2,24 M 32,55 L 8,42 M 38,78 L 12,65 M 36,105 L 8,95 M 32,135 L 4,128 M 38,168 L 10,162" stroke-width="1.6"/>
          <path d="M 12,18 L 32,6 M 22,32 L 44,18 M 32,50 L 58,35 M 38,72 L 68,54 M 36,98 L 68,82 M 32,128 L 62,112 M 38,160 L 68,145" stroke-width="1.6"/>
        </g>
      </g>

      <!-- Gold Confetti Dots scattered in dark green field -->
      <g fill="url(#gfh-gold)">
        <circle cx="185" cy="190" r="1.8"/><circle cx="210" cy="165" r="2.4"/><circle cx="245" cy="180" r="1.5"/><circle cx="280" cy="160" r="2.2"/><circle cx="340" cy="165" r="2"/>
        <circle cx="390" cy="175" r="2.5"/><circle cx="430" cy="160" r="1.8"/><circle cx="465" cy="185" r="2.2"/><circle cx="490" cy="165" r="2.5"/>
        <circle cx="175" cy="320" r="2"/><circle cx="185" cy="480" r="2.4"/><circle cx="485" cy="330" r="1.8"/><circle cx="495" cy="490" r="2.2"/>
        <circle cx="195" cy="625" r="2.2"/><circle cx="230" cy="640" r="1.8"/><circle cx="275" cy="628" r="2.5"/><circle cx="320" cy="642" r="2"/><circle cx="380" cy="630" r="2.4"/>
        <circle cx="425" cy="645" r="1.8"/><circle cx="470" cy="632" r="2.2"/><circle cx="495" cy="615" r="2.5"/>
      </g>

      <!-- Centered Crisp Double-Line White Box -->
      <g>
        <!-- Box White Background -->
        <rect x="220" y="205" width="230" height="390" fill="#FFFFFF" rx="2"/>
        <!-- Outer Crisp Border -->
        <rect x="226" y="211" width="218" height="378" fill="none" stroke="#2B2B2B" stroke-width="1.8"/>
        <!-- Inner Hairline Border -->
        <rect x="230" y="215" width="210" height="370" fill="none" stroke="#8A8A8A" stroke-width="0.8"/>
      </g>

      <!-- Typography Inside White Box -->
      <g text-anchor="middle">
        <!-- Heading: "LET'S CELEBRATE THE SEASON" -->
        <text x="335" y="278" font-family="'Cinzel', 'Playfair Display', Georgia, serif" font-size="20" font-weight="600" fill="#222222" letter-spacing="2">LET&apos;S</text>
        <text x="335" y="306" font-family="'Cinzel', 'Playfair Display', Georgia, serif" font-size="20" font-weight="600" fill="#222222" letter-spacing="2">CELEBRATE</text>
        <text x="335" y="334" font-family="'Cinzel', 'Playfair Display', Georgia, serif" font-size="20" font-weight="600" fill="#222222" letter-spacing="2">THE SEASON</text>

        <!-- Subtitle: "JOIN US FOR OUR" -->
        <text x="335" y="380" font-family="'Montserrat', 'Inter', sans-serif" font-size="8.5" font-weight="600" fill="#666666" letter-spacing="2">JOIN US FOR OUR</text>
        <!-- "annual holiday party" (script accent) -->
        <text x="335" y="415" font-family="'Great Vibes', cursive, 'Playfair Display', serif" font-size="24" font-weight="400" fill="#555555">annual holiday party</text>

        <!-- Details -->
        <text x="335" y="470" font-family="'Montserrat', 'Inter', sans-serif" font-size="8.5" font-weight="600" fill="#444444" letter-spacing="1.2">SATURDAY, DECEMBER 15TH</text>
        <text x="335" y="486" font-family="'Montserrat', 'Inter', sans-serif" font-size="8.5" font-weight="600" fill="#444444" letter-spacing="1.2">AT 6 PM</text>

        <text x="335" y="525" font-family="'Montserrat', 'Inter', sans-serif" font-size="8" font-weight="500" fill="#666666" letter-spacing="1">THE ANDERSON HOME</text>
        <text x="335" y="540" font-family="'Montserrat', 'Inter', sans-serif" font-size="8" font-weight="500" fill="#666666" letter-spacing="1">819 HOLLY LANE</text>
      </g>
    </g>
    <rect x="150" y="140" width="370" height="520" rx="14" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
  </g>
</svg>`;

// Clean Card Background for Golden Foliage Holiday
const goldenFoliageHolidayBgSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 700" width="100%" height="100%">
  <defs>
    <!-- Metallic Gold Foil Gradient -->
    <linearGradient id="gfh-gold-bg" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#9E7318"/>
      <stop offset="20%" stop-color="#D4AF37"/>
      <stop offset="40%" stop-color="#FFF4B3"/>
      <stop offset="60%" stop-color="#D4AF37"/>
      <stop offset="80%" stop-color="#AA771C"/>
      <stop offset="100%" stop-color="#7C540C"/>
    </linearGradient>
  </defs>

  <!-- Deep Hunter Green Base -->
  <rect width="500" height="700" rx="14" fill="#223326"/>

  <!-- Golden Pine Needles, Cones & Confetti Sprinkles framing the background -->
  <g stroke="url(#gfh-gold-bg)" fill="none" stroke-linecap="round">
    <!-- Top Left Branch Cluster -->
    <g transform="translate(10, 10)">
      <path d="M 0,0 Q 60,50 50,135 Q 38,195 62,270" stroke-width="2.2"/>
      <path d="M 14,24 L -10,14 M 26,42 L 2,28 M 38,66 L 9,50 M 45,94 L 14,78 M 43,126 L 9,114 M 38,162 L 5,153 M 45,202 L 12,194 M 54,238 L 22,234" stroke-width="1.8"/>
      <path d="M 14,21 L 38,7 M 26,38 L 52,21 M 38,60 L 69,42 M 45,86 L 81,65 M 43,118 L 81,98 M 38,154 L 74,134 M 45,192 L 81,174 M 54,228 L 86,214" stroke-width="1.8"/>
      <g transform="translate(50, 138) rotate(25)" fill="url(#gfh-gold-bg)" stroke="#8A6414" stroke-width="0.8">
        <ellipse cx="0" cy="0" rx="10" ry="18"/>
        <path d="M -9,-7 Q 0,-14 9,-7 M -10,0 Q 0,-7 10,0 M -9,7 Q 0,0 9,7 M -6,14 Q 0,7 6,14"/>
      </g>
    </g>

    <!-- Top Right Golden Branch Cluster -->
    <g transform="translate(490, 10) scale(-1, 1)">
      <path d="M 0,0 Q 60,50 50,135 Q 38,195 62,270" stroke-width="2.2"/>
      <path d="M 14,24 L -10,14 M 26,42 L 2,28 M 38,66 L 9,50 M 45,94 L 14,78 M 43,126 L 9,114 M 38,162 L 5,153 M 45,202 L 12,194 M 54,238 L 22,234" stroke-width="1.8"/>
      <path d="M 14,21 L 38,7 M 26,38 L 52,21 M 38,60 L 69,42 M 45,86 L 81,65 M 43,118 L 81,98 M 38,154 L 74,134 M 45,192 L 81,174 M 54,228 L 86,214" stroke-width="1.8"/>
      <g transform="translate(50, 138) rotate(25)" fill="url(#gfh-gold-bg)" stroke="#8A6414" stroke-width="0.8">
        <ellipse cx="0" cy="0" rx="10" ry="18"/>
        <path d="M -9,-7 Q 0,-14 9,-7 M -10,0 Q 0,-7 10,0 M -9,7 Q 0,0 9,7 M -6,14 Q 0,7 6,14"/>
      </g>
    </g>

    <!-- Bottom Left Branch Cluster -->
    <g transform="translate(10, 690) scale(1, -1)">
      <path d="M 0,0 Q 60,50 50,135 Q 38,195 62,270" stroke-width="2.2"/>
      <path d="M 14,24 L -10,14 M 26,42 L 2,28 M 38,66 L 9,50 M 45,94 L 14,78 M 43,126 L 9,114 M 38,162 L 5,153 M 45,202 L 12,194" stroke-width="1.8"/>
      <path d="M 14,21 L 38,7 M 26,38 L 52,21 M 38,60 L 69,42 M 45,86 L 81,65 M 43,118 L 81,98 M 38,154 L 74,134 M 45,192 L 81,174" stroke-width="1.8"/>
      <g transform="translate(50, 138) rotate(25)" fill="url(#gfh-gold-bg)" stroke="#8A6414" stroke-width="0.8">
        <ellipse cx="0" cy="0" rx="10" ry="18"/>
        <path d="M -9,-7 Q 0,-14 9,-7 M -10,0 Q 0,-7 10,0 M -9,7 Q 0,0 9,7 M -6,14 Q 0,7 6,14"/>
      </g>
    </g>

    <!-- Bottom Right Branch Cluster -->
    <g transform="translate(490, 690) scale(-1, -1)">
      <path d="M 0,0 Q 60,50 50,135 Q 38,195 62,270" stroke-width="2.2"/>
      <path d="M 14,24 L -10,14 M 26,42 L 2,28 M 38,66 L 9,50 M 45,94 L 14,78 M 43,126 L 9,114 M 38,162 L 5,153 M 45,202 L 12,194" stroke-width="1.8"/>
      <path d="M 14,21 L 38,7 M 26,38 L 52,21 M 38,60 L 69,42 M 45,86 L 81,65 M 43,118 L 81,98 M 38,154 L 74,134 M 45,192 L 81,174" stroke-width="1.8"/>
    </g>
  </g>

  <!-- Gold Confetti Dots -->
  <g fill="url(#gfh-gold-bg)">
    <circle cx="45" cy="55" r="2.2"/><circle cx="75" cy="28" r="2.8"/><circle cx="120" cy="45" r="1.8"/><circle cx="165" cy="22" r="2.5"/><circle cx="235" cy="28" r="2.4"/>
    <circle cx="300" cy="40" r="3"/><circle cx="350" cy="22" r="2.2"/><circle cx="395" cy="50" r="2.6"/><circle cx="430" cy="28" r="2.8"/>
    <circle cx="30" cy="220" r="2.4"/><circle cx="45" cy="410" r="2.8"/><circle cx="460" cy="235" r="2.2"/><circle cx="475" cy="425" r="2.6"/>
    <circle cx="55" cy="655" r="2.6"/><circle cx="95" cy="672" r="2.2"/><circle cx="150" cy="658" r="3"/><circle cx="205" cy="675" r="2.4"/><circle cx="280" cy="660" r="2.8"/>
    <circle cx="340" cy="678" r="2.2"/><circle cx="395" cy="662" r="2.6"/><circle cx="430" cy="642" r="3"/>
  </g>

  <!-- Centered Crisp Double-Line White Box -->
  <g>
    <!-- White Background Container -->
    <rect x="85" y="85" width="330" height="530" fill="#FFFFFF" rx="2"/>
    <!-- Outer Crisp Border -->
    <rect x="94" y="94" width="312" height="512" fill="none" stroke="#2B2B2B" stroke-width="2.2"/>
    <!-- Inner Hairline Border -->
    <rect x="100" y="100" width="300" height="500" fill="none" stroke="#8A8A8A" stroke-width="1"/>
  </g>

  <!-- Card Outer Border -->
  <rect width="500" height="700" rx="14" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
</svg>`;

// Write all SVGs to asset directories
const targetDirs = [
  templatesAssetDir,
  invitehubTemplatesAssetDir
];

targetDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // 1. O Tannenbaum
  fs.writeFileSync(path.join(dir, 'o-tannenbaum-mockup.svg'), oTannenbaumMockupSvg);
  fs.writeFileSync(path.join(dir, 'o-tannenbaum-bg.svg'), oTannenbaumBgSvg);

  // 2. Metallic Paint Splatter
  fs.writeFileSync(path.join(dir, 'metallic-paint-splatter-mockup.svg'), metallicPaintSplatterMockupSvg);
  fs.writeFileSync(path.join(dir, 'metallic-paint-splatter-bg.svg'), metallicPaintSplatterBgSvg);

  // 3. Golden Foliage Holiday
  fs.writeFileSync(path.join(dir, 'golden-foliage-holiday-mockup.svg'), goldenFoliageHolidayMockupSvg);
  fs.writeFileSync(path.join(dir, 'golden-foliage-holiday-bg.svg'), goldenFoliageHolidayBgSvg);
});

console.log('Successfully generated all 3 new template mockups and clean card bg SVGs!');
