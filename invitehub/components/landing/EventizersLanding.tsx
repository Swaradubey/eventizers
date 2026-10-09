"use client";

import React from "react";
import "../../app/eventizers.css";
import { CreateSheetProvider } from "./CreateSheetContext";
import Header from "./Header";
import Hero from "./Hero";
import StartPaths from "./StartPaths";
import VideoSection from "./VideoSection";
import PhotoToEvent from "./PhotoToEvent";
import ViralLab from "./ViralLab";
import PlatformSection from "./PlatformSection";
import AgentSection from "./AgentSection";
import PrivateSection from "./PrivateSection";
import NoAppSection from "./NoAppSection";
import Occasions from "./Occasions";
import Organizers from "./Organizers";
import Pricing from "./Pricing";
import ViralLoop from "./ViralLoop";
import FinalCta from "./FinalCta";
import Footer from "./Footer";
import StickyCta from "./StickyCta";

export default function EventizersLanding() {
  return (
    <div className="eventizers-root min-h-screen text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
      <CreateSheetProvider>
        <Header />
        <main id="main-content">
          <Hero />
          <StartPaths />
          <VideoSection />
          <PhotoToEvent />
          <ViralLab />
          <PlatformSection />
          <AgentSection />
          <PrivateSection />
          <NoAppSection />
          <Occasions />
          <Organizers />
          <Pricing />
          <ViralLoop />
          <FinalCta />
        </main>
        <Footer />
        <StickyCta />
      </CreateSheetProvider>
    </div>
  );
}
