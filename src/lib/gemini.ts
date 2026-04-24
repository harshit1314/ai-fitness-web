import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_KEY_ENV_NAMES = [
  "GEMINI_API_KEY",
  "GOOGLE_GENERATIVE_AI_API_KEY",
  "NEXT_PUBLIC_GEMINI_API_KEY",
] as const;

export function resolveGeminiApiKey(): string | null {
  for (const envName of GEMINI_KEY_ENV_NAMES) {
    const value = process.env[envName]?.trim();
    if (value) {
      return value;
    }
  }

  return null;
}

export function createGeminiClient(): GoogleGenerativeAI {
  const apiKey = resolveGeminiApiKey();

  if (!apiKey) {
    throw new Error(
      `Missing Gemini API key. Set one of: ${GEMINI_KEY_ENV_NAMES.join(", ")}`
    );
  }

  return new GoogleGenerativeAI(apiKey);
}
