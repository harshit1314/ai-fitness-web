"use client";

import { useState, useEffect } from "react";
import LandingHero from "@/components/custom/LandingHero";
import IntakeForm, { UserData } from "@/components/custom/IntakeForm";
import { AnimatePresence, motion } from "framer-motion";
import Dashboard from "@/components/custom/Dashboard";

export default function Home() {
  const [view, setView] = useState<"landing" | "form" | "dashboard">("landing");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem("ai_fitness_user_data");
    const savedView = localStorage.getItem("ai_fitness_view") as any;

    if (savedData) {
      setUserData(JSON.parse(savedData));
      if (savedView === "dashboard") {
        setView("dashboard");
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (userData) {
      localStorage.setItem("ai_fitness_user_data", JSON.stringify(userData));
    }
    localStorage.setItem("ai_fitness_view", view);
  }, [userData, view]);

  const handleStart = () => setView("form");

  const handleFormSubmit = async (data: UserData) => {
    setUserData(data);
    setView("dashboard");
  };

  const handleClear = () => {
    localStorage.removeItem("ai_fitness_user_data");
    localStorage.removeItem("ai_fitness_view");
    localStorage.removeItem("ai_fitness_plan"); // Clearing plan too if it exists
    setUserData(null);
    setView("landing");
  };

  if (!isLoaded) return null;

  return (
    <main className="min-h-screen">
      <AnimatePresence mode="wait">
        {view === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LandingHero onGetStarted={handleStart} />
          </motion.div>
        )}

        {view === "form" && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="pt-20"
          >
            <IntakeForm onSubmit={handleFormSubmit} />
          </motion.div>
        )}

        {view === "dashboard" && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Dashboard
              userData={userData!}
              onRegenerate={() => setView("form")}
              onReset={handleClear}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
