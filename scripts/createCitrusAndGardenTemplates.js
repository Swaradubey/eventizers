const fs = require('fs');
const path = require('path');

const rootPublic = path.join(__dirname, '..', 'public');
const invitehubPublic = path.join(__dirname, '..', 'invitehub', 'public');

const targetTemplateDirs = [
  path.join(rootPublic, 'assets', 'templates'),
  path.join(invitehubPublic, 'assets', 'templates'),
];

const targetBackdropDirs = [
  path.join(rootPublic, 'assets', 'backdrops'),
  path.join(invitehubPublic, 'assets', 'backdrops'),
];

// Ensure all dirs exist
[...targetTemplateDirs, ...targetBackdropDirs].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// =============================================================================
// BACKDROPS
// =============================================================================

// 1. Olive Green Textured Fabric / Canvas Backdrop
const oliveGreenTextureSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="100%" height="100%">
  <defs>
    <radialGradient id="olive-grad" cx="50%" cy="45%" r="75%">
      <stop offset="0%" stop-color="#4C5627"/>
      <stop offset="40%" stop-color="#414A20"/>
      <stop offset="75%" stop-color="#343B19"/>
      <stop offset="100%" stop-color="#242911"/>
    </radialGradient>
    <pattern id="olive-weave" width="12" height="12" patternUnits="userSpaceOnUse">
      <rect width="12" height="12" fill="none"/>
      <path d="M 0,3 L 12,3 M 0,9 L 12,9" stroke="#2B3213" stroke-width="0.8" opacity="0.4"/>
      <path d="M 0,1 L 12,1 M 0,7 L 12,7" stroke="#5A6630" stroke-width="0.6" opacity="0.25"/>
      <path d="M 3,0 L 3,12 M 9,0 L 9,12" stroke="#2B3213" stroke-width="0.8" opacity="0.38"/>
      <path d="M 1,0 L 1,12 M 7,0 L 7,12" stroke="#5A6630" stroke-width="0.6" opacity="0.22"/>
      <!-- subtle natural slubs -->
      <circle cx="3" cy="9" r="0.8" fill="#1E230C" opacity="0.4"/>
      <circle cx="9" cy="3" r="0.7" fill="#5E6B32" opacity="0.3"/>
    </pattern>
  </defs>
  <rect width="1000" height="1000" fill="url(#olive-grad)"/>
  <rect width="1000" height="1000" fill="url(#olive-weave)"/>
</svg>`;

// 2. Beige Textured Linen Backdrop
const beigeTexturedLinenSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="100%" height="100%">
  <defs>
    <radialGradient id="beige-grad" cx="50%" cy="45%" r="75%">
      <stop offset="0%" stop-color="#EDE6D8"/>
      <stop offset="50%" stop-color="#E2D9C8"/>
      <stop offset="85%" stop-color="#D5CBB8"/>
      <stop offset="100%" stop-color="#C5BBA7"/>
    </radialGradient>
    <pattern id="linen-weave-fine" width="10" height="10" patternUnits="userSpaceOnUse">
      <rect width="10" height="10" fill="none"/>
      <path d="M 0,2.5 L 10,2.5 M 0,7.5 L 10,7.5" stroke="#C0B4A0" stroke-width="0.8" opacity="0.45"/>
      <path d="M 0,1 L 10,1 M 0,6 L 10,6" stroke="#FFFFFF" stroke-width="0.6" opacity="0.5"/>
      <path d="M 2.5,0 L 2.5,10 M 7.5,0 L 7.5,10" stroke="#B8AC98" stroke-width="0.8" opacity="0.4"/>
      <path d="M 1,0 L 1,10 M 6,0 L 6,10" stroke="#FFFFFF" stroke-width="0.6" opacity="0.45"/>
      <circle cx="2.5" cy="7.5" r="0.7" fill="#A89C88" opacity="0.35"/>
      <circle cx="7.5" cy="2.5" r="0.6" fill="#A89C88" opacity="0.3"/>
    </pattern>
  </defs>
  <rect width="1000" height="1000" fill="url(#beige-grad)"/>
  <rect width="1000" height="1000" fill="url(#linen-weave-fine)"/>
</svg>`;

// =============================================================================
// CITRUS SPLASH ASSETS
// =============================================================================

// Helper for citrus fruit cluster SVG elements
function generateCitrusFruit(cx, cy, r, angle = 0, isSlice = false) {
  if (isSlice) {
    return `
      <g transform="translate(${cx}, ${cy}) rotate(${angle})">
        <!-- Rind -->
        <circle cx="0" cy="0" r="${r}" fill="#E86C00" stroke="#D15B00" stroke-width="1.5"/>
        <circle cx="0" cy="0" r="${r - 1.5}" fill="#FFF8EB"/>
        <circle cx="0" cy="0" r="${r - 3.5}" fill="#FFA31A"/>
        <!-- Segments -->
        <g stroke="#FFF8EB" stroke-width="1.2" fill="none">
          <line x1="0" y1="0" x2="0" y2="${-r + 4}"/>
          <line x1="0" y1="0" x2="${(r - 4) * 0.866}" y2="${-(r - 4) * 0.5}"/>
          <line x1="0" y1="0" x2="${(r - 4) * 0.866}" y2="${(r - 4) * 0.5}"/>
          <line x1="0" y1="0" x2="0" y2="${r - 4}"/>
          <line x1="0" y1="0" x2="${-(r - 4) * 0.866}" y2="${(r - 4) * 0.5}"/>
          <line x1="0" y1="0" x2="${-(r - 4) * 0.866}" y2="${-(r - 4) * 0.5}"/>
        </g>
        <circle cx="0" cy="0" r="2.5" fill="#FFF8EB"/>
      </g>
    `;
  }
  return `
    <g transform="translate(${cx}, ${cy}) rotate(${angle})">
      <defs>
        <radialGradient id="orange-grad-${cx}-${cy}" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#FFBE3B"/>
          <stop offset="35%" stop-color="#FF8A00"/>
          <stop offset="85%" stop-color="#E05B00"/>
          <stop offset="100%" stop-color="#B84200"/>
        </radialGradient>
      </defs>
      <!-- Shadow -->
      <ellipse cx="2" cy="4" rx="${r}" ry="${r * 0.95}" fill="rgba(0,0,0,0.15)"/>
      <!-- Orange Body -->
      <ellipse cx="0" cy="0" rx="${r}" ry="${r * 0.97}" fill="url(#orange-grad-${cx}-${cy})"/>
      <!-- Highlight -->
      <ellipse cx="${-r * 0.25}" cy="${-r * 0.25}" rx="${r * 0.35}" ry="${r * 0.22}" fill="#FFFFFF" opacity="0.4" transform="rotate(-25, ${-r * 0.25}, ${-r * 0.25})"/>
      <!-- Calyx/Stem -->
      <circle cx="${r * 0.1}" cy="${-r * 0.85}" r="2.5" fill="#3D5025"/>
      <path d="M ${r * 0.1},${-r * 0.85} L ${r * 0.02},${-r * 0.95} M ${r * 0.1},${-r * 0.85} L ${r * 0.22},${-r * 0.92} M ${r * 0.1},${-r * 0.85} L ${r * 0.12},${-r * 0.76}" stroke="#2B3B18" stroke-width="1.2" stroke-linecap="round"/>
    </g>
  `;
}

// Helper for leaf
function generateCitrusLeaf(x, y, scale = 1, angle = 0, color = "#4E6B32", veinColor = "#2E441B") {
  return `
    <g transform="translate(${x}, ${y}) rotate(${angle}) scale(${scale})">
      <path d="M 0,0 C 12,-16 28,-22 42,-8 C 36,12 18,20 0,0 Z" fill="${color}" stroke="${veinColor}" stroke-width="0.8"/>
      <path d="M 0,0 C 18,-6 32,-7 40,-8" stroke="${veinColor}" stroke-width="1" fill="none"/>
      <path d="M 12,-4 L 16,-12 M 22,-6 L 28,-14 M 18,-3 L 22,6 M 28,-5 L 32,4" stroke="${veinColor}" stroke-width="0.6" stroke-linecap="round" fill="none"/>
    </g>
  `;
}

// Helper for white citrus blossom
function generateCitrusBlossom(cx, cy, r = 8, angle = 0) {
  return `
    <g transform="translate(${cx}, ${cy}) rotate(${angle})">
      <!-- 5 Petals -->
      <g fill="#FFFDF8" stroke="#E5DEC9" stroke-width="0.5">
        <ellipse cx="0" cy="${-r}" rx="${r * 0.45}" ry="${r * 0.65}"/>
        <ellipse cx="${r * 0.95}" cy="${-r * 0.31}" rx="${r * 0.45}" ry="${r * 0.65}" transform="rotate(72, ${r * 0.95}, ${-r * 0.31})"/>
        <ellipse cx="${r * 0.59}" cy="${r * 0.81}" rx="${r * 0.45}" ry="${r * 0.65}" transform="rotate(144, ${r * 0.59}, ${r * 0.81})"/>
        <ellipse cx="${-r * 0.59}" cy="${r * 0.81}" rx="${r * 0.45}" ry="${r * 0.65}" transform="rotate(216, ${-r * 0.59}, ${r * 0.81})"/>
        <ellipse cx="${-r * 0.95}" cy="${-r * 0.31}" rx="${r * 0.45}" ry="${r * 0.65}" transform="rotate(288, ${-r * 0.95}, ${-r * 0.31})"/>
      </g>
      <!-- Pistil center -->
      <circle cx="0" cy="0" r="${r * 0.35}" fill="#FFD034"/>
      <circle cx="0" cy="0" r="${r * 0.18}" fill="#E89B00"/>
    </g>
  `;
}

// Generate full citrus border elements for a given card size (500x700 coordinate system)
function generateCitrusBorder500x700() {
  let s = '<g id="citrus-frame-border">';

  // Top edge clusters
  s += generateCitrusFruit(70, 65, 22, 10);
  s += generateCitrusFruit(115, 52, 16, -15);
  s += generateCitrusFruit(160, 68, 20, 25);
  s += generateCitrusFruit(210, 50, 18, 5, true); // slice
  s += generateCitrusFruit(255, 62, 23, -20);
  s += generateCitrusFruit(305, 52, 17, 15);
  s += generateCitrusFruit(355, 66, 21, -10);
  s += generateCitrusFruit(405, 52, 16, 20, true); // slice
  s += generateCitrusFruit(445, 68, 22, -15);

  // Bottom edge clusters
  s += generateCitrusFruit(65, 635, 22, -10);
  s += generateCitrusFruit(110, 648, 17, 15);
  s += generateCitrusFruit(155, 632, 21, -20, true); // slice
  s += generateCitrusFruit(205, 646, 18, 5);
  s += generateCitrusFruit(250, 636, 24, 25);
  s += generateCitrusFruit(300, 648, 17, -15);
  s += generateCitrusFruit(345, 632, 20, 10, true); // slice
  s += generateCitrusFruit(395, 645, 18, -10);
  s += generateCitrusFruit(440, 635, 22, 20);

  // Left edge clusters
  s += generateCitrusFruit(52, 130, 18, 15);
  s += generateCitrusFruit(62, 185, 22, -10);
  s += generateCitrusFruit(48, 245, 17, 25, true);
  s += generateCitrusFruit(60, 305, 21, -15);
  s += generateCitrusFruit(50, 365, 19, 10);
  s += generateCitrusFruit(62, 425, 23, -20);
  s += generateCitrusFruit(48, 485, 18, 15, true);
  s += generateCitrusFruit(58, 545, 22, -5);
  s += generateCitrusFruit(50, 595, 17, 20);

  // Right edge clusters
  s += generateCitrusFruit(450, 130, 19, -15);
  s += generateCitrusFruit(440, 185, 23, 10);
  s += generateCitrusFruit(452, 245, 17, -25, true);
  s += generateCitrusFruit(440, 305, 22, 15);
  s += generateCitrusFruit(450, 365, 18, -10);
  s += generateCitrusFruit(438, 425, 24, 20);
  s += generateCitrusFruit(452, 485, 17, -15, true);
  s += generateCitrusFruit(442, 545, 21, 10);
  s += generateCitrusFruit(450, 595, 18, -20);

  // Lush Leaves surrounding fruits
  const leaves = [
    [40, 45, 1.1, 45, "#4E6B32"], [90, 30, 0.9, 15, "#5B7C3A"], [135, 38, 1.0, 70, "#3E5728"],
    [185, 30, 0.85, -25, "#4E6B32"], [230, 35, 1.1, 40, "#5B7C3A"], [280, 28, 0.9, -60, "#3E5728"],
    [330, 35, 1.0, 30, "#4E6B32"], [380, 30, 0.95, -45, "#5B7C3A"], [425, 38, 1.1, 65, "#3E5728"],
    [465, 45, 1.0, 110, "#4E6B32"],
    // Left edge
    [32, 100, 1.0, 120, "#4E6B32"], [30, 160, 0.9, -140, "#5B7C3A"], [28, 215, 1.1, 95, "#3E5728"],
    [30, 275, 0.85, -120, "#4E6B32"], [28, 335, 1.0, 110, "#5B7C3A"], [32, 395, 0.9, -135, "#3E5728"],
    [28, 455, 1.1, 100, "#4E6B32"], [30, 515, 0.85, -125, "#5B7C3A"], [28, 570, 1.0, 115, "#3E5728"],
    // Right edge
    [468, 100, 1.0, -30, "#4E6B32"], [470, 160, 0.9, 20, "#5B7C3A"], [472, 215, 1.1, -45, "#3E5728"],
    [470, 275, 0.85, 30, "#4E6B32"], [472, 335, 1.0, -25, "#5B7C3A"], [468, 395, 0.9, 40, "#3E5728"],
    [472, 455, 1.1, -35, "#4E6B32"], [470, 515, 0.85, 25, "#5B7C3A"], [472, 570, 1.0, -40, "#3E5728"],
    // Bottom edge
    [40, 660, 1.1, -135, "#4E6B32"], [85, 672, 0.9, 170, "#5B7C3A"], [135, 665, 1.0, -110, "#3E5728"],
    [185, 675, 0.85, 150, "#4E6B32"], [230, 668, 1.1, -140, "#5B7C3A"], [275, 674, 0.9, 160, "#3E5728"],
    [325, 668, 1.0, -125, "#4E6B32"], [375, 675, 0.95, 145, "#5B7C3A"], [420, 665, 1.1, -115, "#3E5728"],
    [465, 658, 1.0, -70, "#4E6B32"],
    // Inward facing foliage accents
    [85, 95, 0.75, 60, "#5B7C3A"], [415, 95, 0.75, 120, "#5B7C3A"],
    [85, 605, 0.75, -50, "#5B7C3A"], [415, 605, 0.75, -130, "#5B7C3A"],
    [75, 350, 0.7, 45, "#4E6B32"], [425, 350, 0.7, 135, "#4E6B32"]
  ];

  leaves.forEach(([lx, ly, sc, rot, col]) => {
    s += generateCitrusLeaf(lx, ly, sc, rot, col);
  });

  // Delicate white blossoms
  const blossoms = [
    [92, 75, 7, 15], [230, 58, 6.5, -30], [375, 60, 7.5, 45],
    [58, 215, 6.5, 20], [55, 450, 7, -15],
    [442, 215, 7, 35], [445, 450, 6.5, -25],
    [95, 625, 7.5, 10], [230, 642, 6.5, -40], [365, 630, 7, 50],
    [135, 80, 5.5, 60], [335, 78, 5.5, -50],
    [135, 620, 5.5, -60], [335, 620, 5.5, 70]
  ];

  blossoms.forEach(([bx, by, br, bRot]) => {
    s += generateCitrusBlossom(bx, by, br, bRot);
  });

  s += '</g>';
  return s;
}

// -----------------------------------------------------------------------------
// CITRUS SPLASH MOCKUP SVG (Full Flatlay Presentation Preview)
// -----------------------------------------------------------------------------
const citrusSplashMockupSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="100%" height="100%">
  <defs>
    <!-- Filter Shadows -->
    <filter id="cs-env-shadow" x="-30%" y="-20%" width="160%" height="150%">
      <feDropShadow dx="-6" dy="16" stdDeviation="16" flood-color="#000000" flood-opacity="0.32"/>
      <feDropShadow dx="-1" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.18"/>
    </filter>

    <filter id="cs-card-shadow" x="-30%" y="-20%" width="160%" height="150%">
      <feDropShadow dx="3" dy="18" stdDeviation="18" flood-color="#000000" flood-opacity="0.38"/>
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.2"/>
    </filter>

    <!-- Olive Green Flatlay Surface -->
    <radialGradient id="cs-bg-grad" cx="50%" cy="45%" r="75%">
      <stop offset="0%" stop-color="#4C5627"/>
      <stop offset="40%" stop-color="#414A20"/>
      <stop offset="75%" stop-color="#343B19"/>
      <stop offset="100%" stop-color="#242911"/>
    </radialGradient>

    <!-- Linen Texture for olive backdrop -->
    <pattern id="cs-weave" width="10" height="10" patternUnits="userSpaceOnUse">
      <path d="M 0,2.5 L 10,2.5 M 0,7.5 L 10,7.5" stroke="#262D11" stroke-width="0.8" opacity="0.45"/>
      <path d="M 2.5,0 L 2.5,10 M 7.5,0 L 7.5,10" stroke="#5A6630" stroke-width="0.6" opacity="0.3"/>
    </pattern>

    <!-- Kraft Paper Envelope Gradient -->
    <linearGradient id="cs-kraft-paper" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#B3936F"/>
      <stop offset="50%" stop-color="#A5835F"/>
      <stop offset="100%" stop-color="#93724E"/>
    </linearGradient>

    <!-- Kraft Gingham / Plaid Liner -->
    <pattern id="cs-gingham" width="16" height="16" patternUnits="userSpaceOnUse">
      <rect width="16" height="16" fill="#FDFBF5"/>
      <rect x="0" y="0" width="8" height="8" fill="#EFE5D2" opacity="0.8"/>
      <rect x="8" y="8" width="8" height="8" fill="#EFE5D2" opacity="0.8"/>
      <line x1="0" y1="0" x2="16" y2="0" stroke="#DFD3BB" stroke-width="0.7"/>
      <line x1="0" y1="0" x2="0" y2="16" stroke="#DFD3BB" stroke-width="0.7"/>
    </pattern>

    <clipPath id="cs-card-clip">
      <rect x="140" y="140" width="380" height="532" rx="14"/>
    </clipPath>
  </defs>

  <!-- 1. BACKDROP: Rich Olive Green Surface -->
  <rect width="600" height="800" fill="url(#cs-bg-grad)"/>
  <rect width="600" height="800" fill="url(#cs-weave)"/>

  <!-- 2. KRAFT ENVELOPE: Behind card on the left with open flap -->
  <g filter="url(#cs-env-shadow)">
    <!-- Envelope Pocket -->
    <rect x="65" y="210" width="410" height="470" rx="14" fill="url(#cs-kraft-paper)"/>
    <!-- Triangular open flap pointing top-left -->
    <path d="M 65,290 L 130,115 L 360,290 Z" fill="url(#cs-kraft-paper)"/>
    <!-- Gingham Pattern Liner inside throat -->
    <path d="M 85,285 L 136,135 L 340,285 Z" fill="url(#cs-gingham)"/>
    <line x1="65" y1="290" x2="360" y2="290" stroke="#7A5A39" stroke-width="1.8" opacity="0.35"/>
  </g>

  <!-- 3. INVITATION CARD: Warm Cream Surface with Citrus & Blossom Frame -->
  <g filter="url(#cs-card-shadow)">
    <g clip-path="url(#cs-card-clip)">
      <!-- Card Cream Paper Base -->
      <rect x="140" y="140" width="380" height="532" fill="#FFFDF4"/>
      <!-- Soft paper grain subtle overlay -->
      <rect x="140" y="140" width="380" height="532" fill="none" stroke="rgba(0,0,0,0.06)" stroke-width="1"/>

      <!-- Citrus Wreath Border (mapped to card coordinates) -->
      <g transform="translate(140, 140) scale(0.76, 0.76)">
        ${generateCitrusBorder500x700()}
      </g>

      <!-- Center Typography (Exact match to reference) -->
      <g text-anchor="middle">
        <!-- "you are invited to a" -->
        <text x="330" y="325" font-family="'Inter', sans-serif" font-size="10.5" font-weight="500" fill="#525636" letter-spacing="1.5">you are invited to a</text>

        <!-- "FAREWELL" -->
        <text x="330" y="375" font-family="'Playfair Display', Georgia, serif" font-size="28" font-weight="700" fill="#28361B" letter-spacing="3">FAREWELL</text>
        <!-- "PARTY" -->
        <text x="330" y="415" font-family="'Playfair Display', Georgia, serif" font-size="28" font-weight="700" fill="#28361B" letter-spacing="3">PARTY</text>

        <!-- "to honor and thank" -->
        <text x="330" y="468" font-family="'Playfair Display', Georgia, serif" font-style="italic" font-size="13" font-weight="400" fill="#525636" letter-spacing="0.5">to honor and thank</text>

        <!-- "Elena" -->
        <text x="330" y="525" font-family="'Playfair Display', Georgia, serif" font-size="26" font-weight="600" fill="#28361B" letter-spacing="1.5">Elena</text>
        <!-- "Thomas" -->
        <text x="330" y="560" font-family="'Playfair Display', Georgia, serif" font-size="26" font-weight="600" fill="#28361B" letter-spacing="1.5">Thomas</text>
      </g>
    </g>

    <!-- Card Edge Crisp Hairline -->
    <rect x="140" y="140" width="380" height="532" rx="14" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.2"/>
  </g>

  <!-- 4. Top Badges & Heart Overlay (Evite UI Preview Element) -->
  <g transform="translate(30, 30)">
    <!-- Premium Badge -->
    <rect x="0" y="0" width="94" height="28" rx="6" fill="#FBF6FF" stroke="#D8B4FE" stroke-width="1"/>
    <!-- Crown icon -->
    <path d="M 12,18 L 14,11 L 18,15 L 22,11 L 24,18 Z" fill="#7E22CE"/>
    <text x="30" y="18.5" font-family="'Inter', sans-serif" font-size="11.5" font-weight="600" fill="#7E22CE">Premium</text>
  </g>

  <!-- Favorite Heart Icon Top Right -->
  <g transform="translate(545, 42)">
    <path d="M 0,-5 C -4,-12 -14,-10 -14,-2 C -14,6 0,14 0,14 C 0,14 14,6 14,-2 C 14,-10 4,-12 0,-5 Z" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>
  </g>
</svg>`;

// -----------------------------------------------------------------------------
// CITRUS SPLASH CLEAN CARD BACKGROUND SVG (Artwork only, without text)
// -----------------------------------------------------------------------------
const citrusSplashBgSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 700" width="100%" height="100%">
  <!-- Warm Cream Paper Base -->
  <rect width="500" height="700" rx="14" fill="#FFFDF4"/>
  <rect width="500" height="700" rx="14" fill="none" stroke="rgba(0,0,0,0.06)" stroke-width="1"/>

  <!-- Lush Citrus & Blossom Frame -->
  ${generateCitrusBorder500x700()}

  <!-- Inner Soft Border Guide -->
  <rect x="75" y="85" width="350" height="530" rx="8" fill="none" stroke="rgba(80, 85, 52, 0.08)" stroke-width="1" stroke-dasharray="4 4"/>
</svg>`;


// =============================================================================
// GARDEN BLOOMS ASSETS
// =============================================================================

// Helper for intricate botanical folk vine element (chintz style border)
function generateGardenBloomsBorder500x700() {
  let s = '<g id="garden-blooms-folk-border">';

  // Elegant flowing border stem around the entire card perimeter
  s += `
    <!-- Main Framing Vine Stems -->
    <path d="
      M 45,55 
      Q 120,40 250,48 Q 380,40 455,55
      Q 465,180 458,350 Q 465,520 455,645
      Q 380,660 250,652 Q 120,660 45,645
      Q 35,520 42,350 Q 35,180 45,55 Z" 
      fill="none" stroke="#3A5335" stroke-width="2.2" stroke-linecap="round"/>
    
    <!-- Secondary delicate winding inner vine -->
    <path d="
      M 60,70 
      Q 140,62 250,66 Q 360,62 440,70
      Q 448,190 442,350 Q 448,510 440,630
      Q 360,638 250,634 Q 140,638 60,630
      Q 52,510 58,350 Q 52,190 60,70 Z" 
      fill="none" stroke="#526F4A" stroke-width="1.2" stroke-linecap="round" stroke-dasharray="8 4"/>
  `;

  // Winding Vine Tendrils & Leaf Sprigs all around border
  const folkElements = [
    // Top Edge Sprigs & Berries
    { cx: 80, cy: 50, rot: -15, type: 'rose' },
    { cx: 120, cy: 42, rot: 25, type: 'berry' },
    { cx: 165, cy: 54, rot: -30, type: 'rose' },
    { cx: 210, cy: 44, rot: 15, type: 'bud' },
    { cx: 250, cy: 50, rot: 0, type: 'rose' },
    { cx: 290, cy: 44, rot: -15, type: 'bud' },
    { cx: 335, cy: 54, rot: 30, type: 'rose' },
    { cx: 380, cy: 42, rot: -25, type: 'berry' },
    { cx: 420, cy: 50, rot: 15, type: 'rose' },

    // Right Edge Sprigs & Berries
    { cx: 458, cy: 105, rot: 80, type: 'rose' },
    { cx: 448, cy: 155, rot: 105, type: 'berry' },
    { cx: 460, cy: 205, rot: 75, type: 'rose' },
    { cx: 450, cy: 255, rot: 95, type: 'bud' },
    { cx: 462, cy: 305, rot: 80, type: 'rose' },
    { cx: 450, cy: 355, rot: 100, type: 'berry' },
    { cx: 460, cy: 405, rot: 85, type: 'rose' },
    { cx: 448, cy: 455, rot: 95, type: 'bud' },
    { cx: 462, cy: 505, rot: 75, type: 'rose' },
    { cx: 450, cy: 555, rot: 110, type: 'berry' },
    { cx: 458, cy: 605, rot: 85, type: 'rose' },

    // Bottom Edge Sprigs & Berries
    { cx: 80, cy: 650, rot: 15, type: 'rose' },
    { cx: 120, cy: 658, rot: -25, type: 'berry' },
    { cx: 165, cy: 646, rot: 30, type: 'rose' },
    { cx: 210, cy: 656, rot: -15, type: 'bud' },
    { cx: 250, cy: 650, rot: 0, type: 'rose' },
    { cx: 290, cy: 656, rot: 15, type: 'bud' },
    { cx: 335, cy: 646, rot: -30, type: 'rose' },
    { cx: 380, cy: 658, rot: 25, type: 'berry' },
    { cx: 420, cy: 650, rot: -15, type: 'rose' },

    // Left Edge Sprigs & Berries
    { cx: 42, cy: 105, rot: -80, type: 'rose' },
    { cx: 52, cy: 155, rot: -105, type: 'berry' },
    { cx: 40, cy: 205, rot: -75, type: 'rose' },
    { cx: 50, cy: 255, rot: -95, type: 'bud' },
    { cx: 38, cy: 305, rot: -80, type: 'rose' },
    { cx: 50, cy: 355, rot: -100, type: 'berry' },
    { cx: 40, cy: 405, rot: -85, type: 'rose' },
    { cx: 52, cy: 455, rot: -95, type: 'bud' },
    { cx: 38, cy: 505, rot: -75, type: 'rose' },
    { cx: 50, cy: 555, rot: -110, type: 'berry' },
    { cx: 42, cy: 605, rot: -85, type: 'rose' }
  ];

  folkElements.forEach(({ cx, cy, rot, type }) => {
    s += `<g transform="translate(${cx}, ${cy}) rotate(${rot})">`;
    if (type === 'rose') {
      // Crimson / coral folk flower
      s += `
        <!-- Flower Leaves -->
        <path d="M 0,0 C -6,-12 -16,-12 -14,0 C -12,8 -4,6 0,0 Z" fill="#4B663F"/>
        <path d="M 0,0 C 6,-12 16,-12 14,0 C 12,8 4,6 0,0 Z" fill="#4B663F"/>
        <!-- Petals -->
        <circle cx="0" cy="0" r="7.5" fill="#C93B3B"/>
        <circle cx="-3" cy="-2" r="4.5" fill="#E65858"/>
        <circle cx="3" cy="-2" r="4.5" fill="#E65858"/>
        <circle cx="0" cy="2" r="4.5" fill="#D64545"/>
        <circle cx="0" cy="0" r="2.8" fill="#FFF0D4"/>
        <circle cx="0" cy="0" r="1.4" fill="#C93B3B"/>
      `;
    } else if (type === 'berry') {
      // Cluster of 3 red/coral berries
      s += `
        <line x1="0" y1="0" x2="-4" y2="-8" stroke="#3A5335" stroke-width="1"/>
        <line x1="0" y1="0" x2="4" y2="-9" stroke="#3A5335" stroke-width="1"/>
        <line x1="0" y1="0" x2="0" y2="-12" stroke="#3A5335" stroke-width="1"/>
        <circle cx="-4" cy="-8" r="3.2" fill="#BA2D2D"/>
        <circle cx="-5" cy="-9" r="1" fill="#FFFFFF" opacity="0.6"/>
        <circle cx="4" cy="-9" r="3.2" fill="#D44242"/>
        <circle cx="3" cy="-10" r="1" fill="#FFFFFF" opacity="0.6"/>
        <circle cx="0" cy="-13" r="3.4" fill="#C93434"/>
        <circle cx="-1" cy="-14" r="1" fill="#FFFFFF" opacity="0.6"/>
      `;
    } else if (type === 'bud') {
      // Coral floral bud
      s += `
        <path d="M -4,-2 C -8,-10 0,-14 0,-16 C 0,-14 8,-10 4,-2 Z" fill="#D94848"/>
        <path d="M -2,0 C -5,-6 0,-10 0,-12 C 0,-10 5,-6 2,0 Z" fill="#FF7070"/>
        <path d="M -5,0 C -4,-6 0,-8 0,-8 C 0,-8 4,-6 5,0 Z" fill="#4B663F"/>
      `;
    }
    s += `</g>`;
  });

  // Delicate leaves and dots interspersed
  s += `
    <g fill="#435C38" stroke="none">
      <!-- Leaf pairs along border -->
      <path d="M 100,52 C 95,44 100,36 108,40 C 106,46 104,50 100,52 Z"/>
      <path d="M 140,46 C 135,38 140,30 148,34 C 146,40 144,44 140,46 Z"/>
      <path d="M 230,48 C 225,40 230,32 238,36 C 236,42 234,46 230,48 Z"/>
      <path d="M 310,48 C 305,40 310,32 318,36 C 316,42 314,46 310,48 Z"/>
      <path d="M 360,46 C 355,38 360,30 368,34 C 366,40 364,44 360,46 Z"/>
      <path d="M 400,52 C 395,44 400,36 408,40 C 406,46 404,50 400,52 Z"/>

      <path d="M 100,648 C 95,656 100,664 108,660 C 106,654 104,650 100,648 Z"/>
      <path d="M 140,654 C 135,662 140,670 148,666 C 146,660 144,656 140,654 Z"/>
      <path d="M 230,652 C 225,660 230,668 238,664 C 236,658 234,654 230,652 Z"/>
      <path d="M 310,652 C 305,660 310,668 318,664 C 316,658 314,654 310,652 Z"/>
      <path d="M 360,654 C 355,662 360,670 368,666 C 366,660 364,656 360,654 Z"/>
      <path d="M 400,648 C 395,656 400,664 408,660 C 406,654 404,650 400,648 Z"/>
    </g>
  `;

  s += '</g>';
  return s;
}

// -----------------------------------------------------------------------------
// GARDEN BLOOMS MOCKUP SVG (Full Flatlay Presentation Preview)
// -----------------------------------------------------------------------------
const gardenBloomsMockupSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="100%" height="100%">
  <defs>
    <!-- Filter Shadows -->
    <filter id="gb-env-shadow" x="-30%" y="-20%" width="160%" height="150%">
      <feDropShadow dx="-6" dy="16" stdDeviation="16" flood-color="#000000" flood-opacity="0.25"/>
      <feDropShadow dx="-1" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.14"/>
    </filter>

    <filter id="gb-card-shadow" x="-30%" y="-20%" width="160%" height="150%">
      <feDropShadow dx="3" dy="18" stdDeviation="18" flood-color="#000000" flood-opacity="0.32"/>
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.16"/>
    </filter>

    <!-- Warm Oatmeal / Linen Backdrop Gradient -->
    <radialGradient id="gb-bg-grad" cx="50%" cy="45%" r="75%">
      <stop offset="0%" stop-color="#EDE6D8"/>
      <stop offset="50%" stop-color="#E2D9C8"/>
      <stop offset="85%" stop-color="#D5CBB8"/>
      <stop offset="100%" stop-color="#C5BBA7"/>
    </radialGradient>

    <!-- Linen Texture Pattern -->
    <pattern id="gb-weave" width="10" height="10" patternUnits="userSpaceOnUse">
      <path d="M 0,2.5 L 10,2.5 M 0,7.5 L 10,7.5" stroke="#C0B4A0" stroke-width="0.8" opacity="0.45"/>
      <path d="M 0,1 L 10,1 M 0,6 L 10,6" stroke="#FFFFFF" stroke-width="0.6" opacity="0.5"/>
      <path d="M 2.5,0 L 2.5,10 M 7.5,0 L 7.5,10" stroke="#B8AC98" stroke-width="0.8" opacity="0.4"/>
      <path d="M 1,0 L 1,10 M 6,0 L 6,10" stroke="#FFFFFF" stroke-width="0.6" opacity="0.45"/>
    </pattern>

    <!-- Kraft Paper Envelope Gradient -->
    <linearGradient id="gb-kraft-paper" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#B3936F"/>
      <stop offset="50%" stop-color="#A5835F"/>
      <stop offset="100%" stop-color="#93724E"/>
    </linearGradient>

    <!-- Striped Green Liner Pattern -->
    <pattern id="gb-green-stripes" width="16" height="16" patternUnits="userSpaceOnUse">
      <rect width="16" height="16" fill="#FDFBF7"/>
      <rect x="0" y="0" width="8" height="16" fill="#58724E"/>
    </pattern>

    <clipPath id="gb-card-clip">
      <rect x="140" y="140" width="380" height="532" rx="14"/>
    </clipPath>
  </defs>

  <!-- 1. BACKDROP: Beige Oatmeal Linen Surface -->
  <rect width="600" height="800" fill="url(#gb-bg-grad)"/>
  <rect width="600" height="800" fill="url(#gb-weave)"/>

  <!-- 2. KRAFT ENVELOPE: Behind card on the left with green striped liner -->
  <g filter="url(#gb-env-shadow)">
    <!-- Envelope Pocket Body -->
    <rect x="65" y="210" width="410" height="470" rx="14" fill="url(#gb-kraft-paper)"/>
    <!-- Triangular open flap pointing top-left -->
    <path d="M 65,290 L 130,115 L 360,290 Z" fill="url(#gb-kraft-paper)"/>
    <!-- Green Striped Liner inside throat -->
    <path d="M 85,285 L 136,135 L 340,285 Z" fill="url(#gb-green-stripes)"/>
    <line x1="65" y1="290" x2="360" y2="290" stroke="#7A5A39" stroke-width="1.8" opacity="0.35"/>
  </g>

  <!-- 3. INVITATION CARD: Crisp White Surface with Folk Floral Motif Border -->
  <g filter="url(#gb-card-shadow)">
    <g clip-path="url(#gb-card-clip)">
      <!-- Pure White Card Surface -->
      <rect x="140" y="140" width="380" height="532" fill="#FFFFFF"/>
      <!-- Soft paper border stroke -->
      <rect x="140" y="140" width="380" height="532" fill="none" stroke="rgba(0,0,0,0.06)" stroke-width="1"/>

      <!-- Botanical Folk Art Floral Vine Border -->
      <g transform="translate(140, 140) scale(0.76, 0.76)">
        ${generateGardenBloomsBorder500x700()}
      </g>

      <!-- Center Typography (Exact match to reference) -->
      <g text-anchor="middle">
        <!-- "join us for our" -->
        <text x="330" y="325" font-family="'Inter', sans-serif" font-size="10" font-weight="500" fill="#555555" letter-spacing="1.2">join us for our</text>

        <!-- "Annual" -->
        <text x="330" y="375" font-family="'Playfair Display', Georgia, serif" font-size="28" font-weight="600" fill="#242424" letter-spacing="2">Annual</text>
        <!-- "Charity" -->
        <text x="330" y="415" font-family="'Playfair Display', Georgia, serif" font-size="28" font-weight="600" fill="#242424" letter-spacing="2">Charity</text>
        <!-- "Gala" -->
        <text x="330" y="455" font-family="'Playfair Display', Georgia, serif" font-size="28" font-weight="600" fill="#242424" letter-spacing="2">Gala</text>

        <!-- "Friday, September 24 at 7 PM" -->
        <text x="330" y="525" font-family="'Inter', sans-serif" font-size="10.5" font-weight="500" fill="#444444" letter-spacing="0.5">Friday, September 24 at 7 PM</text>

        <!-- "Marina Ballroom" -->
        <text x="330" y="546" font-family="'Inter', sans-serif" font-size="10.5" font-weight="600" fill="#333333" letter-spacing="0.5">Marina Ballroom</text>

        <!-- "formal attire encouraged" -->
        <text x="330" y="585" font-family="'Inter', sans-serif" font-style="italic" font-size="9.5" font-weight="400" fill="#666666" letter-spacing="0.4">formal attire encouraged</text>
      </g>
    </g>

    <!-- Card Edge Crisp Hairline -->
    <rect x="140" y="140" width="380" height="532" rx="14" fill="none" stroke="rgba(0,0,0,0.08)" stroke-width="1"/>
  </g>

  <!-- 4. Top Badges & Heart Overlay (Evite UI Preview Element) -->
  <g transform="translate(30, 30)">
    <!-- Premium Badge -->
    <rect x="0" y="0" width="94" height="28" rx="6" fill="#FBF6FF" stroke="#D8B4FE" stroke-width="1"/>
    <!-- Crown icon -->
    <path d="M 12,18 L 14,11 L 18,15 L 22,11 L 24,18 Z" fill="#7E22CE"/>
    <text x="30" y="18.5" font-family="'Inter', sans-serif" font-size="11.5" font-weight="600" fill="#7E22CE">Premium</text>
  </g>

  <!-- Favorite Heart Icon Top Right -->
  <g transform="translate(545, 42)">
    <path d="M 0,-5 C -4,-12 -14,-10 -14,-2 C -14,6 0,14 0,14 C 0,14 14,6 14,-2 C 14,-10 4,-12 0,-5 Z" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>
  </g>
</svg>`;

// -----------------------------------------------------------------------------
// GARDEN BLOOMS CLEAN CARD BACKGROUND SVG (Artwork only, without text)
// -----------------------------------------------------------------------------
const gardenBloomsBgSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 700" width="100%" height="100%">
  <!-- Pure White Card Surface -->
  <rect width="500" height="700" rx="14" fill="#FFFFFF"/>
  <rect width="500" height="700" rx="14" fill="none" stroke="rgba(0,0,0,0.06)" stroke-width="1"/>

  <!-- Botanical Folk Art Floral Vine & Berry Border -->
  ${generateGardenBloomsBorder500x700()}

  <!-- Center Text Safe Area Boundary -->
  <rect x="75" y="85" width="350" height="530" rx="8" fill="none" stroke="rgba(58, 83, 53, 0.08)" stroke-width="1" stroke-dasharray="4 4"/>
</svg>`;

// =============================================================================
// WRITE ALL FILES TO TARGET DIRECTORIES
// =============================================================================

// Backdrops
targetBackdropDirs.forEach((dir) => {
  fs.writeFileSync(path.join(dir, 'olive-green-texture.svg'), oliveGreenTextureSvg);
  fs.writeFileSync(path.join(dir, 'beige-textured-linen.svg'), beigeTexturedLinenSvg);
});

// Templates (Mockups and Clean Card Backgrounds)
targetTemplateDirs.forEach((dir) => {
  // Citrus Splash
  fs.writeFileSync(path.join(dir, 'citrus-splash-mockup.svg'), citrusSplashMockupSvg);
  fs.writeFileSync(path.join(dir, 'citrus-splash-bg.svg'), citrusSplashBgSvg);

  // Garden Blooms
  fs.writeFileSync(path.join(dir, 'garden-blooms-mockup.svg'), gardenBloomsMockupSvg);
  fs.writeFileSync(path.join(dir, 'garden-blooms-bg.svg'), gardenBloomsBgSvg);
});

console.log('Successfully generated all SVGs for Citrus Splash and Garden Blooms in root and invitehub dirs!');
