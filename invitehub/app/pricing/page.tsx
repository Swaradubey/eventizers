"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Briefcase,
  Heart,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  PartyPopper,
  Loader2,
  Check,
  AlertCircle,
  X,
  Mail,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface PlanTier {
  name: string;
  monthly: number | null;
  annual: number | null;
  customLabel?: string;
  tagline: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  planId?: string;
}

interface CategoryTab {
  id: "individuals" | "companies" | "others";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  blurb: string;
}

const CATEGORIES: CategoryTab[] = [
  {
    id: "individuals",
    label: "Individuals",
    icon: Users,
    blurb: "Birthdays, weddings, dinners, and personal celebrations.",
  },
  {
    id: "companies",
    label: "Companies",
    icon: Briefcase,
    blurb: "Conferences, launches, offsites, and team events.",
  },
  {
    id: "others",
    label: "Nonprofits & Others",
    icon: Heart,
    blurb: "Fundraisers, communities, schools, and government.",
  },
];

const PRICING_DATA: Record<string, PlanTier[]> = {
  individuals: [
    {
      name: "Free",
      monthly: 0,
      annual: 0,
      tagline: "For your first celebration.",
      features: [
        "Up to 25 guests",
        "AI event creation",
        "Email invitations",
        "Basic RSVP tracking",
      ],
      cta: "Start Free",
      planId: "free",
    },
    {
      name: "Personal Pro",
      monthly: 12,
      annual: 9,
      tagline: "For hosts who gather often.",
      features: [
        "Up to 150 guests",
        "SMS & WhatsApp invites",
        "QR check-in",
        "Reminders & analytics",
        "Gift registries",
      ],
      cta: "Go Pro",
      highlighted: true,
      planId: "pro",
    },
    {
      name: "Celebration",
      monthly: 29,
      annual: 24,
      tagline: "For unforgettable moments.",
      features: [
        "Unlimited guests",
        "Custom envelope designs",
        "All Google Fonts",
        "Photo galleries",
        "Priority support",
      ],
      cta: "Choose Celebration",
      planId: "celebration",
    },
  ],
  companies: [
    {
      name: "Team",
      monthly: 49,
      annual: 39,
      tagline: "For growing teams.",
      features: [
        "Up to 500 guests",
        "Ticketing & payments",
        "Attendance guarantee",
        "Event analytics",
        "5 team members",
      ],
      cta: "Start with Team",
      highlighted: true,
      planId: "team",
    },
    {
      name: "Business",
      monthly: 99,
      annual: 79,
      tagline: "For scaling event programs.",
      features: [
        "Unlimited guests",
        "Security center",
        "Advanced analytics",
        "20 team members",
        "API access",
      ],
      cta: "Choose Business",
      planId: "business",
    },
    {
      name: "Enterprise",
      monthly: null,
      annual: null,
      customLabel: "Custom",
      tagline: "For complex organizations.",
      features: [
        "SSO & approvals",
        "Dedicated success manager",
        "Custom integrations",
        "SLA & compliance",
        "Unlimited team members",
      ],
      cta: "Contact Sales",
      planId: "enterprise",
    },
  ],
  others: [
    {
      name: "Nonprofit",
      monthly: 0,
      annual: 0,
      tagline: "Free for verified nonprofits.",
      features: [
        "Up to 200 guests",
        "Donation registries",
        "Fundraising tools",
        "Volunteer check-in",
        "Tax-receipt exports",
      ],
      cta: "Apply for Free",
      highlighted: true,
      planId: "nonprofit",
    },
    {
      name: "Community",
      monthly: 19,
      annual: 15,
      tagline: "For clubs and communities.",
      features: [
        "Recurring events",
        "Member management",
        "Up to 500 guests",
        "Group messaging",
        "Attendance history",
      ],
      cta: "Choose Community",
      planId: "community",
    },
    {
      name: "Education & Gov",
      monthly: null,
      annual: null,
      customLabel: "Custom",
      tagline: "For schools and public sector.",
      features: [
        "Campus-wide events",
        "Compliance & data residency",
        "Custom billing & POs",
        "Bulk seat licensing",
        "Dedicated support",
      ],
      cta: "Contact Sales",
      planId: "edu_gov",
    },
  ],
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function PricingPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [activeCategory, setActiveCategory] = useState<"individuals" | "companies" | "others">("individuals");
  const [isAnnual, setIsAnnual] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error" = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  }, []);

  const currentCategory = CATEGORIES.find((cat) => cat.id === activeCategory) || CATEGORIES[0];
  const plans = PRICING_DATA[activeCategory] || [];

  const handlePlanAction = async (plan: PlanTier) => {
    if (loadingPlan) return;

    if (plan.customLabel === "Custom" || plan.cta === "Contact Sales") {
      window.location.href = `mailto:sales@eventizers.com?subject=${encodeURIComponent(
        `Inquiry regarding Eventizers ${plan.name} Plan`
      )}`;
      return;
    }

    if (plan.name === "Free" || plan.name === "Nonprofit" || (plan.monthly === 0 && plan.annual === 0)) {
      if (!user) {
        router.push(`/login?redirect=/dashboard&plan=free`);
        return;
      }

      setLoadingPlan(plan.name);
      try {
        const apiBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api")
          .replace(/\/$/, "")
          .replace(/\/api$/, "") + "/api";

        const res = await fetch(`${apiBase}/billing/activate-free`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        const data = await res.json();
        if (res.ok && data.success) {
          showToast("Free plan activated! Redirecting to dashboard…", "success");
          setTimeout(() => router.push("/dashboard"), 1200);
        } else if (res.ok && data.alreadyActive) {
          showToast("Free plan is already active on your account.", "success");
          setTimeout(() => router.push("/dashboard"), 1200);
        } else {
          router.push("/dashboard");
        }
      } catch {
        router.push("/dashboard");
      } finally {
        setLoadingPlan(null);
      }
      return;
    }

    // Paid Plan Click
    if (!user) {
      router.push(`/login?redirect=/dashboard/billing&plan=${plan.planId || plan.name.toLowerCase()}`);
      return;
    }

    setLoadingPlan(plan.name);
    try {
      const apiBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api")
        .replace(/\/$/, "")
        .replace(/\/api$/, "") + "/api";

      const res = await fetch(`${apiBase}/stripe/create-checkout-session`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: plan.planId || "pro" }),
      });

      const data = await res.json();
      if (res.ok && data.url) {
        window.location.assign(data.url);
        return;
      }

      if (data?.alreadyActive) {
        showToast("This plan is already active on your account.", "success");
        return;
      }

      router.push("/dashboard/billing");
    } catch {
      router.push("/dashboard/billing");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen relative font-sans antialiased invitation-bg invitation-pattern text-foreground overflow-x-hidden">
      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed top-24 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border max-w-sm ${
            toast.type === "success"
              ? "bg-white border-emerald-200 text-emerald-800"
              : "bg-white border-rose-200 text-rose-800"
          }`}
        >
          {toast.type === "success" ? (
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          )}
          <span className="text-xs font-semibold flex-1">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="text-current/40 hover:text-current transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Animated Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-10 left-20 w-96 h-96 bg-indigo-400/15 rounded-full blur-3xl floating-orb" />
        <div
          className="absolute top-32 right-1/4 w-72 h-72 bg-pink-400/12 rounded-full blur-3xl pulse-orb"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-20 right-1/3 w-72 h-72 bg-orange-400/12 rounded-full blur-3xl floating-orb"
          style={{ animationDelay: "3s" }}
        />
        <div className="absolute bottom-40 left-1/4 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl pulse-orb" />
      </div>

      {/* Sticky Navigation */}
      <nav className="border-b border-white/30 sticky top-0 z-50 bg-white/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2.5 focus:outline-none group text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <PartyPopper className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent">
              Eventizers
            </span>
          </button>

          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 text-foreground/70 font-medium hover:text-foreground transition-colors inline-flex items-center gap-2 rounded-lg hover:bg-white/50 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500/15 to-orange-500/15 text-pink-600 mb-6 text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            Plans for everyone
          </div>

          <h1
            style={{ fontFamily: "Georgia, serif" }}
            className="text-4xl md:text-5xl font-normal font-serif text-balance mb-4 bg-gradient-to-r from-indigo-500 via-pink-500 to-orange-500 bg-clip-text text-transparent"
          >
            Pricing that fits how you gather
          </h1>

          <p className="text-lg text-foreground/70 text-balance max-w-2xl mx-auto">
            Pick the audience that sounds like you. Every plan includes AI event creation and one-click RSVPs.
          </p>
        </motion.div>
      </section>

      {/* Tab Switcher & Billing Toggle */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Category Tabs */}
        <div className="glass-card rounded-2xl p-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
          {CATEGORIES.map((cat) => {
            const isSelected = cat.id === activeCategory;
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
                  isSelected
                    ? "bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/20"
                    : "text-foreground/70 hover:bg-white/60"
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic Category Subtitle */}
        <p className="text-center text-foreground/60 text-sm mt-4 font-medium">
          {currentCategory.blurb}
        </p>

        {/* Monthly vs Annual Toggle */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <span
            className={`text-sm font-medium transition-colors ${
              !isAnnual ? "text-foreground font-semibold" : "text-foreground/50"
            }`}
          >
            Monthly
          </span>

          <button
            onClick={() => setIsAnnual((prev) => !prev)}
            className={`relative w-14 h-7 rounded-full transition-colors focus:outline-none cursor-pointer ${
              isAnnual ? "bg-gradient-to-r from-pink-500 to-orange-500" : "bg-foreground/20"
            }`}
            aria-label="Toggle annual billing"
          >
            <motion.div
              animate={{ x: isAnnual ? 28 : 3 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md"
            />
          </button>

          <span
            className={`text-sm font-medium transition-colors ${
              isAnnual ? "text-foreground font-semibold" : "text-foreground/50"
            }`}
          >
            Annual
            <span className="ml-1.5 text-xs font-bold text-pink-600 bg-pink-100/70 px-2 py-0.5 rounded-full">
              save 20%
            </span>
          </span>
        </div>
      </section>

      {/* Pricing Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.08 },
              },
            }}
            className="grid md:grid-cols-3 gap-6 items-stretch"
          >
            {plans.map((plan) => {
              const price = isAnnual ? plan.annual : plan.monthly;
              const isHighlight = plan.highlighted;
              const isLoading = loadingPlan === plan.name;

              return (
                <motion.div
                  key={plan.name}
                  variants={cardVariants}
                  whileHover={{ y: -6 }}
                  className={`rounded-2xl p-7 flex flex-col transition-all duration-300 ${
                    isHighlight
                      ? "bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-xl md:scale-105"
                      : "glass-card hover:shadow-xl text-foreground"
                  }`}
                >
                  {/* Highlight Badge */}
                  {isHighlight && (
                    <div className="inline-flex self-start items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 text-white text-xs font-semibold mb-3 shadow-sm">
                      <Sparkles className="w-3 h-3" />
                      Most Popular
                    </div>
                  )}

                  {/* Plan Name */}
                  <h3
                    style={{ fontFamily: "Georgia, serif" }}
                    className={`text-xl font-semibold font-serif mb-1 ${
                      isHighlight ? "text-white" : "text-foreground"
                    }`}
                  >
                    {plan.name}
                  </h3>

                  {/* Tagline */}
                  <p
                    className={`text-sm mb-5 ${
                      isHighlight ? "text-white/80" : "text-foreground/60"
                    }`}
                  >
                    {plan.tagline}
                  </p>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 mb-6">
                    {plan.customLabel ? (
                      <span className="text-3xl font-bold">{plan.customLabel}</span>
                    ) : (
                      <>
                        <span className="text-4xl font-bold">${price}</span>
                        <span
                          className={`text-sm ${
                            isHighlight ? "text-white/70" : "text-foreground/60"
                          }`}
                        >
                          {price === 0
                            ? "/forever"
                            : isAnnual
                            ? "/mo, billed yearly"
                            : "/month"}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Feature List */}
                  <ul className="space-y-3 mb-7 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <CheckCircle2
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            isHighlight ? "text-white" : "text-emerald-500"
                          }`}
                        />
                        <span
                          className={
                            isHighlight ? "text-white/95" : "text-foreground/80"
                          }
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handlePlanAction(plan)}
                    disabled={isLoading}
                    className={`w-full py-2.5 rounded-lg font-semibold transition-all inline-flex items-center justify-center gap-2 cursor-pointer ${
                      isHighlight
                        ? "bg-white text-indigo-600 hover:shadow-lg hover:bg-slate-50"
                        : "bg-gradient-to-r from-indigo-500 to-cyan-500 text-white hover:shadow-lg hover:opacity-95"
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing…
                      </>
                    ) : (
                      <>
                        {plan.cta}
                        {plan.cta === "Contact Sales" ? (
                          <Mail className="w-4 h-4" />
                        ) : (
                          <ArrowRight className="w-4 h-4" />
                        )}
                      </>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Free Trial Banner Card */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center relative z-10">
        <div className="glass-card rounded-2xl p-8">
          <h2
            style={{ fontFamily: "Georgia, serif" }}
            className="text-2xl md:text-3xl font-normal font-serif mb-3 text-balance text-foreground"
          >
            Not sure which plan is right?
          </h2>
          <p className="text-foreground/70 mb-6 max-w-xl mx-auto text-sm sm:text-base">
            Every paid plan comes with a 14-day free trial and no credit card required. Switch or cancel anytime.
          </p>
          <button
            onClick={() => router.push(user ? "/dashboard" : "/register")}
            className="px-8 py-3 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-lg font-semibold hover:shadow-xl transition-shadow inline-flex items-center gap-2 cursor-pointer active:scale-95"
          >
            Start your free trial
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/30 bg-white/50 backdrop-blur-xl relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-foreground/60 text-sm">
          <p>© 2026 Eventizers. Create, Invite, Manage. The AI-powered event operating system.</p>
        </div>
      </footer>
    </div>
  );
}
