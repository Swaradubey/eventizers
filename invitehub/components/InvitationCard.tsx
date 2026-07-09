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
  if (normalized.includes("birthday")) return "bg-pink-500/25 border-pink-200/30 text-white";
  if (normalized.includes("wedding")) return "bg-purple-500/25 border-purple-200/30 text-white";
  if (normalized.includes("corporate")) return "bg-blue-500/25 border-blue-200/30 text-white";
  if (normalized.includes("dinner")) return "bg-amber-500/25 border-amber-200/30 text-white";
  if (normalized.includes("baby")) return "bg-emerald-500/25 border-emerald-200/30 text-white";
  if (normalized.includes("charity") || normalized.includes("gala")) return "bg-yellow-500/25 border-yellow-200/30 text-white";
  if (normalized.includes("music") || normalized.includes("live")) return "bg-fuchsia-500/25 border-fuchsia-200/30 text-white";
  if (normalized.includes("anniversary")) return "bg-rose-500/25 border-rose-200/30 text-white";
  return "bg-white/20 border-white/30 text-white";
};

const getButtonGradient = (type: string) => {
  const normalized = type.toLowerCase();
  if (normalized.includes("birthday")) return "bg-gradient-to-r from-[#e07090] to-[#c25070]";
  if (normalized.includes("wedding")) return "bg-gradient-to-r from-[#9070c0] to-[#7050a0]";
  if (normalized.includes("corporate")) return "bg-gradient-to-r from-[#4080b0] to-[#286088]";
  if (normalized.includes("dinner")) return "bg-gradient-to-r from-[#907030] to-[#705018]";
  if (normalized.includes("baby")) return "bg-gradient-to-r from-[#4a9a4a] to-[#337a33]";
  if (normalized.includes("charity") || normalized.includes("gala")) return "bg-gradient-to-r from-[#a07820] to-[#805e10]";
  if (normalized.includes("music") || normalized.includes("live")) return "bg-gradient-to-r from-[#9970d0] to-[#734aa6]";
  if (normalized.includes("anniversary")) return "bg-gradient-to-r from-[#c06840] to-[#a04b28]";
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
    <div className="group flex flex-col h-full w-full bg-white rounded-[24px] overflow-hidden cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/[0.04] transition-all duration-300 ease-out hover:-translate-y-[6px] hover:scale-[1.02] hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)]">
      {/* Card header / banner */}
      <div className="h-[260px] sm:h-[320px] w-full relative overflow-hidden select-none bg-neutral-100 flex items-center justify-center shrink-0">
        {showImage ? (
          <>
            <img 
              src={imgSrc} 
              alt={title}
              onError={() => setImageError(true)}
              className="absolute inset-0 transition-all duration-500 ease-out group-hover:scale-105 group-hover:brightness-105" 
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center center' }}
            />
            {/* Subtle dark gradient overlay top-to-bottom for badge readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/5 to-transparent pointer-events-none transition-opacity duration-500" />
            
            {/* Subtle color-dodge overlay glow using accentColor */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none mix-blend-color-dodge"
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
            className={`text-[11px] font-bold uppercase tracking-[0.15em] px-3.5 py-1.5 rounded-full backdrop-blur-md border shadow-sm transition-colors duration-300 flex items-center gap-1.5 ${getCategoryBadgeStyles(type)}`}
          >
            {type}
          </span>
        </div>
      </div>

      {/* Thin Divider Line */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-200 to-transparent relative z-10" />

      {/* Card body */}
      <div className="p-4 sm:p-5 flex flex-col gap-3 flex-1 relative z-10 bg-white">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#2D1B3D]/50">
            You&apos;re invited to
          </p>
          <h3
            className="font-display text-[20px] sm:text-[22px] font-extrabold text-[#2D1B3D] leading-[1.2] group-hover:text-[#4A2D6B] transition-colors duration-300"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {title}
          </h3>
        </div>

        {/* Metadata section */}
        <div className="flex flex-col gap-2 my-0">
          <div className="flex items-center gap-2.5 text-[13px] sm:text-[14px] text-[#2D1B3D]/75 font-medium">
            <Calendar className="w-[16px] h-[16px] shrink-0" style={{ color: accentColor }} strokeWidth={2} />
            <span className="truncate pt-[1px]">{date}</span>
          </div>
          <div className="flex items-center gap-2.5 text-[13px] sm:text-[14px] text-[#2D1B3D]/75 font-medium">
            <Clock className="w-[16px] h-[16px] shrink-0" style={{ color: accentColor }} strokeWidth={2} />
            <span className="truncate pt-[1px]">{time}</span>
          </div>
          {venue && (
            <div className="flex items-center gap-2.5 text-[13px] sm:text-[14px] text-[#2D1B3D]/75 font-medium">
              <MapPin className="w-[16px] h-[16px] shrink-0" style={{ color: accentColor }} strokeWidth={2} />
              <span className="truncate pt-[1px]" title={venue}>{venue}</span>
            </div>
          )}
          <div className="flex items-center gap-2.5 text-[13px] sm:text-[14px] text-[#2D1B3D]/75 font-medium">
            <Users className="w-[16px] h-[16px] shrink-0" style={{ color: accentColor }} strokeWidth={2} />
            <span className="truncate pt-[1px]" title={host}>{host}</span>
          </div>
        </div>

        {/* RSVP button */}
        <button
          className={`mt-auto w-full py-2.5 sm:py-3 rounded-xl text-[13px] tracking-wide font-bold text-white shadow-md rsvp-button-custom ${getButtonGradient(type)}`}
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

