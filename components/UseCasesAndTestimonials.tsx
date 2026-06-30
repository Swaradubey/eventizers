const useCases = [
  {
    title: "Consumers",
    desc: "Birthdays, weddings, dinners, and personal celebrations.",
    emoji: "🎉",
  },
  {
    title: "Businesses",
    desc: "Conferences, launches, networking, and team events.",
    emoji: "🏢",
  },
  {
    title: "Nonprofits",
    desc: "Fundraisers, galas, donation drives, and community events.",
    emoji: "🤝",
  },
  {
    title: "Enterprises",
    desc: "Multi-team events with SSO, approvals, and analytics.",
    emoji: "⚡",
  },
];

const testimonials = [
  {
    quote:
      "We planned our entire product launch in under an hour. The AI handled invitations, reminders, and check-in flawlessly.",
    name: "Sarah Chen",
    role: "Head of Events, Northwind",
    avatar: "SC",
    color: "#4080b0",
  },
  {
    quote:
      "The attendance guarantee changed everything. No-shows dropped by 60% and our catering waste is finally under control.",
    name: "Marcus Reid",
    role: "Founder, GatherWell",
    avatar: "MR",
    color: "#7A9E7E",
  },
  {
    quote:
      "It feels like Stripe and Apple had a baby. Our donors love how effortless RSVPs and registries are.",
    name: "Priya Nair",
    role: "Director, Bright Futures Foundation",
    avatar: "PN",
    color: "#C9A84C",
  },
];

export default function UseCasesAndTestimonials() {
  return (
    <>
      {/* Use cases */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2
              className="font-display text-4xl md:text-5xl font-bold text-[#2D1B3D]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Built for every kind of event
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {useCases.map((uc) => (
              <div
                key={uc.title}
                className="p-6 rounded-2xl border border-[#E8C4B8]/30 hover:border-[#C9A84C]/30 hover:shadow-md transition-all group cursor-pointer"
              >
                <span className="text-3xl block mb-3 group-hover:scale-110 transition-transform">
                  {uc.emoji}
                </span>
                <h3
                  className="font-display text-lg font-semibold text-[#2D1B3D] mb-1"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {uc.title}
                </h3>
                <p className="text-sm text-[#2D1B3D]/50">{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#C9A84C] mb-3">
              Loved by hosts everywhere
            </p>
            <h2
              className="font-display text-4xl md:text-5xl font-bold text-[#2D1B3D]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              What our hosts say
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-white rounded-2xl p-7 border border-[#E8C4B8]/20 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-[#C9A84C] text-sm">★</span>
                  ))}
                </div>
                <p className="text-[#2D1B3D]/75 text-sm leading-relaxed mb-5 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: t.color }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#2D1B3D]">{t.name}</p>
                    <p className="text-xs text-[#2D1B3D]/40">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
