"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, X, Loader2, Bot, User, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export default function FitnessChat({ plan, userData }: { plan: any, userData: any }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: `Hey ${userData.name}! I'm your AI Coach. Any questions about your new plan?` }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMsg,
                    plan,
                    userData,
                    history: messages.slice(-6)
                }),
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error);

            setMessages(prev => [...prev, { role: "assistant", content: data.content }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I hit a snag. Try asking again!" }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-[100]">
            <AnimatePresence>
                {isOpen ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="mb-4"
                    >
                        <Card className="w-[400px] h-[600px] flex flex-col border-4 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.4)] bg-card/95 backdrop-blur-xl overflow-hidden">
                            <CardHeader className="bg-primary p-6 flex flex-row items-center justify-between shrink-0">
                                <CardTitle className="text-white flex items-center gap-3 text-xl font-black uppercase tracking-tighter">
                                    <Bot className="w-6 h-6" /> AI COACH
                                </CardTitle>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-white hover:bg-white/20 rounded-full"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </CardHeader>
                            <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
                                {messages.map((msg, idx) => (
                                    <div
                                        key={idx}
                                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`max-w-[80%] p-4 rounded-3xl text-sm font-bold leading-relaxed ${msg.role === "user"
                                                ? "bg-primary text-primary-foreground rounded-tr-none shadow-lg"
                                                : "bg-muted text-foreground rounded-tl-none border-2 border-border/50"
                                                }`}
                                        >
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-muted p-4 rounded-3xl rounded-tl-none border-2 border-border/50">
                                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <CardFooter className="p-6 pt-2 shrink-0 border-t bg-muted/30">
                                <div className="flex w-full gap-3">
                                    <Input
                                        placeholder="Ask about your diet or training..."
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        onKeyDown={e => e.key === "Enter" && handleSend()}
                                        className="h-14 rounded-2xl border-2 font-bold px-6 focus-visible:ring-primary shadow-inner"
                                    />
                                    <Button
                                        size="icon"
                                        onClick={handleSend}
                                        disabled={isLoading}
                                        className="h-14 w-14 shrink-0 rounded-2xl shadow-xl active:scale-95 transition-all"
                                    >
                                        <Send className="w-5 h-5" />
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    </motion.div>
                ) : (
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className="bg-primary text-white p-6 rounded-[2rem] shadow-2xl shadow-primary/40 border-4 border-white/20"
                    >
                        <div className="relative">
                            <MessageCircle className="w-10 h-10" />
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-primary rounded-full animate-pulse" />
                        </div>
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}
