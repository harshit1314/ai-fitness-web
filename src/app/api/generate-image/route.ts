import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { name, type } = await req.json();

        const prompt = type === "exercise"
            ? `A realistic, high-quality, professional gym photography of a person performing ${name}, cinematic lighting, photorealistic, 8k resolution, fitness motivation style.`
            : `Top-down professional food photography of ${name}, gourmet style, high-end restaurant plating, healthy ingredients visible, bright natural lighting.`;

        const query = encodeURIComponent(prompt);
        const imageUrl = `https://image.pollinations.ai/prompt/${query}?width=1024&height=1024&model=flux&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;

        // We return the URL directly as Pollinations is a direct image endpoint
        return NextResponse.json({ url: imageUrl });
    } catch (error: any) {
        console.error("Image Generation Error:", error);
        return NextResponse.json({ error: "Failed to generate image", details: error.message }, { status: 500 });
    }
}
