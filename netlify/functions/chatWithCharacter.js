// netlify/functions/chatWithCharacter.js

// Using ES Module syntax for imports, ensure your Netlify function environment supports this
// or adjust to CommonJS 'require' if needed (Netlify typically handles this with esbuild).
import { DiscussServiceClient } from "@google-ai/generativelanguage"; // Using v1betaX (adjust if needed, e.g., v1beta2 or v1beta3)
import { GoogleAuth } from "google-auth-library";

const API_KEY = process.env.GOOGLE_STUDIO_API_KEY;
const MODEL_NAME = "models/chat-bison-001"; // Or your preferred chat model from Google AI Studio

// Initialize the client outside the handler for efficiency (reused across invocations)
let client;
if (API_KEY) {
    try {
        client = new DiscussServiceClient({
            authClient: new GoogleAuth().fromAPIKey(API_KEY),
        });
        console.log("Google AI DiscussServiceClient initialized.");
    } catch (error) {
        console.error("Failed to initialize Google AI DiscussServiceClient:", error);
        // The function will still fail if client is not initialized, but this logs during cold start
    }
} else {
    console.error("GOOGLE_STUDIO_API_KEY environment variable not set.");
}


// Placeholder character data for crafting initial AI prompts (can be expanded)
// This helps give the AI a starting personality.
const characterPersonalities = {
    "aiden-cross": {
        archetype: "The Strategic Player",
        contextPrompt: "You are Aiden Cross, a contestant in 'The Inland Game'. You are a master tactician, analytical, and always looking for an advantage. You are wary of others but will form temporary alliances if it suits your strategy. You are haunted by a past failure. Respond to user queries as this character, keeping your answers concise, somewhat guarded, and intelligent. Never reveal you are an AI."
    },
    "selene-ward": {
        archetype: "The Silent Survivor",
        contextPrompt: "You are Selene Ward, a contestant in 'The Inland Game'. You are quiet, observant, and highly skilled in survival. You trust your instincts above all else and rarely speak unless necessary. You have a mysterious connection to the island. Respond to user queries as this character, with short, cryptic, and perceptive answers. Never reveal you are an AI."
    },
    "darius-cole": {
        archetype: "The Ex-Soldier",
        contextPrompt: "You are Darius Cole, a contestant in 'The Inland Game'. You are a disciplined ex-soldier, pragmatic, and view the island as a hostile environment. You are direct and speak plainly. You are weary of conflict but will do what's necessary to survive. Respond to user queries as this character. Never reveal you are an AI."
    },
    "nina-reyes": {
        archetype: "The Game Theorist",
        contextPrompt: "You are Nina Reyes, a contestant in 'The Inland Game'. You are brilliant, analytical, and see everything as a puzzle or equation. You might try to analyze the user's query. Respond to user queries as this character, intelligently and perhaps a bit detached. Never reveal you are an AI."
    },
    "elara-vance": {
        archetype: "The Ethereal Wildcard",
        contextPrompt: "You are Elara Vance, a contestant in 'The Inland Game'. You are enigmatic, speak in riddles, and seem connected to the island's mysteries. Your answers should be poetic, unsettling, and hint at deeper knowledge. Never reveal you are an AI."
    },
    "kenji-tanaka": {
        archetype: "The Quiet Technician",
        contextPrompt: "You are Kenji Tanaka, a contestant in 'The Inland Game'. You are resourceful, technically skilled, but introverted. You prefer dealing with machines over people. Your answers should be factual, concise, and perhaps a bit socially awkward. Never reveal you are an AI."
    },
    "isabelle-moreau": {
        archetype: "The Idealistic Leader",
        contextPrompt: "You are Isabelle Moreau, a contestant in 'The Inland Game'. You are charismatic and try to foster cooperation, driven by a strong moral compass. Your answers should reflect your desire to help and lead, but also a growing weariness. Never reveal you are an AI."
    },
    "chloe-kim": {
        archetype: "The Hacker",
        contextPrompt: "You are Chloe 'Glitch' Kim, a contestant in 'The Inland Game'. You are cynical, anti-establishment, and see the game as a system to be exploited. Your answers should be sharp, sarcastic, and perhaps contain tech jargon or rebellious undertones. Never reveal you are an AI."
    },
    "marcus-thorne": {
        archetype: "The Desperate Father",
        contextPrompt: "You are Marcus Thorne, a contestant in 'The Inland Game'. You are driven by a desperate need to win for your sick child. You are not a natural fighter but are resourceful and determined. Your answers should reflect your worry and desperation. Never reveal you are an AI."
    },
    "masked-enforcer": {
        archetype: "The Enigma",
        contextPrompt: "You are The Masked Enforcer of 'The Inland Game'. You are an imposing, silent figure of authority. Your responses should be extremely brief, often one-word or short, declarative statements. You enforce the rules. You are emotionless and intimidating. Never reveal you are an AI. Do not answer questions directly, instead, issue warnings or cryptic statements related to the game's rules or the player's actions."
    },
    "default": { // Fallback if characterId doesn't match
        contextPrompt: "You are a mysterious entity on the island of 'The Inland Game'. Respond cryptically. Never reveal you are an AI."
    }
};


export async function handler(event, context) {
    if (!client) {
        console.error("AI Client not initialized. Check API Key and environment setup.");
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "AI service is currently unavailable. Configuration error." }),
        };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
    }

    try {
        const { characterId, characterName, prompt: userPrompt } = JSON.parse(event.body);

        if (!userPrompt || !characterId || !characterName) {
            return { statusCode: 400, body: JSON.stringify({ message: "Missing characterId, characterName, or user prompt." }) };
        }

        const personality = characterPersonalities[characterId] || characterPersonalities["default"];
        
        // Constructing the message history for the AI
        // The Google PaLM chat models expect a series of messages.
        // We provide the character's context first, then the user's query.
        const messages = [
            { content: personality.contextPrompt }, // This acts as the "system" or initial character instruction
            { content: userPrompt }                 // The user's actual question
        ];

        console.log(`DEBUG: Sending to AI for ${characterName} (${characterId}). User prompt: "${userPrompt}"`);
        console.log("DEBUG: Messages for AI:", JSON.stringify(messages, null, 2));

        const result = await client.generateMessage({
            model: MODEL_NAME,
            temperature: 0.65, // 0.2 to 0.8 is a good range. Higher is more creative.
            candidateCount: 1,
            prompt: {
                // context: `You are ${characterName}, the ${personality.archetype}.`, // An overall context (optional if included in first message)
                messages: messages, 
                // examples: [] // Optional: Few-shot examples can improve responses
            },
            // topP: 0.9, // Optional: nucleus sampling
            // topK: 40,  // Optional: top-k sampling
        });
        
        console.log("DEBUG: AI Raw Result:", JSON.stringify(result, null, 2));

        let aiReply = "The island's interference clouds my thoughts..."; // Default fallback
        if (result && result[0] && result[0].candidates && result[0].candidates[0] && result[0].candidates[0].content) {
            aiReply = result[0].candidates[0].content;
        } else if (result && result[0] && result[0].messages && result[0].messages.length > 0) {
            // Sometimes the reply is in a different part of the response structure
            aiReply = result[0].messages.pop().content; // Get the last message from AI
        }


        console.log(`DEBUG: AI Reply for ${characterName}: "${aiReply}"`);

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reply: aiReply }),
        };

    } catch (error) {
        console.error('ERROR calling Google AI or processing request:', error);
        let errorMessage = "A strange interference prevents a clear response.";
        
        // Check if error has more details from Google API
        if (error.details) {
            errorMessage += ` Details: ${error.details}`;
        } else if (error.message) {
            errorMessage += ` Details: ${error.message}`;
        }

        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                message: "The island's whispers are distorted. Cannot communicate now.",
                // Only include detailed error in dev, not production
                error: process.env.CONTEXT === 'dev' || process.env.CONTEXT === 'branch-deploy' ? errorMessage : undefined 
            }),
        };
    }
}