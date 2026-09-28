const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const bridalDir = path.join(publicDir, 'templates', 'bridal');
const envelopesDir = path.join(publicDir, 'templates', 'envelopes');
const templatesAssetDir = path.join(publicDir, 'assets', 'templates');

// Helper to get base64
function getBase64(filePath) {
  const data = fs.readFileSync(filePath);
  const ext = path.extname(filePath).slice(1);
  return `data:image/${ext === 'svg' ? 'svg+xml' : ext};base64,${data.toString('base64')}`;
}

const blushFrameBase64 = getBase64(path.join(bridalDir, 'blush-burgundy-frame.png'));
const somethingBlueFrameBase64 = getBase64(path.join(bridalDir, 'something-blue-frame.png'));
const autumnFrameBase64 = getBase64(path.join(bridalDir, 'autumn-blooms-frame.png'));
const autumnGinghamBase64 = getBase64(path.join(envelopesDir, 'autumn-gingham-liner.png'));

// -------------------------------------------------------------
// 1. BLUSH & BURGUNDY BLOOMS MOCKUP SVG
// -------------------------------------------------------------
const blushBurgundySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="100%" height="100%">
  <defs>
    <!-- Linen Weave Pattern -->
    <linearGradient id="linen-base" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCFAF6"/>
      <stop offset="50%" stop-color="#F8F4EE"/>
      <stop offset="100%" stop-color="#EFE7DD"/>
    </linearGradient>

    <pattern id="linen-pattern" width="8" height="8" patternUnits="userSpaceOnUse">
      <path d="M 0,2 L 8,2 M 0,6 L 8,6" stroke="#D8CFC4" stroke-width="0.75" opacity="0.35"/>
      <path d="M 0,1 L 8,1 M 0,5 L 8,5" stroke="#FFFFFF" stroke-width="0.5" opacity="0.6"/>
      <path d="M 2,0 L 2,8 M 6,0 L 6,8" stroke="#D3C9BD" stroke-width="0.75" opacity="0.32"/>
      <path d="M 1,0 L 1,8 M 5,0 L 5,8" stroke="#FFFFFF" stroke-width="0.5" opacity="0.55"/>
    </pattern>

    <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
      <stop offset="50%" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="100%" stop-color="#DDD3C4" stop-opacity="0.45"/>
    </radialGradient>

    <!-- Metallic Gold Foil Gradient -->
    <linearGradient id="gold-foil" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#C2932E"/>
      <stop offset="22%" stop-color="#E5C158"/>
      <stop offset="42%" stop-color="#FFF2A1"/>
      <stop offset="58%" stop-color="#D4AF37"/>
      <stop offset="78%" stop-color="#AA771C"/>
      <stop offset="90%" stop-color="#FDF4B8"/>
      <stop offset="100%" stop-color="#9A6B12"/>
    </linearGradient>

    <!-- Gold Floral Liner Pattern Tile -->
    <pattern id="gold-floral" width="120" height="120" patternUnits="userSpaceOnUse">
      <g fill="none" stroke="url(#gold-foil)" stroke-linecap="round" stroke-linejoin="round" opacity="0.85">
        <g transform="translate(60, 60)">
          <path d="M -3,-2 C -6,-8 0,-12 4,-9 C 8,-6 10,0 6,4 C 2,8 -6,8 -9,3" stroke-width="1.1"/>
          <path d="M 0,-14 C -10,-17 -15,-4 -10,8 C -6,17 8,18 15,9 C 21,0 16,-12 6,-15" stroke-width="0.95"/>
          <path d="M -12,11 C -22,17 -27,9 -28,3 C -25,12 -18,15 -9,14" stroke-width="0.8" fill="url(#gold-foil)" fill-opacity="0.12"/>
          <path d="M 14,9 C 24,15 29,7 30,1 C 27,10 20,13 11,12" stroke-width="0.8" fill="url(#gold-foil)" fill-opacity="0.12"/>
        </g>
        <g transform="translate(0, 0)">
          <circle cx="0" cy="0" r="6" stroke-width="0.9"/>
          <path d="M -7,-3 C -10,7 3,10 7,4" stroke-width="0.8"/>
        </g>
        <g transform="translate(120, 0)"><circle cx="0" cy="0" r="6" stroke-width="0.9"/></g>
        <g transform="translate(0, 120)"><circle cx="0" cy="0" r="6" stroke-width="0.9"/></g>
        <g transform="translate(120, 120)"><circle cx="0" cy="0" r="6" stroke-width="0.9"/></g>
      </g>
    </pattern>

    <!-- Drop Shadows -->
    <filter id="envelope-shadow" x="-20%" y="-15%" width="140%" height="135%">
      <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#000000" flood-opacity="0.32"/>
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.16"/>
    </filter>

    <filter id="card-elevation-shadow" x="-30%" y="-20%" width="160%" height="150%">
      <feDropShadow dx="0" dy="14" stdDeviation="15" flood-color="#000000" flood-opacity="0.28"/>
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#000000" flood-opacity="0.14"/>
    </filter>

    <clipPath id="card-clip">
      <rect x="122" y="218" width="356" height="508" rx="14"/>
    </clipPath>
  </defs>

  <!-- 1. BACKDROP: Off-white Linen Texture -->
  <rect width="600" height="800" fill="url(#linen-base)"/>
  <rect width="600" height="800" fill="url(#linen-pattern)"/>
  <rect width="600" height="800" fill="url(#vignette)"/>

  <!-- 2. ENVELOPE: Deep Burgundy (#722F37) with Open Triangular Flap UPWARD -->
  <g filter="url(#envelope-shadow)">
    <!-- Envelope Pocket Body (Behind Card) -->
    <rect x="80" y="240" width="440" height="500" rx="18" fill="#722F37"/>

    <!-- Open Triangular Flap (Apex at top center) -->
    <path d="M 80,242 L 300,56 L 520,242 Z" fill="#722F37"/>

    <!-- Flap Ambient Top Lighting -->
    <path d="M 80,242 L 300,56 L 520,242 Z" fill="url(#linen-base)" opacity="0.08"/>

    <!-- Inner Flap Liner: Soft Blush Pink with Gold Foil Floral Shimmer -->
    <path d="M 108,236 L 300,90 L 492,236 Z" fill="#FAE8EC"/>
    <path d="M 108,236 L 300,90 L 492,236 Z" fill="url(#gold-floral)"/>
    <!-- Shimmer Sheen -->
    <path d="M 108,236 L 300,90 L 492,236 Z" fill="url(#gold-foil)" opacity="0.12"/>
    <path d="M 108,236 L 300,90 L 300,236 Z" fill="#ffffff" opacity="0.14"/>

    <!-- Inside Throat Liner (Extending down into envelope behind card) -->
    <rect x="108" y="236" width="384" height="130" fill="#FAE8EC"/>
    <rect x="108" y="236" width="384" height="130" fill="url(#gold-floral)"/>

    <!-- Flap Fold Crease Shadow -->
    <line x1="80" y1="242" x2="520" y2="242" stroke="#000000" stroke-width="2.5" opacity="0.35"/>
    <line x1="108" y1="238" x2="492" y2="238" stroke="#3A0D13" stroke-width="1.2" opacity="0.3"/>
  </g>

  <!-- 3. CARD: Centered In Front with box-shadow: 0 14px 30px -6px rgba(0,0,0,0.28) -->
  <g filter="url(#card-elevation-shadow)">
    <rect x="122" y="218" width="356" height="508" rx="14" fill="#FFFFFF"/>
    <!-- Card Frame Artwork -->
    <image href="${blushFrameBase64}" x="122" y="218" width="356" height="508" preserveAspectRatio="none" clip-path="url(#card-clip)"/>
  </g>

  <!-- 4. CARD TYPOGRAPHY (Centered) -->
  <g text-anchor="middle">
    <text x="300" y="426" font-family="'Playfair Display', Georgia, serif" font-size="14.5" font-style="italic" fill="#5A4A42" font-weight="400">Something</text>
    <text x="300" y="448" font-family="'Playfair Display', Georgia, serif" font-size="14.5" font-style="italic" fill="#5A4A42" font-weight="400">old...something new...</text>
    <text x="300" y="470" font-family="'Playfair Display', Georgia, serif" font-size="14.5" font-style="italic" fill="#5A4A42" font-weight="400">something borrowed...</text>
    <text x="300" y="492" font-family="'Playfair Display', Georgia, serif" font-size="14.5" font-style="italic" fill="#5A4A42" font-weight="400">something red and</text>
    <text x="300" y="514" font-family="'Playfair Display', Georgia, serif" font-size="14.5" font-style="italic" fill="#5A4A42" font-weight="400">pink too</text>
  </g>
</svg>`;

// -------------------------------------------------------------
// 2. SOMETHING BLUE MOCKUP SVG
// -------------------------------------------------------------
const somethingBlueSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="100%" height="100%">
  <defs>
    <!-- White Marble Background -->
    <linearGradient id="marble-base" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCFCFD"/>
      <stop offset="40%" stop-color="#F7F8FA"/>
      <stop offset="70%" stop-color="#F1F3F6"/>
      <stop offset="100%" stop-color="#EAECEF"/>
    </linearGradient>

    <radialGradient id="marble-vignette" cx="50%" cy="50%" r="70%">
      <stop offset="40%" stop-color="#ffffff" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#D8DCE2" stop-opacity="0.5"/>
    </radialGradient>

    <!-- Delicate Blue Toile Pattern Tile -->
    <pattern id="blue-toile" width="140" height="140" patternUnits="userSpaceOnUse">
      <g stroke="#486E8D" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <g transform="translate(70, 70)">
          <!-- Hydrangea Cluster -->
          <circle cx="0" cy="0" r="3.5" fill="#E8EEF5" stroke-width="0.8"/>
          <circle cx="-5" cy="-4" r="3.6" fill="#E8EEF5" stroke-width="0.8"/>
          <circle cx="5" cy="-4" r="3.6" fill="#E8EEF5" stroke-width="0.8"/>
          <circle cx="-6" cy="4" r="3.5" fill="#E8EEF5" stroke-width="0.8"/>
          <circle cx="6" cy="4" r="3.5" fill="#E8EEF5" stroke-width="0.8"/>
          <!-- Botanical Vines -->
          <path d="M 0,-9 C -10,-22 -22,-18 -28,-30 C -26,-19 -16,-14 0,-9" stroke-width="0.85" fill="#EBF2F7"/>
          <path d="M 0,-9 C 10,-22 22,-18 28,-30 C 26,-19 16,-14 0,-9" stroke-width="0.85" fill="#EBF2F7"/>
          <path d="M -9,0 C -22,7 -25,20 -35,26 C -25,22 -17,14 -9,0" stroke-width="0.8" fill="#EBF2F7"/>
          <path d="M 9,0 C 22,7 25,20 35,26 C 25,22 17,14 9,0" stroke-width="0.8" fill="#EBF2F7"/>
        </g>
        <g transform="translate(0, 0)"><circle cx="0" cy="0" r="3" fill="#E8EEF5" stroke-width="0.75"/><path d="M 0,0 Q 12,8 18,20" stroke-width="0.7"/></g>
        <g transform="translate(140, 0)"><circle cx="0" cy="0" r="3" fill="#E8EEF5" stroke-width="0.75"/></g>
        <g transform="translate(0, 140)"><circle cx="0" cy="0" r="3" fill="#E8EEF5" stroke-width="0.75"/></g>
        <g transform="translate(140, 140)"><circle cx="0" cy="0" r="3" fill="#E8EEF5" stroke-width="0.75"/></g>
        <circle cx="30" cy="35" r="1.3" fill="#486E8D"/>
        <circle cx="105" cy="100" r="1.3" fill="#486E8D"/>
      </g>
    </pattern>

    <!-- Drop Shadows -->
    <filter id="envelope-shadow-blue" x="-20%" y="-15%" width="140%" height="135%">
      <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#000000" flood-opacity="0.3"/>
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.14"/>
    </filter>

    <filter id="card-elevation-shadow-blue" x="-30%" y="-20%" width="160%" height="150%">
      <feDropShadow dx="0" dy="14" stdDeviation="15" flood-color="#000000" flood-opacity="0.28"/>
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#000000" flood-opacity="0.14"/>
    </filter>

    <clipPath id="card-clip-blue">
      <rect x="122" y="218" width="356" height="508" rx="14"/>
    </clipPath>
  </defs>

  <!-- 1. BACKDROP: Subtle White Marble -->
  <rect width="600" height="800" fill="url(#marble-base)"/>
  <!-- Marble Veins -->
  <g fill="none" stroke-linecap="round" opacity="0.32">
    <path d="M -20,60 Q 120,90 220,160 T 380,280 T 510,350 T 620,470" stroke="#8E97A4" stroke-width="2"/>
    <path d="M 380,280 Q 480,210 620,180" stroke="#717A88" stroke-width="1.2"/>
    <path d="M 60,680 Q 220,740 450,780" stroke="#9AA2AF" stroke-width="1.5"/>
  </g>
  <rect width="600" height="800" fill="url(#marble-vignette)" style="mix-blend-mode: multiply;"/>

  <!-- 2. ENVELOPE: Dusty Slate Blue (#5B7C99) with Open Triangular Flap UPWARD -->
  <g filter="url(#envelope-shadow-blue)">
    <!-- Envelope Pocket Body (Behind Card) -->
    <rect x="80" y="240" width="440" height="500" rx="18" fill="#5B7C99"/>

    <!-- Open Triangular Flap (Apex at top center) -->
    <path d="M 80,242 L 300,56 L 520,242 Z" fill="#5B7C99"/>

    <!-- Flap Ambient Top Lighting -->
    <path d="M 80,242 L 300,56 L 520,242 Z" fill="#ffffff" opacity="0.12"/>

    <!-- Inner Flap Liner: Classic Delicate Blue Toile on White -->
    <path d="M 108,236 L 300,90 L 492,236 Z" fill="#FFFFFF"/>
    <path d="M 108,236 L 300,90 L 492,236 Z" fill="url(#blue-toile)"/>
    <!-- Light Sheen on Liner -->
    <path d="M 108,236 L 300,90 L 300,236 Z" fill="#ffffff" opacity="0.1"/>

    <!-- Inside Throat Liner -->
    <rect x="108" y="236" width="384" height="130" fill="#FFFFFF"/>
    <rect x="108" y="236" width="384" height="130" fill="url(#blue-toile)"/>

    <!-- Flap Fold Crease Shadow -->
    <line x1="80" y1="242" x2="520" y2="242" stroke="#000000" stroke-width="2.5" opacity="0.32"/>
    <line x1="108" y1="238" x2="492" y2="238" stroke="#334B61" stroke-width="1.2" opacity="0.3"/>
  </g>

  <!-- 3. CARD: Centered In Front with box-shadow: 0 14px 30px -6px rgba(0,0,0,0.28) -->
  <g filter="url(#card-elevation-shadow-blue)">
    <rect x="122" y="218" width="356" height="508" rx="14" fill="#FFFFFF"/>
    <!-- Card Frame Artwork -->
    <image href="${somethingBlueFrameBase64}" x="122" y="218" width="356" height="508" preserveAspectRatio="none" clip-path="url(#card-clip-blue)"/>
  </g>

  <!-- 4. CARD TYPOGRAPHY (Centered) -->
  <g text-anchor="middle">
    <text x="300" y="472" font-family="'Cormorant Garamond', Georgia, serif" font-size="20" letter-spacing="1.5" fill="#355B82" font-weight="600">Something Blue</text>
    <text x="300" y="498" font-family="'Cormorant Garamond', Georgia, serif" font-size="14.5" letter-spacing="2.5" fill="#355B82" font-weight="500">BEFORE "I DO"</text>
  </g>
</svg>`;

// -------------------------------------------------------------
// 3. AUTUMN BLOOMS MOCKUP SVG
// -------------------------------------------------------------
const autumnBloomsSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="100%" height="100%">
  <defs>
    <!-- Warm Artisan Kraft Background -->
    <linearGradient id="kraft-base" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D9C2A7"/>
      <stop offset="35%" stop-color="#CDAF90"/>
      <stop offset="70%" stop-color="#C4A281"/>
      <stop offset="100%" stop-color="#B89472"/>
    </linearGradient>

    <pattern id="kraft-flecks" width="120" height="120" patternUnits="userSpaceOnUse">
      <circle cx="12" cy="18" r="0.8" fill="#845D3B" opacity="0.35"/>
      <circle cx="45" cy="85" r="1.1" fill="#755030" opacity="0.3"/>
      <circle cx="98" cy="34" r="0.7" fill="#6B4728" opacity="0.38"/>
      <path d="M 24,52 Q 28,54 32,51" stroke="#664322" stroke-width="0.8" fill="none" opacity="0.28"/>
      <circle cx="38" cy="38" r="0.5" fill="#FFFFFF" opacity="0.35"/>
    </pattern>

    <radialGradient id="kraft-vignette" cx="50%" cy="50%" r="72%">
      <stop offset="40%" stop-color="#ffffff" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#7A522E" stop-opacity="0.55"/>
    </radialGradient>

    <!-- Gingham Pattern Tile -->
    <pattern id="autumn-gingham-tile" width="50" height="50" patternUnits="userSpaceOnUse">
      <rect width="50" height="50" fill="#F8EFE4"/>
      <!-- Vertical Bands -->
      <rect x="0" y="0" width="25" height="50" fill="#D39F75" opacity="0.75"/>
      <!-- Horizontal Bands -->
      <rect x="0" y="0" width="50" height="25" fill="#D39F75" opacity="0.75"/>
      <!-- Intersections -->
      <rect x="0" y="0" width="25" height="25" fill="#9C5E32" opacity="0.85"/>
      <rect x="25" y="25" width="25" height="25" fill="#F8EFE4"/>
    </pattern>

    <!-- Drop Shadows -->
    <filter id="envelope-shadow-autumn" x="-20%" y="-15%" width="140%" height="135%">
      <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#000000" flood-opacity="0.32"/>
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.16"/>
    </filter>

    <filter id="card-elevation-shadow-autumn" x="-30%" y="-20%" width="160%" height="150%">
      <feDropShadow dx="0" dy="14" stdDeviation="15" flood-color="#000000" flood-opacity="0.28"/>
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#000000" flood-opacity="0.14"/>
    </filter>

    <clipPath id="card-clip-autumn">
      <rect x="122" y="218" width="356" height="508" rx="14"/>
    </clipPath>
  </defs>

  <!-- 1. BACKDROP: Warm Artisan Kraft Paper -->
  <rect width="600" height="800" fill="url(#kraft-base)"/>
  <rect width="600" height="800" fill="url(#kraft-flecks)"/>
  <rect width="600" height="800" fill="url(#kraft-vignette)" style="mix-blend-mode: multiply;"/>

  <!-- 2. ENVELOPE: Warm Terracotta (#B3673B) with Open Triangular Flap UPWARD -->
  <g filter="url(#envelope-shadow-autumn)">
    <!-- Envelope Pocket Body (Behind Card) -->
    <rect x="80" y="240" width="440" height="500" rx="18" fill="#B3673B"/>

    <!-- Open Triangular Flap (Apex at top center) -->
    <path d="M 80,242 L 300,56 L 520,242 Z" fill="#B3673B"/>

    <!-- Flap Ambient Top Lighting -->
    <path d="M 80,242 L 300,56 L 520,242 Z" fill="#ffffff" opacity="0.14"/>

    <!-- Inner Flap Liner: Warm Beige & Brown Buffalo/Gingham Plaid Check -->
    <path d="M 108,236 L 300,90 L 492,236 Z" fill="url(#autumn-gingham-tile)"/>

    <!-- Light Sheen on Liner -->
    <path d="M 108,236 L 300,90 L 300,236 Z" fill="#ffffff" opacity="0.08"/>

    <!-- Inside Throat Liner -->
    <rect x="108" y="236" width="384" height="130" fill="url(#autumn-gingham-tile)"/>

    <!-- Flap Fold Crease Shadow -->
    <line x1="80" y1="242" x2="520" y2="242" stroke="#000000" stroke-width="2.5" opacity="0.35"/>
    <line x1="108" y1="238" x2="492" y2="238" stroke="#5E2C10" stroke-width="1.2" opacity="0.3"/>
  </g>

  <!-- 3. CARD: Centered In Front with box-shadow: 0 14px 30px -6px rgba(0,0,0,0.28) -->
  <g filter="url(#card-elevation-shadow-autumn)">
    <rect x="122" y="218" width="356" height="508" rx="14" fill="#FFFFFF"/>
    <!-- Card Frame Artwork -->
    <image href="${autumnFrameBase64}" x="122" y="218" width="356" height="508" preserveAspectRatio="none" clip-path="url(#card-clip-autumn)"/>
  </g>

  <!-- 4. CARD TYPOGRAPHY (Centered) -->
  <g text-anchor="middle">
    <text x="300" y="475" font-family="'Great Vibes', 'Alex Brush', cursive" font-size="34" fill="#B3673B" font-weight="normal">Fall in love</text>
  </g>
</svg>`;

// Write all 3 files
fs.writeFileSync(path.join(templatesAssetDir, 'blush-burgundy-blooms-mockup.svg'), blushBurgundySvg);
fs.writeFileSync(path.join(templatesAssetDir, 'something-blue-mockup.svg'), somethingBlueSvg);
fs.writeFileSync(path.join(templatesAssetDir, 'autumn-blooms-mockup.svg'), autumnBloomsSvg);

console.log('Successfully generated all 3 mockup SVGs in public/assets/templates!');
