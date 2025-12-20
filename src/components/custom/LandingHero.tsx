"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Dumbbell, Utensils, Zap, Brain, Cpu, Database, Activity, ChevronDown } from "lucide-react";
import { ModeToggle } from "./ModeToggle";
import { useRef } from "react";

export default function LandingHero({ onGetStarted }: { onGetStarted: () => void }) {
  const howItWorksRef = useRef<HTMLDivElement>(null);

  const scrollToHowItWorks = () => {
    howItWorksRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      {/* Top Bar for Toggle */}
      <div className="absolute top-8 right-8 z-50">
        <ModeToggle />
      </div>

      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
        </div>

        <div className="container relative z-10 px-4 mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-muted border border-border text-sm font-medium"
          >
            <Zap className="w-4 h-4 text-primary" />
            <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent italic font-bold">
              Next-Gen Neural Architecture
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-none"
          >
            FORGE YOUR <br />
            <span className="text-primary italic">ELITE IDENTITY</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto text-xl md:text-2xl text-muted-foreground mb-12 font-medium tracking-tight"
          >
            Leverage hyper-advanced biometric synthesis and real-time algorithmic
            logic to generate the absolute peak of personalized performance.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Button size="lg" className="h-16 px-12 text-xl font-black rounded-3xl shadow-[0_20px_50px_rgba(var(--primary),0.3)] group active:scale-95 transition-all" onClick={onGetStarted}>
              INITIATE SEQUENCE
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" onClick={scrollToHowItWorks} className="h-16 px-12 text-xl font-black rounded-3xl border-4 hover:bg-primary/5 active:scale-95 transition-all">
              HOW IT WORKS
            </Button>
          </motion.div>

          {/* Feature Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            <FeatureCard
              icon={<Dumbbell className="w-6 h-6" />}
              title="Kinetic Logic"
              description="Biomechanically optimized routines synced to your precise equipment stack."
            />
            <FeatureCard
              icon={<Utensils className="w-6 h-6" />}
              title="Bio-Fuel Mapping"
              description="Macro-balanced nutritional blueprints tailored for cellular-level recovery."
            />
            <FeatureCard
              icon={<Brain className="w-6 h-6" />}
              title="Neural Coaching"
              description="Real-time LLM-driven assistance for adaptive training adjustments."
            />
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-20 cursor-pointer"
          onClick={scrollToHowItWorks}
        >
          <ChevronDown className="w-12 h-12" />
        </motion.div>
      </div>

      {/* Advanced "How it Works" Section */}
      <div ref={howItWorksRef} className="py-32 bg-muted/30 relative">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 uppercase italic">Neural Processing <span className="text-primary truncate">Workflow</span></h2>
            <div className="h-2 w-48 bg-primary mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connecting lines for desktop */}
            <div className="hidden lg:block absolute top-[60px] left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent -z-10" />

            <TechStep
              icon={<Database className="w-8 h-8" />}
              step="01"
              title="Biometric Data Ingestion"
              description="System parses age, weight, height, and medical history with 99.9% neural precision."
            />
            <TechStep
              icon={<Cpu className="w-8 h-8" />}
              step="02"
              title="Contextual Synthesis"
              description="AI cross-references equipment availability with elite performance databases."
            />
            <TechStep
              icon={<Brain className="w-8 h-8" />}
              step="03"
              title="Algorithmic Optimization"
              description="Optimization engines calculate optimal mechanical load and recovery windows."
            />
            <TechStep
              icon={<Activity className="w-8 h-8" />}
              step="04"
              title="Identity Generation"
              description="Synthesis of your unique 7-day kinetic and nutritional evolution roadmap."
            />
          </div>

          <div className="mt-24 p-12 bg-card border-4 rounded-[4rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12 scale-150">
              <Zap className="w-64 h-64 text-primary" />
            </div>
            <div className="relative z-10 max-w-3xl">
              <h3 className="text-4xl font-black mb-6 italic tracking-tight uppercase">Proprietary Scaling Logic</h3>
              <p className="text-xl text-muted-foreground leading-relaxed font-medium mb-8">
                Our engine doesn't just "pick exercises." It utilizes a multi-vector approach to analyze
                <span className="text-primary font-bold"> volume-to-intensity ratios</span>,
                <span className="text-primary font-bold"> metabolic demand</span>, and
                <span className="text-primary font-bold"> nutrient partition efficiency</span>
                to ensure every session moves you closer to your prime state.
              </p>
              <Button size="lg" onClick={onGetStarted} className="h-14 px-10 rounded-2xl font-black text-lg">
                EXPERIENCE THE ADVANTAGE
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-[2.5rem] bg-card/50 backdrop-blur-sm border-4 border-muted hover:border-primary/50 transition-all group hover:shadow-2xl hover:shadow-primary/5 text-left">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform shadow-inner">
        {icon}
      </div>
      <h3 className="text-2xl font-black mb-3 tracking-tight uppercase">{title}</h3>
      <p className="text-muted-foreground font-medium leading-relaxed">{description}</p>
    </div>
  );
}

function TechStep({ icon, step, title, description }: { icon: React.ReactNode, step: string, title: string, description: string }) {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="relative p-10 rounded-[3rem] bg-background border-4 border-border flex flex-col items-center text-center group transition-all hover:border-primary shadow-xl"
    >
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-primary/30">
        {step}
      </div>
      <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
        {icon}
      </div>
      <h4 className="text-2xl font-black mb-4 tracking-tight uppercase leading-none">{title}</h4>
      <p className="text-muted-foreground font-semibold text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}
