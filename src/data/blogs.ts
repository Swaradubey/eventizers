export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  category: "Planning Guide" | "Design Trends" | "RSVP Tips" | "Host Etiquette" | "Product Updates" | string;
  readTime: string;
  publishedAt: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  content?: string;
  tags?: string[];
  featured?: boolean;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "seamless-birthday-gala-checklist",
    title: "The Ultimate Checklist for Planning a Seamless Birthday Gala",
    excerpt:
      "From lighting architecture to synchronizing caterers and guest arrivals, follow this master milestone timeline to host an unforgettable milestone celebration.",
    coverImage:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80",
    category: "Planning Guide",
    readTime: "5 min read",
    publishedAt: "Oct 2026",
    featured: true,
    author: {
      name: "Camille Vance",
      role: "Lead Event Designer & Producer",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    },
    tags: ["Birthday Gala", "Event Planning", "Checklist", "Milestone Celebrations"],
    content: `
Planning a milestone birthday gala requires orchestrating dozens of moving parts into a seamless, unforgettable evening. Whether you are hosting a 30th, 50th, or centennial jubilee, this strategic checklist ensures every detail unfolds effortlessly.

### 1. 8 Weeks Out: The Vision & Guest List
Every memorable gala begins with an intentional emotional atmosphere. Before choosing floral arrangements or tasting hors d'oeuvres:
* **Define the Narrative**: Is this a black-tie soirée with vintage jazz or a vibrant rooftop lounge under bistro string lights?
* **Finalize the Guest Hierarchy**: Draft your VIP list and plus-one allowances.
* **Send Digital Save-the-Dates**: Digital stationery with animated wax seals establishes high anticipation early while providing instant headcount visibility.

### 2. 4 Weeks Out: Vendor Alignment & Sensory Design
Great events engage all five senses:
* **Audio Atmosphere**: Coordinate with your DJ or quartet for three distinct phases: cocktail prelude, seated dinner murmur, and late-night crescendo.
* **Lighting Architecture**: Swap harsh overhead spots for warm uplighting (2700K color temperature), table pin-spots, and flickering pillar candles.
* **Culinary Flow**: Confirm tasting menus, dietary restrictions, and signature welcome cocktails.

### 3. 2 Weeks Out: Digital RSVP Lock-in & Seating Strategy
* **Automate Gentle Reminders**: Use Eventizers' smart RSVP cadences to reach unconfirmed guests via SMS or WhatsApp without feeling pushy.
* **Finalize Digital Floorplan**: Group complementary personalities and ensure easy transit to bars and restrooms.

### 4. 48 Hours Out: Day-of Readiness
* Provide vendors with a unified minute-by-minute run of show.
* Pre-load guest QR check-in codes on tablets to eliminate entry bottlenecks.
* Relax, dress with confidence, and prepare to celebrate!
    `,
  },
  {
    slug: "animated-digital-envelopes-boost-rsvp",
    title: "How Animated Digital Envelopes Boost RSVP Turnout by 40%",
    excerpt:
      "Psychology reveals why interactive wax seals and virtual envelope liners trigger emotional delight, driving guests to confirm attendance within 24 hours.",
    coverImage:
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80",
    category: "RSVP Tips",
    readTime: "4 min read",
    publishedAt: "Oct 2026",
    featured: true,
    author: {
      name: "Julian Rivera",
      role: "Behavioral UX Researcher",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    },
    tags: ["RSVP Rate", "Animation", "Digital Stationery", "Guest Experience"],
    content: `
Traditional paper invitations often languish on kitchen counters, while plain calendar invite links get lost in crowded inboxes. However, modern animated digital stationery bridges the gap between tactile romance and instant mobile action.

### The Psychology of Tactile Digital Unboxing
When a guest receives an Eventizers link, they don't simply read text—they participate in a micro-ceremony:
1. **The Wax Seal Crack**: Tapping the personalized wax seal initiates a physical tactile response.
2. **The Smooth Flap Unfolding**: The envelope flap glides open, revealing customized patterned lining (from woodland gingham to gold foil damask).
3. **The Card Rise**: The custom typography card emerges with soft depth and ambient lighting reflections.

### Why Speed-to-Response Jumps 40%
Our analytics across 85,000+ gatherings show that emotional engagement directly dictates response velocity:
* **Dopamine at First Click**: Guests who experience interactive envelope physics are 3.2x more likely to RSVP *immediately* rather than closing the tab for later.
* **Frictionless Form Auto-fill**: Combining visual delight with single-tap RSVP forms reduces drop-off from 32% down to under 5%.
* **Mobile-First Orientation**: With 88% of invitations opened on mobile devices, responsive card physics feel as personal as a handwritten note delivered directly to their palm.
    `,
  },
  {
    slug: "curating-fall-gatherings-playlist-theme",
    title: "Curating the Perfect Playlist and Theme for Fall Gatherings",
    excerpt:
      "Pair warm terracotta palettes and cider bars with acoustic soul playlists to create an intimate autumnal vibe your guests will talk about all season.",
    coverImage:
      "https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=1200&q=80",
    category: "Design Trends",
    readTime: "6 min read",
    publishedAt: "Oct 2026",
    featured: true,
    author: {
      name: "Elena Rostova",
      role: "Creative Director & Stylist",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    },
    tags: ["Fall Entertaining", "Playlists", "Atmosphere", "Seasonal Decor"],
    content: `
Autumn entertaining is uniquely special: crisp air, amber sunsets, and a longing for warm, fireside intimacy. Curating an evening that feels both effortlessly relaxed and artfully elevated comes down to harmonizing sound, palette, and comfort.

### Harmonizing The Seasonal Color Palette
Step beyond conventional orange pumpkins and lean into rich, nuanced textures:
* **Earth & Spice**: Deep terracotta, toasted clove, dusty plum, and warm ecru linens.
* **Natural Textures**: Unfinished oak boards, hammered brass cutlery, dried wheat bundles, and smoked glassware.
* **Warm Amber Lighting**: Dimmable Edison bulbs coupled with beeswax tapers provide the golden glow that makes everyone look radiant.

### The Sound Architecture: Building the 3-Hour Arc
Music is the invisible host. Never shuffle randomly; design a thoughtful progression:
* **Arrivals & First Pour (Hours 1 - 1.5)**: Low-tempo acoustic folk, mellow bossa nova, and ambient neo-soul at 75-85 BPM.
* **Dinner & Shared Plates (Hour 1.5 - 2.5)**: Warm vintage jazz classics, indie soul, and French acoustic guitar.
* **Firepit & Digestifs (Hour 2.5+)**: Intimate unplugged covers, nostalgic vinyl records, and crackling wood warmth.

### Thoughtful Touchpoints
Set up a self-serve hot spiced cider and bourbon bar with cinnamon swizzle sticks, clove-studded oranges, and star anise. A seasonal interactive station encourages mingling before the main dinner begins.
    `,
  },
  {
    slug: "digital-invitation-etiquette-rules",
    title: "10 Digital Invitation Etiquette Rules Every Host Should Know",
    excerpt:
      "Master the timing of save-the-dates, plus-one policies, reminder cadence, and dietary surveys without overwhelming your guest list.",
    coverImage:
      "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1200&q=80",
    category: "Host Etiquette",
    readTime: "4 min read",
    publishedAt: "Sep 2026",
    featured: false,
    author: {
      name: "Marcus Reid",
      role: "Hospitality & Protocols Consultant",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    },
    tags: ["Etiquette", "Host Advice", "Communication", "Guest Protocol"],
    content: `
Digital invites have democratized event hosting, but with modern convenience comes modern responsibility. Here are the cardinal rules for modern hosts navigating digital invitations with elegance and tact.

### 1. Give Proper Lead Time
* Casual dinners & game nights: 10 to 14 days.
* Milestone birthdays & cocktail parties: 3 to 4 weeks.
* Weddings, galas & retreats: 8 to 12 weeks with save-the-dates 6 months prior.

### 2. Clarity on Plus-Ones
Never leave guests guessing whether they can bring a partner or children. Specify named guests clearly on the digital envelope or explicitly mention: "This invitation is for [Guest Name] + 1 Guest."

### 3. Respect Reminder Boundaries
Gentle digital reminders are invaluable, but excessive pings irritate guests. Limit automated reminders to:
1. Two weeks prior (for those who have not responded).
2. 48 hours prior (with address, parking, and dress code instructions for confirmed attendees).
    `,
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getFeaturedBlogs(): BlogPost[] {
  return BLOG_POSTS.filter((p) => p.featured).slice(0, 3);
}

export function getAllBlogCategories(): string[] {
  const cats = new Set(BLOG_POSTS.map((p) => p.category));
  return ["All", ...Array.from(cats)];
}
