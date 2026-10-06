const fs = require("fs");
const path = require("path");

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const writeAsset = (relPath, content) => {
  const p1 = path.join(__dirname, "..", relPath);
  const p2 = path.join(__dirname, "..", "invitehub", relPath);
  ensureDir(path.dirname(p1));
  ensureDir(path.dirname(p2));
  fs.writeFileSync(p1, content, "utf8");
  fs.writeFileSync(p2, content, "utf8");
  console.log("Saved:", relPath);
};

// ----------------------------------------------------------------------
// 1. DISTINCT ILLUSTRATION SVGs (Toggleable / Selectable Vector Layers)
// ----------------------------------------------------------------------

// 1.1 Black silk ribbon bow for "Ribbons, Bows"
const blackSilkBowSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 480" width="300" height="480">
  <defs>
    <filter id="bowShad" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="2" dy="6" stdDeviation="6" flood-color="#000000" flood-opacity="0.28" />
    </filter>
  </defs>
  <g filter="url(#bowShad)">
    <!-- Hanging tail left -->
    <path d="M70 120 C 40 220, 20 340, 45 440 C 52 410, 68 350, 85 240 C 95 180, 85 130, 70 120 Z" fill="#1C1C1F" />
    <!-- Hanging tail right -->
    <path d="M120 125 C 135 240, 160 380, 150 470 C 138 440, 125 380, 115 280 C 108 200, 112 140, 120 125 Z" fill="#111113" />
    <!-- Left bow loop -->
    <path d="M95 105 C 50 60, -20 70, 5 120 C 25 155, 75 135, 95 110 Z" fill="#242429" stroke="#111113" stroke-width="1.5" />
    <path d="M85 108 C 45 75, 5 85, 20 120 C 35 140, 70 125, 85 112 Z" fill="#383840" opacity="0.35" />
    <!-- Right bow loop -->
    <path d="M95 105 C 145 55, 215 65, 190 120 C 170 155, 115 135, 95 110 Z" fill="#1A1A1D" stroke="#111113" stroke-width="1.5" />
    <path d="M105 108 C 145 75, 190 85, 175 120 C 160 140, 125 125, 105 112 Z" fill="#2E2E35" opacity="0.4" />
    <!-- Central knot -->
    <ellipse cx="96" cy="110" rx="18" ry="16" fill="#141416" stroke="#000000" stroke-width="1" />
  </g>
</svg>`;
writeAsset("public/assets/templates/illustrations/black-silk-bow.svg", blackSilkBowSvg);

// 1.2 Cornflowers & wildflowers for "Painted Petals"
const cornflowersSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 700" width="500" height="700">
  <defs>
    <radialGradient id="cfBlue" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#5C8FD6" />
      <stop offset="60%" stop-color="#2D63B5" />
      <stop offset="100%" stop-color="#19458A" />
    </radialGradient>
  </defs>
  <g>
    <circle cx="60" cy="80" r="18" fill="url(#cfBlue)" />
    <circle cx="100" cy="50" r="14" fill="#4B80CE" opacity="0.85" />
    <circle cx="440" cy="80" r="18" fill="url(#cfBlue)" />
    <circle cx="400" cy="50" r="14" fill="#4B80CE" opacity="0.85" />
    <circle cx="60" cy="620" r="18" fill="url(#cfBlue)" />
    <circle cx="440" cy="620" r="18" fill="url(#cfBlue)" />
  </g>
</svg>`;
writeAsset("public/assets/templates/illustrations/cornflowers-wildflowers.svg", cornflowersSvg);

// 1.3 Teapot and cupcakes for "It's Tea Time"
const teapotCupcakesSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200" width="320" height="200">
  <g transform="translate(30, 20)">
    <ellipse cx="60" cy="70" rx="36" ry="28" fill="#F6C7B2" stroke="#B86E53" stroke-width="2.5" />
    <path d="M60 42 Q60 30 70 30 Q80 30 75 42" stroke="#B86E53" stroke-width="2.5" fill="none" />
    <path d="M24 60 C5 60, 5 90, 30 90" stroke="#B86E53" stroke-width="3.5" fill="none" />
    <path d="M96 68 Q115 60 120 48 Q115 75 92 84" stroke="#B86E53" stroke-width="2.5" fill="#F6C7B2" />
    <ellipse cx="60" cy="42" rx="20" ry="6" fill="#B86E53" />
  </g>
  <g transform="translate(160, 65)">
    <path d="M10 20 Q10 42 28 42 Q46 42 46 20 Z" fill="#FBF3E4" stroke="#B86E53" stroke-width="2" />
    <ellipse cx="28" cy="45" rx="24" ry="4" fill="#E5D3B8" stroke="#B86E53" stroke-width="1" />
  </g>
</svg>`;
writeAsset("public/assets/templates/illustrations/teapot-cupcakes.svg", teapotCupcakesSvg);

// 1.4 Amalfi lemons for "Lemons & Blossoms"
const amalfiLemonsSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <radialGradient id="lemGrad" cx="40%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#FFF566" />
      <stop offset="65%" stop-color="#FCD34D" />
      <stop offset="100%" stop-color="#F59E0B" />
    </radialGradient>
  </defs>
  <g transform="translate(40, 40)">
    <ellipse cx="120" cy="110" rx="42" ry="30" fill="url(#lemGrad)" transform="rotate(-35 120 110)" />
    <ellipse cx="40" cy="65" rx="36" ry="26" fill="url(#lemGrad)" transform="rotate(25 40 65)" />
    <circle cx="75" cy="85" r="8" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" />
    <circle cx="75" cy="85" r="3" fill="#FCD34D" />
  </g>
</svg>`;
writeAsset("public/assets/templates/illustrations/amalfi-lemons.svg", amalfiLemonsSvg);

// 1.5 Woodland creatures for "Moonlit Grove"
const woodlandCreaturesSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <g transform="translate(50, 50)">
    <!-- Owl -->
    <ellipse cx="40" cy="60" rx="22" ry="32" fill="#78563A" stroke="#452C18" stroke-width="1.5" />
    <circle cx="32" cy="45" r="7" fill="#FDE68A" />
    <circle cx="48" cy="45" r="7" fill="#FDE68A" />
    <polygon points="40,50 37,56 43,56" fill="#F59E0B" />
  </g>
</svg>`;
writeAsset("public/assets/templates/illustrations/woodland-creatures.svg", woodlandCreaturesSvg);

// 1.6 Italian trattoria graphics for "Taste Of Italy"
const italianTrattoriaSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 160" width="360" height="160">
  <!-- Wine Bottle -->
  <path d="M30 40 L30 15 L40 15 L40 40 Q52 55 52 95 L18 95 Q18 55 30 40 Z" fill="#2E6930" stroke="#1B431D" stroke-width="2" />
  <rect x="20" y="75" width="30" height="42" fill="#D4A373" stroke="#9A6B3D" stroke-width="1.5" />
  <!-- Wine Glass -->
  <g transform="translate(85, 30)">
    <path d="M10 15 Q10 48 30 48 Q50 48 50 15 Z" fill="#991B1B" opacity="0.85" stroke="#7F1D1D" stroke-width="1.5" />
    <line x1="30" y1="48" x2="30" y2="80" stroke="#7F1D1D" stroke-width="2" />
    <ellipse cx="30" cy="80" rx="16" ry="5" fill="#7F1D1D" />
  </g>
  <!-- Tomatoes -->
  <g transform="translate(200, 30)">
    <circle cx="30" cy="45" r="20" fill="#EF4444" stroke="#B91C1C" stroke-width="1.5" />
    <circle cx="65" cy="55" r="22" fill="#DC2626" stroke="#B91C1C" stroke-width="1.5" />
  </g>
</svg>`;
writeAsset("public/assets/templates/illustrations/italian-trattoria.svg", italianTrattoriaSvg);

// ----------------------------------------------------------------------
// 2. COMPOSITE MOCKUP SVGs (Matching User Screenshots Exactly)
// ----------------------------------------------------------------------
// Each mockup is 800 x 533 (landscape card container matching 3-col grid in screenshot)

// 2.1 Elegant Lace Mockup
const elegantLaceMockupSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 533" width="800" height="533">
  <defs>
    <!-- Dark rose bed backdrop -->
    <radialGradient id="darkBg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#2D1F23" />
      <stop offset="60%" stop-color="#181114" />
      <stop offset="100%" stop-color="#0B0709" />
    </radialGradient>
    <radialGradient id="roseGlow1" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#FCE7EB" />
      <stop offset="35%" stop-color="#F3B8C5" />
      <stop offset="70%" stop-color="#D9778D" />
      <stop offset="100%" stop-color="#732D3F" />
    </radialGradient>
    <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#000000" flood-opacity="0.45" />
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000000" flood-opacity="0.25" />
    </filter>
  </defs>
  <!-- 1. Background Surface -->
  <rect width="100%" height="100%" rx="16" fill="url(#darkBg)" />
  <!-- Floral bed perimeter -->
  <g opacity="0.75">
    <circle cx="80" cy="120" r="75" fill="url(#roseGlow1)" />
    <circle cx="100" cy="420" r="85" fill="url(#roseGlow1)" />
    <circle cx="720" cy="140" r="80" fill="url(#roseGlow1)" />
    <circle cx="700" cy="400" r="90" fill="url(#roseGlow1)" />
  </g>

  <!-- 2. Envelope Underlay (Pearlescent soft-white open flap envelope behind card to left) -->
  <g transform="translate(150, 80)">
    <!-- Envelope body -->
    <rect x="0" y="80" width="340" height="340" rx="4" fill="#F8F6F0" stroke="#E6E0D2" stroke-width="1.5" />
    <!-- Flap open to top left -->
    <polygon points="0,80 170,-20 340,80" fill="#FAF8F5" stroke="#E6E0D2" stroke-width="1.5" />
    <polygon points="10,80 170,-10 330,80" fill="#FFFFFF" opacity="0.8" />
  </g>

  <!-- 3. Centered Invitation Card slightly emerging -->
  <g filter="url(#cardShadow)" transform="translate(260, 45)">
    <!-- Scalloped Oval Lace Border Base -->
    <rect width="280" height="440" rx="140" fill="#FAF6EE" stroke="#E2DAC6" stroke-width="1.5" />
    <!-- Laser cut scallop micro rings -->
    <rect x="8" y="8" width="264" height="424" rx="132" fill="none" stroke="#D4C8AE" stroke-width="4" stroke-dasharray="6,4" opacity="0.8" />
    <rect x="18" y="18" width="244" height="404" rx="122" fill="#FFFDF9" stroke="#E5DCC8" stroke-width="1" />
    <!-- Inner writing area -->
    <rect x="28" y="28" width="224" height="384" rx="112" fill="#FFFFFF" />

    <!-- Typography -->
    <text x="140" y="145" text-anchor="middle" font-family="'Cinzel', 'Playfair Display', serif" font-size="9" letter-spacing="3" fill="#6B5345">JOIN US FOR</text>
    <text x="140" y="200" text-anchor="middle" font-family="'Great Vibes', 'Alex Brush', cursive" font-size="34" fill="#3D291F">Emma</text>
    <text x="140" y="235" text-anchor="middle" font-family="'Great Vibes', 'Alex Brush', cursive" font-size="34" fill="#3D291F">Johnson</text>
    <text x="140" y="280" text-anchor="middle" font-family="'Cormorant Garamond', serif" font-size="10.5" font-style="italic" fill="#523B2E">saturday, april 20th</text>
    <text x="140" y="296" text-anchor="middle" font-family="'Cormorant Garamond', serif" font-size="10" font-style="italic" fill="#523B2E">at 5:00 in the evening</text>
    <text x="140" y="330" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="8.5" letter-spacing="1.5" font-weight="600" fill="#402C21">THE GRAND BALLROOM</text>
    <text x="140" y="348" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="7.5" letter-spacing="1" fill="#755E50">SPRINGFIELD, IL</text>
  </g>
</svg>`;
writeAsset("public/assets/templates/elegant-lace-mockup.svg", elegantLaceMockupSvg);

// 2.2 Ribbons, Bows Mockup
const ribbonsBowsMockupSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 533" width="800" height="533">
  <defs>
    <filter id="cardShad" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#000000" flood-opacity="0.22" />
    </filter>
  </defs>
  <!-- 1. Background Surface: Soft Ivory Lace Texture -->
  <rect width="100%" height="100%" rx="16" fill="#F8F5EE" />
  <g opacity="0.35" stroke="#D8CEB4" stroke-width="1" fill="none">
    <circle cx="100" cy="100" r="70" stroke-dasharray="3,3" />
    <circle cx="700" cy="100" r="70" stroke-dasharray="3,3" />
    <circle cx="100" cy="433" r="70" stroke-dasharray="3,3" />
    <circle cx="700" cy="433" r="70" stroke-dasharray="3,3" />
  </g>

  <!-- 2. Envelope Underlay (Black envelope with striped liner on left) -->
  <g transform="translate(180, 75)">
    <!-- Black envelope body -->
    <rect x="0" y="70" width="300" height="340" rx="4" fill="#18181B" stroke="#000000" stroke-width="1.5" />
    <!-- Open flap with striped liner -->
    <polygon points="0,70 150,-20 300,70" fill="#18181B" />
    <!-- Striped liner triangle -->
    <polygon points="15,70 150,-5 285,70" fill="#FFFFFF" />
    <line x1="70" y1="70" x2="150" y2="-5" stroke="#18181B" stroke-width="10" />
    <line x1="110" y1="70" x2="165" y2="10" stroke="#18181B" stroke-width="10" />
    <line x1="150" y1="70" x2="190" y2="25" stroke="#18181B" stroke-width="10" />
    <line x1="190" y1="70" x2="215" y2="40" stroke="#18181B" stroke-width="10" />
    <line x1="230" y1="70" x2="245" y2="55" stroke="#18181B" stroke-width="10" />
  </g>

  <!-- 3. Centered Invitation Card with bold hanging black silk ribbon bow -->
  <g filter="url(#cardShad)" transform="translate(290, 50)">
    <rect width="280" height="430" rx="8" fill="#FFFFFF" stroke="#EBEAE6" stroke-width="1" />
    <!-- Hanging black ribbon bow graphic at top right -->
    <g transform="translate(150, 10)">
      <path d="M40 70 C 25 130, 15 200, 30 270 C 35 250, 45 210, 55 150 Z" fill="#1C1C1F" />
      <path d="M75 75 C 85 145, 100 230, 95 300 C 88 280, 80 230, 72 170 Z" fill="#111113" />
      <path d="M60 65 C 30 35, -10 45, 5 75 C 18 95, 48 85, 60 70 Z" fill="#242429" />
      <path d="M60 65 C 90 35, 130 45, 115 75 C 102 95, 72 85, 60 70 Z" fill="#1A1A1D" />
      <ellipse cx="60" cy="68" rx="11" ry="10" fill="#141416" />
    </g>

    <!-- Typography -->
    <text x="80" y="115" text-anchor="middle" font-family="'Playfair Display', serif" font-size="9.5" font-style="italic" fill="#555">join us for a</text>
    <text x="85" y="150" text-anchor="middle" font-family="'Great Vibes', cursive" font-size="32" fill="#111">Bridal</text>
    <text x="90" y="185" text-anchor="middle" font-family="'Great Vibes', cursive" font-size="32" fill="#111">Shower</text>
    <text x="80" y="225" text-anchor="middle" font-family="'Playfair Display', serif" font-size="9.5" font-style="italic" fill="#555">celebrating</text>
    <text x="85" y="258" text-anchor="middle" font-family="'Playfair Display', serif" font-size="14" font-weight="700" letter-spacing="1.5" fill="#111">DANIELLE</text>
    <text x="85" y="278" text-anchor="middle" font-family="'Playfair Display', serif" font-size="14" font-weight="700" letter-spacing="1.5" fill="#111">JOHNSON</text>
    <text x="80" y="325" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="8.5" font-weight="600" letter-spacing="1" fill="#333">MAY 18 AT 12 PM</text>
    <text x="80" y="345" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="8" letter-spacing="0.5" fill="#666">14 Meadow Drive</text>
  </g>
</svg>`;
writeAsset("public/assets/templates/ribbons-bows-mockup.svg", ribbonsBowsMockupSvg);

// 2.3 Painted Petals Mockup
const paintedPetalsMockupSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 533" width="800" height="533">
  <defs>
    <filter id="cardShad" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#000000" flood-opacity="0.2" />
    </filter>
  </defs>
  <!-- 1. Background Surface: White debossed paper -->
  <rect width="100%" height="100%" rx="16" fill="#F8F8F8" />
  <g fill="none" stroke="#ECECEC" stroke-width="2" opacity="0.8">
    <circle cx="80" cy="80" r="50" />
    <circle cx="720" cy="80" r="50" />
    <circle cx="80" cy="450" r="50" />
    <circle cx="720" cy="450" r="50" />
  </g>

  <!-- 2. Envelope Underlay (Royal Cobalt Blue on left) -->
  <g transform="translate(180, 75)">
    <rect x="0" y="70" width="300" height="340" rx="4" fill="#10357A" stroke="#0B2558" stroke-width="1.5" />
    <polygon points="0,70 150,-20 300,70" fill="#143D8A" />
    <polygon points="12,70 150,-6 288,70" fill="#0C2C66" />
  </g>

  <!-- 3. Centered Invitation Card with soft watercolor cornflowers -->
  <g filter="url(#cardShad)" transform="translate(290, 50)">
    <rect width="280" height="430" rx="10" fill="#FFFDF8" stroke="#E6EDF5" stroke-width="1" />
    <!-- Watercolor blue floral border around card -->
    <g opacity="0.9">
      <circle cx="35" cy="40" r="12" fill="#2D63B5" />
      <circle cx="55" cy="55" r="9" fill="#5C8FD6" />
      <circle cx="245" cy="40" r="12" fill="#2D63B5" />
      <circle cx="225" cy="55" r="9" fill="#5C8FD6" />
      <circle cx="35" cy="390" r="12" fill="#2D63B5" />
      <circle cx="245" cy="390" r="12" fill="#2D63B5" />
      <!-- Baby's breath and green leaves -->
      <circle cx="25" cy="120" r="7" fill="#88B88A" />
      <circle cx="255" cy="120" r="7" fill="#88B88A" />
      <circle cx="25" cy="320" r="7" fill="#88B88A" />
      <circle cx="255" cy="320" r="7" fill="#88B88A" />
    </g>

    <!-- Typography -->
    <text x="140" y="110" text-anchor="middle" font-family="'Cinzel', serif" font-size="9" letter-spacing="2" fill="#1B3E75">JOIN US TO SHOWER</text>
    <text x="140" y="165" text-anchor="middle" font-family="'Great Vibes', cursive" font-size="34" fill="#10357A">Emilia</text>
    <text x="140" y="200" text-anchor="middle" font-family="'Great Vibes', cursive" font-size="34" fill="#10357A">Hernandez</text>
    <text x="140" y="250" text-anchor="middle" font-family="'Cormorant Garamond', serif" font-size="10.5" letter-spacing="1" fill="#2A4D80">SUNDAY, JUNE 17 AT 1 PM</text>
    <text x="140" y="280" text-anchor="middle" font-family="'Cormorant Garamond', serif" font-size="10" letter-spacing="1.5" fill="#2A4D80">HIGH NOON FARM</text>
    <text x="140" y="325" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="8" letter-spacing="1" fill="#5C769D">RSVP DETAILS</text>
  </g>
</svg>`;
writeAsset("public/assets/templates/painted-petals-mockup.svg", paintedPetalsMockupSvg);

// 2.4 Gingham Blooms Mockup
const ginghamBloomsMockupSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 533" width="800" height="533">
  <defs>
    <filter id="cardShad" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#000000" flood-opacity="0.3" />
    </filter>
  </defs>
  <!-- 1. Background Surface: Warm cork/wood -->
  <rect width="100%" height="100%" rx="16" fill="#2D1A10" />
  <rect width="100%" height="100%" rx="16" fill="#3D2619" opacity="0.6" />

  <!-- 2. Envelope Underlay (Warm metallic gold/ochre on left) -->
  <g transform="translate(180, 75)">
    <rect x="0" y="70" width="300" height="340" rx="4" fill="#B8860B" stroke="#9A6F09" stroke-width="1.5" />
    <polygon points="0,70 150,-20 300,70" fill="#C59B27" />
    <polygon points="12,70 150,-6 288,70" fill="#D4AF37" opacity="0.75" />
  </g>

  <!-- 3. Centered Invitation Card: Scalloped pink gingham border + ivory badge -->
  <g filter="url(#cardShad)" transform="translate(290, 50)">
    <!-- Scalloped pink gingham border -->
    <rect width="280" height="430" rx="18" fill="#F8E5E8" stroke="#D895A2" stroke-width="2" />
    <!-- Gingham tiles simulation -->
    <g fill="#E2A6B2" opacity="0.5">
      <rect x="0" y="0" width="280" height="430" stroke="#C97587" stroke-width="1.5" fill="none" />
    </g>
    <!-- Inner Ivory badge -->
    <rect x="30" y="35" width="220" height="360" rx="10" fill="#FFFDF9" stroke="#C5A059" stroke-width="1.5" />
    <rect x="36" y="41" width="208" height="348" rx="7" fill="none" stroke="#C5A059" stroke-width="0.6" opacity="0.6" />

    <!-- Typography -->
    <text x="140" y="115" text-anchor="middle" font-family="'Playfair Display', serif" font-size="9" font-style="italic" fill="#8B3A4A">join us to celebrate</text>
    <text x="140" y="170" text-anchor="middle" font-family="'Playfair Display', serif" font-size="28" font-weight="700" fill="#7A2838">Jess</text>
    <text x="140" y="202" text-anchor="middle" font-family="'Playfair Display', serif" font-size="28" font-weight="700" fill="#7A2838">Walters</text>
    <text x="140" y="260" text-anchor="middle" font-family="'Playfair Display', serif" font-size="10.5" fill="#6B303C">Saturday, November 11th</text>
    <text x="140" y="278" text-anchor="middle" font-family="'Playfair Display', serif" font-size="10.5" fill="#6B303C">at 8 PM</text>
    <text x="140" y="325" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="8.5" letter-spacing="1" fill="#7A424E">The Gingham Manor</text>
    <text x="140" y="342" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="7.5" fill="#99606C">123 Rose Avenue</text>
  </g>
</svg>`;
writeAsset("public/assets/templates/gingham-blooms-mockup.svg", ginghamBloomsMockupSvg);

// 2.5 It's Tea Time Mockup
const itsTeaTimeMockupSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 533" width="800" height="533">
  <defs>
    <filter id="cardShad" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#000000" flood-opacity="0.2" />
    </filter>
  </defs>
  <!-- 1. Background Surface: Whimsical dreamy blue sky with fluffy clouds -->
  <rect width="100%" height="100%" rx="16" fill="#BEE3F8" />
  <g fill="#FFFFFF" opacity="0.8">
    <ellipse cx="100" cy="140" rx="90" ry="40" />
    <ellipse cx="160" cy="120" rx="70" ry="35" />
    <ellipse cx="700" cy="140" rx="90" ry="40" />
    <ellipse cx="650" cy="120" rx="70" ry="35" />
    <ellipse cx="120" cy="420" rx="100" ry="45" />
    <ellipse cx="680" cy="420" rx="100" ry="45" />
  </g>

  <!-- 2. Envelope Underlay (Sunny tangerine orange on left) -->
  <g transform="translate(180, 75)">
    <rect x="0" y="70" width="300" height="340" rx="4" fill="#FF8C00" stroke="#E67E00" stroke-width="1.5" />
    <polygon points="0,70 150,-20 300,70" fill="#FFA534" />
    <polygon points="12,70 150,-6 288,70" fill="#FFF8EE" />
    <!-- Polka dot liner -->
    <circle cx="80" cy="30" r="3" fill="#D97706" />
    <circle cx="120" cy="20" r="3" fill="#D97706" />
    <circle cx="150" cy="40" r="3" fill="#D97706" />
    <circle cx="180" cy="20" r="3" fill="#D97706" />
    <circle cx="220" cy="30" r="3" fill="#D97706" />
  </g>

  <!-- 3. Centered Invitation Card: Storybook arch, banner, teapot, cupcakes -->
  <g filter="url(#cardShad)" transform="translate(290, 50)">
    <rect width="280" height="430" rx="12" fill="#FCF9F2" stroke="#E4D7C0" stroke-width="1.5" />
    <!-- Botanical arch -->
    <path d="M30 400 L30 120 Q30 30 140 30 Q250 30 250 120 L250 400" stroke="#92AB72" stroke-width="2" fill="none" />
    <!-- Top banner -->
    <path d="M70 45 Q140 30 210 45 L205 68 Q140 52 75 68 Z" fill="#F8DEB5" stroke="#D49A58" stroke-width="1.5" />
    <text x="140" y="60" text-anchor="middle" font-family="'Cinzel', serif" font-size="9" font-weight="700" letter-spacing="1.5" fill="#A0522D">IT'S TEA TIME</text>

    <!-- Typography -->
    <text x="140" y="95" text-anchor="middle" font-family="'Questrial', sans-serif" font-size="7.5" fill="#6B4E3D">you are cordially invited to</text>
    <text x="140" y="125" text-anchor="middle" font-family="'Cinzel', serif" font-size="11" font-weight="700" letter-spacing="1" fill="#8B4513">AVA'S BIRTHDAY TEA PARTY</text>
    <text x="140" y="160" text-anchor="middle" font-family="'Questrial', sans-serif" font-size="9" fill="#5D4037">Saturday, September 16 at 3 PM</text>
    <text x="140" y="180" text-anchor="middle" font-family="'Questrial', sans-serif" font-size="8.5" fill="#795548">The Tearoom</text>
    <text x="140" y="196" text-anchor="middle" font-family="'Questrial', sans-serif" font-size="8" fill="#795548">45 North Chestnut St</text>

    <!-- Teapot & Cupcake illustration at bottom -->
    <g transform="translate(90, 260)">
      <ellipse cx="40" cy="50" rx="24" ry="18" fill="#F6C7B2" stroke="#B86E53" stroke-width="1.5" />
      <path d="M16 45 C5 45, 5 65, 20 65" stroke="#B86E53" stroke-width="2" fill="none" />
      <path d="M64 50 Q78 45 80 38" stroke="#B86E53" stroke-width="2" fill="none" />
      <!-- Teacup -->
      <path d="M80 50 Q80 65 92 65 Q104 65 104 50 Z" fill="#FBF3E4" stroke="#B86E53" stroke-width="1.5" />
    </g>
  </g>
</svg>`;
writeAsset("public/assets/templates/its-tea-time-mockup.svg", itsTeaTimeMockupSvg);

// 2.6 Lemons & Blossoms Mockup
const lemonsBlossomsMockupSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 533" width="800" height="533">
  <defs>
    <filter id="cardShad" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#000000" flood-opacity="0.2" />
    </filter>
  </defs>
  <!-- 1. Background Surface: Subtle linen cloth -->
  <rect width="100%" height="100%" rx="16" fill="#F4EFEA" />

  <!-- 2. Envelope Underlay (Pastel yellow with striped liner on left) -->
  <g transform="translate(180, 75)">
    <rect x="0" y="70" width="300" height="340" rx="4" fill="#FFE57F" stroke="#FDD835" stroke-width="1.5" />
    <polygon points="0,70 150,-20 300,70" fill="#FFF176" />
    <polygon points="12,70 150,-6 288,70" fill="#FFFFFF" />
    <!-- Yellow stripes in liner -->
    <line x1="60" y1="70" x2="150" y2="-6" stroke="#FFF176" stroke-width="8" />
    <line x1="100" y1="70" x2="170" y2="12" stroke="#FFF176" stroke-width="8" />
    <line x1="140" y1="70" x2="190" y2="28" stroke="#FFF176" stroke-width="8" />
    <line x1="180" y1="70" x2="215" y2="44" stroke="#FFF176" stroke-width="8" />
    <line x1="220" y1="70" x2="245" y2="58" stroke="#FFF176" stroke-width="8" />
  </g>

  <!-- 3. Centered Invitation Card: Amalfi lemon branches & arched card -->
  <g filter="url(#cardShad)" transform="translate(290, 50)">
    <!-- Mediterranean light blue card base -->
    <rect width="280" height="430" rx="12" fill="#D7EAF7" stroke="#C8DFEE" stroke-width="1" />
    <!-- Arched white badge -->
    <path d="M40 390 L40 130 Q40 50 140 50 Q240 50 240 130 L240 390 Z" fill="#FFFFFF" stroke="#E2EFF7" stroke-width="1" />
    <!-- Ripe lemons and blossoms framing -->
    <ellipse cx="40" cy="65" rx="22" ry="16" fill="#FCD34D" transform="rotate(30 40 65)" />
    <ellipse cx="240" cy="65" rx="22" ry="16" fill="#FCD34D" transform="rotate(-30 240 65)" />
    <circle cx="140" cy="50" r="5" fill="#FFF" stroke="#E2E8F0" />
    <ellipse cx="35" cy="360" rx="22" ry="16" fill="#FCD34D" transform="rotate(-25 35 360)" />
    <ellipse cx="245" cy="360" rx="22" ry="16" fill="#FCD34D" transform="rotate(25 245 360)" />

    <!-- Typography -->
    <text x="140" y="125" text-anchor="middle" font-family="'Great Vibes', cursive" font-size="28" fill="#264653">La Dolce</text>
    <text x="140" y="155" text-anchor="middle" font-family="'Great Vibes', cursive" font-size="28" fill="#264653">Vita</text>
    <text x="140" y="195" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="7.5" letter-spacing="1.5" fill="#2A6F97">PLEASE JOIN US TO SHOWER</text>
    <text x="140" y="222" text-anchor="middle" font-family="'Playfair Display', serif" font-size="13" font-weight="700" letter-spacing="1.5" fill="#1D3557">TAYLOR JOHNSON</text>
    <text x="140" y="260" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="8.5" letter-spacing="1" fill="#457B9D">SUNDAY, AUGUST 14 AT 2 PM</text>
    <text x="140" y="280" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="8.5" letter-spacing="1.5" fill="#457B9D">THE GARDEN ESTATE</text>
    <text x="140" y="320" text-anchor="middle" font-family="'Great Vibes', cursive" font-size="14" fill="#6C757D">for registry details below</text>
  </g>
</svg>`;
writeAsset("public/assets/templates/lemons-blossoms-mockup.svg", lemonsBlossomsMockupSvg);

// 2.7 Mamma Mia Mockup
const mammaMiaMockupSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 533" width="800" height="533">
  <defs>
    <filter id="cardShad" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#000000" flood-opacity="0.25" />
    </filter>
  </defs>
  <!-- 1. Background Surface: Rustic burlap/linen with dappled sunlight shadows -->
  <rect width="100%" height="100%" rx="16" fill="#DFD6C4" />
  <g fill="#2A241A" opacity="0.12">
    <ellipse cx="200" cy="180" rx="140" ry="70" transform="rotate(-35 200 180)" />
    <ellipse cx="650" cy="380" rx="180" ry="80" transform="rotate(-40 650 380)" />
  </g>

  <!-- 2. Envelope Underlay (Deep Mediterranean royal navy blue on left) -->
  <g transform="translate(180, 75)">
    <rect x="0" y="70" width="300" height="340" rx="4" fill="#0A192F" stroke="#061020" stroke-width="1.5" />
    <polygon points="0,70 150,-20 300,70" fill="#112240" />
    <polygon points="12,70 150,-6 288,70" fill="#152B4D" />
  </g>

  <!-- 3. Centered Invitation Card: Majolica blue-and-white tile border + lemons -->
  <g filter="url(#cardShad)" transform="translate(290, 50)">
    <rect width="280" height="430" rx="10" fill="#FFFFFF" stroke="#0D47A1" stroke-width="2" />
    <!-- Majolica decorative border -->
    <rect x="10" y="10" width="260" height="410" fill="none" stroke="#1565C0" stroke-width="12" stroke-dasharray="14,14" />
    <!-- Inner writing area -->
    <rect x="32" y="32" width="216" height="366" rx="4" fill="#FFFFFF" stroke="#BBDEFB" stroke-width="1" />

    <!-- Lemons & greenery at corners -->
    <g transform="translate(200, 15)">
      <ellipse cx="25" cy="25" rx="18" ry="13" fill="#FFEB3B" stroke="#F57F17" stroke-width="1" transform="rotate(30 25 25)" />
      <ellipse cx="5" cy="35" rx="12" ry="5" fill="#33691E" transform="rotate(-40 5 35)" />
    </g>
    <g transform="translate(25, 340)">
      <ellipse cx="25" cy="25" rx="18" ry="13" fill="#FFEB3B" stroke="#F57F17" stroke-width="1" transform="rotate(-25 25 25)" />
      <ellipse cx="45" cy="15" rx="12" ry="5" fill="#33691E" transform="rotate(40 45 15)" />
    </g>

    <!-- Typography -->
    <text x="140" y="95" text-anchor="middle" font-family="'Playfair Display', serif" font-size="8.5" font-style="italic" fill="#1D3557">join us for a bridal shower</text>
    <text x="140" y="112" text-anchor="middle" font-family="'Playfair Display', serif" font-size="8.5" font-style="italic" fill="#1D3557">honoring bride-to-be</text>
    <text x="140" y="165" text-anchor="middle" font-family="'Great Vibes', cursive" font-size="34" fill="#1565C0">Lauren</text>
    <text x="140" y="200" text-anchor="middle" font-family="'Great Vibes', cursive" font-size="34" fill="#1565C0">Sanders</text>
    <text x="140" y="245" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="8.5" font-weight="600" fill="#1E3A5F">saturday, july 20th at 1:30</text>
    <text x="140" y="268" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="8" fill="#415A77">the trattoria</text>
    <text x="140" y="284" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="8" fill="#415A77">10 piazza veneto dallas</text>
  </g>
</svg>`;
writeAsset("public/assets/templates/mamma-mia-mockup.svg", mammaMiaMockupSvg);

// 2.8 Moonlit Grove Mockup
const moonlitGroveMockupSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 533" width="800" height="533">
  <defs>
    <filter id="cardShad" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#000000" flood-opacity="0.38" />
    </filter>
  </defs>
  <!-- 1. Background Surface: Dark polished wooden planks -->
  <rect width="100%" height="100%" rx="16" fill="#2A1B12" />
  <line x1="0" y1="133" x2="800" y2="133" stroke="#120A05" stroke-width="3" />
  <line x1="0" y1="266" x2="800" y2="266" stroke="#120A05" stroke-width="3" />
  <line x1="0" y1="400" x2="800" y2="400" stroke="#120A05" stroke-width="3" />

  <!-- 2. Envelope Underlay (Kraft paper with woodland check liner on left) -->
  <g transform="translate(180, 75)">
    <rect x="0" y="70" width="300" height="340" rx="4" fill="#C4A482" stroke="#A88766" stroke-width="1.5" />
    <polygon points="0,70 150,-20 300,70" fill="#D3B89B" />
    <polygon points="12,70 150,-6 288,70" fill="#F7F3EE" />
    <rect x="50" y="20" width="200" height="40" fill="#D3C3B4" opacity="0.4" />
  </g>

  <!-- 3. Centered Invitation Card: Dark forest teal, gold foil moon, owl, creatures -->
  <g filter="url(#cardShad)" transform="translate(290, 50)">
    <rect width="280" height="430" rx="12" fill="#0B2726" stroke="#C5A059" stroke-width="1.5" />
    <rect x="12" y="12" width="256" height="406" rx="8" fill="none" stroke="#C5A059" stroke-width="0.8" opacity="0.6" />
    <!-- Gold crescent moon -->
    <path d="M148 45 C 160 45, 168 55, 165 70 C 162 85, 150 95, 135 92 C 150 88, 156 72, 153 60 C 150 52, 142 48, 148 45 Z" fill="#FCD34D" />
    <!-- Owl top left -->
    <ellipse cx="50" cy="65" rx="12" ry="18" fill="#78563A" />
    <circle cx="46" cy="56" r="4" fill="#FDE68A" />
    <circle cx="54" cy="56" r="4" fill="#FDE68A" />

    <!-- Typography -->
    <text x="140" y="140" text-anchor="middle" font-family="'Playfair Display', serif" font-size="22" font-style="italic" font-weight="700" fill="#F5E6CA">The</text>
    <text x="140" y="165" text-anchor="middle" font-family="'Playfair Display', serif" font-size="22" font-style="italic" font-weight="700" fill="#F5E6CA">Sweetest</text>
    <text x="140" y="190" text-anchor="middle" font-family="'Playfair Display', serif" font-size="22" font-style="italic" font-weight="700" fill="#F5E6CA">Chapter</text>
    <text x="140" y="235" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="8" letter-spacing="1.5" fill="#C2B08B">BABY SHOWER HONORING</text>
    <text x="140" y="260" text-anchor="middle" font-family="'Cinzel', serif" font-size="13" font-weight="700" letter-spacing="1.5" fill="#F5E6CA">DANI JOHNSON</text>
    <text x="140" y="295" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="8.5" letter-spacing="1" fill="#C2B08B">OCTOBER 14TH AT 2 PM</text>
    <text x="140" y="315" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="8" letter-spacing="1.5" fill="#C2B08B">PINE RIDGE</text>

    <!-- Mushrooms & Squirrels bottom -->
    <g transform="translate(125, 345)">
      <path d="M10 20 Q20 0 30 20 Z" fill="#DC2626" />
      <circle cx="16" cy="12" r="1.5" fill="#FFF" />
      <circle cx="24" cy="13" r="1.5" fill="#FFF" />
      <rect x="17" y="20" width="6" height="12" fill="#F5EFEB" />
    </g>
    <!-- Squirrels -->
    <ellipse cx="60" cy="370" rx="10" ry="14" fill="#A05A2C" />
    <ellipse cx="220" cy="370" rx="10" ry="14" fill="#A05A2C" />
  </g>
</svg>`;
writeAsset("public/assets/templates/moonlit-grove-mockup.svg", moonlitGroveMockupSvg);

// 2.9 Taste Of Italy Mockup
const tasteOfItalyMockupSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 533" width="800" height="533">
  <defs>
    <filter id="cardShad" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#000000" flood-opacity="0.22" />
    </filter>
  </defs>
  <!-- 1. Background Surface: Sage green and white vertical bistro stripes -->
  <rect width="100%" height="100%" rx="16" fill="#F4EFE6" />
  <g fill="#7FA983">
    <rect x="0" width="40" height="533" />
    <rect x="80" width="40" height="533" />
    <rect x="160" width="40" height="533" />
    <rect x="240" width="40" height="533" />
    <rect x="320" width="40" height="533" />
    <rect x="400" width="40" height="533" />
    <rect x="480" width="40" height="533" />
    <rect x="560" width="40" height="533" />
    <rect x="640" width="40" height="533" />
    <rect x="720" width="40" height="533" />
  </g>

  <!-- 2. Envelope Underlay (Vibrant tomato-red on left) -->
  <g transform="translate(180, 75)">
    <rect x="0" y="70" width="300" height="340" rx="4" fill="#C92A2A" stroke="#A61E1E" stroke-width="1.5" />
    <polygon points="0,70 150,-20 300,70" fill="#E03131" />
    <polygon points="12,70 150,-6 288,70" fill="#FFFFFF" />
  </g>

  <!-- 3. Centered Invitation Card: Red checkered border + Italian graphics -->
  <g filter="url(#cardShad)" transform="translate(290, 50)">
    <rect width="280" height="430" rx="10" fill="#FFFFFF" stroke="#DC2626" stroke-width="2" />
    <!-- Red and white checkered border -->
    <rect x="10" y="10" width="260" height="410" fill="none" stroke="#DC2626" stroke-width="14" stroke-dasharray="14,14" />
    <!-- Inner writing area -->
    <rect x="32" y="32" width="216" height="366" rx="6" fill="#FFFDF9" stroke="#EF4444" stroke-width="1" />

    <!-- Typography -->
    <text x="140" y="80" text-anchor="middle" font-family="'Pacifico', 'Caveat', cursive" font-size="28" fill="#2E5A27">That's</text>
    <text x="140" y="112" text-anchor="middle" font-family="'Pacifico', 'Caveat', cursive" font-size="28" fill="#2E5A27">amore</text>
    <!-- Little pasta ribbon at top right of text -->
    <g transform="translate(195, 65)">
      <path d="M5 8 L15 12 L5 16 Z" fill="#FBBF24" />
      <path d="M25 8 L15 12 L25 16 Z" fill="#FBBF24" />
    </g>

    <text x="140" y="150" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="7.5" letter-spacing="1.5" fill="#8B0000">A REHEARSAL DINNER HONORING</text>
    <text x="140" y="180" text-anchor="middle" font-family="'Playfair Display', serif" font-size="18" font-weight="700" fill="#1C1917">Mallory Evans</text>
    <text x="140" y="215" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="8.5" letter-spacing="1" fill="#57534E">AUGUST 24TH AT 7 PM</text>
    <text x="140" y="235" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="8" letter-spacing="1.5" fill="#78716C">LITTLE ITALY TRATTORIA</text>

    <!-- Hand drawn Italian graphics at bottom -->
    <g transform="translate(60, 275)">
      <!-- Wine bottle -->
      <path d="M15 15 L15 5 L20 5 L20 15 Q26 22 26 40 L9 40 Q9 22 15 15 Z" fill="#2E6930" stroke="#1B431D" stroke-width="1" />
      <rect x="10" y="30" width="15" height="18" fill="#D4A373" />
      <!-- Wine glass -->
      <g transform="translate(35, 12)">
        <path d="M5 8 Q5 22 15 22 Q25 22 25 8 Z" fill="#991B1B" />
        <line x1="15" y1="22" x2="15" y2="38" stroke="#7F1D1D" stroke-width="1.5" />
      </g>
      <!-- Farfalle pasta -->
      <g transform="translate(75, 25)">
        <path d="M5 8 L14 12 L5 16 Z" fill="#FBBF24" />
        <path d="M23 8 L14 12 L23 16 Z" fill="#FBBF24" />
      </g>
      <!-- Vine tomatoes -->
      <g transform="translate(115, 18)">
        <circle cx="12" cy="18" r="9" fill="#EF4444" />
        <circle cx="26" cy="22" r="10" fill="#DC2626" />
        <circle cx="40" cy="24" r="8" fill="#EF4444" />
        <path d="M8 8 Q20 6 36 14" stroke="#15803D" stroke-width="1.5" fill="none" />
      </g>
    </g>
  </g>
</svg>`;
writeAsset("public/assets/templates/taste-of-italy-mockup.svg", tasteOfItalyMockupSvg);

console.log("Mockups and Illustrations Generated Successfully!");
