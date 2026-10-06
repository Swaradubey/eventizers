/**
 * Thanksgiving / Autumn Template Asset Generator
 *
 * Emits 6 assets:
 *   public/templates/assets/woodland-feast-table.svg             (card artwork - Everyone's Family)
 *   public/templates/assets/folk-art-turkey-leaves.svg           (card artwork - Give Thanks)
 *   public/templates/assets/botanical-pumpkin-etching.svg        (card artwork - Thanksgiving Branches)
 *   public/assets/templates/template-everyones-family-mockup.svg (gallery thumbnail)
 *   public/assets/templates/template-give-thanks-mockup.svg      (gallery thumbnail)
 *   public/assets/templates/template-thanksgiving-branches-mockup.svg (gallery thumbnail)
 *
 * Mockup filenames MUST stay prefixed with the template id
 * (`template-<slug>-mockup.svg`) because the registry derives
 * `mockupUrl`/`thumbnailUrl` from `seed.id` — any other name 404s.
 *
 * Mirrors are also written into `backend/public/**` so the Express backend
 * serves the same assets when it resolves template image URLs.
 *
 * Usage: node scripts/createThanksgivingTemplates.js
 */

const fs = require("fs");
const path = require("path");

const PUBLIC_DIR = path.join(__dirname, "..", "public");
const CARD_DIR = path.join(PUBLIC_DIR, "templates", "assets");
const MOCKUP_DIR = path.join(PUBLIC_DIR, "assets", "templates");

const BACKEND_PUBLIC = path.join(__dirname, "..", "backend", "public");
const BACKEND_CARD_DIR = path.join(BACKEND_PUBLIC, "templates", "assets");
const BACKEND_MOCKUP_DIR = path.join(BACKEND_PUBLIC, "assets", "templates");

const CARD_W = 600;
const CARD_H = 840;
const MOCK_W = 600;
const MOCK_H = 800;

/* ========================================================================== */
/*  SHARED PALETTE                                                            */
/* ========================================================================== */

const C = {
  paper: "#FAF5EC",
  cream: "#FFF9E6",
  rose: "#EED8CB",
  terracotta: "#A8553F",
  deepBrown: "#5A2E17",
  warmBrown: "#6B4423",
  kraft: "#B89772",
  kraftDark: "#8C6D4F",
  forest: "#1D3B2E",
  forestDark: "#14281F",
  pumpkin: "#E07A2F",
  pumpkinDeep: "#C25A1E",
  amber: "#F0A93C",
  crimson: "#C0392B",
  rust: "#B4552B",
  olive: "#7E8A5B",
  moss: "#5C7048",
  sage: "#9BAA7E",
  teal: "#2E8B8B",
  blue: "#3E6FB0",
  gold: "#F2C14E",
  green: "#7FB539",
  ink: "#1C1C1C",
};

/* ========================================================================== */
/*  BOTANICAL / DECOR PRIMITIVES                                              */
/* ========================================================================== */

/** Pointed leaf with midrib */
const leaf = (x, y, rot, s, fill, stroke = "none", sw = 1.2) => `
  <g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
    <path d="M0 -20 C 11 -11 13 4 0 20 C -13 4 -11 -11 0 -20 Z" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>
    <path d="M0 -16 L0 17" fill="none" stroke="${stroke === "none" ? "rgba(0,0,0,0.16)" : stroke}" stroke-width="${sw * 0.8}"/>
  </g>`;

/** Maple / sycamore leaf */
const mapleLeaf = (x, y, rot, s, fill, stroke = "none", sw = 1.2) => `
  <g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
    <path d="M0 -24 L5 -11 L16 -15 L13 -4 L25 -1 L13 4 L17 13 L6 11 L5 21 L-5 21 L-6 11 L-17 13 L-13 4 L-25 -1 L-13 -4 L-16 -15 L-5 -11 Z"
      fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>
    <path d="M0 -20 L0 22 M0 -6 L13 -12 M0 -6 L-13 -12 M0 6 L14 10 M0 6 L-14 10"
      fill="none" stroke="${stroke === "none" ? "rgba(0,0,0,0.14)" : stroke}" stroke-width="${sw * 0.75}" stroke-linecap="round"/>
  </g>`;

/** Oak-ish lobed leaf */
const oakLeaf = (x, y, rot, s, fill, stroke = "none", sw = 1.1) => `
  <g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
    <path d="M0 -19 C 7 -15 6 -10 11 -8 C 16 -6 15 0 11 2 C 16 5 14 11 8 12 C 5 17 2 17 0 20 C -2 17 -5 17 -8 12 C -14 11 -16 5 -11 2 C -15 0 -16 -6 -11 -8 C -6 -10 -7 -15 0 -19 Z"
      fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>
    <path d="M0 -16 L0 18" fill="none" stroke="${stroke === "none" ? "rgba(0,0,0,0.15)" : stroke}" stroke-width="${sw * 0.8}"/>
  </g>`;

/** Small three-leaf sprig growing from (x,y) */
const sprig = (x, y, rot, s, stemColor, leafFill) => `
  <g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
    <path d="M0 0 C 2 -14 2 -26 0 -40" fill="none" stroke="${stemColor}" stroke-width="2" stroke-linecap="round"/>
    ${leaf(6, -12, 55, 0.42, leafFill, stemColor, 1.6)}
    ${leaf(-6, -20, -55, 0.42, leafFill, stemColor, 1.6)}
    ${leaf(4, -30, 35, 0.4, leafFill, stemColor, 1.6)}
    ${leaf(0, -44, 0, 0.44, leafFill, stemColor, 1.6)}
  </g>`;

/** Pumpkin seen from the front */
const pumpkin = (x, y, w, h, fill, rib, stem) => {
  const rx = w / 2;
  const ry = h / 2;
  return `
  <g transform="translate(${x} ${y})">
    <path d="M0 ${-ry - 12} q 4 -8 12 -6 q -6 4 -5 14 z" fill="${stem}"/>
    <ellipse cx="${-rx * 0.52}" cy="0" rx="${rx * 0.56}" ry="${ry}" fill="${fill}"/>
    <ellipse cx="${rx * 0.52}" cy="0" rx="${rx * 0.56}" ry="${ry}" fill="${fill}"/>
    <ellipse cx="0" cy="0" rx="${rx * 0.62}" ry="${ry}" fill="${fill}"/>
    <path d="M${-rx * 0.5} ${-ry * 0.9} Q ${-rx * 0.5} 0 ${-rx * 0.5} ${ry * 0.9}" fill="none" stroke="${rib}" stroke-width="1.6"/>
    <path d="M${rx * 0.5} ${-ry * 0.9} Q ${rx * 0.5} 0 ${rx * 0.5} ${ry * 0.9}" fill="none" stroke="${rib}" stroke-width="1.6"/>
    <path d="M0 ${-ry} Q ${-rx * 0.2} 0 0 ${ry}" fill="none" stroke="${rib}" stroke-width="1.4" opacity="0.7"/>
    <path d="M0 ${-ry} Q ${rx * 0.2} 0 0 ${ry}" fill="none" stroke="${rib}" stroke-width="1.4" opacity="0.7"/>
    <ellipse cx="${-rx * 0.25}" cy="${-ry * 0.35}" rx="${rx * 0.18}" ry="${ry * 0.2}" fill="rgba(255,255,255,0.28)"/>
  </g>`;
};

/** Curled tendril */
const tendril = (x, y, rot, s, stroke) => `
  <g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
    <path d="M0 0 C 10 -6 20 -4 24 4 C 27 11 20 15 15 11 C 11 8 14 3 18 5"
      fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/>
  </g>`;

/** Wheat / grain stalk */
const wheat = (x, y, rot, s, fill) => `
  <g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
    <path d="M0 0 L0 -70" fill="none" stroke="${fill}" stroke-width="2.4" stroke-linecap="round"/>
    ${[0, 1, 2, 3, 4].map((i) => `
      <ellipse cx="5" cy="${-16 - i * 12}" rx="5" ry="9" fill="${fill}" transform="rotate(18 5 ${-16 - i * 12})"/>
      <ellipse cx="-5" cy="${-22 - i * 12}" rx="5" ry="9" fill="${fill}" transform="rotate(-18 -5 ${-22 - i * 12})"/>`).join("")}
  </g>`;

/** Simple daisy / aster flower */
const flower = (x, y, s, petal, center) => `
  <g transform="translate(${x} ${y}) scale(${s})">
    ${[0, 60, 120, 180, 240, 300].map((a) => `
      <ellipse cx="0" cy="-13" rx="6" ry="13" fill="${petal}" transform="rotate(${a})"/>`).join("")}
    <circle r="6" fill="${center}"/>
  </g>`;

/** Berry cluster */
const berries = (x, y, s, fill) => `
  <g transform="translate(${x} ${y}) scale(${s})">
    <circle cx="0" cy="0" r="6" fill="${fill}"/>
    <circle cx="11" cy="5" r="5.5" fill="${fill}"/>
    <circle cx="4" cy="-11" r="5" fill="${fill}"/>
    <circle cx="14" cy="-6" r="4.5" fill="${fill}"/>
    <circle cx="-1" cy="-1" r="2" fill="rgba(255,255,255,0.4)"/>
  </g>`;

/* ========================================================================== */
/*  WHIMSICAL WOODLAND CRITTERS                                                */
/* ========================================================================== */

/**
 * Generic seated critter: torso + head + ears/muzzle.
 * ear: "round" | "tall" | "triangle" | "floppy" | "tuft"
 */
const critter = ({
  x, y, s = 1, rot = 0,
  fur, belly, ear, innerEar = null,
  muzzle = null, antlers = false, tufts = false,
  scarf = null,
}) => {
  const ie = innerEar || "rgba(0,0,0,0.14)";
  const mzl = muzzle || "rgba(255,255,255,0.72)";

  const ears = {
    round: `
      <circle cx="-30" cy="-46" r="15" fill="${fur}"/><circle cx="30" cy="-46" r="15" fill="${fur}"/>
      <circle cx="-30" cy="-46" r="7.5" fill="${ie}"/><circle cx="30" cy="-46" r="7.5" fill="${ie}"/>`,
    tall: `
      <ellipse cx="-17" cy="-70" rx="10" ry="30" fill="${fur}" transform="rotate(-8 -17 -70)"/>
      <ellipse cx="17" cy="-70" rx="10" ry="30" fill="${fur}" transform="rotate(8 17 -70)"/>
      <ellipse cx="-17" cy="-70" rx="4.5" ry="20" fill="${ie}" transform="rotate(-8 -17 -70)"/>
      <ellipse cx="17" cy="-70" rx="4.5" ry="20" fill="${ie}" transform="rotate(8 17 -70)"/>`,
    triangle: `
      <path d="M-44 -34 L-34 -66 L-12 -46 Z" fill="${fur}"/>
      <path d="M44 -34 L34 -66 L12 -46 Z" fill="${fur}"/>
      <path d="M-38 -40 L-33 -58 L-21 -46 Z" fill="${ie}"/>
      <path d="M38 -40 L33 -58 L21 -46 Z" fill="${ie}"/>`,
    floppy: `
      <ellipse cx="-42" cy="-34" rx="13" ry="26" fill="${fur}" transform="rotate(18 -42 -34)"/>
      <ellipse cx="42" cy="-34" rx="13" ry="26" fill="${fur}" transform="rotate(-18 42 -34)"/>
      <ellipse cx="-42" cy="-34" rx="6" ry="16" fill="${ie}" transform="rotate(18 -42 -34)"/>
      <ellipse cx="42" cy="-34" rx="6" ry="16" fill="${ie}" transform="rotate(-18 42 -34)"/>`,
    tuft: `
      <path d="M-34 -38 L-24 -62 L-6 -44 Z" fill="${fur}"/>
      <path d="M34 -38 L24 -62 L6 -44 Z" fill="${fur}"/>`,
  }[ear] || "";

  return `
  <g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
    ${antlers ? `
      <path d="M-22 -52 C -34 -74 -48 -78 -54 -96 M-30 -66 L-46 -66 M-16 -58 L-30 -74"
        fill="none" stroke="#7A5533" stroke-width="5" stroke-linecap="round"/>
      <path d="M22 -52 C 34 -74 48 -78 54 -96 M30 -66 L46 -66 M16 -58 L30 -74"
        fill="none" stroke="#7A5533" stroke-width="5" stroke-linecap="round"/>` : ""}
    ${ears}
    <!-- torso -->
    <path d="M-46 44 C -50 6 -26 -8 0 -8 C 26 -8 50 6 46 44 C 44 74 26 92 0 92 C -26 92 -44 74 -46 44 Z" fill="${fur}"/>
    <ellipse cx="0" cy="52" rx="26" ry="34" fill="${belly}"/>
    <!-- arms -->
    <ellipse cx="-44" cy="52" rx="12" ry="22" fill="${fur}" transform="rotate(14 -44 52)"/>
    <ellipse cx="44" cy="52" rx="12" ry="22" fill="${fur}" transform="rotate(-14 44 52)"/>
    ${scarf ? `<path d="M-34 18 C -16 30 16 30 34 18 L 34 34 C 16 45 -16 45 -34 34 Z" fill="${scarf}"/>` : ""}
    <!-- head -->
    <ellipse cx="0" cy="-4" rx="44" ry="40" fill="${fur}"/>
    ${tufts ? `<path d="M0 -46 C -6 -58 -18 -60 -24 -54 M0 -46 C 6 -58 18 -60 24 -54" fill="none" stroke="${fur}" stroke-width="6" stroke-linecap="round"/>` : ""}
    <ellipse cx="0" cy="8" rx="22" ry="17" fill="${mzl}"/>
    <ellipse cx="0" cy="2" rx="7.5" ry="5.5" fill="#2E2118"/>
    <path d="M0 7 q -7 8 -13 3 M0 7 q 7 8 13 3" fill="none" stroke="#2E2118" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="-17" cy="-10" r="5" fill="#2E2118"/>
    <circle cx="17" cy="-10" r="5" fill="#2E2118"/>
    <circle cx="-15.5" cy="-12" r="1.8" fill="#fff"/>
    <circle cx="18.5" cy="-12" r="1.8" fill="#fff"/>
    <ellipse cx="-30" cy="4" rx="7" ry="5" fill="rgba(224,122,47,0.28)"/>
    <ellipse cx="30" cy="4" rx="7" ry="5" fill="rgba(224,122,47,0.28)"/>
  </g>`;
};

/** Small bird / owl perched */
const owl = (x, y, s, rot, body, belly) => `
  <g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
    <path d="M-30 -6 L-18 -34 L-4 -14 Z" fill="${body}"/>
    <path d="M30 -6 L18 -34 L4 -14 Z" fill="${body}"/>
    <ellipse cx="0" cy="10" rx="34" ry="42" fill="${body}"/>
    <path d="M-34 6 C -44 24 -40 48 -22 54 L -16 20 Z" fill="rgba(0,0,0,0.16)"/>
    <path d="M34 6 C 44 24 40 48 22 54 L 16 20 Z" fill="rgba(0,0,0,0.16)"/>
    <ellipse cx="0" cy="24" rx="20" ry="24" fill="${belly}"/>
    <path d="M-14 16 q 14 12 28 0 M-14 28 q 14 12 28 0" fill="none" stroke="rgba(0,0,0,0.14)" stroke-width="2"/>
    <circle cx="-13" cy="-6" r="13" fill="#FFF6E4"/><circle cx="13" cy="-6" r="13" fill="#FFF6E4"/>
    <circle cx="-13" cy="-6" r="6.5" fill="#2E2118"/><circle cx="13" cy="-6" r="6.5" fill="#2E2118"/>
    <circle cx="-11" cy="-8" r="2.2" fill="#fff"/><circle cx="15" cy="-8" r="2.2" fill="#fff"/>
    <path d="M-6 4 L6 4 L0 13 Z" fill="${C.amber}"/>
    <path d="M-12 52 L-12 60 M12 52 L12 60" stroke="${C.amber}" stroke-width="4" stroke-linecap="round"/>
  </g>`;

/** Big fluffy squirrel tail (drawn behind a critter) */
const squirrelTail = (x, y, s, rot, fill) => `
  <g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
    <path d="M0 0 C 46 -10 70 26 52 62 C 38 90 -2 92 -14 66 C -22 48 -6 40 4 50 C 14 60 4 74 -8 68"
      fill="${fill}" stroke="rgba(0,0,0,0.1)" stroke-width="2"/>
  </g>`;

/* ========================================================================== */
/*  PLATE SETTINGS & TABLE PROPS                                              */
/* ========================================================================== */

const plate = (x, y, s, rim = "#EADFCB", inner = "#FFFDF7") => `
  <g transform="translate(${x} ${y}) scale(${s})">
    <circle r="34" fill="${rim}"/>
    <circle r="26" fill="${inner}"/>
    <circle r="26" fill="none" stroke="rgba(0,0,0,0.07)" stroke-width="1.4"/>
    <circle r="34" fill="none" stroke="rgba(0,0,0,0.09)" stroke-width="1.6"/>
  </g>`;

const glass = (x, y, s, liquid = "rgba(196,74,60,0.75)") => `
  <g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-13 -22 L13 -22 L9 -2 C 9 8 -9 8 -9 -2 Z" fill="rgba(255,255,255,0.55)" stroke="rgba(0,0,0,0.16)" stroke-width="1.6"/>
    <path d="M-10 -8 L10 -8 L8 -1 C 8 6 -8 6 -8 -1 Z" fill="${liquid}"/>
    <path d="M0 8 L0 20 M-9 21 L9 21" stroke="rgba(0,0,0,0.18)" stroke-width="2" stroke-linecap="round"/>
  </g>`;

const cutlery = (x, y, rot, s) => `
  <g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
    <path d="M0 -26 L0 26" stroke="#B9B4A8" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M-5 -26 L-5 -8 M0 -26 L0 -8 M5 -26 L5 -8" stroke="#B9B4A8" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M-5 -26 q 5 -6 10 0" fill="none" stroke="#B9B4A8" stroke-width="2.6"/>
  </g>`;

const knife = (x, y, rot, s) => `
  <g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
    <path d="M0 -26 L0 26" stroke="#B9B4A8" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M0 -26 q 6 8 0 16 z" fill="#C7C2B6"/>
  </g>`;

const napkin = (x, y, rot, s, fill) => `
  <g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
    <rect x="-20" y="-14" width="40" height="28" rx="4" fill="${fill}"/>
    <rect x="-20" y="-14" width="40" height="9" rx="4" fill="rgba(0,0,0,0.07)"/>
    <path d="M-20 4 L20 4" stroke="rgba(0,0,0,0.1)" stroke-width="1.4"/>
  </g>`;

const candlestick = (x, y, s) => `
  <g transform="translate(${x} ${y}) scale(${s})">
    <rect x="-7" y="-46" width="14" height="46" rx="4" fill="#F3E7CE"/>
    <ellipse cx="0" cy="0" rx="17" ry="6" fill="#C9A96B"/>
    <rect x="-11" y="-6" width="22" height="8" rx="3" fill="#D9BC85"/>
    <path d="M0 -56 q 8 8 0 14 q -8 -6 0 -14 z" fill="#F5A623"/>
    <path d="M0 -52 q 4 4 0 8 q -4 -4 0 -8 z" fill="#FFE7A8"/>
  </g>`;

const pieDish = (x, y, s) => `
  <g transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="0" cy="6" rx="52" ry="30" fill="#E2C089"/>
    <ellipse cx="0" cy="0" rx="52" ry="30" fill="#EFCE9A"/>
    <path d="M-52 0 q 52 34 104 0" fill="#D9A85F"/>
    <path d="M-44 -2 l 12 10 M-24 -10 l 12 14 M-4 -12 l 12 16 M16 -10 l 12 14 M36 -2 l 10 10"
      stroke="#C98F4A" stroke-width="3.4" stroke-linecap="round" fill="none"/>
    <ellipse cx="0" cy="0" rx="52" ry="30" fill="none" stroke="rgba(140,90,40,0.5)" stroke-width="2.4"/>
  </g>`;

const roastTurkey = (x, y, s) => `
  <g transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="0" cy="8" rx="54" ry="30" fill="#FFFDF6" stroke="rgba(0,0,0,0.09)" stroke-width="2"/>
    <path d="M-40 4 C -34 -26 34 -26 40 4 C 34 22 -34 22 -40 4 Z" fill="#B4642A"/>
    <path d="M-40 4 C -34 -26 34 -26 40 4" fill="none" stroke="#8E4B1D" stroke-width="2.4"/>
    <path d="M-22 -8 q 6 -10 14 -2 M2 -12 q 8 -8 14 0" fill="none" stroke="#8E4B1D" stroke-width="2.2"/>
    <path d="M-44 6 q -14 6 -18 16 M44 6 q 14 6 18 16" fill="none" stroke="#8E4B1D" stroke-width="7" stroke-linecap="round"/>
    <ellipse cx="-30" cy="16" rx="12" ry="7" fill="#C97A3A"/>
    <ellipse cx="30" cy="16" rx="12" ry="7" fill="#C97A3A"/>
    <path d="M-16 12 h 32" stroke="#7EA23C" stroke-width="5" stroke-linecap="round" opacity="0.85"/>
    <circle cx="-6" cy="6" r="4" fill="#C0392B"/><circle cx="8" cy="4" r="4" fill="#C0392B"/>
  </g>`;

/* ========================================================================== */
/*  CARD ARTWORK 1 — WOODLAND FEAST TABLE (Everyone's Family)                 */
/* ========================================================================== */

/** Baked (mockup-only) copy of the editable text for Everyone's Family */
const efText = () => `
  <g font-family="'Cinzel','Playfair Display',serif" text-anchor="middle">
    <text x="300" y="314" font-size="30" font-weight="700" letter-spacing="3.4" fill="${C.deepBrown}">LET'S FEAST!</text>
  </g>
  <g font-family="Merriweather, Georgia, serif" text-anchor="middle" fill="${C.warmBrown}">
    <text x="300" y="358" font-size="16.5">Thursday</text>
    <text x="300" y="382" font-size="16.5">11/24 at 1 PM</text>
    <text x="300" y="424" font-size="15.5">Our place</text>
    <text x="300" y="447" font-size="15.5">56 Willow St.</text>
  </g>`;

const woodlandFeastTable = ({ withText = false } = {}) => `
<defs>
  <filter id="ef-grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" result="n"/>
    <feColorMatrix type="saturate" values="0" in="n" result="ng"/>
    <feComponentTransfer in="ng" result="nc"><feFuncA type="linear" slope="0.055"/></feComponentTransfer>
    <feComposite in="nc" in2="SourceGraphic" operator="over"/>
  </filter>
  <filter id="ef-soft" x="-30%" y="-30%" width="160%" height="160%">
    <feDropShadow dx="0" dy="5" stdDeviation="6" flood-color="#5A3A1E" flood-opacity="0.16"/>
  </filter>
  <clipPath id="ef-card"><rect width="${CARD_W}" height="${CARD_H}" rx="4"/></clipPath>
</defs>

<g clip-path="url(#ef-card)">
  <!-- Layer 0: warm paper base (canvasBackground.color + paper-grain texture) -->
  <rect width="${CARD_W}" height="${CARD_H}" fill="${C.paper}"/>
  <rect width="${CARD_W}" height="${CARD_H}" fill="#E8DCC6" opacity="0.35" filter="url(#ef-grain)"/>
  <rect x="14" y="14" width="${CARD_W - 28}" height="${CARD_H - 28}" fill="none" stroke="rgba(140,109,79,0.35)" stroke-width="2"/>
  <rect x="21" y="21" width="${CARD_W - 42}" height="${CARD_H - 42}" fill="none" stroke="rgba(140,109,79,0.22)" stroke-width="1"/>

  <!-- Corner harvest accents -->
  ${mapleLeaf(52, 66, 24, 1.05, C.pumpkin, C.pumpkinDeep, 1.4)}
  ${mapleLeaf(548, 60, -34, 0.95, C.rust, C.pumpkinDeep, 1.4)}
  ${oakLeaf(84, 118, 64, 0.85, C.amber, "rgba(150,90,30,0.55)")}
  ${oakLeaf(524, 116, -70, 0.85, C.olive, "rgba(70,90,40,0.55)")}
  ${mapleLeaf(46, 792, -18, 0.9, C.crimson, "#8E2B20", 1.3)}
  ${mapleLeaf(556, 796, 26, 0.9, C.pumpkinDeep, "#8E3F16", 1.3)}
  ${berries(120, 792, 0.9, C.crimson)}
  ${berries(486, 788, 0.85, C.rust)}

  <!-- Layer 1: woodland dinner guests seated behind the table -->
  ${critter({ x: 108, y: 214, s: 0.78, fur: "#B98A5E", belly: "#E7D2B4", ear: "round", scarf: C.forest })}
  ${critter({ x: 234, y: 196, s: 0.7, fur: "#F1E6D2", belly: "#FFFDF6", ear: "tall", innerEar: "#EFC9C2" })}
  ${critter({ x: 372, y: 202, s: 0.74, fur: "#6E6558", belly: "#D9D2C4", ear: "triangle", innerEar: "#D9A9A0", muzzle: "rgba(255,255,255,0.85)" })}
  ${critter({ x: 498, y: 216, s: 0.76, fur: "#C9743F", belly: "#F2DDC2", ear: "triangle", innerEar: "#8C4520", muzzle: "#FFF7EC" })}
  ${owl(566, 168, 0.62, 8, C.moss, "#EFE6CE")}

  <!-- Layer 2: feast table -->
  <g filter="url(#ef-soft)">
    <rect x="35" y="234" width="530" height="352" rx="16" fill="#E9DCBE"/>
    <rect x="35" y="234" width="530" height="352" rx="16" fill="none" stroke="rgba(120,90,55,0.35)" stroke-width="2.5"/>
    <rect x="35" y="234" width="530" height="46" rx="16" fill="rgba(255,255,255,0.35)"/>
    <rect x="35" y="540" width="530" height="46" rx="16" fill="rgba(120,90,55,0.1)"/>
    <!-- table runner -->
    <rect x="52" y="250" width="496" height="320" rx="10" fill="#F6EDD9" stroke="rgba(160,120,70,0.35)" stroke-width="2" stroke-dasharray="7 6"/>
    <!-- menu / placard panel: keeps every editable text node legible -->
    <rect x="86" y="264" width="428" height="230" rx="10" fill="#FDF8EC" stroke="rgba(140,109,79,0.45)" stroke-width="2.4"/>
    <rect x="93" y="271" width="414" height="216" rx="6" fill="none" stroke="rgba(140,109,79,0.25)" stroke-width="1.2"/>
  </g>

  <!-- Place settings around the menu panel -->
  ${plate(140, 258, 0.62)}${plate(300, 250, 0.6)}${plate(462, 258, 0.62)}
  ${cutlery(96, 300, -4, 0.72)}${knife(512, 300, 4, 0.72)}
  ${napkin(140, 552, 6, 0.7, "#D9843C")}${napkin(462, 552, -6, 0.7, "#7E8A5B")}
  ${plate(300, 556, 0.64)}
  ${glass(216, 262, 0.62)}${glass(392, 262, 0.62, "rgba(240,169,60,0.8)")}
  ${glass(216, 546, 0.6)}${glass(392, 546, 0.6, "rgba(240,169,60,0.8)")}
  ${cutlery(66, 470, 88, 0.66)}${knife(536, 470, -88, 0.66)}

  <!-- Shared dishes on the table -->
  ${roastTurkey(112, 300, 0.66)}
  ${pieDish(492, 302, 0.62)}
  ${candlestick(300, 226, 0.72)}
  ${pumpkin(64, 402, 62, 50, C.pumpkin, C.pumpkinDeep, "#5E7A3A")}
  ${pumpkin(540, 404, 56, 46, C.amber, "#C98430", "#5E7A3A")}
  ${berries(300, 522, 0.8, C.crimson)}
  ${leaf(258, 524, 40, 0.5, C.moss)}${leaf(342, 524, -40, 0.5, C.olive)}

  <!-- Layer 3 (front): guests seated below the table -->
  ${critter({ x: 132, y: 676, s: 0.82, fur: "#E8E1D0", belly: "#FFFDF6", ear: "floppy", innerEar: "#CBB79A", scarf: C.rust })}
  ${critter({ x: 304, y: 700, s: 0.88, fur: "#9C6B3C", belly: "#EBD7B8", ear: "round", antlers: true })}
  ${critter({ x: 476, y: 680, s: 0.8, fur: "#D8A75B", belly: "#F6E7CB", ear: "round", scarf: C.teal })}
  ${squirrelTail(546, 636, 0.7, 18, "#C9743F")}

  <!-- Floor scatter -->
  ${mapleLeaf(72, 748, -30, 0.8, C.amber, "rgba(150,90,30,0.5)")}
  ${mapleLeaf(540, 744, 34, 0.8, C.olive, "rgba(70,90,40,0.5)")}
  ${oakLeaf(392, 786, 18, 0.7, C.pumpkin, "rgba(150,90,30,0.5)")}
  ${oakLeaf(214, 790, -22, 0.7, C.crimson, "rgba(140,40,30,0.5)")}
  ${tendril(40, 620, -10, 1.1, "rgba(90,120,60,0.7)")}
  ${tendril(566, 616, 190, 1.1, "rgba(90,120,60,0.7)")}

  ${withText ? efText() : ""}
</g>`;

/* ========================================================================== */
/*  CARD ARTWORK 2 — FOLK-ART TURKEY & LEAVES (Give Thanks)                   */
/* ========================================================================== */

/** One fan feather of the folk-art turkey */
const turkeyFeather = (cx, cy, angle, len, color, spot) => `
  <g transform="translate(${cx} ${cy}) rotate(${angle})">
    <path d="M0 0 C -19 ${-len * 0.45} -15 ${-len * 0.85} 0 ${-len} C 15 ${-len * 0.85} 19 ${-len * 0.45} 0 0 Z"
      fill="${color}" stroke="#20313A" stroke-width="3" stroke-linejoin="round"/>
    <ellipse cx="0" cy="${-len * 0.72}" rx="9" ry="13" fill="${spot}" stroke="#20313A" stroke-width="2.4"/>
    <ellipse cx="0" cy="${-len * 0.72}" rx="4" ry="6.5" fill="#20313A"/>
    <path d="M0 -8 L0 ${-len + 8}" stroke="rgba(255,255,255,0.5)" stroke-width="2.4" stroke-linecap="round"/>
  </g>`;

/** Full folk-art turkey */
const folkTurkey = (x, y, s, rot = 0) => {
  const featherColors = [C.crimson, C.amber, C.teal, C.gold, C.blue, C.pumpkin, C.green, "#8E4FA8", C.rust];
  const spotColors = [C.gold, C.crimson, C.amber, C.teal, C.pumpkin, C.green, C.gold, C.crimson, C.teal];
  const fan = featherColors
    .map((col, i) => {
      const angle = -132 + i * 33;
      const len = 150 - Math.abs(i - 4) * 7;
      return turkeyFeather(0, 0, angle, len, col, spotColors[i]);
    })
    .join("");

  return `
  <g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
    <!-- tail fan -->
    ${fan}
    <!-- body -->
    <path d="M-64 66 C -74 20 -46 -14 0 -14 C 46 -14 74 20 64 66 C 56 104 30 122 0 122 C -30 122 -56 104 -64 66 Z"
      fill="#20313A" stroke="#131E24" stroke-width="4"/>
    <!-- patterned wing -->
    <path d="M-52 46 C -34 22 8 22 30 48 C 12 78 -30 80 -52 46 Z" fill="#1D4A50" stroke="#131E24" stroke-width="3.4"/>
    ${[0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => `
      <path d="M${-44 + c * 20} ${34 + r * 16} q 10 -12 20 0" fill="none" stroke="${[C.gold, C.pumpkin, C.teal][r]}" stroke-width="3.2" stroke-linecap="round"/>`).join("")).join("")}
    <!-- breast dots -->
    ${[0, 1, 2].map((i) => `<circle cx="${-16 + i * 16}" cy="${96 - Math.abs(i - 1) * 6}" r="5" fill="${C.gold}"/>`).join("")}
    <!-- legs -->
    <path d="M-24 120 L-30 154 M-30 154 L-44 164 M-30 154 L-18 166 M-30 154 L-32 170" fill="none" stroke="#E8A33D" stroke-width="6" stroke-linecap="round"/>
    <path d="M24 120 L30 154 M30 154 L16 164 M30 154 L42 166 M30 154 L28 170" fill="none" stroke="#E8A33D" stroke-width="6" stroke-linecap="round"/>
    <!-- neck + head -->
    <path d="M14 -4 C 26 -46 30 -74 22 -96" fill="none" stroke="#20313A" stroke-width="26" stroke-linecap="round"/>
    <ellipse cx="20" cy="-108" rx="27" ry="25" fill="#20313A" stroke="#131E24" stroke-width="4"/>
    <path d="M20 -130 C 34 -142 52 -136 54 -120 C 56 -106 44 -98 34 -102" fill="#C0392B" stroke="#8E2B20" stroke-width="3"/>
    <path d="M44 -100 C 56 -92 56 -76 46 -70" fill="none" stroke="#C0392B" stroke-width="9" stroke-linecap="round"/>
    <path d="M45 -110 L74 -102 L45 -94 Z" fill="#E8A33D" stroke="#B5761F" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="10" cy="-112" r="6.5" fill="#FFF6E4"/><circle cx="12" cy="-113" r="3.4" fill="#131E24"/>
    <circle cx="10.6" cy="-114.6" r="1.3" fill="#fff"/>
  </g>`;
};

const gtText = () => `
  <g font-family="'Caveat','Reenie Beanie',cursive" fill="${C.ink}" text-anchor="middle">
    <text x="220" y="126" font-size="66" font-weight="700">Give</text>
    <text x="240" y="184" font-size="66" font-weight="700">Thanks.</text>
  </g>
  <g font-family="Inter, Helvetica, sans-serif" text-anchor="middle">
    <text x="210" y="334" font-size="15" fill="#333333">Please join us for an all-day</text>
    <text x="210" y="355" font-size="15" fill="#333333">Thanksgiving celebration!</text>
    <text x="210" y="392" font-size="14" fill="#444444">Thursday, November 24 at 12 PM</text>
    <text x="210" y="413" font-size="14" fill="#444444">Our place</text>
    <text x="210" y="434" font-size="14" fill="#444444">351 Riverway Blvd.</text>
  </g>`;

const folkArtTurkeyLeaves = ({ withText = false } = {}) => `
<defs>
  <filter id="gt-grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" result="n"/>
    <feColorMatrix type="saturate" values="0" in="n" result="ng"/>
    <feComponentTransfer in="ng" result="nc"><feFuncA type="linear" slope="0.04"/></feComponentTransfer>
    <feComposite in="nc" in2="SourceGraphic" operator="over"/>
  </filter>
  <clipPath id="gt-card"><rect width="${CARD_W}" height="${CARD_H}" rx="4"/></clipPath>
</defs>

<g clip-path="url(#gt-card)">
  <!-- Layer 0: buttery cream paper (canvasBackground.color) -->
  <rect width="${CARD_W}" height="${CARD_H}" fill="${C.cream}"/>
  <rect width="${CARD_W}" height="${CARD_H}" fill="#EFD9A8" opacity="0.3" filter="url(#gt-grain)"/>
  <rect x="15" y="15" width="${CARD_W - 30}" height="${CARD_H - 30}" fill="none" stroke="rgba(32,49,58,0.35)" stroke-width="2.2"/>

  <!-- Scattered autumn leaves — kept clear of every editable text zone -->
  ${mapleLeaf(516, 74, 28, 1.0, C.crimson, "#8E2B20", 1.5)}
  ${mapleLeaf(560, 158, -24, 0.85, C.pumpkin, C.pumpkinDeep, 1.4)}
  ${oakLeaf(452, 130, 62, 0.8, C.amber, "rgba(150,90,30,0.55)")}
  ${leaf(528, 250, 118, 0.9, C.olive, "rgba(70,90,40,0.55)")}
  ${mapleLeaf(66, 264, -44, 0.8, C.rust, "#8E3F16", 1.4)}
  ${oakLeaf(56, 470, 34, 0.8, C.pumpkinDeep, "#8E3F16", 1.3)}
  ${mapleLeaf(540, 356, 44, 0.9, C.amber, "rgba(150,90,30,0.55)")}
  ${leaf(574, 452, 132, 0.85, C.crimson, "rgba(140,40,30,0.55)")}
  ${mapleLeaf(60, 604, -18, 0.85, C.olive, "rgba(70,90,40,0.55)")}
  ${oakLeaf(556, 606, 26, 0.78, C.rust, "#8E3F16", 1.3)}

  <!-- Botanical sprigs -->
  ${sprig(520, 214, 24, 1.0, C.moss, C.olive)}
  ${sprig(546, 508, 40, 0.95, C.moss, C.pumpkin)}
  ${sprig(70, 176, -28, 0.9, C.moss, C.rust)}
  ${tendril(486, 690, -20, 1.3, "rgba(92,112,72,0.75)")}
  ${tendril(96, 700, 160, 1.2, "rgba(92,112,72,0.75)")}

  <!-- Layer 1 (locked artwork): vibrant folk-art turkey -->
  ${folkTurkey(330, 610, 0.94)}

  <!-- Foreground leaves overlapping the turkey's feet -->
  ${mapleLeaf(196, 756, -26, 1.0, C.pumpkin, C.pumpkinDeep, 1.5)}
  ${mapleLeaf(452, 760, 30, 1.0, C.crimson, "#8E2B20", 1.5)}
  ${oakLeaf(300, 790, 8, 0.85, C.amber, "rgba(150,90,30,0.55)")}
  ${leaf(120, 792, 66, 0.9, C.olive, "rgba(70,90,40,0.55)")}
  ${leaf(508, 812, -58, 0.9, C.teal, "rgba(30,90,90,0.55)")}
  ${berries(58, 704, 0.9, C.crimson)}
  ${berries(548, 724, 0.85, C.amber)}

  ${withText ? gtText() : ""}
</g>`;

/* ========================================================================== */
/*  CARD ARTWORK 3 — BOTANICAL PUMPKIN ETCHING (Thanksgiving Branches)        */
/* ========================================================================== */

/** Engraving-style (line-only) botanical branch */
const etchBranch = (x, y, rot, s, stroke) => `
  <g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" fill="none" stroke="${stroke}" stroke-width="2.2" stroke-linecap="round">
    <path d="M0 0 C 6 -40 4 -84 -4 -124 C -10 -156 -8 -186 0 -214"/>
    ${[[-6, -34, -46], [8, -62, 44], [-8, -96, -50], [6, -124, 46], [-6, -156, -46], [4, -184, 42]].map(([bx, by, br]) => `
      <g transform="translate(${bx} ${by}) rotate(${br})">
        <path d="M0 0 C 8 -6 18 -6 26 0 C 18 6 8 6 0 0 Z" stroke-width="2"/>
        <path d="M0 0 L26 0" stroke-width="1.4"/>
        <path d="M6 -3 L6 3 M13 -4 L13 4 M20 -3 L20 3" stroke-width="1.1"/>
      </g>`).join("")}
    ${[[2, -44, 1], [-2, -110, -1], [2, -174, 1]].map(([fx, fy, fd]) => `
      <g transform="translate(${fx} ${fy}) scale(${fd})">
        ${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="0" cy="-15" rx="7" ry="15" stroke-width="2" transform="rotate(${a})"/>`).join("")}
        <circle r="6.5" stroke-width="2"/>
        <circle r="2.4" stroke-width="1.4"/>
      </g>`).join("")}
    ${[[14, -74], [-16, -142], [12, -198]].map(([bx, by]) => `
      <g transform="translate(${bx} ${by})">
        <circle r="7" stroke-width="2"/><circle cx="9" cy="6" r="6" stroke-width="2"/>
        <path d="M0 -7 L0 -13" stroke-width="1.6"/>
      </g>`).join("")}
  </g>`;

/** Engraving-style pumpkin (outline only) */
const etchPumpkin = (x, y, s, stroke) => `
  <g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${stroke}" stroke-width="2.4" stroke-linecap="round">
    <path d="M0 -46 C 4 -60 14 -66 24 -64 C 14 -60 10 -54 10 -44"/>
    <ellipse cx="0" cy="0" rx="76" ry="48"/>
    <path d="M-46 -36 C -56 -12 -56 14 -46 36"/>
    <path d="M46 -36 C 56 -12 56 14 46 36"/>
    <path d="M-24 -44 C -32 -14 -32 16 -24 42"/>
    <path d="M24 -44 C 32 -14 32 16 24 42"/>
    <path d="M0 -48 C -6 -16 -6 18 0 47"/>
    <path d="M-70 34 C -78 44 -84 46 -92 44" stroke-width="2"/>
    <path d="M-92 44 C -84 34 -74 36 -76 46 C -78 54 -90 54 -92 44" stroke-width="2"/>
    <path d="M74 -28 C 86 -36 96 -32 98 -22" stroke-width="2"/>
    <path d="M-30 -30 C -14 -38 6 -38 22 -30" stroke-width="1.4" opacity="0.7"/>
  </g>`;

const tbText = () => `
  <g font-family="'Playfair Display', Georgia, serif" text-anchor="middle" fill="#4A2216">
    <text x="340" y="300" font-size="58" font-weight="700" letter-spacing="2.5">THANKS</text>
    <text x="340" y="362" font-size="58" font-weight="700" letter-spacing="2.5">GIVING</text>
  </g>
  <text x="340" y="437" font-family="'Playfair Display', Georgia, serif" font-style="italic" font-size="20" fill="#633122" text-anchor="middle">Join us for dinner and drinks!</text>
  <g font-family="'Playfair Display', Georgia, serif" text-anchor="middle" fill="#54281B">
    <text x="340" y="484" font-size="17">Thursday, November 23 at Noon</text>
    <text x="340" y="511" font-size="17">Our home</text>
    <text x="340" y="538" font-size="17">1321 Harvest Lane</text>
  </g>`;

const botanicalPumpkinEtching = ({ withText = false } = {}) => `
<defs>
  <filter id="tb-grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" result="n"/>
    <feColorMatrix type="saturate" values="0" in="n" result="ng"/>
    <feComponentTransfer in="ng" result="nc"><feFuncA type="linear" slope="0.05"/></feComponentTransfer>
    <feComposite in="nc" in2="SourceGraphic" operator="over"/>
  </filter>
  <clipPath id="tb-card"><rect width="${CARD_W}" height="${CARD_H}" rx="4"/></clipPath>
</defs>

<g clip-path="url(#tb-card)">
  <!-- Layer 0: dusty rose paper (canvasBackground.color #EED8CB) -->
  <rect width="${CARD_W}" height="${CARD_H}" fill="${C.rose}"/>
  <rect width="${CARD_W}" height="${CARD_H}" fill="#D8B7A6" opacity="0.32" filter="url(#tb-grain)"/>
  <rect x="16" y="16" width="${CARD_W - 32}" height="${CARD_H - 32}" fill="none" stroke="rgba(120,60,45,0.45)" stroke-width="2"/>
  <rect x="23" y="23" width="${CARD_W - 46}" height="${CARD_H - 46}" fill="none" stroke="rgba(120,60,45,0.28)" stroke-width="1"/>

  <!-- Layer 1 (locked artwork): vintage botanical etchings in terracotta -->
  ${etchBranch(74, 800, -8, 1.36, C.terracotta)}
  ${etchBranch(150, 830, 12, 1.0, "rgba(168,85,63,0.85)")}
  ${etchBranch(528, 340, 166, 0.78, "rgba(168,85,63,0.9)")}
  ${etchBranch(556, 118, 200, 0.62, "rgba(168,85,63,0.8)")}

  ${etchPumpkin(150, 652, 1.0, C.terracotta)}
  ${etchPumpkin(344, 726, 1.24, "rgba(168,85,63,0.95)")}
  ${etchPumpkin(510, 664, 0.86, "rgba(168,85,63,0.85)")}

  <!-- Ground line & fine engraving hatch -->
  <path d="M40 792 C 180 776 420 776 560 792" fill="none" stroke="rgba(120,60,45,0.5)" stroke-width="2"/>
  ${[70, 118, 470, 518].map((hx) => `<path d="M${hx} 766 l 16 -12 M${hx + 8} 776 l 16 -12" stroke="rgba(120,60,45,0.4)" stroke-width="1.6" fill="none"/>`).join("")}

  <!-- Corner flourishes kept clear of the centered text block -->
  ${etchBranch(556, 560, 150, 0.5, "rgba(168,85,63,0.7)")}
  <path d="M470 76 q 26 18 58 8" fill="none" stroke="rgba(168,85,63,0.7)" stroke-width="2.2"/>
  <path d="M58 470 q -20 34 -4 74" fill="none" stroke="rgba(168,85,63,0.6)" stroke-width="2.2"/>
  ${[0, 1, 2, 3].map((i) => `<ellipse cx="${488 + i * 4}" cy="${120 + i * 26}" rx="9" ry="16" fill="none" stroke="rgba(168,85,63,0.75)" stroke-width="2" transform="rotate(${34 + i * 6} ${488 + i * 4} ${120 + i * 26})"/>`).join("")}

  ${withText ? tbText() : ""}
</g>`;

/* ========================================================================== */
/*  MOCKUP SCENES (gallery thumbnails, 600 x 800)                             */
/* ========================================================================== */

/** Open envelope angled behind the card (left-angled-behind stage wrapper) */
const mockEnvelope = ({ x, y, w, h, body, flap, liner, rot = -7 }) => `
  <g transform="translate(${x} ${y}) rotate(${rot})" filter="url(#mk-env-shadow)">
    <!-- outer flap (opened, pointing up-left) -->
    <path d="M0 ${h * 0.42} L0 ${-h * 0.34} L${w} ${h * 0.1} L${w} ${h * 0.42} Z" fill="${flap}"/>
    <!-- inner liner pattern revealed by the open flap -->
    <path d="M${w * 0.06} ${h * 0.4} L${w * 0.06} ${-h * 0.24} L${w * 0.94} ${h * 0.14} L${w * 0.94} ${h * 0.4} Z"
      fill="${liner}" opacity="0.98"/>
    <!-- pocket -->
    <path d="M0 ${h * 0.36} L${w} ${h * 0.36} L${w} ${h} L0 ${h} Z" fill="${body}"/>
    <path d="M0 ${h} L0 ${h * 0.36} L${w * 0.5} ${h * 0.68} Z" fill="rgba(0,0,0,0.12)"/>
    <path d="M${w} ${h} L${w} ${h * 0.36} L${w * 0.5} ${h * 0.68} Z" fill="rgba(0,0,0,0.07)"/>
    <path d="M0 ${h * 0.36} L${w} ${h * 0.36}" stroke="rgba(0,0,0,0.22)" stroke-width="2"/>
  </g>`;

/** Places a full-size card artwork (with baked text) inside a mockup transform */
const mockCard = ({ x, y, s, artwork, clipId }) => `
  <g transform="translate(${x} ${y}) scale(${s})" filter="url(#mk-card-shadow)">
    <g clip-path="url(#${clipId})">${artwork}</g>
  </g>`;

const mockDefs = () => `
  <filter id="mk-card-shadow" x="-40%" y="-30%" width="180%" height="170%">
    <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#241a10" flood-opacity="0.34"/>
    <feDropShadow dx="0" dy="3" stdDeviation="5" flood-color="#241a10" flood-opacity="0.2"/>
  </filter>
  <filter id="mk-env-shadow" x="-40%" y="-30%" width="180%" height="170%">
    <feDropShadow dx="-8" dy="20" stdDeviation="18" flood-color="#241a10" flood-opacity="0.35"/>
  </filter>
  <filter id="mk-grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" stitchTiles="stitch" result="n"/>
    <feColorMatrix type="saturate" values="0" in="n" result="ng"/>
    <feComponentTransfer in="ng" result="nc"><feFuncA type="linear" slope="0.06"/></feComponentTransfer>
    <feComposite in="nc" in2="SourceGraphic" operator="over"/>
  </filter>
  <clipPath id="mk-clip-card"><rect x="0" y="0" width="${CARD_W}" height="${CARD_H}" rx="10"/></clipPath>`;

/* --- Mockup 1: Everyone's Family ------------------------------------------ */
const everyonesFamilyMockup = () => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MOCK_W} ${MOCK_H}" width="100%" height="100%">
  <defs>
    ${mockDefs()}
    <linearGradient id="ef-mk-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8E9A78"/>
      <stop offset="55%" stop-color="#77825F"/>
      <stop offset="100%" stop-color="#616C4B"/>
    </linearGradient>
    <pattern id="ef-mk-weave" width="26" height="26" patternUnits="userSpaceOnUse">
      <rect width="26" height="26" fill="none"/>
      <path d="M0 13 H26 M13 0 V26" stroke="rgba(255,255,255,0.05)" stroke-width="2"/>
    </pattern>
  </defs>

  <!-- Sage green tabletop surface -->
  <rect width="${MOCK_W}" height="${MOCK_H}" fill="url(#ef-mk-bg)"/>
  <rect width="${MOCK_W}" height="${MOCK_H}" fill="url(#ef-mk-weave)"/>
  <rect width="${MOCK_W}" height="${MOCK_H}" fill="#5E6A48" opacity="0.35" filter="url(#mk-grain)"/>

  <!-- Autumn props on the table -->
  ${pumpkin(76, 96, 128, 104, "#E9E2CF", "#C9C0A4", "#5E7A3A")}
  ${pumpkin(180, 58, 74, 62, C.pumpkin, C.pumpkinDeep, "#5E7A3A")}
  ${mapleLeaf(506, 90, 32, 1.9, C.amber, "rgba(150,90,30,0.6)", 1.6)}
  ${mapleLeaf(72, 712, -26, 2.1, C.crimson, "#8E2B20", 1.6)}
  ${oakLeaf(540, 700, 40, 1.7, C.pumpkin, "rgba(150,90,30,0.6)")}
  ${mapleLeaf(320, 756, 12, 1.8, C.amber, "rgba(150,90,30,0.6)", 1.6)}
  ${leaf(466, 764, -54, 1.7, C.olive, "rgba(70,90,40,0.6)")}
  ${berries(140, 758, 1.6, C.crimson)}
  ${sprig(560, 372, 28, 1.6, "#4E5C3A", C.sage)}

  <!-- Relative stage wrapper: envelope (z-0) behind card (z-10) -->
  ${mockEnvelope({ x: 44, y: 176, w: 372, h: 316, body: C.kraft, flap: C.kraftDark, liner: THANKSGIVING_LINER_TAN, rot: -8 })}
  ${mockCard({ x: 166, y: 132, s: 0.62, artwork: woodlandFeastTable({ withText: true }), clipId: "mk-clip-card" })}
</svg>`;

/* --- Mockup 2: Give Thanks ------------------------------------------------- */
const giveThanksMockup = () => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MOCK_W} ${MOCK_H}" width="100%" height="100%">
  <defs>
    ${mockDefs()}
    <linearGradient id="gt-mk-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F7F2E7"/>
      <stop offset="60%" stop-color="#EFE7D8"/>
      <stop offset="100%" stop-color="#E5DBC8"/>
    </linearGradient>
  </defs>

  <!-- Warm linen surface -->
  <rect width="${MOCK_W}" height="${MOCK_H}" fill="url(#gt-mk-bg)"/>
  <rect width="${MOCK_W}" height="${MOCK_H}" fill="#E2D6BE" opacity="0.4" filter="url(#mk-grain)"/>

  <!-- Scattered leaves & sprigs on the surface -->
  ${mapleLeaf(54, 74, -34, 1.7, C.crimson, "#8E2B20", 1.6)}
  ${mapleLeaf(536, 132, 28, 1.6, C.pumpkin, C.pumpkinDeep, 1.6)}
  ${oakLeaf(500, 44, 16, 1.4, C.amber, "rgba(150,90,30,0.6)")}
  ${leaf(44, 452, 116, 1.5, C.olive, "rgba(70,90,40,0.6)")}
  ${mapleLeaf(556, 470, 46, 1.5, C.rust, "#8E3F16", 1.6)}
  ${mapleLeaf(74, 742, -22, 1.8, C.amber, "rgba(150,90,30,0.6)", 1.6)}
  ${oakLeaf(506, 748, 34, 1.7, C.crimson, "rgba(140,40,30,0.6)")}
  ${leaf(300, 774, 62, 1.5, C.teal, "rgba(30,90,90,0.6)")}
  ${sprig(570, 300, 34, 1.5, "#7A8A5E", C.olive)}
  ${sprig(30, 606, -40, 1.4, "#7A8A5E", C.rust)}
  ${berries(560, 640, 1.5, C.crimson)}
  ${tendril(90, 172, -18, 2.2, "rgba(92,112,72,0.7)")}
  ${tendril(470, 660, 160, 2.2, "rgba(92,112,72,0.7)")}

  <!-- Relative stage wrapper: forest-green envelope (z-0) behind card (z-10) -->
  ${mockEnvelope({ x: 40, y: 178, w: 374, h: 318, body: C.forest, flap: C.forestDark, liner: THANKSGIVING_LINER_WARM, rot: -8 })}
  ${mockCard({ x: 172, y: 130, s: 0.61, artwork: folkArtTurkeyLeaves({ withText: true }), clipId: "mk-clip-card" })}
</svg>`;

/* --- Mockup 3: Thanksgiving Branches (flat card, envelope disabled) -------- */
const thanksgivingBranchesMockup = () => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MOCK_W} ${MOCK_H}" width="100%" height="100%">
  <defs>
    ${mockDefs()}
    <linearGradient id="tb-mk-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F6F4F1"/>
      <stop offset="60%" stop-color="#EDEAE5"/>
      <stop offset="100%" stop-color="#E2DED7"/>
    </linearGradient>
  </defs>

  <!-- Neutral studio surface (flat card — no envelope stage) -->
  <rect width="${MOCK_W}" height="${MOCK_H}" fill="url(#tb-mk-bg)"/>
  <rect width="${MOCK_W}" height="${MOCK_H}" fill="#DCD6CD" opacity="0.45" filter="url(#mk-grain)"/>
  <ellipse cx="300" cy="700" rx="240" ry="54" fill="rgba(90,70,60,0.12)"/>

  ${mockCard({ x: 150, y: 108, s: 0.64, artwork: botanicalPumpkinEtching({ withText: true }), clipId: "mk-clip-card" })}
</svg>`;

/* ========================================================================== */
/*  LINER PREVIEW PATTERNS USED BY THE MOCKUPS (kept in sync with the         */
/*  registry's THANKSGIVING_LINER_PATTERNS)                                   */
/* ========================================================================== */

/* SVG mockups need an SVG <pattern> rather than CSS gradients */
const linerPatternSvg = (id, colors, size) => `
  <pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse">
    <rect width="${size}" height="${size}" fill="${colors.base}"/>
    <rect width="${size}" height="${size * 0.34}" fill="${colors.a}" opacity="0.55"/>
    <rect width="${size * 0.34}" height="${size}" fill="${colors.a}" opacity="0.55"/>
    <rect width="${size}" height="${size * 0.14}" y="${size * 0.5}" fill="${colors.b}" opacity="0.5"/>
    <rect width="${size * 0.14}" height="${size}" x="${size * 0.5}" fill="${colors.b}" opacity="0.5"/>
  </pattern>`;

const THANKSGIVING_LINER_TAN = "url(#lin-tan)";
const THANKSGIVING_LINER_WARM = "url(#lin-warm)";

/* Insert the liner patterns into every mockup's <defs> */
const withLinerDefs = (svg) =>
  svg.replace(
    "</defs>",
    `${linerPatternSvg("lin-tan", { base: "#E5D0AE", a: "#1D3B2E", b: "#8C6D4F" }, 30)}
     ${linerPatternSvg("lin-warm", { base: "#F5E4C6", a: "#C65C30", b: "#E8B25A" }, 27)}
    </defs>`
  );

/* ========================================================================== */
/*  WRITE FILES                                                               */
/* ========================================================================== */

const cardArt = {
  "woodland-feast-table.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CARD_W} ${CARD_H}" width="100%" height="100%">${woodlandFeastTable()}</svg>`,
  "folk-art-turkey-leaves.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CARD_W} ${CARD_H}" width="100%" height="100%">${folkArtTurkeyLeaves()}</svg>`,
  "botanical-pumpkin-etching.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CARD_W} ${CARD_H}" width="100%" height="100%">${botanicalPumpkinEtching()}</svg>`,
};

/* Gallery thumbnails — names mirror `<templateId>-mockup.svg` from the registry */
const mockups = {
  "template-everyones-family-mockup.svg": withLinerDefs(everyonesFamilyMockup()),
  "template-give-thanks-mockup.svg": withLinerDefs(giveThanksMockup()),
  "template-thanksgiving-branches-mockup.svg": withLinerDefs(thanksgivingBranchesMockup()),
};

const write = (dir, name, content) => {
  fs.mkdirSync(dir, { recursive: true });
  const target = path.join(dir, name);
  fs.writeFileSync(target, content.trimStart(), "utf8");
  console.log(`✔ ${path.relative(path.join(__dirname, ".."), target)} (${content.length} bytes)`);
};

Object.entries(cardArt).forEach(([name, content]) => {
  write(CARD_DIR, name, content);
  write(BACKEND_CARD_DIR, name, content);
});

Object.entries(mockups).forEach(([name, content]) => {
  write(MOCKUP_DIR, name, content);
  write(BACKEND_MOCKUP_DIR, name, content);
});

console.log("\nThanksgiving / Autumn template assets generated.");
