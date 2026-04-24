import { NextResponse } from "next/server";

import { createGeminiClient } from "@/lib/gemini";

type ChatMessage = {
    role: string;
    content: string;
};

export async function POST(req: Request) {
    try {
        const { message, plan, userData, history } = await req.json() as {
            message: string;
            plan: unknown;
            userData: {
                name: string;
                goal: string;
                level: string;
                diet: string;
            };
            history: ChatMessage[];
        };
        const genAI = createGeminiClient();

        const model = genAI.getGenerativeModel({
            model: "gemini-flash-latest",
            systemInstruction: `
                You are an elite AI Fitness & Nutrition Coach. You are chatting with ${userData.name}.
                
                User Context:
                - Goal: ${userData.goal}
                - Level: ${userData.level}
                - Diet: ${userData.diet}
                
                Current Plan:
                ${JSON.stringify(plan)}
                
                Instructions:
                1. Be motivating, professional, and concise.
                2. Answer questions based on their current plan.
                3. If they ask to swap an exercise or food, provide a healthy alternative that fits their goals.
                4. Use bold text for key terms.
                5. Keep responses short and actionable.
                6. Do not give medical advice.
            `,
        });

        // Ensure history starts with a user message
        const formattedHistory = history
            .map((msg) => ({
                role: msg.role === "user" ? "user" : "model",
                parts: [{ text: msg.content }],
            }));

        // Find the first user message index
        const firstUserIndex = formattedHistory.findIndex((msg) => msg.role === "user");
        const finalHistory = firstUserIndex !== -1 ? formattedHistory.slice(firstUserIndex) : [];

        const chat = model.startChat({
            history: finalHistory,
            generationConfig: {
                maxOutputTokens: 500,
            },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ content: text });
    } catch (error: unknown) {
        console.error("Chat API Error:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        const normalizedMessage = errorMessage.toLowerCase();

        if (
            normalizedMessage.includes("api_key_invalid") ||
            normalizedMessage.includes("api key not found") ||
            normalizedMessage.includes("api key not valid")
        ) {
            return NextResponse.json(
                { error: "Invalid Gemini API key. Please update your server key in .env.local." },
                { status: 401 }
            );
        }

        if (normalizedMessage.includes("missing gemini api key")) {
            return NextResponse.json(
                { error: "Gemini API key is not configured on the server." },
                { status: 500 }
            );
        }

        return NextResponse.json({ error: "Failed to get advice" }, { status: 500 });
    }
}
