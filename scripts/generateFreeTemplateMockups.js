const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public', 'assets', 'templates');
const invitehubDir = path.join(__dirname, '..', 'invitehub', 'public', 'assets', 'templates');

// Helper to save to all target asset dirs
function saveMockup(filename, content) {
  [publicDir, invitehubDir].forEach((dir) => {
    if (fs.existsSync(dir)) {
      fs.writeFileSync(path.join(dir, filename), content, 'utf8');
      console.log(`Saved ${filename} to ${dir}`);
    }
  });
}

// -----------------------------------------------------------------------------
// 1. ABSTRACT NATURE PARTY MOCKUP SVG
// -----------------------------------------------------------------------------
const abstractNaturePartyMockup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 700" width="100%" height="100%">
  <defs>
    <style>
      .bg-fill { fill: #FAF3E8; }
      .leaf-dark { fill: #3F5E3D; }
      .leaf-mid { fill: #527A50; }
      .leaf-light { fill: #6B9468; }
      .flower-deep { fill: #8E2B45; }
      .flower-rose { fill: #C4607B; }
      .flower-soft { fill: #E89EAE; }
      .stem-stroke { stroke: #3F5E3D; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; fill: none; }
      .inner-border { stroke: #DCCBB5; stroke-width: 1; stroke-dasharray: 4 4; fill: none; }
    </style>
    <g id="leaf-cluster-v">
      <path d="M 0,0 C -10,-8 -12,-20 0,-28 C 12,-20 10,-8 0,0 Z" class="leaf-dark" />
      <path d="M -2,-12 C -16,-10 -22,-18 -18,-26 C -10,-24 -4,-18 -2,-12 Z" class="leaf-mid" />
      <path d="M 2,-12 C 16,-10 22,-18 18,-26 C 10,-24 4,-18 2,-12 Z" class="leaf-mid" />
    </g>
    <g id="corner-accent">
      <circle cx="0" cy="0" r="14" class="flower-deep" />
      <circle cx="0" cy="0" r="8" class="flower-rose" />
      <circle cx="0" cy="0" r="4" class="flower-soft" />
      <path d="M -12,-12 C -18,-22 -6,-24 0,-14 C 6,-24 18,-22 12,-12 C 22,-6 24,6 14,0 C 24,6 22,18 12,12 C 6,24 -6,22 0,14 C -6,22 -18,24 -12,12 C -22,6 -24,-6 -14,0 C -24,-6 -22,-18 -12,-12 Z" class="flower-rose" opacity="0.8" />
    </g>
    <g id="fan-palmette">
      <path d="M 0,18 C -35,16 -60,-10 -70,-28 C -45,-15 -25,-4 0,-2 C 25,-4 45,-15 70,-28 C 60,-10 35,16 0,18 Z" class="flower-soft" opacity="0.6"/>
      <path d="M 0,14 C -28,12 -48,-8 -56,-22 C -36,-12 -20,-3 0,-1 C 20,-3 36,-12 56,-22 C 48,-8 28,12 0,14 Z" class="flower-rose" opacity="0.85"/>
      <path d="M 0,10 C -20,8 -36,-6 -42,-16 C -27,-8 -15,-2 0,0 C 15,-2 27,-8 42,-16 C 36,-6 20,8 0,10 Z" class="flower-deep"/>
      <path d="M 0,8 L -55,-20" stroke="#8E2B45" stroke-width="2" stroke-linecap="round"/>
      <path d="M 0,8 L -38,-24" stroke="#8E2B45" stroke-width="2" stroke-linecap="round"/>
      <path d="M 0,8 L -20,-26" stroke="#8E2B45" stroke-width="2" stroke-linecap="round"/>
      <path d="M 0,8 L 0,-28" stroke="#8E2B45" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M 0,8 L 20,-26" stroke="#8E2B45" stroke-width="2" stroke-linecap="round"/>
      <path d="M 0,8 L 38,-24" stroke="#8E2B45" stroke-width="2" stroke-linecap="round"/>
      <path d="M 0,8 L 55,-20" stroke="#8E2B45" stroke-width="2" stroke-linecap="round"/>
      <path d="M -16,10 C -16,0 16,0 16,10 Z" class="flower-deep"/>
      <circle cx="0" cy="5" r="4" fill="#FAF3E8"/>
    </g>
    <g id="side-bud">
      <path d="M 0,-12 C -8,-6 -6,8 0,12 C 6,8 8,-6 0,-12 Z" class="flower-deep"/>
      <path d="M -3,-6 C -10,-2 -8,6 -2,8" stroke="#E89EAE" stroke-width="1.5" fill="none"/>
      <circle cx="0" cy="0" r="3" class="flower-soft"/>
    </g>
  </defs>

  <rect width="500" height="700" class="bg-fill" rx="4"/>
  <rect x="12" y="12" width="476" height="676" rx="2" class="inner-border" />

  <line x1="38" y1="60" x2="38" y2="640" class="stem-stroke" />
  <line x1="462" y1="60" x2="462" y2="640" class="stem-stroke" />
  <line x1="60" y1="38" x2="440" y2="38" class="stem-stroke" />
  <line x1="60" y1="662" x2="440" y2="662" class="stem-stroke" />

  <g transform="translate(100, 38) rotate(90)"><use href="#leaf-cluster-v" transform="scale(0.75)"/></g>
  <g transform="translate(150, 38) rotate(90)"><use href="#leaf-cluster-v" transform="scale(0.75)"/></g>
  <g transform="translate(200, 38) rotate(90)"><use href="#leaf-cluster-v" transform="scale(0.75)"/></g>
  <g transform="translate(300, 38) rotate(-90)"><use href="#leaf-cluster-v" transform="scale(0.75)"/></g>
  <g transform="translate(350, 38) rotate(-90)"><use href="#leaf-cluster-v" transform="scale(0.75)"/></g>
  <g transform="translate(400, 38) rotate(-90)"><use href="#leaf-cluster-v" transform="scale(0.75)"/></g>

  <g transform="translate(100, 662) rotate(90)"><use href="#leaf-cluster-v" transform="scale(0.75)"/></g>
  <g transform="translate(150, 662) rotate(90)"><use href="#leaf-cluster-v" transform="scale(0.75)"/></g>
  <g transform="translate(200, 662) rotate(90)"><use href="#leaf-cluster-v" transform="scale(0.75)"/></g>
  <g transform="translate(300, 662) rotate(-90)"><use href="#leaf-cluster-v" transform="scale(0.75)"/></g>
  <g transform="translate(350, 662) rotate(-90)"><use href="#leaf-cluster-v" transform="scale(0.75)"/></g>
  <g transform="translate(400, 662) rotate(-90)"><use href="#leaf-cluster-v" transform="scale(0.75)"/></g>

  <g transform="translate(38, 100)"><use href="#leaf-cluster-v" transform="scale(0.7)"/></g>
  <g transform="translate(38, 150)"><use href="#leaf-cluster-v" transform="scale(0.7)"/></g>
  <g transform="translate(38, 200)"><use href="#leaf-cluster-v" transform="scale(0.7)"/></g>
  <g transform="translate(38, 260)"><use href="#leaf-cluster-v" transform="scale(0.7)"/></g>
  <g transform="translate(38, 320)"><use href="#leaf-cluster-v" transform="scale(0.7)"/></g>
  <g transform="translate(38, 380)"><use href="#leaf-cluster-v" transform="scale(0.7)"/></g>
  <g transform="translate(38, 440)"><use href="#leaf-cluster-v" transform="scale(0.7)"/></g>
  <g transform="translate(38, 500)"><use href="#leaf-cluster-v" transform="scale(0.7)"/></g>
  <g transform="translate(38, 550)"><use href="#leaf-cluster-v" transform="scale(0.7)"/></g>
  <g transform="translate(38, 600)"><use href="#leaf-cluster-v" transform="scale(0.7)"/></g>

  <g transform="translate(462, 100)"><use href="#leaf-cluster-v" transform="scale(0.7)"/></g>
  <g transform="translate(462, 150)"><use href="#leaf-cluster-v" transform="scale(0.7)"/></g>
  <g transform="translate(462, 200)"><use href="#leaf-cluster-v" transform="scale(0.7)"/></g>
  <g transform="translate(462, 260)"><use href="#leaf-cluster-v" transform="scale(0.7)"/></g>
  <g transform="translate(462, 320)"><use href="#leaf-cluster-v" transform="scale(0.7)"/></g>
  <g transform="translate(462, 380)"><use href="#leaf-cluster-v" transform="scale(0.7)"/></g>
  <g transform="translate(462, 440)"><use href="#leaf-cluster-v" transform="scale(0.7)"/></g>
  <g transform="translate(462, 500)"><use href="#leaf-cluster-v" transform="scale(0.7)"/></g>
  <g transform="translate(462, 550)"><use href="#leaf-cluster-v" transform="scale(0.7)"/></g>
  <g transform="translate(462, 600)"><use href="#leaf-cluster-v" transform="scale(0.7)"/></g>

  <g transform="translate(40, 40)"><use href="#corner-accent" /></g>
  <g transform="translate(460, 40)"><use href="#corner-accent" /></g>
  <g transform="translate(40, 660)"><use href="#corner-accent" /></g>
  <g transform="translate(460, 660)"><use href="#corner-accent" /></g>

  <g transform="translate(38, 230)"><use href="#side-bud" /></g>
  <g transform="translate(38, 470)"><use href="#side-bud" /></g>
  <g transform="translate(462, 230)"><use href="#side-bud" /></g>
  <g transform="translate(462, 470)"><use href="#side-bud" /></g>

  <g transform="translate(250, 42) rotate(180)">
    <use href="#fan-palmette" transform="scale(0.85)" />
  </g>

  <g transform="translate(250, 658)">
    <use href="#fan-palmette" transform="scale(0.85)" />
  </g>

  <!-- Typography Overlay -->
  <g text-anchor="middle">
    <!-- Intro -->
    <text x="250" y="210" font-family="'Playfair Display', Georgia, serif" font-size="14.5" fill="#4A433A" font-weight="400" letter-spacing="0.5">Please join us to celebrate</text>
    <text x="250" y="232" font-family="'Playfair Display', Georgia, serif" font-size="14.5" fill="#4A433A" font-weight="400" letter-spacing="0.5">the marriage ceremony of</text>

    <!-- Couple Names / Title -->
    <text x="250" y="300" font-family="'Playfair Display', Georgia, serif" font-size="28" font-weight="600" fill="#992847" letter-spacing="0.5">Brittany Moore</text>
    <text x="250" y="332" font-family="'Playfair Display', Georgia, serif" font-size="22" font-weight="400" fill="#992847" font-style="italic">&amp;</text>
    <text x="250" y="366" font-family="'Playfair Display', Georgia, serif" font-size="28" font-weight="600" fill="#992847" letter-spacing="0.5">Daniel Rodriguez</text>

    <!-- Date & Time -->
    <text x="250" y="440" font-family="'Playfair Display', Georgia, serif" font-size="15" font-weight="500" fill="#4A433A" letter-spacing="0.8">Saturday, June 30 at 1 PM</text>

    <!-- Venue -->
    <text x="250" y="500" font-family="'Playfair Display', Georgia, serif" font-size="14" font-weight="500" fill="#5C5348" letter-spacing="0.5">The Rose Garden</text>
    <text x="250" y="522" font-family="'Playfair Display', Georgia, serif" font-size="13" font-weight="400" fill="#6B6256" letter-spacing="0.5">45 Mountain View Rd. Denver, CO</text>
  </g>
</svg>`;

// -----------------------------------------------------------------------------
// 2. BRIGHT BLOOMS GARDEN MOCKUP SVG
// -----------------------------------------------------------------------------
const brightBloomsGardenMockup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 700" width="100%" height="100%">
  <defs>
    <linearGradient id="coral-petal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF9D7A"/>
      <stop offset="60%" stop-color="#FA835B"/>
      <stop offset="100%" stop-color="#E8623A"/>
    </linearGradient>
    <linearGradient id="purple-bell" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#845EC2"/>
      <stop offset="50%" stop-color="#6037A0"/>
      <stop offset="100%" stop-color="#4B207E"/>
    </linearGradient>
    <linearGradient id="pink-foxglove" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFA8BA"/>
      <stop offset="60%" stop-color="#F27694"/>
      <stop offset="100%" stop-color="#D4496E"/>
    </linearGradient>
    <linearGradient id="stem-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#7CA368"/>
      <stop offset="100%" stop-color="#4C7039"/>
    </linearGradient>
    <radialGradient id="cone-center" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#633918"/>
      <stop offset="60%" stop-color="#9E5B28"/>
      <stop offset="100%" stop-color="#E88A3A"/>
    </radialGradient>

    <g id="cone-flower">
      <path d="M 0,0 C -6,20 -15,45 -18,65 C -13,68 -7,66 -4,50 Z" fill="url(#coral-petal)" opacity="0.95"/>
      <path d="M 0,0 C -12,18 -28,40 -35,58 C -30,62 -24,60 -18,46 Z" fill="url(#coral-petal)" opacity="0.9"/>
      <path d="M 0,0 C -18,12 -42,28 -52,42 C -48,47 -41,46 -32,34 Z" fill="url(#coral-petal)" opacity="0.85"/>
      <path d="M 0,0 C 6,20 15,45 18,65 C 13,68 7,66 4,50 Z" fill="url(#coral-petal)" opacity="0.95"/>
      <path d="M 0,0 C 12,18 28,40 35,58 C 30,62 24,60 18,46 Z" fill="url(#coral-petal)" opacity="0.9"/>
      <path d="M 0,0 C 18,12 42,28 52,42 C 48,47 41,46 32,34 Z" fill="url(#coral-petal)" opacity="0.85"/>
      <path d="M 0,0 C 0,22 2,48 0,70 C -3,70 -6,68 -4,50 Z" fill="url(#coral-petal)"/>
      <ellipse cx="0" cy="-2" rx="20" ry="16" fill="url(#cone-center)"/>
      <ellipse cx="0" cy="-6" rx="14" ry="10" fill="#4A2508"/>
      <circle cx="-6" cy="-4" r="2" fill="#E88A3A"/>
      <circle cx="2" cy="-7" r="2" fill="#E88A3A"/>
      <circle cx="7" cy="-3" r="2" fill="#E88A3A"/>
      <circle cx="-2" cy="-9" r="1.5" fill="#FFA552"/>
    </g>

    <g id="bellflower">
      <path d="M 0,0 C -12,-8 -18,-24 -12,-32 C -2,-28 2,-28 12,-32 C 18,-24 12,-8 0,0 Z" fill="url(#purple-bell)"/>
      <path d="M -8,-30 C -12,-36 -4,-38 0,-34 C 4,-38 12,-36 8,-30 Z" fill="#9D71E8"/>
      <circle cx="0" cy="-16" r="2" fill="#E5D4FF"/>
    </g>

    <g id="foxglove-floret">
      <path d="M 0,0 C -10,-4 -14,-16 -12,-24 C -4,-22 4,-22 12,-24 C 14,-16 10,-4 0,0 Z" fill="url(#pink-foxglove)"/>
      <circle cx="-2" cy="-12" r="1.2" fill="#75152F"/>
      <circle cx="2" cy="-10" r="1" fill="#75152F"/>
      <circle cx="0" cy="-15" r="1" fill="#75152F"/>
      <circle cx="-3" cy="-7" r="1.2" fill="#75152F"/>
    </g>

    <g id="leaf-delicate">
      <path d="M 0,0 C -14,-15 -18,-40 0,-60 C 18,-40 14,-15 0,0 Z" fill="url(#stem-grad)" opacity="0.85"/>
      <line x1="0" y1="0" x2="0" y2="-55" stroke="#3A582A" stroke-width="1.2" stroke-linecap="round"/>
    </g>
  </defs>

  <rect width="500" height="700" fill="#FFFFFF" rx="4"/>

  <g id="stems-and-leaves">
    <path d="M 460,700 C 455,550 435,420 405,250" stroke="url(#stem-grad)" stroke-width="4.5" fill="none" stroke-linecap="round"/>
    <path d="M 430,700 C 425,560 410,440 370,300" stroke="url(#stem-grad)" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M 475,700 C 470,580 460,490 445,360" stroke="url(#stem-grad)" stroke-width="3" fill="none" stroke-linecap="round"/>

    <path d="M 330,700 C 335,620 345,560 355,480" stroke="url(#stem-grad)" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M 260,700 C 265,630 270,580 275,520" stroke="url(#stem-grad)" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M 190,700 C 195,640 190,600 185,550" stroke="url(#stem-grad)" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M 120,700 C 122,650 125,620 120,570" stroke="url(#stem-grad)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M 60,700 C 65,660 70,630 65,590" stroke="url(#stem-grad)" stroke-width="2.5" fill="none" stroke-linecap="round"/>

    <g transform="translate(425, 410) rotate(-35)"><use href="#leaf-delicate" transform="scale(0.7)"/></g>
    <g transform="translate(440, 480) rotate(40)"><use href="#leaf-delicate" transform="scale(0.8)"/></g>
    <g transform="translate(415, 340) rotate(-30)"><use href="#leaf-delicate" transform="scale(0.6)"/></g>
    <g transform="translate(390, 450) rotate(-45)"><use href="#leaf-delicate" transform="scale(0.75)"/></g>
    <g transform="translate(450, 560) rotate(35)"><use href="#leaf-delicate" transform="scale(0.85)"/></g>

    <g transform="translate(310, 620) rotate(-25)"><use href="#leaf-delicate" transform="scale(0.7)"/></g>
    <g transform="translate(240, 630) rotate(20)"><use href="#leaf-delicate" transform="scale(0.75)"/></g>
    <g transform="translate(160, 640) rotate(-35)"><use href="#leaf-delicate" transform="scale(0.7)"/></g>
    <g transform="translate(90, 650) rotate(25)"><use href="#leaf-delicate" transform="scale(0.65)"/></g>
    <g transform="translate(40, 660) rotate(-20)"><use href="#leaf-delicate" transform="scale(0.6)"/></g>
  </g>

  <g transform="translate(405, 250) rotate(-15)">
    <use href="#cone-flower" transform="scale(0.95)" />
  </g>

  <g transform="translate(370, 360) rotate(-28)">
    <use href="#cone-flower" transform="scale(0.85)" />
  </g>

  <g transform="translate(448, 365) rotate(18)">
    <use href="#cone-flower" transform="scale(0.75)" />
  </g>

  <g transform="translate(415, 470) rotate(-10)"><use href="#bellflower" transform="scale(0.9)"/></g>
  <g transform="translate(425, 515) rotate(15)"><use href="#bellflower" transform="scale(0.95)"/></g>
  <g transform="translate(395, 530) rotate(-25)"><use href="#bellflower" transform="scale(0.85)"/></g>
  <g transform="translate(410, 580) rotate(5)"><use href="#bellflower" transform="scale(1)"/></g>
  <g transform="translate(435, 620) rotate(20)"><use href="#bellflower" transform="scale(0.9)"/></g>

  <g transform="translate(355, 480) rotate(8)"><use href="#foxglove-floret" transform="scale(0.95)"/></g>
  <g transform="translate(362, 510) rotate(-12)"><use href="#foxglove-floret" transform="scale(1)"/></g>
  <g transform="translate(350, 540) rotate(10)"><use href="#foxglove-floret" transform="scale(1.05)"/></g>
  <g transform="translate(358, 575) rotate(-8)"><use href="#foxglove-floret" transform="scale(1.1)"/></g>
  <g transform="translate(345, 610) rotate(12)"><use href="#foxglove-floret" transform="scale(1.15)"/></g>
  <g transform="translate(352, 650) rotate(-10)"><use href="#foxglove-floret" transform="scale(1.2)"/></g>

  <g transform="translate(295, 545) rotate(12)">
    <use href="#cone-flower" transform="scale(0.8)" />
  </g>

  <g transform="translate(245, 570) rotate(-15)"><use href="#bellflower" transform="scale(0.85)"/></g>
  <g transform="translate(270, 620) rotate(18)"><use href="#bellflower" transform="scale(0.95)"/></g>
  <g transform="translate(210, 605) rotate(10)"><use href="#bellflower" transform="scale(0.85)"/></g>
  <g transform="translate(225, 655) rotate(-12)"><use href="#bellflower" transform="scale(0.9)"/></g>

  <g transform="translate(180, 560) rotate(-6)"><use href="#foxglove-floret" transform="scale(0.9)"/></g>
  <g transform="translate(186, 595) rotate(10)"><use href="#foxglove-floret" transform="scale(0.95)"/></g>
  <g transform="translate(175, 630) rotate(-10)"><use href="#foxglove-floret" transform="scale(1)"/></g>
  <g transform="translate(182, 665) rotate(6)"><use href="#foxglove-floret" transform="scale(1.05)"/></g>

  <g transform="translate(125, 590) rotate(15)"><use href="#bellflower" transform="scale(0.75)"/></g>
  <g transform="translate(135, 640) rotate(-12)"><use href="#bellflower" transform="scale(0.8)"/></g>
  <g transform="translate(70, 610) rotate(-18)"><use href="#foxglove-floret" transform="scale(0.8)"/></g>
  <g transform="translate(80, 650) rotate(12)"><use href="#foxglove-floret" transform="scale(0.85)"/></g>
  <g transform="translate(35, 640) rotate(-10)"><use href="#bellflower" transform="scale(0.7)"/></g>

  <!-- Typography Overlay -->
  <g text-anchor="start">
    <!-- Intro -->
    <text x="75" y="165" font-family="'Inter', sans-serif" font-size="11" font-weight="600" fill="#6B7280" letter-spacing="2">PLEASE JOIN US TO CELEBRATE</text>
    <text x="75" y="185" font-family="'Inter', sans-serif" font-size="11" font-weight="600" fill="#6B7280" letter-spacing="2">THE WEDDING OF</text>

    <!-- Title / Names -->
    <text x="75" y="255" font-family="'Playfair Display', Georgia, serif" font-size="30" font-weight="600" fill="#262626" letter-spacing="0.5">Peyton Barnes</text>
    <text x="75" y="290" font-family="'Playfair Display', Georgia, serif" font-size="22" font-weight="400" fill="#E8623A" font-style="italic">&amp;</text>
    <text x="75" y="328" font-family="'Playfair Display', Georgia, serif" font-size="30" font-weight="600" fill="#262626" letter-spacing="0.5">Anthony Woods</text>

    <!-- Date & Time -->
    <text x="75" y="395" font-family="'Inter', sans-serif" font-size="11.5" font-weight="600" fill="#404040" letter-spacing="1.5">SATURDAY, JUNE 4, 2026 AT 4 PM</text>

    <!-- Venue -->
    <text x="75" y="440" font-family="'Inter', sans-serif" font-size="11.5" font-weight="600" fill="#525252" letter-spacing="1.2">WILDWOOD ESTATE</text>
    <text x="75" y="460" font-family="'Inter', sans-serif" font-size="10.5" font-weight="400" fill="#737373" letter-spacing="1">45 MOUNTAIN VIEW RD.</text>
    <text x="75" y="478" font-family="'Inter', sans-serif" font-size="10.5" font-weight="400" fill="#737373" letter-spacing="1">DENVER, CO</text>
  </g>
</svg>`;

// -----------------------------------------------------------------------------
// 3. VIBRANT BLOOMS WEDDING MOCKUP SVG
// -----------------------------------------------------------------------------
const vibrantBloomsWeddingMockup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 700" width="100%" height="100%">
  <defs>
    <radialGradient id="poppy-grad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FF4D4D"/>
      <stop offset="60%" stop-color="#D91B24"/>
      <stop offset="100%" stop-color="#8A0810"/>
    </radialGradient>
    <radialGradient id="blue-flower-grad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#4D96FF"/>
      <stop offset="60%" stop-color="#1A56B0"/>
      <stop offset="100%" stop-color="#0E2C60"/>
    </radialGradient>
    <radialGradient id="sunflower-grad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFD152"/>
      <stop offset="70%" stop-color="#E59400"/>
      <stop offset="100%" stop-color="#A85800"/>
    </radialGradient>
    <radialGradient id="cream-flower-grad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="70%" stop-color="#FFF5DF"/>
      <stop offset="100%" stop-color="#D9C7A1"/>
    </radialGradient>
    <linearGradient id="leaf-dark" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3A6335"/>
      <stop offset="100%" stop-color="#1B3818"/>
    </linearGradient>

    <g id="red-poppy">
      <ellipse cx="-16" cy="-10" rx="22" ry="18" fill="url(#poppy-grad)" opacity="0.95"/>
      <ellipse cx="16" cy="-10" rx="22" ry="18" fill="url(#poppy-grad)" opacity="0.95"/>
      <ellipse cx="-12" cy="14" rx="22" ry="16" fill="url(#poppy-grad)" opacity="0.95"/>
      <ellipse cx="12" cy="14" rx="22" ry="16" fill="url(#poppy-grad)" opacity="0.95"/>
      <ellipse cx="0" cy="-16" rx="20" ry="18" fill="url(#poppy-grad)"/>
      <ellipse cx="0" cy="16" rx="24" ry="18" fill="url(#poppy-grad)"/>
      <circle cx="0" cy="0" r="11" fill="#1C1412"/>
      <circle cx="0" cy="0" r="6" fill="#403028"/>
      <circle cx="-3" cy="-3" r="1.5" fill="#FFD152"/>
      <circle cx="3" cy="-3" r="1.5" fill="#FFD152"/>
      <circle cx="0" cy="3" r="1.5" fill="#FFD152"/>
    </g>

    <g id="blue-anemone">
      <circle cx="-14" cy="-8" r="16" fill="url(#blue-flower-grad)"/>
      <circle cx="14" cy="-8" r="16" fill="url(#blue-flower-grad)"/>
      <circle cx="-10" cy="12" r="16" fill="url(#blue-flower-grad)"/>
      <circle cx="10" cy="12" r="16" fill="url(#blue-flower-grad)"/>
      <circle cx="0" cy="-14" r="16" fill="url(#blue-flower-grad)"/>
      <circle cx="0" cy="0" r="10" fill="#0D182E"/>
      <circle cx="0" cy="0" r="6" fill="#1C2E52"/>
      <circle cx="-2" cy="-2" r="1" fill="#FFFFFF"/>
      <circle cx="2" cy="2" r="1" fill="#FFFFFF"/>
    </g>

    <g id="cream-hellebore">
      <ellipse cx="0" cy="-20" rx="14" ry="18" fill="url(#cream-flower-grad)"/>
      <ellipse cx="18" cy="-8" rx="14" ry="18" fill="url(#cream-flower-grad)"/>
      <ellipse cx="12" cy="16" rx="14" ry="18" fill="url(#cream-flower-grad)"/>
      <ellipse cx="-12" cy="16" rx="14" ry="18" fill="url(#cream-flower-grad)"/>
      <ellipse cx="-18" cy="-8" rx="14" ry="18" fill="url(#cream-flower-grad)"/>
      <circle cx="0" cy="0" r="7" fill="#6E7B42"/>
      <circle cx="0" cy="0" r="4" fill="#C49B2F"/>
      <circle cx="-4" cy="-5" r="1.2" fill="#FFE58F"/>
      <circle cx="4" cy="-5" r="1.2" fill="#FFE58F"/>
      <circle cx="6" cy="2" r="1.2" fill="#FFE58F"/>
      <circle cx="-6" cy="2" r="1.2" fill="#FFE58F"/>
      <circle cx="0" cy="6" r="1.2" fill="#FFE58F"/>
    </g>

    <g id="golden-daisy">
      <ellipse cx="0" cy="-18" rx="7" ry="16" fill="url(#sunflower-grad)"/>
      <ellipse cx="13" cy="-13" rx="7" ry="16" transform="rotate(45 13 -13)" fill="url(#sunflower-grad)"/>
      <ellipse cx="18" cy="0" rx="7" ry="16" transform="rotate(90 18 0)" fill="url(#sunflower-grad)"/>
      <ellipse cx="13" cy="13" rx="7" ry="16" transform="rotate(135 13 13)" fill="url(#sunflower-grad)"/>
      <ellipse cx="0" cy="18" rx="7" ry="16" fill="url(#sunflower-grad)"/>
      <ellipse cx="-13" cy="13" rx="7" ry="16" transform="rotate(225 -13 13)" fill="url(#sunflower-grad)"/>
      <ellipse cx="-18" cy="0" rx="7" ry="16" transform="rotate(270 -18 0)" fill="url(#sunflower-grad)"/>
      <ellipse cx="-13" cy="-13" rx="7" ry="16" transform="rotate(315 -13 -13)" fill="url(#sunflower-grad)"/>
      <circle cx="0" cy="0" r="12" fill="#42240C"/>
      <circle cx="0" cy="0" r="8" fill="#69370F"/>
    </g>

    <g id="botanical-branch">
      <path d="M 0,0 Q 20,-30 15,-70" stroke="#25421F" stroke-width="2.5" fill="none"/>
      <path d="M 0,0 C 15,-10 25,-25 15,-40 C 5,-25 5,-10 0,0 Z" fill="url(#leaf-dark)"/>
      <path d="M 8,-20 C 25,-25 35,-40 28,-55 C 18,-42 12,-28 8,-20 Z" fill="url(#leaf-dark)"/>
      <path d="M 12,-45 C 30,-50 35,-68 25,-80 C 18,-68 14,-55 12,-45 Z" fill="url(#leaf-dark)"/>
      <path d="M 2,-30 C -12,-35 -20,-50 -15,-65 C -6,-52 0,-38 2,-30 Z" fill="url(#leaf-dark)"/>
    </g>
  </defs>

  <rect width="500" height="700" fill="#E67E17" rx="4"/>

  <g transform="translate(60, 50) rotate(-40)"><use href="#botanical-branch" transform="scale(0.9)"/></g>
  <g transform="translate(440, 50) rotate(40)"><use href="#botanical-branch" transform="scale(0.9)"/></g>
  <g transform="translate(450, 650) rotate(140)"><use href="#botanical-branch" transform="scale(0.9)"/></g>
  <g transform="translate(50, 650) rotate(-140)"><use href="#botanical-branch" transform="scale(0.9)"/></g>

  <rect x="58" y="70" width="384" height="560" rx="8" fill="#FAF5EC" stroke="#E3C9A6" stroke-width="1.5" />
  <rect x="66" y="78" width="368" height="544" rx="5" fill="none" stroke="#D1B28A" stroke-width="0.8" stroke-dasharray="3 3"/>

  <g transform="translate(85, 95)"><use href="#red-poppy" transform="scale(0.85)"/></g>
  <g transform="translate(135, 75)"><use href="#golden-daisy" transform="scale(0.75)"/></g>
  <g transform="translate(62, 140)"><use href="#blue-anemone" transform="scale(0.7)"/></g>

  <g transform="translate(415, 95)"><use href="#blue-anemone" transform="scale(0.95)"/></g>
  <g transform="translate(365, 75)"><use href="#golden-daisy" transform="scale(0.8)"/></g>
  <g transform="translate(438, 145)"><use href="#red-poppy" transform="scale(0.75)"/></g>

  <g transform="translate(58, 260)"><use href="#golden-daisy" transform="scale(0.7)"/></g>
  <g transform="translate(55, 420)"><use href="#blue-anemone" transform="scale(0.75)"/></g>
  <g transform="translate(60, 500)"><use href="#red-poppy" transform="scale(0.7)"/></g>

  <g transform="translate(442, 280)"><use href="#red-poppy" transform="scale(0.75)"/></g>
  <g transform="translate(445, 410)"><use href="#golden-daisy" transform="scale(0.75)"/></g>
  <g transform="translate(440, 510)"><use href="#blue-anemone" transform="scale(0.7)"/></g>

  <g transform="translate(75, 605)"><use href="#golden-daisy" transform="scale(0.9)"/></g>
  <g transform="translate(125, 625)"><use href="#blue-anemone" transform="scale(0.85)"/></g>

  <g transform="translate(250, 615)"><use href="#cream-hellebore" transform="scale(1.15)"/></g>
  <g transform="translate(190, 628)"><use href="#red-poppy" transform="scale(0.8)"/></g>
  <g transform="translate(310, 628)"><use href="#golden-daisy" transform="scale(0.85)"/></g>

  <g transform="translate(425, 605)"><use href="#red-poppy" transform="scale(0.9)"/></g>
  <g transform="translate(375, 625)"><use href="#blue-anemone" transform="scale(0.85)"/></g>

  <!-- Typography Overlay -->
  <g text-anchor="middle">
    <!-- Title / Couple Names -->
    <text x="250" y="240" font-family="'Playfair Display', Georgia, serif" font-size="28" font-weight="600" fill="#2C241E" letter-spacing="0.5">Emily Taylor</text>
    <text x="250" y="272" font-family="'Playfair Display', Georgia, serif" font-size="20" font-weight="400" fill="#D91B24" font-style="italic">&amp;</text>
    <text x="250" y="306" font-family="'Playfair Display', Georgia, serif" font-size="28" font-weight="600" fill="#2C241E" letter-spacing="0.5">Joseph Lee</text>

    <!-- Subtitle -->
    <text x="250" y="365" font-family="'Playfair Display', Georgia, serif" font-size="14" font-weight="400" fill="#5C4A3E" letter-spacing="0.5">invite you to</text>
    <text x="250" y="386" font-family="'Playfair Display', Georgia, serif" font-size="14" font-weight="400" fill="#5C4A3E" letter-spacing="0.5">celebrate their wedding</text>

    <!-- Date & Time -->
    <text x="250" y="445" font-family="'Playfair Display', Georgia, serif" font-size="13" font-weight="500" fill="#4A3C31" letter-spacing="0.5">Saturday, the sixth of August</text>
    <text x="250" y="466" font-family="'Playfair Display', Georgia, serif" font-size="12.5" font-weight="500" fill="#4A3C31" letter-spacing="0.5">two thousand and twenty-seven</text>
    <text x="250" y="487" font-family="'Playfair Display', Georgia, serif" font-size="12.5" font-weight="500" fill="#4A3C31" letter-spacing="0.5">at six o&apos;clock in the evening</text>

    <!-- Venue -->
    <text x="250" y="535" font-family="'Playfair Display', Georgia, serif" font-size="14" font-weight="600" fill="#3D3027" letter-spacing="0.5">Wildwood Gardens</text>
    <text x="250" y="555" font-family="'Playfair Display', Georgia, serif" font-size="12.5" font-weight="400" fill="#5C4A3E" letter-spacing="0.5">San Francisco, CA</text>
  </g>
</svg>`;

// -----------------------------------------------------------------------------
// 4. LILY OF THE VALLEY MOCKUP SVG
// -----------------------------------------------------------------------------
const lilyOfTheValleyMockup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 700" width="100%" height="100%">
  <defs>
    <radialGradient id="craspedia-grad" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#FFE066"/>
      <stop offset="60%" stop-color="#E5B232"/>
      <stop offset="100%" stop-color="#A87910"/>
    </radialGradient>
    <linearGradient id="lily-bell-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="80%" stop-color="#F7F5EE"/>
      <stop offset="100%" stop-color="#E2DECE"/>
    </linearGradient>
    <linearGradient id="pink-wildflower" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F2A7B8"/>
      <stop offset="100%" stop-color="#B8556D"/>
    </linearGradient>

    <g id="billy-button">
      <circle cx="0" cy="0" r="14" fill="url(#craspedia-grad)"/>
      <circle cx="-5" cy="-6" r="1.5" fill="#FFEAA7" opacity="0.8"/>
      <circle cx="2" cy="-7" r="1.5" fill="#FFEAA7" opacity="0.8"/>
      <circle cx="-7" cy="1" r="1.5" fill="#FFEAA7" opacity="0.8"/>
      <circle cx="5" cy="-2" r="1.5" fill="#FFEAA7" opacity="0.8"/>
      <circle cx="-2" cy="5" r="1.5" fill="#FFEAA7" opacity="0.8"/>
      <circle cx="4" cy="5" r="1.5" fill="#FFEAA7" opacity="0.8"/>
    </g>

    <g id="lily-arch">
      <path d="M 0,60 C 2,30 15,10 35,0" stroke="#5A6F4E" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <path d="M 12,38 Q 16,36 18,44" stroke="#5A6F4E" stroke-width="1.2" fill="none"/>
      <path d="M 14,44 C 12,47 14,54 18,54 C 22,54 24,47 22,44 Z" fill="url(#lily-bell-grad)" stroke="#D6D0BC" stroke-width="0.8"/>
      <path d="M 22,22 Q 26,20 28,28" stroke="#5A6F4E" stroke-width="1.2" fill="none"/>
      <path d="M 24,28 C 22,31 24,38 28,38 C 32,38 34,31 32,28 Z" fill="url(#lily-bell-grad)" stroke="#D6D0BC" stroke-width="0.8"/>
      <path d="M 33,6 Q 37,4 38,12" stroke="#5A6F4E" stroke-width="1.2" fill="none"/>
      <path d="M 35,12 C 33,15 35,21 38,21 C 41,21 43,15 41,12 Z" fill="url(#lily-bell-grad)" stroke="#D6D0BC" stroke-width="0.8"/>
    </g>

    <g id="pink-flower">
      <ellipse cx="0" cy="-10" rx="6" ry="10" fill="url(#pink-wildflower)"/>
      <ellipse cx="10" cy="-3" rx="6" ry="10" transform="rotate(72 10 -3)" fill="url(#pink-wildflower)"/>
      <ellipse cx="6" cy="9" rx="6" ry="10" transform="rotate(144 6 9)" fill="url(#pink-wildflower)"/>
      <ellipse cx="-6" cy="9" rx="6" ry="10" transform="rotate(216 -6 9)" fill="url(#pink-wildflower)"/>
      <ellipse cx="-10" cy="-3" rx="6" ry="10" transform="rotate(288 -10 -3)" fill="url(#pink-wildflower)"/>
      <circle cx="0" cy="0" r="4" fill="#F0DC82"/>
    </g>

    <g id="fern-sprig">
      <line x1="0" y1="0" x2="0" y2="-70" stroke="#4A5E40" stroke-width="1.8"/>
      <ellipse cx="-8" cy="-15" rx="3" ry="8" transform="rotate(-40 -8 -15)" fill="#68855B"/>
      <ellipse cx="8" cy="-20" rx="3" ry="8" transform="rotate(40 8 -20)" fill="#68855B"/>
      <ellipse cx="-8" cy="-32" rx="3" ry="7" transform="rotate(-40 -8 -32)" fill="#68855B"/>
      <ellipse cx="8" cy="-37" rx="3" ry="7" transform="rotate(40 8 -37)" fill="#68855B"/>
      <ellipse cx="-7" cy="-48" rx="2.5" ry="6" transform="rotate(-40 -7 -48)" fill="#7A9A6C"/>
      <ellipse cx="7" cy="-53" rx="2.5" ry="6" transform="rotate(40 7 -53)" fill="#7A9A6C"/>
      <ellipse cx="0" cy="-66" rx="2" ry="5" fill="#7A9A6C"/>
    </g>
  </defs>

  <rect width="500" height="700" fill="#F7F3E7" rx="4"/>
  <rect x="25" y="25" width="450" height="650" fill="none" stroke="#E3DCCB" stroke-width="1" stroke-dasharray="2 4"/>

  <g transform="translate(100, 50)"><use href="#lily-arch" transform="scale(0.85) rotate(-30)"/></g>
  <g transform="translate(180, 42)"><use href="#billy-button" transform="scale(0.85)"/></g>
  <g transform="translate(240, 48)"><use href="#pink-flower" transform="scale(0.7)"/></g>
  <g transform="translate(300, 42)"><use href="#billy-button" transform="scale(0.9)"/></g>
  <g transform="translate(360, 50)"><use href="#lily-arch" transform="scale(-0.85, 0.85) rotate(30)"/></g>
  <g transform="translate(220, 35)"><use href="#fern-sprig" transform="scale(0.6) rotate(90)"/></g>
  <g transform="translate(280, 35)"><use href="#fern-sprig" transform="scale(0.6) rotate(-90)"/></g>

  <g transform="translate(120, 650)"><use href="#lily-arch" transform="scale(0.85, -0.85) rotate(-30)"/></g>
  <g transform="translate(180, 655)"><use href="#billy-button" transform="scale(0.9)"/></g>
  <g transform="translate(250, 650)"><use href="#pink-flower" transform="scale(0.8)"/></g>
  <g transform="translate(320, 655)"><use href="#billy-button" transform="scale(0.85)"/></g>
  <g transform="translate(380, 650)"><use href="#lily-arch" transform="scale(-0.85, -0.85) rotate(30)"/></g>
  <g transform="translate(220, 665)"><use href="#fern-sprig" transform="scale(0.6) rotate(90)"/></g>
  <g transform="translate(280, 665)"><use href="#fern-sprig" transform="scale(0.6) rotate(-90)"/></g>

  <g transform="translate(42, 100)"><use href="#fern-sprig" transform="scale(0.7) rotate(15)"/></g>
  <g transform="translate(48, 160)"><use href="#billy-button" transform="scale(0.8)"/></g>
  <g transform="translate(45, 230)"><use href="#lily-arch" transform="scale(0.8) rotate(40)"/></g>
  <g transform="translate(48, 310)"><use href="#pink-flower" transform="scale(0.75)"/></g>
  <g transform="translate(42, 380)"><use href="#billy-button" transform="scale(0.85)"/></g>
  <g transform="translate(45, 460)"><use href="#lily-arch" transform="scale(0.8) rotate(30)"/></g>
  <g transform="translate(48, 540)"><use href="#pink-flower" transform="scale(0.7)"/></g>
  <g transform="translate(45, 600)"><use href="#fern-sprig" transform="scale(0.7) rotate(-15)"/></g>

  <g transform="translate(458, 100)"><use href="#fern-sprig" transform="scale(0.7) rotate(-15)"/></g>
  <g transform="translate(452, 160)"><use href="#pink-flower" transform="scale(0.75)"/></g>
  <g transform="translate(455, 230)"><use href="#billy-button" transform="scale(0.85)"/></g>
  <g transform="translate(452, 310)"><use href="#lily-arch" transform="scale(-0.8, 0.8) rotate(-40)"/></g>
  <g transform="translate(458, 380)"><use href="#pink-flower" transform="scale(0.7)"/></g>
  <g transform="translate(452, 460)"><use href="#billy-button" transform="scale(0.8)"/></g>
  <g transform="translate(455, 540)"><use href="#lily-arch" transform="scale(-0.8, 0.8) rotate(-30)"/></g>
  <g transform="translate(458, 600)"><use href="#fern-sprig" transform="scale(0.7) rotate(15)"/></g>

  <g transform="translate(48, 48)"><use href="#billy-button" transform="scale(0.95)"/></g>
  <g transform="translate(452, 48)"><use href="#billy-button" transform="scale(0.95)"/></g>
  <g transform="translate(48, 652)"><use href="#billy-button" transform="scale(0.95)"/></g>
  <g transform="translate(452, 652)"><use href="#billy-button" transform="scale(0.95)"/></g>

  <!-- Typography Overlay -->
  <g text-anchor="middle">
    <!-- Intro -->
    <text x="250" y="215" font-family="'Playfair Display', Georgia, serif" font-size="14" font-weight="400" fill="#54483C" letter-spacing="0.5">Please join us for the wedding of</text>

    <!-- Names / Title -->
    <text x="250" y="285" font-family="'Playfair Display', Georgia, serif" font-size="28" font-weight="600" fill="#2E251E" letter-spacing="0.5">Brianna Davis</text>
    <text x="250" y="318" font-family="'Playfair Display', Georgia, serif" font-size="18" font-weight="400" fill="#7A9A6C" font-style="italic">and</text>
    <text x="250" y="354" font-family="'Playfair Display', Georgia, serif" font-size="28" font-weight="600" fill="#2E251E" letter-spacing="0.5">Thomas Brown</text>

    <!-- Date & Time -->
    <text x="250" y="435" font-family="'Playfair Display', Georgia, serif" font-size="15" font-weight="500" fill="#54483C" letter-spacing="0.8">Saturday, June 15 at 4 PM</text>

    <!-- Venue -->
    <text x="250" y="495" font-family="'Playfair Display', Georgia, serif" font-size="14" font-weight="500" fill="#54483C" letter-spacing="0.5">The Rose Garden</text>
    <text x="250" y="518" font-family="'Playfair Display', Georgia, serif" font-size="13" font-weight="400" fill="#6B5C4D" letter-spacing="0.5">45 Mountain View Rd. Denver, CO</text>
  </g>
</svg>`;

// -----------------------------------------------------------------------------
// 5. GOLD RIBBONS & CONFETTI MOCKUP SVG
// -----------------------------------------------------------------------------
const goldRibbonsConfettiMockup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 700" width="100%" height="100%">
  <defs>
    <linearGradient id="gold-ribbon" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCEBA6"/>
      <stop offset="35%" stop-color="#E5C066"/>
      <stop offset="70%" stop-color="#BF9530"/>
      <stop offset="100%" stop-color="#8C6615"/>
    </linearGradient>
    <linearGradient id="black-ribbon" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#404040"/>
      <stop offset="50%" stop-color="#1F1F1F"/>
      <stop offset="100%" stop-color="#0A0A0A"/>
    </linearGradient>

    <g id="sparkle-star">
      <path d="M 0,-12 Q 1,-2 10,0 Q 1,2 0,12 Q -1,2 -10,0 Q -1,-2 0,-12 Z" fill="#D4AF37"/>
    </g>
    <g id="sparkle-star-sm">
      <path d="M 0,-7 Q 0.5,-1 6,0 Q 0.5,1 0,7 Q -0.5,1 -6,0 Q -0.5,-1 0,-7 Z" fill="#E5C066"/>
    </g>
  </defs>

  <rect width="500" height="700" fill="#FFFFFF" rx="4"/>

  <circle cx="50" cy="80" r="4.5" fill="#D4AF37"/>
  <circle cx="35" cy="130" r="3" fill="#1A1A1A"/>
  <circle cx="65" cy="180" r="4" fill="#E5C066"/>
  <circle cx="28" cy="240" r="3.5" fill="#D4AF37"/>
  <circle cx="48" cy="310" r="5" fill="#1A1A1A"/>
  <circle cx="70" cy="380" r="3" fill="#D4AF37"/>
  <circle cx="30" cy="450" r="4.5" fill="#E5C066"/>
  <circle cx="55" cy="520" r="3.5" fill="#1A1A1A"/>
  <circle cx="38" cy="590" r="5" fill="#D4AF37"/>
  <circle cx="65" cy="640" r="3" fill="#E5C066"/>

  <circle cx="445" cy="90" r="4" fill="#1A1A1A"/>
  <circle cx="465" cy="140" r="5" fill="#D4AF37"/>
  <circle cx="430" cy="200" r="3" fill="#E5C066"/>
  <circle cx="460" cy="270" r="4.5" fill="#1A1A1A"/>
  <circle cx="435" cy="340" r="3.5" fill="#D4AF37"/>
  <circle cx="470" cy="410" r="4" fill="#E5C066"/>
  <circle cx="440" cy="480" r="5" fill="#1A1A1A"/>
  <circle cx="465" cy="550" r="3.5" fill="#D4AF37"/>
  <circle cx="435" cy="620" r="4.5" fill="#E5C066"/>

  <g transform="translate(65, 110)"><use href="#sparkle-star"/></g>
  <g transform="translate(425, 120)"><use href="#sparkle-star"/></g>
  <g transform="translate(35, 200)"><use href="#sparkle-star-sm"/></g>
  <g transform="translate(460, 230)"><use href="#sparkle-star-sm"/></g>
  <g transform="translate(60, 270)"><use href="#sparkle-star"/></g>
  <g transform="translate(435, 300)"><use href="#sparkle-star"/></g>
  <g transform="translate(40, 420)"><use href="#sparkle-star-sm"/></g>
  <g transform="translate(455, 450)"><use href="#sparkle-star"/></g>
  <g transform="translate(65, 560)"><use href="#sparkle-star"/></g>
  <g transform="translate(425, 580)"><use href="#sparkle-star-sm"/></g>
  <g transform="translate(40, 640)"><use href="#sparkle-star"/></g>
  <g transform="translate(450, 650)"><use href="#sparkle-star"/></g>

  <path d="M 30,30 C 50,45 80,60 65,95 C 50,130 15,115 35,160 C 55,200 85,210 60,250"
        stroke="url(#gold-ribbon)" stroke-width="7" fill="none" stroke-linecap="round"/>
  <path d="M 60,40 C 30,70 15,110 40,140 C 65,170 50,210 30,230 C 15,250 25,290 50,320"
        stroke="url(#black-ribbon)" stroke-width="6" fill="none" stroke-linecap="round"/>

  <path d="M 50,330 C 80,360 70,410 40,430 C 10,450 20,500 55,530 C 85,555 70,610 35,640"
        stroke="url(#gold-ribbon)" stroke-width="7.5" fill="none" stroke-linecap="round"/>
  <path d="M 35,440 C 15,470 30,520 60,540 C 90,560 75,620 40,660"
        stroke="url(#black-ribbon)" stroke-width="6" fill="none" stroke-linecap="round"/>

  <path d="M 470,30 C 450,45 420,60 435,95 C 450,130 485,115 465,160 C 445,200 415,210 440,250"
        stroke="url(#black-ribbon)" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M 440,40 C 470,70 485,110 460,140 C 435,170 450,210 470,230 C 485,250 475,290 450,320"
        stroke="url(#gold-ribbon)" stroke-width="7" fill="none" stroke-linecap="round"/>

  <path d="M 450,330 C 420,360 430,410 460,430 C 490,450 480,500 445,530 C 415,555 430,610 465,640"
        stroke="url(#black-ribbon)" stroke-width="6.5" fill="none" stroke-linecap="round"/>
  <path d="M 465,440 C 485,470 470,520 440,540 C 410,560 425,620 460,660"
        stroke="url(#gold-ribbon)" stroke-width="7.5" fill="none" stroke-linecap="round"/>

  <!-- Typography Overlay -->
  <g text-anchor="middle">
    <!-- Headline -->
    <text x="250" y="225" font-family="'Inter', sans-serif" font-size="18" font-weight="800" fill="#1A1A1A" letter-spacing="3">DAVE IS TURNING</text>

    <!-- Big Number 50 -->
    <text x="250" y="340" font-family="'Inter', sans-serif" font-size="96" font-weight="900" fill="url(#gold-ribbon)" letter-spacing="-2">50</text>

    <!-- Subtitle -->
    <text x="250" y="395" font-family="'Inter', sans-serif" font-size="15" font-weight="500" fill="#555555" letter-spacing="0.5">Please join us to celebrate!</text>

    <!-- Date & Time -->
    <text x="250" y="455" font-family="'Inter', sans-serif" font-size="15" font-weight="700" fill="#222222" letter-spacing="1">SATURDAY, AUGUST 10 AT 2 PM</text>

    <!-- Venue -->
    <text x="250" y="515" font-family="'Inter', sans-serif" font-size="14" font-weight="600" fill="#333333" letter-spacing="0.5">Downtown Pub</text>
    <text x="250" y="538" font-family="'Inter', sans-serif" font-size="13" font-weight="400" fill="#666666" letter-spacing="0.5">457 Lakeview Rd.</text>
  </g>
</svg>`;

// -----------------------------------------------------------------------------
// 6. SPARKLE BALLOONS MOCKUP SVG
// -----------------------------------------------------------------------------
const sparkleBalloonsMockup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 700" width="100%" height="100%">
  <defs>
    <radialGradient id="black-balloon-grad" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#4F4D59"/>
      <stop offset="40%" stop-color="#26252B"/>
      <stop offset="85%" stop-color="#141317"/>
      <stop offset="100%" stop-color="#0A090D"/>
    </radialGradient>
    <radialGradient id="gold-balloon-grad" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#FFF4C7"/>
      <stop offset="30%" stop-color="#E8C36A"/>
      <stop offset="70%" stop-color="#B88A2E"/>
      <stop offset="100%" stop-color="#735012"/>
    </radialGradient>
    <linearGradient id="sheen" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
    </linearGradient>

    <g id="sparkle-gold">
      <path d="M 0,-14 Q 1,-2 14,0 Q 1,2 0,14 Q -1,2 -14,0 Q -1,-2 0,-14 Z" fill="#D4AF37"/>
    </g>
    <g id="sparkle-gold-sm">
      <path d="M 0,-8 Q 0.5,-1 8,0 Q 0.5,1 0,8 Q -0.5,1 -8,0 Q -0.5,-1 0,-8 Z" fill="#E5C066"/>
    </g>
    <g id="sparkle-dark">
      <path d="M 0,-10 Q 0.8,-1.5 10,0 Q 0.8,1.5 0,10 Q -0.8,1.5 -10,0 Q -0.8,-1.5 0,-10 Z" fill="#2B2830"/>
    </g>
  </defs>

  <rect width="500" height="700" fill="#EDE9DF" rx="4"/>

  <g transform="translate(60, 60)"><use href="#sparkle-gold-sm"/></g>
  <g transform="translate(140, 90)"><use href="#sparkle-gold"/></g>
  <g transform="translate(380, 70)"><use href="#sparkle-gold-sm"/></g>
  <g transform="translate(440, 110)"><use href="#sparkle-gold"/></g>
  <g transform="translate(70, 620)"><use href="#sparkle-gold-sm"/></g>
  <g transform="translate(130, 650)"><use href="#sparkle-dark"/></g>
  <g transform="translate(420, 630)"><use href="#sparkle-gold"/></g>
  <g transform="translate(370, 660)"><use href="#sparkle-gold-sm"/></g>

  <g transform="translate(150, 310)">
    <path d="M 0,80 Q -15,120 10,160 T -5,220 T 15,280"
          stroke="#4F4D59" stroke-width="2" fill="none" stroke-linecap="round"/>
    <ellipse cx="0" cy="0" rx="72" ry="82" fill="url(#black-balloon-grad)"/>
    <polygon points="-6,80 6,80 10,88 -10,88" fill="#141317"/>
    <path d="M -40,-35 C -25,-60 10,-65 35,-45 C 25,-55 -5,-55 -30,-30 Z" fill="url(#sheen)"/>
    <g transform="translate(75, -25)"><use href="#sparkle-gold"/></g>
    <g transform="translate(-65, 45)"><use href="#sparkle-gold-sm"/></g>
    <g transform="translate(-20, 95)"><use href="#sparkle-dark"/></g>
  </g>

  <g transform="translate(365, 230)">
    <path d="M 0,82 Q 20,130 -12,180 T 18,240 T -8,310"
          stroke="#B88A2E" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <ellipse cx="0" cy="0" rx="75" ry="85" fill="url(#gold-balloon-grad)"/>
    <polygon points="-6,82 6,82 10,90 -10,90" fill="#735012"/>
    <path d="M -45,-38 C -30,-65 15,-70 42,-48 C 30,-60 -5,-60 -35,-32 Z" fill="url(#sheen)"/>
    <ellipse cx="25" cy="-25" rx="14" ry="8" transform="rotate(-30 25 -25)" fill="#FFFFFF" opacity="0.45"/>
    <g transform="translate(-80, -30)"><use href="#sparkle-gold"/></g>
    <g transform="translate(68, 40)"><use href="#sparkle-gold"/></g>
    <g transform="translate(45, -60)"><use href="#sparkle-gold-sm"/></g>
    <g transform="translate(-55, 65)"><use href="#sparkle-dark"/></g>
  </g>

  <circle cx="250" cy="90" r="3" fill="#D4AF37"/>
  <circle cx="280" cy="140" r="2" fill="#2B2830"/>
  <circle cx="220" cy="160" r="2.5" fill="#E5C066"/>
  <circle cx="260" cy="620" r="3" fill="#D4AF37"/>
  <circle cx="230" cy="580" r="2" fill="#2B2830"/>

  <!-- Typography Overlay -->
  <g text-anchor="middle">
    <!-- Intro -->
    <text x="250" y="240" font-family="'Playfair Display', Georgia, serif" font-size="16" font-weight="400" fill="#4A4A4A" letter-spacing="1" font-style="italic">Join us for</text>

    <!-- Title -->
    <text x="250" y="300" font-family="'Playfair Display', Georgia, serif" font-size="28" font-weight="700" fill="#1E1E1E" letter-spacing="2">APRIL&apos;S</text>
    <text x="250" y="338" font-family="'Playfair Display', Georgia, serif" font-size="28" font-weight="700" fill="#B88A2E" letter-spacing="2">BIRTHDAY!</text>

    <!-- Date & Time -->
    <text x="250" y="420" font-family="'Playfair Display', Georgia, serif" font-size="15" font-weight="600" fill="#333333" letter-spacing="0.8">Sunday, May 7th at 1 PM</text>

    <!-- Venue -->
    <text x="250" y="480" font-family="'Playfair Display', Georgia, serif" font-size="14" font-weight="500" fill="#4A4A4A" letter-spacing="0.5">The Blais&apos; Backyard</text>
    <text x="250" y="502" font-family="'Playfair Display', Georgia, serif" font-size="13" font-weight="400" fill="#666666" letter-spacing="0.5">8739 Shorecrest Drive</text>
  </g>
</svg>`;

// -----------------------------------------------------------------------------
// 7. CELESTIAL FLORA MOCKUP SVG
// -----------------------------------------------------------------------------
const celestialFloraMockup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 700" width="100%" height="100%">
  <defs>
    <radialGradient id="sun-grad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFE685"/>
      <stop offset="65%" stop-color="#F5B842"/>
      <stop offset="100%" stop-color="#DE8C23"/>
    </radialGradient>
    <radialGradient id="moon-grad" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#FFF0A6"/>
      <stop offset="70%" stop-color="#F5C042"/>
      <stop offset="100%" stop-color="#D98A18"/>
    </radialGradient>
    <linearGradient id="terracotta-flower" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F79F68"/>
      <stop offset="60%" stop-color="#DE6B35"/>
      <stop offset="100%" stop-color="#A84413"/>
    </linearGradient>

    <g id="celestial-sun">
      <path d="M 0,-34 Q 4,-48 0,-62 Q -4,-48 0,-34 Z" fill="#E89A38"/>
      <path d="M 0,34 Q 4,48 0,62 Q -4,48 0,34 Z" fill="#E89A38"/>
      <path d="M -34,0 Q -48,4 -62,0 Q -48,-4 -34,0 Z" fill="#E89A38"/>
      <path d="M 34,0 Q 48,4 62,0 Q 48,-4 34,0 Z" fill="#E89A38"/>
      <path d="M -24,-24 Q -35,-42 -44,-44 Q -42,-35 -24,-24 Z" fill="#F5B842"/>
      <path d="M 24,-24 Q 35,-42 44,-44 Q 42,-35 24,-24 Z" fill="#F5B842"/>
      <path d="M -24,24 Q -35,42 -44,44 Q -42,35 -24,24 Z" fill="#F5B842"/>
      <path d="M 24,24 Q 35,42 44,44 Q 42,35 24,24 Z" fill="#F5B842"/>
      <path d="M 13,-31 L 20,-48 L 7,-33 Z" fill="#DE8C23"/>
      <path d="M -13,-31 L -20,-48 L -7,-33 Z" fill="#DE8C23"/>
      <path d="M 31,-13 L 48,-20 L 33,-7 Z" fill="#DE8C23"/>
      <path d="M -31,-13 L -48,-20 L -33,-7 Z" fill="#DE8C23"/>
      <path d="M 13,31 L 20,48 L 7,33 Z" fill="#DE8C23"/>
      <path d="M -13,31 L -20,48 L -7,33 Z" fill="#DE8C23"/>
      <path d="M 31,13 L 48,20 L 33,7 Z" fill="#DE8C23"/>
      <path d="M -31,13 L -48,20 L -33,7 Z" fill="#DE8C23"/>
      <circle cx="0" cy="0" r="34" fill="url(#sun-grad)"/>
      <circle cx="0" cy="0" r="32" fill="none" stroke="#D17B1B" stroke-width="1.2"/>
      <path d="M -14,-4 Q -9,-10 -4,-4" stroke="#663A0A" stroke-width="2.2" stroke-linecap="round" fill="none"/>
      <path d="M 4,-4 Q 9,-10 14,-4" stroke="#663A0A" stroke-width="2.2" stroke-linecap="round" fill="none"/>
      <circle cx="-16" cy="4" r="5" fill="#E86B43" opacity="0.6"/>
      <circle cx="16" cy="4" r="5" fill="#E86B43" opacity="0.6"/>
      <path d="M -8,8 Q 0,16 8,8" stroke="#663A0A" stroke-width="2.2" stroke-linecap="round" fill="none"/>
    </g>

    <g id="celestial-moon">
      <path d="M 0,-28 A 28 28 0 0 0 0,28 A 22 22 0 0 1 0,-28 Z" fill="url(#moon-grad)"/>
      <path d="M -6,-4 Q -2,-9 2,-4" stroke="#663A0A" stroke-width="1.8" stroke-linecap="round" fill="none"/>
      <circle cx="-3" cy="2" r="3.5" fill="#E86B43" opacity="0.5"/>
      <path d="M -4,7 Q 0,11 3,7" stroke="#663A0A" stroke-width="1.8" stroke-linecap="round" fill="none"/>
    </g>

    <g id="terracotta-blossom">
      <ellipse cx="0" cy="-14" rx="8" ry="13" fill="url(#terracotta-flower)"/>
      <ellipse cx="14" cy="0" rx="8" ry="13" transform="rotate(90 14 0)" fill="url(#terracotta-flower)"/>
      <ellipse cx="0" cy="14" rx="8" ry="13" fill="url(#terracotta-flower)"/>
      <ellipse cx="-14" cy="0" rx="8" ry="13" transform="rotate(90 -14 0)" fill="url(#terracotta-flower)"/>
      <circle cx="0" cy="0" r="7" fill="#FCE881"/>
      <circle cx="0" cy="0" r="4" fill="#E88A1A"/>
    </g>

    <g id="boho-star">
      <path d="M 0,-10 Q 0.8,-1.5 10,0 Q 0.8,1.5 0,10 Q -0.8,1.5 -10,0 Q -0.8,-1.5 0,-10 Z" fill="#F5B842"/>
    </g>
    <g id="boho-star-sm">
      <path d="M 0,-6 Q 0.5,-1 6,0 Q 0.5,1 0,6 Q -0.5,1 -6,0 Q -0.5,-1 0,-6 Z" fill="#DE8C23"/>
    </g>
  </defs>

  <rect width="500" height="700" fill="#FAF7EF" rx="4"/>

  <path d="M 50,70 Q 30,220 50,350 T 45,630" stroke="#5E7D52" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <path d="M 450,70 Q 470,220 450,350 T 455,630" stroke="#5E7D52" stroke-width="2.5" fill="none" stroke-linecap="round"/>

  <g transform="translate(42, 110) rotate(-35)"><ellipse cx="0" cy="0" rx="6" ry="14" fill="#6B8E5F"/></g>
  <g transform="translate(56, 170) rotate(30)"><ellipse cx="0" cy="0" rx="6" ry="14" fill="#5E7D52"/></g>
  <g transform="translate(38, 230) rotate(-30)"><ellipse cx="0" cy="0" rx="6" ry="14" fill="#6B8E5F"/></g>
  <g transform="translate(56, 290) rotate(35)"><ellipse cx="0" cy="0" rx="6" ry="14" fill="#5E7D52"/></g>
  <g transform="translate(40, 360) rotate(-25)"><ellipse cx="0" cy="0" rx="6" ry="14" fill="#6B8E5F"/></g>
  <g transform="translate(58, 430) rotate(30)"><ellipse cx="0" cy="0" rx="6" ry="14" fill="#5E7D52"/></g>
  <g transform="translate(38, 500) rotate(-35)"><ellipse cx="0" cy="0" rx="6" ry="14" fill="#6B8E5F"/></g>
  <g transform="translate(54, 570) rotate(25)"><ellipse cx="0" cy="0" rx="6" ry="14" fill="#5E7D52"/></g>

  <g transform="translate(458, 110) rotate(35)"><ellipse cx="0" cy="0" rx="6" ry="14" fill="#6B8E5F"/></g>
  <g transform="translate(444, 170) rotate(-30)"><ellipse cx="0" cy="0" rx="6" ry="14" fill="#5E7D52"/></g>
  <g transform="translate(462, 230) rotate(30)"><ellipse cx="0" cy="0" rx="6" ry="14" fill="#6B8E5F"/></g>
  <g transform="translate(444, 290) rotate(-35)"><ellipse cx="0" cy="0" rx="6" ry="14" fill="#5E7D52"/></g>
  <g transform="translate(460, 360) rotate(25)"><ellipse cx="0" cy="0" rx="6" ry="14" fill="#6B8E5F"/></g>
  <g transform="translate(442, 430) rotate(-30)"><ellipse cx="0" cy="0" rx="6" ry="14" fill="#5E7D52"/></g>
  <g transform="translate(462, 500) rotate(35)"><ellipse cx="0" cy="0" rx="6" ry="14" fill="#6B8E5F"/></g>
  <g transform="translate(446, 570) rotate(-25)"><ellipse cx="0" cy="0" rx="6" ry="14" fill="#5E7D52"/></g>

  <g transform="translate(48, 140)"><use href="#terracotta-blossom" transform="scale(0.75)"/></g>
  <g transform="translate(452, 140)"><use href="#terracotta-blossom" transform="scale(0.75)"/></g>
  <g transform="translate(45, 260)"><use href="#terracotta-blossom" transform="scale(0.7)"/></g>
  <g transform="translate(455, 260)"><use href="#terracotta-blossom" transform="scale(0.7)"/></g>
  <g transform="translate(48, 400)"><use href="#terracotta-blossom" transform="scale(0.75)"/></g>
  <g transform="translate(452, 400)"><use href="#terracotta-blossom" transform="scale(0.75)"/></g>
  <g transform="translate(45, 530)"><use href="#terracotta-blossom" transform="scale(0.7)"/></g>
  <g transform="translate(455, 530)"><use href="#terracotta-blossom" transform="scale(0.7)"/></g>

  <g transform="translate(75, 90)"><use href="#boho-star"/></g>
  <g transform="translate(425, 90)"><use href="#boho-star"/></g>
  <g transform="translate(70, 200)"><use href="#boho-star-sm"/></g>
  <g transform="translate(430, 200)"><use href="#boho-star-sm"/></g>
  <g transform="translate(75, 460)"><use href="#boho-star-sm"/></g>
  <g transform="translate(425, 460)"><use href="#boho-star-sm"/></g>
  <g transform="translate(70, 600)"><use href="#boho-star"/></g>
  <g transform="translate(430, 600)"><use href="#boho-star"/></g>

  <g transform="translate(250, 95)">
    <use href="#celestial-sun" transform="scale(0.85)" />
  </g>

  <g transform="translate(250, 620)">
    <use href="#celestial-moon" transform="scale(1.1) rotate(20)" />
    <g transform="translate(-45, -10)"><use href="#boho-star"/></g>
    <g transform="translate(45, -10)"><use href="#boho-star"/></g>
    <g transform="translate(-70, 8)"><use href="#boho-star-sm"/></g>
    <g transform="translate(70, 8)"><use href="#boho-star-sm"/></g>
  </g>

  <!-- Typography Overlay -->
  <g text-anchor="middle">
    <!-- Intro -->
    <text x="250" y="200" font-family="'Playfair Display', Georgia, serif" font-size="15" font-weight="400" fill="#594D42" letter-spacing="1" font-style="italic">Let&apos;s celebrate</text>

    <!-- Title -->
    <text x="250" y="260" font-family="'Playfair Display', Georgia, serif" font-size="30" font-weight="700" fill="#4B5E3C" letter-spacing="1">Another Trip</text>
    <text x="250" y="295" font-family="'Playfair Display', Georgia, serif" font-size="22" font-weight="500" fill="#DE6B35" font-style="italic">Around</text>
    <text x="250" y="332" font-family="'Playfair Display', Georgia, serif" font-size="30" font-weight="700" fill="#4B5E3C" letter-spacing="1">The Sun</text>

    <!-- Celebrant Name -->
    <text x="250" y="390" font-family="'Playfair Display', Georgia, serif" font-size="20" font-weight="600" fill="#B85B32" letter-spacing="1.5">Aria Thompson</text>

    <!-- Date & Time -->
    <text x="250" y="450" font-family="'Playfair Display', Georgia, serif" font-size="14.5" font-weight="600" fill="#594D42" letter-spacing="0.8">Saturday, May 15 at 2 PM</text>

    <!-- Venue -->
    <text x="250" y="500" font-family="'Playfair Display', Georgia, serif" font-size="13.5" font-weight="500" fill="#6B5E52" letter-spacing="0.5">412 Sunset Lane</text>
  </g>
</svg>`;

// Save all 7 files
saveMockup('abstract-nature-party-mockup.svg', abstractNaturePartyMockup);
saveMockup('bright-blooms-garden-mockup.svg', brightBloomsGardenMockup);
saveMockup('vibrant-blooms-wedding-mockup.svg', vibrantBloomsWeddingMockup);
saveMockup('lily-of-the-valley-mockup.svg', lilyOfTheValleyMockup);
saveMockup('gold-ribbons-confetti-mockup.svg', goldRibbonsConfettiMockup);
saveMockup('sparkle-balloons-mockup.svg', sparkleBalloonsMockup);
saveMockup('celestial-flora-mockup.svg', celestialFloraMockup);

console.log('All 7 free template mockup SVGs successfully generated and saved!');
