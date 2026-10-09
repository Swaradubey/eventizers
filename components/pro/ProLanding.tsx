"use client";

import React, { useState } from "react";
import "../../app/eventizers.css";
import ProHeader from "./ProHeader";
import ProHero from "./ProHero";
import ProBuiltFor from "./ProBuiltFor";
import ProComparison from "./ProComparison";
import ProFlow from "./ProFlow";
import ProFeatures from "./ProFeatures";
import ProCalculator from "./ProCalculator";
import ProPricing from "./ProPricing";
import ProFaq from "./ProFaq";
import ProFinalCta from "./ProFinalCta";
import ProFooter from "./ProFooter";
import ProStickyCta from "./ProStickyCta";
import ProTrialModal from "./ProTrialModal";

export default function ProLanding() {
  const [trialModalOpen, setTrialModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState("pro");

  const handleStartTrial = (planId: string = "pro") => {
    setSelectedPlanId(planId);
    setTrialModalOpen(true);
  };

  return (
    <div className="eventizers-root min-h-screen text-foreground antialiased selection:bg-primary selection:text-primary-foreground bg-background">
      <ProHeader onStartTrial={() => handleStartTrial("pro")} />

      <main id="top">
        <ProHero onStartTrial={() => handleStartTrial("pro")} />
        <ProBuiltFor />
        <ProComparison />
        <ProFlow />
        <ProFeatures />
        <ProCalculator onSelectPlan={(plan) => handleStartTrial(plan)} />
        <ProPricing onSelectPlan={(plan) => handleStartTrial(plan)} />
        <ProFaq />
        <ProFinalCta onStartTrial={() => handleStartTrial("pro")} />
      </main>

      <ProFooter />
      <ProStickyCta onStartTrial={() => handleStartTrial("pro")} />

      <ProTrialModal
        isOpen={trialModalOpen}
        onClose={() => setTrialModalOpen(false)}
        selectedPlanId={selectedPlanId}
      />
    </div>
  );
}
