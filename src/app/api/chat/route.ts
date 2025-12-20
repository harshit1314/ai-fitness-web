import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { message, plan, userData, history } = await req.json();

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
            .map((msg: any) => ({
                role: msg.role === "user" ? "user" : "model",
                parts: [{ text: msg.content }],
            }));

        // Find the first user message index
        const firstUserIndex = formattedHistory.findIndex((m: any) => m.role === "user");
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
    } catch (error: any) {
        console.error("Chat API Error:", error);
        return NextResponse.json({ error: "Failed to get advice" }, { status: 500 });
    }
}
