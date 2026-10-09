export const IMG = {
  jessica: "/images/jessica.webp",
  rooftop: "/images/rooftop.webp",
  couple: "/images/couple.webp",
  halloweenHouse: "/images/halloween-house.png",
  party: "/images/party.webp",
  grad: "/images/grad.webp",
  marcus: "/images/marcus.webp",
  halloweenCostume: "/images/halloween-costume.png",
  halloweenKids: "/images/halloween-kids.png",
  anniversary: "/images/anniversary.webp",
  baby: "/images/baby.webp",
  oldBeach: "/images/old-beach.webp",
  oldBike: "/images/old-bike.webp",
  childhood: "/images/childhood-cake.webp",
  concert: "/images/concert.webp",
  reunion: "/images/reunion.webp",
  corporate: "/images/corporate.webp",
  schoolKid: "/images/school-kid.webp",
};

export const NAV = [
  { label: "Create", href: "#start" },
  { label: "AI Invites", href: "#lab" },
  { label: "Video Invites", href: "#video" },
  { label: "How It Works", href: "#how" },
  { label: "For Organizers", href: "#organizers" },
  { label: "For Pros", href: "/pro" },
  { label: "Pricing", href: "#pricing" },
];

export interface VideoExperience {
  id: string;
  kind: string;
  title: string;
  blurb: string;
  tier: "Included" | "Premium" | "Signature";
}

export const VIDEO_EXPERIENCES: VideoExperience[] = [
  {
    id: "then-now",
    kind: "then-now",
    title: "Then & Now",
    blurb: "Old photograph transitions into today.",
    tier: "Premium",
  },
  {
    id: "premiere",
    kind: "premiere",
    title: "Movie Premiere",
    blurb: "Your event becomes a cinematic trailer.",
    tier: "Premium",
  },
  {
    id: "luxury",
    kind: "luxury",
    title: "Luxury Envelope",
    blurb: "Elegant envelope opens into animated memories.",
    tier: "Included",
  },
  {
    id: "news",
    kind: "news",
    title: "Breaking News",
    blurb: "“BREAKING: Marcus is turning 50.”",
    tier: "Included",
  },
  {
    id: "journey",
    kind: "journey",
    title: "Memory Journey",
    blurb: "Multiple photographs transition through different eras.",
    tier: "Signature",
  },
  {
    id: "vhs",
    kind: "vhs",
    title: "Retro VHS",
    blurb: "90s home-video aesthetic becomes an invitation.",
    tier: "Premium",
  },
  {
    id: "redcarpet",
    kind: "redcarpet",
    title: "Red Carpet",
    blurb: "Guest of honor receives a celebrity-premiere treatment.",
    tier: "Premium",
  },
  {
    id: "editorial",
    kind: "editorial",
    title: "Editorial",
    blurb: "Fashion-magazine-inspired motion typography.",
    tier: "Included",
  },
  {
    id: "golden",
    kind: "golden",
    title: "Golden Milestone",
    blurb: "Premium birthday and anniversary treatment.",
    tier: "Signature",
  },
  {
    id: "surprise",
    kind: "surprise",
    title: "Surprise Me",
    blurb: "AI chooses something unexpected.",
    tier: "Premium",
  },
];

export interface TemplateItem {
  id: string;
  title: string;
  tier: string;
  preview: { kind: string } | { img: string };
}

export const TEMPLATES: TemplateItem[] = [
  { id: "jessica", title: "Milestone birthday", tier: "Included", preview: { img: IMG.jessica } },
  { id: "premiere", title: "Movie Premiere", tier: "Premium", preview: { kind: "premiere" } },
  { id: "wedding", title: "Wedding", tier: "Premium", preview: { img: IMG.couple } },
  { id: "haunting", title: "Halloween · Haunted house", tier: "Premium", preview: { img: IMG.halloweenHouse } },
  { id: "vhs", title: "Retro VHS", tier: "Premium", preview: { kind: "vhs" } },
  { id: "grad", title: "Graduation", tier: "Included", preview: { img: IMG.grad } },
  { id: "news", title: "Breaking News", tier: "Included", preview: { kind: "news" } },
  { id: "monster-mash", title: "Halloween · Costume party", tier: "Included", preview: { img: IMG.halloweenCostume } },
  { id: "party", title: "House party", tier: "Included", preview: { img: IMG.party } },
  { id: "redcarpet", title: "Red Carpet", tier: "Premium", preview: { kind: "redcarpet" } },
  { id: "pumpkin-patch", title: "Halloween · Kids trick-or-treat", tier: "Included", preview: { img: IMG.halloweenKids } },
  { id: "anniversary", title: "Anniversary", tier: "Premium", preview: { img: IMG.anniversary } },
  { id: "golden", title: "Golden Milestone", tier: "Signature", preview: { kind: "golden" } },
  { id: "baby", title: "Baby shower", tier: "Included", preview: { img: IMG.baby } },
  { id: "journey", title: "Memory Journey", tier: "Signature", preview: { kind: "journey" } },
  { id: "concert", title: "Afterparty", tier: "Premium", preview: { img: IMG.concert } },
  { id: "editorial", title: "Editorial", tier: "Included", preview: { kind: "editorial" } },
  { id: "reunion", title: "Reunion", tier: "Included", preview: { img: IMG.reunion } },
  { id: "then-now", title: "Then & Now", tier: "Premium", preview: { kind: "then-now" } },
  { id: "romantic", title: "Love Story", tier: "Premium", preview: { kind: "romantic" } },
];

export function findTemplate(id?: string | null): TemplateItem | undefined {
  if (!id) return undefined;
  return TEMPLATES.find((t) => t.id === id);
}

export const LAB_CHIPS = [
  { label: "Movie Trailer", kind: "premiere", prompt: "Make my 30th birthday invitation feel like a ridiculous Hollywood action movie trailer." },
  { label: "Breaking News", kind: "news", prompt: "Make it a breaking-news bulletin announcing that I am turning 50." },
  { label: "Luxury Editorial", kind: "editorial", prompt: "A luxury fashion-magazine cover for our graduation dinner." },
  { label: "90s Throwback", kind: "vhs", prompt: "Make it feel like a 90s home video found in a shoebox." },
  { label: "Meme Energy", kind: "meme", prompt: "Meme energy. Big white text, zero shame." },
  { label: "Romantic Film", kind: "romantic", prompt: "Soft, slow, romantic movie. Like the last scene of a love story." },
  { label: "VIP Only", kind: "redcarpet", prompt: "Make every guest feel like they are walking a red carpet." },
  { label: "Totally Unhinged", kind: "surprise", prompt: "Totally unhinged. Surprise me and do not apologise." },
  { label: "Surprise Me", kind: "surprise", prompt: "Surprise me." },
];

export const MOODS = [
  "Make it funnier",
  "Make it luxurious",
  "Make it nostalgic",
  "Make it dramatic",
  "Make it romantic",
  "Make it unexpected",
];

export const OCCASIONS = [
  { title: "Milestone Birthdays", line: "Bring decades of memories to life.", image: IMG.jessica },
  { title: "Weddings", line: "Tell your story before the celebration begins.", image: IMG.couple },
  { title: "Anniversaries", line: "Then. Now. Forever.", image: IMG.anniversary },
  { title: "Baby Showers", line: "Create something as personal as the moment.", image: IMG.baby },
  { title: "Graduations", line: "Turn the journey into the invitation.", image: IMG.grad },
  { title: "Reunions", line: "Bring old memories back together.", image: IMG.reunion },
  { title: "Corporate & Launch Events", line: "Create experiences people actually want to attend.", image: IMG.corporate },
  { title: "Ticketed Events", line: "Promote. Sell. Manage. Check in.", image: IMG.concert },
];

export interface CarouselCard {
  id: string;
  type: "static" | "video" | "yours";
  title: string;
  label?: string;
  img: string;
  video?: boolean;
  kind?: string;
  tone: "gold" | "white" | "halloween" | "accent";
  tag?: string;
  heading?: string;
  subhead?: string;
  rsvp?: string;
  halloween?: boolean;
}

export const CAROUSEL_CARDS: CarouselCard[] = [
  {
    id: "jessica",
    type: "static",
    title: "Start with the Milestone birthday invitation",
    img: IMG.jessica,
    tone: "gold",
    tag: "Jessica turns",
    heading: "40",
    subhead: "Sat · Nov 14 · The Roof, NYC",
    rsvp: "You're invited",
  },
  {
    id: "premiere",
    type: "video",
    title: "Start with the Movie Premiere invitation",
    label: "Movie Premiere",
    img: IMG.rooftop,
    kind: "premiere",
    tone: "gold",
  },
  {
    id: "wedding",
    type: "static",
    title: "Start with the Wedding invitation",
    img: IMG.couple,
    tone: "white",
    tag: "Together with their families",
    heading: "Sofia & Daniel",
    subhead: "June 21 · Lake Como",
    rsvp: "Reserve your seat",
  },
  {
    id: "haunting",
    type: "static",
    title: "Start with the Halloween · Haunted house invitation",
    img: IMG.halloweenHouse,
    tone: "halloween",
    tag: "Halloween night",
    heading: "The Haunting of Elm St",
    subhead: "Oct 31 · Costumes required",
    rsvp: "Dare to RSVP",
    halloween: true,
    video: true,
  },
  {
    id: "vhs",
    type: "video",
    title: "Start with the Retro VHS invitation",
    label: "Retro VHS",
    img: IMG.party,
    kind: "vhs",
    tone: "accent",
  },
  {
    id: "grad",
    type: "static",
    title: "Start with the Graduation invitation",
    img: IMG.grad,
    tone: "gold",
    tag: "Class of 2026",
    heading: "Maya graduates",
    subhead: "Dinner after · 7 PM",
    rsvp: "Come celebrate",
  },
  {
    id: "news",
    type: "video",
    title: "Start with the Breaking News invitation",
    label: "Breaking News",
    img: IMG.marcus,
    kind: "news",
    tone: "accent",
  },
  {
    id: "monster-mash",
    type: "static",
    title: "Start with the Halloween · Costume party invitation",
    img: IMG.halloweenCostume,
    tone: "halloween",
    tag: "Costume party",
    heading: "Monster Mash",
    subhead: "Fri · Oct 31 · 9 PM",
    rsvp: "I'm in",
    halloween: true,
  },
  {
    id: "party",
    type: "static",
    title: "Start with the House party invitation",
    img: IMG.party,
    tone: "accent",
    tag: "Breaking",
    heading: "Jay's 30th got out of hand",
    subhead: "Friday 10 PM · Bring a friend",
    rsvp: "I'm in",
  },
  {
    id: "redcarpet",
    type: "video",
    title: "Start with the Red Carpet invitation",
    label: "Red Carpet",
    img: IMG.jessica,
    kind: "redcarpet",
    tone: "gold",
  },
  {
    id: "pumpkin-patch",
    type: "static",
    title: "Start with the Halloween · Kids trick-or-treat invitation",
    img: IMG.halloweenKids,
    tone: "halloween",
    tag: "Trick or treat",
    heading: "Pumpkin Patch Party",
    subhead: "Sat · Oct 31 · 4 PM",
    rsvp: "Count us in",
    halloween: true,
  },
  {
    id: "anniversary",
    type: "static",
    title: "Start with the Anniversary invitation",
    img: IMG.anniversary,
    tone: "gold",
    tag: "Twenty-five years",
    heading: "Mark & Elena",
    subhead: "Sept 6 · Napa Valley",
    rsvp: "Celebrate with us",
  },
  {
    id: "golden",
    type: "video",
    title: "Start with the Golden Milestone invitation",
    label: "Golden Milestone",
    img: IMG.couple,
    kind: "golden",
    tone: "gold",
  },
  {
    id: "baby",
    type: "static",
    title: "Start with the Baby shower invitation",
    img: IMG.baby,
    tone: "white",
    tag: "Baby shower",
    heading: "Oh baby!",
    subhead: "Sun · May 4 · Garden brunch",
    rsvp: "RSVP",
  },
  {
    id: "journey",
    type: "video",
    title: "Start with the Memory Journey invitation",
    label: "Memory Journey",
    img: IMG.oldBeach,
    kind: "journey",
    tone: "gold",
  },
  {
    id: "concert",
    type: "static",
    title: "Start with the Afterparty invitation",
    img: IMG.concert,
    tone: "accent",
    tag: "Afterparty",
    heading: "Front row",
    subhead: "Doors 8 PM · Guest list only",
    rsvp: "Get on the list",
  },
  {
    id: "editorial",
    type: "video",
    title: "Start with the Editorial invitation",
    label: "Editorial",
    img: IMG.grad,
    kind: "editorial",
    tone: "white",
  },
  {
    id: "reunion",
    type: "static",
    title: "Start with the Reunion invitation",
    img: IMG.reunion,
    tone: "gold",
    tag: "Class of 2006",
    heading: "20 years later",
    subhead: "Aug 16 · Homecoming weekend",
    rsvp: "I'll be there",
  },
  {
    id: "then-now",
    type: "video",
    title: "Start with the Then & Now invitation",
    label: "Then & Now",
    img: IMG.childhood,
    kind: "then-now",
    tone: "gold",
  },
];
