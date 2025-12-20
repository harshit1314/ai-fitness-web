const fs = require('fs');
const path = require('path');

// Read key from .env.local
try {
    const envContent = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
    const match = envContent.match(/NEXT_PUBLIC_GEMINI_API_KEY=(.*)/);
    const apiKey = match ? match[1].trim() : null;

    if (!apiKey) {
        console.error("❌ No NEXT_PUBLIC_GEMINI_API_KEY found in .env.local");
        process.exit(1);
    }

    console.log("🔍 Fetching available models for your API key...");

    fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                console.error("❌ API Error:", data.error.message);
            } else if (data.models) {
                console.log("\n✅ Available Models:");
                data.models.forEach(m => {
                    console.log(`- ${m.name.replace('models/', '')} (${m.displayName})`);
                    console.log(`  Methods: ${m.supportedGenerationMethods.join(', ')}`);
                });
                console.log("\nNote: Use the names above in your route.ts (e.g., 'gemini-1.5-flash')");
            } else {
                console.log("❓ No models found or unexpected response structure.");
                console.log(JSON.stringify(data, null, 2));
            }
        })
        .catch(err => {
            console.error("❌ Fetch Error:", err.message);
        });

} catch (err) {
    console.error("❌ Fatal Error reading .env.local:", err.message);
}
