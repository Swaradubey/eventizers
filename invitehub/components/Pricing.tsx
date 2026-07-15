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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto px-4 pt-10 pb-16">
          {plans.map((plan) => {
            const isFeatured = plan.highlight;
            return (
              <div
                key={plan.name}
                className={`relative rounded-[32px] p-10 flex flex-col justify-between transition-all duration-300 ${
                  isFeatured
                    ? "bg-gradient-to-br from-[#5B5EFF] to-[#08B8D9] text-white shadow-2xl shadow-blue-500/15 lg:scale-[1.03] h-full lg:h-[calc(100%+24px)] lg:-translate-y-3 hover:-translate-y-2 lg:hover:-translate-y-5 hover:shadow-2xl hover:shadow-blue-500/25 z-10"
                    : "h-full bg-white border border-[#E5E7EB] text-[#0F1E36] shadow-sm hover:-translate-y-2 hover:shadow-xl hover:shadow-gray-200"
                }`}
              >
                <div className="flex flex-col h-full justify-between gap-8">
                  <div className="flex flex-col gap-6">
                    {/* Badge & Plan Name */}
                    <div>
                      {isFeatured && (
                        <div className="mb-4">
                          <span className="inline-flex items-center rounded-full bg-gradient-to-r from-[#FF5E3A] to-[#FF2A6D] px-4 py-1 text-[11px] font-extrabold uppercase tracking-widest text-white shadow-md shadow-red-500/10">
                            Most Popular
                          </span>
                        </div>
                      )}
                      <h3 className={`text-3xl font-bold font-body tracking-tight ${isFeatured ? "text-white" : "text-[#0F1E36]"}`}>
                        {plan.name}
                      </h3>
                      <p className={`text-sm mt-2 ${isFeatured ? "text-white/80" : "text-slate-500"}`}>
                        {plan.desc}
                      </p>
                    </div>

                    {/* Pricing */}
                    <div className="flex items-baseline gap-1">
                      <span className={`text-5xl font-extrabold tracking-tight ${isFeatured ? "text-white" : "text-[#0F1E36]"}`}>
                        ${annual ? plan.price.annual : plan.price.monthly}
                      </span>
                      <span className={`text-sm font-semibold tracking-wide ${isFeatured ? "text-white/70" : "text-slate-400"}`}>
                        /month
                      </span>
                    </div>

                    {/* Divider */}
                    <div className={`h-[1px] w-full ${isFeatured ? "bg-white/10" : "bg-slate-100"}`} />

                    {/* Features List */}
                    <ul className="space-y-4 text-left">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-3 text-sm font-medium">
                          {isFeatured ? (
                            <div className="flex-shrink-0 w-5 h-5 rounded-full border border-white flex items-center justify-center text-white">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="flex-shrink-0 w-5 h-5 rounded-full border border-emerald-500 flex items-center justify-center text-emerald-500">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                          <span className={isFeatured ? "text-white/90" : "text-slate-700"}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <div className="pt-4">
                    <button
                      className={`w-full h-[60px] rounded-full text-base font-bold transition-all duration-300 active:scale-[0.98] focus:outline-none flex items-center justify-center ${
                        isFeatured
                          ? "bg-white text-[#5B5EFF] hover:brightness-110 shadow-lg shadow-white/10"
                          : "bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white hover:brightness-110 shadow-lg shadow-[#8B5CF6]/15"
                      }`}
                    >
                      {plan.cta}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
