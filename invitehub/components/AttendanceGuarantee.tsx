import { CalendarCheck, MapPin, Clock, Handshake } from "lucide-react";

const steps = [
  {
    icon: CalendarCheck,
    title: "RSVP Deadline",
    body: "Guests confirm before the cutoff date.",
    color: "#C9A84C",
  },
  {
    icon: MapPin,
    title: "Attendance Confirmation",
    body: "GPS check-in verifies who actually arrives.",
    color: "#7A9E7E",
  },
  {
    icon: Clock,
    title: "Host Review Window",
    body: "Review no-shows for up to 7 days after.",
    color: "#9070c0",
  },
  {
    icon: Handshake,
    title: "Charge or Waive",
    body: "Decide how to handle each no-show fairly.",
    color: "#e07090",
  },
];

export default function AttendanceGuarantee() {
  return (
    <section className="py-24 bg-[#FAF8F5]">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#C9A84C] mb-3">
            Reduce no-shows with confidence
          </p>
          <h2
            className="font-display text-4xl md:text-5xl font-bold text-[#2D1B3D] mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            A fair flow that respects everyone
          </h2>
          <p className="text-[#2D1B3D]/60 text-lg max-w-lg mx-auto">
            Transparent attendance tracking that respects guests while protecting your resources.
          </p>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div className="absolute top-8 left-[calc(12.5%-1px)] right-[calc(12.5%-1px)] h-0.5 bg-gradient-to-r from-[#C9A84C] via-[#E8C4B8] to-[#9070c0] hidden md:block" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="flex flex-col items-center text-center">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-4 relative z-10 shadow-md"
                    style={{ backgroundColor: `${step.color}18`, border: `2px solid ${step.color}30` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: step.color }} />
                    <span
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                      style={{ backgroundColor: step.color }}
                    >
                      {idx + 1}
                    </span>
                  </div>
                  <h3
                    className="font-display text-base font-semibold text-[#2D1B3D] mb-1"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-xs text-[#2D1B3D]/50 leading-relaxed">{step.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
