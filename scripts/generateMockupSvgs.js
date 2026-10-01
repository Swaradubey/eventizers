const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const templatesAssetDir = path.join(publicDir, 'assets', 'templates');

function getBase64(filePath) {
  const data = fs.readFileSync(filePath);
  const ext = path.extname(filePath).slice(1);
  return `data:image/${ext === 'svg' ? 'svg+xml' : (ext === 'jpg' ? 'jpeg' : ext)};base64,${data.toString('base64')}`;
}

const botanicalBase64 = getBase64(path.join(templatesAssetDir, 'botanical-sketch-painting.jpg'));

// -------------------------------------------------------------
// 1. BOTANICAL SKETCH (ART) MOCKUP SVG
// -------------------------------------------------------------
const botanicalSketchSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="100%" height="100%">
  <defs>
    <!-- Terrazzo Base Gradient -->
    <linearGradient id="bs-terrazzo-base" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FAF8F5"/>
      <stop offset="50%" stop-color="#F5F2EC"/>
      <stop offset="100%" stop-color="#EDE9E1"/>
    </linearGradient>

    <!-- Terrazzo Tile Pattern -->
    <pattern id="bs-terrazzo-pattern" width="300" height="400" patternUnits="userSpaceOnUse">
      <polygon points="35,25 50,20 45,38 30,32" fill="#D99B59" opacity="0.65"/>
      <polygon points="150,70 165,65 160,85 145,78" fill="#CCA066" opacity="0.7"/>
      <polygon points="250,30 270,35 265,50 245,42" fill="#E0AA60" opacity="0.6"/>
      <polygon points="55,180 70,175 75,195 53,198" fill="#C88846" opacity="0.75"/>
      <polygon points="210,230 230,220 235,242 205,245" fill="#D59B55" opacity="0.68"/>
      <polygon points="95,30 110,22 117,40 93,42" fill="#B86548" opacity="0.7"/>
      <polygon points="190,90 208,82 212,102 188,105" fill="#C46E52" opacity="0.65"/>
      <polygon points="270,110 285,100 295,122 268,125" fill="#BF684E" opacity="0.68"/>
      <polygon points="65,90 80,82 87,100 63,105" fill="#88967A" opacity="0.65"/>
      <polygon points="220,50 238,42 245,62 218,65" fill="#758567" opacity="0.7"/>
      <polygon points="120,140 138,132 142,152 118,155" fill="#94A386" opacity="0.6"/>
      <polygon points="25,65 37,60 41,73 23,75" fill="#3D3B3A" opacity="0.75"/>
      <polygon points="170,40 182,34 188,48 168,50" fill="#4A4745" opacity="0.7"/>
      <polygon points="260,80 272,75 278,88 258,90" fill="#333130" opacity="0.8"/>
      <polygon points="95,180 107,175 113,188 93,190" fill="#3D3B3A" opacity="0.75"/>
      <polygon points="200,130 212,124 218,138 198,140" fill="#4A4745" opacity="0.7"/>
      <circle cx="75" cy="55" r="2.2" fill="#B86548" opacity="0.7"/>
      <circle cx="130" cy="100" r="1.8" fill="#3D3B3A" opacity="0.65"/>
      <circle cx="215" cy="115" r="2.5" fill="#D99B59" opacity="0.7"/>
      <circle cx="48" cy="150" r="1.5" fill="#758567" opacity="0.6"/>
      <circle cx="280" cy="150" r="2" fill="#3D3B3A" opacity="0.7"/>
      <circle cx="120" cy="210" r="2.8" fill="#C46E52" opacity="0.65"/>
      <circle cx="170" cy="230" r="1.8" fill="#88967A" opacity="0.6"/>
      <circle cx="270" cy="245" r="2.2" fill="#B86548" opacity="0.7"/>
      <circle cx="72" cy="280" r="2" fill="#D99B59" opacity="0.65"/>
    </pattern>

    <radialGradient id="bs-terrazzo-vignette" cx="50%" cy="50%" r="70%">
      <stop offset="40%" stop-color="#ffffff" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#DDD6CA" stop-opacity="0.5"/>
    </radialGradient>

    <!-- Drop Shadows -->
    <filter id="bs-envelope-shadow" x="-20%" y="-15%" width="140%" height="135%">
      <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#000000" flood-opacity="0.3"/>
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.14"/>
    </filter>

    <filter id="bs-card-shadow" x="-30%" y="-20%" width="160%" height="150%">
      <feDropShadow dx="0" dy="14" stdDeviation="15" flood-color="#000000" flood-opacity="0.28"/>
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#000000" flood-opacity="0.14"/>
    </filter>

    <filter id="bs-photo-shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#000000" flood-opacity="0.22"/>
    </filter>

    <clipPath id="bs-card-clip">
      <rect x="125" y="160" width="350" height="520" rx="14"/>
    </clipPath>

    <clipPath id="bs-photo-clip">
      <rect x="175" y="245" width="250" height="210" rx="2"/>
    </clipPath>
  </defs>

  <!-- 1. BACKDROP: Terrazzo -->
  <rect width="600" height="800" fill="url(#bs-terrazzo-base)"/>
  <rect width="600" height="800" fill="url(#bs-terrazzo-pattern)"/>
  <rect width="600" height="800" fill="url(#bs-terrazzo-vignette)" style="mix-blend-mode: multiply;"/>

  <!-- 2. ENVELOPE: Natural Textured Beige / Linen Flap behind card -->
  <g filter="url(#bs-envelope-shadow)">
    <!-- Envelope Pocket Body (Behind Card) -->
    <rect x="80" y="210" width="440" height="500" rx="18" fill="#CFC4B5"/>

    <!-- Open Triangular Flap UPWARD -->
    <path d="M 80,212 L 300,36 L 520,212 Z" fill="#DDD2C3"/>

    <!-- Flap Ambient Top Lighting -->
    <path d="M 80,212 L 300,36 L 520,212 Z" fill="#ffffff" opacity="0.18"/>

    <!-- Inner Throat Liner -->
    <path d="M 108,206 L 300,68 L 492,206 Z" fill="#ECE4D8"/>
    <rect x="108" y="206" width="384" height="130" fill="#ECE4D8"/>

    <!-- Flap Fold Crease Shadow -->
    <line x1="80" y1="212" x2="520" y2="212" stroke="#000000" stroke-width="2.5" opacity="0.28"/>
    <line x1="108" y1="208" x2="492" y2="208" stroke="#8E8272" stroke-width="1.2" opacity="0.25"/>
  </g>

  <!-- 3. MAIN CARD: Soft Sage Green (#A3B899) -->
  <g filter="url(#bs-card-shadow)">
    <g clip-path="url(#bs-card-clip)">
      <rect x="125" y="160" width="350" height="520" rx="14" fill="#A3B899"/>

      <!-- Hand-drawn Botanical Leaf and Floral Line-Art Framing Accents -->
      <g fill="none" stroke="#253723" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity="0.85">
        <!-- Top Left Branch -->
        <g transform="translate(132, 172)">
          <path d="M 10,15 Q 22,50 18,100 Q 14,140 26,180" stroke-width="1.8"/>
          <path d="M 16,35 C 5,28 2,42 12,46 Z" fill="#92A988"/>
          <path d="M 20,62 C 34,54 37,68 23,73 Z" fill="#92A988"/>
          <path d="M 16,88 C 4,80 2,94 14,99 Z" fill="#92A988"/>
          <path d="M 17,115 C 32,107 35,120 21,126 Z" fill="#92A988"/>
          <path d="M 19,145 C 7,137 5,152 17,157 Z" fill="#92A988"/>
          <path d="M 24,170 C 38,162 42,176 27,181 Z" fill="#92A988"/>
          <path d="M 20,62 Q 42,50 54,28"/>
          <circle cx="56" cy="26" r="3" fill="#253723"/>
          <circle cx="48" cy="38" r="2.2" fill="#253723"/>
        </g>

        <!-- Top Right Floral Cluster -->
        <g transform="translate(468, 172) scale(-1, 1)">
          <path d="M 10,15 Q 26,60 22,110 Q 18,150 30,195" stroke-width="1.8"/>
          <g transform="translate(22, 25)">
            <path d="M 0,0 C -14,-18 12,-22 4,-35 C 22,-22 30,-8 18,4 Z" fill="#B3C9A9" stroke-width="1.5"/>
            <circle cx="3" cy="-18" r="2.5" fill="#253723"/>
            <line x1="3" y1="-18" x2="15" y2="-4" stroke-width="1.1"/>
          </g>
          <path d="M 18,70 C 4,62 2,78 16,83 Z" fill="#92A988"/>
          <path d="M 22,100 C 38,92 41,106 25,111 Z" fill="#92A988"/>
          <path d="M 19,130 C 5,122 3,138 18,143 Z" fill="#92A988"/>
          <path d="M 24,160 C 40,152 44,166 28,171 Z" fill="#92A988"/>
        </g>

        <!-- Bottom Left Floral Accents -->
        <g transform="translate(132, 668) scale(1, -1)">
          <path d="M 10,15 Q 24,55 18,110 Q 14,150 24,190" stroke-width="1.8"/>
          <g transform="translate(18, 120)">
            <path d="M 0,0 C -15,-12 8,-25 2,-38 C 18,-24 24,-10 12,2 Z" fill="#B3C9A9" stroke-width="1.4"/>
            <circle cx="2" cy="-16" r="2.5" fill="#253723"/>
          </g>
          <path d="M 15,35 C 3,27 1,42 13,47 Z" fill="#92A988"/>
          <path d="M 19,62 C 34,54 37,68 23,73 Z" fill="#92A988"/>
          <path d="M 16,88 C 4,80 2,94 14,99 Z" fill="#92A988"/>
          <path d="M 18,150 C 34,142 37,156 23,161 Z" fill="#92A988"/>
        </g>

        <!-- Bottom Right Accents -->
        <g transform="translate(468, 668) scale(-1, -1)">
          <path d="M 10,15 Q 25,50 20,100 Q 16,140 26,180" stroke-width="1.8"/>
          <path d="M 16,38 C 4,30 2,45 14,50 Z" fill="#92A988"/>
          <path d="M 21,68 C 36,60 40,74 25,79 Z" fill="#92A988"/>
          <path d="M 18,98 C 6,90 4,105 16,110 Z" fill="#92A988"/>
          <path d="M 21,135 C 38,127 40,142 25,147 Z" fill="#92A988"/>
        </g>
      </g>

      <!-- Center: Framed square photo container with white border (botanical painting/sketching in progress) -->
      <g filter="url(#bs-photo-shadow)">
        <rect x="170" y="240" width="260" height="220" fill="#FFFFFF" rx="2"/>
        <image href="${botanicalBase64}" x="176" y="246" width="248" height="208" preserveAspectRatio="xMidYMid slice" clip-path="url(#bs-photo-clip)"/>
      </g>

      <!-- Bottom Section Typography -->
      <!-- Title (Elegant Serif): "Botanical Illustration Workshop" -->
      <g text-anchor="middle">
        <text x="300" y="522" font-family="'Playfair Display', Georgia, serif" font-size="21" font-weight="600" fill="#1C2D1A" letter-spacing="0.5">Botanical</text>
        <text x="300" y="548" font-family="'Playfair Display', Georgia, serif" font-size="21" font-weight="600" fill="#1C2D1A" letter-spacing="0.5">Illustration</text>
        <text x="300" y="574" font-family="'Playfair Display', Georgia, serif" font-size="21" font-weight="600" fill="#1C2D1A" letter-spacing="0.5">Workshop</text>

        <!-- Subtext / Schedule: "Artisans June 21 at 12 PM" -->
        <text x="300" y="618" font-family="'Inter', sans-serif" font-size="11.5" fill="#30442D" font-weight="500" letter-spacing="0.4">Artisans June 21 at 12 PM</text>
      </g>
    </g>
    <!-- Card subtle border -->
    <rect x="125" y="160" width="350" height="520" rx="14" fill="none" stroke="rgba(0,0,0,0.06)" stroke-width="1"/>
  </g>
</svg>`;

// -------------------------------------------------------------
// 2. CLEAN CARD BACKGROUND SVGS (WITHOUT BAKED TEXT)
// -------------------------------------------------------------
const botanicalSketchBgSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 700" width="100%" height="100%">
  <defs>
    <filter id="bs-photo-shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#000000" flood-opacity="0.25"/>
    </filter>
    <clipPath id="bs-photo-clip">
      <rect x="74" y="98" width="352" height="294" rx="2"/>
    </clipPath>
  </defs>

  <!-- 1. Soft Sage Green Background (#A3B899) -->
  <rect width="500" height="700" rx="14" fill="#A3B899"/>

  <!-- 2. Hand-drawn Botanical Leaf and Floral Line-Art Framing Accents -->
  <g fill="none" stroke="#253723" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity="0.85">
    <!-- Top Left Branch -->
    <g transform="translate(14, 14)">
      <path d="M 10,15 Q 22,50 18,100 Q 14,140 26,180" stroke-width="1.8"/>
      <path d="M 16,35 C 5,28 2,42 12,46 Z" fill="#92A988"/>
      <path d="M 20,62 C 34,54 37,68 23,73 Z" fill="#92A988"/>
      <path d="M 16,88 C 4,80 2,94 14,99 Z" fill="#92A988"/>
      <path d="M 17,115 C 32,107 35,120 21,126 Z" fill="#92A988"/>
      <path d="M 19,145 C 7,137 5,152 17,157 Z" fill="#92A988"/>
      <path d="M 24,170 C 38,162 42,176 27,181 Z" fill="#92A988"/>
      <path d="M 20,62 Q 42,50 54,28"/>
      <circle cx="56" cy="26" r="3" fill="#253723"/>
      <circle cx="48" cy="38" r="2.2" fill="#253723"/>
    </g>

    <!-- Top Right Floral Cluster -->
    <g transform="translate(486, 14) scale(-1, 1)">
      <path d="M 10,15 Q 26,60 22,110 Q 18,150 30,195" stroke-width="1.8"/>
      <g transform="translate(22, 25)">
        <path d="M 0,0 C -14,-18 12,-22 4,-35 C 22,-22 30,-8 18,4 Z" fill="#B3C9A9" stroke-width="1.5"/>
        <circle cx="3" cy="-18" r="2.5" fill="#253723"/>
        <line x1="3" y1="-18" x2="15" y2="-4" stroke-width="1.1"/>
      </g>
      <path d="M 18,70 C 4,62 2,78 16,83 Z" fill="#92A988"/>
      <path d="M 22,100 C 38,92 41,106 25,111 Z" fill="#92A988"/>
      <path d="M 19,130 C 5,122 3,138 18,143 Z" fill="#92A988"/>
      <path d="M 24,160 C 40,152 44,166 28,171 Z" fill="#92A988"/>
    </g>

    <!-- Bottom Left Floral Accents -->
    <g transform="translate(14, 686) scale(1, -1)">
      <path d="M 10,15 Q 24,55 18,110 Q 14,150 24,190" stroke-width="1.8"/>
      <g transform="translate(18, 120)">
        <path d="M 0,0 C -15,-12 8,-25 2,-38 C 18,-24 24,-10 12,2 Z" fill="#B3C9A9" stroke-width="1.4"/>
        <circle cx="2" cy="-16" r="2.5" fill="#253723"/>
      </g>
      <path d="M 15,35 C 3,27 1,42 13,47 Z" fill="#92A988"/>
      <path d="M 19,62 C 34,54 37,68 23,73 Z" fill="#92A988"/>
      <path d="M 16,88 C 4,80 2,94 14,99 Z" fill="#92A988"/>
      <path d="M 18,150 C 34,142 37,156 23,161 Z" fill="#92A988"/>
    </g>

    <!-- Bottom Right Accents -->
    <g transform="translate(486, 686) scale(-1, -1)">
      <path d="M 10,15 Q 25,50 20,100 Q 16,140 26,180" stroke-width="1.8"/>
      <path d="M 16,38 C 4,30 2,45 14,50 Z" fill="#92A988"/>
      <path d="M 21,68 C 36,60 40,74 25,79 Z" fill="#92A988"/>
      <path d="M 18,98 C 6,90 4,105 16,110 Z" fill="#92A988"/>
      <path d="M 21,135 C 38,127 40,142 25,147 Z" fill="#92A988"/>
    </g>
  </g>

  <!-- 3. Center: Framed square photo container with white border (botanical painting) -->
  <g filter="url(#bs-photo-shadow)">
    <rect x="66" y="90" width="368" height="310" fill="#FFFFFF" rx="4"/>
    <image href="${botanicalBase64}" x="74" y="98" width="352" height="294" preserveAspectRatio="xMidYMid slice" clip-path="url(#bs-photo-clip)"/>
  </g>

  <!-- 4. Card subtle border -->
  <rect width="500" height="700" rx="14" fill="none" stroke="rgba(0,0,0,0.06)" stroke-width="1"/>
</svg>`;

// Output directories
const targetDirs = [
  templatesAssetDir,
  path.join(publicDir, '..', 'invitehub', 'public', 'assets', 'templates')
];

targetDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) return;

  // Mockup SVGs (full stage with envelope and text)
  fs.writeFileSync(path.join(dir, 'botanical-sketch-art-mockup.svg'), botanicalSketchSvg);

  // Clean Card Background SVGs (without baked-in typography for live canvas editing)
  fs.writeFileSync(path.join(dir, 'botanical-sketch-art-bg.svg'), botanicalSketchBgSvg);
  fs.writeFileSync(path.join(dir, 'botanical-sketch-bg.svg'), botanicalSketchBgSvg);
});

console.log('Successfully generated all mockups and card bg SVGs in all asset directories!');

