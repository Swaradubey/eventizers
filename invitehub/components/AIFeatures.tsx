import { CheckCircle2 } from "lucide-react";

const features = [
  "Event Page",
  "Invitation Copy",
  "Email Invite",
  "SMS Invite",
  "Reminder Schedule",
  "RSVP Questions",
  "Registry Suggestions",
  "Venue Suggestions",
];

const previewCards = [
  {
    type: "Charity Gala",
    title: "Bright Futures Gala",
    date: "Nov 15 · 8:00 PM · Grand Ballroom",
    host: "Bright Futures Foundation",
    gradient: "linear-gradient(135deg, #c9a84c 0%, #a07820 100%)",
    emoji: "✨",
  },
  {
    type: "Dinner Party",
    title: "Supper Club No. 7",
    date: "Fri, May 30 · 7:30 PM",
    host: "Hosted by Chef Amara",
    gradient: "linear-gradient(135deg, #d4c8a0 0%, #c0b080 100%)",
    emoji: "🍽️",
  },
];

export default function AIFeatures() {
  return (
    <section className="py-24 bg-[#2D1B3D] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: text */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#C9A84C] mb-4">
              AI Event Creation
            </p>
            <h2
              className="font-display text-3xl md:text-3xl font-bold text-[#FAF8F5] mb-6 leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Everything generated
              <br />
              <span className="italic text-[#E8C4B8]">in seconds</span>
            </h2>
            <p className="text-[#FAF8F5]/60 text-lg mb-8 leading-relaxed">
              Describe your event once. Our AI instantly produces a complete, ready-to-send event — copy, design, schedule, and questions included.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {features.map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#7A9E7E] shrink-0" />
                  <span className="text-sm text-[#FAF8F5]/70">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: floating preview cards */}
          <div className="relative flex items-center justify-center min-h-[360px]">
            {previewCards.map((card, i) => (
              <div
                key={card.title}
                className={`invite-card absolute w-56 shadow-2xl ${i === 0
                  ? "rotate-[-4deg] left-4 top-4"
                  : "rotate-[5deg] right-4 top-16"
                  }`}
                style={{ zIndex: i === 0 ? 2 : 1 }}
              >
                <div
                  className="h-24 flex items-center justify-center"
                  style={{ background: card.gradient }}
                >
                  <span className="text-5xl">{card.emoji}</span>
                </div>
                <div className="p-4 bg-white">
                  <p className="text-[9px] uppercase tracking-widest text-[#2D1B3D]/40 mb-0.5">
                    {card.type}
                  </p>
                  <p
                    className="font-display text-base font-semibold text-[#2D1B3D] leading-tight mb-1"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {card.title}
                  </p>
                  <p className="text-[10px] text-[#2D1B3D]/50">{card.date}</p>
                  <p className="text-[10px] text-[#2D1B3D]/40">{card.host}</p>
                </div>
              </div>
            ))}
            <p className="absolute bottom-0 text-center text-xs text-[#FAF8F5]/30 w-full">
              AI designed these in seconds
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
