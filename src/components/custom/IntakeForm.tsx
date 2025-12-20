"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";

export type UserData = {
    name: string;
    age: string;
    gender: string;
    weight: string;
    height: string;
    goal: string;
    level: string;
    location: string;
    diet: string;
    medical: string;
    stress: string;
};

const INITIAL_DATA: UserData = {
    name: "",
    age: "25",
    gender: "other",
    weight: "70",
    height: "175",
    goal: "maintenance",
    level: "intermediate",
    location: "gym",
    diet: "veg",
    medical: "",
    stress: "3",
};

export default function IntakeForm({ onSubmit }: { onSubmit: (data: UserData) => void }) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<UserData>(INITIAL_DATA);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const updateFields = (fields: Partial<UserData>) => {
        setFormData((prev) => ({ ...prev, ...fields }));
    };

    const next = () => setStep((s) => Math.min(s + 1, 5));
    const back = () => setStep((s) => Math.max(s - 1, 1));

    const handleSubmit = async () => {
        setIsSubmitting(true);
        // Simulate slight delay for effect
        await new Promise(resolve => setTimeout(resolve, 800));
        onSubmit(formData);
        setIsSubmitting(false);
    };

    const stepVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 },
    };

    return (
        <div className="max-w-2xl mx-auto py-10 px-4">
            <Card className="border-border/50 shadow-xl overflow-hidden backdrop-blur-sm bg-card/80">
                <div className="h-2 w-full bg-muted">
                    <motion.div
                        className="h-full bg-primary"
                        initial={{ width: "20%" }}
                        animate={{ width: `${(step / 5) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>

                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Step {step} of 5</CardTitle>
                    <CardDescription>Tell us about yourself to tailor your plan.</CardDescription>
                </CardHeader>

                <CardContent className="min-h-[350px]">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                variants={stepVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="Enter your name"
                                        value={formData.name}
                                        onChange={e => updateFields({ name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="age">Age</Label>
                                        <Input
                                            id="age"
                                            type="number"
                                            value={formData.age}
                                            onChange={e => updateFields({ age: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Gender</Label>
                                        <Select value={formData.gender} onValueChange={v => updateFields({ gender: v })}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="male">Male</SelectItem>
                                                <SelectItem value="female">Female</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                variants={stepVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="weight">Weight (kg)</Label>
                                        <Input
                                            id="weight"
                                            type="number"
                                            value={formData.weight}
                                            onChange={e => updateFields({ weight: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="height">Height (cm)</Label>
                                        <Input
                                            id="height"
                                            type="number"
                                            value={formData.height}
                                            onChange={e => updateFields({ height: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                variants={stepVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <Label>Fitness Goal</Label>
                                    <Select value={formData.goal} onValueChange={v => updateFields({ goal: v })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="weight-loss">Weight Loss</SelectItem>
                                            <SelectItem value="muscle-gain">Muscle Gain</SelectItem>
                                            <SelectItem value="maintenance">Maintenance</SelectItem>
                                            <SelectItem value="athletic-perf">Athletic Performance</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Current Fitness Level</Label>
                                    <Select value={formData.level} onValueChange={v => updateFields({ level: v })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="beginner">Beginner</SelectItem>
                                            <SelectItem value="intermediate">Intermediate</SelectItem>
                                            <SelectItem value="advanced">Advanced</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div
                                key="step4"
                                variants={stepVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <Label>Workout Location</Label>
                                    <Select value={formData.location} onValueChange={v => updateFields({ location: v })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="home">Home / No Equipment</SelectItem>
                                            <SelectItem value="gym">Gym / Full Equipment</SelectItem>
                                            <SelectItem value="outdoor">Outdoor / Park</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Dietary Preference</Label>
                                    <Select value={formData.diet} onValueChange={v => updateFields({ diet: v })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="veg">Vegetarian</SelectItem>
                                            <SelectItem value="non-veg">Non-Vegetarian</SelectItem>
                                            <SelectItem value="vegan">Vegan</SelectItem>
                                            <SelectItem value="keto">Keto</SelectItem>
                                            <SelectItem value="paleo">Paleo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </motion.div>
                        )}

                        {step === 5 && (
                            <motion.div
                                key="step5"
                                variants={stepVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="medical">Medical History / Injuries (Optional)</Label>
                                    <Input
                                        id="medical"
                                        placeholder="e.g. Lower back pain, Asthma"
                                        value={formData.medical}
                                        onChange={e => updateFields({ medical: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <Label>Stress Level (1-10)</Label>
                                        <span className="font-bold text-primary">{formData.stress}</span>
                                    </div>
                                    <Slider
                                        value={[parseInt(formData.stress)]}
                                        onValueChange={v => updateFields({ stress: v[0].toString() })}
                                        max={10}
                                        min={1}
                                        step={1}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>

                <CardFooter className="flex justify-between border-t border-border pt-6">
                    <Button
                        variant="ghost"
                        onClick={back}
                        disabled={step === 1 || isSubmitting}
                        className="gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back
                    </Button>

                    {step < 5 ? (
                        <Button onClick={next} className="gap-2">
                            Next <ArrowRight className="w-4 h-4" />
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} className="gap-2" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Generating Plan...
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4" />
                                    Generate My Plan
                                </>
                            )}
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
