"use client";

import { useState } from "react";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: { monthly: 0, annual: 0 },
    desc: "Perfect for small personal events",
    color: "#7A9E7E",
    features: [
      "Up to 3 events/year",
      "25 guests per event",
      "Basic invitation templates",
      "Email invitations",
      "RSVP tracking",
    ],
    cta: "Get Started Free",
    highlight: false,
  },
  {
    name: "Host",
    price: { monthly: 14, annual: 10 },
    desc: "For frequent hosts and small gatherings",
    color: "#C9A84C",
    features: [
      "Unlimited events",
      "200 guests per event",
      "All invitation templates",
      "Email + SMS invites",
      "QR code check-in",
      "Reminder automation",
      "Attendance guarantee",
    ],
    cta: "Start Free Trial",
    highlight: true,
  },
  {
    name: "Pro",
    price: { monthly: 39, annual: 29 },
    desc: "For businesses and power event planners",
    color: "#9070c0",
    features: [
      "Everything in Host",
      "Unlimited guests",
      "WhatsApp invitations",
      "Custom branding & domain",
      "AI event generation",
      "Advanced analytics",
      "Priority support",
    ],
    cta: "Start Free Trial",
    highlight: false,
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(true);

  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#C9A84C] mb-3">
            Plans for everyone
          </p>
          <h2
            className="font-display text-4xl md:text-5xl font-bold text-[#2D1B3D] mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Pricing that fits how you gather
          </h2>
          <p className="text-[#2D1B3D]/60 text-lg mb-8">
            Whether you&apos;re planning a birthday, a company offsite, or a nonprofit gala — there&apos;s a plan built for you.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 bg-[#F0EBE8] rounded-full p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                !annual ? "bg-white text-[#2D1B3D] shadow-sm" : "text-[#2D1B3D]/50"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                annual ? "bg-white text-[#2D1B3D] shadow-sm" : "text-[#2D1B3D]/50"
              }`}
            >
              Annual
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#7A9E7E] text-white font-bold">
                −28%
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-7 border transition-all ${
                plan.highlight
                  ? "border-[#C9A84C]/40 shadow-xl scale-[1.02] bg-[#2D1B3D] text-white"
                  : "border-[#E8C4B8]/30 shadow-sm bg-white hover:shadow-md"
              }`}
            >
              {plan.highlight && (
                <div className="inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[#C9A84C] text-[#2D1B3D] mb-4">
                  Most Popular
                </div>
              )}
              <h3
                className={`font-display text-2xl font-bold mb-1 ${plan.highlight ? "text-white" : "text-[#2D1B3D]"}`}
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {plan.name}
              </h3>
              <p className={`text-sm mb-5 ${plan.highlight ? "text-white/60" : "text-[#2D1B3D]/50"}`}>
                {plan.desc}
              </p>

              <div className="mb-6">
                <span
                  className={`text-4xl font-bold ${plan.highlight ? "text-white" : "text-[#2D1B3D]"}`}
                >
                  ${annual ? plan.price.annual : plan.price.monthly}
                </span>
                <span className={`text-sm ml-1 ${plan.highlight ? "text-white/50" : "text-[#2D1B3D]/40"}`}>
                  /month
                </span>
              </div>

              <button
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] mb-6`}
                style={{
                  backgroundColor: plan.highlight ? "#C9A84C" : "#2D1B3D",
                  color: "white",
                }}
              >
                {plan.cta}
              </button>

              <ul className="space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check
                      className="w-4 h-4 shrink-0 mt-0.5"
                      style={{ color: plan.highlight ? "#C9A84C" : plan.color }}
                    />
                    <span className={plan.highlight ? "text-white/80" : "text-[#2D1B3D]/70"}>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
