import { NextResponse } from "next/server";

import { createGeminiClient } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const userData = await req.json();

    const prompt = `
      You are an expert AI Fitness & Nutrition Coach. Generate a hyper-personalized 7-day workout and diet plan for the following user:
      
      User Details:
      - Name: ${userData.name}
      - Age: ${userData.age}
      - Gender: ${userData.gender}
      - Weight: ${userData.weight}kg
      - Height: ${userData.height}cm
      - Goal: ${userData.goal}
      - Fitness Level: ${userData.level}
      - Workout Location: ${userData.location}
      - Dietary Preference: ${userData.diet}
      - Medical History/Injuries: ${userData.medical || "None"}
      - Stress Level (1-10): ${userData.stress}
      
      Requirements:
      1. Workout Plan: Provide a 7-day routine. Include specific exercises, sets, reps (or duration), and rest times.
      2. Diet Plan: Provide meal breakdowns for Breakfast, Lunch, Dinner, and Snacks. 
      3. Macros: Every meal MUST have a "macros" object with "p", "c", "f", and "cal" keys.
      4. Format: Return ONLY a valid JSON object. No markdown, no preamble.
      
      JSON Structure Template (STRICT):
      {
        "workout": [
          { "day": "Day 1", "title": "...", "exercises": [{ "name": "...", "sets": "...", "reps": "...", "rest": "...", "notes": "..." }] }
        ],
        "diet": {
          "breakfast": { "name": "...", "ingredients": ["..."], "macros": { "p": "...", "c": "...", "f": "...", "cal": "..." } },
          "lunch": { "name": "...", "ingredients": ["..."], "macros": { "p": "...", "c": "...", "f": "...", "cal": "..." } },
          "dinner": { "name": "...", "ingredients": ["..."], "macros": { "p": "...", "c": "...", "f": "...", "cal": "..." } },
          "snack": { "name": "...", "ingredients": ["..."], "macros": { "p": "...", "c": "...", "f": "...", "cal": "..." } }
        },
        "tips": ["...", "..."],
        "motivation": "..."
      }
    `;

    if (userData.demo) {
      return NextResponse.json(MOCK_PLAN);
    }

    const genAI = createGeminiClient();

    let text = "";
    // Expanded list of models including experimental and versioned aliases
    const modelNames = [
      "gemini-2.0-flash",
      "gemini-flash-latest",
      "gemini-pro-latest",
      "gemini-2.0-flash-exp",
      "gemini-1.5-flash",
      "gemini-1.5-pro"
    ];
    let lastError: unknown = null;

    for (const modelName of modelNames) {
      try {
        console.log(`[Gemini] Attempting ${modelName}...`);
        // Using explicit v1 version if v1beta fails
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        text = response.text();
        if (text) {
          console.log(`[Gemini] Success using ${modelName}`);
          break;
        }
      } catch (err: unknown) {
        const errMessage = err instanceof Error ? err.message : String(err);
        console.warn(`[Gemini] ${modelName} attempt failed:`, errMessage);
        lastError = err;
      }
    }

    if (!text) {
      throw lastError || new Error("All Gemini models were unavailable. Please check your API key permissions/region.");
    }

    if (!text) throw new Error("AI returned empty response");

    // Clean potential markdown formatting
    const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
    let plan: unknown;
    try {
      plan = JSON.parse(jsonString);
    } catch {
      throw new Error("AI response could not be parsed as valid JSON.");
    }

    return NextResponse.json(plan);
  } catch (error: unknown) {
    console.error("Gemini API Final Error:", error);

    let errorMessage = "Failed to generate plan";
    let statusCode = 500;

    const errorMessageRaw = error instanceof Error ? error.message : String(error);
    const normalizedMessage = errorMessageRaw.toLowerCase();

    if (
      normalizedMessage.includes("api_key_invalid") ||
      normalizedMessage.includes("api key not found") ||
      normalizedMessage.includes("api key not valid")
    ) {
      errorMessage = "Invalid Gemini API key. Generate a new key in Google AI Studio and enable the Generative Language API.";
      statusCode = 401;
    } else if (normalizedMessage.includes("missing gemini api key")) {
      errorMessage = "Gemini API key is not configured on the server.";
      statusCode = 500;
    } else if (normalizedMessage.includes("safety")) {
      errorMessage = "AI declined generation due to safety filters. Try a different goal.";
      statusCode = 400;
    } else if (
      (typeof error === "object" &&
        error !== null &&
        "status" in error &&
        (error as { status?: number }).status === 429) ||
      normalizedMessage.includes("rate limit")
    ) {
      errorMessage = "Rate limit reached. Please wait 60 seconds.";
      statusCode = 429;
    } else {
      errorMessage = errorMessageRaw || "An unexpected error occurred during plan generation.";
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? errorMessageRaw : undefined,
      },
      { status: statusCode }
    );
  }
}

const MOCK_PLAN = {
  workout: [
    {
      day: "Day 1",
      title: "Explosive Full Body",
      exercises: [
        { name: "Deadlifts", sets: "4", reps: "8", rest: "90s", notes: "Focus on form and core engagement." },
        { name: "Bench Press", sets: "3", reps: "10", rest: "60s", notes: "Controlled tempo for maximum contraction." },
        { name: "Weighted Pull-ups", sets: "3", reps: "8", rest: "60s", notes: "Full range of motion." }
      ]
    },
    {
      day: "Day 2",
      title: "Active Recovery",
      exercises: [
        { name: "Yoga Flow", sets: "1", reps: "20 min", rest: "N/A", notes: "Focus on deep breathing and flexibility." },
        { name: "Light Walking", sets: "1", reps: "30 min", rest: "N/A", notes: "Zone 2 cardio for blood flow." }
      ]
    },
    {
      day: "Day 3",
      title: "Leg Hypertrophy",
      exercises: [
        { name: "Squats", sets: "4", reps: "10", rest: "120s", notes: "Go deep into the pocket." },
        { name: "Walking Lunges", sets: "3", reps: "12/leg", rest: "60s", notes: "Keep torso upright." }
      ]
    },
    {
      day: "Day 4",
      title: "Push Power",
      exercises: [
        { name: "Overhead Press", sets: "4", reps: "8", rest: "90s", notes: "Strong core lockout." },
        { name: "Dips", sets: "3", reps: "12", rest: "60s", notes: "Focus on tricep stretch." }
      ]
    },
    {
      day: "Day 5",
      title: "Pull Specialization",
      exercises: [
        { name: "Barbell Rows", sets: "4", reps: "10", rest: "90s", notes: "Drive elbows back." },
        { name: "Face Pulls", sets: "3", reps: "15", rest: "45s", notes: "Control the eccentric phase." }
      ]
    },
    {
      day: "Day 6",
      title: "Core & Conditioning",
      exercises: [
        { name: "Plank", sets: "3", reps: "60s", rest: "30s", notes: "Max tension throughout body." },
        { name: "Burpees", sets: "4", reps: "15", rest: "45s", notes: "Explosive movement." }
      ]
    },
    {
      day: "Day 7",
      title: "Full Rest",
      exercises: [
        { name: "Rest Day", sets: "0", reps: "0", rest: "24h", notes: "Focus on nutrition and sleep." }
      ]
    }
  ],
  diet: {
    breakfast: {
      name: "Protein Power Oats",
      ingredients: ["Oats", "Whey Protein", "Blueberries", "Almond Butter"],
      macros: { p: "40g", c: "55g", f: "12g", cal: "500" }
    },
    lunch: {
      name: "Grilled Chicken Quinoa Bowl",
      ingredients: ["Chicken Breast", "Quinoa", "Spinach", "Avocado"],
      macros: { p: "45g", c: "40g", f: "15g", cal: "550" }
    },
    dinner: {
      name: "Pan-Seared Salmon with Greens",
      ingredients: ["Salmon", "Asparagus", "Sweet Potato", "Lemon"],
      macros: { p: "35g", c: "30g", f: "20g", cal: "480" }
    },
    snack: {
      name: "Greek Yogurt & Walnuts",
      ingredients: ["Greek Yogurt", "Walnuts", "Honey"],
      macros: { p: "20g", c: "15g", f: "10g", cal: "250" }
    }
  },
  tips: [
    "Hydrate with 4L water daily.",
    "Sleep 8 hours for optimal recovery.",
    "Maintain 1g protein per lb of bodyweight."
  ],
  motivation: "The only limit is the one you set yourself. Push harder than yesterday."
};
