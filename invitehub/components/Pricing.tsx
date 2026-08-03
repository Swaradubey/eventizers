"use client";

import { useState, useCallback } from "react";
import { Check, Loader2, AlertCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { BILLING_PLANS, PAID_PLAN_IDS, type PlanId } from "../../lib/plans";

// ─── We lazy-import the auth hook to avoid SSR issues ───────────────────────
// The hook is safe to call because this component is "use client".
import { useAuth } from "../context/AuthContext";

// ────────────────────────────────────────────────────────────────────────────
// Pricing component — Home page section
// Plans: Free ($0) · Pro ($19/mo) · Business ($49/mo)
// ─ No "Host" plan. No annual toggle (Stripe is monthly only).
// ────────────────────────────────────────────────────────────────────────────

export default function Pricing() {
  const { user } = useAuth();
  const router = useRouter();

  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error" = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  }, []);

  const handlePlanClick = useCallback(
    async (planId: PlanId) => {
      if (loadingPlan) return; // debounce

      // ── Not logged in → preserve plan and redirect to login ─────────────
      if (!user) {
        const loginUrl = `/login?redirect=/dashboard/billing&plan=${planId}`;
        router.push(loginUrl);
        return;
      }

      setLoadingPlan(planId);

      try {
        // ── Free plan ──────────────────────────────────────────────────────
        if (planId === "free") {
          const apiBase =
            (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api")
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
            showToast(data.error || "Failed to activate Free plan. Please try again.", "error");
          }
          return;
        }

        // ── Pro / Business → Stripe Checkout ──────────────────────────────
        if (PAID_PLAN_IDS.includes(planId)) {
          const apiBase =
            (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api")
              .replace(/\/$/, "")
              .replace(/\/api$/, "") + "/api";

          const res = await fetch(`${apiBase}/stripe/create-checkout-session`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ plan: planId }),
          });

          const data = await res.json();

          if (res.ok && data.url) {
            window.location.assign(data.url);
            return;
          }

          if (data.alreadyActive) {
            showToast("This plan is already active on your account.", "success");
            return;
          }

          if (data.hasExistingSubscription) {
            showToast(
              "You have an active subscription. Manage it in your billing settings.",
              "error"
            );
            return;
          }

          showToast(data.error || "Failed to start checkout. Please try again.", "error");
        }
      } catch {
        showToast("A network error occurred. Please try again.", "error");
      } finally {
        setLoadingPlan(null);
      }
    },
    [user, router, loadingPlan, showToast]
  );

  return (
    <section id="pricing" className="py-24 bg-white relative">
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

      <div className="max-w-7xl mx-auto px-6">
        {/* Section heading */}
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
          <p className="text-[#2D1B3D]/60 text-lg">
            Whether you&apos;re planning a birthday, a company offsite, or a nonprofit
            gala — there&apos;s a plan built for you.
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto px-4 pt-10 pb-16">
          {BILLING_PLANS.map((plan) => {
            const isFeatured = plan.highlight;
            const isLoading = loadingPlan === plan.id;
            const isDisabled = !!loadingPlan;

            return (
              <div
                key={plan.id}
                className={`relative rounded-[32px] p-10 flex flex-col justify-between transition-all duration-300 ${
                  isFeatured
                    ? "bg-gradient-to-br from-[#5B5EFF] to-[#08B8D9] text-white shadow-2xl shadow-blue-500/15 lg:scale-[1.03] h-full lg:h-[calc(100%+24px)] lg:-translate-y-3 hover:-translate-y-2 lg:hover:-translate-y-5 hover:shadow-2xl hover:shadow-blue-500/25 z-10"
                    : "h-full bg-white border border-[#E5E7EB] text-[#0F1E36] shadow-sm hover:-translate-y-2 hover:shadow-xl hover:shadow-gray-200"
                }`}
              >
                <div className="flex flex-col h-full justify-between gap-8">
                  <div className="flex flex-col gap-6">
                    {/* Badge */}
                    <div>
                      {isFeatured && (
                        <div className="mb-4">
                          <span className="inline-flex items-center rounded-full bg-gradient-to-r from-[#FF5E3A] to-[#FF2A6D] px-4 py-1 text-[11px] font-extrabold uppercase tracking-widest text-white shadow-md shadow-red-500/10">
                            Most Popular
                          </span>
                        </div>
                      )}
                      <h3
                        className={`text-3xl font-bold font-body tracking-tight ${
                          isFeatured ? "text-white" : "text-[#0F1E36]"
                        }`}
                      >
                        {plan.name}
                      </h3>
                      <p
                        className={`text-sm mt-2 ${
                          isFeatured ? "text-white/80" : "text-slate-500"
                        }`}
                      >
                        {plan.id === "free"
                          ? "Perfect for small personal events"
                          : plan.id === "pro"
                          ? "Ideal for growing hosts and frequent planners"
                          : "For businesses and commercial events"}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-1">
                      <span
                        className={`text-5xl font-extrabold tracking-tight ${
                          isFeatured ? "text-white" : "text-[#0F1E36]"
                        }`}
                      >
                        ${plan.monthlyPrice}
                      </span>
                      <span
                        className={`text-sm font-semibold tracking-wide ${
                          isFeatured ? "text-white/70" : "text-slate-400"
                        }`}
                      >
                        /month
                      </span>
                    </div>

                    {/* Divider */}
                    <div
                      className={`h-[1px] w-full ${
                        isFeatured ? "bg-white/10" : "bg-slate-100"
                      }`}
                    />

                    {/* Features */}
                    <ul className="space-y-4 text-left">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-3 text-sm font-medium"
                        >
                          {isFeatured ? (
                            <div className="flex-shrink-0 w-5 h-5 rounded-full border border-white flex items-center justify-center text-white">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="flex-shrink-0 w-5 h-5 rounded-full border border-emerald-500 flex items-center justify-center text-emerald-500">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                          <span
                            className={isFeatured ? "text-white/90" : "text-slate-700"}
                          >
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <div className="pt-4">
                    <button
                      id={`pricing-cta-${plan.id}`}
                      onClick={() => handlePlanClick(plan.id)}
                      disabled={isDisabled}
                      aria-label={`${plan.cta} — ${plan.name} plan at $${plan.monthlyPrice}/month`}
                      className={`w-full h-[60px] rounded-full text-base font-bold transition-all duration-300 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${
                        isFeatured
                          ? "bg-white text-[#5B5EFF] hover:brightness-110 shadow-lg shadow-white/10 focus:ring-white/50"
                          : "bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white hover:brightness-110 shadow-lg shadow-[#8B5CF6]/15 focus:ring-[#8B5CF6]/50"
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing…
                        </>
                      ) : (
                        plan.cta
                      )}
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
