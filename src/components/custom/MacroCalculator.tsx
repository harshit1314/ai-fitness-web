"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calculator, Flame, Beef, Wheat, Droplets } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

export default function MacroCalculator() {
    const [weight, setWeight] = useState<number>(70);
    const [activity, setActivity] = useState<number>(1.2);
    const [calories, setCalories] = useState<number>(0);
    const [macros, setMacros] = useState({ p: 0, c: 0, f: 0 });

    useEffect(() => {
        const tdee = weight * 22 * activity;
        setCalories(Math.round(tdee));
        setMacros({
            p: Math.round(weight * 2), // 2g per kg
            f: Math.round((tdee * 0.25) / 9), // 25% fats
            c: Math.round((tdee - (weight * 2 * 4) - (tdee * 0.25)) / 4) // remaining carbs
        });
    }, [weight, activity]);

    return (
        <Card className="rounded-[3rem] border-4 overflow-hidden bg-card shadow-2xl">
            <CardHeader className="p-10 pb-6 border-b-2">
                <CardTitle className="text-xl font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-4">
                    <Calculator className="w-8 h-8 text-primary" />
                    QUICK MACRO ENGINE
                </CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-12">
                <div className="space-y-6">
                    <div className="flex justify-between items-end">
                        <Label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Current Weight (kg)</Label>
                        <span className="text-3xl font-black text-primary font-mono">{weight}</span>
                    </div>
                    <Slider
                        value={[weight]}
                        onValueChange={(val) => setWeight(val[0])}
                        max={150}
                        min={40}
                        step={1}
                    />
                </div>

                <div className="space-y-6">
                    <div className="flex justify-between items-end">
                        <Label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Activity Multiplier</Label>
                        <span className="text-3xl font-black text-primary font-mono">{activity.toFixed(1)}x</span>
                    </div>
                    <Slider
                        value={[activity]}
                        onValueChange={(val) => setActivity(val[0])}
                        max={2}
                        min={1.2}
                        step={0.1}
                    />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
                    <div className="bg-primary/5 p-6 rounded-3xl border-2 border-primary/20 flex flex-col items-center gap-2">
                        <Flame className="w-6 h-6 text-orange-500" />
                        <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">Calories</span>
                        <span className="text-2xl font-black">{calories}</span>
                    </div>
                    <div className="bg-primary/5 p-6 rounded-3xl border-2 border-primary/20 flex flex-col items-center gap-2">
                        <Beef className="w-6 h-6 text-blue-500" />
                        <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">Protein</span>
                        <span className="text-2xl font-black">{macros.p}g</span>
                    </div>
                    <div className="bg-primary/5 p-6 rounded-3xl border-2 border-primary/20 flex flex-col items-center gap-2">
                        <Wheat className="w-6 h-6 text-amber-500" />
                        <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">Carbs</span>
                        <span className="text-2xl font-black">{macros.c}g</span>
                    </div>
                    <div className="bg-primary/5 p-6 rounded-3xl border-2 border-primary/20 flex flex-col items-center gap-2">
                        <Droplets className="w-6 h-6 text-rose-500" />
                        <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">Fats</span>
                        <span className="text-2xl font-black">{macros.f}g</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
