import { useState } from "react";
import { Calendar, Clock, MapPin, Users } from "lucide-react";

interface InvitationCardProps {
  type: string;
  title: string;
  date: string;
  time: string;
  host: string;
  venue?: string;
  gradient: string;
  accentColor: string;
  emoji: string;
  image?: string | any;
  size?: "sm" | "md" | "lg";
}

const getCategoryBadgeStyles = (type: string) => {
  const normalized = type.toLowerCase();
  if (normalized.includes("birthday")) {
    return "bg-gradient-to-r from-pink-500/25 to-rose-500/35 border-pink-200/20";
  }
  if (normalized.includes("wedding")) {
    return "bg-gradient-to-r from-purple-500/25 to-indigo-500/35 border-purple-200/20";
  }
  if (normalized.includes("corporate")) {
    return "bg-gradient-to-r from-blue-500/25 to-indigo-600/35 border-blue-200/20";
  }
  if (normalized.includes("dinner")) {
    return "bg-gradient-to-r from-amber-500/25 to-yellow-600/35 border-amber-200/20";
  }
  if (normalized.includes("baby")) {
    return "bg-gradient-to-r from-emerald-500/20 to-teal-500/30 border-emerald-200/20";
  }
  if (normalized.includes("charity") || normalized.includes("gala")) {
    return "bg-gradient-to-r from-yellow-500/25 to-amber-600/35 border-yellow-200/20";
  }
  if (normalized.includes("music") || normalized.includes("live")) {
    return "bg-gradient-to-r from-violet-500/25 to-fuchsia-600/35 border-violet-200/20";
  }
  if (normalized.includes("anniversary")) {
    return "bg-gradient-to-r from-orange-500/25 to-rose-500/35 border-orange-200/20";
  }
  return "bg-white/20 border-white/20";
};

const getButtonGradient = (type: string) => {
  const normalized = type.toLowerCase();
  if (normalized.includes("birthday")) {
    return "bg-gradient-to-r from-[#e07090] to-[#c25070]";
  }
  if (normalized.includes("wedding")) {
    return "bg-gradient-to-r from-[#9070c0] to-[#7050a0]";
  }
  if (normalized.includes("corporate")) {
    return "bg-gradient-to-r from-[#4080b0] to-[#286088]";
  }
  if (normalized.includes("dinner")) {
    return "bg-gradient-to-r from-[#907030] to-[#705018]";
  }
  if (normalized.includes("baby")) {
    return "bg-gradient-to-r from-[#4a9a4a] to-[#337a33]";
  }
  if (normalized.includes("charity") || normalized.includes("gala")) {
    return "bg-gradient-to-r from-[#a07820] to-[#805e10]";
  }
  if (normalized.includes("music") || normalized.includes("live")) {
    return "bg-gradient-to-r from-[#9970d0] to-[#734aa6]";
  }
  if (normalized.includes("anniversary")) {
    return "bg-gradient-to-r from-[#c06840] to-[#a04b28]";
  }
  return "bg-gradient-to-r from-[#2D1B3D] to-[#1A1118]";
};

export default function InvitationCard({
  type,
  title,
  date,
  time,
  host,
  venue,
  gradient,
  accentColor,
  emoji,
  image,
  size = "md",
}: InvitationCardProps) {
  const [imageError, setImageError] = useState(false);

  const showImage = image && !imageError;
  const imgSrc = typeof image === 'string' ? image : image?.src;

  return (
    <div className="premium-invite-card group flex flex-col h-full w-full">
      {/* Card header / banner */}
      <div className="h-40 flex items-center justify-center relative overflow-hidden select-none">
        {showImage ? (
          <>
            <img 
              src={imgSrc} 
              alt={title}
              onError={() => setImageError(true)}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" 
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            {/* Rich gradient overlay for premium look & readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#2D1B3D]/75 via-[#2D1B3D]/25 to-black/35 pointer-events-none transition-opacity duration-350 group-hover:opacity-90" />
            
            {/* Subtle color-dodge overlay glow using accentColor */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none mix-blend-color-dodge"
              style={{
                background: `radial-gradient(circle at center, ${accentColor} 0%, transparent 70%)`
              }}
            />
          </>
        ) : (
          <>
            {/* Background gradient container that scales on hover */}
            <div 
              className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-105" 
              style={{ background: gradient }}
            />
            
            {/* Glossy overlays */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/30 mix-blend-overlay pointer-events-none" />
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* Floating Emoji */}
            <span 
              className="text-6xl relative z-10 transform transition-transform duration-500 ease-out group-hover:scale-110 drop-shadow-sm" 
              role="img" 
              aria-label={type}
            >
              {emoji}
            </span>
          </>
        )}

        {/* Category Glass Badge */}
        <div className="absolute top-4 left-4 z-10">
          <span
            className={`text-[10px] font-bold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full backdrop-blur-md text-white border shadow-[0_2px_8px_rgba(0,0,0,0.15)] transition-colors duration-300 ${getCategoryBadgeStyles(type)}`}
          >
            {type}
          </span>
        </div>
      </div>

      {/* Thin Gold Gradient Divider Line */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#C9A84C]/25 to-transparent relative z-10" />

      {/* Card body */}
      <div className="p-6 flex flex-col gap-4 flex-1 relative z-10 bg-white/10">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#2D1B3D]/40 mb-1.5">
            You&apos;re invited to
          </p>
          <h3
            className="font-display text-xl font-bold text-[#2D1B3D] leading-[1.25] group-hover:text-[#4A2D6B] transition-colors duration-300"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {title}
          </h3>
        </div>

        {/* Metadata section */}
        <div className="flex flex-col gap-2.5 my-1">
          <div className="flex items-center gap-3 text-[15px] text-[#2D1B3D]/65 leading-relaxed font-medium">
            <Calendar className="w-[18px] h-[18px] shrink-0 opacity-85" style={{ color: accentColor }} />
            <span className="truncate">{date}</span>
          </div>
          <div className="flex items-center gap-3 text-[15px] text-[#2D1B3D]/65 leading-relaxed font-medium">
            <Clock className="w-[18px] h-[18px] shrink-0 opacity-85" style={{ color: accentColor }} />
            <span className="truncate">{time}</span>
          </div>
          {venue && (
            <div className="flex items-center gap-3 text-[15px] text-[#2D1B3D]/65 leading-relaxed font-medium">
              <MapPin className="w-[18px] h-[18px] shrink-0 opacity-85" style={{ color: accentColor }} />
              <span className="truncate" title={venue}>{venue}</span>
            </div>
          )}
          <div className="flex items-center gap-3 text-[15px] text-[#2D1B3D]/65 leading-relaxed font-medium">
            <Users className="w-[18px] h-[18px] shrink-0 opacity-85" style={{ color: accentColor }} />
            <span className="truncate" title={host}>{host}</span>
          </div>
        </div>

        {/* RSVP button */}
        <button
          className={`mt-auto w-full py-3 rounded-[16px] text-xs font-bold text-white shadow-md rsvp-button-custom ${getButtonGradient(type)}`}
          style={{ 
            '--accent-color': accentColor, 
            '--accent-glow': `${accentColor}40` 
          } as React.CSSProperties}
        >
          RSVP Now
        </button>
      </div>
    </div>
  );
}

