
// Script simple sans dépendance externe (Node 18+ a fetch)
const fs = require('fs');
const path = require('path');

// Lire .env.local manuellement
function getEnv(key) {
    try {
        const envPath = path.join(__dirname, '..', '.env.local');
        const content = fs.readFileSync(envPath, 'utf8');
        const match = content.match(new RegExp(`${key}=(.*)`));
        return match ? match[1].trim() : null;
    } catch (e) {
        return null;
    }
}

async function listModels() {
    const key = getEnv('NEXT_PUBLIC_GEMINI_API_KEY');

    if (!key) {
        console.error("No API Key found in .env.local");
        return;
    }

    console.log("Using Key ending in:", key.slice(-4));

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);

        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
            const text = await response.text();
            console.error("Response:", text);
            return;
        }

        const data = await response.json();

        if (data.models) {
            console.log("--- Available Gemini Models ---");
            data.models.forEach(m => {
                // models/gemini-1.5-flash
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`Model: ${m.name}`);
                }
            });
            console.log("-------------------------------");
        } else {
            console.log("Error listing models:", data);
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

listModels();
