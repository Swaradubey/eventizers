"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Sparkles, Check, ArrowRight } from "lucide-react";
import { PRO_PLANS, TRIAL_DAYS } from "./proData";

interface ProTrialModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlanId?: string;
}

export default function ProTrialModal({
  isOpen,
  onClose,
  selectedPlanId = "pro",
}: ProTrialModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [planId, setPlanId] = useState(selectedPlanId);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const currentPlan = PRO_PLANS.find((p) => p.id === planId) || PRO_PLANS[1];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Redirect to register with query parameters
    const query = new URLSearchParams({
      plan: planId,
      email: email,
      name: name,
    });
    setTimeout(() => {
      router.push(`/register?${query.toString()}`);
      onClose();
    }, 400);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Start free trial"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#0c1217] p-6 sm:p-8 text-foreground shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow corner */}
        <div className="pointer-events-none absolute -top-24 -right-24 size-48 rounded-full bg-primary/20 blur-3xl" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 grid size-10 place-items-center rounded-full text-foreground/60 hover:bg-white/10 hover:text-foreground transition"
          aria-label="Close dialog"
        >
          <X className="size-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow">
            <Sparkles className="size-4" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Eventizers Pro
          </span>
        </div>

        <h3 className="mt-3 font-display text-2xl font-extrabold sm:text-3xl">
          Start your {TRIAL_DAYS}-day free trial
        </h3>
        <p className="mt-1.5 text-sm text-foreground/70">
          Everything in {currentPlan.name} is unlocked. No charge today.
        </p>

        {/* Plan Selector Pills */}
        <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-white/5 p-1 border border-white/10">
          {PRO_PLANS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPlanId(p.id)}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-semibold transition-all ${
                p.id === planId
                  ? "bg-primary text-primary-foreground shadow font-bold"
                  : "text-foreground/70 hover:text-foreground"
              }`}
            >
              <span>{p.name}</span>
              <span className="text-[10px] opacity-80">${p.annual}/mo</span>
            </button>
          ))}
        </div>

        {/* Selected Plan Highlights */}
        <ul className="mt-4 flex flex-col gap-2 rounded-2xl bg-white/5 p-3.5 border border-white/5 text-xs text-foreground/80">
          <li className="flex items-center gap-2">
            <Check className="size-3.5 text-primary shrink-0" />
            <span>Full access to {currentPlan.name} features</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="size-3.5 text-primary shrink-0" />
            <span>Connect channels & publish across social media</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="size-3.5 text-primary shrink-0" />
            <span>Cancel anytime with 1-click in billing settings</span>
          </li>
        </ul>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3.5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-1">
              Your Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Rivera"
              className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-1">
              Work Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@eventvenue.com"
              className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary font-bold text-base text-primary-foreground shadow-lg hover:brightness-110 active:scale-[0.98] transition disabled:opacity-50"
          >
            {loading ? "Creating your trial workspace…" : "Start 14-day free trial"}
            <ArrowRight className="size-4" />
          </button>
        </form>

        <p className="mt-3 text-center text-xs text-foreground/50">
          By signing up you agree to Eventizers Terms &amp; Privacy Policy.
        </p>
      </div>
    </div>
  );
}
