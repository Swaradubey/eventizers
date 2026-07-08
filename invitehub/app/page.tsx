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
    <main>
      <Navbar />
      <Hero />
      <Templates />
      <HowItWorks />
      <AIFeatures />
      <AttendanceGuarantee />
      <UseCasesAndTestimonials />
      <Pricing />
      <Footer />
    </main>
  );
}
