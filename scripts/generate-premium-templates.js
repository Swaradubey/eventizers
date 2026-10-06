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

console.log("Generating Premium Template Assets...");

// ----------------------------------------------------------------------
// 1. BACKDROPS
// ----------------------------------------------------------------------

// 1.1 Dark Moody Blush-Rose Floral Photography Bed
const darkRoseBedSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
  <defs>
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
    <radialGradient id="roseGlow2" cx="45%" cy="45%" r="55%">
      <stop offset="0%" stop-color="#FFF0F3" />
      <stop offset="40%" stop-color="#F7CAD0" />
      <stop offset="75%" stop-color="#C9687D" />
      <stop offset="100%" stop-color="#4A1E29" />
    </radialGradient>
    <filter id="softBlur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" />
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#darkBg)" />
  <!-- Deep green foliage layer -->
  <g opacity="0.6">
    <ellipse cx="120" cy="180" rx="90" ry="140" fill="#1B281E" transform="rotate(-25 120 180)" />
    <ellipse cx="240" cy="120" rx="80" ry="110" fill="#152018" transform="rotate(35 240 120)" />
    <ellipse cx="1050" cy="190" rx="100" ry="150" fill="#1B281E" transform="rotate(20 1050 190)" />
    <ellipse cx="1120" cy="340" rx="90" ry="130" fill="#131C15" transform="rotate(-15 1120 340)" />
    <ellipse cx="140" cy="650" rx="110" ry="160" fill="#1A271C" transform="rotate(40 140 650)" />
    <ellipse cx="1020" cy="680" rx="120" ry="170" fill="#18231A" transform="rotate(-30 1020 680)" />
  </g>
  <!-- Blush roses left side -->
  <g transform="translate(60, 220)">
    <circle cx="90" cy="90" r="85" fill="url(#roseGlow1)" />
    <path d="M40 70 Q90 20 140 70 Q160 110 130 145 Q85 170 45 130 Z" fill="none" stroke="#FCE7EB" stroke-width="4" opacity="0.7" />
    <circle cx="90" cy="90" r="50" fill="#E895A7" opacity="0.6" />
    <circle cx="85" cy="85" r="28" fill="#FFF0F3" opacity="0.85" />
  </g>
  <g transform="translate(-10, 420)">
    <circle cx="70" cy="70" r="65" fill="url(#roseGlow2)" />
    <circle cx="70" cy="70" r="35" fill="#C9687D" opacity="0.5" />
    <circle cx="68" cy="68" r="18" fill="#FFF0F3" opacity="0.9" />
  </g>
  <g transform="translate(80, 50)">
    <circle cx="60" cy="60" r="55" fill="url(#roseGlow2)" opacity="0.8" />
    <circle cx="60" cy="60" r="25" fill="#FFF" opacity="0.75" />
  </g>
  <!-- Blush roses right side -->
  <g transform="translate(980, 140)">
    <circle cx="95" cy="95" r="90" fill="url(#roseGlow1)" />
    <path d="M45 75 Q95 25 145 75 Q165 115 135 150 Q90 175 50 135 Z" fill="none" stroke="#FCE7EB" stroke-width="4" opacity="0.65" />
    <circle cx="95" cy="95" r="48" fill="#E895A7" opacity="0.6" />
    <circle cx="92" cy="92" r="26" fill="#FFF0F3" opacity="0.85" />
  </g>
  <g transform="translate(1040, 360)">
    <circle cx="80" cy="80" r="75" fill="url(#roseGlow2)" />
    <circle cx="80" cy="80" r="42" fill="#C9687D" opacity="0.55" />
    <circle cx="78" cy="78" r="22" fill="#FFF0F3" opacity="0.9" />
  </g>
  <g transform="translate(950, 560)">
    <circle cx="75" cy="75" r="70" fill="url(#roseGlow1)" opacity="0.85" />
    <circle cx="75" cy="75" r="32" fill="#FFF" opacity="0.8" />
  </g>
  <!-- Subtle vignette shadow -->
  <rect width="100%" height="100%" fill="none" stroke="#000" stroke-width="60" opacity="0.4" />
</svg>`;
writeAsset("public/assets/backdrops/dark-rose-bed.svg", darkRoseBedSvg);

// 1.2 Soft Ivory Lace Texture Overlay
const softIvoryLaceSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
  <defs>
    <linearGradient id="ivoryBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FBF9F5" />
      <stop offset="50%" stop-color="#F5F0E6" />
      <stop offset="100%" stop-color="#EDE7DA" />
    </linearGradient>
    <pattern id="laceRepeat" x="0" y="0" width="160" height="160" patternUnits="userSpaceOnUse">
      <circle cx="80" cy="80" r="50" fill="none" stroke="#E5DEC9" stroke-width="1.2" opacity="0.45" stroke-dasharray="2,3" />
      <circle cx="80" cy="80" r="32" fill="none" stroke="#D8CEB4" stroke-width="0.8" opacity="0.35" />
      <circle cx="80" cy="80" r="14" fill="#EDE4CD" opacity="0.3" />
      <!-- Floral petals -->
      <ellipse cx="80" cy="38" rx="8" ry="18" fill="none" stroke="#E0D7BF" stroke-width="1" opacity="0.4" />
      <ellipse cx="80" cy="122" rx="8" ry="18" fill="none" stroke="#E0D7BF" stroke-width="1" opacity="0.4" />
      <ellipse cx="38" cy="80" rx="18" ry="8" fill="none" stroke="#E0D7BF" stroke-width="1" opacity="0.4" />
      <ellipse cx="122" cy="80" rx="18" ry="8" fill="none" stroke="#E0D7BF" stroke-width="1" opacity="0.4" />
      <!-- Corner rosettes -->
      <circle cx="0" cy="0" r="24" fill="none" stroke="#D8CEB4" stroke-width="1" opacity="0.35" />
      <circle cx="160" cy="0" r="24" fill="none" stroke="#D8CEB4" stroke-width="1" opacity="0.35" />
      <circle cx="0" cy="160" r="24" fill="none" stroke="#D8CEB4" stroke-width="1" opacity="0.35" />
      <circle cx="160" cy="160" r="24" fill="none" stroke="#D8CEB4" stroke-width="1" opacity="0.35" />
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#ivoryBg)" />
  <rect width="100%" height="100%" fill="url(#laceRepeat)" />
</svg>`;
writeAsset("public/assets/backdrops/soft-ivory-lace.svg", softIvoryLaceSvg);

// 1.3 Textured Debossed White Floral Paper Relief
const whiteDebossedFloralSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
  <defs>
    <linearGradient id="paperBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="60%" stop-color="#FBFBFB" />
      <stop offset="100%" stop-color="#F4F4F4" />
    </linearGradient>
    <filter id="deboss" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="-1" dy="-1" stdDeviation="1.5" flood-color="#FFFFFF" flood-opacity="0.9" />
      <feDropShadow dx="1.5" dy="1.5" stdDeviation="2" flood-color="#D0D0D0" flood-opacity="0.45" />
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#paperBg)" />
  <g filter="url(#deboss)" fill="none" stroke="#ECECEC" stroke-width="2.5" opacity="0.8">
    <!-- Debossed floral bouquets in corners -->
    <g transform="translate(60, 60)">
      <path d="M40 120 Q80 40 160 80 Q220 120 180 180 T60 160 Z" />
      <circle cx="140" cy="130" r="30" />
      <path d="M140 100 Q180 80 190 120" />
      <path d="M80 160 Q60 210 110 240 Q150 210 130 170" />
    </g>
    <g transform="translate(900, 80)">
      <path d="M120 40 Q40 80 80 160 Q120 220 180 180 T160 60 Z" />
      <circle cx="130" cy="140" r="32" />
      <path d="M100 140 Q80 180 120 190" />
    </g>
    <g transform="translate(80, 520)">
      <path d="M50 140 Q100 60 180 90 Q220 150 160 200 Z" />
      <circle cx="135" cy="145" r="28" />
    </g>
    <g transform="translate(880, 500)">
      <path d="M140 60 Q60 100 90 180 Q150 220 200 160 Z" />
      <circle cx="145" cy="145" r="34" />
      <path d="M145 110 Q190 90 200 130" />
    </g>
  </g>
</svg>`;
writeAsset("public/assets/backdrops/white-debossed-floral.svg", whiteDebossedFloralSvg);

// 1.4 Rich Dark Warm Wood / Cork Backdrop
const warmCorkWoodSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
  <defs>
    <linearGradient id="woodBase" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#3D2619" />
      <stop offset="50%" stop-color="#2D1A10" />
      <stop offset="100%" stop-color="#1F110A" />
    </linearGradient>
    <radialGradient id="warmSpot" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="#5A3925" stop-opacity="0.6" />
      <stop offset="70%" stop-color="#2D1A10" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#woodBase)" />
  <rect width="100%" height="100%" fill="url(#warmSpot)" />
  <!-- Horizontal wood grain texture lines -->
  <g stroke="#4F3220" stroke-width="1.2" opacity="0.35">
    <line x1="0" y1="90" x2="1200" y2="92" />
    <line x1="0" y1="180" x2="1200" y2="178" />
    <line x1="0" y1="270" x2="1200" y2="273" />
    <line x1="0" y1="360" x2="1200" y2="358" />
    <line x1="0" y1="450" x2="1200" y2="452" />
    <line x1="0" y1="540" x2="1200" y2="538" />
    <line x1="0" y1="630" x2="1200" y2="633" />
    <line x1="0" y1="720" x2="1200" y2="718" />
  </g>
  <!-- Organic cork specks -->
  <g fill="#573824" opacity="0.25">
    <circle cx="150" cy="120" r="3" />
    <circle cx="340" cy="240" r="2.5" />
    <circle cx="780" cy="180" r="4" />
    <circle cx="920" cy="420" r="3" />
    <circle cx="210" cy="620" r="3.5" />
    <circle cx="640" cy="680" r="2" />
    <circle cx="1040" cy="610" r="3" />
  </g>
</svg>`;
writeAsset("public/assets/backdrops/warm-cork-wood.svg", warmCorkWoodSvg);

// 1.5 Whimsical Dreamy Blue Sky with Soft Fluffy Cloud Illustrations
const dreamyCloudsSkySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
  <defs>
    <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#9AD3F5" />
      <stop offset="45%" stop-color="#BEE3F8" />
      <stop offset="100%" stop-color="#E2F1FD" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#skyGrad)" />
  <!-- Dreamy fluffy illustrated clouds -->
  <g fill="#FFFFFF" opacity="0.82">
    <!-- Cloud top left -->
    <path d="M60 220 Q60 160 120 160 Q150 120 210 130 Q270 110 320 150 Q380 140 400 190 Q430 220 400 260 L80 260 Q50 240 60 220 Z" />
    <!-- Cloud bottom left -->
    <path d="M-20 620 Q-20 560 40 560 Q70 510 130 520 Q180 490 230 530 Q280 520 300 570 Q320 620 280 660 L0 660 Z" />
    <!-- Cloud top right -->
    <path d="M860 190 Q860 130 920 130 Q960 90 1020 100 Q1070 80 1120 120 Q1170 110 1200 160 L1200 240 L880 240 Q850 220 860 190 Z" />
    <!-- Cloud bottom right -->
    <path d="M820 640 Q820 580 880 580 Q920 530 980 540 Q1030 510 1090 550 Q1140 540 1170 590 L1200 680 L840 680 Q810 660 820 640 Z" />
  </g>
  <g fill="#FFFFFF" opacity="0.55">
    <path d="M480 90 Q480 60 520 60 Q550 40 590 50 Q630 40 660 70 L490 90 Z" />
    <path d="M520 720 Q520 680 560 680 Q590 650 640 660 Q690 650 720 690 L530 720 Z" />
  </g>
</svg>`;
writeAsset("public/assets/backdrops/dreamy-clouds-sky.svg", dreamyCloudsSkySvg);

// 1.6 Subtle Linen Cloth Texture
const subtleLinenClothSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
  <defs>
    <linearGradient id="linenBase" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FAF8F5" />
      <stop offset="50%" stop-color="#F4EFEA" />
      <stop offset="100%" stop-color="#EDE6DF" />
    </linearGradient>
    <pattern id="linenWeave" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
      <path d="M0 4 L16 4 M0 12 L16 12" stroke="#E0D7CE" stroke-width="0.8" opacity="0.45" />
      <path d="M4 0 L4 16 M12 0 L12 16" stroke="#D8CEBF" stroke-width="0.8" opacity="0.45" />
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#linenBase)" />
  <rect width="100%" height="100%" fill="url(#linenWeave)" />
</svg>`;
writeAsset("public/assets/backdrops/subtle-linen-cloth.svg", subtleLinenClothSvg);

// 1.7 Natural Rustic Burlap / Linen Fabric Texture with Sunlight Shadows
const rusticBurlapLinenSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
  <defs>
    <linearGradient id="burlapBase" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#EBE3D5" />
      <stop offset="50%" stop-color="#DFD6C4" />
      <stop offset="100%" stop-color="#D5C9B3" />
    </linearGradient>
    <pattern id="burlapGrid" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
      <rect width="12" height="12" fill="none" stroke="#C8BC9F" stroke-width="0.75" opacity="0.4" />
      <line x1="0" y1="6" x2="12" y2="6" stroke="#BDAF95" stroke-width="0.6" opacity="0.3" />
      <line x1="6" y1="0" x2="6" y2="12" stroke="#BDAF95" stroke-width="0.6" opacity="0.3" />
    </pattern>
    <!-- Soft diagonal tree leaf sunlight shadow overlay -->
    <linearGradient id="sunlight" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.35" />
      <stop offset="40%" stop-color="#000000" stop-opacity="0.08" />
      <stop offset="65%" stop-color="#FFFFFF" stop-opacity="0.2" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.14" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#burlapBase)" />
  <rect width="100%" height="100%" fill="url(#burlapGrid)" />
  <!-- Dappled leaf shadows falling across the linen surface -->
  <g fill="#2A241A" opacity="0.12" filter="blur(16px)">
    <ellipse cx="280" cy="180" rx="160" ry="80" transform="rotate(-35 280 180)" />
    <ellipse cx="420" cy="120" rx="140" ry="60" transform="rotate(-25 420 120)" />
    <ellipse cx="180" cy="340" rx="200" ry="90" transform="rotate(-40 180 340)" />
    <ellipse cx="320" cy="460" rx="180" ry="70" transform="rotate(-30 320 460)" />
  </g>
  <rect width="100%" height="100%" fill="url(#sunlight)" />
</svg>`;
writeAsset("public/assets/backdrops/rustic-burlap-linen.svg", rusticBurlapLinenSvg);

// 1.8 Dark Polished Horizontal Wooden Plank Backdrop
const darkWoodPlanksSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
  <defs>
    <linearGradient id="plank1" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#3A271B" />
      <stop offset="90%" stop-color="#2A1B12" />
      <stop offset="100%" stop-color="#1A1009" />
    </linearGradient>
    <linearGradient id="plank2" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#442E20" />
      <stop offset="90%" stop-color="#322015" />
      <stop offset="100%" stop-color="#1E120A" />
    </linearGradient>
  </defs>
  <!-- 5 horizontal polished planks -->
  <rect y="0" width="1200" height="156" fill="url(#plank1)" />
  <rect y="160" width="1200" height="156" fill="url(#plank2)" />
  <rect y="320" width="1200" height="156" fill="url(#plank1)" />
  <rect y="480" width="1200" height="156" fill="url(#plank2)" />
  <rect y="640" width="1200" height="160" fill="url(#plank1)" />
  <!-- Plank seams -->
  <line x1="0" y1="158" x2="1200" y2="158" stroke="#120A05" stroke-width="4" />
  <line x1="0" y1="318" x2="1200" y2="318" stroke="#120A05" stroke-width="4" />
  <line x1="0" y1="478" x2="1200" y2="478" stroke="#120A05" stroke-width="4" />
  <line x1="0" y1="638" x2="1200" y2="638" stroke="#120A05" stroke-width="4" />
  <!-- Subtle wood sheen & grain highlights -->
  <g stroke="#553A29" stroke-width="1" opacity="0.35">
    <line x1="40" y1="60" x2="1160" y2="62" />
    <line x1="80" y1="230" x2="1120" y2="231" />
    <line x1="30" y1="390" x2="1180" y2="389" />
    <line x1="70" y1="550" x2="1140" y2="551" />
    <line x1="50" y1="710" x2="1150" y2="712" />
  </g>
</svg>`;
writeAsset("public/assets/backdrops/dark-wood-planks.svg", darkWoodPlanksSvg);

// 1.9 Sage Green and White Vertical Italian Bistro Stripes
const sageBistroStripesSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
  <defs>
    <pattern id="bistroVertical" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
      <rect x="0" width="40" height="80" fill="#7FA983" />
      <rect x="40" width="40" height="80" fill="#F4EFE6" />
      <!-- Subtle fabric weave line in stripe -->
      <line x1="40" y1="0" x2="40" y2="80" stroke="#719875" stroke-width="0.8" opacity="0.4" />
      <line x1="0" y1="0" x2="0" y2="80" stroke="#E2DACD" stroke-width="0.8" opacity="0.4" />
    </pattern>
    <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
      <stop offset="60%" stop-color="#000000" stop-opacity="0" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.12" />
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bistroVertical)" />
  <rect width="100%" height="100%" fill="url(#vignette)" />
</svg>`;
writeAsset("public/assets/backdrops/sage-bistro-stripes.svg", sageBistroStripesSvg);

// ----------------------------------------------------------------------
// 2. ENVELOPE LINER PATTERNS
// ----------------------------------------------------------------------

// 2.1 Ribbons, Bows Liner: Sharp black-and-white striped/floral liner
const ribbonsBowsLinerSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs>
    <pattern id="bwStripes" width="30" height="30" patternUnits="userSpaceOnUse">
      <rect width="15" height="30" fill="#18181B" />
      <rect x="15" width="15" height="30" fill="#FFFFFF" />
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#bwStripes)" />
</svg>`;
writeAsset("public/templates/envelopes/ribbons-bows-liner.svg", ribbonsBowsLinerSvg);

// 2.2 Tea Time Liner: Cream with delicate tea leaves and polka dots
const teaTimeLinerSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <rect width="100%" height="100%" fill="#FFF8EE" />
  <g fill="#D97706" opacity="0.75">
    <!-- Tiny polka dots and tea leaves -->
    <circle cx="40" cy="40" r="3" />
    <circle cx="120" cy="40" r="3" />
    <circle cx="200" cy="40" r="3" />
    <circle cx="280" cy="40" r="3" />
    <circle cx="360" cy="40" r="3" />
    <circle cx="80" cy="100" r="3" />
    <circle cx="160" cy="100" r="3" />
    <circle cx="240" cy="100" r="3" />
    <circle cx="320" cy="100" r="3" />
    <!-- Tea leaves -->
    <path d="M80 40 Q90 30 100 40 Q90 50 80 40 Z" fill="#F59E0B" />
    <path d="M240 40 Q250 30 260 40 Q250 50 240 40 Z" fill="#F59E0B" />
    <path d="M160 100 Q170 90 180 100 Q170 110 160 100 Z" fill="#F59E0B" />
    <path d="M320 100 Q330 90 340 100 Q330 110 320 100 Z" fill="#F59E0B" />
  </g>
</svg>`;
writeAsset("public/templates/envelopes/tea-time-liner.svg", teaTimeLinerSvg);

// 2.3 Lemons & Blossoms Liner: Pastel yellow cabana stripes
const lemonStripesLinerSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <pattern id="lemonStripes" width="24" height="24" patternUnits="userSpaceOnUse">
      <rect width="12" height="24" fill="#FFF176" />
      <rect x="12" width="12" height="24" fill="#FFFFFF" />
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#lemonStripes)" />
</svg>`;
writeAsset("public/templates/envelopes/lemons-blossoms-liner.svg", lemonStripesLinerSvg);

// 2.4 Woodland Gingham Liner
const woodlandGinghamLinerSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <pattern id="woodlandCheck" width="20" height="20" patternUnits="userSpaceOnUse">
      <rect width="20" height="20" fill="#F7F3EE" />
      <rect width="10" height="10" fill="#D3C3B4" opacity="0.65" />
      <rect x="10" y="10" width="10" height="10" fill="#D3C3B4" opacity="0.65" />
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#woodlandCheck)" />
</svg>`;
writeAsset("public/templates/envelopes/woodland-gingham-liner.svg", woodlandGinghamLinerSvg);

// ----------------------------------------------------------------------
// 3. CARD BACKGROUNDS & BORDERS (Vector SVG Layers)
// ----------------------------------------------------------------------

// 3.1 Elegant Lace Card Background: Laser-cut scalloped oval lace border enclosing delicate ivory badge
const elegantLaceBgSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 840" width="600" height="840">
  <defs>
    <radialGradient id="laceIvory" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="85%" stop-color="#FAF7F2" />
      <stop offset="100%" stop-color="#F2EDE4" />
    </radialGradient>
    <filter id="laceShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#1A1008" flood-opacity="0.18" />
    </filter>
  </defs>
  <!-- Card base background -->
  <rect width="100%" height="100%" rx="16" fill="#FAF8F5" />
  <!-- Laser cut scalloped oval lace frame -->
  <g filter="url(#laceShadow)">
    <!-- Outer scalloped lace rim -->
    <ellipse cx="300" cy="420" rx="255" ry="365" fill="#FAF6EE" stroke="#E5DEC9" stroke-width="2" />
    <!-- Perforated lace scallop circles around oval border -->
    <ellipse cx="300" cy="420" rx="245" ry="352" fill="none" stroke="#D8CEB4" stroke-width="6" stroke-dasharray="8,6" opacity="0.8" />
    <ellipse cx="300" cy="420" rx="235" ry="338" fill="none" stroke="#C9BC9F" stroke-width="1.5" />
    <ellipse cx="300" cy="420" rx="225" ry="325" fill="none" stroke="#E0D7BE" stroke-width="3" stroke-dasharray="3,4" opacity="0.6" />
    <!-- Inner pure ivory writing badge -->
    <ellipse cx="300" cy="420" rx="215" ry="310" fill="url(#laceIvory)" stroke="#D8CEB4" stroke-width="1" />
  </g>
</svg>`;
writeAsset("public/assets/templates/elegant-lace-bg.svg", elegantLaceBgSvg);

// 3.2 Ribbons, Bows Card Background: Minimalist card with bold hanging black silk ribbon bow graphic
const ribbonsBowsBgSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 840" width="600" height="840">
  <defs>
    <filter id="bowShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="3" dy="8" stdDeviation="8" flood-color="#000000" flood-opacity="0.32" />
    </filter>
  </defs>
  <!-- Minimalist fine warm white paper -->
  <rect width="100%" height="100%" rx="12" fill="#FFFFFF" />
  <rect x="16" y="16" width="568" height="808" rx="8" fill="none" stroke="#F0EFEA" stroke-width="1" />
  <!-- Realistic Bold Hanging Black Silk Ribbon Bow at top right -->
  <g filter="url(#bowShadow)" transform="translate(360, 40)">
    <!-- Hanging tail left -->
    <path d="M70 120 C 40 220, 20 340, 45 440 C 52 410, 68 350, 85 240 C 95 180, 85 130, 70 120 Z" fill="#1C1C1F" />
    <path d="M45 440 L 60 415 L 75 440 Z" fill="#FFFFFF" opacity="0.05" />
    <!-- Hanging tail right (longer) -->
    <path d="M120 125 C 135 240, 160 380, 150 490 C 138 460, 125 380, 115 280 C 108 200, 112 140, 120 125 Z" fill="#111113" />
    <!-- Left bow loop -->
    <path d="M95 105 C 50 60, -20 70, 5 120 C 25 155, 75 135, 95 110 Z" fill="#242429" stroke="#111113" stroke-width="1.5" />
    <path d="M85 108 C 45 75, 5 85, 20 120 C 35 140, 70 125, 85 112 Z" fill="#383840" opacity="0.35" />
    <!-- Right bow loop -->
    <path d="M95 105 C 145 55, 215 65, 190 120 C 170 155, 115 135, 95 110 Z" fill="#1A1A1D" stroke="#111113" stroke-width="1.5" />
    <path d="M105 108 C 145 75, 190 85, 175 120 C 160 140, 125 125, 105 112 Z" fill="#2E2E35" opacity="0.4" />
    <!-- Central bow knot -->
    <ellipse cx="96" cy="110" rx="18" ry="16" fill="#141416" stroke="#000000" stroke-width="1" />
    <path d="M88 102 Q96 98 104 102 Q106 114 96 118 Q86 114 88 102 Z" fill="#2E2E35" opacity="0.5" />
  </g>
</svg>`;
writeAsset("public/assets/templates/ribbons-bows-bg.svg", ribbonsBowsBgSvg);

// 3.3 Painted Petals Card Background: Watercolor cornflowers and wildflowers framing
const paintedPetalsBgSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 840" width="600" height="840">
  <defs>
    <linearGradient id="creamCard" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#FBF9F4" />
    </linearGradient>
    <radialGradient id="cornflowerBlue" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#5C8FD6" />
      <stop offset="60%" stop-color="#2D63B5" />
      <stop offset="100%" stop-color="#19458A" />
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" rx="14" fill="url(#creamCard)" />
  <!-- Wildflower botanical watercolor framing on borders -->
  <g opacity="0.92">
    <!-- Top left floral cluster -->
    <g transform="translate(35, 35)">
      <path d="M20 120 Q50 60 110 30" stroke="#7BA87D" stroke-width="2.5" fill="none" />
      <circle cx="110" cy="30" r="14" fill="url(#cornflowerBlue)" />
      <circle cx="85" cy="55" r="11" fill="#4B80CE" opacity="0.85" />
      <circle cx="45" cy="95" r="13" fill="url(#cornflowerBlue)" />
      <circle cx="130" cy="50" r="6" fill="#A8C7F0" />
      <circle cx="65" cy="120" r="7" fill="#A8C7F0" />
      <ellipse cx="60" cy="50" rx="14" ry="6" fill="#88B88A" transform="rotate(-30 60 50)" />
      <ellipse cx="90" cy="85" rx="14" ry="6" fill="#75A677" transform="rotate(45 90 85)" />
    </g>
    <!-- Top right floral cluster -->
    <g transform="translate(440, 35)">
      <path d="M100 120 Q70 60 10 30" stroke="#7BA87D" stroke-width="2.5" fill="none" />
      <circle cx="10" cy="30" r="14" fill="url(#cornflowerBlue)" />
      <circle cx="35" cy="55" r="11" fill="#4B80CE" opacity="0.85" />
      <circle cx="75" cy="95" r="13" fill="url(#cornflowerBlue)" />
      <circle cx="-10" cy="50" r="6" fill="#A8C7F0" />
      <ellipse cx="60" cy="50" rx="14" ry="6" fill="#88B88A" transform="rotate(30 60 50)" />
    </g>
    <!-- Bottom left floral cluster -->
    <g transform="translate(35, 660)">
      <path d="M20 20 Q50 80 110 110" stroke="#7BA87D" stroke-width="2.5" fill="none" />
      <circle cx="110" cy="110" r="15" fill="url(#cornflowerBlue)" />
      <circle cx="60" cy="85" r="12" fill="#4B80CE" />
      <circle cx="30" cy="40" r="13" fill="url(#cornflowerBlue)" />
      <ellipse cx="70" cy="100" rx="15" ry="6" fill="#75A677" transform="rotate(-40 70 100)" />
    </g>
    <!-- Bottom right floral cluster -->
    <g transform="translate(440, 660)">
      <path d="M100 20 Q70 80 10 110" stroke="#7BA87D" stroke-width="2.5" fill="none" />
      <circle cx="10" cy="110" r="15" fill="url(#cornflowerBlue)" />
      <circle cx="60" cy="85" r="12" fill="#4B80CE" />
      <circle cx="90" cy="40" r="13" fill="url(#cornflowerBlue)" />
      <ellipse cx="50" cy="100" rx="15" ry="6" fill="#75A677" transform="rotate(40 50 100)" />
    </g>
  </g>
  <!-- Delicate inner border -->
  <rect x="55" y="55" width="490" height="730" rx="8" fill="none" stroke="#DCE5F2" stroke-width="1.2" />
</svg>`;
writeAsset("public/assets/templates/painted-petals-bg.svg", paintedPetalsBgSvg);

// 3.4 Gingham Blooms Card Background: Scalloped dusty-rose gingham check border + ivory text badge
const ginghamBloomsBgSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 840" width="600" height="840">
  <defs>
    <pattern id="dustyPinkGingham" width="28" height="28" patternUnits="userSpaceOnUse">
      <rect width="28" height="28" fill="#F8E5E8" />
      <rect width="14" height="14" fill="#E2A6B2" opacity="0.75" />
      <rect x="14" y="14" width="14" height="14" fill="#E2A6B2" opacity="0.75" />
      <rect x="14" width="14" height="14" fill="#C97587" opacity="0.45" />
      <rect y="14" width="14" height="14" fill="#C97587" opacity="0.45" />
    </pattern>
    <filter id="badgeShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#55222E" flood-opacity="0.18" />
    </filter>
  </defs>
  <!-- Outer scalloped pink gingham card frame -->
  <rect width="100%" height="100%" rx="24" fill="url(#dustyPinkGingham)" stroke="#D895A2" stroke-width="2" />
  <!-- Centered ivory writing badge -->
  <g filter="url(#badgeShadow)">
    <rect x="80" y="90" width="440" height="660" rx="16" fill="#FFFDF9" stroke="#C5A059" stroke-width="2" />
    <rect x="88" y="98" width="424" height="644" rx="12" fill="none" stroke="#C5A059" stroke-width="0.8" opacity="0.5" />
  </g>
</svg>`;
writeAsset("public/assets/templates/gingham-blooms-bg.svg", ginghamBloomsBgSvg);

// 3.5 It's Tea Time Card Background: Storybook arch vines, vintage teapots, cupcakes, ribbon banner
const itsTeaTimeBgSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 840" width="600" height="840">
  <defs>
    <linearGradient id="teaParchment" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#FCF9F2" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" rx="16" fill="url(#teaParchment)" stroke="#E4D7C0" stroke-width="2" />
  <!-- Botanical ornate arch vine surrounding the card -->
  <g stroke="#92AB72" stroke-width="3" fill="none">
    <path d="M70 760 L70 240 Q70 80 300 80 Q530 80 530 240 L530 760" />
    <!-- Vine spiral flourishes -->
    <path d="M70 240 Q40 210 50 180 Q65 160 80 190" stroke-width="2" />
    <path d="M530 240 Q560 210 550 180 Q535 160 520 190" stroke-width="2" />
    <path d="M70 450 Q45 420 55 390 Q70 380 75 410" stroke-width="2" />
    <path d="M530 450 Q555 420 545 390 Q530 380 525 410" stroke-width="2" />
  </g>
  <!-- Leaves and floral buds along arch -->
  <g fill="#A4BC86" stroke="#7A945C" stroke-width="1">
    <circle cx="160" cy="115" r="7" fill="#E28B9B" />
    <circle cx="440" cy="115" r="7" fill="#E28B9B" />
    <circle cx="70" cy="300" r="6" fill="#F4A261" />
    <circle cx="530" cy="300" r="6" fill="#F4A261" />
    <ellipse cx="120" cy="150" rx="9" ry="5" transform="rotate(-35 120 150)" />
    <ellipse cx="480" cy="150" rx="9" ry="5" transform="rotate(35 480 150)" />
  </g>
  <!-- Top Arched Ribbon Banner for IT'S TEA TIME -->
  <g transform="translate(160, 95)">
    <path d="M0 25 Q140 -5 280 25 L270 65 Q140 35 10 65 Z" fill="#F8DEB5" stroke="#D49A58" stroke-width="2" />
    <path d="M0 25 L-20 45 L0 65 L-10 45 Z" fill="#E8C694" stroke="#D49A58" stroke-width="1.5" />
    <path d="M280 25 L300 45 L280 65 L290 45 Z" fill="#E8C694" stroke="#D49A58" stroke-width="1.5" />
  </g>
  <!-- Vintage Teapot and Cupcake Illustration at bottom center -->
  <g transform="translate(180, 520)">
    <!-- Vintage teapot -->
    <g transform="translate(30, 20)">
      <ellipse cx="60" cy="70" rx="36" ry="28" fill="#F6C7B2" stroke="#B86E53" stroke-width="2.5" />
      <path d="M60 42 Q60 30 70 30 Q80 30 75 42" stroke="#B86E53" stroke-width="2.5" fill="none" />
      <!-- Handle -->
      <path d="M24 60 C5 60, 5 90, 30 90" stroke="#B86E53" stroke-width="3.5" fill="none" />
      <!-- Spout -->
      <path d="M96 68 Q115 60 120 48 Q115 75 92 84" stroke="#B86E53" stroke-width="2.5" fill="#F6C7B2" />
      <ellipse cx="60" cy="42" rx="20" ry="6" fill="#B86E53" />
    </g>
    <!-- Teacup pouring -->
    <g transform="translate(145, 65)">
      <path d="M10 20 Q10 42 28 42 Q46 42 46 20 Z" fill="#FBF3E4" stroke="#B86E53" stroke-width="2" />
      <ellipse cx="28" cy="45" rx="24" ry="4" fill="#E5D3B8" stroke="#B86E53" stroke-width="1" />
      <!-- Handle -->
      <path d="M46 25 Q54 28 46 36" stroke="#B86E53" stroke-width="2" fill="none" />
    </g>
    <!-- Cupcake / Cake stand -->
    <g transform="translate(180, 35)">
      <path d="M25 45 L45 45 L40 65 L30 65 Z" fill="#F5CCA0" stroke="#9A6138" stroke-width="1.5" />
      <!-- Icing -->
      <path d="M20 45 Q35 20 50 45 Q35 30 20 45" fill="#E76F51" stroke="#9A6138" stroke-width="1.5" />
      <circle cx="35" cy="24" r="4" fill="#C1121F" />
    </g>
  </g>
</svg>`;
writeAsset("public/assets/templates/its-tea-time-bg.svg", itsTeaTimeBgSvg);

// 3.6 Lemons & Blossoms Card Background: Amalfi lemon branches & Mediterranean arched card
const lemonsBlossomsBgSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 840" width="600" height="840">
  <defs>
    <radialGradient id="amalfiLemon" cx="40%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#FFF566" />
      <stop offset="65%" stop-color="#FCD34D" />
      <stop offset="100%" stop-color="#F59E0B" />
    </radialGradient>
    <linearGradient id="medSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#D7EAF7" />
      <stop offset="100%" stop-color="#EDF5FA" />
    </linearGradient>
  </defs>
  <!-- Card background in Mediterranean pale blue -->
  <rect width="100%" height="100%" rx="16" fill="url(#medSky)" />
  <!-- Center arched white card badge -->
  <path d="M100 750 L100 280 Q100 130 300 130 Q500 130 500 280 L500 750 Z" fill="#FFFFFF" stroke="#C8DFEE" stroke-width="1.5" />
  <!-- Lemon tree branches & lemons framing the arch -->
  <!-- Top left lemon cluster -->
  <g transform="translate(30, 40)">
    <path d="M40 180 Q80 80 180 50" stroke="#3D5A27" stroke-width="4" fill="none" />
    <!-- Lemons -->
    <ellipse cx="60" cy="110" rx="36" ry="26" fill="url(#amalfiLemon)" transform="rotate(35 60 110)" />
    <ellipse cx="140" cy="65" rx="32" ry="24" fill="url(#amalfiLemon)" transform="rotate(-25 140 65)" />
    <!-- White blossoms -->
    <circle cx="105" cy="85" r="7" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" />
    <circle cx="105" cy="85" r="2.5" fill="#FCD34D" />
    <!-- Green leaves -->
    <ellipse cx="70" cy="60" rx="25" ry="11" fill="#4C7333" transform="rotate(-40 70 60)" />
    <ellipse cx="120" cy="120" rx="28" ry="12" fill="#5E8C3F" transform="rotate(25 120 120)" />
  </g>
  <!-- Top right lemon cluster -->
  <g transform="translate(420, 40)">
    <path d="M140 180 Q100 80 0 50" stroke="#3D5A27" stroke-width="4" fill="none" />
    <ellipse cx="120" cy="110" rx="36" ry="26" fill="url(#amalfiLemon)" transform="rotate(-35 120 110)" />
    <ellipse cx="40" cy="65" rx="32" ry="24" fill="url(#amalfiLemon)" transform="rotate(25 40 65)" />
    <circle cx="75" cy="85" r="7" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" />
    <circle cx="75" cy="85" r="2.5" fill="#FCD34D" />
    <ellipse cx="110" cy="60" rx="25" ry="11" fill="#4C7333" transform="rotate(40 110 60)" />
  </g>
  <!-- Bottom left lemon cluster -->
  <g transform="translate(20, 640)">
    <ellipse cx="60" cy="90" rx="38" ry="28" fill="url(#amalfiLemon)" transform="rotate(20 60 90)" />
    <ellipse cx="80" cy="40" rx="28" ry="12" fill="#4C7333" transform="rotate(-30 80 40)" />
  </g>
  <!-- Bottom right lemon cluster -->
  <g transform="translate(450, 640)">
    <ellipse cx="70" cy="90" rx="38" ry="28" fill="url(#amalfiLemon)" transform="rotate(-20 70 90)" />
    <ellipse cx="50" cy="40" rx="28" ry="12" fill="#4C7333" transform="rotate(30 50 40)" />
  </g>
</svg>`;
writeAsset("public/assets/templates/lemons-blossoms-bg.svg", lemonsBlossomsBgSvg);

// 3.7 Mamma Mia Card Background: Blue-and-white Majolica tile border + lemons & olives
const mammaMiaBgSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 840" width="600" height="840">
  <defs>
    <!-- Majolica tile border pattern -->
    <pattern id="majolicaTile" width="48" height="48" patternUnits="userSpaceOnUse">
      <rect width="48" height="48" fill="#FFFFFF" stroke="#0D47A1" stroke-width="1" />
      <path d="M24 0 L48 24 L24 48 L0 24 Z" fill="#E3F2FD" stroke="#1565C0" stroke-width="1" />
      <circle cx="24" cy="24" r="8" fill="#1976D2" />
      <circle cx="24" cy="24" r="3.5" fill="#FFF" />
      <!-- Floral florets in corners -->
      <path d="M0 0 Q10 0 10 10 Q0 10 0 0 Z" fill="#0D47A1" />
      <path d="M48 0 Q38 0 38 10 Q48 10 48 0 Z" fill="#0D47A1" />
      <path d="M0 48 Q10 48 10 38 Q0 38 0 48 Z" fill="#0D47A1" />
      <path d="M48 48 Q38 48 38 38 Q48 38 48 48 Z" fill="#0D47A1" />
    </pattern>
  </defs>
  <!-- Card base -->
  <rect width="100%" height="100%" rx="16" fill="#FFFFFF" />
  <!-- Outer Majolica border frame (48px thick rim) -->
  <rect x="16" y="16" width="568" height="808" fill="url(#majolicaTile)" stroke="#0D47A1" stroke-width="2" rx="10" />
  <!-- Inner crisp ivory text writing panel -->
  <rect x="64" y="64" width="472" height="712" fill="#FFFFFF" stroke="#1565C0" stroke-width="1.5" rx="6" />
  <rect x="72" y="72" width="456" height="696" fill="none" stroke="#BBDEFB" stroke-width="1" />
  <!-- Fresh ripe lemons and olive greenery accents on top-right and bottom-left corners -->
  <g transform="translate(420, 25)">
    <ellipse cx="65" cy="55" rx="34" ry="25" fill="#FFEB3B" stroke="#F57F17" stroke-width="1.5" transform="rotate(30 65 55)" />
    <ellipse cx="25" cy="75" rx="22" ry="10" fill="#33691E" transform="rotate(-40 25 75)" />
    <ellipse cx="90" cy="35" rx="20" ry="9" fill="#2E7D32" transform="rotate(20 90 35)" />
  </g>
  <g transform="translate(30, 680)">
    <ellipse cx="50" cy="55" rx="34" ry="25" fill="#FFEB3B" stroke="#F57F17" stroke-width="1.5" transform="rotate(-25 50 55)" />
    <ellipse cx="85" cy="35" rx="22" ry="10" fill="#33691E" transform="rotate(40 85 35)" />
    <ellipse cx="20" cy="75" rx="20" ry="9" fill="#2E7D32" transform="rotate(-30 20 75)" />
  </g>
</svg>`;
writeAsset("public/assets/templates/mamma-mia-bg.svg", mammaMiaBgSvg);

// 3.8 Moonlit Grove Card Background: Dark forest teal, gold crescent moon, woodland owl, mushrooms, squirrels
const moonlitGroveBgSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 840" width="600" height="840">
  <defs>
    <radialGradient id="forestTeal" cx="50%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#143D3B" />
      <stop offset="60%" stop-color="#0B2726" />
      <stop offset="100%" stop-color="#051413" />
    </radialGradient>
    <radialGradient id="goldMoon" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#FFF6CC" />
      <stop offset="50%" stop-color="#FCD34D" />
      <stop offset="100%" stop-color="#D97706" />
    </radialGradient>
    <filter id="moonGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="glow" />
      <feMerge>
        <feMergeNode in="glow" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
  <!-- Dark forest green/teal card base -->
  <rect width="100%" height="100%" rx="16" fill="url(#forestTeal)" stroke="#C5A059" stroke-width="1.5" />
  <!-- Fairy tale gold border -->
  <rect x="24" y="24" width="552" height="792" rx="10" fill="none" stroke="#C5A059" stroke-width="1.2" opacity="0.65" />
  <!-- Little stars scattered in the sky -->
  <g fill="#FDE68A" opacity="0.7">
    <circle cx="120" cy="90" r="2" />
    <circle cx="200" cy="140" r="1.5" />
    <circle cx="420" cy="110" r="2" />
    <circle cx="480" cy="80" r="1.8" />
    <circle cx="160" cy="220" r="1.5" />
    <circle cx="460" cy="240" r="2" />
  </g>
  <!-- Gold Foil Crescent Moon at top center -->
  <g filter="url(#moonGlow)" transform="translate(265, 55)">
    <path d="M40 0 C 65 0, 80 25, 75 55 C 70 85, 45 105, 15 100 C 45 90, 58 60, 52 35 C 48 18, 30 8, 40 0 Z" fill="url(#goldMoon)" />
  </g>
  <!-- Woodland Owl perched top left -->
  <g transform="translate(60, 60)">
    <ellipse cx="40" cy="60" rx="22" ry="32" fill="#78563A" stroke="#452C18" stroke-width="1.5" />
    <!-- Eyes -->
    <circle cx="32" cy="45" r="7" fill="#FDE68A" />
    <circle cx="48" cy="45" r="7" fill="#FDE68A" />
    <circle cx="32" cy="45" r="3.5" fill="#1F150E" />
    <circle cx="48" cy="45" r="3.5" fill="#1F150E" />
    <!-- Beak -->
    <polygon points="40,50 37,56 43,56" fill="#F59E0B" />
    <!-- Wing -->
    <path d="M20 55 Q15 80 35 90" stroke="#452C18" stroke-width="2" fill="#5E3F27" />
  </g>
  <!-- Bottom Woodland Creatures: Mushrooms & Squirrels -->
  <!-- Red Fly Agaric Mushrooms center bottom -->
  <g transform="translate(250, 660)">
    <path d="M30 40 Q50 0 70 40 Z" fill="#DC2626" stroke="#7F1D1D" stroke-width="1.5" />
    <circle cx="42" cy="22" r="3" fill="#FFF" />
    <circle cx="58" cy="24" r="3" fill="#FFF" />
    <rect x="44" y="40" width="12" height="24" rx="4" fill="#F5EFEB" />
    <!-- Smaller mushroom -->
    <path d="M10 50 Q22 25 34 50 Z" fill="#EA580C" />
    <circle cx="22" cy="38" r="2" fill="#FFF" />
    <rect x="18" y="50" width="8" height="18" rx="3" fill="#F5EFEB" />
  </g>
  <!-- Left Squirrel -->
  <g transform="translate(65, 650)">
    <ellipse cx="50" cy="50" rx="16" ry="22" fill="#A05A2C" />
    <circle cx="56" cy="35" r="10" fill="#A05A2C" />
    <!-- Big bushy tail -->
    <path d="M35 60 C 15 60, 5 20, 25 15 C 40 10, 45 40, 35 60 Z" fill="#BA6C36" stroke="#8A481E" stroke-width="1.5" />
  </g>
  <!-- Right Squirrel -->
  <g transform="translate(450, 650)">
    <ellipse cx="30" cy="50" rx="16" ry="22" fill="#A05A2C" />
    <circle cx="24" cy="35" r="10" fill="#A05A2C" />
    <path d="M45 60 C 65 60, 75 20, 55 15 C 40 10, 35 40, 45 60 Z" fill="#BA6C36" stroke="#8A481E" stroke-width="1.5" />
  </g>
</svg>`;
writeAsset("public/assets/templates/moonlit-grove-bg.svg", moonlitGroveBgSvg);

// 3.9 Taste Of Italy Card Background: Red checkered trattoria border + wine bottle, pasta, tomatoes
const tasteOfItalyBgSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 840" width="600" height="840">
  <defs>
    <!-- Red and white trattoria checkered pattern -->
    <pattern id="trattoriaCheck" width="32" height="32" patternUnits="userSpaceOnUse">
      <rect width="32" height="32" fill="#FFFFFF" />
      <rect width="16" height="16" fill="#DC2626" />
      <rect x="16" y="16" width="16" height="16" fill="#DC2626" />
    </pattern>
  </defs>
  <!-- Card base -->
  <rect width="100%" height="100%" rx="16" fill="#FFFFFF" />
  <!-- Red-and-white checkered trattoria border (40px width) -->
  <rect x="16" y="16" width="568" height="808" fill="url(#trattoriaCheck)" rx="12" stroke="#B91C1C" stroke-width="2" />
  <!-- Inner ivory text card panel -->
  <rect x="56" y="56" width="488" height="728" fill="#FFFDF9" stroke="#DC2626" stroke-width="1.5" rx="8" />
  <!-- Hand-drawn Italian graphics at bottom center: Wine bottle, glass, farfalle pasta, vine tomatoes -->
  <g transform="translate(100, 600)">
    <!-- Chianti Wine Bottle -->
    <g transform="translate(60, 20)">
      <path d="M20 30 L20 10 L28 10 L28 30 Q38 45 38 75 L10 75 Q10 45 20 30 Z" fill="#2E6930" stroke="#1B431D" stroke-width="2" />
      <rect x="12" y="60" width="24" height="35" fill="#D4A373" stroke="#9A6B3D" stroke-width="1.5" />
      <line x1="12" y1="72" x2="36" y2="72" stroke="#9A6B3D" stroke-width="1" />
    </g>
    <!-- Wine glass -->
    <g transform="translate(125, 45)">
      <path d="M8 10 Q8 38 24 38 Q40 38 40 10 Z" fill="#991B1B" opacity="0.85" stroke="#7F1D1D" stroke-width="1.5" />
      <line x1="24" y1="38" x2="24" y2="65" stroke="#7F1D1D" stroke-width="2" />
      <ellipse cx="24" cy="65" rx="14" ry="4" fill="#7F1D1D" />
    </g>
    <!-- Farfalle bowtie pasta -->
    <g transform="translate(195, 60)">
      <path d="M10 15 L25 22 L10 30 Q22 22 10 15 Z" fill="#FBBF24" stroke="#D97706" stroke-width="1.5" />
      <path d="M40 15 L25 22 L40 30 Q28 22 40 15 Z" fill="#FBBF24" stroke="#D97706" stroke-width="1.5" />
      <circle cx="25" cy="22" r="3.5" fill="#D97706" />
    </g>
    <!-- Tomatoes on the vine -->
    <g transform="translate(265, 45)">
      <path d="M15 15 Q35 10 65 25" stroke="#15803D" stroke-width="2.5" fill="none" />
      <circle cx="22" cy="35" r="16" fill="#EF4444" stroke="#B91C1C" stroke-width="1.5" />
      <circle cx="50" cy="42" r="18" fill="#DC2626" stroke="#B91C1C" stroke-width="1.5" />
      <circle cx="78" cy="48" r="15" fill="#EF4444" stroke="#B91C1C" stroke-width="1.5" />
      <path d="M22 20 L22 14" stroke="#15803D" stroke-width="2" />
      <path d="M50 24 L50 18" stroke="#15803D" stroke-width="2" />
    </g>
  </g>
</svg>`;
writeAsset("public/assets/templates/taste-of-italy-bg.svg", tasteOfItalyBgSvg);

console.log("All Backdrops, Liners, and Card Background SVGs Generated Successfully!");
