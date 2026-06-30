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
  size?: "sm" | "md" | "lg";
}

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
  size = "md",
}: InvitationCardProps) {
  const sizeClasses = {
    sm: "w-52",
    md: "w-64",
    lg: "w-72",
  };

  return (
    <div
      className={`invite-card card-border-gold flex flex-col ${sizeClasses[size]} shrink-0`}
    >
      {/* Card header / banner */}
      <div
        className="h-28 flex items-center justify-center relative overflow-hidden"
        style={{ background: gradient }}
      >
        <span className="text-5xl" role="img" aria-label={type}>
          {emoji}
        </span>
        <div className="absolute top-3 left-3">
          <span
            className="text-[10px] font-semibold uppercase tracking-widest px-2 py-1 rounded-full"
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              color: "white",
              backdropFilter: "blur(4px)",
            }}
          >
            {type}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest text-[#2D1B3D]/40 mb-1">
            You&apos;re invited to
          </p>
          <h3
            className="font-display text-lg font-semibold text-[#2D1B3D] leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {title}
          </h3>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-[11px] text-[#2D1B3D]/60">
            <Calendar className="w-3 h-3 shrink-0" style={{ color: accentColor }} />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#2D1B3D]/60">
            <Clock className="w-3 h-3 shrink-0" style={{ color: accentColor }} />
            <span>{time}</span>
          </div>
          {venue && (
            <div className="flex items-center gap-1.5 text-[11px] text-[#2D1B3D]/60">
              <MapPin className="w-3 h-3 shrink-0" style={{ color: accentColor }} />
              <span className="truncate">{venue}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-[11px] text-[#2D1B3D]/60">
            <Users className="w-3 h-3 shrink-0" style={{ color: accentColor }} />
            <span>{host}</span>
          </div>
        </div>

        <button
          className="mt-auto w-full py-2 rounded-full text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-95"
          style={{ backgroundColor: accentColor }}
        >
          RSVP Now
        </button>
      </div>
    </div>
  );
}
