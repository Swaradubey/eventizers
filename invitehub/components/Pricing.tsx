"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

export default function Pricing() {
  const router = useRouter();

  return (
    <motion.section
      id="pricing"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1, margin: "0px 0px -120px 0px" }}
      variants={containerVariants}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative z-10"
    >
      <motion.div
        variants={itemVariants}
        className="glass-card rounded-3xl p-8 md:p-10 text-center relative overflow-hidden"
      >
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-pink-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-orange-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-pink-500/15 to-orange-500/15 text-pink-600 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Plans for everyone
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            Pricing that fits how you gather
          </h2>
          <p className="text-foreground/60 text-slate-600 mb-8 max-w-xl mx-auto">
            Whether you&apos;re planning a birthday, a company offsite, or a nonprofit gala — there&apos;s a plan built for you.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/pricing")}
            className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white rounded-lg font-semibold hover:shadow-xl transition-shadow inline-flex items-center gap-2 cursor-pointer"
          >
            View Pricing
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>
    </motion.section>
  );
}
