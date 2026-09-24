import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Templates from "@/components/Templates";
import HowItWorks from "@/components/HowItWorks";
import AIFeatures from "@/components/AIFeatures";
import AttendanceGuarantee from "@/components/AttendanceGuarantee";
import UseCasesAndTestimonials from "@/components/UseCasesAndTestimonials";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="home-page font-body antialiased min-h-screen relative invitation-bg invitation-pattern text-foreground overflow-x-clip">
      {/* Fixed Ambient Floating and Pulsing Orbs (v0-e-invitation-app) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-10 left-20">
          <div className="w-96 h-96 bg-indigo-400/15 rounded-full blur-3xl floating-orb" />
        </div>
        <div className="absolute top-60 right-10">
          <div className="w-[500px] h-[500px] bg-cyan-400/12 rounded-full blur-3xl floating-orb" style={{ animationDelay: "2s" }} />
        </div>
        <div className="absolute top-32 right-1/4">
          <div className="w-72 h-72 bg-pink-400/12 rounded-full blur-3xl pulse-orb" style={{ animationDelay: "1s" }} />
        </div>
        <div className="absolute bottom-40 left-1/4">
          <div className="w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pulse-orb" />
        </div>
        <div className="absolute bottom-20 right-1/3">
          <div className="w-72 h-72 bg-orange-400/12 rounded-full blur-3xl floating-orb" style={{ animationDelay: "4s" }} />
        </div>
      </div>

      {/* Main Home Page Content Layers */}
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <Templates />
        <HowItWorks />
        <AIFeatures />
        <AttendanceGuarantee />
        <UseCasesAndTestimonials />
        <Pricing />
        <Footer />
      </div>
    </main>
  );
}
