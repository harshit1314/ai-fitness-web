"use client";

import { useState, useEffect } from "react";
import { UserData } from "./IntakeForm";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Download, Volume2, Image as ImageIcon, Dumbbell, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { ModeToggle } from "./ModeToggle";
import FitnessChat from "./FitnessChat";
import MacroCalculator from "./MacroCalculator";

export default function Dashboard({ userData, onRegenerate, onReset }: { userData: UserData, onRegenerate: () => void, onReset: () => void }) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [plan, setPlan] = useState<any>(null);
    const [selectedItem, setSelectedItem] = useState<{ type: "exercise" | "food", name: string } | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [jsPDFLib, setJsPDFLib] = useState<any>(null);

    useEffect(() => {
        const fetchPlan = async () => {
            const savedPlan = localStorage.getItem("ai_fitness_plan");
            if (savedPlan) {
                try {
                    const parsed = JSON.parse(savedPlan);
                    if (parsed.workout && parsed.diet) {
                        setPlan(parsed);
                        setIsLoading(false);
                        return;
                    }
                } catch (e) {
                    console.error("Failed to parse saved plan", e);
                }
            }

            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch("/api/generate-plan", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(userData),
                });

                const data = await response.json();

                if (!response.ok || data.error) {
                    throw new Error(data.error || "Failed to generate plan");
                }

                if (!data.workout || !data.diet) {
                    throw new Error("Invalid plan structure received from AI");
                }

                setPlan(data);
                localStorage.setItem("ai_fitness_plan", JSON.stringify(data));
            } catch (err: any) {
                console.error("Failed to generate plan:", err);
                setError(err.message || "An unexpected error occurred");
            } finally {
                setIsLoading(false);
            }
        };

        fetchPlan();

        // Pre-import jsPDF to avoid lag on first click
        import("jspdf").then(module => {
            setJsPDFLib(module.jsPDF);
        });
    }, [userData]);

    useEffect(() => {
        if (selectedItem) {
            const fetchImage = async () => {
                setIsGeneratingImage(true);
                setGeneratedImage(null);
                try {
                    const response = await fetch("/api/generate-image", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(selectedItem),
                    });
                    const data = await response.json();
                    setGeneratedImage(data.url);
                } catch (error) {
                    console.error("Failed to generate image:", error);
                } finally {
                    setIsGeneratingImage(false);
                }
            };
            fetchImage();
        }
    }, [selectedItem]);

    const speakPlan = async (section: "workout" | "diet") => {
        if (!plan || isSpeaking || error) return;
        setIsSpeaking(true);

        const text = section === "workout"
            ? `Workout Plan for ${userData.name}. ${plan.workout.map((d: any) => `${d.day} is ${d.title}. Recommended exercises: ${d.exercises.map((e: any) => e.name).join(", ")}.`).join(" ")}`
            : `Diet Plan for ${userData.name}. ${Object.entries(plan.diet).map(([type, meal]: any) => `${type} is ${meal.name}.`).join(" ")}`;

        try {
            const response = await fetch("/api/text-to-speech", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            });

            if (!response.ok) throw new Error("Voice failed");

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audio.onended = () => setIsSpeaking(false);
            audio.play();
        } catch (error) {
            console.error("Audio error:", error);
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.onend = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
        }
    };

    const exportPDF = async () => {
        setIsExporting(true);
        try {
            const doc = jsPDFLib ? new jsPDFLib() : new (await import("jspdf")).jsPDF();

            doc.setFontSize(22);
            doc.text(`AI Fitness Plan - ${userData.name}`, 20, 20);

            doc.setFontSize(16);
            doc.text("Workout Plan", 20, 40);
            doc.setFontSize(12);
            let y = 50;
            plan.workout.forEach((day: any) => {
                doc.text(`${day.day}: ${day.title}`, 20, y);
                y += 10;
                day.exercises.forEach((ex: any) => {
                    doc.text(`- ${ex.name}: ${ex.sets} sets x ${ex.reps} reps`, 30, y);
                    y += 7;
                    if (y > 280) { doc.addPage(); y = 20; }
                });
                y += 5;
                if (y > 280) { doc.addPage(); y = 20; }
            });

            doc.addPage();
            y = 20;
            doc.setFontSize(16);
            doc.text("Diet Plan", 20, y);
            y += 15;
            doc.setFontSize(12);
            Object.entries(plan.diet).forEach(([type, meal]: any) => {
                doc.text(`${type.toUpperCase()}: ${meal.name}`, 20, y);
                y += 10;
                doc.text(`Ingredients: ${meal.ingredients.join(", ")}`, 30, y);
                y += 10;
                if (y > 280) { doc.addPage(); y = 20; }
            });

            doc.save(`${userData.name}_fitness_plan.pdf`);
        } catch (error) {
            console.error("PDF Export Error:", error);
        } finally {
            setIsExporting(false);
        }
    };

    if (isLoading || !plan) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-8 bg-background">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                    <Dumbbell className="w-24 h-24 text-primary" />
                </motion.div>
                <div className="text-center space-y-4 max-w-md px-6">
                    <h2 className="text-4xl font-black tracking-tighter uppercase leading-tight">Forging Your Future Self</h2>
                    <p className="text-muted-foreground text-xl italic font-medium">AI is currently analyzing thousands of data points to create your elite-level plan...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 px-4 min-h-screen pb-20">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-8"
            >
                <div>
                    <h1 className="text-5xl font-black mb-2 tracking-tighter leading-none">THE <span className="text-primary italic">PRIME</span> PLAN</h1>
                    <p className="text-lg text-muted-foreground font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                        <Zap className="w-5 h-5 fill-primary text-primary" />
                        FOR {userData.name}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="lg" onClick={onRegenerate} className="h-16 px-10 rounded-[2rem] border-4 font-black text-lg hover:bg-primary hover:text-primary-foreground transition-all">
                        <RefreshCw className="w-6 h-6 mr-3" /> RESTART
                    </Button>
                    <Button size="lg" onClick={exportPDF} disabled={isExporting} className="h-16 px-10 rounded-[2rem] border-0 shadow-2xl shadow-primary/20 font-black text-lg">
                        {isExporting ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Download className="w-6 h-6 mr-3" /> EXPORT PDF</>}
                    </Button>
                    <Button variant="outline" size="lg" onClick={onReset} className="h-16 px-10 rounded-[2rem] border-4 border-destructive text-destructive font-black text-lg hover:bg-destructive hover:text-white transition-all">
                        RESET
                    </Button>
                    <ModeToggle />
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-10 p-10 bg-primary/5 rounded-[3rem] border-2 border-primary/10 relative overflow-hidden group shadow-lg"
            >
                <div className="relative z-10 max-w-4xl">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-black tracking-[0.3em] uppercase mb-4">Quote of the Day</span>
                    <h2 className="text-2xl md:text-3xl font-black italic tracking-tight leading-snug text-primary mb-4">
                        "{plan.motivation}"
                    </h2>
                    <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">— Your AI Coach</p>
                </div>
                <Zap className="absolute top-1/2 right-0 -translate-y-1/2 w-48 h-48 opacity-5 -mr-10 group-hover:rotate-12 transition-transform duration-1000" />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-16">
                    <Tabs defaultValue="workout" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-8 p-1.5 bg-muted/20 rounded-[2rem] h-20">
                            <TabsTrigger value="workout" className="text-xl font-black rounded-[1.5rem] data-[state=active]:bg-background data-[state=active]:shadow-lg uppercase tracking-[0.05em]">
                                🏋️ WORKOUT
                            </TabsTrigger>
                            <TabsTrigger value="diet" className="text-xl font-black rounded-[1.5rem] data-[state=active]:bg-background data-[state=active]:shadow-lg uppercase tracking-[0.05em]">
                                🥗 DIET
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="workout" className="space-y-6">
                            {plan.workout.map((day: any, idx: number) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ delay: idx * 0.02, duration: 0.3 }}
                                >
                                    <Card className="overflow-hidden border-2 rounded-[2rem] hover:border-primary/40 transition-all group shadow-xl bg-card/50 backdrop-blur-sm">
                                        <CardHeader className="bg-primary/5 p-8 border-b">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <span className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-black tracking-[0.3em] uppercase mb-3 inline-block shadow-md">
                                                        {day.day}
                                                    </span>
                                                    <CardTitle className="text-2xl font-black tracking-tight">{day.title}</CardTitle>
                                                </div>
                                                <Dumbbell className="w-10 h-10 opacity-10 group-hover:rotate-6 transition-all" />
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-10">
                                            <div className="grid gap-6">
                                                {day.exercises.map((ex: any, eIdx: number) => (
                                                    <div key={eIdx} className="flex items-center justify-between p-8 rounded-[2rem] bg-muted/20 hover:bg-muted/50 border-2 border-transparent hover:border-primary/20 transition-all group/item shadow-sm">
                                                        <div className="flex-1">
                                                            <h4 className="font-extrabold text-2xl flex items-center gap-4">
                                                                {ex.name}
                                                                <button
                                                                    onClick={() => setSelectedItem({ type: "exercise", name: ex.name })}
                                                                    className="p-3 rounded-2xl bg-primary/10 text-primary opacity-0 group-hover/item:opacity-100 transition-all hover:scale-110 active:scale-95 shadow-inner"
                                                                >
                                                                    <ImageIcon className="w-5 h-5" />
                                                                </button>
                                                            </h4>
                                                            <p className="text-muted-foreground font-semibold text-lg mt-2 italic">"{ex.notes}"</p>
                                                        </div>
                                                        <div className="flex gap-10 bg-background/50 p-6 rounded-3xl border-2 border-border/30">
                                                            <div className="flex flex-col items-center">
                                                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">Sets</span>
                                                                <span className="text-3xl font-black font-mono">{ex.sets}</span>
                                                            </div>
                                                            <div className="w-px bg-border/50 h-full" />
                                                            <div className="flex flex-col items-center">
                                                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">Reps</span>
                                                                <span className="text-3xl font-black font-mono">{ex.reps}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </TabsContent>

                        <TabsContent value="diet" className="space-y-10">
                            {Object.entries(plan.diet).map(([type, meal]: any, idx: number) => (
                                <motion.div
                                    key={type}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                >
                                    <Card className="border-4 rounded-[3rem] overflow-hidden hover:border-green-600/50 transition-all shadow-2xl bg-card/50 backdrop-blur-sm">
                                        <div className="grid md:grid-cols-3">
                                            <div className="p-12 bg-green-500/10 flex flex-col justify-center border-b md:border-b-0 md:border-r-2 border-border/50">
                                                <span className="text-sm font-black text-green-700 uppercase tracking-[0.4em] mb-4">{type}</span>
                                                <h3 className="text-4xl font-black tracking-tighter leading-tight flex items-center gap-4">
                                                    {meal.name}
                                                    <button
                                                        onClick={() => setSelectedItem({ type: "food", name: meal.name })}
                                                        className="p-3 rounded-2xl bg-green-600/10 text-green-700 hover:scale-110 transition-transform active:scale-95"
                                                    >
                                                        <ImageIcon className="w-5 h-5" />
                                                    </button>
                                                </h3>
                                            </div>
                                            <div className="p-12 md:col-span-2 bg-card">
                                                <div className="grid grid-cols-4 gap-6 mb-10">
                                                    <MacroBox label="Cals" value={meal.macros?.cal || "N/A"} color="bg-orange-500" />
                                                    <MacroBox label="Prot" value={meal.macros?.p || "N/A"} color="bg-blue-600" />
                                                    <MacroBox label="Carb" value={meal.macros?.c || "N/A"} color="bg-amber-500" />
                                                    <MacroBox label="Fat" value={meal.macros?.f || "N/A"} color="bg-rose-600" />
                                                </div>
                                                <div className="flex flex-wrap gap-3">
                                                    {meal.ingredients.map((ing: string, iIdx: number) => (
                                                        <span key={iIdx} className="px-6 py-3 rounded-2xl bg-muted text-sm font-black uppercase tracking-widest border-2 border-transparent hover:border-green-500/30 transition-all">
                                                            {ing}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="space-y-12">
                    <Card className="bg-gradient-to-br from-primary to-blue-700 text-primary-foreground rounded-[3rem] overflow-hidden shadow-2xl shadow-primary/30 border-0">
                        <CardHeader className="p-10 pb-6">
                            <CardTitle className="flex items-center gap-4 text-4xl font-black italic tracking-tighter">
                                <Volume2 className="w-10 h-10" />
                                VIRTUAL COACH
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-10 pt-6 space-y-6">
                            <Button
                                variant="secondary"
                                className="w-full h-20 text-2xl font-black rounded-3xl gap-4 shadow-xl hover:scale-[1.03] transition-all active:scale-95"
                                onClick={() => speakPlan("workout")}
                                disabled={isSpeaking}
                            >
                                {isSpeaking ? <Loader2 className="w-8 h-8 animate-spin" /> : <><Dumbbell className="w-6 h-6" /> READ WORKOUT</>}
                            </Button>
                            <Button
                                variant="secondary"
                                className="w-full h-20 text-2xl font-black rounded-3xl gap-4 shadow-xl hover:scale-[1.03] transition-all active:scale-95"
                                onClick={() => speakPlan("diet")}
                                disabled={isSpeaking}
                            >
                                {isSpeaking ? <Loader2 className="w-8 h-8 animate-spin" /> : <><Utensils className="w-6 h-6" /> READ DIET</>}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2.5rem] border-2 overflow-hidden bg-card shadow-xl">
                        <CardHeader className="p-8 pb-4 border-b">
                            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-3">
                                <Zap className="w-6 h-6 text-primary fill-primary" />
                                MINDSET SHIFT
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <blockquote className="text-2xl font-black italic leading-tight text-primary mb-8 relative">
                                "{plan.motivation}"
                            </blockquote>
                            <div className="space-y-4">
                                {plan.tips.map((tip: string, tIdx: number) => (
                                    <div key={tIdx} className="flex items-start gap-4 group/tip">
                                        <span className="w-8 h-8 rounded-xl bg-primary/10 flex-shrink-0 flex items-center justify-center text-sm text-primary font-black group-hover/tip:bg-primary group-hover/tip:text-white transition-all shadow-inner">
                                            {tIdx + 1}
                                        </span>
                                        <p className="text-muted-foreground text-xs font-bold uppercase tracking-wide leading-relaxed pt-1">
                                            {tip}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <MacroCalculator />
                </div>
            </div>

            <AnimatePresence>
                {selectedItem && (
                    <div
                        className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-background/95 backdrop-blur-3xl"
                        onClick={() => setSelectedItem(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, rotateX: 20 }}
                            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                            exit={{ opacity: 0, scale: 0.8, rotateX: 20 }}
                            className="bg-card border-4 border-primary/30 rounded-[4rem] overflow-hidden max-w-3xl w-full shadow-[0_50px_100px_rgba(0,0,0,0.5)]"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="aspect-square bg-muted flex items-center justify-center relative overflow-hidden group">
                                {generatedImage ? (
                                    <motion.img
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        src={generatedImage}
                                        alt={selectedItem.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <>
                                        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
                                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-16 text-center">
                                            {isGeneratingImage ? (
                                                <>
                                                    <div className="relative mb-10">
                                                        <motion.div
                                                            animate={{ rotate: 360 }}
                                                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                                            className="w-24 h-24 border-b-4 border-primary rounded-full"
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <ImageIcon className="w-8 h-8 text-primary animate-pulse" />
                                                        </div>
                                                    </div>
                                                    <h4 className="text-4xl font-black uppercase tracking-tighter mb-4">Neural Visualization</h4>
                                                    <p className="text-xl font-bold text-muted-foreground italic">
                                                        Synthesizing pixels for "{selectedItem.name.toUpperCase()}"...
                                                    </p>
                                                </>
                                            ) : (
                                                <div className="space-y-6">
                                                    <Zap className="w-20 h-20 text-destructive mx-auto animate-bounce" />
                                                    <p className="text-2xl font-black uppercase">Visual Cortex Offline</p>
                                                    <Button size="lg" onClick={() => setSelectedItem(null)} variant="destructive">BACK TO REALITY</Button>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="p-12 flex justify-between items-center bg-card border-t-4 border-border/50">
                                <div>
                                    <span className="text-xs font-black text-primary uppercase tracking-[0.5em] mb-2 block">{selectedItem.type} visualizer</span>
                                    <h3 className="text-5xl font-black tracking-tighter leading-none">{selectedItem.name.toUpperCase()}</h3>
                                </div>
                                <Button
                                    size="lg"
                                    className="h-20 px-12 rounded-[2rem] font-black text-xl shadow-2xl"
                                    onClick={() => setSelectedItem(null)}
                                >
                                    DISMISS
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <FitnessChat plan={plan} userData={userData} />
        </div>
    );
}

function MacroBox({ label, value, color }: { label: string, value: string, color: string }) {
    return (
        <div className="flex flex-col items-center flex-1">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-3">{label}</span>
            <div className={`w-full py-6 px-2 rounded-[1.5rem] ${color} text-white font-mono text-center text-xl font-black shadow-xl ring-4 ring-white/10`}>
                {value}
            </div>
        </div>
    );
}

function Utensils(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
            <path d="M7 2v20" />
            <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
        </svg>
    )
}
