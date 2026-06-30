import { Wand2, Send, BarChart3 } from "lucide-react";

const steps = [
  {
    icon: Wand2,
    accentColor: "#C9A84C",
    bgColor: "#FDF6E3",
    label: "Create",
    title: "Describe once, AI builds everything",
    body: "Describe your event and let AI build the page, invitation, RSVP questions, and reminder schedule in seconds.",
  },
  {
    icon: Send,
    accentColor: "#7A9E7E",
    bgColor: "#EEF4EE",
    label: "Invite",
    title: "Reach guests on every channel",
    body: "Send beautiful invitations over email, SMS, and WhatsApp with personalized greetings and one-click RSVP.",
  },
  {
    icon: BarChart3,
    accentColor: "#9070c0",
    bgColor: "#F2EEF9",
    label: "Manage",
    title: "Everything from one view",
    body: "Track RSVPs, check guests in with QR codes, manage registries, and monitor everything from one dashboard.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#C9A84C] mb-3">
            How Eventizers Works
          </p>
          <h2
            className="font-display text-4xl md:text-5xl font-bold text-[#2D1B3D] mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Create, Invite, Manage
          </h2>
          <p className="text-[#2D1B3D]/60 text-lg max-w-md mx-auto">
            Three effortless steps to a perfect event.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.label}
                className="rounded-2xl p-8 bg-white border border-[#E8C4B8]/20 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: step.bgColor }}
                  >
                    <Icon className="w-5 h-5" style={{ color: step.accentColor }} />
                  </div>
                  <div>
                    <span
                      className="text-xs font-bold uppercase tracking-widest"
                      style={{ color: step.accentColor }}
                    >
                      Step {idx + 1}
                    </span>
                    <h3
                      className="font-display text-xl font-semibold text-[#2D1B3D] mt-0.5 leading-tight"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {step.title}
                    </h3>
                  </div>
                </div>
                <p className="text-[#2D1B3D]/60 text-sm leading-relaxed">{step.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
