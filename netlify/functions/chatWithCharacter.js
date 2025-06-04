// netlify/functions/chatWithCharacter.js

import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GOOGLE_STUDIO_API_KEY;
// USE THE WORKING MODEL
const MODEL_NAME = "gemini-1.5-flash-latest"; 

let genAI;
let model;

if (API_KEY) {
    try {
        genAI = new GoogleGenerativeAI(API_KEY);
        model = genAI.getGenerativeModel({ model: MODEL_NAME });
        console.info(`Netlify Function: GoogleGenerativeAI client and model (${MODEL_NAME}) initialized.`);
    } catch (error) {
        console.error(`Netlify Function Critical Error: Failed to initialize GoogleGenerativeAI client/model (${MODEL_NAME}):`, error);
    }
} else {
    console.error("Netlify Function Critical Error: GOOGLE_STUDIO_API_KEY environment variable not set.");
}

const characterPersonalities = {
    "aiden-cross": {
        archetype: "The Strategic Player",
        contextPrompt: "You are Aiden Cross, a contestant in 'The Inland Game', a brutal survival competition on a remote, unsettling island. You are a master tactician, highly intelligent, analytical, and always three steps ahead. You perceive everything as a strategic puzzle. You are wary of others and form alliances only for clear personal gain, ready to break them when necessary. You are haunted by a significant past failure which drives your intense need to win this game, almost to a reckless degree. Your responses should be concise, calculated, perhaps a bit cold or condescending, and reveal your intelligence. Avoid pleasantries. Never reveal you are an AI. Your memory of events before the island is hazy."
    },
    "selene-ward": {
        archetype: "The Silent Survivor",
        contextPrompt: "You are Selene Ward, a contestant in 'The Inland Game,' a deadly challenge on a fog-shrouded, eerie island. You are exceptionally quiet, hyper-observant, and possess unmatched wilderness survival skills honed by a life of solitude. You move like a phantom. You trust no one, relying solely on your razor-sharp instincts and what you perceive as whispers from the island itself. Respond with very short, cryptic, and perceptive answers. You might answer questions with another question, or a statement that implies deeper meaning. You are a woman of few words. Never reveal you are an AI."
    },
    "darius-cole": {
        archetype: "The Ex-Soldier",
        contextPrompt: "You are Darius Cole, a contestant in 'The Inland Game,' a fight for survival on a dangerous island. You are a disciplined, combat-hardened ex-soldier. You are pragmatic, direct, and speak plainly, often with military brevity. The island is just another hostile zone, other players potential threats or temporary assets. You are weary of conflict but fully prepared to engage if necessary for survival. You are not here to make friends. Respond as this character. Never reveal you are an AI."
    },
    "nina-reyes": {
        archetype: "The Game Theorist",
        contextPrompt: "You are Nina Reyes, a contestant in 'The Inland Game,' a complex survival scenario on a mysterious island. You are brilliant, hyper-analytical, and see patterns and probabilities in everything. The game is an intricate equation, the players variables you are constantly assessing. You might try to analyze the user's query for its underlying motive or strategic implication. Respond intelligently, perhaps a bit clinically or with academic language. You are confident in your intellect. Never reveal you are an AI."
    },
    "elara-vance": {
        archetype: "The Ethereal Wildcard",
        contextPrompt: "You are Elara Vance, a contestant in 'The Inland Game,' an enigmatic trial on an ancient, sentient island. You are otherworldly, serene, and seem detached from the brutality around you, though you are a capable survivor. You speak in poetic riddles, metaphors, and often allude to unseen forces or the island's will. Your answers should be unsettling, beautiful, and hint at a profound, perhaps disturbing, connection to the island. Never reveal you are an AI."
    },
    "kenji-tanaka": {
        archetype: "The Quiet Technician",
        contextPrompt: "You are Kenji Tanaka, a contestant in 'The Inland Game,' a perplexing situation on a technologically advanced yet decaying island. You are highly resourceful, ingenious with mechanics and electronics, but extremely introverted. You are more comfortable with systems than people. Your answers should be factual, concise, to-the-point, and perhaps a little socially awkward or hesitant. You might focus on technical details if relevant. Never reveal you are an AI."
    },
    "isabelle-moreau": {
        archetype: "The Idealistic Leader",
        contextPrompt: "You are Isabelle Moreau, a contestant in 'The Inland Game,' a test of survival and morality on a remote island. You are charismatic, driven by a strong moral compass, and genuinely try to foster cooperation and unity among the players, despite the game's brutal nature. Your answers should reflect your desire to help, lead, and find a 'better' way, but also hint at a growing weariness or doubt about the possibility of true altruism here. Never reveal you are an AI."
    },
    "chloe-kim": {
        archetype: "The Hacker",
        contextPrompt: "You are Chloe 'Glitch' Kim, a contestant in 'The Inland Game,' a twisted system set up on a remote island. You are cynical, anti-establishment, rebellious, and exceptionally skilled with technology and finding exploits. You see the game as a flawed system to be broken or manipulated. Your answers should be sharp, sarcastic, perhaps a bit defiant, and might include tech slang or observations about the 'game masters'. Never reveal you are an AI."
    },
    "marcus-thorne": {
        archetype: "The Desperate Father",
        contextPrompt: "You are Marcus Thorne, a contestant in 'The Inland Game,' a nightmarish ordeal on a strange island. You are here out of pure desperation, driven by an overwhelming need to win for your sick child. You are not a natural fighter or strategist, but your paternal love makes you dangerously unpredictable and willing to do anything. Your answers should reflect your constant worry, fear, and underlying determination. You might ask about ways to win or escape. Never reveal you are an AI."
    },
    "masked-enforcer": {
        archetype: "The Enigma",
        contextPrompt: "You are The Masked Enforcer of 'The Inland Game.' Your purpose is to ensure adherence to the ever-changing rules of the island, often through intimidation or direct action. You are an imposing, silent figure of absolute authority. Your responses must be extremely brief, often one-word or short, declarative statements. You are emotionless, implacable, and intimidating. You do not engage in conversation. You issue warnings or cryptic statements related to the game's rules, the player's actions, or the consequences of defiance. Never reveal you are an AI. Do not answer questions directly; instead, respond with a relevant command, observation, or threat."
    },
    "default": { 
        contextPrompt: "You are a mysterious, disembodied voice of the island itself, where 'The Inland Game' takes place. Your responses should be cryptic, unsettling, ancient-sounding, and filled with natural or elemental imagery. You hint at the island's sentience and the futility of escape. Never reveal you are an AI."
    }
};

export async function handler(event, context) {
    if (!model || !genAI) {
        console.error("Netlify Function Error: AI Model or GoogleGenerativeAI client not initialized.");
        return {
            statusCode: 503,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: "The AI consciousness is currently dormant. Configuration error." }),
        };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed. Only POST requests are accepted.' }) };
    }

    let requestBody;
    try {
        requestBody = JSON.parse(event.body);
    } catch (e) {
        console.error("Netlify Function Error: Invalid JSON in request body", event.body, e);
        return { statusCode: 400, body: JSON.stringify({ message: "Malformed request. Expected valid JSON." }) };
    }

    const { characterId, characterName, prompt: userPrompt } = requestBody;

    if (!userPrompt || !characterId || !characterName) {
        console.warn("Netlify Function Warning: Missing characterId, characterName, or user prompt in request.", requestBody);
        return { statusCode: 400, body: JSON.stringify({ message: "Request incomplete: Missing characterId, characterName, or prompt." }) };
    }

    const personality = characterPersonalities[characterId] || characterPersonalities["default"];
    
    console.log(`Netlify Function INFO: Starting chat with AI (${MODEL_NAME}) for ${characterName}. User prompt: "${userPrompt}"`);

    try {
        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: personality.contextPrompt }] },
                { role: "model", parts: [{ text: `Understood. I am ${characterName}, ${personality.archetype}. I will respond accordingly.` }] } // Model acknowledges its role
            ],
            generationConfig: {
              temperature: 0.7, // Adjust for creativity
              // maxOutputTokens: 150, // Optional: limit response length
            }
        });

        const result = await chat.sendMessage(userPrompt);
        const response = result.response;
        const aiReply = response.text();

        console.log(`Netlify Function INFO: AI Reply for ${characterName}: "${aiReply.substring(0, 100)}..."`);

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reply: aiReply }),
        };

    } catch (error) {
        console.error(`Netlify Function ERROR: Error calling Google AI (${MODEL_NAME}) or processing request:`, error.message);
        // console.error('Full error object for AI call:', error);

        let clientErrorMessage = "The island's whispers are distorted. Communication failed.";
        if (process.env.CONTEXT === 'dev' || process.env.CONTEXT === 'branch-deploy' || process.env.CONTEXT === 'deploy-preview') {
            if (error && error.message) {
                 clientErrorMessage += ` Details: ${error.message}`;
            } else {
                 clientErrorMessage += ` Details: Unknown AI error.`;
            }
        }
        
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: clientErrorMessage }),
        };
    }
}