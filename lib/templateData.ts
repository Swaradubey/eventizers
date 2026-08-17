import { NEW_TEMPLATES_CARD_ITEMS } from "./newTemplatesData";

export interface TemplateItem {
  id: string;
  type: string;
  category: string;
  title: string;
  subtitle?: string;
  date: string;
  time: string;
  host: string;
  venue?: string;
  gradient: string;
  accentColor: string;
  emoji: string;
  image: string;
  description?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonColor?: string;
  buttonText?: string;
  gallery?: string[];
  sections?: { title: string; content: string }[];
}

export const ORIGINAL_TEMPLATE_CARDS: TemplateItem[] = [
  {
    id: "tpl-birthday-maya",
    type: "Birthday",
    category: "Birthday",
    title: "Maya's 5th Birthday",
    subtitle: "Hosted by The Patels",
    date: "Sat, June 14",
    time: "2:00 PM",
    host: "Hosted by The Patels",
    venue: "Sweet Retreat Bakery",
    gradient: "linear-gradient(135deg, #f9c5d1 0%, #f5a7b8 100%)",
    accentColor: "#e07090",
    emoji: "🎂",
    image: "/assets/templates/birthday.jpg",
    description: "Come celebrate Maya's 5th birthday with cupcakes, games, and lots of fun!",
  },
  {
    id: "tpl-wedding-liam",
    type: "Wedding",
    category: "Wedding",
    title: "Liam & Sofia",
    subtitle: "Together with their families",
    date: "Sept 21",
    time: "5:00 PM",
    host: "Together with their families",
    venue: "Vineyard Estate",
    gradient: "linear-gradient(135deg, #d4b8e8 0%, #b8a0d4 100%)",
    accentColor: "#9070c0",
    emoji: "💍",
    image: "/assets/templates/wedding.jpg",
    description: "Join us in celebrating the love and marriage of Liam and Sofia.",
  },
  {
    id: "tpl-corporate-launch",
    type: "Corporate",
    category: "Corporate",
    title: "Annual Product Launch",
    subtitle: "Northwind Technologies",
    date: "Oct 3",
    time: "6:30 PM",
    host: "Northwind Technologies",
    venue: "The Innovation Hub",
    gradient: "linear-gradient(135deg, #a8c8e8 0%, #80a8d0 100%)",
    accentColor: "#4080b0",
    emoji: "🚀",
    image: "/assets/templates/corporate.jpg",
    description: "Be the first to see our next generation of software products and network with industry leaders.",
  },
  {
    id: "tpl-dinner-party",
    type: "Private Dinner",
    category: "Private Dinner",
    title: "Supper Club No. 7",
    subtitle: "Hosted by Chef Amara",
    date: "Fri, May 30",
    time: "7:30 PM",
    host: "Hosted by Chef Amara",
    venue: "Chef's Table Lounge",
    gradient: "linear-gradient(135deg, #d4c8a0 0%, #c0b080 100%)",
    accentColor: "#907030",
    emoji: "🍽️",
    image: "/assets/templates/dinner.jpg",
    description: "An intimate evening of gourmet dining, fine wine, and great conversation.",
  },
  {
    id: "tpl-baby-shower",
    type: "Baby Shower",
    category: "Baby Shower",
    title: "A Little One is Coming",
    subtitle: "Celebrating Baby Reyes",
    date: "Aug 9",
    time: "12:00 PM",
    host: "Celebrating Baby Reyes",
    venue: "Garden Terrace",
    gradient: "linear-gradient(135deg, #c8e8c8 0%, #a8d0a8 100%)",
    accentColor: "#4a9a4a",
    emoji: "🍼",
    image: "/assets/templates/babyshower.jpg",
    description: "A sweet baby shower to celebrate the upcoming arrival of the new baby!",
  },
  {
    id: "tpl-charity-gala",
    type: "Fundraiser",
    category: "Fundraiser",
    title: "Bright Futures Gala",
    subtitle: "Bright Futures Foundation",
    date: "Nov 15",
    time: "8:00 PM",
    host: "Bright Futures Foundation",
    venue: "Grand Ballroom",
    gradient: "linear-gradient(135deg, #c9a84c 0%, #a07820 100%)",
    accentColor: "#a07820",
    emoji: "✨",
    image: "/assets/templates/gala.jpg",
    description: "An elegant charity gala raising funds for education and youth empowerment.",
  },
  {
    id: "tpl-live-music",
    type: "Community",
    category: "Community",
    title: "Rooftop Sessions",
    subtitle: "Presented by Echo Collective",
    date: "July 12",
    time: "9:00 PM",
    host: "Presented by Echo Collective",
    venue: "Skyline Loft",
    gradient: "linear-gradient(135deg, #2D1B3D 0%, #4a2a6a 100%)",
    accentColor: "#9970d0",
    emoji: "🎵",
    image: "/assets/templates/music.jpg",
    description: "An evening of live music, delicious drinks, and views of the city skyline.",
  },
  {
    id: "tpl-anniversary-james",
    type: "Private Dinner",
    category: "Private Dinner",
    title: "25 Years Together",
    subtitle: "Celebrating James & Elena",
    date: "Dec 6",
    time: "6:00 PM",
    host: "Celebrating James & Elena",
    venue: "Lakeside Manor",
    gradient: "linear-gradient(135deg, #e8c4b8 0%, #d0a090 100%)",
    accentColor: "#c06840",
    emoji: "🥂",
    image: "/assets/templates/anniversary.jpg",
    description: "Please join us in celebrating the 25th wedding anniversary of James and Elena.",
  },
  {
    id: "tpl-grad-gala",
    type: "Graduation",
    category: "Graduation",
    title: "Graduation Gala",
    subtitle: "Hosted by The Office of the Dean",
    date: "Fri, June 19",
    time: "7:00 PM",
    host: "Hosted by The Office of the Dean",
    venue: "University Grand Hall",
    gradient: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
    accentColor: "#d4af37",
    emoji: "🎓",
    image: "/assets/templates/graduation_gala.jpg",
    description: "Join us for an elegant evening of celebration and dining to honor our graduating class.",
  },
  {
    id: "tpl-comm-meetup",
    type: "Community",
    category: "Community",
    title: "Community Meetup",
    subtitle: "Oakwood Neighborhood",
    date: "Sat, May 16",
    time: "3:00 PM",
    host: "Oakwood Neighborhood",
    venue: "Oakwood Community Park",
    gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    accentColor: "#11998e",
    emoji: "🏡",
    image: "/assets/templates/community_meetup.jpg",
    description: "Gather with friends, neighbors, and local community members for a fun afternoon.",
  },
  {
    id: "tpl-net-professional",
    type: "Networking",
    category: "Networking",
    title: "Professional Networking",
    subtitle: "Metro Business Alliance",
    date: "Thu, Oct 15",
    time: "6:30 PM",
    host: "Metro Business Alliance",
    venue: "The Summit Boardroom",
    gradient: "linear-gradient(135deg, #2b5876 0%, #4e4376 100%)",
    accentColor: "#6f86d6",
    emoji: "🤝",
    image: "/assets/templates/networking_professional.jpg",
    description: "Connect with industry professionals, share insights, and expand your career network.",
  },
];

export const templateCards: TemplateItem[] = [
  ...ORIGINAL_TEMPLATE_CARDS,
  ...NEW_TEMPLATES_CARD_ITEMS
];

export const matchesCategory = (itemCategory: string, selectedCategory: string): boolean => {
  if (selectedCategory === "All") return true;
  const target = selectedCategory.toLowerCase();
  const cat = (itemCategory || "").toLowerCase();

  if (target === "private dinner") {
    return cat.includes("private dinner") || cat.includes("dinner party") || cat.includes("dinner");
  }
  if (target === "fundraiser") {
    return cat.includes("fundraiser") || cat.includes("charity") || cat.includes("gala");
  }
  if (target === "baby shower") {
    return cat.includes("baby shower") || cat.includes("baby");
  }
  if (target === "corporate") {
    return cat.includes("corporate") || cat.includes("conference") || cat.includes("business");
  }
  if (target === "community") {
    return cat.includes("community") || cat.includes("live music") || cat.includes("meetup");
  }

  return cat.includes(target) || target.includes(cat);
};
