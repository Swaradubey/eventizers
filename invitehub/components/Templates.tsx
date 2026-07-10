"use client";

import { motion, useReducedMotion } from "framer-motion";
import InvitationCard from "./InvitationCard";

const cards = [
  {
    type: "Birthday",
    title: "Maya's 5th Birthday",
    date: "Sat, June 14",
    time: "2:00 PM",
    host: "Hosted by The Patels",
    gradient: "linear-gradient(135deg, #f9c5d1 0%, #f5a7b8 100%)",
    accentColor: "#e07090",
    emoji: "🎂",
    image: "/assets/templates/birthday.jpg",
  },
  {
    type: "Wedding",
    title: "Liam & Sofia",
    date: "Sept 21",
    time: "5:00 PM",
    host: "Together with their families",
    venue: "Vineyard Estate",
    gradient: "linear-gradient(135deg, #d4b8e8 0%, #b8a0d4 100%)",
    accentColor: "#9070c0",
    emoji: "💍",
    image: "/assets/templates/wedding.jpg",
  },
  {
    type: "Corporate",
    title: "Annual Product Launch",
    date: "Oct 3",
    time: "6:30 PM",
    host: "Northwind Technologies",
    venue: "The Innovation Hub",
    gradient: "linear-gradient(135deg, #a8c8e8 0%, #80a8d0 100%)",
    accentColor: "#4080b0",
    emoji: "🚀",
    image: "/assets/templates/corporate.jpg",
  },
  {
    type: "Dinner Party",
    title: "Supper Club No. 7",
    date: "Fri, May 30",
    time: "7:30 PM",
    host: "Hosted by Chef Amara",
    gradient: "linear-gradient(135deg, #d4c8a0 0%, #c0b080 100%)",
    accentColor: "#907030",
    emoji: "🍽️",
    image: "/assets/templates/dinner.jpg",
  },
  {
    type: "Baby Shower",
    title: "A Little One is Coming",
    date: "Aug 9",
    time: "12:00 PM",
    host: "Celebrating Baby Reyes",
    venue: "Garden Terrace",
    gradient: "linear-gradient(135deg, #c8e8c8 0%, #a8d0a8 100%)",
    accentColor: "#4a9a4a",
    emoji: "🍼",
    image: "/assets/templates/babyshower.jpg",
  },
  {
    type: "Charity Gala",
    title: "Bright Futures Gala",
    date: "Nov 15",
    time: "8:00 PM",
    host: "Bright Futures Foundation",
    venue: "Grand Ballroom",
    gradient: "linear-gradient(135deg, #c9a84c 0%, #a07820 100%)",
    accentColor: "#a07820",
    emoji: "✨",
    image: "/assets/templates/gala.jpg",
  },
  {
    type: "Live Music",
    title: "Rooftop Sessions",
    date: "July 12",
    time: "9:00 PM",
    host: "Presented by Echo Collective",
    venue: "Skyline Loft",
    gradient: "linear-gradient(135deg, #2D1B3D 0%, #4a2a6a 100%)",
    accentColor: "#9970d0",
    emoji: "🎵",
    image: "/assets/templates/music.jpg",
  },
  {
    type: "Anniversary",
    title: "25 Years Together",
    date: "Dec 6",
    time: "6:00 PM",
    host: "Celebrating James & Elena",
    venue: "Lakeside Manor",
    gradient: "linear-gradient(135deg, #e8c4b8 0%, #d0a090 100%)",
    accentColor: "#c06840",
    emoji: "🥂",
    image: "/assets/templates/anniversary.jpg",
  },
  {
    type: "Graduation",
    title: "Graduation Gala",
    date: "Fri, June 19",
    time: "7:00 PM",
    host: "Hosted by The Office of the Dean",
    venue: "University Grand Hall",
    gradient: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
    accentColor: "#d4af37",
    emoji: "🎓",
    image: "/assets/templates/graduation_gala.jpg",
  },
  {
    type: "Community",
    title: "Community Meetup",
    date: "Sat, May 16",
    time: "3:00 PM",
    host: "Oakwood Neighborhood",
    venue: "Oakwood Community Park",
    gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    accentColor: "#11998e",
    emoji: "🏡",
    image: "/assets/templates/community_meetup.jpg",
  },
  {
    type: "Networking",
    title: "Professional Networking",
    date: "Thu, Oct 15",
    time: "6:30 PM",
    host: "Metro Business Alliance",
    venue: "The Summit Boardroom",
    gradient: "linear-gradient(135deg, #2b5876 0%, #4e4376 100%)",
    accentColor: "#6f86d6",
    emoji: "🤝",
    image: "/assets/templates/networking_professional.jpg",
  },
];

const Sparkle = ({ className }: { className: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M12 3C12 3 13.5 8.5 16 11C18.5 13.5 24 15 24 15C24 15 18.5 16.5 16 19C13.5 21.5 12 27 12 27C12 27 10.5 21.5 8 19C5.5 16.5 0 15 0 15C0 15 5.5 13.5 8 11C10.5 8.5 12 3 12 3Z" 
      fill="currentColor"
    />
  </svg>
);

export default function Templates() {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const cardVariants = {
    hidden: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const headerVariants = {
    hidden: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <section id="templates" className="templates-section py-[70px] md:py-[120px] relative overflow-hidden">
      {/* Floating Sparkles in the background */}
      <Sparkle className="floating-sparkle top-12 left-10 w-4 h-4 select-none" />
      <Sparkle className="floating-sparkle-2 top-[20%] right-12 w-6 h-6 select-none" />
      <Sparkle className="floating-sparkle-3 bottom-24 left-16 w-5 h-5 select-none" />
      <Sparkle className="floating-sparkle bottom-[35%] right-[20%] w-4 h-4 select-none" />
      <Sparkle className="floating-sparkle-2 top-[40%] left-[15%] w-3 h-3 select-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Animated Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={headerVariants}
          className="text-center mb-16 flex flex-col items-center relative z-10"
        >
          {/* Glass Badge */}
          <div className="premium-glass-badge mb-5 select-none">
            ✨ Hundreds of designs
          </div>
          
          <h2
            className="font-display text-4xl sm:text-5xl lg:text-[56px] xl:text-[64px] font-bold text-[#2D1B3D] tracking-tight leading-[1.1] max-w-3xl"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Invitations your guests will love
          </h2>
          
          <p className="text-[#2D1B3D]/70 text-lg md:text-xl max-w-[700px] mx-auto leading-relaxed mt-5">
            Pick a stunning design for any occasion, then customize every detail — or let AI design one for you.
          </p>
        </motion.div>

        {/* Responsive Templates Layout Grid / Carousel */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10"
        >
          {cards.map((card) => (
            <motion.div
              key={card.title}
              variants={cardVariants}
              className="w-full flex flex-col"
            >
              <InvitationCard {...card} />
            </motion.div>
          ))}
        </motion.div>

        {/* Polished Bottom CTA Button */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={headerVariants}
          className="text-center mt-12 relative z-10"
        >
          <button className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#2D1B3D] text-white hover:bg-[#3D2555] text-sm font-semibold transition-all shadow-[0_4px_14px_rgba(45,27,61,0.15)] hover:shadow-[0_6px_20px_rgba(45,27,61,0.25)] hover:-translate-y-0.5 active:translate-y-0 active:scale-98">
            Browse all templates
          </button>
        </motion.div>

      </div>
    </section>
  );
}

